import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import { damp } from 'maath/easing';
import { getModule } from '../data/modules';
import { getVehicle } from '../data/vehicles';
import { vanMetrics } from '../utils/metrics';
import type { PlacedModule } from '../utils/layout';
import { useStore, useVehicleId } from '../store';
import { ModuleVisual } from './ModuleMeshes';

const ACCENT = '#f5b301';
const INVALID = '#ff3b3b';

export function PlacedModuleMesh({ m }: { m: PlacedModule }) {
  const def = getModule(m.defId);
  const vehicle = getVehicle(useVehicleId());
  const mt = useMemo(() => vanMetrics(vehicle), [vehicle]);
  const selected = useStore((s) => s.selectedUid === m.uid);
  const dragging = useStore((s) => s.draggingUid === m.uid);
  const anyDragging = useStore((s) => s.draggingUid !== null);
  const cameraMode = useStore((s) => s.cameraMode);
  const screen = useStore((s) => s.screen);
  const roofVisible = useStore((s) => s.view.roof);
  const wallRVisible = useStore((s) => s.view.wallR);
  const setSelected = useStore((s) => s.setSelected);
  const setDragging = useStore((s) => s.setDragging);
  const updateModule = useStore((s) => s.updateModule);

  const editable = screen === 'configurator' && cameraMode === 'orbit';
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && editable && !anyDragging, dragging ? 'grabbing' : 'grab');

  const group = useRef<THREE.Group>(null);
  const outline = useRef<THREE.Mesh>(null);
  const outlineMat = useRef<THREE.MeshBasicMaterial>(null);
  const appear = useRef(0);
  const invalid = useRef(false);
  const lastValid = useRef<PlacedModule>(m);
  const grab = useRef(new THREE.Vector3());
  const hit = useRef(new THREE.Vector3());
  const { raycaster, pointer, camera } = useThree();

  const side = m.side ?? 'R';
  const { pos, rotY } = useMemo(() => {
    switch (def.mount) {
      case 'floor':
        return { pos: new THREE.Vector3(m.x, mt.cargo.y0, m.z), rotY: -m.rot * (Math.PI / 2) };
      case 'wall':
        if (side === 'R') return { pos: new THREE.Vector3(m.x, m.y, mt.cargo.z1), rotY: Math.PI };
        if (side === 'L') return { pos: new THREE.Vector3(m.x, m.y, mt.cargo.z0), rotY: 0 };
        return { pos: new THREE.Vector3(mt.xRear + 0.05, m.y, m.z), rotY: Math.PI / 2 };
      case 'roof':
        return { pos: new THREE.Vector3(m.x, vehicle.height, m.z), rotY: 0 };
      default:
        return { pos: new THREE.Vector3(0, 0, 0), rotY: 0 };
    }
  }, [def.mount, m.x, m.y, m.z, m.rot, side, mt, vehicle.height]);

  const plane = useMemo(() => {
    if (def.mount === 'floor') return new THREE.Plane(new THREE.Vector3(0, 1, 0), -mt.cargo.y0);
    if (def.mount === 'roof') return new THREE.Plane(new THREE.Vector3(0, 1, 0), -vehicle.height);
    if (def.mount === 'wall') {
      if (side === 'rear') return new THREE.Plane(new THREE.Vector3(1, 0, 0), -(mt.xRear + 0.05));
      return new THREE.Plane(new THREE.Vector3(0, 0, 1), -(side === 'R' ? mt.cargo.z1 : mt.cargo.z0));
    }
    return null;
  }, [def.mount, side, mt, vehicle.height]);

  // Seçim kutusu ölçüleri (yerel)
  const box = useMemo(() => {
    const [w, h, d] = def.size;
    if (def.mount === 'wall') {
      const hole = !!def.hole;
      return { size: [w + 0.03, h + 0.03, hole ? mt.wallT + 0.06 : d + 0.03] as [number, number, number], center: [0, 0, hole ? -mt.wallT / 2 : d / 2] as [number, number, number] };
    }
    if (def.mount === 'exterior') return null;
    return { size: [w + 0.03, h + 0.03, d + 0.03] as [number, number, number], center: [0, h / 2, 0] as [number, number, number] };
  }, [def, mt.wallT]);

  useEffect(() => {
    if (!dragging) lastValid.current = m;
  }, [m, dragging]);

  useFrame((state, dt) => {
    // belirme animasyonu
    if (appear.current < 0.999) {
      damp(appear, 'current', 1, 0.28, dt);
      const a = appear.current;
      if (group.current) {
        group.current.scale.setScalar(0.7 + 0.3 * a);
        group.current.position.y = pos.y + (def.mount === 'wall' ? 0 : (1 - a) * 0.45);
      }
    } else if (group.current && group.current.scale.x !== 1) {
      group.current.scale.setScalar(1);
      group.current.position.y = pos.y;
    }
    // seçim çerçevesi nabız
    if (outlineMat.current) {
      const pulse = 0.35 + Math.sin(state.clock.elapsedTime * 4) * 0.12;
      outlineMat.current.opacity = invalid.current ? 0.45 : selected ? pulse : 0.2;
      outlineMat.current.color.set(invalid.current ? INVALID : ACCENT);
    }
    // sürükleme
    if (dragging && plane) {
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(plane, hit.current)) {
        const t = hit.current.clone().sub(grab.current);
        let patch: Partial<PlacedModule>;
        if (def.mount === 'floor' || def.mount === 'roof') patch = { x: t.x, z: t.z };
        else if (side === 'rear') patch = { z: t.z, y: t.y };
        else patch = { x: t.x, y: t.y };
        const ok = updateModule(m.uid, patch);
        invalid.current = !ok;
        if (ok) lastValid.current = { ...useStore.getState().modules.find((x) => x.uid === m.uid)! };
      }
    }
  });

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!editable) return;
    e.stopPropagation();
    setSelected(m.uid);
    if (def.mount === 'exterior' || !plane) return;
    grab.current.copy(e.point).sub(pos);
    if (def.mount === 'floor' || def.mount === 'roof') grab.current.y = 0;
    else if (side === 'rear') grab.current.x = 0;
    else grab.current.z = 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    invalid.current = false;
    setDragging(m.uid);
  };
  const endDrag = (e?: ThreeEvent<PointerEvent>) => {
    if (!dragging) return;
    if (e) (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (invalid.current) {
      const lv = lastValid.current;
      updateModule(m.uid, { x: lv.x, y: lv.y, z: lv.z }, { magnet: false });
      invalid.current = false;
    }
    setDragging(null);
  };
  useEffect(() => {
    if (!dragging) return;
    const up = () => endDrag();
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  const walk = cameraMode === 'walk';
  if (screen === 'configurator' && !walk) {
    if (def.mount === 'roof' && !roofVisible) return null;
    if (def.mount === 'wall' && side === 'R' && !wallRVisible) return null;
  }

  const [w, , d] = def.size;
  const showFootprint = def.mount === 'floor' && (selected || dragging);

  return (
    <group
      ref={group}
      position={pos}
      rotation={[0, rotY, 0]}
      onPointerDown={onPointerDown}
      onPointerUp={endDrag}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <ModuleVisual def={def} m={m} color={m.color} mt={mt} vehicle={vehicle} />
      {box && (selected || dragging || (hovered && editable)) && (
        <mesh ref={outline} position={box.center} raycast={() => null}>
          <boxGeometry args={box.size} />
          <meshBasicMaterial ref={outlineMat} color={ACCENT} transparent opacity={0.25} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
      {showFootprint && (
        <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
          <planeGeometry args={[w + 0.12, d + 0.12]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.22} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export function PlacedModules() {
  const modules = useStore((s) => s.modules);
  return (
    <>
      {modules.map((m) => (
        <PlacedModuleMesh key={m.uid} m={m} />
      ))}
    </>
  );
}

import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { damp3 } from 'maath/easing';
import { getModule } from '../data/modules';
import { getVehicle } from '../data/vehicles';
import { vanMetrics, type VanMetrics } from '../utils/metrics';
import { floorRect } from '../utils/layout';
import { useStore, useVehicleId, type FlyPreset } from '../store';
import { doorState, walkInput } from './shared';

interface Seg { ax: number; az: number; bx: number; bz: number }

function presetPose(preset: FlyPreset, mt: VanMetrics, height: number): { pos: THREE.Vector3; target: THREE.Vector3 } {
  const c = mt.center;
  const cx = (mt.cargo.x0 + mt.cargo.x1) / 2;
  switch (preset) {
    case 'hero':
      return { pos: new THREE.Vector3(c.x + 4.8, 2.1, 6.4), target: new THREE.Vector3(c.x, 1.0, 0) };
    case 'showroom':
      return { pos: new THREE.Vector3(c.x + 3.2, 2.0, 7.6), target: new THREE.Vector3(c.x, 1.05, 0) };
    case 'side':
      return { pos: new THREE.Vector3(c.x + 1.4, 2.6, 8.4), target: new THREE.Vector3(c.x, 1.05, 0) };
    case 'rear':
      return { pos: new THREE.Vector3(mt.xRear - 6.2, 2.2, 2.4), target: new THREE.Vector3(mt.xRear + 0.8, 1.1, 0) };
    case 'front':
      return { pos: new THREE.Vector3(mt.xFront + 5.6, 1.9, 3.2), target: new THREE.Vector3(mt.xFront - 1.2, 1.05, 0) };
    case 'top':
      return { pos: new THREE.Vector3(cx + 0.01, height + 7.5, 0.02), target: new THREE.Vector3(cx, 0.6, 0) };
    case 'inside':
      return { pos: new THREE.Vector3(cx + 0.4, mt.cargo.y0 + 1.7, mt.cargo.z1 + 3.4), target: new THREE.Vector3(cx, mt.cargo.y0 + 0.75, 0) };
    default:
      return { pos: new THREE.Vector3(c.x + 4, 2, 7), target: c.clone() };
  }
}

function resolveCircle(p: THREE.Vector2, r: number, segs: Seg[]) {
  const a = new THREE.Vector2(), b = new THREE.Vector2(), ab = new THREE.Vector2(), ap = new THREE.Vector2(), closest = new THREE.Vector2();
  for (let iter = 0; iter < 3; iter++) {
    for (const s of segs) {
      a.set(s.ax, s.az);
      b.set(s.bx, s.bz);
      ab.subVectors(b, a);
      ap.subVectors(p, a);
      const len2 = ab.lengthSq();
      const t = len2 > 0 ? THREE.MathUtils.clamp(ap.dot(ab) / len2, 0, 1) : 0;
      closest.copy(a).addScaledVector(ab, t);
      const dx = p.x - closest.x;
      const dz = p.y - closest.y;
      const d = Math.hypot(dx, dz);
      if (d < r && d > 1e-6) {
        p.x += (dx / d) * (r - d);
        p.y += (dz / d) * (r - d);
      }
    }
  }
}

export function CameraRig() {
  const { camera, gl, size } = useThree();
  const mode = useStore((s) => s.cameraMode);
  const fly = useStore((s) => s.fly);
  const dragging = useStore((s) => s.draggingUid !== null);
  const screen = useStore((s) => s.screen);
  const vehicleId = useVehicleId();
  const vehicle = getVehicle(vehicleId);
  const mt = useMemo(() => vanMetrics(vehicle), [vehicle]);
  const controls = useRef<OrbitControlsImpl>(null);
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3; active: boolean }>({
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    active: false,
  });

  useEffect(() => {
    if (!fly) return;
    const p = presetPose(fly.preset, mt, vehicle.height);
    // Dar (dikey) ekranlarda aracın tamamı görünsün diye kamerayı uzaklaştır
    const aspect = size.width / size.height;
    if (aspect < 1.1 && fly.preset !== 'top') {
      const k = Math.min(2.2, 1.1 / aspect);
      p.pos.sub(p.target).multiplyScalar(k).add(p.target);
    }
    goal.current = { ...p, active: true };
  }, [fly, mt, vehicle.height, size.width, size.height]);

  // ---------- Yürüyüş modu ----------
  const walk = useRef({
    pos: new THREE.Vector2(),
    yaw: Math.PI / 2,
    pitch: 0,
    eyeY: 1.6,
    keys: new Set<string>(),
    bob: 0,
    down: false,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    if (mode !== 'walk') return;
    const w = walk.current;
    w.pos.set((mt.sd.x0 + mt.sd.x1) / 2 - 0.2, 0.15);
    w.yaw = Math.PI / 2;
    w.pitch = -0.05;
    w.eyeY = mt.cargo.y0 + 1.5;
    camera.rotation.order = 'YXZ';

    const el = gl.domElement;
    const kd = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      w.keys.add(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') walkInput.run = true;
    };
    const ku = (e: KeyboardEvent) => {
      w.keys.delete(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') walkInput.run = false;
    };
    const pd = (e: PointerEvent) => {
      w.down = true;
      w.lastX = e.clientX;
      w.lastY = e.clientY;
    };
    const pm = (e: PointerEvent) => {
      if (!w.down) return;
      walkInput.look.dx += e.clientX - w.lastX;
      walkInput.look.dy += e.clientY - w.lastY;
      w.lastX = e.clientX;
      w.lastY = e.clientY;
    };
    const pu = () => {
      w.down = false;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    el.addEventListener('pointerdown', pd);
    window.addEventListener('pointermove', pm);
    window.addEventListener('pointerup', pu);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      el.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('pointerup', pu);
      w.keys.clear();
      walkInput.move.x = walkInput.move.y = 0;
    };
  }, [mode, mt, gl, camera]);

  const segsRef = useRef<Seg[]>([]);
  const buildSegs = () => {
    const segs: Seg[] = [];
    const W = vehicle.width;
    const hz = W / 2 - 0.04;
    // sol duvar
    segs.push({ ax: mt.xRear, az: -hz, bx: mt.xFront, bz: -hz });
    // sağ duvar (sürgülü kapı açıksa boşluk)
    if (doorState.slide > 0.75) {
      segs.push({ ax: mt.xRear, az: hz, bx: mt.sd.x0 + 0.05, bz: hz });
      segs.push({ ax: mt.sd.x1 - 0.05, az: hz, bx: mt.xFront, bz: hz });
    } else segs.push({ ax: mt.xRear, az: hz, bx: mt.xFront, bz: hz });
    // arka (kapılar açıksa boşluk)
    if (doorState.rear > 0.75) {
      segs.push({ ax: mt.xRear, az: -hz, bx: mt.xRear, bz: mt.rd.z0 + 0.05 });
      segs.push({ ax: mt.xRear, az: mt.rd.z1 - 0.05, bx: mt.xRear, bz: hz });
    } else segs.push({ ax: mt.xRear, az: -hz, bx: mt.xRear, bz: hz });
    // ön / torpido
    segs.push({ ax: mt.xFront, az: -hz, bx: mt.xFront, bz: hz });
    segs.push({ ax: mt.dashX - 0.6, az: -hz, bx: mt.dashX - 0.6, bz: hz });
    // koltuklar
    for (const z of [-0.56, 0.56]) {
      const x0 = mt.cabSeatX - 0.3, x1 = mt.cabSeatX + 0.3, z0 = z - 0.28, z1 = z + 0.28;
      segs.push({ ax: x0, az: z0, bx: x1, bz: z0 }, { ax: x1, az: z0, bx: x1, bz: z1 }, { ax: x1, az: z1, bx: x0, bz: z1 }, { ax: x0, az: z1, bx: x0, bz: z0 });
    }
    // modüller
    for (const m of useStore.getState().modules) {
      const def = getModule(m.defId);
      if (def.mount !== 'floor' || def.size[1] < 0.3) continue;
      const r = floorRect(m, def);
      segs.push(
        { ax: r.a0, az: r.b0, bx: r.a1, bz: r.b0 },
        { ax: r.a1, az: r.b0, bx: r.a1, bz: r.b1 },
        { ax: r.a1, az: r.b1, bx: r.a0, bz: r.b1 },
        { ax: r.a0, az: r.b1, bx: r.a0, bz: r.b0 },
      );
    }
    return segs;
  };

  const fwd = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector2(), []);

  useFrame((state, dt) => {
    const c = controls.current;
    if (mode === 'walk') {
      const w = walk.current;
      // bakış
      w.yaw -= walkInput.look.dx * 0.0042;
      w.pitch = THREE.MathUtils.clamp(w.pitch - walkInput.look.dy * 0.0042, -1.25, 1.25);
      walkInput.look.dx = 0;
      walkInput.look.dy = 0;
      // hareket
      let mx = walkInput.move.x;
      let my = walkInput.move.y;
      if (w.keys.has('KeyW') || w.keys.has('ArrowUp')) my += 1;
      if (w.keys.has('KeyS') || w.keys.has('ArrowDown')) my -= 1;
      if (w.keys.has('KeyD') || w.keys.has('ArrowRight')) mx += 1;
      if (w.keys.has('KeyA') || w.keys.has('ArrowLeft')) mx -= 1;
      const len = Math.hypot(mx, my);
      if (len > 1) {
        mx /= len;
        my /= len;
      }
      const speed = walkInput.run ? 3.2 : 1.7;
      const fx = -Math.sin(w.yaw), fz = -Math.cos(w.yaw);
      const rx = Math.cos(w.yaw), rz = -Math.sin(w.yaw);
      tmp.set(w.pos.x + (fx * my + rx * mx) * speed * dt, w.pos.y + (fz * my + rz * mx) * speed * dt);
      tmp.x = THREE.MathUtils.clamp(tmp.x, -25, 25);
      tmp.y = THREE.MathUtils.clamp(tmp.y, -25, 25);
      if (state.clock.elapsedTime % 0.25 < dt || segsRef.current.length === 0) segsRef.current = buildSegs();
      resolveCircle(tmp, 0.28, segsRef.current);
      w.pos.copy(tmp);
      // göz yüksekliği
      const inside = w.pos.x > mt.xRear - 0.05 && w.pos.x < mt.xFront && Math.abs(w.pos.y) < vehicle.width / 2;
      const inCab = inside && w.pos.x > mt.cargo.x1;
      const floor = inside ? (inCab ? mt.cargo.y0 - 0.12 : mt.cargo.y0) : 0;
      const eye = floor + (inside && !inCab ? Math.min(1.6, mt.cargo.y1 - mt.cargo.y0 - 0.22) : 1.62);
      w.eyeY = THREE.MathUtils.damp(w.eyeY, eye, 6, dt);
      const moving = len > 0.05;
      w.bob = THREE.MathUtils.damp(w.bob, moving ? 1 : 0, 6, dt);
      const bob = Math.sin(state.clock.elapsedTime * 9) * 0.014 * w.bob;
      camera.position.set(w.pos.x, w.eyeY + bob, w.pos.y);
      camera.rotation.set(w.pitch, w.yaw, 0, 'YXZ');
      return;
    }
    if (!c) return;
    const g = goal.current;
    if (g.active) {
      damp3(camera.position, g.pos, 0.42, dt);
      damp3(c.target, g.target, 0.42, dt);
      if (camera.position.distanceTo(g.pos) < 0.01 && c.target.distanceTo(g.target) < 0.01) g.active = false;
    }
    c.update();
    fwd.copy(c.target);
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={mode === 'orbit' && !dragging}
      enableDamping
      dampingFactor={0.08}
      autoRotate={screen !== 'configurator'}
      autoRotateSpeed={screen === 'landing' ? 0.7 : 0.5}
      minDistance={1.0}
      maxDistance={18}
      maxPolarAngle={Math.PI / 2 - 0.03}
      enablePan={screen === 'configurator'}
      onStart={() => {
        goal.current.active = false;
      }}
    />
  );
}

import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { damp } from 'maath/easing';
import { useShallow } from 'zustand/react/shallow';
import { getVehicle } from '../data/vehicles';
import { getModule } from '../data/modules';
import { vanMetrics } from '../utils/metrics';
import { useStore, useVehicleId } from '../store';
import { bandPolygon, buildProfile, extrude, makeShape, roundedRectPts, splitByNormal, type Pt } from './vanGeometry';
import { darkPlastic, fabric, ledStrip, mat, steel } from './materials';
import { woodTexture } from './textures';
import { doorState } from './shared';

interface HoleSet {
  L: Pt[][];
  R: Pt[][];
  rearDoor: Pt[][]; // kapı lokal koordinatları (x: menteşeden, y: eşikten)
  roof: Pt[][];
  slider: Pt[][];
  sliderRect?: { cx: number; cy: number; w: number; h: number };
  rearRect?: { cx: number; cy: number; w: number; h: number };
}

function useHoles(): { holes: HoleSet; key: string } {
  const modules = useStore((s) => s.modules);
  const vehicleId = useVehicleId();
  return useMemo(() => {
    const v = getVehicle(vehicleId);
    const mt = vanMetrics(v);
    const holes: HoleSet = { L: [], R: [], rearDoor: [], roof: [], slider: [] };
    const keys: string[] = [];
    for (const m of modules) {
      const def = getModule(m.defId);
      if (!def.hole) continue;
      const [w, h, d] = def.size;
      if (def.mount === 'roof') {
        holes.roof.push(roundedRectPts(m.x, -m.z, w - 0.02, d - 0.02, 0.03));
        keys.push(`roof:${m.x.toFixed(3)}:${m.z.toFixed(3)}:${w}:${d}`);
        continue;
      }
      if (def.mount !== 'wall') continue;
      const side = m.side ?? 'R';
      if (def.kind === 'window-rear') {
        const dw = v.rearDoor.width / 2;
        const hw = Math.min(w / 2 - 0.08, dw - 0.16);
        holes.rearDoor.push(roundedRectPts(dw / 2, m.y - mt.rd.y0, hw, h, 0.04));
        holes.rearRect = { cx: dw / 2, cy: m.y - mt.rd.y0, w: hw, h };
        keys.push(`rear:${m.y.toFixed(3)}:${w}:${h}`);
        continue;
      }
      if (def.kind === 'window-slider') {
        holes.slider.push(roundedRectPts(m.x, m.y, w, h, 0.04));
        holes.sliderRect = { cx: m.x, cy: m.y, w, h };
        keys.push(`slider:${m.x.toFixed(3)}:${m.y.toFixed(3)}:${w}:${h}`);
        continue;
      }
      const pts = roundedRectPts(m.x, m.y, w, h, 0.04);
      if (side === 'L') holes.L.push(pts);
      else if (side === 'R') holes.R.push(pts);
      keys.push(`${side}:${m.x.toFixed(3)}:${m.y.toFixed(3)}:${w}:${h}`);
    }
    return { holes, key: `${vehicleId}|${keys.sort().join(',')}` };
  }, [modules, vehicleId]);
}

function useVanGeometry(vehicleId: string, holes: HoleSet, key: string) {
  const geo = useMemo(() => {
    const v = getVehicle(vehicleId);
    const mt = vanMetrics(v);
    const p = buildProfile(v, mt);
    const W = v.width;
    const skin = mt.skin;

    const sideL = extrude(makeShape(p.outline, [p.cabWindow, ...holes.L]), skin, 0.015);
    const sideR = extrude(makeShape(p.outline, [p.cabWindow, roundedRectPts((mt.sd.x0 + mt.sd.x1) / 2, (mt.sd.y0 + mt.sd.y1) / 2, mt.sd.x1 - mt.sd.x0, mt.sd.y1 - mt.sd.y0, 0.05), ...holes.R]), skin, 0.015);

    const cargoRect = roundedRectPts((mt.cargo.x0 + mt.cargo.x1) / 2, (mt.cargo.y0 + mt.cargo.y1) / 2, mt.cargo.x1 - mt.cargo.x0, mt.cargo.y1 - mt.cargo.y0, 0.02);
    const liningL = extrude(makeShape(cargoRect, holes.L), 0.02);
    const liningR = extrude(
      makeShape(cargoRect, [roundedRectPts((mt.sd.x0 + mt.sd.x1) / 2, (mt.sd.y0 + mt.sd.y1) / 2 + 0.01, mt.sd.x1 - mt.sd.x0 + 0.02, mt.sd.y1 - mt.sd.y0 + 0.02, 0.05), ...holes.R]),
      0.02,
    );

    const bandDepth = W - 2 * skin;
    const frontBandRaw = extrude(makeShape(bandPolygon(p.frontBand, skin, -1)), bandDepth, 0, 8);
    const d = p.wsTop.clone().sub(p.wsBase).normalize();
    const wsNormal = new THREE.Vector3(d.y, -d.x, 0);
    const frontBand = splitByNormal(frontBandRaw, wsNormal);
    frontBandRaw.dispose();
    const rearBand = extrude(makeShape(bandPolygon(p.rearBand, skin, 1)), bandDepth, 0, 8);

    const roofShape = makeShape(roundedRectPts((mt.roof.x0 + mt.roof.x1) / 2, 0, mt.roof.x1 - mt.roof.x0, mt.roof.z1 - mt.roof.z0, 0.02), holes.roof);
    const roof = extrude(roofShape, mt.roofT);
    const ceilShape = makeShape(roundedRectPts((mt.cargo.x0 + mt.cargo.x1) / 2, 0, mt.cargo.x1 - mt.cargo.x0, mt.cargo.z1 - mt.cargo.z0, 0.02), holes.roof);
    const ceiling = extrude(ceilShape, 0.015);

    const dw = v.rearDoor.width / 2 - 0.008;
    const dh = mt.rd.y1 - mt.rd.y0 - 0.01;
    const doorShape = makeShape(roundedRectPts(dw / 2, dh / 2, dw, dh, 0.03), holes.rearDoor);
    const rearDoor = extrude(doorShape, 0.05);

    const sdw = mt.sd.x1 - mt.sd.x0 - 0.012;
    const sdh = mt.sd.y1 - mt.sd.y0 - 0.012;
    const sliderShape = makeShape(roundedRectPts((mt.sd.x0 + mt.sd.x1) / 2, (mt.sd.y0 + mt.sd.y1) / 2, sdw, sdh, 0.04), holes.slider);
    const slider = extrude(sliderShape, 0.045);

    const cabGlass = new THREE.ShapeGeometry(makeShape(p.cabWindow));
    const rearGlass = holes.rearDoor.length ? new THREE.ShapeGeometry(makeShape(holes.rearDoor[0])) : null;
    const sliderGlass = holes.slider.length ? new THREE.ShapeGeometry(makeShape(holes.slider[0])) : null;

    return { v, mt, p, sideL, sideR, liningL, liningR, frontBand, rearBand, roof, ceiling, rearDoor, slider, cabGlass, rearGlass, sliderGlass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    return () => {
      for (const g of Object.values(geo)) {
        if (g instanceof THREE.BufferGeometry) g.dispose();
      }
    };
  }, [geo]);
  return geo;
}

function usePaint(color: string, xray: boolean) {
  const paint = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
    [],
  );
  const trim = useMemo(() => new THREE.MeshStandardMaterial({ color: '#23272c', roughness: 0.65, metalness: 0.15 }), []);
  useEffect(() => {
    paint.color.set(color);
  }, [color, paint]);
  useFrame((_, dt) => {
    const target = xray ? 0.22 : 1;
    if (Math.abs(paint.opacity - target) > 0.002) {
      damp(paint, 'opacity', target, 0.18, dt);
      paint.transparent = paint.opacity < 0.999;
      paint.depthWrite = paint.opacity > 0.6;
      trim.opacity = paint.opacity;
      trim.transparent = paint.transparent;
      trim.depthWrite = paint.depthWrite;
      paint.needsUpdate = false;
    }
  });
  return { paint, trim };
}

const glassExt = new THREE.MeshPhysicalMaterial({
  color: '#7fa6c4',
  roughness: 0.04,
  metalness: 0.25,
  transparent: true,
  opacity: 0.42,
  side: THREE.DoubleSide,
});
const frameMat = new THREE.MeshStandardMaterial({ color: '#1a1c1f', roughness: 0.5 });
const windshieldMat = new THREE.MeshPhysicalMaterial({
  color: '#8fb4cc',
  roughness: 0.04,
  metalness: 0.5,
  transparent: true,
  opacity: 0.38,
  side: THREE.DoubleSide,
});
const liningMat = new THREE.MeshStandardMaterial({ color: '#ebe8e1', roughness: 0.85 });
const ceilingMat = new THREE.MeshStandardMaterial({ color: '#f3f1ec', roughness: 0.9 });
const tireMat = new THREE.MeshStandardMaterial({ color: '#141516', roughness: 0.95 });
const rimMat = new THREE.MeshStandardMaterial({ color: '#d7dbe0', roughness: 0.35, metalness: 0.6 });
const headlightMat = new THREE.MeshStandardMaterial({ color: '#e8f4ff', emissive: '#cfe8ff', emissiveIntensity: 0.6, roughness: 0.15 });
const taillightMat = new THREE.MeshStandardMaterial({ color: '#8d1218', emissive: '#ff3030', emissiveIntensity: 0.45, roughness: 0.3 });
const plateMat = new THREE.MeshStandardMaterial({ color: '#f5f5f5', roughness: 0.4 });
const seatMat = new THREE.MeshStandardMaterial({ color: '#2b2f36', roughness: 0.95 });
const dashMat = new THREE.MeshStandardMaterial({ color: '#1e2226', roughness: 0.8 });

/** Kapı camı için dış siyah çerçeve (yerel XY düzleminde) */
function WindowFrame({ r, z }: { r: { cx: number; cy: number; w: number; h: number }; z: number }) {
  const t = 0.045;
  return (
    <group position={[r.cx, r.cy, z]}>
      <mesh material={frameMat} position={[0, r.h / 2 + t / 2 - 0.01, 0]}><boxGeometry args={[r.w + 2 * t, t, 0.01]} /></mesh>
      <mesh material={frameMat} position={[0, -r.h / 2 - t / 2 + 0.01, 0]}><boxGeometry args={[r.w + 2 * t, t, 0.01]} /></mesh>
      <mesh material={frameMat} position={[r.w / 2 + t / 2 - 0.01, 0, 0]}><boxGeometry args={[t, r.h, 0.01]} /></mesh>
      <mesh material={frameMat} position={[-r.w / 2 - t / 2 + 0.01, 0, 0]}><boxGeometry args={[t, r.h, 0.01]} /></mesh>
    </group>
  );
}

export function Van() {
  const vehicleId = useVehicleId();
  const { holes, key } = useHoles();
  const g = useVanGeometry(vehicleId, holes, key);
  const { v, mt, p } = g;
  const { paintHex, view, cameraMode, screen } = useStore(
    useShallow((s) => ({ paintHex: s.paint, view: s.view, cameraMode: s.cameraMode, screen: s.screen })),
  );
  const { paint, trim } = usePaint(paintHex, view.xray && cameraMode !== 'walk');
  const showRoof = view.roof || cameraMode === 'walk' || screen !== 'configurator';
  const showWallR = view.wallR || cameraMode === 'walk' || screen !== 'configurator';

  const W = v.width;
  const skin = mt.skin;
  const H = v.height;

  // Kapı animasyonları
  const sliderRef = useRef<THREE.Group>(null);
  const rearR = useRef<THREE.Group>(null);
  const rearL = useRef<THREE.Group>(null);
  const anim = useRef({ slide: 0, rear: 0 });
  const landing = screen === 'landing';
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const slideTarget = landing ? (Math.sin(t * 0.5) > 0.2 ? 1 : 0) : view.doorSlide ? 1 : 0;
    const rearTarget = landing ? (Math.sin(t * 0.5 + 2) > 0.4 ? 1 : 0) : view.doorRear ? 1 : 0;
    damp(anim.current, 'slide', slideTarget, 0.5, dt);
    damp(anim.current, 'rear', rearTarget, 0.55, dt);
    const s = anim.current.slide;
    doorState.slide = s;
    doorState.rear = anim.current.rear;
    if (sliderRef.current) {
      sliderRef.current.position.x = -s * (v.slidingDoor.width * 0.86);
      sliderRef.current.position.z = W / 2 - 0.04 + Math.sin(Math.min(1, s * 3) * Math.PI * 0.5) * 0.11;
    }
    const r = anim.current.rear * 2.6;
    if (rearR.current) rearR.current.rotation.y = Math.PI / 2 + r;
    if (rearL.current) rearL.current.rotation.y = -Math.PI / 2 - r;
  });

  // Araç değişince "belirme" animasyonu
  const root = useRef<THREE.Group>(null);
  const appear = useRef(0);
  useEffect(() => {
    appear.current = 0;
  }, [vehicleId]);
  useFrame((_, dt) => {
    damp(appear, 'current', 1, 0.35, dt);
    if (root.current) {
      const a = appear.current;
      root.current.scale.setScalar(0.85 + 0.15 * a);
      root.current.position.y = (1 - a) * 0.8;
    }
  });

  const wheelZ = W / 2 - 0.1 - v.wheel.width / 2;
  const wheels: [number, number][] = [
    [mt.rearAxleX, wheelZ],
    [mt.rearAxleX, -wheelZ],
    [mt.frontAxleX, wheelZ],
    [mt.frontAxleX, -wheelZ],
  ];
  const wheelGeo = useMemo(() => new THREE.CylinderGeometry(v.wheel.radius, v.wheel.radius, v.wheel.width, 32), [v]);
  const rimGeo = useMemo(() => new THREE.CylinderGeometry(v.wheel.radius * 0.62, v.wheel.radius * 0.62, v.wheel.width + 0.02, 24), [v]);
  const archGeo = useMemo(() => new THREE.RingGeometry(v.wheel.radius + 0.04, v.wheel.radius + 0.14, 28, 1, 0, Math.PI), [v]);

  const floorTex = useMemo(() => {
    const t = woodTexture('#ffffff');
    return t;
  }, []);
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c8a075', roughness: 0.55, map: floorTex }), [floorTex]);

  const nightLight = view.night ? 1 : 0;
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    const target = cameraMode === 'walk' ? 1.6 + nightLight * 5 : 1.2 + nightLight * 7;
    if (lightRef1.current) damp(lightRef1.current, 'intensity', target, 0.4, dt);
    if (lightRef2.current) damp(lightRef2.current, 'intensity', target, 0.4, dt);
  });

  const yHood = v.profile.hoodHeight;
  const sill = v.profile.sill;
  const noseFaceY0 = sill + 0.14;
  const noseFaceY1 = yHood - v.profile.noseRadius;

  return (
    <group ref={root}>
      {/* ---------- Kaporta ---------- */}
      <mesh geometry={g.sideL} material={paint} position={[0, 0, -W / 2 + 0.015]} castShadow receiveShadow />
      {showWallR && <mesh geometry={g.sideR} material={paint} position={[0, 0, W / 2 - skin - 0.015]} castShadow receiveShadow />}
      <mesh geometry={g.frontBand} material={[paint, windshieldMat]} position={[0, 0, -(W / 2 - skin)]} castShadow receiveShadow />
      <mesh geometry={g.rearBand} material={paint} position={[0, 0, -(W / 2 - skin)]} castShadow receiveShadow />
      {showRoof && (
        <mesh geometry={g.roof} material={paint} rotation={[-Math.PI / 2, 0, 0]} position={[0, H - mt.roofT, 0]} castShadow receiveShadow />
      )}
      {/* Arka direkler */}
      {[1, -1].map((s) => (
        <mesh key={s} material={paint} position={[mt.xRear + 0.035, (mt.cargo.y0 + mt.rd.y1) / 2, s * ((mt.rd.z1 + W / 2 - skin) / 2)]} castShadow>
          <boxGeometry args={[0.07, mt.rd.y1 - mt.cargo.y0, W / 2 - skin - mt.rd.z1]} />
        </mesh>
      ))}
      {/* Cam: kabin yan camları */}
      <mesh geometry={g.cabGlass} material={glassExt} position={[0, 0, W / 2 - skin / 2]} />
      <mesh geometry={g.cabGlass} material={glassExt} position={[0, 0, -W / 2 + skin / 2]} />

      {/* ---------- İç kaplama ---------- */}
      <mesh geometry={g.liningL} material={liningMat} position={[0, 0, mt.cargo.z0 - 0.02]} receiveShadow />
      {showWallR && <mesh geometry={g.liningR} material={liningMat} position={[0, 0, mt.cargo.z1]} receiveShadow />}
      {showRoof && (
        <mesh geometry={g.ceiling} material={ceilingMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, mt.cargo.y1 - 0.015, 0]} receiveShadow />
      )}
      {/* Zemin */}
      <mesh material={floorMat} position={[(mt.cargo.x0 + mt.cargo.x1) / 2, mt.cargo.y0 - 0.02, 0]} receiveShadow>
        <boxGeometry args={[mt.cargo.x1 - mt.cargo.x0, 0.04, mt.cargo.z1 - mt.cargo.z0 + 0.04]} />
      </mesh>
      {/* Alt şasi */}
      <mesh material={trim} position={[(mt.xRear + mt.xFront) / 2, (sill + mt.cargo.y0 - 0.04) / 2, 0]}>
        <boxGeometry args={[mt.xFront - mt.xRear - 0.1, Math.max(0.02, mt.cargo.y0 - 0.04 - sill), W - 2 * skin - 0.02]} />
      </mesh>
      {/* Motor bölmesi dolgusu */}
      <mesh material={trim} position={[(mt.cargo.x1 + mt.xFront) / 2, (sill + yHood - 0.25) / 2, 0]}>
        <boxGeometry args={[mt.xFront - mt.cargo.x1 - 0.2, yHood - 0.25 - sill, W - 2 * skin - 0.06]} />
      </mesh>
      {/* Tekerlek davlumbazları (iç) */}
      {[1, -1].map((s) => (
        <RoundedBox
          key={`arch${s}`}
          args={[mt.arches.x1 - mt.arches.x0, mt.arches.h, mt.arches.w]}
          radius={0.03}
          position={[(mt.arches.x0 + mt.arches.x1) / 2, mt.cargo.y0 + mt.arches.h / 2, s * (mt.cargo.z1 - mt.arches.w / 2)]}
          material={liningMat}
          castShadow
          receiveShadow
        />
      ))}
      {/* LED şeritler */}
      {[1, -1].map((s) => (
        <mesh key={`led${s}`} material={ledStrip()} position={[(mt.cargo.x0 + mt.cargo.x1) / 2, mt.cargo.y1 - 0.03, s * (mt.cargo.z1 - 0.08)]}>
          <boxGeometry args={[mt.cargo.x1 - mt.cargo.x0 - 0.3, 0.012, 0.03]} />
        </mesh>
      ))}
      <pointLight ref={lightRef1} position={[mt.cargo.x1 * 0.3, mt.cargo.y1 - 0.15, 0]} color="#fff1dc" distance={4} decay={1.6} intensity={2} />
      <pointLight ref={lightRef2} position={[mt.cargo.x1 * 0.75, mt.cargo.y1 - 0.15, 0]} color="#fff1dc" distance={4} decay={1.6} intensity={2} />

      {/* ---------- Kabin ---------- */}
      <mesh material={dashMat} position={[mt.dashX - 0.28, yHood - 0.05, 0]} castShadow>
        <boxGeometry args={[0.56, 0.5, W - 2 * skin - 0.1]} />
      </mesh>
      <mesh material={dashMat} position={[mt.dashX - 0.2, yHood + 0.22, 0]}>
        <boxGeometry args={[0.4, 0.06, W - 2 * skin - 0.14]} />
      </mesh>
      {/* Direksiyon */}
      <mesh material={darkPlastic()} position={[mt.dashX - 0.62, yHood + 0.05, -0.55]} rotation={[0, 0, Math.PI / 2 - 0.5]}>
        <torusGeometry args={[0.19, 0.022, 10, 32]} />
      </mesh>
      {/* Kabin zemini */}
      <mesh material={trim} position={[(mt.cargo.x1 + mt.dashX) / 2, mt.cargo.y0 - 0.12, 0]}>
        <boxGeometry args={[mt.dashX - mt.cargo.x1, 0.04, W - 2 * skin - 0.04]} />
      </mesh>
      {/* Koltuklar */}
      {[-0.56, 0.56].map((z) => (
        <group key={z} position={[mt.cabSeatX, mt.cargo.y0 - 0.1, z]}>
          <mesh material={seatMat} position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
          </mesh>
          <RoundedBox args={[0.5, 0.14, 0.52]} radius={0.04} position={[0, 0.47, 0]} material={seatMat} castShadow />
          <RoundedBox args={[0.16, 0.66, 0.52]} radius={0.04} position={[-0.2, 0.8, 0]} rotation={[0, 0, -0.18]} material={seatMat} castShadow />
          <RoundedBox args={[0.12, 0.2, 0.26]} radius={0.04} position={[-0.3, 1.2, 0]} material={seatMat} />
        </group>
      ))}

      {/* ---------- Kapılar ---------- */}
      {showWallR && (
        <group ref={sliderRef} position={[0, 0, W / 2 - 0.04]}>
          <mesh geometry={g.slider} material={paint} castShadow receiveShadow />
          {g.sliderGlass && <mesh geometry={g.sliderGlass} material={glassExt} position={[0, 0, 0.022]} />}
          {holes.sliderRect && <WindowFrame r={holes.sliderRect} z={0.046} />}
          {/* kapı kolu */}
          <mesh material={darkPlastic()} position={[mt.sd.x0 + 0.18, mt.cargo.y0 + 1.0, 0.06]}>
            <boxGeometry args={[0.22, 0.05, 0.03]} />
          </mesh>
          {/* iç kaplama */}
          <mesh material={liningMat} position={[(mt.sd.x0 + mt.sd.x1) / 2, (mt.sd.y0 + mt.sd.y1) / 2, -0.008]}>
            <boxGeometry args={[mt.sd.x1 - mt.sd.x0 - 0.04, mt.sd.y1 - mt.sd.y0 - 0.04, 0.012]} />
          </mesh>
        </group>
      )}
      <group ref={rearR} position={[mt.xRear, mt.rd.y0 + 0.005, mt.rd.z1]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={g.rearDoor} material={paint} castShadow receiveShadow />
        {g.rearGlass && <mesh geometry={g.rearGlass} material={glassExt} position={[0, 0, 0.025]} />}
        {holes.rearRect && <WindowFrame r={holes.rearRect} z={-0.004} />}
        <mesh material={liningMat} position={[(v.rearDoor.width / 2) / 2, (mt.rd.y1 - mt.rd.y0) / 2, 0.055]}>
          <boxGeometry args={[v.rearDoor.width / 2 - 0.05, mt.rd.y1 - mt.rd.y0 - 0.06, 0.01]} />
        </mesh>
        <mesh material={taillightMat} position={[0.05, 0.6, -0.004]}>
          <boxGeometry args={[0.02, 0.4, 0.01]} />
        </mesh>
      </group>
      <group ref={rearL} position={[mt.xRear + 0.05, mt.rd.y0 + 0.005, mt.rd.z0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={g.rearDoor} material={paint} castShadow receiveShadow />
        {g.rearGlass && <mesh geometry={g.rearGlass} material={glassExt} position={[0, 0, 0.025]} />}
        {holes.rearRect && <WindowFrame r={holes.rearRect} z={0.054} />}
        <mesh material={liningMat} position={[(v.rearDoor.width / 2) / 2, (mt.rd.y1 - mt.rd.y0) / 2, -0.006]}>
          <boxGeometry args={[v.rearDoor.width / 2 - 0.05, mt.rd.y1 - mt.rd.y0 - 0.06, 0.01]} />
        </mesh>
        <mesh material={plateMat} position={[v.rearDoor.width / 4, 0.55, 0.053]}>
          <boxGeometry args={[0.5, 0.11, 0.005]} />
        </mesh>
      </group>

      {/* ---------- Dış detaylar ---------- */}
      {/* Stoplar */}
      {[1, -1].map((s) => (
        <mesh key={`tl${s}`} material={taillightMat} position={[mt.xRear - 0.004, mt.cargo.y0 + 0.62, s * (mt.rd.z1 + (W / 2 - skin - mt.rd.z1) / 2)]}>
          <boxGeometry args={[0.02, 0.42, Math.max(0.05, W / 2 - skin - mt.rd.z1 - 0.07)]} />
        </mesh>
      ))}
      {/* Tamponlar */}
      <RoundedBox args={[0.12, 0.26, W]} radius={0.04} position={[mt.xRearBumper + 0.06, sill + 0.05, 0]} material={trim} castShadow />
      <RoundedBox args={[0.16, 0.3, W]} radius={0.05} position={[mt.xFrontBumper - 0.08, sill + 0.12, 0]} material={trim} castShadow />
      {/* Izgara */}
      <mesh material={darkPlastic()} position={[mt.xFront + 0.006, (noseFaceY0 + noseFaceY1) / 2 - 0.02, 0]}>
        <boxGeometry args={[0.02, Math.max(0.1, noseFaceY1 - noseFaceY0 - 0.35), W * 0.5]} />
      </mesh>
      {/* Farlar */}
      {[1, -1].map((s) => (
        <RoundedBox key={`hl${s}`} args={[0.04, 0.2, 0.42]} radius={0.02} position={[mt.xFront + 0.01, noseFaceY1 - 0.16, s * (W / 2 - 0.32)]} material={headlightMat} />
      ))}
      {/* Aynalar */}
      {[1, -1].map((s) => (
        <group key={`mir${s}`} position={[mt.dashX - 0.05, p.beltY + 0.28, s * (W / 2 + 0.13)]}>
          <RoundedBox args={[0.12, 0.24, 0.2]} radius={0.03} material={trim} castShadow />
          <mesh material={trim} position={[0, -0.02, -s * 0.13]}>
            <boxGeometry args={[0.04, 0.04, 0.14]} />
          </mesh>
        </group>
      ))}
      {/* Ön plaka */}
      <mesh material={plateMat} position={[mt.xFrontBumper + 0.002, sill + 0.14, 0]}>
        <boxGeometry args={[0.005, 0.11, 0.5]} />
      </mesh>
      {/* Kapı çizgileri (kabin) */}
      {[1, -1].map((s) => (
        <mesh key={`seam${s}`} material={darkPlastic()} position={[mt.cargo.x1 + 0.14, (sill + p.beltY) / 2 + 0.03, s * (W / 2 + 0.001)]}>
          <boxGeometry args={[0.012, p.beltY - sill - 0.1, 0.004]} />
        </mesh>
      ))}

      {/* ---------- Tekerlekler ---------- */}
      {wheels.map(([x, z], i) => (
        <group key={i} position={[x, v.wheel.radius, z]}>
          <mesh geometry={wheelGeo} material={tireMat} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh geometry={rimGeo} material={rimMat} rotation={[Math.PI / 2, 0, 0]} />
          {(z < 0 || showWallR) && (
            <mesh geometry={archGeo} material={trim} position={[0, 0, z > 0 ? W / 2 - z + 0.003 : -(W / 2 + z) - 0.003]} rotation={[0, z > 0 ? 0 : Math.PI, 0]} />
          )}
        </group>
      ))}
      {/* Ön tekerlek kabin içi davlumbaz */}
      {[1, -1].map((s) => (
        <mesh key={`fa${s}`} material={dashMat} position={[mt.frontAxleX, mt.cargo.y0 - 0.02, s * (W / 2 - skin - 0.2)]}>
          <boxGeometry args={[1.0, 0.36, 0.4]} />
        </mesh>
      ))}
      {/* Kabin ışığı için hafif emissive */}
      <mesh material={fabric('#3a3f47')} position={[(mt.cargo.x1 + mt.dashX) / 2, mt.cargo.y0 - 0.1, 0]}>
        <boxGeometry args={[Math.max(0.1, mt.dashX - mt.cargo.x1 - 0.3), 0.005, W - 2 * skin - 0.5]} />
      </mesh>
      {/* Egzoz / yakıt kapağı gibi küçük detaylar */}
      <mesh material={steel()} position={[mt.xRear + 0.35, sill - 0.02, -(W / 2 - 0.3)]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
      </mesh>
      <mesh material={mat('#000000', { roughness: 0.4 })} position={[mt.xRear + 0.16, sill - 0.02, -(W / 2 - 0.3)]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.034, 0.034, 0.06, 12]} />
      </mesh>
    </group>
  );
}

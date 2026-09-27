import type { ModuleDef, WallSide } from '../data/modules';
import { getModule } from '../data/modules';
import type { VehicleSpec } from '../data/vehicles';
import { vanMetrics, clamp, snap, type VanMetrics } from './metrics';

export interface PlacedModule {
  uid: string;
  defId: string;
  x: number;
  y: number;
  z: number;
  /** 0..3 → 90° adımlarla döndürme (zemin modülleri) */
  rot: number;
  side?: WallSide;
  color?: string;
}

export interface Rect2 { a0: number; a1: number; b0: number; b1: number }

const EPS = 0.004;

export function overlaps(a: Rect2, b: Rect2): boolean {
  return a.a0 < b.a1 - EPS && a.a1 > b.a0 + EPS && a.b0 < b.b1 - EPS && a.b1 > b.b0 + EPS;
}

export function footprintSize(def: ModuleDef, rot: number): { w: number; d: number } {
  const [w, , d] = def.size;
  return rot % 2 === 1 ? { w: d, d: w } : { w, d };
}

/** Zemin modülü x–z ayak izi */
export function floorRect(m: PlacedModule, def: ModuleDef): Rect2 {
  const { w, d } = footprintSize(def, m.rot);
  return { a0: m.x - w / 2, a1: m.x + w / 2, b0: m.z - d / 2, b1: m.z + d / 2 };
}

/** Duvar modülü (a: duvar boyunca eksen, b: yükseklik) */
export function wallRect(m: PlacedModule, def: ModuleDef): Rect2 {
  const [w, h] = def.size;
  const a = m.side === 'rear' ? m.z : m.x;
  return { a0: a - w / 2, a1: a + w / 2, b0: m.y - h / 2, b1: m.y + h / 2 };
}

/** Çatı modülü x–z */
export function roofRect(m: PlacedModule, def: ModuleDef): Rect2 {
  const [w, , d] = def.size;
  return { a0: m.x - w / 2, a1: m.x + w / 2, b0: m.z - d / 2, b1: m.z + d / 2 };
}

export function wallLength(side: WallSide, mt: VanMetrics): { a0: number; a1: number } {
  if (side === 'rear') return { a0: mt.rd.z0, a1: mt.rd.z1 };
  return { a0: mt.cargo.x0, a1: mt.cargo.x1 };
}

/** Modülü araç sınırlarına sıkıştırır ve ızgaraya oturtur. */
export function clampModule(m: PlacedModule, def: ModuleDef, vehicle: VehicleSpec, doSnap = true): PlacedModule {
  const mt = vanMetrics(vehicle);
  const s = (v: number) => (doSnap ? snap(v, 0.025) : v);
  if (def.mount === 'floor') {
    const { w, d } = footprintSize(def, m.rot);
    const x = clamp(m.x, mt.cargo.x0 + w / 2, mt.cargo.x1 - w / 2);
    const z = clamp(m.z, mt.cargo.z0 + d / 2, mt.cargo.z1 - d / 2);
    return { ...m, x: s(x), z: s(z), y: mt.cargo.y0 };
  }
  if (def.mount === 'wall') {
    const [w, h] = def.size;
    const side = m.side ?? 'R';
    const len = wallLength(side, mt);
    const isWindow = !!def.hole;
    const yMin = mt.cargo.y0 + (isWindow ? 0.3 : 0.05) + h / 2;
    const yMax = (side === 'rear' ? mt.rd.y1 : mt.cargo.y1) - (isWindow ? 0.12 : 0.02) - h / 2;
    const y = clamp(m.y, yMin, Math.max(yMin, yMax));
    if (side === 'rear') {
      const z = def.kind === 'window-rear' ? 0 : clamp(m.z, len.a0 + w / 2 + 0.03, len.a1 - w / 2 - 0.03);
      return { ...m, z: s(z), y: s(y), x: mt.cargo.x0 };
    }
    let a0 = len.a0 + 0.06;
    let a1 = len.a1 - 0.06;
    if (def.kind === 'window-slider') {
      a0 = mt.sd.x0 + 0.12;
      a1 = mt.sd.x1 - 0.12;
    }
    const x = clamp(m.x, a0 + w / 2, Math.max(a0 + w / 2, a1 - w / 2));
    return { ...m, x: s(x), y: s(y), z: side === 'R' ? mt.cargo.z1 : mt.cargo.z0 };
  }
  if (def.mount === 'roof') {
    const [w, , d] = def.size;
    const x0 = Math.max(mt.roof.x0, mt.cargo.x0) + 0.08;
    const x1 = Math.min(mt.roof.x1, mt.cargo.x1) - 0.08;
    const z0 = mt.cargo.z0 + 0.08;
    const z1 = mt.cargo.z1 - 0.08;
    const x = clamp(m.x, x0 + w / 2, Math.max(x0 + w / 2, x1 - w / 2));
    const z = clamp(m.z, z0 + d / 2, Math.max(z0 + d / 2, z1 - d / 2));
    return { ...m, x: s(x), z: s(z), y: vehicle.height };
  }
  return m;
}

/** Duvara yaklaşınca mıknatıs gibi yapışma (zemin modülleri). */
export function magnetToWalls(m: PlacedModule, def: ModuleDef, vehicle: VehicleSpec, threshold = 0.09): PlacedModule {
  if (def.mount !== 'floor') return m;
  const mt = vanMetrics(vehicle);
  const { w, d } = footprintSize(def, m.rot);
  let { x, z } = m;
  if (Math.abs(x - w / 2 - mt.cargo.x0) < threshold) x = mt.cargo.x0 + w / 2;
  if (Math.abs(x + w / 2 - mt.cargo.x1) < threshold) x = mt.cargo.x1 - w / 2;
  if (Math.abs(z - d / 2 - mt.cargo.z0) < threshold) z = mt.cargo.z0 + d / 2;
  if (Math.abs(z + d / 2 - mt.cargo.z1) < threshold) z = mt.cargo.z1 - d / 2;
  return { ...m, x, z };
}

/** Aynı yüzeydeki diğer modüllerle çakışma kontrolü. */
export function collides(m: PlacedModule, def: ModuleDef, others: PlacedModule[], vehicle: VehicleSpec): boolean {
  const mt = vanMetrics(vehicle);
  if (def.mount === 'floor') {
    const r = floorRect(m, def);
    return others.some((o) => {
      if (o.uid === m.uid) return false;
      const od = getModule(o.defId);
      if (od.mount !== 'floor') return false;
      return overlaps(r, floorRect(o, od));
    });
  }
  if (def.mount === 'wall') {
    const r = wallRect(m, def);
    const side = m.side ?? 'R';
    // Sürgülü kapı açıklığı: pencere/dolap kapıya çakışamaz (kapı camı hariç)
    if (side === 'R' && def.kind !== 'window-slider') {
      const door: Rect2 = { a0: mt.sd.x0 - 0.04, a1: mt.sd.x1 + 0.04, b0: mt.sd.y0, b1: mt.sd.y1 + 0.04 };
      if (overlaps(r, door)) return true;
    }
    return others.some((o) => {
      if (o.uid === m.uid) return false;
      const od = getModule(o.defId);
      if (od.mount !== 'wall' || (o.side ?? 'R') !== side) return false;
      return overlaps(r, wallRect(o, od));
    });
  }
  if (def.mount === 'roof') {
    const r = roofRect(m, def);
    return others.some((o) => {
      if (o.uid === m.uid) return false;
      const od = getModule(o.defId);
      if (od.mount !== 'roof') return false;
      return overlaps(r, roofRect(o, od));
    });
  }
  return false;
}

let uidCounter = 0;
export function newUid(): string {
  uidCounter += 1;
  return `${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Yeni modül için boş bir yer bulur. */
export function findFreeSpot(def: ModuleDef, modules: PlacedModule[], vehicle: VehicleSpec, preferSide?: WallSide): PlacedModule {
  const mt = vanMetrics(vehicle);
  const base: PlacedModule = { uid: newUid(), defId: def.id, x: 0, y: 0, z: 0, rot: 0 };

  if (def.mount === 'exterior') return base;

  if (def.mount === 'floor') {
    const [w, , d] = def.size;
    const candidates: PlacedModule[] = [];
    // Önce sağ ve sol duvar boyunca, sonra ortada ızgara tarama
    const step = 0.1;
    // Duvar boyunca: sağ duvarda kapaklar koridora (-z) baksın (rot 0), sol duvarda rot 2
    const wallScan: { z: number; rot: number }[] = [
      { z: mt.cargo.z1 - d / 2, rot: 0 },
      { z: mt.cargo.z0 + d / 2, rot: 2 },
    ];
    for (const { z, rot } of wallScan) {
      for (let x = mt.cargo.x0 + w / 2; x <= mt.cargo.x1 - w / 2 + 1e-6; x += step) {
        candidates.push({ ...base, x, z, rot });
      }
    }
    for (const rot of [0, 1]) {
      const fw = rot ? d : w;
      const fd = rot ? w : d;
      for (let z = mt.cargo.z0 + fd / 2; z <= mt.cargo.z1 - fd / 2 + 1e-6; z += step) {
        for (let x = mt.cargo.x0 + fw / 2; x <= mt.cargo.x1 - fw / 2 + 1e-6; x += step) {
          candidates.push({ ...base, x, z, rot });
        }
      }
    }
    for (const c of candidates) {
      const cl = clampModule(c, def, vehicle);
      if (!collides(cl, def, modules, vehicle)) return cl;
    }
    return clampModule({ ...base, x: mt.cargo.x1 / 2, z: 0 }, def, vehicle);
  }

  if (def.mount === 'wall') {
    const sides = def.sides ?? ['L', 'R'];
    const order = preferSide && sides.includes(preferSide) ? [preferSide, ...sides.filter((s) => s !== preferSide)] : sides;
    const [w] = def.size;
    for (const side of order) {
      const len = wallLength(side, mt);
      const start = len.a0 + w / 2 + 0.06;
      const end = len.a1 - w / 2 - 0.06;
      for (let a = start; a <= end + 1e-6; a += 0.1) {
        const c: PlacedModule = {
          ...base,
          side,
          x: side === 'rear' ? mt.cargo.x0 : a,
          z: side === 'rear' ? a : 0,
          y: mt.cargo.y0 + (def.wallY ?? 1.2),
        };
        const cl = clampModule(c, def, vehicle);
        if (!collides(cl, def, modules, vehicle)) return cl;
      }
    }
    const side = order[0];
    return clampModule({ ...base, side, x: mt.cargo.x1 / 2, z: 0, y: mt.cargo.y0 + (def.wallY ?? 1.2) }, def, vehicle);
  }

  if (def.mount === 'roof') {
    const [w, , d] = def.size;
    for (let x = mt.cargo.x0 + w / 2 + 0.1; x <= mt.cargo.x1 - w / 2; x += 0.1) {
      for (const z of [0, mt.cargo.z0 + d / 2 + 0.1, mt.cargo.z1 - d / 2 - 0.1]) {
        const cl = clampModule({ ...base, x, z }, def, vehicle);
        if (!collides(cl, def, modules, vehicle)) return cl;
      }
    }
    return clampModule({ ...base, x: mt.cargo.x1 / 2, z: 0 }, def, vehicle);
  }
  return base;
}

/** Tüm modüllerin mevcut araca göre yeniden sıkıştırılması (araç değişince). */
export function refitModules(modules: PlacedModule[], vehicle: VehicleSpec): PlacedModule[] {
  const out: PlacedModule[] = [];
  for (const m of modules) {
    const def = getModule(m.defId);
    let c = clampModule(m, def, vehicle);
    if (collides(c, def, out, vehicle)) {
      c = { ...findFreeSpot(def, out, vehicle, m.side), uid: m.uid, color: m.color };
    }
    out.push(c);
  }
  return out;
}

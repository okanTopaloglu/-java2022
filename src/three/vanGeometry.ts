import * as THREE from 'three';
import type { VehicleSpec } from '../data/vehicles';
import type { VanMetrics } from '../utils/metrics';

export type Pt = THREE.Vector2;
const V = (x: number, y: number) => new THREE.Vector2(x, y);

export function arcPts(cx: number, cy: number, r: number, a0: number, a1: number, n = 8): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    out.push(V(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
  }
  return out;
}

export interface Profile {
  /** Tam yan siluet (saat yönünün tersi) */
  outline: Pt[];
  /** Ön bant: çatı önünden buruna, alttan arkaya kadar dış hat */
  frontBand: Pt[];
  /** Arka üst bant (çatı arkası → arka kapı üstü) */
  rearBand: Pt[];
  cabWindow: Pt[];
  wsBase: Pt;
  wsTop: Pt;
  roofStartX: number;
  beltY: number;
}

export function buildProfile(v: VehicleSpec, mt: VanMetrics): Profile {
  const p = v.profile;
  const H = v.height;
  const sill = p.sill;
  const xF = mt.xFront;
  const xR = mt.xRear;
  const yHood = p.hoodHeight;
  const hoodR = p.noseRadius;
  const noseR = 0.14;
  const wsBase = V(xF - p.hoodLength, yHood + 0.12);
  const xWsTop = xF - p.windshieldTop;
  const wsTop = V(xWsTop, H - 0.12);
  const roofStart = V(xWsTop - 0.3, H);

  const bottomFront = V(xF - noseR, sill);
  const front: Pt[] = [
    bottomFront,
    ...arcPts(xF - noseR, sill + noseR, noseR, -Math.PI / 2, 0, 4).slice(1),
    V(xF, yHood - hoodR),
    ...arcPts(xF - hoodR, yHood - hoodR, hoodR, 0, Math.PI / 2, 8).slice(1),
    wsBase,
    wsTop,
    V(xWsTop - 0.12, H - 0.02),
    roofStart,
  ];
  const rearTop = [
    V(xR + p.roofRadius, H),
    ...arcPts(xR + p.roofRadius, H - p.roofRadius, p.roofRadius, Math.PI / 2, Math.PI, 8).slice(1),
  ];
  const outline: Pt[] = [V(xR, sill), ...front, ...rearTop, V(xR, mt.rd.y1), V(xR, mt.cargo.y0)];

  // Ön bant: roofStart'tan burun etrafından alta, alttan arkaya, arka eşiğe
  const frontBand: Pt[] = [...front.slice().reverse(), V(xR, sill), V(xR, mt.cargo.y0)];
  const rearBand: Pt[] = [...rearTop, V(xR, mt.rd.y1)];

  const beltY = yHood + 0.42;
  const yTop = H - 0.3;
  const wsXAt = (y: number) => wsBase.x + ((y - wsBase.y) / (wsTop.y - wsBase.y)) * (wsTop.x - wsBase.x);
  const bPillar = v.cargo.length + 0.14;
  const cabWindow: Pt[] = [
    V(bPillar, beltY),
    V(wsXAt(beltY) - 0.16, beltY),
    V(wsXAt(yTop) - 0.16, yTop),
    V(bPillar, yTop),
  ];
  return { outline, frontBand, rearBand, cabWindow, wsBase, wsTop, roofStartX: roofStart.x, beltY };
}

export function roundedRectPts(cx: number, cy: number, w: number, h: number, r: number): Pt[] {
  const rr = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3);
  const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
  return [
    ...arcPts(x1 - rr, y0 + rr, rr, -Math.PI / 2, 0, 4),
    ...arcPts(x1 - rr, y1 - rr, rr, 0, Math.PI / 2, 4),
    ...arcPts(x0 + rr, y1 - rr, rr, Math.PI / 2, Math.PI, 4),
    ...arcPts(x0 + rr, y0 + rr, rr, Math.PI, Math.PI * 1.5, 4),
  ];
}

export function makeShape(outline: Pt[], holes: Pt[][] = []): THREE.Shape {
  const shape = new THREE.Shape(outline);
  for (const h of holes) shape.holes.push(new THREE.Path(h));
  return shape;
}

/** Açık bir poliçizgiyi içe doğru t kadar öteleyerek kapalı bant poligonu üretir. */
export function bandPolygon(pts: Pt[], t: number, inwardSign = 1): Pt[] {
  const n = pts.length;
  const inner: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(n - 1, i + 1)];
    const d = next.clone().sub(prev).normalize();
    const nrm = V(-d.y, d.x).multiplyScalar(inwardSign);
    inner.push(pts[i].clone().add(nrm.multiplyScalar(t)));
  }
  return [...pts, ...inner.reverse()];
}

/**
 * Ekstrüde geometride belirli bir normale sahip üçgenleri ayrı bir malzeme
 * grubuna taşır (ön cam için).
 */
export function splitByNormal(geo: THREE.BufferGeometry, normal: THREE.Vector3, tol = 0.985): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute | undefined;
  const triCount = pos.count / 3;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3(), nn = new THREE.Vector3();
  const body: number[] = [];
  const glass: number[] = [];
  for (let i = 0; i < triCount; i++) {
    a.fromBufferAttribute(pos, i * 3);
    b.fromBufferAttribute(pos, i * 3 + 1);
    c.fromBufferAttribute(pos, i * 3 + 2);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    nn.crossVectors(ab, ac).normalize();
    (Math.abs(nn.dot(normal)) > tol ? glass : body).push(i);
  }
  const order = [...body, ...glass];
  const newPos = new Float32Array(pos.count * 3);
  const newUv = uv ? new Float32Array(pos.count * 2) : null;
  let k = 0;
  for (const tri of order) {
    for (let j = 0; j < 3; j++) {
      const src = tri * 3 + j;
      newPos[k * 3] = pos.getX(src);
      newPos[k * 3 + 1] = pos.getY(src);
      newPos[k * 3 + 2] = pos.getZ(src);
      if (uv && newUv) {
        newUv[k * 2] = uv.getX(src);
        newUv[k * 2 + 1] = uv.getY(src);
      }
      k++;
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
  if (newUv) out.setAttribute('uv', new THREE.BufferAttribute(newUv, 2));
  out.clearGroups();
  out.addGroup(0, body.length * 3, 0);
  out.addGroup(body.length * 3, glass.length * 3, 1);
  out.computeVertexNormals();
  return out;
}

export function extrude(shape: THREE.Shape, depth: number, bevel = 0, curveSegments = 12): THREE.ExtrudeGeometry {
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments,
  });
}

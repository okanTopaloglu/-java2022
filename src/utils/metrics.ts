import * as THREE from 'three';
import type { VehicleSpec } from '../data/vehicles';

/**
 * Koordinat sistemi:
 *  X: araç boyu, +X ön. x = 0 yük zemininin arka kenarı (arka kapı eşiği).
 *  Y: yukarı, y = 0 yer.
 *  Z: araç eni, +Z sağ taraf (sürgülü kapı tarafı), -Z sol (sürücü).
 */
export interface Rect3 {
  x0: number; x1: number; y0: number; y1: number; z0: number; z1: number;
}

export interface VanMetrics {
  skin: number;
  wallT: number;
  xRearBumper: number;
  xRear: number;
  xFrontBumper: number;
  xFront: number;
  cargo: Rect3;
  roofT: number;
  rearAxleX: number;
  frontAxleX: number;
  /** Sürgülü kapı açıklığı (sağ duvar, x–y) */
  sd: { x0: number; x1: number; y0: number; y1: number };
  /** Arka kapı açıklığı (z–y) */
  rd: { z0: number; z1: number; y0: number; y1: number };
  arches: { x0: number; x1: number; w: number; h: number };
  /** Çatı düz panelinin x aralığı */
  roof: { x0: number; x1: number; z0: number; z1: number };
  center: THREE.Vector3;
  cabSeatX: number;
  dashX: number;
}

export function vanMetrics(v: VehicleSpec): VanMetrics {
  const skin = 0.05;
  const xRearBumper = -0.14;
  const xRear = -0.08;
  const xFrontBumper = xRearBumper + v.length;
  const xFront = xFrontBumper - 0.1;
  const wallT = (v.width - v.cargo.width) / 2;
  const floorY = v.cargo.floorHeight;
  const cargo: Rect3 = {
    x0: 0,
    x1: v.cargo.length,
    y0: floorY,
    y1: floorY + v.cargo.height,
    z0: -v.cargo.width / 2,
    z1: v.cargo.width / 2,
  };
  const roofT = Math.max(0.045, v.height - cargo.y1);
  const rearAxleX = xRearBumper + v.rearOverhang;
  const frontAxleX = rearAxleX + v.wheelbase;
  const sd = {
    x0: v.cargo.length - v.slidingDoor.offset - v.slidingDoor.width,
    x1: v.cargo.length - v.slidingDoor.offset,
    y0: floorY,
    y1: floorY + v.slidingDoor.height,
  };
  const rd = {
    z0: -v.rearDoor.width / 2,
    z1: v.rearDoor.width / 2,
    y0: floorY,
    y1: floorY + v.rearDoor.height,
  };
  const arches = {
    x0: rearAxleX - v.cargo.archLength / 2,
    x1: rearAxleX + v.cargo.archLength / 2,
    w: (v.cargo.width - v.cargo.archWidth) / 2,
    h: v.cargo.archHeight,
  };
  const roof = {
    x0: xRear + v.profile.roofRadius,
    x1: xFront - v.profile.windshieldTop - 0.3,
    z0: -(v.width / 2 - skin),
    z1: v.width / 2 - skin,
  };
  const center = new THREE.Vector3((xRearBumper + xFrontBumper) / 2, v.height * 0.45, 0);
  const dashX = xFront - v.profile.hoodLength;
  const cabSeatX = v.cargo.length + 0.55;
  return {
    skin, wallT, xRearBumper, xRear, xFrontBumper, xFront, cargo, roofT,
    rearAxleX, frontAxleX, sd, rd, arches, roof, center, cabSeatX, dashX,
  };
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const snap = (v: number, step = 0.05) => Math.round(v / step) * step;

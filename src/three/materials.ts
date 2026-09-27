import * as THREE from 'three';
import { fabricTexture, woodTexture } from './textures';

const cache = new Map<string, THREE.Material>();

export interface MatOpts {
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
  map?: THREE.Texture;
  clearcoat?: number;
}

export function mat(color: string, o: MatOpts = {}): THREE.MeshStandardMaterial {
  const key = `${color}|${o.roughness ?? 0.6}|${o.metalness ?? 0}|${o.emissive ?? ''}|${o.emissiveIntensity ?? 0}|${o.transparent ?? false}|${o.opacity ?? 1}|${o.side ?? 0}|${o.map?.uuid ?? ''}|${o.clearcoat ?? 0}`;
  const hit = cache.get(key);
  if (hit) return hit as THREE.MeshStandardMaterial;
  const m = o.clearcoat
    ? new THREE.MeshPhysicalMaterial({ color, roughness: o.roughness ?? 0.6, metalness: o.metalness ?? 0, clearcoat: o.clearcoat, clearcoatRoughness: 0.1 })
    : new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? 0.6, metalness: o.metalness ?? 0 });
  if (o.emissive) {
    m.emissive = new THREE.Color(o.emissive);
    m.emissiveIntensity = o.emissiveIntensity ?? 1;
  }
  if (o.transparent) {
    m.transparent = true;
    m.opacity = o.opacity ?? 0.5;
  }
  if (o.side !== undefined) m.side = o.side;
  if (o.map) m.map = o.map;
  cache.set(key, m);
  return m;
}

export const wood = (color = '#c9a074') => mat(color, { roughness: 0.55, map: woodTexture('#ffffff') });
export const fabric = (color = '#c8b79a') => mat(color, { roughness: 0.95, map: fabricTexture('#ffffff') });
export const steel = () => mat('#c8ccd1', { roughness: 0.3, metalness: 0.9 });
export const darkPlastic = () => mat('#1d2024', { roughness: 0.7, metalness: 0.1 });
export const white = () => mat('#f4f4f2', { roughness: 0.45 });
export const laminate = (color = '#f1efe9') => mat(color, { roughness: 0.4 });
export const glassInterior = () =>
  mat('#9ccbe6', { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
export const frosted = () => mat('#dfe9f0', { roughness: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
export const ledStrip = () => mat('#ffffff', { emissive: '#fff4d6', emissiveIntensity: 2.2 });

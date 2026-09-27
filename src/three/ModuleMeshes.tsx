import * as THREE from 'three';
import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { ModuleDef } from '../data/modules';
import type { VehicleSpec } from '../data/vehicles';
import type { VanMetrics } from '../utils/metrics';
import type { PlacedModule } from '../utils/layout';
import { darkPlastic, fabric, frosted, glassInterior, laminate, mat, steel, white, wood } from './materials';
import { solarTexture } from './textures';

interface Props {
  def: ModuleDef;
  m: PlacedModule;
  color?: string;
  mt: VanMetrics;
  vehicle: VehicleSpec;
}

const B = ({
  size,
  pos,
  material,
  rot,
  shadow = true,
}: {
  size: [number, number, number];
  pos: [number, number, number];
  material: THREE.Material;
  rot?: [number, number, number];
  shadow?: boolean;
}) => (
  <mesh position={pos} rotation={rot} material={material} castShadow={shadow} receiveShadow={shadow}>
    <boxGeometry args={size} />
  </mesh>
);

const handleMat = () => steel();
const counterMat = () => mat('#3b3f45', { roughness: 0.35, metalness: 0.1 });
const mattressMat = () => fabric('#efe9dc');
const pillowMat = () => fabric('#ffffff');

/** Kapak: -z yüzüne yerleştirilen ince panel + kulp */
function Door({ x, y, w, h, z, material, handleSide = 1 }: { x: number; y: number; w: number; h: number; z: number; material: THREE.Material; handleSide?: number }) {
  return (
    <group position={[x, y, z]}>
      <B size={[w, h, 0.016]} pos={[0, 0, 0]} material={material} />
      <B size={[0.02, Math.min(0.16, h * 0.4), 0.02]} pos={[handleSide * (w / 2 - 0.05), 0, -0.02]} material={handleMat()} shadow={false} />
    </group>
  );
}

function Bed({ def, color }: Props) {
  const [w, h, d] = def.size;
  const base = wood('#b98d63');
  const blanket = fabric(color ?? '#c8b79a');
  return (
    <group>
      <B size={[w, h - 0.22, d]} pos={[0, (h - 0.22) / 2, 0]} material={base} />
      {/* alt bagaj kapakları */}
      <Door x={-w / 4} y={(h - 0.22) / 2} w={w / 2 - 0.03} h={h - 0.3} z={-d / 2 - 0.008} material={wood('#c9a074')} />
      <Door x={w / 4} y={(h - 0.22) / 2} w={w / 2 - 0.03} h={h - 0.3} z={-d / 2 - 0.008} material={wood('#c9a074')} handleSide={-1} />
      <RoundedBox args={[w - 0.04, 0.18, d - 0.04]} radius={0.04} position={[0, h - 0.22 + 0.09, 0]} material={mattressMat()} castShadow receiveShadow />
      <RoundedBox args={[w - 0.1, 0.05, d * 0.55]} radius={0.02} position={[0, h - 0.02, d * 0.2]} material={blanket} castShadow />
      {w > 1.1 ? (
        <>
          <RoundedBox args={[0.42, 0.1, 0.3]} radius={0.04} position={[-w / 4, h + 0.02, -d / 2 + 0.22]} material={pillowMat()} castShadow />
          <RoundedBox args={[0.42, 0.1, 0.3]} radius={0.04} position={[w / 4, h + 0.02, -d / 2 + 0.22]} material={pillowMat()} castShadow />
        </>
      ) : (
        <RoundedBox args={[0.42, 0.1, 0.3]} radius={0.04} position={[0, h + 0.02, -d / 2 + 0.22]} material={pillowMat()} castShadow />
      )}
    </group>
  );
}

function Sofa({ def, color }: Props) {
  const [w, h, d] = def.size;
  const f = fabric(color ?? '#7a8b9c');
  return (
    <group>
      <B size={[w, 0.38, d]} pos={[0, 0.19, 0]} material={wood('#b98d63')} />
      <RoundedBox args={[w - 0.04, 0.16, d - 0.28]} radius={0.05} position={[0, 0.46, -0.12]} material={f} castShadow />
      <RoundedBox args={[w - 0.04, h - 0.5, 0.22]} radius={0.06} position={[0, 0.5 + (h - 0.5) / 2, d / 2 - 0.13]} rotation={[-0.12, 0, 0]} material={f} castShadow />
      <RoundedBox args={[0.34, 0.14, 0.34]} radius={0.05} position={[-w / 2 + 0.3, 0.6, -0.05]} rotation={[-0.4, 0.3, 0]} material={pillowMat()} castShadow />
    </group>
  );
}

function Bunk({ def, color }: Props) {
  const [w, h, d] = def.size;
  const f = fabric(color ?? '#7a8b9c');
  const frame = wood('#8f6a48');
  return (
    <group>
      {[0.32, h - 0.45].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <B size={[w, 0.08, d]} pos={[0, 0, 0]} material={frame} />
          <RoundedBox args={[w - 0.04, 0.14, d - 0.04]} radius={0.04} position={[0, 0.11, 0]} material={mattressMat()} castShadow />
          <RoundedBox args={[w - 0.1, 0.04, d * 0.5]} radius={0.02} position={[0, 0.2, d * 0.2]} material={f} castShadow />
          <RoundedBox args={[0.36, 0.09, 0.26]} radius={0.04} position={[0, 0.21, -d / 2 + 0.2]} material={pillowMat()} castShadow />
        </group>
      ))}
      {[-1, 1].map((s) => (
        <B key={s} size={[0.06, h, 0.06]} pos={[s * (w / 2 - 0.03), h / 2, d / 2 - 0.03]} material={frame} />
      ))}
      {[-1, 1].map((s) => (
        <B key={`b${s}`} size={[0.06, h, 0.06]} pos={[s * (w / 2 - 0.03), h / 2, -d / 2 + 0.03]} material={frame} />
      ))}
      {/* merdiven */}
      {[0.35, 0.65, 0.95, 1.25].map((y) => (
        <B key={y} size={[0.02, 0.02, 0.3]} pos={[-w / 2 - 0.02, y, -d / 2 + 0.2]} material={steel()} shadow={false} />
      ))}
    </group>
  );
}

function Kitchen({ def, color }: Props) {
  const [w, h, d] = def.size;
  const carcass = wood(color ?? '#c9a074');
  const top = h;
  return (
    <group>
      <B size={[w, top - 0.14, d - 0.02]} pos={[0, 0.1 + (top - 0.14) / 2, 0.01]} material={carcass} />
      <B size={[w - 0.08, 0.1, d - 0.1]} pos={[0, 0.05, 0.04]} material={darkPlastic()} />
      <B size={[w + 0.02, 0.04, d + 0.02]} pos={[0, top - 0.02, 0]} material={counterMat()} />
      {/* evye */}
      <mesh position={[-w * 0.27, top - 0.06, 0.02]} material={steel()}>
        <cylinderGeometry args={[0.16, 0.14, 0.13, 24]} />
      </mesh>
      <mesh position={[-w * 0.27, top + 0.13, d / 2 - 0.1]} material={steel()}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 10]} />
      </mesh>
      <mesh position={[-w * 0.27, top + 0.26, d / 2 - 0.19]} rotation={[Math.PI / 2, 0, 0]} material={steel()}>
        <cylinderGeometry args={[0.011, 0.011, 0.2, 10]} />
      </mesh>
      {/* ocak */}
      <B size={[Math.min(0.46, w * 0.42), 0.012, Math.min(0.38, d * 0.65)]} pos={[w * 0.25, top + 0.006, 0]} material={mat('#0c0d10', { roughness: 0.2 })} shadow={false} />
      {[-0.1, 0.1].map((dx) => (
        <mesh key={dx} position={[w * 0.25 + dx, top + 0.018, 0]} rotation={[Math.PI / 2, 0, 0]} material={steel()}>
          <torusGeometry args={[0.055, 0.008, 8, 20]} />
        </mesh>
      ))}
      {/* kapaklar / çekmece */}
      <Door x={0} y={top - 0.22} w={w - 0.04} h={0.13} z={-d / 2 + 0.002} material={carcass} />
      <Door x={-w / 4} y={(top - 0.3) / 2 + 0.05} w={w / 2 - 0.03} h={top - 0.42} z={-d / 2 + 0.002} material={carcass} />
      <Door x={w / 4} y={(top - 0.3) / 2 + 0.05} w={w / 2 - 0.03} h={top - 0.42} z={-d / 2 + 0.002} material={carcass} handleSide={-1} />
    </group>
  );
}

function Fridge({ def }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <B size={[w, h, d]} pos={[0, h / 2, 0]} material={mat('#2e3238', { roughness: 0.5 })} />
      <B size={[w - 0.02, h - 0.02, 0.02]} pos={[0, h / 2, -d / 2 - 0.008]} material={mat('#b9bdc3', { roughness: 0.3, metalness: 0.6 })} />
      <B size={[0.02, h * 0.6, 0.025]} pos={[-w / 2 + 0.05, h / 2, -d / 2 - 0.03]} material={steel()} shadow={false} />
      <B size={[0.04, 0.012, 0.004]} pos={[w / 2 - 0.06, h - 0.05, -d / 2 - 0.02]} material={mat('#2e8fd6', { emissive: '#2e8fd6', emissiveIntensity: 1 })} shadow={false} />
    </group>
  );
}

function Cabinet({ def, color }: Props) {
  const [w, h, d] = def.size;
  const carcass = wood(color ?? '#c9a074');
  return (
    <group>
      <B size={[w, h, d]} pos={[0, h / 2, 0]} material={carcass} />
      {def.kind === 'drawers' ? (
        [0.17, 0.45, 0.73].map((y) => (
          <group key={y} position={[0, y * (h / 0.9), -d / 2 - 0.008]}>
            <B size={[w - 0.04, 0.24 * (h / 0.9), 0.016]} pos={[0, 0, 0]} material={carcass} />
            <B size={[0.18, 0.02, 0.02]} pos={[0, 0, -0.02]} material={steel()} shadow={false} />
          </group>
        ))
      ) : def.kind === 'wardrobe' ? (
        <>
          <Door x={-w / 4} y={h / 2} w={w / 2 - 0.03} h={h - 0.06} z={-d / 2 - 0.008} material={carcass} />
          <Door x={w / 4} y={h / 2} w={w / 2 - 0.03} h={h - 0.06} z={-d / 2 - 0.008} material={carcass} handleSide={-1} />
        </>
      ) : (
        <>
          <Door x={-w / 4} y={h / 2} w={w / 2 - 0.03} h={h - 0.08} z={-d / 2 - 0.008} material={carcass} />
          <Door x={w / 4} y={h / 2} w={w / 2 - 0.03} h={h - 0.08} z={-d / 2 - 0.008} material={carcass} handleSide={-1} />
          <B size={[w + 0.02, 0.03, d + 0.02]} pos={[0, h - 0.015, 0]} material={counterMat()} />
        </>
      )}
    </group>
  );
}

/** Duvar modülü: yerel z 0 = kaplama yüzü, +z iç mekâna */
function Overhead({ def, color }: Props) {
  const [w, h, d] = def.size;
  const carcass = wood(color ?? '#c9a074');
  const n = w > 1.3 ? 3 : 2;
  return (
    <group>
      <B size={[w, h, d]} pos={[0, 0, d / 2]} material={carcass} />
      {Array.from({ length: n }).map((_, i) => {
        const dw = w / n;
        return (
          <group key={i} position={[-w / 2 + dw / 2 + i * dw, 0, d + 0.008]}>
            <B size={[dw - 0.02, h - 0.03, 0.016]} pos={[0, 0, 0]} material={carcass} />
            <B size={[0.14, 0.02, 0.02]} pos={[0, -h / 2 + 0.05, 0.02]} material={steel()} shadow={false} />
          </group>
        );
      })}
    </group>
  );
}

function Shelf({ def, color }: Props) {
  const [w, , d] = def.size;
  return (
    <group>
      <B size={[w, 0.03, d]} pos={[0, 0, d / 2]} material={wood(color ?? '#c9a074')} />
      {[-1, 1].map((s) => (
        <B key={s} size={[0.02, 0.12, d - 0.04]} pos={[s * (w / 2 - 0.08), -0.075, d / 2 - 0.02]} material={darkPlastic()} shadow={false} />
      ))}
    </group>
  );
}

function WetBath({ def, color }: Props) {
  const [w, h, d] = def.size;
  const wall = laminate(color ?? '#f1efe9');
  return (
    <group>
      <B size={[w, 0.06, d]} pos={[0, 0.03, 0]} material={white()} />
      <B size={[0.03, h, d]} pos={[-w / 2 + 0.015, h / 2, 0]} material={wall} />
      <B size={[0.03, h, d]} pos={[w / 2 - 0.015, h / 2, 0]} material={wall} />
      <B size={[w, h, 0.03]} pos={[0, h / 2, d / 2 - 0.015]} material={wall} />
      {/* kapı: buzlu cam sürgülü */}
      <B size={[w * 0.55, h - 0.1, 0.012]} pos={[w * 0.2, h / 2, -d / 2 + 0.01]} material={frosted()} shadow={false} />
      <B size={[w * 0.45, h - 0.1, 0.012]} pos={[-w * 0.27, h / 2, -d / 2 + 0.03]} material={frosted()} shadow={false} />
      <B size={[w, 0.05, 0.05]} pos={[0, h - 0.025, -d / 2 + 0.02]} material={wall} />
      {/* tuvalet */}
      <RoundedBox args={[0.38, 0.4, 0.5]} radius={0.06} position={[w / 2 - 0.25, 0.26, d / 2 - 0.3]} material={white()} castShadow />
      <RoundedBox args={[0.36, 0.04, 0.42]} radius={0.05} position={[w / 2 - 0.25, 0.48, d / 2 - 0.32]} material={white()} castShadow />
      {/* duş başlığı */}
      <mesh position={[-w / 2 + 0.2, h - 0.25, d / 2 - 0.06]} rotation={[Math.PI / 2, 0, 0]} material={steel()}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
      </mesh>
      <mesh position={[-w / 2 + 0.2, h - 0.6, d / 2 - 0.03]} material={steel()}>
        <cylinderGeometry args={[0.01, 0.01, 0.7, 8]} />
      </mesh>
      <mesh position={[-w / 2 + 0.2, 1.0, d / 2 - 0.05]} material={steel()}>
        <boxGeometry args={[0.12, 0.05, 0.05]} />
      </mesh>
    </group>
  );
}

function Toilet({ def }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <RoundedBox args={[w, h - 0.08, d]} radius={0.05} position={[0, (h - 0.08) / 2, 0]} material={white()} castShadow />
      <RoundedBox args={[w - 0.02, 0.04, d - 0.08]} radius={0.04} position={[0, h - 0.06, -0.02]} material={mat('#e9eaea', { roughness: 0.3 })} castShadow />
      <B size={[w - 0.1, 0.04, 0.1]} pos={[0, h - 0.02, d / 2 - 0.06]} material={white()} />
    </group>
  );
}

function Shower({ def }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <B size={[w, 0.05, d]} pos={[0, 0.025, 0]} material={white()} />
      <B size={[w - 0.08, 0.02, d - 0.08]} pos={[0, 0.045, 0]} material={mat('#dfe3e6', { roughness: 0.2 })} />
      <B size={[w, 0.02, 0.02]} pos={[0, h - 0.02, -d / 2 + 0.01]} material={steel()} shadow={false} />
      <B size={[0.02, 0.02, d]} pos={[-w / 2 + 0.01, h - 0.02, 0]} material={steel()} shadow={false} />
      <B size={[w - 0.02, h - 0.12, 0.006]} pos={[0.01, h / 2, -d / 2 + 0.03]} material={frosted()} shadow={false} />
      <B size={[0.006, h - 0.12, d - 0.02]} pos={[-w / 2 + 0.03, h / 2, 0]} material={frosted()} shadow={false} />
      <mesh position={[w / 2 - 0.15, h - 0.2, d / 2 - 0.05]} rotation={[Math.PI / 2, 0, 0]} material={steel()}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
      </mesh>
    </group>
  );
}

function Table({ def, color }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <RoundedBox args={[w, 0.03, d]} radius={0.015} position={[0, h - 0.015, 0]} material={wood(color ?? '#c9a074')} castShadow />
      <mesh position={[0, h / 2, 0]} material={steel()}>
        <cylinderGeometry args={[0.03, 0.03, h - 0.03, 12]} />
      </mesh>
      <mesh position={[0, 0.01, 0]} material={steel()}>
        <cylinderGeometry args={[0.2, 0.22, 0.02, 20]} />
      </mesh>
    </group>
  );
}

function Bench({ def, color }: Props) {
  const [w, h, d] = def.size;
  const f = fabric(color ?? '#c8b79a');
  return (
    <group>
      <B size={[w, 0.4, d]} pos={[0, 0.2, 0]} material={wood('#b98d63')} />
      <RoundedBox args={[w - 0.02, 0.1, d - 0.02]} radius={0.04} position={[0, 0.45, 0]} material={f} castShadow />
      <RoundedBox args={[w - 0.02, h - 0.5, 0.12]} radius={0.04} position={[0, 0.5 + (h - 0.5) / 2, d / 2 - 0.07]} rotation={[-0.1, 0, 0]} material={f} castShadow />
    </group>
  );
}

function Seat({ def, color }: Props) {
  const [w, h, d] = def.size;
  const f = fabric(color ?? '#5e6b53');
  return (
    <group>
      <B size={[0.3, 0.32, 0.3]} pos={[0, 0.16, 0]} material={darkPlastic()} />
      <RoundedBox args={[w, 0.14, d]} radius={0.05} position={[0, 0.4, 0]} material={f} castShadow />
      <RoundedBox args={[w, h - 0.62, 0.14]} radius={0.05} position={[0, 0.47 + (h - 0.62) / 2, d / 2 - 0.08]} rotation={[-0.15, 0, 0]} material={f} castShadow />
      <RoundedBox args={[0.26, 0.16, 0.1]} radius={0.04} position={[0, h - 0.02, d / 2 - 0.12]} material={f} castShadow />
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.06, 0.05, 0.36]} radius={0.02} position={[s * (w / 2 - 0.03), 0.62, 0]} material={darkPlastic()} />
      ))}
    </group>
  );
}

/** Pencere: yerel z 0 kaplama yüzü, -z duvar kalınlığı içinde */
function Window({ def, mt }: Props) {
  const [w, h] = def.size;
  const t = mt.wallT;
  const opening = def.kind === 'window-opening';
  const frame = mat('#1a1c1f', { roughness: 0.5 });
  const inner = white();
  const fw = 0.035;
  return (
    <group>
      {/* reveal çerçevesi */}
      <B size={[w, fw, t + 0.02]} pos={[0, h / 2 - fw / 2, -t / 2 + 0.01]} material={inner} shadow={false} />
      <B size={[w, fw, t + 0.02]} pos={[0, -h / 2 + fw / 2, -t / 2 + 0.01]} material={inner} shadow={false} />
      <B size={[fw, h, t + 0.02]} pos={[w / 2 - fw / 2, 0, -t / 2 + 0.01]} material={inner} shadow={false} />
      <B size={[fw, h, t + 0.02]} pos={[-w / 2 + fw / 2, 0, -t / 2 + 0.01]} material={inner} shadow={false} />
      {/* dış siyah çerçeve */}
      <B size={[w + 0.08, 0.05, 0.012]} pos={[0, h / 2 + 0.015, -t - 0.004]} material={frame} shadow={false} />
      <B size={[w + 0.08, 0.05, 0.012]} pos={[0, -h / 2 - 0.015, -t - 0.004]} material={frame} shadow={false} />
      <B size={[0.05, h + 0.08, 0.012]} pos={[w / 2 + 0.015, 0, -t - 0.004]} material={frame} shadow={false} />
      <B size={[0.05, h + 0.08, 0.012]} pos={[-w / 2 - 0.015, 0, -t - 0.004]} material={frame} shadow={false} />
      {/* cam */}
      {opening ? (
        <group position={[0, h / 2, -t - 0.01]} rotation={[0.28, 0, 0]}>
          <B size={[w + 0.02, h + 0.02, 0.01]} pos={[0, -h / 2, 0]} material={glassInterior()} shadow={false} />
        </group>
      ) : (
        <B size={[w - fw, h - fw, 0.008]} pos={[0, 0, -t / 2]} material={glassInterior()} shadow={false} />
      )}
      {/* iç karartma perde kutusu */}
      <B size={[w + 0.06, 0.05, 0.05]} pos={[0, h / 2 + 0.035, 0.02]} material={inner} shadow={false} />
      {opening && <B size={[0.1, 0.02, 0.03]} pos={[0, -h / 2 + 0.05, -t + 0.02]} material={darkPlastic()} shadow={false} />}
    </group>
  );
}

/** Seçilebilir görünmez kutu (kapı camları için) */
function Ghost({ def }: Props) {
  const [w, h] = def.size;
  return (
    <mesh position={[0, 0, -0.03]}>
      <boxGeometry args={[w, h, 0.06]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/** Çatı modülü: yerel y 0 çatı üst yüzü */
function Vent({ def, mt }: Props) {
  const [w, , d] = def.size;
  const rt = mt.roofT;
  return (
    <group>
      <B size={[w + 0.04, 0.03, d + 0.04]} pos={[0, 0.015, 0]} material={white()} shadow={false} />
      <group position={[0, 0.03, d / 2]} rotation={[-0.45, 0, 0]}>
        <B size={[w + 0.02, 0.035, d + 0.02]} pos={[0, 0.02, -d / 2]} material={white()} />
      </group>
      <mesh position={[0, -rt / 2, 0]} material={darkPlastic()}>
        <cylinderGeometry args={[Math.min(w, d) * 0.38, Math.min(w, d) * 0.38, 0.03, 20]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <B key={i} size={[Math.min(w, d) * 0.32, 0.004, 0.05]} pos={[0, -rt / 2 + 0.02, 0]} rot={[0, (i * Math.PI * 2) / 5, 0.3]} material={mat('#e6e6e6', { roughness: 0.4 })} shadow={false} />
      ))}
      <B size={[w + 0.06, 0.02, d + 0.06]} pos={[0, -rt - 0.01, 0]} material={white()} shadow={false} />
    </group>
  );
}

function RoofWindow({ def, mt }: Props) {
  const [w, , d] = def.size;
  const rt = mt.roofT;
  return (
    <group>
      <B size={[w + 0.06, 0.03, d + 0.06]} pos={[0, 0.015, 0]} material={white()} shadow={false} />
      <group position={[0, 0.03, d / 2]} rotation={[-0.35, 0, 0]}>
        <B size={[w + 0.04, 0.03, d + 0.04]} pos={[0, 0.015, -d / 2]} material={mat('#e8e8e8', { roughness: 0.4 })} />
        <B size={[w - 0.02, 0.012, d - 0.02]} pos={[0, 0.03, -d / 2]} material={glassInterior()} shadow={false} />
      </group>
      <B size={[w + 0.06, 0.02, d + 0.06]} pos={[0, -rt - 0.01, 0]} material={white()} shadow={false} />
      <B size={[w - 0.02, 0.006, d - 0.02]} pos={[0, -rt / 2, 0]} material={frosted()} shadow={false} />
    </group>
  );
}

function Solar({ def }: Props) {
  const [w, h, d] = def.size;
  const mats = useMemo(() => {
    const alu = new THREE.MeshStandardMaterial({ color: '#c9ccd0', roughness: 0.35, metalness: 0.8 });
    const top = new THREE.MeshStandardMaterial({ map: solarTexture(), roughness: 0.15, metalness: 0.3 });
    return [alu, alu, top, alu, alu, alu];
  }, []);
  const count = d > 1.2 ? 2 : 1;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} material={mats} position={[0, 0.05 + h / 2, -d / 2 + (d / count) / 2 + (i * d) / count]} castShadow>
          <boxGeometry args={[w, h, d / count - 0.03]} />
        </mesh>
      ))}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <B key={`${sx}${sz}`} size={[0.08, 0.05, 0.08]} pos={[sx * (w / 2 - 0.1), 0.025, sz * (d / 2 - 0.1)]} material={darkPlastic()} shadow={false} />
      )))}
    </group>
  );
}

function AC({ def, mt }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={0.06} position={[0, h / 2, 0]} material={mat('#eceeee', { roughness: 0.45 })} castShadow />
      <B size={[w * 0.5, 0.004, d * 0.6]} pos={[0, h + 0.002, 0]} material={darkPlastic()} shadow={false} />
      <B size={[0.6, 0.06, 0.5]} pos={[0, -mt.roofT - 0.03, 0]} material={white()} shadow={false} />
      <B size={[0.5, 0.004, 0.08]} pos={[0, -mt.roofT - 0.062, 0.18]} material={darkPlastic()} shadow={false} />
    </group>
  );
}

function Battery({ def }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <B size={[w, h, d]} pos={[0, h / 2, 0]} material={mat('#1d3a6a', { roughness: 0.5 })} />
      <B size={[w * 0.7, 0.004, d * 0.4]} pos={[0, h + 0.002, 0]} material={mat('#f5c542', { roughness: 0.5 })} shadow={false} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.05), h + 0.015, -d / 2 + 0.05]} material={steel()}>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Heater({ def }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <B size={[w, h, d]} pos={[0, h / 2, 0]} material={mat('#9ea3a8', { roughness: 0.4, metalness: 0.6 })} />
      <mesh position={[w / 2 + 0.04, h / 2, 0]} rotation={[0, 0, Math.PI / 2]} material={darkPlastic()}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
      </mesh>
    </group>
  );
}

function Tank({ def }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <RoundedBox args={[w, h, d]} radius={0.03} position={[0, h / 2, 0]} material={mat('#8fc3e6', { roughness: 0.35, transparent: true, opacity: 0.75 })} castShadow />
      <mesh position={[w / 2 - 0.1, h + 0.015, 0]} material={mat('#2f5f8f', { roughness: 0.5 })}>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 16]} />
      </mesh>
    </group>
  );
}

function Inverter({ def }: Props) {
  const [w, h, d] = def.size;
  return (
    <group>
      <B size={[w, h, d]} pos={[0, 0, d / 2]} material={mat('#2a4a8a', { roughness: 0.5 })} />
      <B size={[0.02, 0.02, 0.004]} pos={[w / 2 - 0.05, h / 2 - 0.05, d + 0.002]} material={mat('#3cff7a', { emissive: '#3cff7a', emissiveIntensity: 1.5 })} shadow={false} />
    </group>
  );
}

/* ---------------- Dış ekipman ---------------- */
function Awning({ mt, vehicle }: Props) {
  const len = Math.min(3.0, mt.cargo.x1 - mt.cargo.x0 + 0.4);
  const x = (mt.cargo.x0 + mt.cargo.x1) / 2 + 0.1;
  const y = vehicle.height - 0.16;
  const z = vehicle.width / 2 + 0.07;
  const reach = 2.0;
  const drop = 0.35;
  const ang = Math.atan2(drop, reach);
  const fabricLen = Math.sqrt(reach * reach + drop * drop);
  return (
    <group position={[x, y, z]}>
      <RoundedBox args={[len, 0.14, 0.14]} radius={0.05} material={mat('#d9dbde', { roughness: 0.4, metalness: 0.5 })} castShadow />
      <group rotation={[ang, 0, 0]}>
        <B size={[len - 0.1, 0.03, fabricLen]} pos={[0, 0, fabricLen / 2]} material={fabric('#ece5d2')} />
        {[-1, 1].map((s) => (
          <B key={s} size={[0.035, 0.035, fabricLen]} pos={[s * (len / 2 - 0.1), -0.03, fabricLen / 2]} material={steel()} shadow={false} />
        ))}
      </group>
      {[-1, 1].map((s) => (
        <B key={`leg${s}`} size={[0.03, y - drop - 0.05, 0.03]} pos={[s * (len / 2 - 0.1), -(y - drop) / 2 - drop, reach]} material={steel()} shadow={false} />
      ))}
    </group>
  );
}

function BikeRack({ mt, vehicle }: Props) {
  const x = mt.xRearBumper - 0.06;
  const y = vehicle.profile.sill + 0.35;
  return (
    <group position={[x, y, 0]}>
      <B size={[0.05, 0.9, 0.9]} pos={[0, 0.45, 0]} material={darkPlastic()} />
      {[-0.22, 0.22].map((z) => (
        <B key={z} size={[0.5, 0.05, 0.08]} pos={[-0.25, 0.02, z]} material={steel()} />
      ))}
      {[-0.22, 0.22].map((z, i) => (
        <group key={`bike${i}`} position={[-0.28, 0.32, z]}>
          {[-0.45, 0.45].map((dx) => (
            <mesh key={dx} position={[0, 0, dx]} material={darkPlastic()}>
              <torusGeometry args={[0.3, 0.02, 8, 24]} />
            </mesh>
          ))}
          <B size={[0.03, 0.03, 0.9]} pos={[0, 0.05, 0]} rot={[0, 0, 0]} material={mat(i ? '#c0392b' : '#2980b9', { roughness: 0.4, metalness: 0.4 })} shadow={false} />
          <B size={[0.03, 0.5, 0.03]} pos={[0, 0.3, 0.1]} rot={[0.4, 0, 0]} material={mat(i ? '#c0392b' : '#2980b9', { roughness: 0.4, metalness: 0.4 })} shadow={false} />
          <B size={[0.03, 0.5, 0.03]} pos={[0, 0.3, -0.25]} rot={[-0.3, 0, 0]} material={mat(i ? '#c0392b' : '#2980b9', { roughness: 0.4, metalness: 0.4 })} shadow={false} />
          <B size={[0.4, 0.03, 0.03]} pos={[0, 0.58, -0.32]} material={darkPlastic()} shadow={false} />
        </group>
      ))}
    </group>
  );
}

function Ladder({ mt, vehicle }: Props) {
  const x = mt.xRearBumper - 0.08;
  const z = -(vehicle.width / 2 - 0.3);
  const y0 = vehicle.profile.sill + 0.2;
  const y1 = vehicle.height + 0.02;
  const h = y1 - y0;
  const rungs = Math.floor(h / 0.28);
  return (
    <group position={[x, y0, z]}>
      {[-1, 1].map((s) => (
        <B key={s} size={[0.03, h, 0.03]} pos={[0, h / 2, s * 0.17]} material={steel()} shadow={false} />
      ))}
      {Array.from({ length: rungs }).map((_, i) => (
        <B key={i} size={[0.03, 0.025, 0.34]} pos={[0, 0.18 + i * 0.28, 0]} material={steel()} shadow={false} />
      ))}
      {[0.3, h - 0.3].map((yy) => (
        <B key={yy} size={[0.12, 0.03, 0.4]} pos={[0.06, yy, 0]} material={darkPlastic()} shadow={false} />
      ))}
    </group>
  );
}

function RoofRack({ mt, vehicle }: Props) {
  const x0 = Math.max(mt.roof.x0 + 0.3, mt.cargo.x0 + 0.1);
  const x1 = mt.roof.x1 - 0.3;
  const len = x1 - x0;
  const zc = vehicle.width / 2 - 0.18;
  const y = vehicle.height + 0.09;
  const bars = Math.max(2, Math.floor(len / 0.7));
  const alu = mat('#b8bcc2', { roughness: 0.35, metalness: 0.8 });
  return (
    <group position={[(x0 + x1) / 2, y, 0]}>
      {[-1, 1].map((s) => (
        <B key={s} size={[len, 0.05, 0.05]} pos={[0, 0, s * zc]} material={alu} />
      ))}
      {Array.from({ length: bars }).map((_, i) => (
        <B key={i} size={[0.04, 0.04, zc * 2]} pos={[-len / 2 + 0.15 + (i * (len - 0.3)) / (bars - 1), 0, 0]} material={alu} />
      ))}
      {[-1, 1].flatMap((s) => [-len / 2 + 0.15, len / 2 - 0.15].map((dx) => (
        <B key={`${s}${dx}`} size={[0.08, 0.1, 0.06]} pos={[dx, -0.06, s * zc]} material={darkPlastic()} shadow={false} />
      )))}
    </group>
  );
}

export function ModuleVisual(props: Props) {
  const { def } = props;
  switch (def.kind) {
    case 'bed': return <Bed {...props} />;
    case 'sofa': return <Sofa {...props} />;
    case 'bunk': return <Bunk {...props} />;
    case 'kitchen': return <Kitchen {...props} />;
    case 'fridge': return <Fridge {...props} />;
    case 'cabinet':
    case 'wardrobe':
    case 'drawers': return <Cabinet {...props} />;
    case 'overhead': return <Overhead {...props} />;
    case 'shelf': return <Shelf {...props} />;
    case 'wetbath': return <WetBath {...props} />;
    case 'toilet': return <Toilet {...props} />;
    case 'shower': return <Shower {...props} />;
    case 'table': return <Table {...props} />;
    case 'bench': return <Bench {...props} />;
    case 'seat': return <Seat {...props} />;
    case 'window':
    case 'window-opening': return <Window {...props} />;
    case 'window-rear':
    case 'window-slider': return <Ghost {...props} />;
    case 'vent': return <Vent {...props} />;
    case 'roofwindow': return <RoofWindow {...props} />;
    case 'solar': return <Solar {...props} />;
    case 'ac': return <AC {...props} />;
    case 'battery': return <Battery {...props} />;
    case 'heater': return <Heater {...props} />;
    case 'tank': return <Tank {...props} />;
    case 'inverter': return <Inverter {...props} />;
    case 'awning': return <Awning {...props} />;
    case 'bikerack': return <BikeRack {...props} />;
    case 'ladder': return <Ladder {...props} />;
    case 'rack': return <RoofRack {...props} />;
    default: {
      const [w, h, d] = def.size;
      return <B size={[w, h, d]} pos={[0, h / 2, 0]} material={wood()} />;
    }
  }
}

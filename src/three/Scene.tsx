import * as THREE from 'three';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles, Stars } from '@react-three/drei';
import { useStore, useVehicleId } from '../store';
import { getVehicle } from '../data/vehicles';
import { vanMetrics } from '../utils/metrics';
import { Van } from './Van';
import { PlacedModules } from './PlacedModule';
import { CameraRig } from './CameraRig';
import { asphaltTexture } from './textures';
import { isMobile } from './shared';

function Ground({ night }: { night: boolean }) {
  const mobile = useMemo(() => isMobile(), []);
  const tex = useMemo(() => asphaltTexture(), []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0, 0]} receiveShadow>
        <circleGeometry args={[42, 72]} />
        {mobile ? (
          <meshStandardMaterial color="#0f1318" roughness={0.9} metalness={0.2} map={tex} />
        ) : (
          <MeshReflectorMaterial
            blur={[420, 120]}
            resolution={1024}
            mixBlur={1}
            mixStrength={night ? 32 : 18}
            roughness={0.85}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#10141a"
            metalness={0.55}
            mirror={0.45}
          />
        )}
      </mesh>
      <gridHelper args={[80, 80, '#243040', '#161d27']} position={[2.5, 0.003, 0]} />
    </group>
  );
}

function Lights({ night }: { night: boolean }) {
  const dir = useRef<THREE.DirectionalLight>(null);
  return (
    <>
      <hemisphereLight args={['#dfe9ff', '#1d2129', night ? 0.18 : 0.55]} />
      <directionalLight
        ref={dir}
        position={[7, 11, 5]}
        intensity={night ? 0.25 : 2.4}
        color={night ? '#9fb4ff' : '#fff4e6'}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.00035}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-8, 5, -7]} intensity={night ? 0.1 : 0.7} color="#cfe0ff" />
      <spotLight position={[3, 9, -5]} angle={0.5} penumbra={0.8} intensity={night ? 6 : 10} color="#ffe9c9" distance={30} />
    </>
  );
}

function Screenshot() {
  const seq = useStore((s) => s.screenshotSeq);
  const notify = useStore((s) => s.notify);
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (!seq) return;
    gl.render(scene, camera);
    const url = gl.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `karavan-tasarim-${Date.now()}.png`;
    a.click();
    notify('Ekran görüntüsü indirildi', 'ok');
  }, [seq, gl, scene, camera, notify]);
  return null;
}

function LandingFx() {
  const screen = useStore((s) => s.screen);
  const vehicle = getVehicle(useVehicleId());
  const mt = useMemo(() => vanMetrics(vehicle), [vehicle]);
  if (screen === 'configurator') return null;
  return <Sparkles count={90} scale={[13, 4.5, 9]} size={2.6} speed={0.25} position={[mt.center.x, 2.2, 0]} color="#ffd36b" opacity={0.7} />;
}

export function Scene() {
  const night = useStore((s) => s.view.night);
  const setSelected = useStore((s) => s.setSelected);
  const bg = night ? '#04060b' : '#0b0f14';
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.05, far: 220, position: [9, 3.2, 10] }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: night ? 0.85 : 1.05,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
      onPointerMissed={(e) => {
        if (e.type === 'click') setSelected(null);
      }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 22, 70]} />
      <Suspense fallback={null}>
        <Lights night={night} />
        <Environment resolution={256} environmentIntensity={night ? 0.25 : 0.9}>
          <Lightformer intensity={3} rotation-x={Math.PI / 2} position={[0, 6, 0]} scale={[12, 12, 1]} color="#ffffff" />
          <Lightformer intensity={1.5} rotation-y={Math.PI / 2} position={[-8, 2, 0]} scale={[8, 3, 1]} color="#dfe9ff" />
          <Lightformer intensity={1.5} rotation-y={-Math.PI / 2} position={[8, 2, 0]} scale={[8, 3, 1]} color="#ffe6c9" />
          <Lightformer intensity={0.8} position={[0, 2, -9]} scale={[10, 2, 1]} color="#ffffff" />
        </Environment>
        {night && <Stars radius={90} depth={40} count={2200} factor={3.2} fade speed={0.4} />}
        <Ground night={night} />
        <Van />
        <PlacedModules />
        <LandingFx />
        <CameraRig />
        <Screenshot />
      </Suspense>
    </Canvas>
  );
}

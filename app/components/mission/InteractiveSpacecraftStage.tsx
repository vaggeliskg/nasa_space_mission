'use client';

import '@react-three/fiber';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { sound } from '../../lib/sound';

export type SpacecraftPartSlot = 'power' | 'comm' | 'adcs' | 'payload' | 'launcher';

interface Hardpoint {
  slot: SpacecraftPartSlot;
  code: string;
  label: string;
  position: [number, number, number];
}

const HARDPOINTS: Hardpoint[] = [
  { slot: 'power', code: 'HP-01', label: 'SOLAR ARRAYS', position: [1.3, 0.15, 0] },
  { slot: 'comm', code: 'HP-02', label: 'COMMS DISH', position: [0, 0.95, 0.3] },
  { slot: 'adcs', code: 'HP-03', label: 'ADCS / AVIONICS', position: [0, 0.05, 0.85] },
  { slot: 'payload', code: 'HP-04', label: 'PAYLOAD BAY', position: [-0.95, -0.2, 0.4] },
  { slot: 'launcher', code: 'HP-05', label: 'BOOSTER STAGE', position: [0, -0.95, -0.35] },
];

interface InteractiveSpacecraftStageProps {
  activeSlot: SpacecraftPartSlot | null;
  onSelectSlot: (slot: SpacecraftPartSlot | null) => void;
  equippedLabels: Record<SpacecraftPartSlot, string>;
  configuredSlots: Set<SpacecraftPartSlot>;
}

function SpacecraftHull({
  activeSlot,
  onSelectSlot,
  equippedLabels,
  configuredSlots,
}: InteractiveSpacecraftStageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/spaceship.glb');

  const normalizedShip = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            if (!mat.metalnessMap) mat.metalness = 0.35;
            if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.needsUpdate = true;
          }
        });
      }
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    cloned.scale.setScalar(3.1 / maxDim);

    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    cloned.position.sub(center);

    return cloned;
  }, [scene]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.4) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={normalizedShip}
        onClick={() => onSelectSlot(null)}
      />

      {HARDPOINTS.map((hp) => {
        const isSelected = activeSlot === hp.slot;
        const isConfigured = configuredSlots.has(hp.slot);
        const color = isSelected || isConfigured ? '#33ff33' : '#ffb000';


        return (
          <group key={hp.slot} position={hp.position}>
            {/* Compact 3D Hardpoint Node */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onSelectSlot(isSelected ? null : hp.slot);
              }}
              onPointerOver={() => {
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[isSelected ? 0.09 : 0.065, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>

            {/* Target Reticle Ring */}
            <mesh>
              <ringGeometry args={[isSelected ? 0.12 : 0.09, isSelected ? 0.16 : 0.12, 24]} />
              <meshBasicMaterial color={color} side={THREE.DoubleSide} />
            </mesh>

            {/* Compact Pill When Closed -> Expands Text Only When Pressed */}
            <Html key={hp.slot} distanceFactor={7.5} zIndexRange={[50, 0]} center>
                <button
                    type="button"
                    onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onSelectSlot(isSelected ? null : hp.slot);
                    }}
                    className={`border font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                        ? 'px-2 py-1 bg-[#041404]/95 border-[#33ff33] text-[#33ff33] shadow-[0_0_12px_rgba(51,255,51,0.5)] text-left'
                        : 'px-1.5 py-0.5 bg-[#030803]/90 border-[#ffb000] text-[#ffb000] hover:border-[#33ff33] hover:text-[#33ff33] text-[8px] font-bold tracking-wider'
                    }`}
                >
                    {!isSelected ? (
                    <span>{isConfigured ? `✓ ${hp.code}` : hp.code}</span>
                    ) : (
                    <>
                        <div className="text-[9px] font-bold tracking-wider">
                        [{hp.code}] {hp.label}
                        </div>
                        <div className="text-[8px] text-[#22bb22] max-w-36 truncate">
                        {equippedLabels[hp.slot]}
                        </div>
                    </>
                    )}
                </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/spaceship.glb');

export default function InteractiveSpacecraftStage(props: InteractiveSpacecraftStageProps) {
  return (
    <div className="relative z-20 w-full h-125 border-2 border-[#1a881a] bg-[#020602] overflow-hidden">
      <div className="absolute top-2.5 left-3 right-3 z-10 flex justify-between text-[10px] tracking-widest text-[#1a881a] pointer-events-none">
        <span>VAB HOLOGRAPHIC BAY // CLICK NODE TO INSPECT</span>
        <span className="text-[#33ff33]">[DRAG: ROTATE HULL]</span>
      </div>

      <Canvas
        camera={{ position: [0, 1.1, 4.7], fov: 42 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <Environment preset="city" environmentIntensity={0.45} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 6, 4]} intensity={2.4} color="#fffdf5" />
        <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#33ff33" />

        <Suspense fallback={null}>
          <SpacecraftHull {...props} />
        </Suspense>

        <OrbitControls enablePan={false} minDistance={2.8} maxDistance={7.5} />
      </Canvas>
    </div>
  );
}
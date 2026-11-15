'use client';

import '@react-three/fiber';
import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { sound } from '../../lib/sound';

export type SpacecraftPartSlot = 'power' | 'comm' | 'propulsion' | 'adcs' | 'systems';

interface Hardpoint {
  slot: SpacecraftPartSlot;
  code: string;
  label: string;
  position: [number, number, number];
}

const HARDPOINTS: Hardpoint[] = [
  { slot: 'power', code: 'HP-01', label: 'POWER (BAT / SOLAR)', position: [1.3, 0.15, 0] },
  { slot: 'comm', code: 'HP-02', label: 'COMMUNICATIONS', position: [0, 0.95, 0.3] },
  { slot: 'propulsion', code: 'HP-03', label: 'PROPULSION & LV', position: [0, -0.95, -0.35] },
  { slot: 'adcs', code: 'HP-04', label: 'ADCS & PAYLOADS', position: [0, 0.05, 0.85] },
  { slot: 'systems', code: 'HP-05', label: 'BUS & SURVIVABILITY', position: [-0.95, -0.2, 0.4] },
];

interface InteractiveSpacecraftStageProps {
  activeSlot: SpacecraftPartSlot | null;
  onSelectSlot: (slot: SpacecraftPartSlot | null) => void;
  equippedLabels: Record<SpacecraftPartSlot, string>;
  configuredSlots: Set<SpacecraftPartSlot>;
  showRocketPreview?: boolean;
  rocketLabel?: string;
}

interface SpacecraftHullProps extends InteractiveSpacecraftStageProps {
  portal: React.RefObject<HTMLDivElement>;
}

function normalizeModel(scene: THREE.Object3D, targetSize: number) {
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
  cloned.scale.setScalar(targetSize / maxDim);

  const scaledBox = new THREE.Box3().setFromObject(cloned);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  cloned.position.sub(center);

  return cloned;
}

function SpacecraftHull({
  activeSlot,
  onSelectSlot,
  equippedLabels,
  configuredSlots,
  showRocketPreview = false,
  portal,
}: SpacecraftHullProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene: shipScene } = useGLTF('/models/spaceship.glb');
  const { scene: rocketScene } = useGLTF('/models/falcon_9_spacex.glb');

  const normalizedShip = useMemo(() => normalizeModel(shipScene, 3.1), [shipScene]);
  const normalizedRocket = useMemo(() => normalizeModel(rocketScene, 3.5), [rocketScene]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 1.4) * 0.04;
    if (showRocketPreview) {
      groupRef.current.rotation.y += delta * 0.35;
    } else {
      groupRef.current.rotation.y = 0;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={showRocketPreview ? normalizedRocket : normalizedShip}
        onClick={() => {
          if (!showRocketPreview) onSelectSlot(null);
        }}
      />

      {!showRocketPreview &&
        HARDPOINTS.map((hp) => {
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
              <Html
                key={hp.slot}
                portal={portal}
                distanceFactor={7.5}
                zIndexRange={[50, 0]}
                center
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onSelectSlot(isSelected ? null : hp.slot);
                  }}
                  className={`pointer-events-auto border font-mono whitespace-nowrap transition-all cursor-pointer ${
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
useGLTF.preload('/models/falcon_9_spacex.glb');

export default function InteractiveSpacecraftStage({
  activeSlot,
  onSelectSlot,
  equippedLabels,
  configuredSlots,
  showRocketPreview = false,
  rocketLabel,
}: InteractiveSpacecraftStageProps) {
  const portalRef = useRef<HTMLDivElement>(null!);

  return (
    <div className="relative w-full h-115 sm:h-135 border-2 border-[#1a881a] bg-[#020602] overflow-hidden">
      {/* Dedicated DOM portal target so Drei <Html> never unmounts synchronously inside R3F */}
      <div ref={portalRef} className="pointer-events-none" />

      {/* Rocket Inspection Banner when viewing Launch Vehicle */}
      {showRocketPreview && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap justify-between items-center gap-2 pointer-events-none">
          <div className="font-mono text-[11px] bg-[#030903]/90 border border-amber-400/70 px-3 py-1.5">
            <div className="text-amber-400 font-bold tracking-widest">
              LAUNCH VEHICLE INSPECTION // {rocketLabel?.toUpperCase() || 'BOOSTER STAGE'}
            </div>
            <div className="text-[10px] text-[#28d828]">
              EXIT LAUNCH VEHICLE TAB TO RETURN TO SPACECRAFT HARDPOINTS
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelectSlot(null);
            }}
            className="pointer-events-auto px-2.5 py-1 border border-[#33ff33] bg-[#030903]/90 text-[#33ff33] hover:bg-[#33ff33]/20 text-[10px] font-bold tracking-wider cursor-pointer"
          >
            ◄ BACK TO SPACECRAFT
          </button>
        </div>
      )}

      <Canvas camera={{ position: [0, 1.4, 5.2], fov: 45 }}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 6, 4]} intensity={2} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <SpacecraftHull
            activeSlot={activeSlot}
            onSelectSlot={onSelectSlot}
            equippedLabels={equippedLabels}
            configuredSlots={configuredSlots}
            showRocketPreview={showRocketPreview}
            portal={portalRef}
          />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={3} maxDistance={9} />
      </Canvas>
    </div>
  );
}
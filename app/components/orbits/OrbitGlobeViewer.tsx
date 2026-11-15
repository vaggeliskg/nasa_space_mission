'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ORBIT_REGIMES, OrbitRegime, OrbitRegimeId } from '../../data/orbitData';
import { sound } from '../../lib/sound';

interface OrbitGlobeViewerProps {
  selectedId: OrbitRegimeId | null;
  onSelect: (regime: OrbitRegime) => void;
  regimes?: OrbitRegime[];
}

function EarthCore() {
  const { scene } = useGLTF('/models/Earth.glb');
  const earthRef = useRef<THREE.Group>(null);

  const normalizedEarth = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.4 / maxDim;
    clone.scale.setScalar(scale);

    const center = new THREE.Vector3();
    box.getCenter(center);
    clone.position.sub(center.multiplyScalar(scale));
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={earthRef}>
      <primitive object={normalizedEarth} />
    </group>
  );
}

function OrbitRingAndMarker({
  regime,
  isSelected,
  onSelect,
  portal,
}: {
  regime: OrbitRegime;
  isSelected: boolean;
  onSelect: (regime: OrbitRegime) => void;
  portal: React.RefObject<HTMLDivElement>;
}) {
  const markerRef = useRef<THREE.Mesh>(null);
  const incRad = THREE.MathUtils.degToRad(regime.inclinationDeg);

  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * regime.visualRadius;
      const z = Math.sin(theta) * regime.visualRadius;
      const y = Math.sin(theta) * Math.sin(incRad) * regime.visualRadius;
      pts.push([x, y, z]);
    }
    return pts;
  }, [regime.visualRadius, incRad]);

  useFrame(({ clock }) => {
    if (!markerRef.current) return;
    const t = clock.getElapsedTime();

    if (regime.id === 'L2') {
      const haloAngle = t * 1.4;
      markerRef.current.position.set(
        regime.visualRadius,
        Math.sin(haloAngle) * 0.45,
        Math.cos(haloAngle) * 0.45
      );
    } else {
      const speed = regime.id === 'LEO' ? 0.9 : 0.12;
      const angle = t * speed;
      markerRef.current.position.set(
        Math.cos(angle) * regime.visualRadius,
        Math.sin(angle) * Math.sin(incRad) * regime.visualRadius,
        Math.sin(angle) * regime.visualRadius
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    sound.playClick();
    onSelect(regime);
  };

  return (
    <group>
      <Line
        points={points}
        color={isSelected ? '#ffffff' : regime.color}
        lineWidth={isSelected ? 3 : 1.5}
        dashed={regime.id === 'L2'}
        dashSize={0.25}
        gapSize={0.15}
        onClick={handleClick}
      />

      {regime.id === 'L2' && (
        <group position={[regime.visualRadius, 0, 0]} onClick={handleClick}>
          <Line
            points={[
              [-0.25, 0, 0],
              [0.25, 0, 0],
            ]}
            color={regime.color}
            lineWidth={2}
          />
          <Line
            points={[
              [0, -0.25, 0],
              [0, 0.25, 0],
            ]}
            color={regime.color}
            lineWidth={2}
          />
        </group>
      )}

      <mesh ref={markerRef} onClick={handleClick}>
        <sphereGeometry args={[isSelected ? 0.14 : 0.1, 16, 16]} />
        <meshBasicMaterial color={isSelected ? '#ffffff' : regime.color} />

        <Html portal={portal} distanceFactor={12} center zIndexRange={[10, 0]}>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onSelect(regime);
            }}
            style={{
              borderColor: isSelected ? '#ffffff' : regime.color,
              color: isSelected ? '#ffffff' : regime.color,
            }}
            className={`pointer-events-auto px-2 py-0.5 bg-[#030903]/90 border font-mono text-[10px] font-bold tracking-wider whitespace-nowrap cursor-pointer transition-transform hover:scale-110 ${
              isSelected ? 'shadow-[0_0_12px_rgba(255,255,255,0.8)] scale-110' : ''
            }`}
          >
            {regime.name}
          </button>
        </Html>
      </mesh>
    </group>
  );
}

export default function OrbitGlobeViewer({
  selectedId,
  onSelect,
  regimes = ORBIT_REGIMES,
}: OrbitGlobeViewerProps) {
  const portalRef = useRef<HTMLDivElement>(null!);

  return (
    <div className="relative w-full h-115 sm:h-135 border-2 border-[#1a881a] bg-[#020602] overflow-hidden">
      {/* Dedicated DOM portal target so Drei <Html> never unmounts synchronously inside R3F */}
      <div ref={portalRef} className="pointer-events-none" />

      {/* Top-left CRT HUD overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none font-mono text-[11px] text-[#33ff33] bg-[#030903]/85 border border-[#144414] px-3 py-1.5">
        <div className="font-bold tracking-widest">ORBITAL TRAJECTORY VISUALIZER</div>
        <div className="text-[#1a881a] text-[10px]">
          CLICK ANY ORBITAL NODE OR RING TO INSPECT REGIME // DRAG TO ROTATE
        </div>
      </div>

      {/* Bottom quick-select legend pills */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2 justify-center sm:justify-start">
        {regimes.map((regime) => {
          const active = selectedId === regime.id;
          return (
            <button
              key={regime.id}
              type="button"
              onClick={() => {
                sound.playClick();
                onSelect(regime);
              }}
              style={{
                borderColor: active ? '#ffffff' : regime.color,
                color: active ? '#ffffff' : regime.color,
              }}
              className={`px-3 py-1.5 border bg-[#030903]/90 font-mono text-xs font-bold tracking-wider cursor-pointer transition-all ${
                active ? 'bg-[#33ff33]/20 shadow-[0_0_14px_rgba(51,255,51,0.4)]' : 'hover:bg-white/5'
              }`}
            >
              ● {regime.name}
            </button>
          );
        })}
      </div>

      <Canvas camera={{ position: [0, 4.2, 8.8], fov: 45 }}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 4, 5]} intensity={2.2} />
        <EarthCore />
        {regimes.map((regime) => (
          <OrbitRingAndMarker
            key={regime.id}
            regime={regime}
            isSelected={selectedId === regime.id}
            onSelect={onSelect}
            portal={portalRef}
          />
        ))}
        <OrbitControls enablePan={false} minDistance={4.5} maxDistance={14} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/Earth.glb');
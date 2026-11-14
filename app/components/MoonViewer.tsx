'use client';

import '@react-three/fiber';
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { LUNAR_BEACONS, LunarBeacon } from '../data/lunarData';
import { sound } from '../lib/sound';

interface MoonViewerProps {
  installedInstruments: string[];
  selectedBeacon: LunarBeacon | null;
  scannedIds: string[];
  onSelectBeacon: (beacon: LunarBeacon | null) => void;
  onScanBeacon: (beacon: LunarBeacon) => void;
}

const MOON_RADIUS = 2.2;

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function OrbitingProbe() {
  const probeRef = useRef<THREE.Group>(null);

  const orbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = MOON_RADIUS + 0.65;
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * 0.45, Math.sin(a) * r));
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (probeRef.current) {
      const t = clock.getElapsedTime() * 0.35;
      const r = MOON_RADIUS + 0.65;
      probeRef.current.position.set(
        Math.cos(t) * r,
        Math.sin(t) * 0.45,
        Math.sin(t) * r
      );
      probeRef.current.rotation.y = -t;
    }
  });

  return (
    <group>
      <Line points={orbitPoints} color="#1a881a" lineWidth={1} dashed dashSize={0.15} gapSize={0.1} />
      <group ref={probeRef}>
        <mesh>
          <octahedronGeometry args={[0.1, 0]} />
          <meshBasicMaterial color="#33ff33" wireframe />
        </mesh>
      </group>
    </group>
  );
}

function LunarGlobe({
  installedInstruments,
  selectedBeacon,
  scannedIds,
  onSelectBeacon,
  onScanBeacon,
}: MoonViewerProps) {
  const moonGroupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/moon_small.glb');

  const normalizedMoon = useMemo(() => {
    const cloned = scene.clone();

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            if (!mat.metalnessMap) mat.metalness = 0.05;
            if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.needsUpdate = true;
          }
        });
      }
    });

    const rawBox = new THREE.Box3().setFromObject(cloned);
    const rawSize = new THREE.Vector3();
    rawBox.getSize(rawSize);

    const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z) || 1;
    const scaleFactor = (MOON_RADIUS * 2) / maxDim;
    cloned.scale.setScalar(scaleFactor);

    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    cloned.position.sub(center);

    return cloned;
  }, [scene]);

  useFrame((_, delta) => {
    if (moonGroupRef.current && !selectedBeacon) {
      moonGroupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={moonGroupRef}>
      <primitive
        object={normalizedMoon}
        onClick={() => onSelectBeacon(null)}
      />

      {LUNAR_BEACONS.map((beacon) => {
        const pos = latLonToVector3(beacon.lat, beacon.lon, MOON_RADIUS + 0.04);
        const isSelected = selectedBeacon?.id === beacon.id;
        const isScanned = scannedIds.includes(beacon.id);
        const hasRequiredTool =
          !beacon.requiredInstrument || installedInstruments.includes(beacon.requiredInstrument);

        const pinColor = isScanned ? '#33ff33' : isSelected ? '#ffffff' : '#ffb000';

        return (
          <group key={beacon.id} position={pos}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                onSelectBeacon(beacon);
              }}
              onPointerOver={() => {
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshBasicMaterial color={pinColor} />
            </mesh>

            <mesh lookAt={[0, 0, 0]}>
              <ringGeometry args={[0.11, 0.15, 20]} />
              <meshBasicMaterial color={pinColor} side={THREE.DoubleSide} />
            </mesh>

            <Html distanceFactor={8} zIndexRange={[100, 0]}>
              {!isSelected ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onSelectBeacon(beacon);
                  }}
                  className="px-1.5 py-0.5 bg-[#020802]/90 border border-[#ffb000] text-[#ffb000] hover:border-[#33ff33] hover:text-[#33ff33] text-[9px] font-mono tracking-wider whitespace-nowrap cursor-pointer shadow-[0_0_8px_rgba(255,176,0,0.4)]"
                >
                  {isScanned ? `✓ ${beacon.code}` : `⌖ ${beacon.code}`}
                </button>
              ) : (
                <div className="w-64 p-3 bg-[#020902]/95 border-2 border-[#33ff33] text-[#33ff33] font-mono text-[11px] shadow-[0_0_20px_rgba(51,255,51,0.45)] select-none">
                  <div className="flex justify-between items-center border-b border-[#144414] pb-1 mb-1.5">
                    <span className="font-bold text-amber-400">{beacon.code}</span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playBlip();
                        onSelectBeacon(null);
                      }}
                      className="text-xs text-[#1a881a] hover:text-[#33ff33] px-1 cursor-pointer"
                    >
                      [X]
                    </button>
                  </div>

                  <div className="font-bold text-xs mb-0.5">{beacon.name}</div>
                  <div className="text-[9px] text-[#1a881a] mb-2">{beacon.region}</div>
                  <p className="text-[10px] text-[#22bb22] leading-snug mb-2">{beacon.summary}</p>

                  {isScanned ? (
                    <div className="p-2 bg-[#071f07] border border-[#33ff33] text-[10px] text-[#33ff33]">
                      <div className="font-bold mb-0.5">[SCAN COMPLETE +{beacon.scienceYield} PTS]</div>
                      {beacon.detailedScan}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="text-[9px] text-[#1a881a]">
                        SENSOR REQ:{' '}
                        <span className={hasRequiredTool ? 'text-[#33ff33]' : 'text-red-400'}>
                          {beacon.instrumentName}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={!hasRequiredTool}
                        onClick={() => {
                          sound.playClick();
                          onScanBeacon(beacon);
                        }}
                        className={`w-full py-1.5 border text-[10px] font-bold tracking-wider ${
                          hasRequiredTool
                            ? 'border-[#33ff33] bg-[#33ff33]/20 text-[#33ff33] hover:bg-[#33ff33]/30 cursor-pointer'
                            : 'border-red-900 bg-red-950/30 text-red-500 cursor-not-allowed'
                        }`}
                      >
                        {hasRequiredTool
                          ? `RUN ORBITAL SCAN (+${beacon.scienceYield} PTS)`
                          : 'SENSOR NOT INSTALLED'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Html>
          </group>
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/moon_small.glb');

export default function MoonViewer(props: MoonViewerProps) {
  return (
    <div className="relative z-20 w-full h-135 border-2 border-[#1a881a] bg-[#020502] overflow-hidden">
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between text-xs tracking-widest text-[#1a881a] pointer-events-none">
        <span>ORBITAL TELEMETRY // LUNA-01 RECON</span>
        <span className="text-[#33ff33]">[DRAG: ROTATE | CLICK BEACON: INSPECT]</span>
      </div>

      <Canvas
        camera={{ position: [0, 1.5, 6.2], fov: 45 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      >
        <Environment preset="city" environmentIntensity={0.4} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[7, 3, 5]} intensity={2.2} color="#fffdf5" />

        <Suspense fallback={null}>
          <LunarGlobe {...props} />
        </Suspense>

        <OrbitingProbe />

        <OrbitControls enablePan={false} minDistance={3.4} maxDistance={10} />
      </Canvas>
    </div>
  );
}
'use client';

import '@react-three/fiber';
import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EARTH_LAUNCH_SITES, LaunchSite } from '../data/earthData';
import { sound } from '../lib/sound';

interface EarthViewerProps {
  selectedSite: LaunchSite | null;
  onSelectSite: (site: LaunchSite | null) => void;
  onLaunchComplete?: (site: LaunchSite) => void;
  onResetLaunch?: () => void;
}

const EARTH_RADIUS = 2.2;
const ORBIT_RADIUS = EARTH_RADIUS + 0.55;

// offset to match the orientation of the Earth.glb model, so that 0° longitude is centered on the front of the globe
const LON_OFFSET = 90;

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180 + LON_OFFSET) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Generates a full inclined orbital ring + curved gravity-turn ascent path
 * starting directly on the selected launch pad's surface vector.
 */
function buildLaunchTrajectory(site: LaunchSite) {
  const padSurface = latLonToVector3(site.lat, site.lon, EARTH_RADIUS + 0.02);
  const upDir = padSurface.clone().normalize();

  // Compute local East & North tangent vectors at the launch pad
  const worldUp = new THREE.Vector3(0, 1, 0);
  const eastDir = new THREE.Vector3().crossVectors(worldUp, upDir);
  if (eastDir.lengthSq() < 0.0001) {
    eastDir.set(1, 0, 0);
  } else {
    eastDir.normalize();
  }
  const northDir = new THREE.Vector3().crossVectors(upDir, eastDir).normalize();

  // Polar/SSO sites (like Vandenberg) launch southward; others launch eastward/prograde
  const isPolar = site.id === 'vandenberg';
  const azimuthDir = isPolar
    ? northDir.clone().multiplyScalar(-0.92).add(eastDir.clone().multiplyScalar(-0.38)).normalize()
    : eastDir.clone().multiplyScalar(0.94).add(northDir.clone().multiplyScalar(0.34)).normalize();

  // Full circular orbital ring lying in the plane spanned by (upDir, azimuthDir)
  const orbitPoints: THREE.Vector3[] = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const pt = new THREE.Vector3()
      .addScaledVector(upDir, Math.cos(angle) * ORBIT_RADIUS)
      .addScaledVector(azimuthDir, Math.sin(angle) * ORBIT_RADIUS);
    orbitPoints.push(pt);
  }

  // Gravity-turn ascent curve from surface pad (angle = 0, r = EARTH_RADIUS) into orbit (angle = 0.55 rad, r = ORBIT_RADIUS)
  const ascentPoints: THREE.Vector3[] = [];
  const ascentSteps = 40;
  const insertionAngle = 0.55;
  for (let i = 0; i <= ascentSteps; i++) {
    const t = i / ascentSteps;
    const altEase = 1 - Math.pow(1 - t, 2.2);
    const angleEase = t * t * insertionAngle;
    const r = THREE.MathUtils.lerp(EARTH_RADIUS + 0.02, ORBIT_RADIUS, altEase);

    const pt = new THREE.Vector3()
      .addScaledVector(upDir, Math.cos(angleEase) * r)
      .addScaledVector(azimuthDir, Math.sin(angleEase) * r);
    ascentPoints.push(pt);
  }

  return {
    upDir,
    azimuthDir,
    orbitPoints,
    ascentPoints,
    insertionAngle,
  };
}

function ActiveTrajectory({
  site,
  portal,
}: {
  site: LaunchSite;
  portal: React.RefObject<HTMLDivElement>;
}) {
  const craftRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const elapsedRef = useRef(0);

  const { scene: shipScene } = useGLTF('/models/spaceship.glb');
  const trajectory = useMemo(() => buildLaunchTrajectory(site), [site]);

  const normalizedShip = useMemo(() => {
    const cloned = shipScene.clone();
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
    cloned.scale.setScalar(0.32 / maxDim);

    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    cloned.position.sub(center);

    return cloned;
  }, [shipScene]);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    const ascentDuration = 3.2;
    const tTotal = elapsedRef.current;

    if (!craftRef.current) return;

    let currentPos: THREE.Vector3;
    let nextPos: THREE.Vector3;

    if (tTotal < ascentDuration) {
      const t = tTotal / ascentDuration;
      const altEase = 1 - Math.pow(1 - t, 2.2);
      const angleEase = t * t * trajectory.insertionAngle;
      const r = THREE.MathUtils.lerp(EARTH_RADIUS + 0.02, ORBIT_RADIUS, altEase);

      currentPos = new THREE.Vector3()
        .addScaledVector(trajectory.upDir, Math.cos(angleEase) * r)
        .addScaledVector(trajectory.azimuthDir, Math.sin(angleEase) * r);

      const tNext = Math.min(1, t + 0.02);
      const altNext = 1 - Math.pow(1 - tNext, 2.2);
      const angNext = tNext * tNext * trajectory.insertionAngle;
      const rNext = THREE.MathUtils.lerp(EARTH_RADIUS + 0.02, ORBIT_RADIUS, altNext);

      nextPos = new THREE.Vector3()
        .addScaledVector(trajectory.upDir, Math.cos(angNext) * rNext)
        .addScaledVector(trajectory.azimuthDir, Math.sin(angNext) * rNext);
    } else {
      const orbitTime = tTotal - ascentDuration;
      const orbitalSpeed = 0.42;
      const angle = trajectory.insertionAngle + orbitTime * orbitalSpeed;

      currentPos = new THREE.Vector3()
        .addScaledVector(trajectory.upDir, Math.cos(angle) * ORBIT_RADIUS)
        .addScaledVector(trajectory.azimuthDir, Math.sin(angle) * ORBIT_RADIUS);

      const nextAngle = angle + 0.03;
      nextPos = new THREE.Vector3()
        .addScaledVector(trajectory.upDir, Math.cos(nextAngle) * ORBIT_RADIUS)
        .addScaledVector(trajectory.azimuthDir, Math.sin(nextAngle) * ORBIT_RADIUS);
    }

    craftRef.current.position.copy(currentPos);
    craftRef.current.lookAt(nextPos);

    if (trailRef.current) {
      const isAscending = tTotal < ascentDuration;
      const scale = isAscending ? 1 + Math.sin(tTotal * 25) * 0.25 : 0.45;
      trailRef.current.scale.set(scale, scale, isAscending ? 1.6 : 0.7);
    }
  });

  return (
    <group>
      <Line
        points={trajectory.orbitPoints}
        color="#1a881a"
        lineWidth={1.2}
        dashed
        dashSize={0.14}
        gapSize={0.09}
      />

      <Line points={trajectory.ascentPoints} color="#ffb000" lineWidth={2} />

      <group ref={craftRef}>
        <primitive object={normalizedShip} />

        <mesh ref={trailRef} position={[0, 0, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.04, 0.22, 8]} />
          <meshBasicMaterial color="#ffb000" transparent opacity={0.85} />
        </mesh>

        <Html key={`traj-${site.id}`} portal={portal} distanceFactor={8} zIndexRange={[100, 0]}>
          <div className="px-2 py-0.5 bg-[#020802]/90 border border-[#33ff33] text-[#33ff33] text-[8px] font-mono font-bold tracking-wider whitespace-nowrap pointer-events-none shadow-[0_0_10px_rgba(51,255,51,0.4)]">
            ▲ {site.code} // ORBITAL INSERTION ACTIVE
          </div>
        </Html>
      </group>
    </group>
  );
}

function EarthScene({
  selectedSite,
  onSelectSite,
  launchedSite,
  onLaunchFromSite,
  portal,
}: {
  selectedSite: LaunchSite | null;
  onSelectSite: (site: LaunchSite | null) => void;
  launchedSite: LaunchSite | null;
  onLaunchFromSite: (site: LaunchSite) => void;
  portal: React.RefObject<HTMLDivElement>;
}) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/Earth.glb');

  const normalizedEarth = useMemo(() => {
    const cloned = scene.clone();

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
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
    const scaleFactor = (EARTH_RADIUS * 2) / maxDim;
    cloned.scale.setScalar(scaleFactor);

    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    cloned.position.sub(center);

    return cloned;
  }, [scene]);

  useFrame((_, delta) => {
    if (earthGroupRef.current && (!selectedSite || launchedSite)) {
      earthGroupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={earthGroupRef}>
      <primitive
        object={normalizedEarth}
        onClick={() => {
          if (!launchedSite) onSelectSite(null);
        }}
      />

      {launchedSite ? (
        <ActiveTrajectory site={launchedSite} portal={portal} />
      ) : (
        EARTH_LAUNCH_SITES.map((site) => {
          const pos = latLonToVector3(site.lat, site.lon, EARTH_RADIUS + 0.03);
          const isSelected = selectedSite?.id === site.id;
          const pinColor = isSelected ? '#33ff33' : '#ffb000';

          const normal = pos.clone().normalize();
          const ringQuat = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            normal
          );

          return (
            <group key={site.id} position={pos}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onSelectSite(isSelected ? null : site);
                }}
                onPointerOver={() => {
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto';
                }}
              >
                <sphereGeometry args={[isSelected ? 0.075 : 0.055, 16, 16]} />
                <meshBasicMaterial color={pinColor} />
              </mesh>

              <mesh quaternion={ringQuat}>
                <ringGeometry args={[0.085, 0.125, 24]} />
                <meshBasicMaterial color={pinColor} side={THREE.DoubleSide} />
              </mesh>

              <Html key={site.id} portal={portal} distanceFactor={8} zIndexRange={[100, 0]}>
                {!isSelected ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      onSelectSite(site);
                    }}
                    className="pointer-events-auto px-1.5 py-0.5 bg-[#020802]/90 border border-[#ffb000] text-[#ffb000] hover:border-[#33ff33] hover:text-[#33ff33] text-[8px] font-mono font-bold tracking-wider whitespace-nowrap cursor-pointer"
                  >
                    ▲ {site.code}
                  </button>
                ) : (
                  <div className="pointer-events-auto w-64 p-3 bg-[#020902]/95 border-2 border-[#33ff33] text-[#33ff33] font-mono text-[11px] shadow-[0_0_20px_rgba(51,255,51,0.45)] select-none">
                    <div className="flex justify-between items-center border-b border-[#144414] pb-1 mb-1.5">
                      <span className="font-bold text-amber-400">[{site.code}] LAUNCH PAD</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playBlip();
                          onSelectSite(null);
                        }}
                        className="text-xs text-[#1a881a] hover:text-[#33ff33] px-1 cursor-pointer"
                      >
                        [X]
                      </button>
                    </div>

                    <div className="font-bold text-xs">{site.name}</div>
                    <div className="text-[9px] text-[#1a881a] mb-1.5">{site.agency}</div>
                    <p className="text-[10px] text-[#22bb22] leading-snug mb-2">{site.summary}</p>

                    <div className="text-[9px] text-amber-400 space-y-0.5 border-t border-[#144414] pt-1.5 mb-2.5">
                      <div>
                        COORDS: {site.lat.toFixed(2)}°N, {site.lon.toFixed(2)}°E
                      </div>
                      <div>INCLINATION: {site.inclinationRange}</div>
                      {site.fuelBonusPercent > 0 && (
                        <div className="text-[#33ff33]">
                          EQUATORIAL ASSIST: -{site.fuelBonusPercent}% FUEL REQ
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onLaunchFromSite(site);
                      }}
                      className="w-full py-1.5 border border-[#33ff33] bg-[#33ff33]/20 text-[#33ff33] hover:bg-[#33ff33]/35 text-[10px] font-bold tracking-wider cursor-pointer shadow-[0_0_12px_rgba(51,255,51,0.35)]"
                    >
                      ► LAUNCH FROM {site.code}
                    </button>
                  </div>
                )}
              </Html>
            </group>
          );
        })
      )}
    </group>
  );
}

useGLTF.preload('/models/Earth.glb');
useGLTF.preload('/models/spaceship.glb');

export default function EarthViewer({
  selectedSite,
  onSelectSite,
  onLaunchComplete,
  onResetLaunch,
}: EarthViewerProps) {
  const [launchedSite, setLaunchedSite] = useState<LaunchSite | null>(null);
  const portalRef = useRef<HTMLDivElement>(null!);

  const handleLaunchFromSite = (site: LaunchSite) => {
    setLaunchedSite(site);
    onSelectSite(null);
    if (onLaunchComplete) {
      onLaunchComplete(site);
    }
  };

  const handleReset = () => {
    sound.playBlip();
    setLaunchedSite(null);
    if (onResetLaunch) {
      onResetLaunch();
    }
  };

  return (
    <div className="relative z-20 w-full h-135 border-2 border-[#1a881a] bg-[#020502] overflow-hidden">
      {/* Dedicated DOM portal target so Drei <Html> never unmounts synchronously inside R3F */}
      <div ref={portalRef} className="pointer-events-none" />

      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center text-xs tracking-widest text-[#1a881a] pointer-events-none">
        <span>
          {launchedSite
            ? `ACTIVE ORBITAL TRAJECTORY // ORIGIN: ${launchedSite.name.toUpperCase()}`
            : 'GLOBAL LAUNCH NETWORK // TERRA-01'}
        </span>

        {launchedSite ? (
          <button
            type="button"
            onClick={handleReset}
            className="pointer-events-auto px-2.5 py-1 border border-amber-400 bg-[#020802]/90 text-amber-400 hover:border-[#33ff33] hover:text-[#33ff33] text-[10px] font-bold tracking-wider cursor-pointer"
          >
            [↺ RESET LAUNCH SITES]
          </button>
        ) : (
          <span className="text-[#33ff33]">[DRAG: ROTATE | CLICK PAD: LAUNCH]</span>
        )}
      </div>

      <Canvas
        camera={{ position: [0, 1.4, 6.2], fov: 45 }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <Environment preset="city" environmentIntensity={0.35} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[7, 3, 5]} intensity={2.3} color="#fffdf5" />

        <Suspense fallback={null}>
          <EarthScene
            selectedSite={selectedSite}
            onSelectSite={onSelectSite}
            launchedSite={launchedSite}
            onLaunchFromSite={handleLaunchFromSite}
            portal={portalRef}
          />
        </Suspense>

        <OrbitControls enablePan={false} minDistance={3.4} maxDistance={10} />
      </Canvas>
    </div>
  );
}
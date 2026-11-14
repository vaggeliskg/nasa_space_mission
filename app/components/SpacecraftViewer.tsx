'use client';

import '@react-three/fiber';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';

interface SpacecraftProps {
  selectedBus: string[];
  selectedInstruments: string[];
}

function SpacecraftMesh({ selectedBus, selectedInstruments }: SpacecraftProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle idle CAD rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  // Check active subsystems
  const hasFixedSolar = selectedBus.includes('pwr_solar_fixed');
  const hasDeploySolar = selectedBus.includes('pwr_solar_deploy');
  const hasRTG = selectedBus.includes('pwr_rtg');

  const hasSBand = selectedBus.includes('comm_s_band');
  const hasXBand = selectedBus.includes('comm_x_band');
  const hasLaser = selectedBus.includes('comm_laser');

  const hasRCS = selectedBus.includes('adcs_rcs');
  const hasWheels = selectedBus.includes('adcs_wheels');

  // Check active instruments
  const hasCam = selectedInstruments.includes('inst_cam');
  const hasRadar = selectedInstruments.includes('inst_radar');
  const hasIR = selectedInstruments.includes('inst_ir');
  const hasMag = selectedInstruments.includes('inst_mag');
  const hasSample = selectedInstruments.includes('inst_sample');

  const wireColor = '#33ff33';
  const dimFill = '#072207';
  const accentAmber = '#ffb000';

  return (
    <group ref={groupRef}>
      {/* ================= CORE OCTAGONAL SPACECRAFT BUS ================= */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 1.8, 8]} />
        <meshStandardMaterial color={dimFill} roughness={0.6} metalness={0.8} />
        <Edges color={wireColor} threshold={15} />
      </mesh>

      {/* Main Thruster Nozzle (Bottom) */}
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[0.3, 0.55, 0.5, 12, 1, true]} />
        <meshStandardMaterial color="#041204" side={THREE.DoubleSide} />
        <Edges color={wireColor} />
      </mesh>

      {/* ================= POWER SUBSYSTEMS ================= */}
      {/* 1. Body-Mounted Fixed Solar Panels */}
      {hasFixedSolar && (
        <group>
          {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.sin(angle) * 0.92, 0, Math.cos(angle) * 0.92]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.7, 1.4, 0.05]} />
              <meshStandardMaterial color="#093018" />
              <Edges color={wireColor} />
            </mesh>
          ))}
        </group>
      )}

      {/* 2. Deployable Dual-Wing Solar Arrays */}
      {hasDeploySolar && (
        <group>
          {/* Left Wing + Strut */}
          <mesh position={[-1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshStandardMaterial color={dimFill} />
            <Edges color={wireColor} />
          </mesh>
          <mesh position={[-2.6, 0, 0]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[2.5, 0.04, 0.9]} />
            <meshStandardMaterial color="#062815" />
            <Edges color={wireColor} />
          </mesh>

          {/* Right Wing + Strut */}
          <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
            <meshStandardMaterial color={dimFill} />
            <Edges color={wireColor} />
          </mesh>
          <mesh position={[2.6, 0, 0]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[2.5, 0.04, 0.9]} />
            <meshStandardMaterial color="#062815" />
            <Edges color={wireColor} />
          </mesh>
        </group>
      )}

      {/* 3. Nuclear RTG Finned Generator */}
      {hasRTG && (
        <group position={[0, -0.5, -1.2]} rotation={[Math.PI / 3, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 1.1, 8]} />
            <meshStandardMaterial color="#221500" />
            <Edges color={accentAmber} />
          </mesh>
          {/* Cooling Fins */}
          <mesh>
            <boxGeometry args={[0.85, 0.9, 0.03]} />
            <meshStandardMaterial color="#221500" />
            <Edges color={accentAmber} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.85, 0.9, 0.03]} />
            <meshStandardMaterial color="#221500" />
            <Edges color={accentAmber} />
          </mesh>
        </group>
      )}

      {/* ================= COMMUNICATIONS (TOP DECK) ================= */}
      {/* 1. Omni S-Band Whip Antenna */}
      {hasSBand && (
        <group position={[0, 1.35, 0]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.04, 0.9, 6]} />
            <meshStandardMaterial color={wireColor} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial color={wireColor} wireframe />
          </mesh>
        </group>
      )}

      {/* 2. Steerable Parabolic X-Band Dish */}
      {hasXBand && (
        <group position={[0, 1.25, 0]} rotation={[0.25, 0, 0]}>
          <mesh position={[0, 0.25, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.75, 0.35, 16, 1, true]} />
            <meshStandardMaterial color={dimFill} side={THREE.DoubleSide} />
            <Edges color={wireColor} />
          </mesh>
          {/* Feed Horn */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.45, 6]} />
            <meshStandardMaterial color={wireColor} />
          </mesh>
        </group>
      )}

      {/* 3. Optical Deep-Space Laser Turret */}
      {hasLaser && (
        <group position={[0, 1.15, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.4, 0.5]} />
            <meshStandardMaterial color={dimFill} />
            <Edges color={wireColor} />
          </mesh>
          <mesh position={[0, 0.1, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.25, 12]} />
            <meshStandardMaterial color="#002222" />
            <Edges color="#00ffff" />
          </mesh>
        </group>
      )}

      {/* ================= ADCS ================= */}
      {/* Reaction Wheels Ring */}
      {hasWheels && (
        <mesh position={[0, 0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.93, 0.05, 6, 16]} />
          <meshStandardMaterial color={dimFill} />
          <Edges color={wireColor} />
        </mesh>
      )}

      {/* RCS Thruster Quads */}
      {hasRCS && (
        <group position={[0, -0.65, 0]}>
          {[Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4, -Math.PI / 4].map((angle, i) => (
            <mesh
              key={i}
              position={[Math.sin(angle) * 0.98, 0, Math.cos(angle) * 0.98]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.18, 0.18, 0.22]} />
              <meshStandardMaterial color={dimFill} />
              <Edges color={accentAmber} />
            </mesh>
          ))}
        </group>
      )}

      {/* ================= SCIENTIFIC INSTRUMENTS ================= */}
      {/* Optical Imager (Front Lens Pod) */}
      {hasCam && (
        <group position={[0, 0.25, 0.95]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.28, 0.4, 12]} />
            <meshStandardMaterial color={dimFill} />
            <Edges color={wireColor} />
          </mesh>
        </group>
      )}

      {/* Synthetic Aperture Radar (Belly Dish Panel) */}
      {hasRadar && (
        <mesh position={[0, -0.35, 0.95]}>
          <boxGeometry args={[1.1, 0.45, 0.15]} />
          <meshStandardMaterial color={dimFill} />
          <Edges color={wireColor} />
        </mesh>
      )}

      {/* IR Spectrometer (Side Sensor Box) */}
      {hasIR && (
        <mesh position={[-0.95, 0.4, 0.3]}>
          <boxGeometry args={[0.25, 0.35, 0.35]} />
          <meshStandardMaterial color={dimFill} />
          <Edges color={wireColor} />
        </mesh>
      )}

      {/* Magnetometer Boom (Long Extending Lattice) */}
      {hasMag && (
        <group position={[0.9, 0.5, -0.7]} rotation={[0, -0.5, -0.4]}>
          <mesh position={[0.9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.05, 1.8, 4]} />
            <meshBasicMaterial color={wireColor} wireframe />
          </mesh>
          <mesh position={[1.85, 0, 0]}>
            <octahedronGeometry args={[0.14]} />
            <meshBasicMaterial color={accentAmber} wireframe />
          </mesh>
        </group>
      )}

      {/* Robotic Core Drill (Lower Robotic Arm) */}
      {hasSample && (
        <group position={[0.6, -0.85, 0.6]}>
          <mesh position={[0, -0.35, 0]}>
            <coneGeometry args={[0.12, 0.7, 6]} />
            <meshBasicMaterial color={accentAmber} wireframe />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function SpacecraftViewer({ selectedBus, selectedInstruments }: SpacecraftProps) {
  return (
    <div className="relative w-full h-90 lg:h-full min-h-85 border border-[#1a881a] bg-[#020602] overflow-hidden">
      {/* CAD Overlay Header */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between text-[10px] tracking-widest text-[#1a881a] pointer-events-none">
        <span>CAD-3D // WIREFRAME VIEWPORT</span>
        <span className="text-[#33ff33]">[DRAG: ROTATE | SCROLL: ZOOM]</span>
      </div>

      {/* Retro Corner Crosshairs */}
      <div className="absolute bottom-2 left-2 z-10 text-[10px] text-[#1a881a] pointer-events-none">
        AXIS: X-Y-Z LOCKED
      </div>
      <div className="absolute bottom-2 right-2 z-10 text-[10px] text-[#33ff33] pointer-events-none">
        PARTS: {selectedBus.length + selectedInstruments.length + 1} ACTIVE
      </div>

      {/* Three.js Canvas */}
      <Canvas camera={{ position: [3.2, 2.2, 3.8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#33ff33" />
        <pointLight position={[-5, -3, -5]} intensity={0.5} color="#ffb000" />

        {/* 80s Ground Reference Grid */}
        <gridHelper args={[8, 16, '#1a881a', '#0a220a']} position={[0, -1.7, 0]} />

        <SpacecraftMesh
          selectedBus={selectedBus}
          selectedInstruments={selectedInstruments}
        />

        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
}
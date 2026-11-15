'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '../components/StarField';
import EarthViewer from '../components/EarthViewer';
import { LaunchSite } from '../data/earthData';
import { sound } from '../lib/sound';

interface StoredMissionConfig {
  objective?: {
    id: string;
    name: string;
    target: string;
  };
  instruments?: string[];
  telemetry?: {
    mass: number;
    cost: number;
    netPower: number;
    scienceScore: number;
  };
}

export default function SimulationPage() {
  const router = useRouter();
  const [config, setConfig] = useState<StoredMissionConfig | null>(null);
  const [selectedLaunchSite, setSelectedLaunchSite] = useState<LaunchSite | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('missionConfig');
    if (raw) {
      try {
        setConfig(JSON.parse(raw));
      } catch {
        setConfig(null);
      }
    }
  }, []);

  return (
    <div className="crt-container relative min-h-screen flex flex-col p-4 sm:p-8 select-none">
      <Starfield />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Orbital Simulation Header */}
        <header className="border-2 border-[#1a881a] bg-[#030803]/95 p-4 flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="text-[10px] tracking-widest text-[#1a881a]">
              ORBITAL TELEMETRY SIMULATOR // EARTH ORBIT
            </div>
            <h1 className="text-base font-bold text-[#33ff33] tracking-wider">
              {config?.objective?.name || 'ORBITAL RECONNAISSANCE'} — {config?.objective?.target || 'ACTIVE'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playBlip();
              router.push('/mission');
            }}
            className="px-4 py-2 border border-[#1a881a] text-xs font-bold text-[#33ff33] hover:bg-[#33ff33]/15 cursor-pointer"
          >
            ◄ RETURN TO VAB PLANNER
          </button>
        </header>

        <EarthViewer
          selectedSite={selectedLaunchSite}
          onSelectSite={setSelectedLaunchSite}
        />
      </div>
    </div>
  );
}
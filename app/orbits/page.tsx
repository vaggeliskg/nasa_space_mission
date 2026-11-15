'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '../components/StarField';
import OrbitGlobeViewer from '../components/orbits/OrbitGlobeViewer';
import {
  ORBIT_REGIMES,
  LEO_INCLINATIONS,
  OrbitRegime,
  LeoInclinationOption,
} from '../data/orbitData';
import { sound } from '../lib/sound';

export default function OrbitSelectionPage() {
  const router = useRouter();
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitRegime | null>(null);
  const [missionId, setMissionId] = useState<string>('star_obs');

  // Read selected mission path from sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rawMission = sessionStorage.getItem('selectedMissionPath');
    if (rawMission) {
      try {
        const parsed = JSON.parse(rawMission);
        if (parsed?.id) {
          setMissionId(parsed.id);
        }
      } catch {
        // Ignore malformed JSON
      }
    }
  }, []);

  const isTelecom = useMemo(
    () =>
      missionId.toLowerCase().includes('telecom') ||
      missionId.toLowerCase().includes('comm'),
    [missionId]
  );

  // Star Observation -> hide GSO | Telecom -> hide L2
  const visibleOrbits = useMemo(() => {
    const base = ORBIT_REGIMES.filter((regime) => {
      if (isTelecom) {
        return regime.id !== 'L2';
      }
      return regime.id !== 'GSO';
    });

    // Reflect live LEO inclination tilt on the 3D globe if LEO is active
    return base.map((regime) =>
      regime.id === 'LEO' && selectedOrbit?.id === 'LEO'
        ? {
            ...regime,
            inclinationDeg: selectedOrbit.inclinationDeg,
            selectedInclination: selectedOrbit.selectedInclination,
          }
        : regime
    );
  }, [isTelecom, selectedOrbit]);

  // Clear selection if current orbit is not allowed for the active mission path
  useEffect(() => {
    if (selectedOrbit && !visibleOrbits.some((r) => r.id === selectedOrbit.id)) {
      setSelectedOrbit(null);
    }
  }, [selectedOrbit, visibleOrbits]);

  const handleSelectOrbit = (regime: OrbitRegime) => {
    if (regime.id === 'LEO') {
      const defaultInc =
        selectedOrbit?.id === 'LEO' && selectedOrbit.selectedInclination
          ? selectedOrbit.selectedInclination
          : LEO_INCLINATIONS[1]; // Default 51.6°
      setSelectedOrbit({
        ...regime,
        inclinationDeg: defaultInc.deg,
        selectedInclination: defaultInc,
      });
    } else {
      setSelectedOrbit(regime);
    }
  };

  const handleSelectInclination = (inc: LeoInclinationOption) => {
    if (!selectedOrbit || selectedOrbit.id !== 'LEO') return;
    sound.playClick();
    setSelectedOrbit({
      ...selectedOrbit,
      inclinationDeg: inc.deg,
      selectedInclination: inc,
    });
  };

  const handleConfirmOrbit = () => {
    if (!selectedOrbit) return;
    sound.playClick();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedOrbitRegime', JSON.stringify(selectedOrbit));
    }
    router.push('/mission');
  };

  return (
    <div className="crt-container relative min-h-screen flex flex-col p-4 sm:p-8 select-none overflow-x-hidden font-mono text-[#33ff33]">
      <Starfield />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Header */}
        <header className="border-2 border-[#1a881a] bg-[#030803]/95 p-4 sm:p-5 shadow-[0_0_20px_rgba(26,136,26,0.2)]">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#144414] pb-2 mb-2 text-xs tracking-widest">
            <span className="text-amber-400 font-bold">
              PHASE 02 // TARGET ORBITAL REGIME SELECTION
            </span>
            <span className="text-[#1a881a]">[SELECT DESTINATION ORBIT]</span>
          </div>
          <p className="text-xs sm:text-sm text-[#28d828] leading-relaxed">
            SELECT AN ORBITAL REGIME ON THE 3D GLOBE (
            <span className="text-[#33ff33] font-bold">LEO 400 KM</span> OR{' '}
            {isTelecom ? (
              <span className="text-amber-400 font-bold">GSO 35,786 KM</span>
            ) : (
              <span className="text-sky-400 font-bold">SUN-EARTH L2 POINT</span>
            )}
            ) TO INSPECT ITS ORBITAL MECHANICS AND PROCEED TO SPACECRAFT ENGINEERING.
          </p>
        </header>

        {/* Main Split View: 3D Globe Left + Exact-Height Scrollable Explanation Window Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className={selectedOrbit ? 'lg:col-span-7 flex flex-col' : 'lg:col-span-12'}>
            <OrbitGlobeViewer
              selectedId={selectedOrbit?.id ?? null}
              onSelect={handleSelectOrbit}
              regimes={visibleOrbits}
            />
          </div>

          {/* Orbit Explanation Window (locks to 3D Globe height on lg+ and scrolls on overflow) */}
          {selectedOrbit && (
            <div className="lg:col-span-5 relative min-h-115 lg:min-h-0">
              <aside className="lg:absolute lg:inset-0 border-2 border-[#33ff33] bg-[#030903]/95 p-5 shadow-[0_0_25px_rgba(51,255,51,0.25)] flex flex-col gap-3 overflow-hidden">
                {/* Fixed Top Title Bar */}
                <div className="shrink-0 flex justify-between items-start border-b border-[#144414] pb-3">
                  <div>
                    <div className="text-[10px] tracking-widest text-amber-400 font-bold">
                      {selectedOrbit.code}
                    </div>
                    <h2 className="text-xl font-bold tracking-wider text-[#33ff33] mt-0.5">
                      {selectedOrbit.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playBlip();
                      setSelectedOrbit(null);
                    }}
                    className="px-2 py-0.5 border border-[#1a881a] hover:border-[#33ff33] text-[10px] text-[#1a881a] hover:text-[#33ff33] cursor-pointer"
                  >
                    [CLOSE X]
                  </button>
                </div>

                {/* Scrollable Body (Parameters, LEO Inclinations, Mechanics & Payloads) */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                  {/* Key Orbital Parameters */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 border border-[#144414] bg-[#040e04]">
                      <div className="text-[9px] text-[#1a881a]">ALTITUDE</div>
                      <div className="text-xs font-bold text-[#33ff33] mt-0.5">
                        {selectedOrbit.altitudeLabel}
                      </div>
                    </div>
                    <div className="p-2 border border-[#144414] bg-[#040e04]">
                      <div className="text-[9px] text-[#1a881a]">ORBIT PERIOD</div>
                      <div className="text-xs font-bold text-[#33ff33] mt-0.5">
                        {selectedOrbit.periodLabel}
                      </div>
                    </div>
                    <div className="p-2 border border-[#144414] bg-[#040e04]">
                      <div className="text-[9px] text-[#1a881a]">MIN DELTA-V</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">
                        {selectedOrbit.deltaVReq.toLocaleString()} M/S
                      </div>
                    </div>
                  </div>

                  {/* LEO Inclination Selector (4 Options) */}
                  {selectedOrbit.id === 'LEO' && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold tracking-widest text-amber-400">
                        ► SELECT ORBITAL INCLINATION
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {LEO_INCLINATIONS.map((inc) => {
                          const isIncSelected =
                            selectedOrbit.selectedInclination?.id === inc.id;
                          return (
                            <button
                              key={inc.id}
                              type="button"
                              onClick={() => handleSelectInclination(inc)}
                              className={`p-2 border text-left transition-all cursor-pointer ${
                                isIncSelected
                                  ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_10px_rgba(51,255,51,0.2)]'
                                  : 'border-[#144414] bg-[#040e04] hover:border-[#1a881a]'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#33ff33]">
                                  {inc.label}
                                </span>
                                {isIncSelected && (
                                  <span className="text-[9px] font-bold text-amber-400">
                                    [ACTIVE]
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#28d828] mt-0.5">
                                {inc.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Plain-English Orbital Explanation */}
                  <div className="space-y-2 text-xs leading-relaxed">
                    <div className="text-[10px] font-bold tracking-widest text-amber-400">
                      ► ORBITAL MECHANICS OVERVIEW
                    </div>
                    <p className="text-[#28d828]">{selectedOrbit.summary}</p>
                  </div>

                  {/* Spacecraft Engineering Implications */}
                  <div className="p-3 border border-[#144414] bg-[#040e04] space-y-1.5 text-xs leading-relaxed">
                    <div className="text-[10px] font-bold tracking-widest text-amber-400">
                      ► SPACECRAFT DESIGN IMPACT
                    </div>
                    <p className="text-[#33ff33]">{selectedOrbit.engineeringImpact}</p>
                  </div>

                  {/* Recommended Instruments */}
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-[#1a881a] mb-1.5">
                      RECOMMENDED MISSION PAYLOADS:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOrbit.idealPayloads.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 border border-[#1a881a] bg-[#040d04] text-[10px] text-[#33ff33]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fixed Bottom Confirm Button */}
                <button
                  type="button"
                  onClick={handleConfirmOrbit}
                  className="shrink-0 w-full py-3 border-2 border-[#33ff33] bg-[#33ff33]/20 hover:bg-[#33ff33]/35 text-[#33ff33] text-xs font-bold tracking-widest cursor-pointer shadow-[0_0_18px_rgba(51,255,51,0.35)]"
                >
                  PLAN SPACECRAFT FOR {selectedOrbit.id}
                  {selectedOrbit.id === 'LEO' && selectedOrbit.selectedInclination
                    ? ` (${selectedOrbit.selectedInclination.deg}°)`
                    : ''}{' '}
                  ►
                </button>
              </aside>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <footer className="border-t border-[#144414] pt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.push('/mission')}
            className="px-4 py-2 border border-[#144414] text-[#1a881a] hover:border-[#1a881a] hover:text-[#33ff33] text-xs font-bold tracking-wider cursor-pointer"
          >
            ◄ BACK TO MISSION PATH
          </button>

          {selectedOrbit && (
            <button
              type="button"
              onClick={handleConfirmOrbit}
              className="px-6 py-2.5 border border-[#33ff33] bg-[#33ff33]/15 text-[#33ff33] hover:bg-[#33ff33]/25 text-xs font-bold tracking-wider cursor-pointer"
            >
              PROCEED TO VAB ({selectedOrbit.name}
              {selectedOrbit.id === 'LEO' && selectedOrbit.selectedInclination
                ? ` // ${selectedOrbit.selectedInclination.deg}°`
                : ''}
              ) ►
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sound } from '../lib/sound';
import Starfield from '../components/StarField';

import { Objective, LaunchVehicle, TelemetryData } from '../types/mission';
import { OBJECTIVES, BUS_COMPONENTS, INSTRUMENTS, LAUNCH_VEHICLES } from '../data/missionData';

import TelemetryHud from '../components/mission/TelemetryHud';
import StageObjective from '../components/mission/StageObjective';
import InteractiveSpacecraftStage, {
  SpacecraftPartSlot,
} from '../components/mission/InteractiveSpacecraftStage';
import PartSideInspector from '../components/mission/PartSideInspector';
import MissionHelpModal from '../components/mission/MissionHelpModal';
import { evaluateMission, MissionEvaluationResult } from '../lib/evaluateMission';

export default function SoloMissionPlanning() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'objective' | 'assembly'>('objective');
  const [activeSlot, setActiveSlot] = useState<SpacecraftPartSlot | null>(null);

  const [selectedObjective, setSelectedObjective] = useState<Objective>(OBJECTIVES[0]);
  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedLV, setSelectedLV] = useState<LaunchVehicle | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<MissionEvaluationResult | null>(null);

  useEffect(() => {
    setAssessmentResult(null);
  }, [selectedObjective, selectedBus, selectedInstruments, selectedLV]);
  

  const handleRunAssessment = () => {
  if (isAssessing) return;
  sound.playClick();
  setIsAssessing(true);
  setAssessmentResult(null);

  setTimeout(() => {
    const result = evaluateMission(
      {
        selectedBus,
        selectedInstruments,
        selectedLV,
      },
      selectedObjective
    );
    setAssessmentResult(result);
    setIsAssessing(false);
    if (result.passed) {
      sound.playBoot();
    } else {
      sound.playBlip();
    }
  }, 3000);
};

  // Tracks which hardpoints currently have an active spec chosen
  const configuredSlots = useMemo(() => {
    const slots = new Set<SpacecraftPartSlot>();
    if (selectedBus.some((id) => BUS_COMPONENTS.find((c) => c.id === id)?.category === 'power')) {
      slots.add('power');
    }
    if (selectedBus.some((id) => BUS_COMPONENTS.find((c) => c.id === id)?.category === 'comm')) {
      slots.add('comm');
    }
    if (selectedBus.some((id) => BUS_COMPONENTS.find((c) => c.id === id)?.category === 'adcs')) {
      slots.add('adcs');
    }
    if (selectedInstruments.length > 0) {
      slots.add('payload');
    }
    if (selectedLV !== null) {
      slots.add('launcher');
    }
    return slots;
  }, [selectedBus, selectedInstruments, selectedLV]);

  const telemetry: TelemetryData = useMemo(() => {
    let mass = 250; // Dry chassis base mass
    let cost = 15; // Ground operations baseline
    let powerGen = 0;
    let powerDraw = 80; // Baseline housekeeping draw
    let dataGenerated = 0;
    let dataDownlinkCapacity = 0;
    let scienceScore = 0;

    selectedBus.forEach((bId) => {
      const comp = BUS_COMPONENTS.find((c) => c.id === bId);
      if (comp) {
        mass += comp.mass;
        cost += comp.cost;
        if (comp.powerDelta > 0) powerGen += comp.powerDelta;
        else powerDraw += Math.abs(comp.powerDelta);
        if (comp.dataDownlink) dataDownlinkCapacity += comp.dataDownlink;
      }
    });

    selectedInstruments.forEach((iId) => {
      const inst = INSTRUMENTS.find((i) => i.id === iId);
      if (inst) {
        mass += inst.mass;
        cost += inst.cost;
        powerDraw += inst.power;
        dataGenerated += inst.dataRate;
        scienceScore += inst.science;
      }
    });

    if (selectedLV) {
      cost += selectedLV.cost;
    }

    const netPower = powerGen - powerDraw;
    const maxCapacity = selectedLV
      ? selectedObjective.id === 'earth_obs'
        ? selectedLV.maxPayloadLEO
        : selectedLV.maxPayloadDeepSpace
      : 0;
    const massMargin = maxCapacity - mass;
    const budgetMargin = selectedObjective.maxBudget - cost;
    const isLaunchViable =
      selectedLV !== null &&
      massMargin >= 0 &&
      budgetMargin >= 0 &&
      netPower >= 0 &&
      scienceScore >= selectedObjective.minScience;

    return {
      mass,
      maxCapacity,
      massMargin,
      cost,
      budgetMargin,
      maxBudget: selectedObjective.maxBudget,
      powerGen,
      powerDraw,
      netPower,
      dataGenerated,
      dataDownlinkCapacity,
      scienceScore,
      minScience: selectedObjective.minScience,
      isLaunchViable,
    };
  }, [selectedObjective, selectedBus, selectedInstruments, selectedLV]);

  // Persistent progress bar driven by chosen hardpoint specs (persists when popups close, resets when deselected)
  const hudStage = useMemo(() => {
    if (viewMode === 'objective') return 1;
    const count = configuredSlots.size;
    if (count === 0) return 1;
    if (count === 1) return 2;
    if (count <= 3) return 3;
    if (count === 4) return 4;
    return 5; // All 5 hardpoints configured
  }, [viewMode, configuredSlots]);

  // Clicking an equipped bus item again deselects it (updates progress bar down)
  const toggleBusComponent = (id: string, category: 'power' | 'comm' | 'adcs') => {
    sound.playClick();
    setSelectedBus((prev) => {
      const alreadyEquipped = prev.includes(id);
      const withoutCategory = prev.filter((item) => {
        const c = BUS_COMPONENTS.find((comp) => comp.id === item);
        return c?.category !== category;
      });
      return alreadyEquipped ? withoutCategory : [...withoutCategory, id];
    });
  };

  const toggleInstrument = (id: string) => {
    sound.playClick();
    setSelectedInstruments((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Clicking the selected launch vehicle again deselects it
  const toggleLaunchVehicle = (lv: LaunchVehicle) => {
    sound.playClick();
    setSelectedLV((prev) => (prev?.id === lv.id ? null : lv));
  };

  const handleLaunch = () => {
    if (!selectedLV || !assessmentResult?.passed) return;
    sound.playClick();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'missionConfig',
        JSON.stringify({
          objective: selectedObjective,
          bus: selectedBus,
          instruments: selectedInstruments,
          launchVehicle: selectedLV,
          telemetry,
          assessment: assessmentResult,
        })
      );
    }
    router.push('/simulation');
  };

  const equippedLabels: Record<SpacecraftPartSlot, string> = useMemo(() => {
    const getBusName = (cat: 'power' | 'comm' | 'adcs') =>
      BUS_COMPONENTS.find((c) => c.category === cat && selectedBus.includes(c.id))?.name ||
      'UNASSIGNED';

    return {
      power: getBusName('power'),
      comm: getBusName('comm'),
      adcs: getBusName('adcs'),
      payload:
        selectedInstruments.length > 0
          ? `${selectedInstruments.length} SENSOR(S)`
          : 'UNASSIGNED',
      launcher: selectedLV ? selectedLV.name : 'UNASSIGNED',
    };
  }, [selectedBus, selectedInstruments, selectedLV]);

  return (
    <div className="crt-container relative min-h-screen flex flex-col p-4 sm:p-8 select-none overflow-x-hidden">
      <Starfield />

<div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-4">
        {viewMode === 'objective' ? (
          <header className="border-2 border-[#1a881a] bg-[#030803]/95 p-4 sm:p-5 shadow-[0_0_20px_rgba(26,136,26,0.2)] font-mono">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#144414] pb-2 mb-2.5 text-xs tracking-widest">
              <span className="text-amber-400 font-bold">
                PHASE 01 // MISSION DIRECTIVE SELECTION
              </span>
              <span className="text-[#1a881a]">[STEP 1 OF 2: CHOOSE TARGET ORBIT]</span>
            </div>
            <p className="text-xs sm:text-sm text-[#33ff33] leading-relaxed">
              CHOOSE YOUR SCIENTIFIC MANDATE BELOW. EACH MISSION DEFINES YOUR TARGET ORBIT, MAXIMUM
              FUNDING CAP, AND MINIMUM SCIENCE YIELD. ONCE SELECTED, CLICK{' '}
              <span className="text-amber-400 font-bold">
                PROCEED TO SPACECRAFT INTEGRATION ►
              </span>{' '}
              TO ENTER THE VEHICLE ASSEMBLY BUILDING (VAB) AND ENGINEER YOUR SPACECRAFT.
            </p>
          </header>
        ) : (
          <div data-tour-target="telemetry-hud" className="w-full">
            <TelemetryHud
              currentStage={hudStage}
              selectedObjective={selectedObjective}
              telemetry={telemetry}
            />
          </div>
        )}

        <main className="border-2 border-[#1a881a] bg-[#030803]/95 p-6 shadow-[0_0_25px_rgba(26,136,26,0.2)] min-h-120 flex flex-col justify-between">
          {/* STAGE 1: SELECT PRIMARY SCIENTIFIC OBJECTIVE */}
          {viewMode === 'objective' && (
            <StageObjective
              selected={selectedObjective}
              onSelect={(obj) => {
                sound.playClick();
                setSelectedObjective(obj);
              }}
            />
          )}

          {viewMode === 'assembly' && (
            <div className="flex flex-wrap justify-between items-center gap-2 pb-3 mb-4 border-b border-[#144414]">
              <div className="text-xs font-mono tracking-widest text-[#1a881a]">
                STAGE 02 // VEHICLE ASSEMBLY BUILDING (VAB) —{' '}
                <span className="text-[#33ff33] font-bold">{selectedObjective.name.toUpperCase()}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsHelpOpen(true);
                }}
                className="px-3 py-1 border border-amber-400 bg-[#040d04] text-amber-400 hover:border-[#33ff33] hover:text-[#33ff33] text-xs font-mono font-bold tracking-wider cursor-pointer shadow-[0_0_10px_rgba(255,176,0,0.25)]"
              >
                [?] VAB SYSTEMS GUIDE
              </button>
            </div>
          )}

          {/* ASSEMBLY VIEW: COMPACT HARDPOINT PINS ON SPACECRAFT + SIDE PART OPTIONS */}
          <div className={viewMode === 'assembly' ? 'flex flex-col lg:flex-row gap-6 items-stretch' : 'hidden'}>
            <div className="flex-1 min-w-0">
              <InteractiveSpacecraftStage
                activeSlot={activeSlot}
                onSelectSlot={setActiveSlot}
                equippedLabels={equippedLabels}
                configuredSlots={configuredSlots}
              />
            </div>

          <div data-tour-target="part-inspector" className="flex">
            <PartSideInspector
              activeSlot={activeSlot}
              selectedObjective={selectedObjective}
              selectedBus={selectedBus}
              selectedInstruments={selectedInstruments}
              selectedLV={selectedLV}
              onToggleBus={toggleBusComponent}
              onToggleInstrument={toggleInstrument}
              onSelectLV={toggleLaunchVehicle}
            />
            </div>
          </div>

          {/* FLIGHT READINESS ASSESSMENT CONSOLE */}
          {viewMode === 'assembly' && (isAssessing || assessmentResult) && (
            <div
              className={`mt-6 p-4 border-2 font-mono text-xs ${
                isAssessing
                  ? 'border-amber-400 bg-amber-950/20 text-amber-300'
                  : assessmentResult?.passed
                  ? 'border-[#33ff33] bg-[#041204] text-[#33ff33] shadow-[0_0_20px_rgba(51,255,51,0.25)]'
                  : 'border-red-500 bg-red-950/25 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
              }`}
            >
              {isAssessing ? (
                  <div className="flex items-center gap-3 py-2">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      className="w-5 h-5 text-amber-400 animate-spin shrink-0"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                    <span className="tracking-widest font-bold animate-pulse">
                      RUNNING NASA FLIGHT READINESS DIAGNOSTICS // VERIFYING GATES, EOL POWER &amp; ODMSP...
                    </span>
                  </div>
                ) : (
                assessmentResult && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap justify-between items-center gap-2 border-b border-current/30 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm tracking-widest">
                          STATUS: {assessmentResult.status}
                        </span>
                        {assessmentResult.passed && (
                          <span className="px-2 py-0.5 border border-[#33ff33] bg-[#33ff33]/20 font-bold">
                            SCORE: {assessmentResult.score} PTS // RANK [{assessmentResult.rank}]
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] opacity-80">
                        AVG TRL: {assessmentResult.metrics.avgTrl.toFixed(1)} | EOL PWR:{' '}
                        {Math.round(assessmentResult.metrics.eolPower)}W | ΔV REM: +
                        {assessmentResult.metrics.remainingDeltaV} M/S
                      </span>
                    </div>

                    <ul className="space-y-1 text-[11px] leading-relaxed">
                      {assessmentResult.feedbackLog.map((entry, idx) => (
                        <li key={idx}>► {entry}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}

          <footer className="mt-8 pt-4 border-t border-[#144414] flex flex-wrap justify-between items-center gap-3">
            <div>
              {viewMode === 'assembly' ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playBlip();
                    setActiveSlot(null);
                    setViewMode('objective');
                  }}
                  className="px-4 py-2 border border-[#144414] text-[#1a881a] hover:border-[#1a881a] hover:text-[#33ff33] text-xs font-bold tracking-wider cursor-pointer"
                >
                  ◄ CHANGE SCIENTIFIC OBJECTIVE
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-4 py-2 border border-[#144414] text-[#1a881a] hover:border-[#1a881a] hover:text-[#33ff33] text-xs font-bold tracking-wider cursor-pointer"
                >
                  ◄ ABORT TO MAIN MENU
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {viewMode === 'objective' ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setViewMode('assembly');
                    if (typeof window !== 'undefined' && !sessionStorage.getItem('vabTourSeen')) {
                      setIsHelpOpen(true);
                      sessionStorage.setItem('vabTourSeen', 'true');
                    }
                  }}
                  className="px-6 py-2.5 border border-[#33ff33] bg-[#33ff33]/15 text-[#33ff33] hover:bg-[#33ff33]/25 shadow-[0_0_15px_rgba(51,255,51,0.25)] text-xs font-bold tracking-wider cursor-pointer"
                >
                  PROCEED TO SPACECRAFT INTEGRATION ►
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    data-tour-target="launch-button"
                    disabled={isAssessing}
                    onClick={handleRunAssessment}
                    className={`px-5 py-2.5 border text-xs font-bold tracking-wider transition-all flex items-center gap-2 ${
                      isAssessing
                        ? 'border-amber-500 bg-amber-950/30 text-amber-400 cursor-wait'
                        : 'border-amber-400 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 shadow-[0_0_15px_rgba(251,191,36,0.25)] cursor-pointer'
                    }`}
                  >
                    {isAssessing ? (
                      <>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                          className="w-4 h-4 text-amber-400 animate-spin shrink-0"
                        >
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                        ASSESSING MISSION...
                      </>
                    ) : (
                      'RUN FLIGHT READINESS ASSESSMENT'
                    )}
                  </button>

                  {assessmentResult?.passed && (
                    <button
                      type="button"
                      onClick={handleLaunch}
                      className="px-6 py-2.5 border-2 border-[#33ff33] bg-[#33ff33]/25 text-[#33ff33] hover:bg-[#33ff33]/40 shadow-[0_0_20px_rgba(51,255,51,0.45)] animate-pulse text-xs font-bold tracking-wider cursor-pointer"
                    >
                      EXECUTE LAUNCH (RANK {assessmentResult.rank}) ►
                    </button>
                  )}
                </>
              )}
            </div>
          </footer>


        </main>
      </div>
      <MissionHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} onSelectSlot={setActiveSlot} />
    </div>
  );
}
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '../components/StarField';
import TelemetryHud from '../components/mission/TelemetryHud';
import StageObjective from '../components/mission/StageObjective';
import InteractiveSpacecraftStage, {
  SpacecraftPartSlot,
} from '../components/mission/InteractiveSpacecraftStage';
import PartSideInspector from '../components/mission/PartSideInspector';
import MissionHelpModal from '../components/mission/MissionHelpModal';
import {
  OBJECTIVES,
  BUS_COMPONENTS,
  INSTRUMENTS,
  LAUNCH_VEHICLES,
} from '../data/missionData';
import { OrbitRegime } from '../data/orbitData';
import { Objective, LaunchVehicle, TelemetryData } from '../types/mission';
import { evaluateMission, MissionEvaluationResult } from '../lib/evaluateMission';
import { sound } from '../lib/sound';

export default function SoloMissionPlanning() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'objective' | 'assembly'>('objective');
  const [selectedObjective, setSelectedObjective] = useState<Objective>(OBJECTIVES[0]);
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitRegime | null>(null);
  const [activeSlot, setActiveSlot] = useState<SpacecraftPartSlot | null>(null);

  // Selected components state
  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedLV, setSelectedLV] = useState<LaunchVehicle | null>(null);

  // Evaluation & Tutorial states
  const [assessmentResult, setAssessmentResult] =
    useState<MissionEvaluationResult | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
  if (typeof window === 'undefined' || viewMode !== 'assembly') return;

  const hasSeenTour = localStorage.getItem('vabTourSeen');
  if (!hasSeenTour) {
    const timer = setTimeout(() => {
      setShowHelpModal(true);
      localStorage.setItem('vabTourSeen', 'true');
    }, 350);
    return () => clearTimeout(timer);
  }
}, [viewMode]);

  // Restore Mission Path + Confirmed Orbit Regime when returning from /orbits
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawMission = sessionStorage.getItem('selectedMissionPath');
    const rawOrbit = sessionStorage.getItem('selectedOrbitRegime');

    if (rawMission) {
      try {
        const parsedMission = JSON.parse(rawMission) as Objective;
        const matched = OBJECTIVES.find((o) => o.id === parsedMission.id);
        if (matched) {
          setSelectedObjective(matched);
        }
      } catch {
        // Ignore malformed sessionStorage
      }
    }

    if (rawMission && rawOrbit) {
      try {
        const parsedOrbit = JSON.parse(rawOrbit) as OrbitRegime;
        setSelectedOrbit(parsedOrbit);
        setViewMode('assembly');
      } catch {
        // Ignore malformed sessionStorage
      }
    }
  }, []);

  // Step 1: Select Mission Path -> save to sessionStorage -> push to /orbits
  const handleSelectObjective = (obj: Objective) => {
    sound.playClick();
    setSelectedObjective(obj);
    setSelectedInstruments([]);
    setAssessmentResult(null);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedMissionPath', JSON.stringify(obj));
      sessionStorage.removeItem('selectedOrbitRegime');
    }

    router.push('/orbits');
  };

  // Toggle Bus component (one per category: power, comm, adcs)
  const handleToggleBus = (id: string) => {
    const target = BUS_COMPONENTS.find((b) => b.id === id);
    if (!target) return;

    setSelectedBus((prev) => {
      const isAlreadyEquipped = prev.includes(id);
      const filtered = prev.filter((existingId) => {
        const existing = BUS_COMPONENTS.find((b) => b.id === existingId);
        return existing?.category !== target.category;
      });
      return isAlreadyEquipped ? filtered : [...filtered, id];
    });
    setAssessmentResult(null);
  };

  // Toggle Payload Instrument
  const handleToggleInstrument = (id: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setAssessmentResult(null);
  };

  // Select Launch Vehicle
  const handleSelectLV = (lv: LaunchVehicle) => {
    setSelectedLV(lv);
    setAssessmentResult(null);
  };

  // Live Spacecraft Telemetry Calculation
  const telemetry: TelemetryData = useMemo(() => {
    let mass = 250; // Dry chassis base mass (kg)
    let cost = 35; // Base integration & engineering cost (€M)
    let powerGen = 0;
    let powerDraw = 80; // Baseline housekeeping draw (W)
    let dataDownlinkCapacity = 0;
    let scienceScore = 0;

    selectedBus.forEach((bId) => {
      const comp = BUS_COMPONENTS.find((c) => c.id === bId);
      if (!comp) return;
      mass += comp.mass;
      cost += comp.cost;
      if (comp.powerDelta > 0) {
        powerGen += comp.powerDelta;
      } else {
        powerDraw += Math.abs(comp.powerDelta);
      }
      if (comp.dataDownlink) {
        dataDownlinkCapacity += comp.dataDownlink;
      }
    });

    let dataGenerated = 0;
    selectedInstruments.forEach((iId) => {
      const inst = INSTRUMENTS.find((i) => i.id === iId);
      if (!inst) return;
      mass += inst.mass;
      cost += inst.cost;
      powerDraw += inst.power;
      dataGenerated += inst.dataRate;
      scienceScore += inst.science;
    });

    if (selectedLV) {
      cost += selectedLV.cost;
    }

    const netPower = powerGen - powerDraw;
    const isLeoMission = selectedOrbit
      ? selectedOrbit.id === 'LEO'
      : selectedObjective.orbitType === 'LEO';

    const maxCapacity = selectedLV
      ? isLeoMission
        ? selectedLV.maxPayloadLEO
        : selectedLV.maxPayloadDeepSpace
      : 0;

    const massMargin = maxCapacity - mass;
    const budgetMargin = selectedObjective.maxBudget - cost;

    const isLaunchViable =
      Boolean(selectedLV) &&
      mass <= maxCapacity &&
      cost <= selectedObjective.maxBudget &&
      netPower >= 0 &&
      selectedInstruments.length > 0;

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
  }, [selectedBus, selectedInstruments, selectedLV, selectedObjective, selectedOrbit]);

  // Equipped labels for 3D hardpoint pills
  const equippedLabels: Record<SpacecraftPartSlot, string> = useMemo(() => {
    const getBusLabel = (cat: 'power' | 'comm' | 'adcs') => {
      const id = selectedBus.find(
        (bId) => BUS_COMPONENTS.find((c) => c.id === bId)?.category === cat
      );
      return BUS_COMPONENTS.find((c) => c.id === id)?.name || 'UNASSIGNED';
    };

    const instNames = selectedInstruments
      .map((id) => INSTRUMENTS.find((i) => i.id === id)?.name)
      .filter(Boolean);

    return {
      power: getBusLabel('power'),
      comm: getBusLabel('comm'),
      adcs: getBusLabel('adcs'),
      payload: instNames.length > 0 ? instNames.join(', ') : 'NO PAYLOAD',
      launcher: selectedLV ? selectedLV.name : 'NO BOOSTER',
    };
  }, [selectedBus, selectedInstruments, selectedLV]);

  const configuredSlots = useMemo(() => {
    const set = new Set<SpacecraftPartSlot>();
    selectedBus.forEach((bId) => {
      const cat = BUS_COMPONENTS.find((c) => c.id === bId)?.category;
      if (cat) set.add(cat);
    });
    if (selectedInstruments.length > 0) set.add('payload');
    if (selectedLV) set.add('launcher');
    return set;
  }, [selectedBus, selectedInstruments, selectedLV]);

  const [isAssessing, setIsAssessing] = useState(false);

  // Run Pre-Launch Flight Readiness Assessment
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
      sound.playBlip();
    }, 3000);
  };

  // Launch into 3D Simulation
  const handleLaunch = () => {
    if (!assessmentResult?.passed || !selectedLV) return;
    sound.playClick();

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'missionConfig',
        JSON.stringify({
          objective: selectedObjective,
          orbitRegime: selectedOrbit,
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

  return (
    <div className="crt-container relative min-h-screen flex flex-col p-4 sm:p-6 select-none overflow-x-hidden font-mono text-[#33ff33]">
      <Starfield />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Terminal Navigation Bar */}
        <header className="border-2 border-[#1a881a] bg-[#030803]/95 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-amber-400">
              {viewMode === 'objective'
                ? 'PHASE 01 // MISSION PATH SELECTION'
                : 'PHASE 03 // VEHICLE ASSEMBLY BUILDING (VAB)'}
            </span>
            {viewMode === 'assembly' && (
              <span className="text-[11px] text-[#28d828] border border-[#144414] px-2 py-0.5 bg-[#041004]">
                PATH: {selectedObjective.name.toUpperCase()}
                {selectedOrbit ? ` // ORBIT: ${selectedOrbit.name}` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'assembly' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowHelpModal(true);
                  }}
                  className="px-3 py-1 border border-amber-500/70 text-amber-400 hover:bg-amber-500/15 text-xs font-bold tracking-wider cursor-pointer"
                >
                  [?] VAB GUIDE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    router.push('/orbits');
                  }}
                  className="px-3 py-1 border border-[#1a881a] text-[#33ff33] hover:bg-[#33ff33]/15 text-xs font-bold tracking-wider cursor-pointer"
                >
                  ◄ CHANGE ORBIT
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                if (viewMode === 'assembly') {
                  sessionStorage.removeItem('selectedOrbitRegime');
                  setViewMode('objective');
                } else {
                  router.push('/briefing');
                }
              }}
              className="px-3 py-1 border border-[#144414] text-[#1a881a] hover:border-[#1a881a] hover:text-[#33ff33] text-xs font-bold tracking-wider cursor-pointer"
            >
              {viewMode === 'assembly' ? '◄ CHANGE PATH' : '◄ BRIEFING'}
            </button>
          </div>
        </header>

        {/* VIEW 1: MISSION PATH SELECTION */}
        {viewMode === 'objective' ? (
          <div className="my-auto py-4">
            <StageObjective
              selected={selectedObjective}
              onSelect={handleSelectObjective}
            />
          </div>
        ) : (
          /* VIEW 2: 3D VAB SPACECRAFT ASSEMBLY */
          <>
            {/* Target 01: Telemetry HUD */}
            <div data-tour-target="telemetry-hud">
              <TelemetryHud
                telemetry={telemetry}
                currentStage={2}
                selectedObjective={selectedObjective}
              />
            </div>

            {/* Main Assembly Workspace: 3D Spacecraft Stage + Stretching Side Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              {/* Left 3D Spacecraft Stage */}
              <div className="lg:col-span-7 flex flex-col">
                <InteractiveSpacecraftStage
                  activeSlot={activeSlot}
                  onSelectSlot={setActiveSlot}
                  equippedLabels={equippedLabels}
                  configuredSlots={configuredSlots}
                />
              </div>

              {/* Right Side Subsystem Inspector (Flexes to fill vertical space) */}
              <div
                data-tour-target="part-inspector"
                className="lg:col-span-5 flex flex-col"
              >
                <div className="flex-1 flex flex-col *:flex-1">
                  <PartSideInspector
                    activeSlot={activeSlot}
                    selectedBus={selectedBus}
                    selectedInstruments={selectedInstruments}
                    selectedLV={selectedLV}
                    selectedObjective={selectedObjective}
                    onToggleBus={handleToggleBus}
                    onToggleInstrument={handleToggleInstrument}
                    onSelectLV={handleSelectLV}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Full-Width Flight Readiness & Launch Control Console */}
            <div className="border-2 border-[#1a881a] bg-[#030903]/95 p-4 flex flex-col gap-3">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#144414] pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold tracking-widest text-amber-400">
                    FLIGHT READINESS ASSESSMENT
                  </span>
                  {isAssessing && (
                    <svg
                      className="w-3.5 h-3.5 text-amber-400 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  )}
                </div>

                {isAssessing ? (
                  <span className="text-xs font-bold px-2 py-0.5 border border-amber-400/70 text-amber-300 bg-amber-500/10">
                    RUNNING DIAGNOSTICS...
                  </span>
                ) : (
                  assessmentResult && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 border ${
                        assessmentResult.passed
                          ? 'border-[#33ff33] text-[#33ff33] bg-[#33ff33]/10'
                          : 'border-red-500 text-red-400 bg-red-950/30'
                      }`}
                    >
                      {assessmentResult.status} // RANK {assessmentResult.rank} (
                      {assessmentResult.score} PTS)
                    </span>
                  )
                )}
              </div>

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1 w-full">
                  {assessmentResult ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-[11px]">
                      {assessmentResult.feedbackLog.map((line, i) => (
                        <div
                          key={i}
                          className={
                            line.includes('FAILED') || line.includes('VIOLATION')
                              ? 'text-red-400'
                              : line.includes('WARNING') || line.includes('RISK PROFILE')
                              ? 'text-amber-400'
                              : 'text-[#28d828]'
                          }
                        >
                          &gt; {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#1a881a]">
                      CONFIGURE ALL 5 HARDPOINTS AND RUN PRE-LAUNCH VERIFICATION TO CHECK
                      MASS, POWER, POINTING, AND COOLING REQUIREMENTS.
                    </p>
                  )}
                </div>

                {/* Target 05: Launch Controls */}
                <div
                  data-tour-target="launch-button"
                  className="flex flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto shrink-0"
                >
                  <button
                    type="button"
                    onClick={handleRunAssessment}
                    className="flex-1 lg:flex-initial py-2.5 px-4 border border-amber-400 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-xs font-bold tracking-wider cursor-pointer"
                  >
                    RUN READINESS CHECK
                  </button>

                  <button
                    type="button"
                    disabled={!assessmentResult?.passed}
                    onClick={handleLaunch}
                    className={`flex-1 lg:flex-initial py-2.5 px-5 border text-xs font-bold tracking-wider transition-all ${
                      assessmentResult?.passed
                        ? 'border-[#33ff33] bg-[#33ff33]/25 text-[#33ff33] hover:bg-[#33ff33]/40 cursor-pointer shadow-[0_0_15px_rgba(51,255,51,0.35)]'
                        : 'border-[#144414] text-[#144414] cursor-not-allowed'
                    }`}
                  >
                    INITIATE LAUNCH ►
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <MissionHelpModal
        isOpen={showHelpModal}
        onClose={() => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('vabTourSeen', 'true');
          }
          setShowHelpModal(false);
        }}
        onSelectSlot={setActiveSlot}
      />
    </div>
  );
}
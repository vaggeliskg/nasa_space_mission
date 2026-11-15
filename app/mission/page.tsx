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
  DIFFICULTY_LEVELS,
  DifficultyLevel,
  DifficultyConfig,
} from '../data/missionData';
import { OrbitRegime } from '../data/orbitData';
import { Objective, LaunchVehicle, TelemetryData } from '../types/mission';
import { evaluateMission, MissionEvaluationResult } from '../lib/evaluateMission';
import { sound } from '../lib/sound';

export default function SoloMissionPlanning() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'objective' | 'assembly'>('objective');
  const [selectedObjective, setSelectedObjective] = useState<Objective>(OBJECTIVES[0]);
  const [pendingObjective, setPendingObjective] = useState<Objective | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const [selectedOrbit, setSelectedOrbit] = useState<OrbitRegime | null>(null);
  const [activeSlot, setActiveSlot] = useState<SpacecraftPartSlot | null>(null);

  // Selected components state (empty by default so all 5 hardpoints start unassigned)
  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedLV, setSelectedLV] = useState<LaunchVehicle | null>(null);

  // Evaluation & Tutorial states
  const [assessmentResult, setAssessmentResult] =
    useState<MissionEvaluationResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Helper to resolve budget cap by mission type & difficulty
  const getDifficultyBudget = (obj: Objective, diff: DifficultyConfig): number => {
    const isTelecom =
      obj.id.toLowerCase().includes('telecom') ||
      obj.id.toLowerCase().includes('comm') ||
      obj.name.toLowerCase().includes('telecom');

    return isTelecom ? diff.budgets.telecom : diff.budgets.starObservation;
  };

  // Close Difficulty modal when pressing Escape
  useEffect(() => {
    if (!pendingObjective) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        setPendingObjective(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingObjective]);

  // Restore Mission Path (with difficulty budget) + Confirmed Orbit Regime when returning from /orbits
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawMission = sessionStorage.getItem('selectedMissionPath');
    const rawOrbit = sessionStorage.getItem('selectedOrbitRegime');
    const savedDiff = sessionStorage.getItem('selectedDifficulty') as DifficultyLevel | null;

    if (savedDiff) {
      setSelectedDifficulty(savedDiff);
    }

    if (rawMission) {
      try {
        const parsedMission = JSON.parse(rawMission) as Objective;
        const matched = OBJECTIVES.find((o) => o.id === parsedMission.id);
        if (matched) {
          setSelectedObjective({
            ...matched,
            maxBudget: parsedMission.maxBudget ?? matched.maxBudget,
          });
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

  // Auto-open VAB Guide tour on first entry into assembly view
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

  // Step 1A: Click Mission Path -> open Difficulty modal
  const handleSelectObjective = (obj: Objective) => {
    sound.playClick();
    setPendingObjective(obj);
  };

  // Step 1B: Confirm Difficulty -> apply budget cap -> save to sessionStorage -> push to /orbits
  const handleConfirmDifficulty = (diff: DifficultyConfig) => {
    if (!pendingObjective) return;
    sound.playBoot();

    const overriddenObjective: Objective = {
      ...pendingObjective,
      maxBudget: getDifficultyBudget(pendingObjective, diff),
    };

    setSelectedDifficulty(diff.id);
    setSelectedObjective(overriddenObjective);
    setSelectedInstruments([]);
    setAssessmentResult(null);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedMissionPath', JSON.stringify(overriddenObjective));
      sessionStorage.setItem('selectedDifficulty', diff.id);
      sessionStorage.removeItem('selectedOrbitRegime');
    }

    setPendingObjective(null);
    router.push('/orbits');
  };

  // Toggle Bus component (one per subCategory so each sub-tab can hold an equipped part)
  const handleToggleBus = (id: string) => {
    const target = BUS_COMPONENTS.find((b) => b.id === id);
    if (!target) return;

    setSelectedBus((prev) => {
      const isAlreadyEquipped = prev.includes(id);
      const filtered = prev.filter((existingId) => {
        const existing = BUS_COMPONENTS.find((b) => b.id === existingId);
        return existing?.subCategory !== target.subCategory;
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

  // Live Spacecraft Telemetry Calculation (includes 5x Radio Power Rule & Contact Multiplier)
  const telemetry: TelemetryData = useMemo(() => {
    let mass = 250; // Dry chassis base mass (kg)
    let cost = 35; // Base integration & engineering cost (€M)
    let powerGen = 0;
    let powerDraw = 80; // Baseline housekeeping draw (W)
    let dataDownlinkCapacity = 0;
    let contactMultiplier = 1;
    let scienceScore = 0;

    selectedBus.forEach((bId) => {
      const comp = BUS_COMPONENTS.find((c) => c.id === bId);
      if (!comp) return;
      mass += comp.mass;
      cost += comp.cost;

      if (comp.powerDelta > 0) {
        powerGen += comp.powerDelta;
      } else if (comp.rfTransmitWatts) {
        // Power rule: Radio draws 5x the power it transmits
        powerDraw += comp.rfTransmitWatts * 5;
      } else {
        powerDraw += Math.abs(comp.powerDelta);
      }

      if (comp.dataDownlink) {
        dataDownlinkCapacity += comp.dataDownlink;
      }
      if (comp.contactMultiplier) {
        contactMultiplier = Math.max(contactMultiplier, comp.contactMultiplier);
      }
    });

    dataDownlinkCapacity = Math.round(dataDownlinkCapacity * contactMultiplier * 10) / 10;

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
    const getSlotSummary = (cat: 'power' | 'comm' | 'propulsion' | 'adcs' | 'systems') => {
      const names = selectedBus
        .map((bId) => BUS_COMPONENTS.find((c) => c.id === bId))
        .filter((c) => c?.category === cat)
        .map((c) => c!.name);
      return names.length > 0 ? `${names.length} EQUIPPED` : 'UNASSIGNED';
    };

    return {
      power: getSlotSummary('power'),
      comm: getSlotSummary('comm'),
      propulsion: selectedLV ? selectedLV.name : getSlotSummary('propulsion'),
      adcs:
        selectedInstruments.length > 0
          ? `${selectedInstruments.length} PAYLOAD(S)`
          : getSlotSummary('adcs'),
      systems: getSlotSummary('systems'),
    };
  }, [selectedBus, selectedInstruments, selectedLV]);

  const configuredSlots = useMemo(() => {
    const set = new Set<SpacecraftPartSlot>();
    selectedBus.forEach((bId) => {
      const cat = BUS_COMPONENTS.find((c) => c.id === bId)?.category;
      if (cat) set.add(cat);
    });
    if (selectedLV) set.add('propulsion');
    if (selectedInstruments.length > 0) set.add('adcs');
    return set;
  }, [selectedBus, selectedInstruments, selectedLV]);

  // Run Pre-Launch Flight Readiness Assessment with 3-second diagnostic delay
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
          difficulty: selectedDifficulty,
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
                {selectedOrbit ? ` // ORBIT: ${selectedOrbit.name}` : ''} //{' '}
                {selectedDifficulty.toUpperCase()} (€{selectedObjective.maxBudget}M)
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

        {/* VIEW 1: MISSION PATH SELECTION + DIFFICULTY MODAL */}
        {viewMode === 'objective' ? (
          <div className="my-auto py-4">
            <StageObjective
              selected={selectedObjective}
              onSelect={handleSelectObjective}
            />

            {/* DIFFICULTY & BUDGET CAP OVERLAY */}
            {pendingObjective && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="w-full max-w-2xl border-2 border-[#33ff33] bg-[#030903] p-6 shadow-[0_0_30px_rgba(51,255,51,0.3)] flex flex-col gap-5 font-mono">
                  <div className="flex justify-between items-start border-b border-[#144414] pb-3">
                    <div>
                      <div className="text-[10px] tracking-widest text-amber-400">
                        PHASE 01B // FUNDING ALLOCATION &amp; DIFFICULTY
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-[#33ff33] mt-0.5">
                        SELECT MISSION BUDGET TIER — {pendingObjective.name.toUpperCase()}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPendingObjective(null);
                      }}
                      className="px-2.5 py-1 border border-[#144414] text-xs text-[#1a881a] hover:border-[#33ff33] hover:text-[#33ff33] cursor-pointer"
                    >
                      [ESC]
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DIFFICULTY_LEVELS.map((diff) => {
                      const budget = getDifficultyBudget(pendingObjective, diff);
                      return (
                        <button
                          key={diff.id}
                          type="button"
                          onClick={() => handleConfirmDifficulty(diff)}
                          className="p-4 border-2 border-[#1a881a] bg-[#041004]/90 hover:border-[#33ff33] hover:bg-[#33ff33]/15 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold tracking-wider text-[#33ff33] group-hover:text-white">
                              {diff.label}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 border border-amber-400/70 text-amber-300 bg-amber-500/10">
                              €{budget}M CAP
                            </span>
                          </div>
                          <div className="text-[10px] tracking-widest text-amber-400">
                            {diff.tag}
                          </div>
                          <p className="text-[11px] text-[#22bb22] leading-snug">
                            {diff.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
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

              {/* Right Side Subsystem Inspector (Locks to 3D stage's exact height on lg+) */}
              <div
                data-tour-target="part-inspector"
                className="lg:col-span-5 relative min-h-105 lg:min-h-0"
              >
                <div className="lg:absolute lg:inset-0 flex flex-col min-h-0">
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
                  {isAssessing ? (
                    <div className="flex items-center gap-2 text-xs text-amber-300">
                      <svg
                        className="w-4 h-4 text-amber-400 animate-spin shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                      <span>
                        VERIFYING MASS, POWER, POINTING, AND COOLING MARGINS...
                      </span>
                    </div>
                  ) : assessmentResult ? (
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
                    disabled={isAssessing}
                    onClick={handleRunAssessment}
                    className={`flex-1 lg:flex-initial py-2.5 px-4 border text-xs font-bold tracking-wider ${
                      isAssessing
                        ? 'border-amber-500/40 text-amber-500/50 cursor-not-allowed'
                        : 'border-amber-400 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 cursor-pointer'
                    }`}
                  >
                    {isAssessing ? 'ASSESSING...' : 'RUN READINESS CHECK'}
                  </button>

                  <button
                    type="button"
                    disabled={!assessmentResult?.passed || isAssessing}
                    onClick={handleLaunch}
                    className={`flex-1 lg:flex-initial py-2.5 px-5 border text-xs font-bold tracking-wider transition-all ${
                      assessmentResult?.passed && !isAssessing
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
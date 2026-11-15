'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '../components/StarField';
import TelemetryHud from '../components/mission/TelemetryHud';
import StageObjective from '../components/mission/StageObjective';
import InteractiveSpacecraftStage, {
  SpacecraftPartSlot,
} from '../components/mission/InteractiveSpacecraftStage';
import PartSideInspector, {
  InspectorSubTabKey,
} from '../components/mission/PartSideInspector';
import MissionHelpModal from '../components/mission/MissionHelpModal';
import {
  OBJECTIVES,
  BUS_COMPONENTS,
  INSTRUMENTS,
  DIFFICULTY_LEVELS,
  DifficultyLevel,
  DifficultyConfig,
  calculateBusSelectionTotals,
  getActiveLVConfig,
  getLauncherMaxPayload,
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
  const [activeSubTab, setActiveSubTab] = useState<InspectorSubTabKey | null>(null);

  const [selectedBus, setSelectedBus] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedLV, setSelectedLV] = useState<LaunchVehicle | null>(null);

  const [assessmentResult, setAssessmentResult] =
    useState<MissionEvaluationResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const getDifficultyBudget = (obj: Objective, diff: DifficultyConfig): number => {
    const isTelecom =
      obj.id.toLowerCase().includes('telecom') ||
      obj.id.toLowerCase().includes('comm') ||
      obj.name.toLowerCase().includes('telecom');

    return isTelecom ? diff.budgets.telecom : diff.budgets.starObservation;
  };

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

  const handleSelectObjective = (obj: Objective) => {
    sound.playClick();
    setPendingObjective(obj);
  };

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

  // Single-select toggle for non-battery bus subCategories (one per subCategory)
  const handleToggleBus = (id: string) => {
    const target = BUS_COMPONENTS.find((b) => b.id === id);
    if (!target) return;

    if (target.subCategory === 'batteries') {
      handleAdjustBusQuantity(id, 1);
      return;
    }

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

  // Stackable + / - quantity adjuster for batteries
  const handleAdjustBusQuantity = (id: string, delta: number) => {
    const target = BUS_COMPONENTS.find((b) => b.id === id);
    if (!target) return;

    setSelectedBus((prev) => {
      if (delta > 0) {
        const next = [...prev];
        for (let i = 0; i < delta; i++) {
          next.push(id);
        }
        return next;
      } else if (delta < 0) {
        const next = [...prev];
        for (let i = 0; i < Math.abs(delta); i++) {
          const idx = next.lastIndexOf(id);
          if (idx !== -1) next.splice(idx, 1);
        }
        return next;
      }
      return prev;
    });
    setAssessmentResult(null);
  };

  // Single-select Payload Instrument (only one payload can be equipped at a time; no stacking)
  const handleToggleInstrument = (id: string) => {
    setSelectedInstruments((prev) => (prev.includes(id) ? [] : [id]));
    setAssessmentResult(null);
  };

  // Select Launch Vehicle
  const handleSelectLV = (lv: LaunchVehicle) => {
    setSelectedLV(lv);
    setAssessmentResult(null);
  };

const telemetry: TelemetryData = useMemo(() => {
    const busTotals = calculateBusSelectionTotals(selectedBus, selectedOrbit);

    let mass = 0 + busTotals.mass; // Dry chassis base mass (kg) + bus
    let cost = 35 + busTotals.cost; // Base integration & engineering cost (€M) + bus
    const powerGen = busTotals.bolPower;
    let powerDraw = 80 + busTotals.powerDraw; // Baseline housekeeping draw (W) + bus
    const dataDownlinkCapacity =
      Math.round(busTotals.dataDownlink * busTotals.contactMultiplier * 10) / 10;

    // Payloads contribute mass, cost, and power draw only (do not alter scienceScore or datalink)
    selectedInstruments.forEach((iId) => {
      const inst = INSTRUMENTS.find((i) => i.id === iId);
      if (!inst) return;
      mass += inst.mass;
      cost += inst.cost;
      powerDraw += inst.power;
    });

    const activeCfg = getActiveLVConfig(selectedLV);
    if (activeCfg) {
      cost += activeCfg.cost;
    }

    mass = Math.round(mass * 100) / 100;
    cost = Math.round(cost * 1000) / 1000;

    const netPower = powerGen - powerDraw;
    const rawCap = getLauncherMaxPayload(selectedLV, selectedOrbit, selectedObjective);
    const maxCapacity = rawCap ?? 0;

    const massMargin = Math.round((maxCapacity - mass) * 100) / 100;
    const budgetMargin = Math.round((selectedObjective.maxBudget - cost) * 1000) / 1000;

    const isLaunchViable =
      Boolean(selectedLV) &&
      maxCapacity > 0 &&
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
      batteryWh: busTotals.totalBatteryWh,
      dataGenerated: 0,
      dataDownlinkCapacity,
      scienceScore: 0,
      minScience: selectedObjective.minScience,
      isLaunchViable,
    };
  }, [selectedBus, selectedInstruments, selectedLV, selectedObjective, selectedOrbit]);

  const equippedLabels: Record<SpacecraftPartSlot, string> = useMemo(() => {
    const getSlotSummary = (cat: 'power' | 'comm' | 'propulsion' | 'adcs' | 'systems') => {
      const count = selectedBus
        .map((bId) => BUS_COMPONENTS.find((c) => c.id === bId))
        .filter((c) => c?.category === cat).length;
      return count > 0 ? `${count} EQUIPPED` : 'UNASSIGNED';
    };

    const activeCfg = getActiveLVConfig(selectedLV);
    const equippedPayloadName =
      selectedInstruments.length > 0
        ? INSTRUMENTS.find((i) => i.id === selectedInstruments[0])?.name
        : undefined;

    return {
      power: getSlotSummary('power'),
      comm: getSlotSummary('comm'),
      propulsion:
        selectedLV && activeCfg
          ? `${selectedLV.name} (${activeCfg.name})`
          : getSlotSummary('propulsion'),
      adcs: equippedPayloadName ?? getSlotSummary('adcs'),
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
        selectedObjective,
        selectedOrbit
      );
      setAssessmentResult(result);
      setIsAssessing(false);
      sound.playBlip();
    }, 3000);
  };

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
                {selectedOrbit
                  ? ` // ORBIT: ${selectedOrbit.name}${
                      selectedOrbit.id === 'LEO' && selectedOrbit.selectedInclination
                        ? ` (${selectedOrbit.selectedInclination.deg}°)`
                        : ''
                    }`
                  : ''}{' '}
                // {selectedDifficulty.toUpperCase()} (€{selectedObjective.maxBudget}M)
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

        {viewMode === 'objective' ? (
          <div className="my-auto py-4">
            <StageObjective
              selected={selectedObjective}
              onSelect={handleSelectObjective}
            />

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
          <>
            <div data-tour-target="telemetry-hud">
              <TelemetryHud
                telemetry={telemetry}
                currentStage={2}
                selectedObjective={selectedObjective}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
              <div className="lg:col-span-7 flex flex-col">
                <InteractiveSpacecraftStage
                  activeSlot={activeSlot}
                  onSelectSlot={setActiveSlot}
                  equippedLabels={equippedLabels}
                  configuredSlots={configuredSlots}
                  showRocketPreview={
                    activeSlot === 'propulsion' &&
                    activeSubTab === 'launch_vehicle' &&
                    Boolean(selectedLV)
                  }
                  rocketLabel={
                    selectedLV
                      ? `${selectedLV.name} (${getActiveLVConfig(selectedLV)?.name ?? ''})`
                      : undefined
                  }
                />
              </div>

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
                    selectedOrbit={selectedOrbit}
                    onToggleBus={handleToggleBus}
                    onAdjustBusQuantity={handleAdjustBusQuantity}
                    onToggleInstrument={handleToggleInstrument}
                    onSelectLV={handleSelectLV}
                    onSubTabChange={setActiveSubTab}
                  />
                </div>
              </div>
            </div>

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
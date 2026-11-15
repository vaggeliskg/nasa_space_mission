'use client';

import { useState, useEffect } from 'react';
import { SpacecraftPartSlot } from './InteractiveSpacecraftStage';
import { Objective, LaunchVehicle, BusSubCategory, BusComponent } from '../../types/mission';
import { OrbitRegime } from '../../data/orbitData';
import {
  BUS_COMPONENTS,
  INSTRUMENTS,
  LAUNCH_VEHICLES,
  getActiveLVConfig,
  getLauncherMaxPayload,
  getOrbitTargetLabel,
} from '../../data/missionData';
import { sound } from '../../lib/sound';

export type InspectorSubTabKey = BusSubCategory | 'payload_instruments' | 'launch_vehicle';

interface PartSideInspectorProps {
  activeSlot: SpacecraftPartSlot | null;
  selectedObjective: Objective;
  selectedOrbit: OrbitRegime | null;
  selectedBus: string[];
  selectedInstruments: string[];
  selectedLV: LaunchVehicle | null;
  onToggleBus: (id: string) => void;
  onAdjustBusQuantity?: (id: string, delta: number) => void;
  onToggleInstrument: (id: string) => void;
  onSelectLV: (lv: LaunchVehicle) => void;
  onSubTabChange?: (tabKey: InspectorSubTabKey | null) => void;
}

interface SubTabDef {
  key: InspectorSubTabKey;
  label: string;
  ruleBanner?: string;
}

const SLOT_CONFIG: Record<
  SpacecraftPartSlot,
  {
    code: string;
    title: string;
    tabs: SubTabDef[];
  }
> = {
  power: {
    code: 'HP-01 // ELECTRICAL POWER SYSTEM',
    title: 'BATTERIES & SOLAR ARRAYS',
    tabs: [
      {
        key: 'batteries',
        label: '1.1 BATTERIES',
        ruleBanner: 'STACKABLE: Use + / - to stack multiple battery packs.',
      },
      { key: 'solar_panels', label: '1.2 SOLAR PANELS' },
    ],
  },
  comm: {
    code: 'HP-02 // COMMUNICATIONS & GROUND LINK',
    title: 'FREQUENCY, CONTACT & TRANSCEIVER',
    tabs: [
      { key: 'comm_frequency', label: '2.1 FREQUENCY' },
      { key: 'comm_contact', label: '2.2 CONTACT TIME' },
      {
        key: 'comm_transceiver',
        label: '2.3 RADIO TX',
        ruleBanner: 'POWER RULE: Radio draws 5× the RF power it transmits.',
      },
    ],
  },
  propulsion: {
    code: 'HP-03 // ORBITAL MANEUVERING',
    title: '3.1 PROPULSION & LAUNCH BOOSTER',
    tabs: [
      { key: 'propulsion', label: '3.1 PROPULSION' },
      { key: 'launch_vehicle', label: '3.2 LAUNCH VEHICLE' },
    ],
  },
  adcs: {
    code: 'HP-04 // ATTITUDE & PAYLOAD BAY',
    title: '4.1 ADCS & SCIENCE PAYLOAD',
    tabs: [
      { key: 'adcs', label: '4.1 ADCS (ATTITUDE)' },
      { key: 'payload_instruments', label: '4.2 PAYLOAD' },
    ],
  },
  systems: {
    code: 'HP-05 // SPACECRAFT BUS & SURVIVABILITY',
    title: 'STRUCTURE, SHIELDING, THERMAL, OBC & EOL',
    tabs: [
      { key: 'structure', label: '5.1 STRUCTURE' },
      { key: 'radiation', label: '5.2 RADIATION' },
      { key: 'thermal', label: '5.3 THERMAL' },
      { key: 'obc', label: '5.4 OBC' },
      { key: 'eol', label: '5.5 END OF LIFE' },
    ],
  },
};

function formatComponentPrice(item: BusComponent, qty = 1): string {
  if (item.priceEur) {
    if (qty > 1) {
      const totalEur =
        item.priceEur + (qty - 1) * (item.extraUnitPriceEur ?? item.priceEur);
      return `€${totalEur.toLocaleString()} (${qty}x)`;
    }
    return `€${item.priceEur.toLocaleString()}`;
  }
  return `€${item.cost}M`;
}

export default function PartSideInspector({
  activeSlot,
  selectedObjective,
  selectedOrbit,
  selectedBus,
  selectedInstruments,
  selectedLV,
  onToggleBus,
  onAdjustBusQuantity,
  onToggleInstrument,
  onSelectLV,
  onSubTabChange,
}: PartSideInspectorProps) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    setActiveTabIndex(0);
  }, [activeSlot]);

  useEffect(() => {
    if (!onSubTabChange) return;
    if (!activeSlot) {
      onSubTabChange(null);
      return;
    }
    const tabs = SLOT_CONFIG[activeSlot].tabs;
    const safeIdx = Math.min(activeTabIndex, tabs.length - 1);
    onSubTabChange(tabs[safeIdx]?.key ?? null);
  }, [activeSlot, activeTabIndex, onSubTabChange]);

  if (!activeSlot) {
    return (
      <aside className="w-full h-full border-2 border-[#144414] bg-[#030803]/95 p-5 flex flex-col justify-center items-center text-center gap-3">
        <div className="text-xs font-bold tracking-widest text-amber-400">
          [AWAITING HARDPOINT SELECTION]
        </div>
        <p className="text-xs text-[#22bb22] leading-relaxed">
          Click any glowing hardpoint node on the 3D spacecraft to inspect and configure its subsystems.
        </p>
      </aside>
    );
  }

  const slotMeta = SLOT_CONFIG[activeSlot];
  const safeTabIndex = Math.min(activeTabIndex, slotMeta.tabs.length - 1);
  const currentTab = slotMeta.tabs[safeTabIndex];

  const isTelecomMission =
    selectedObjective.id.toLowerCase().includes('telecom') ||
    selectedObjective.id.toLowerCase().includes('comm') ||
    selectedObjective.name.toLowerCase().includes('telecom');

  const missionInstruments = INSTRUMENTS.filter((inst) =>
    isTelecomMission ? inst.path === 'telecom' : inst.path === 'star_obs'
  );

  const visibleItems =
    currentTab.key === 'payload_instruments'
      ? missionInstruments
      : currentTab.key === 'launch_vehicle'
      ? LAUNCH_VEHICLES
      : BUS_COMPONENTS.filter((c) => c.subCategory === currentTab.key);

  const canGoBack = safeTabIndex > 0;
  const canGoNext = safeTabIndex < slotMeta.tabs.length - 1;

  const handleBack = () => {
    if (!canGoBack) return;
    sound.playClick();
    setActiveTabIndex(safeTabIndex - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    sound.playClick();
    setActiveTabIndex(safeTabIndex + 1);
  };

  const orbitTargetLabel = getOrbitTargetLabel(selectedOrbit, selectedObjective);

  return (
    <aside className="w-full h-full min-h-0 border-2 border-[#1a881a] bg-[#030803]/95 p-3.5 flex flex-col gap-2.5 overflow-hidden">
      {/* Header & Sub-Tabs */}
      <div className="border-b border-[#144414] pb-2 shrink-0">
        <div className="text-[10px] tracking-widest text-amber-400">{slotMeta.code}</div>
        <div className="text-sm font-bold text-[#33ff33] mt-0.5">{slotMeta.title}</div>

        <div className="flex flex-wrap gap-1 mt-2">
          {slotMeta.tabs.map((tab, idx) => {
            const isTabActive = idx === safeTabIndex;
            const hasSelection =
              tab.key === 'payload_instruments'
                ? selectedInstruments.length > 0
                : tab.key === 'launch_vehicle'
                ? Boolean(selectedLV)
                : selectedBus.some(
                    (id) => BUS_COMPONENTS.find((b) => b.id === id)?.subCategory === tab.key
                  );

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTabIndex(idx);
                }}
                className={`px-2 py-1 text-[9px] font-bold tracking-wider border transition-all cursor-pointer ${
                  isTabActive
                    ? 'border-[#33ff33] bg-[#33ff33]/20 text-[#33ff33]'
                    : hasSelection
                    ? 'border-[#1a881a] bg-[#041204] text-[#28d828] hover:border-[#33ff33]'
                    : 'border-[#144414] text-[#1a881a] hover:border-[#1a881a] hover:text-[#33ff33]'
                }`}
              >
                {hasSelection ? `✓ ${tab.label}` : tab.label}
              </button>
            );
          })}
        </div>

        {currentTab.ruleBanner && (
          <div className="mt-2 px-2 py-1 border border-amber-500/60 bg-amber-500/10 text-[10px] font-bold text-amber-300">
            ⚡ {currentTab.ruleBanner}
          </div>
        )}

        {currentTab.key === 'launch_vehicle' && (
          <div className="mt-2 px-2 py-1 border border-[#144414] bg-[#041004] text-[10px] font-bold text-[#28d828]">
            TARGET REGIME: <span className="text-amber-400">{orbitTargetLabel}</span>
          </div>
        )}
      </div>

      {/* Scrollable Option Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-2">
        {currentTab.key === 'payload_instruments' &&
          (visibleItems as typeof INSTRUMENTS).map((inst) => {
            const isSelected = selectedInstruments.includes(inst.id);
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onToggleInstrument(inst.id);
                }}
                className={`p-2.5 border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_10px_rgba(51,255,51,0.25)]'
                    : 'border-[#144414] hover:border-[#1a881a]'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs text-[#33ff33]">{inst.name}</span>
                  {isSelected && (
                    <span className="text-[9px] text-amber-400 font-bold shrink-0">
                      [EQUIPPED]
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#22bb22] mt-1 leading-snug">{inst.description}</p>
                <div className="mt-1.5 text-[10px] font-bold text-amber-400">
                  +{inst.science} PTS | -{inst.power}W | {inst.mass}kg | €{inst.cost}M
                </div>
              </button>
            );
          })}

        {currentTab.key === 'launch_vehicle' &&
          (visibleItems as typeof LAUNCH_VEHICLES).map((lv) => {
            const isSelected = lv.id === selectedLV?.id;
            const effectiveLV: LaunchVehicle =
              isSelected && selectedLV ? selectedLV : lv;
            const activeCfg = getActiveLVConfig(effectiveLV)!;
            const cap = getLauncherMaxPayload(
              effectiveLV,
              selectedOrbit,
              selectedObjective
            );

            return (
              <div
                key={lv.id}
                onClick={() => {
                  sound.playClick();
                  onSelectLV(effectiveLV);
                }}
                className={`p-2.5 border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_10px_rgba(51,255,51,0.25)]'
                    : 'border-[#144414] hover:border-[#1a881a]'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs text-[#33ff33]">{lv.name}</span>
                  {isSelected && (
                    <span className="text-[9px] text-amber-400 font-bold shrink-0">
                      [SELECTED // {activeCfg.name.toUpperCase()}]
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#22bb22] mt-1 leading-snug">{lv.description}</p>

                <div className="mt-2 pt-1.5 border-t border-[#144414]/80">
                  <div className="text-[9px] tracking-wider text-[#1a881a] mb-1">
                    BOOSTER CONFIGURATION:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lv.configurations.map((cfg) => {
                      const isCfgActive = activeCfg.id === cfg.id;
                      return (
                        <button
                          key={cfg.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playClick();
                            onSelectLV({
                              ...lv,
                              selectedConfigId: cfg.id,
                            });
                          }}
                          className={`px-2 py-0.5 border text-[9px] font-bold tracking-wider cursor-pointer transition-all ${
                            isCfgActive
                              ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                              : 'border-[#144414] bg-[#040c04] text-[#22bb22] hover:border-[#1a881a]'
                          }`}
                        >
                          {cfg.name} (€{cfg.cost}M)
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-bold">
                  {cap !== null && cap > 0 ? (
                    <span className="text-amber-400">
                      MAX PAYLOAD ({orbitTargetLabel}): {cap.toLocaleString()} KG | COST: €
                      {activeCfg.cost}M
                    </span>
                  ) : (
                    <span className="text-red-400">
                      NOT RATED FOR {orbitTargetLabel} (0 KG) | COST: €{activeCfg.cost}M
                    </span>
                  )}
                </div>
              </div>
            );
          })}

        {/* STACKABLE BATTERIES (1.1 BATTERIES WITH + AND - CONTROLS) */}
        {currentTab.key === 'batteries' &&
          (visibleItems as BusComponent[]).map((item) => {
            const qty = selectedBus.filter((id) => id === item.id).length;
            const isSelected = qty > 0;
            const totalWh = (item.batteryCapacityWh ?? 0) * qty;
            const totalMass =
              qty > 0
                ? Math.round(
                    (item.mass + (qty - 1) * (item.extraUnitMass ?? item.mass)) * 100
                  ) / 100
                : item.mass;

            const adjustQty = (delta: number) => {
              sound.playClick();
              if (onAdjustBusQuantity) {
                onAdjustBusQuantity(item.id, delta);
              } else {
                onToggleBus(item.id);
              }
            };

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (qty === 0) adjustQty(1);
                }}
                className={`p-2.5 border text-left transition-all ${
                  isSelected
                    ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_10px_rgba(51,255,51,0.25)]'
                    : 'border-[#144414] hover:border-[#1a881a] cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs text-[#33ff33]">{item.name}</span>

                  {/* + / - Stack Counter */}
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={qty === 0}
                      onClick={() => adjustQty(-1)}
                      className={`w-6 h-6 border text-xs font-bold flex items-center justify-center ${
                        qty > 0
                          ? 'border-[#33ff33] bg-[#041404] text-[#33ff33] hover:bg-[#33ff33]/20 cursor-pointer'
                          : 'border-[#144414] text-[#144414] cursor-not-allowed'
                      }`}
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-xs font-bold text-amber-400">
                      {qty}x
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustQty(1)}
                      className="w-6 h-6 border border-[#33ff33] bg-[#041404] text-[#33ff33] hover:bg-[#33ff33]/20 text-xs font-bold flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {item.fits && (
                  <div className="text-[9px] text-amber-300/90 mt-0.5">
                    FITS: {item.fits.toUpperCase()}
                  </div>
                )}

                <p className="text-[10px] text-[#22bb22] mt-1 leading-snug">{item.description}</p>

                <div className="mt-1.5 text-[10px] font-bold text-amber-400">
                  {qty > 0
                    ? `TOTAL: ${totalWh.toLocaleString()} Wh | ${totalMass} kg | ${formatComponentPrice(
                        item,
                        qty
                      )}`
                    : `UNIT: ${item.batteryCapacityWh} Wh | ${item.mass} kg | ${formatComponentPrice(
                        item,
                        1
                      )}`}
                </div>
              </div>
            );
          })}

        {/* ALL OTHER BUS SUB-TABS (INCLUDING SOLAR PANELS P2–P5) */}
        {currentTab.key !== 'payload_instruments' &&
          currentTab.key !== 'launch_vehicle' &&
          currentTab.key !== 'batteries' &&
          (visibleItems as BusComponent[]).map((item) => {
            const isSelected = selectedBus.includes(item.id);
            const effectiveDraw = item.rfTransmitWatts
              ? item.rfTransmitWatts * 5
              : item.powerDelta < 0
              ? Math.abs(item.powerDelta)
              : 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onToggleBus(item.id);
                }}
                className={`p-2.5 border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_10px_rgba(51,255,51,0.25)]'
                    : 'border-[#144414] hover:border-[#1a881a]'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs text-[#33ff33]">{item.name}</span>
                  {isSelected && (
                    <span className="text-[9px] text-amber-400 font-bold shrink-0">[EQUIPPED]</span>
                  )}
                </div>

                {item.fits && (
                  <div className="text-[9px] text-amber-300/90 mt-0.5">
                    FITS: {item.fits.toUpperCase()}
                  </div>
                )}

                <p className="text-[10px] text-[#22bb22] mt-1 leading-snug">{item.description}</p>
                <div className="mt-1.5 text-[10px] font-bold text-amber-400">
                  {item.powerDelta > 0
                    ? `+${item.powerDelta}W`
                    : effectiveDraw > 0
                    ? `-${effectiveDraw}W`
                    : '0W'}{' '}
                  | {item.mass}kg | {formatComponentPrice(item, 1)}
                  {item.rfTransmitWatts
                    ? ` | TX: ${item.rfTransmitWatts}W → DRAW: ${item.rfTransmitWatts * 5}W`
                    : ''}
                  {item.deltaVAdded ? ` | +${item.deltaVAdded} m/s Δv` : ''}
                  {item.pointingAccuracyArcsec ? ` | ${item.pointingAccuracyArcsec}"` : ''}
                </div>
              </button>
            );
          })}
      </div>

      {/* Bottom Sub-Tab Navigation Bar */}
      <div className="shrink-0 pt-2 border-t border-[#144414] flex justify-between items-center gap-2">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={handleBack}
          className={`px-2.5 py-1 border text-[10px] font-bold tracking-wider ${
            canGoBack
              ? 'border-[#1a881a] text-[#33ff33] hover:bg-[#33ff33]/15 cursor-pointer'
              : 'border-[#144414] text-[#144414] cursor-not-allowed'
          }`}
        >
          ◄ BACK
        </button>

        <span className="text-[10px] text-[#1a881a] tracking-widest">
          {currentTab.label} ({safeTabIndex + 1}/{slotMeta.tabs.length})
        </span>

        <button
          type="button"
          disabled={!canGoNext}
          onClick={handleNext}
          className={`px-2.5 py-1 border text-[10px] font-bold tracking-wider ${
            canGoNext
              ? 'border-[#1a881a] text-[#33ff33] hover:bg-[#33ff33]/15 cursor-pointer'
              : 'border-[#144414] text-[#144414] cursor-not-allowed'
          }`}
        >
          NEXT ►
        </button>
      </div>
    </aside>
  );
}
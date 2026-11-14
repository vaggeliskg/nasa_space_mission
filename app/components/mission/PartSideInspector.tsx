'use client';

import { SpacecraftPartSlot } from './InteractiveSpacecraftStage';
import { Objective, LaunchVehicle } from '../../types/mission';
import { BUS_COMPONENTS, INSTRUMENTS, LAUNCH_VEHICLES } from '../../data/missionData';
import { sound } from '../../lib/sound';

interface PartSideInspectorProps {
  activeSlot: SpacecraftPartSlot | null;
  selectedObjective: Objective;
  selectedBus: string[];
  selectedInstruments: string[];
  selectedLV: LaunchVehicle | null;
  onToggleBus: (id: string, category: 'power' | 'comm' | 'adcs') => void;
  onToggleInstrument: (id: string) => void;
  onSelectLV: (lv: LaunchVehicle) => void;
}

const SLOT_TITLES: Record<SpacecraftPartSlot, { code: string; title: string; hint: string }> = {
  power: {
    code: 'HP-01 // ELECTRICAL POWER SYSTEM',
    title: 'SOLAR ARRAYS & GENERATION',
    hint: 'Select primary power source to maintain positive wattage margin.',
  },
  comm: {
    code: 'HP-02 // TELEMETRY & TRACKING',
    title: 'COMMUNICATIONS ANTENNA',
    hint: 'High-gain parabolic or optical systems increase downlink capacity.',
  },
  adcs: {
    code: 'HP-03 // ATTITUDE DETERMINATION',
    title: 'GUIDANCE & ADCS CORE',
    hint: 'Controls slew agility and arcsecond pointing precision.',
  },
  payload: {
    code: 'HP-04 // SCIENTIFIC INSTRUMENT BAY',
    title: 'ORBITAL SENSORS (MULTI-SELECT)',
    hint: 'Mount instruments to reach the science quota and unlock orbital scans.',
  },
  launcher: {
    code: 'HP-05 // PROPULSION & INSERTION',
    title: 'LAUNCH VEHICLE SELECTION',
    hint: 'Determines maximum total payload mass capacity to target orbit.',
  },
};

export default function PartSideInspector({
  activeSlot,
  selectedObjective,
  selectedBus,
  selectedInstruments,
  selectedLV,
  onToggleBus,
  onToggleInstrument,
  onSelectLV,
}: PartSideInspectorProps) {
  if (!activeSlot) {
    return (
      <aside className="w-full lg:w-97.5 shrink-0 border-2 border-[#144414] bg-[#030803]/95 p-5 flex flex-col justify-center items-center text-center gap-3">
        <div className="text-xs font-bold tracking-widest text-amber-400">
          [AWAITING HARDPOINT SELECTION]
        </div>
        <p className="text-xs text-[#22bb22] leading-relaxed">
          Click any glowing hardpoint node on the 3D spacecraft to inspect and configure its subsystem or payload specs.
        </p>
      </aside>
    );
  }

  const header = SLOT_TITLES[activeSlot];
  const busItems =
    activeSlot === 'power' || activeSlot === 'comm' || activeSlot === 'adcs'
      ? BUS_COMPONENTS.filter((c) => c.category === activeSlot)
      : [];

  return (
    <aside className="w-full lg:w-97.5 shrink-0 border-2 border-[#1a881a] bg-[#030803]/95 p-4 flex flex-col gap-3 max-h-125 overflow-y-auto">
      <div className="border-b border-[#144414] pb-2">
        <div className="text-[10px] tracking-widest text-amber-400">{header.code}</div>
        <div className="text-sm font-bold text-[#33ff33] mt-0.5">{header.title}</div>
        <p className="text-[10px] text-[#1a881a] mt-1 leading-snug">{header.hint}</p>
      </div>

      {/* BUS SUBSYSTEMS (POWER, COMM, ADCS) */}
      {(activeSlot === 'power' || activeSlot === 'comm' || activeSlot === 'adcs') && (
        <div className="flex flex-col gap-2.5">
          {busItems.map((item) => {
            const isSelected = selectedBus.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleBus(item.id, item.category)}
                className={`p-3 border text-left transition-all cursor-pointer ${
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
                <p className="text-[10px] text-[#22bb22] mt-1 leading-snug">{item.desc}</p>
                <div className="mt-2 text-[10px] font-bold text-amber-400">
                  {item.powerDelta > 0 ? `+${item.powerDelta}W` : `${item.powerDelta}W`} | {item.mass}kg | ${item.cost}M
                  {item.dataDownlink ? ` | ${item.dataDownlink} kbps` : ''}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* PAYLOAD INSTRUMENTS (MULTI-SELECT) */}
      {activeSlot === 'payload' && (
        <div className="flex flex-col gap-2.5">
          {INSTRUMENTS.map((inst) => {
            const isSelected = selectedInstruments.includes(inst.id);
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => onToggleInstrument(inst.id)}
                className={`p-3 border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_10px_rgba(51,255,51,0.25)]'
                    : 'border-[#144414] hover:border-[#1a881a]'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs text-[#33ff33]">{inst.name}</span>
                  <span className="text-[9px] text-amber-400 font-bold shrink-0">
                    {isSelected ? '[MOUNTED]' : '[+ MOUNT]'}
                  </span>
                </div>
                <p className="text-[10px] text-[#22bb22] mt-1 leading-snug">{inst.desc}</p>
                <div className="mt-2 text-[10px] font-bold text-amber-400">
                  +{inst.science} PTS | -{inst.power}W | {inst.mass}kg | ${inst.cost}M
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* LAUNCH VEHICLE OPTIONS */}
      {activeSlot === 'launcher' && (
        <div className="flex flex-col gap-2.5">
          {LAUNCH_VEHICLES.map((lv) => {
            const isSelected = lv.id === selectedLV?.id;
            const cap =
              selectedObjective.id === 'earth_obs'
                ? lv.maxPayloadLEO
                : lv.maxPayloadDeepSpace;
            return (
              <button
                key={lv.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectLV(lv);
                }}
                className={`p-3 border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_10px_rgba(51,255,51,0.25)]'
                    : 'border-[#144414] hover:border-[#1a881a]'
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs text-[#33ff33]">{lv.name}</span>
                  {isSelected && (
                    <span className="text-[9px] text-amber-400 font-bold shrink-0">[SELECTED]</span>
                  )}
                </div>
                <p className="text-[10px] text-[#22bb22] mt-1 leading-snug">{lv.desc}</p>
                <div className="mt-2 text-[10px] font-bold text-amber-400">
                  MAX PAYLOAD: {cap}kg | COST: ${lv.cost}M | REL: {lv.reliability}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
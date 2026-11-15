'use client';

import { Objective, TelemetryData } from '../../types/mission';

interface Props {
  currentStage: number;
  selectedObjective: Objective;
  telemetry: TelemetryData;
}

const STAGE_TITLES = [
  'MISSION DIRECTIVE',
  'BUS SUBSYSTEMS',
  'SCIENCE PAYLOAD',
  'LAUNCH VEHICLE',
  'MISSION READINESS REVIEW',
];

export default function TelemetryHud({ currentStage, selectedObjective, telemetry }: Props) {
  return (
    <header className="border-2 border-[#1a881a] bg-[#030803]/95 p-4 shadow-[0_0_25px_rgba(26,136,26,0.3)]">
      <div className="flex flex-wrap items-center justify-between border-b border-[#144414] pb-2 mb-3 text-xs tracking-widest text-[#1a881a]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-[#33ff33] animate-pulse"></span>
          <span className="font-bold text-[#33ff33]">CAD-V // FLIGHT SYSTEMS WORKBENCH</span>
        </div>
        <div>TARGET: {selectedObjective.target.toUpperCase()}</div>
        <div className={telemetry.isLaunchViable ? 'text-[#33ff33]' : 'text-amber-400 animate-pulse'}>
          STATUS: {telemetry.isLaunchViable ? 'CONFIG VIABLE' : 'CONSTRAINTS VIOLATED'}
        </div>
      </div>

      {/* Real-time Engineering Resource Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="border border-[#144414] bg-[#051105] p-2">
          <div className="text-[#1a881a] flex justify-between">
            <span>MASS (kg)</span>
            <span>MAX: {telemetry.maxCapacity}</span>
          </div>
          <div className={`text-base font-bold tracking-wider mt-1 ${telemetry.massMargin < 0 ? 'text-red-500' : 'text-[#33ff33]'}`}>
            {telemetry.mass} kg
          </div>
          <div className="text-[10px] text-[#1a881a]">
            Margin: {telemetry.massMargin >= 0 ? `+${telemetry.massMargin}` : telemetry.massMargin} kg
          </div>
        </div>

        <div className="border border-[#144414] bg-[#051105] p-2">
          <div className="text-[#1a881a] flex justify-between">
            <span>BUDGET</span>
            <span>CAP: ${telemetry.maxBudget}M</span>
          </div>
          <div className={`text-base font-bold tracking-wider mt-1 ${telemetry.budgetMargin < 0 ? 'text-red-500' : 'text-[#33ff33]'}`}>
            ${telemetry.cost}M
          </div>
          <div className="text-[10px] text-[#1a881a]">
            Balance: {telemetry.budgetMargin >= 0 ? `+$${telemetry.budgetMargin}M` : `-$${Math.abs(telemetry.budgetMargin)}M`}
          </div>
        </div>

        <div className="border border-[#144414] bg-[#051105] p-2">
          <div className="text-[#1a881a] flex justify-between items-start">
            <span>POWER NET</span>
            <div className="text-right leading-tight">
              <div>GEN: {telemetry.powerGen}W</div>
              <div className="text-[10px] text-amber-400 font-bold">
                BAT: {(telemetry.batteryWh ?? 0).toLocaleString()} Wh
              </div>
            </div>
          </div>
          <div className={`text-base font-bold tracking-wider mt-1 ${telemetry.netPower < 0 ? 'text-red-500' : 'text-[#33ff33]'}`}>
            {telemetry.netPower >= 0 ? `+${telemetry.netPower} W` : `${telemetry.netPower} W`}
          </div>
          <div className="text-[10px] text-[#1a881a]">Draw: {telemetry.powerDraw} W</div>
        </div>  

        <div className="border border-[#144414] bg-[#051105] p-2">
          <div className="text-[#010201] flex justify-between">
            <span>DATA LINK</span>
            <span>CAP: {telemetry.dataDownlinkCapacity}</span>
          </div>
          <div className={`text-base font-bold tracking-wider mt-1 ${telemetry.dataDownlinkCapacity < telemetry.dataGenerated ? 'text-amber-400' : 'text-[#33ff33]'}`}>
            {telemetry.dataGenerated} MB/d
          </div>
          <div className="text-[10px] text-[#1a881a]">
            {telemetry.dataDownlinkCapacity >= telemetry.dataGenerated ? 'NOMINAL COVERAGE' : 'BUFFER BOTTLENECK'}
          </div>
        </div>

        <div className="border border-[#144414] bg-[#051105] p-2 col-span-2 md:col-span-1">
          <div className="text-[#1a881a] flex justify-between">
            <span>SCIENCE PTS</span>
            <span>REQ: {telemetry.minScience}</span>
          </div>
          <div className={`text-base font-bold tracking-wider mt-1 ${telemetry.scienceScore < telemetry.minScience ? 'text-amber-400' : 'text-[#33ff33]'}`}>
            {telemetry.scienceScore} PTS
          </div>
          <div className="text-[10px] text-[#1a881a]">
            Target: {Math.round((telemetry.scienceScore / telemetry.minScience) * 100)}% met
          </div>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div className="mt-4 pt-3 border-t border-[#144414]">
        <div className="flex justify-between text-[11px] mb-1 text-[#1a881a] tracking-wider font-bold">
          <span>PHASE {currentStage} OF 5: {STAGE_TITLES[currentStage - 1]}</span>
          <span>{currentStage * 20}% STAGED</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 h-2.5 bg-[#051105] p-0.5 border border-[#144414]">
          {[1, 2, 3, 4, 5].map((stage) => (
            <div
              key={stage}
              className={`h-full transition-all duration-300 ${
                stage <= currentStage ? 'bg-[#33ff33] shadow-[0_0_8px_rgba(51,255,51,0.6)]' : 'bg-[#0a200a]'
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
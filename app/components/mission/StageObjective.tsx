'use client';

import { Objective } from '../../types/mission';
import { OBJECTIVES } from '../../data/missionData';

interface Props {
  selected: Objective;
  onSelect: (obj: Objective) => void;
}

export default function StageObjective({ selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-sm tracking-widest text-[#33ff33] border-b border-[#144414] pb-2 mb-4 font-bold">
        &gt; SELECT PRIMARY SCIENTIFIC OBJECTIVE
      </h2>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {OBJECTIVES.map((obj) => {
          const isSelected = selected.id === obj.id;
          return (
            <div
              key={obj.id}
              onClick={() => onSelect(obj)}
              className={`cursor-pointer p-3.5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#33ff33] bg-[#33ff33]/15 shadow-[0_0_15px_rgba(51,255,51,0.2)]'
                  : 'border-[#144414] bg-[#051105] hover:border-[#1a881a]'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-[#33ff33] flex justify-between items-center mb-1">
                  <span>{obj.name}</span>
                  {isSelected && <span>[ACTIVE]</span>}
                </div>
                <div className="text-[10px] text-[#1a881a] mb-2">{obj.target}</div>
                <p className="text-xs text-[#20aa20] mb-3 leading-relaxed">{obj.description}</p>
              </div>
              <div className="border-t border-[#144414] pt-2 text-[11px] space-y-1 text-[#1a881a]">
                <div className="flex justify-between">
                  <span>BUDGET CAP:</span>
                  <span className="text-[#33ff33] font-bold">${obj.maxBudget}M</span>
                </div>
                <div className="flex justify-between">
                  <span>MIN SCIENCE:</span>
                  <span className="text-[#33ff33] font-bold">{obj.minScience} PTS</span>
                </div>
                <div className="flex justify-between">
                  <span>LIFETIME:</span>
                  <span className="text-[#33ff33]">{obj.lifespanYears} YEARS</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
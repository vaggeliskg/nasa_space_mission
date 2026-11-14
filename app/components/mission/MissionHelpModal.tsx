'use client';

import { useState, useEffect, useCallback } from 'react';
import { sound } from '../../lib/sound';
import { SpacecraftPartSlot } from './InteractiveSpacecraftStage';

interface MissionHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlot?: (slot: SpacecraftPartSlot | null) => void;
}

interface TourStep {
  code: string;
  tag: string;
  title: string;
  targetSelector: string;
  slotToSelect?: SpacecraftPartSlot | null;
  summary: string;
  whyItMatters: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    code: '01 // TELEMETRY HUD',
    tag: 'VAB // LIVE CONSTRAINTS',
    title: 'MASS, POWER, SCIENCE & BUDGET BAR',
    targetSelector: '[data-tour-target="telemetry-hud"]',
    slotToSelect: null,
    summary:
      'Tracks total spacecraft mass (kg), net electrical power (Watts), Science Yield (PTS), and remaining mission funds in real time.',
    whyItMatters:
      'All margins must stay positive (green) before Flight Readiness authorizes launch.',
  },
  {
    code: '02 // HP-01 POWER',
    tag: 'VAB // ELECTRICAL',
    title: 'POWER GENERATION (SOLAR / RTG)',
    targetSelector: '[data-tour-target="part-inspector"]',
    slotToSelect: 'power',
    summary:
      'Supplies continuous electrical wattage for flight avionics, radios, attitude thrusters, and scientific instruments.',
    whyItMatters:
      'If power draw exceeds power generation, sensors brown out and launch is blocked.',
  },
  {
    code: '03 // HP-02 & HP-03',
    tag: 'VAB // COMMS & ADCS',
    title: 'COMMUNICATIONS & ATTITUDE CONTROL',
    targetSelector: '[data-tour-target="part-inspector"]',
    slotToSelect: 'comm',
    summary:
      'Communications antennas downlink science data to Earth, while ADCS reaction wheels aim and stabilize the spacecraft.',
    whyItMatters:
      'High-rate instruments need matching downlink bandwidth and stable pointing accuracy.',
  },
  {
    code: '04 // HP-04 PAYLOAD',
    tag: 'VAB // SENSORS',
    title: 'SCIENTIFIC INSTRUMENTS',
    targetSelector: '[data-tour-target="part-inspector"]',
    slotToSelect: 'payload',
    summary:
      'Equip Optical Imagers, SAR, Spectrometers, or Magnetometers to generate Science Points.',
    whyItMatters:
      'You must meet the mission minimum Science Yield—and orbital targets require matching sensor types.',
  },
  {
    code: '05 // HP-05 & LAUNCH',
    tag: 'VAB // PROPULSION',
    title: 'BOOSTER SELECTION & LAUNCH',
    targetSelector: '[data-tour-target="launch-button"]',
    slotToSelect: 'launcher',
    summary:
      'Select a launch booster rated for your spacecraft mass in HP-05, then click EXECUTE LAUNCH once all checks turn green.',
    whyItMatters:
      'Every booster has a strict payload mass ceiling—heavier science rigs require stronger rockets.',
  },
];

interface RectBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function MissionHelpModal({
  isOpen,
  onClose,
  onSelectSlot,
}: MissionHelpModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<RectBox | null>(null);
  const [cardRect, setCardRect] = useState<RectBox | null>(null);
  const [cardEl, setCardEl] = useState<HTMLDivElement | null>(null);

  const current = TOUR_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!isOpen) return;
    if (onSelectSlot && current.slotToSelect !== undefined) {
      onSelectSlot(current.slotToSelect);
    }
  }, [isOpen, stepIndex, current.slotToSelect, onSelectSlot]);

  const updatePositions = useCallback(() => {
    if (!isOpen) return;

    const targetEl = document.querySelector(current.targetSelector) as HTMLElement | null;
    if (targetEl) {
      const r = targetEl.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setTargetRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }

    if (cardEl) {
      const cr = cardEl.getBoundingClientRect();
      setCardRect({
        top: cr.top,
        left: cr.left,
        width: cr.width,
        height: cr.height,
      });
    }
  }, [isOpen, current.targetSelector, cardEl]);

  useEffect(() => {
    if (!isOpen) return;
    updatePositions();
    const raf = requestAnimationFrame(updatePositions);
    const timeout = setTimeout(updatePositions, 60);
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [isOpen, stepIndex, updatePositions]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStepIndex(0);
    if (onSelectSlot) onSelectSlot(null);
    onClose();
  };

  const handleNext = () => {
    sound.playClick();
    if (isLast) {
      handleClose();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isFirst) return;
    sound.playClick();
    setStepIndex((prev) => prev - 1);
  };

  let arrowPath = '';
  let arrowEnd = { x: 0, y: 0 };

  const isTopBarTarget = Boolean(targetRect && targetRect.top < 200);
  const isPointingRight = Boolean(
    targetRect && !isTopBarTarget && targetRect.left > window.innerWidth * 0.45
  );

  if (targetRect && cardRect) {
    if (isTopBarTarget) {
      const startX = cardRect.left + cardRect.width / 2;
      const startY = cardRect.top;
      const endX = Math.min(
        targetRect.left + targetRect.width - 24,
        Math.max(targetRect.left + 24, startX)
      );
      const endY = targetRect.top + targetRect.height + 6;
      const midY = (startY + endY) / 2;

      arrowPath = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
      arrowEnd = { x: endX, y: endY };
    } else {
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;

      let startX = cardCenterX;
      let startY = cardCenterY;

      if (targetCenterX > cardRect.left + cardRect.width) {
        startX = cardRect.left + cardRect.width;
      } else if (targetCenterX < cardRect.left) {
        startX = cardRect.left;
      }

      if (targetCenterY < cardRect.top) {
        startY = cardRect.top;
      } else if (targetCenterY > cardRect.top + cardRect.height) {
        startY = cardRect.top + cardRect.height;
      }

      let endX = targetCenterX;
      let endY = targetCenterY;

      if (cardCenterX < targetRect.left) {
        endX = targetRect.left - 6;
      } else if (cardCenterX > targetRect.left + targetRect.width) {
        endX = targetRect.left + targetRect.width + 6;
      }

      if (cardCenterY < targetRect.top) {
        endY = targetRect.top - 6;
      } else if (cardCenterY > targetRect.top + targetRect.height) {
        endY = targetRect.top + targetRect.height + 6;
      }

      const midX = (startX + endX) / 2;
      arrowPath = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
      arrowEnd = { x: endX, y: endY };
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      {/* SVG Spotlight Box + Arrow */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="crt-arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 9 3.5, 0 7" fill="#33ff33" />
          </marker>
        </defs>

        {targetRect && (
          <rect
            x={targetRect.left - 4}
            y={targetRect.top - 4}
            width={targetRect.width + 8}
            height={targetRect.height + 8}
            fill="rgba(51, 255, 51, 0.06)"
            stroke="#33ff33"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )}

        {arrowPath && (
          <>
            <path
              d={arrowPath}
              fill="none"
              stroke="#33ff33"
              strokeWidth="2.5"
              markerEnd="url(#crt-arrowhead)"
            />
            <circle cx={arrowEnd.x} cy={arrowEnd.y} r="4" fill="#ffb000" />
          </>
        )}
      </svg>

      {/* Non-Blocking Floating Guide Card */}
      <div
        ref={setCardEl}
        style={
          isTopBarTarget && targetRect
            ? { top: `${targetRect.top + targetRect.height + 48}px` }
            : undefined
        }
        className={`pointer-events-auto fixed ${
          isTopBarTarget
            ? 'left-6 sm:left-12'
            : isPointingRight
            ? 'bottom-6 left-6'
            : 'bottom-6 left-6 sm:left-10'
        } w-[calc(100vw-3rem)] max-w-md border-2 border-[#33ff33] bg-[#030903]/95 p-4 font-mono text-[#33ff33] shadow-[0_0_30px_rgba(51,255,51,0.4)] transition-all duration-200`}
      >
        <div className="flex justify-between items-center border-b border-[#144414] pb-2 mb-3">
          <div className="flex items-center gap-2 text-[11px] tracking-widest">
            <span className="px-1.5 py-0.5 bg-[#33ff33]/20 border border-[#33ff33] font-bold">
              VAB GUIDE
            </span>
            <span className="text-amber-400 font-bold">{current.code}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playBlip();
              handleClose();
            }}
            className="px-2 py-0.5 border border-[#1a881a] hover:border-[#33ff33] text-[10px] text-[#1a881a] hover:text-[#33ff33] cursor-pointer"
          >
            [SKIP X]
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1 mb-3">
          {TOUR_STEPS.map((step, idx) => (
            <button
              key={step.code}
              type="button"
              onClick={() => {
                sound.playBlip();
                setStepIndex(idx);
              }}
              className={`h-1.5 border cursor-pointer transition-all ${
                idx === stepIndex
                  ? 'border-[#33ff33] bg-[#33ff33]'
                  : idx < stepIndex
                  ? 'border-[#1a881a] bg-[#1a881a]/60'
                  : 'border-[#144414] bg-[#040c04]'
              }`}
              aria-label={`Step ${idx + 1}: ${step.title}`}
            />
          ))}
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="text-[9px] tracking-widest text-[#1a881a]">{current.tag}</div>
            <h3 className="text-sm font-bold tracking-wider text-[#33ff33]">{current.title}</h3>
          </div>

          <p className="text-[#28d828] leading-relaxed">{current.summary}</p>

          <div className="p-2 border border-[#144414] bg-[#040e04] text-[11px] text-amber-300 leading-snug">
            <span className="font-bold text-amber-400">WHY IT MATTERS: </span>
            {current.whyItMatters}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#144414] flex justify-between items-center">
          <button
            type="button"
            disabled={isFirst}
            onClick={handlePrev}
            className={`px-3 py-1.5 border text-[11px] font-bold tracking-wider ${
              isFirst
                ? 'border-[#144414] text-[#144414] cursor-not-allowed'
                : 'border-[#1a881a] text-[#33ff33] hover:border-[#33ff33] cursor-pointer'
            }`}
          >
            ◄ PREV
          </button>

          <span className="text-[10px] text-[#1a881a] tracking-widest">
            {stepIndex + 1} / {TOUR_STEPS.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-1.5 border border-[#33ff33] bg-[#33ff33]/20 hover:bg-[#33ff33]/35 text-[#33ff33] text-[11px] font-bold tracking-widest cursor-pointer shadow-[0_0_10px_rgba(51,255,51,0.3)]"
          >
            {isLast ? 'BUILD SPACECRAFT ✓' : 'NEXT ►'}
          </button>
        </div>
      </div>
    </div>
  );
}
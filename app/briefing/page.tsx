'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Starfield from '../components/StarField';
import { sound } from '../lib/sound';

const BRIEFING_PARAGRAPHS = [
  'INCOMING TRANSMISSION // DEEP SPACE MISSION DIRECTORATE...',
  'WELCOME, LEAD SPACECRAFT SYSTEMS ARCHITECT. YOU HAVE BEEN ASSIGNED TO DIRECT NEXT-GENERATION ORBITAL AND PLANETARY RECONNAISSANCE OPERATIONS.',
  'YOUR OBJECTIVE: SELECT A PRIMARY SCIENTIFIC MISSION, INTEGRATE CRITICAL SPACECRAFT SUBSYSTEMS IN THE VEHICLE ASSEMBLY BUILDING (POWER, COMMS, ADCS, SCIENTIFIC PAYLOADS, AND LAUNCH BOOSTER), AND BALANCE MASS, POWER BUDGETS, AND FUNDING.',
  'ONCE YOUR SPACECRAFT PASSES FLIGHT READINESS VERIFICATION, LAUNCH INTO ORBIT AND SCAN TARGET ANOMALIES TO COMPLETE YOUR SCIENTIFIC MANDATE.',
];

const FULL_TEXT = BRIEFING_PARAGRAPHS.join('\n\n');

export default function BriefingPage() {
  const router = useRouter();
  const [charCount, setCharCount] = useState(0);
  const lastSoundTimeRef = useRef(0);

  const isComplete = charCount >= FULL_TEXT.length;

useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setCharCount((prev) => {
        const next = prev + 1;
        const currentChar = FULL_TEXT[prev];

        // Only play typing sound on visible characters (skip spaces & line breaks)
        if (currentChar && currentChar !== ' ' && currentChar !== '\n') {
          const now = performance.now();
          if (now - lastSoundTimeRef.current > 42) {
            sound.playType();
            lastSoundTimeRef.current = now;
          }
        }

        return next;
      });
    }, 26);

    return () => clearInterval(timer);
  }, [isComplete]);

  const handleScreenClick = () => {
    if (!isComplete) {
      sound.playClick();
      setCharCount(FULL_TEXT.length);
    }
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playBoot();
    router.push('/orbits');
  };

  // Split currently revealed substring back into paragraphs for clean spacing
  const visibleText = FULL_TEXT.slice(0, charCount);
  const visibleParagraphs = visibleText.split('\n\n');

  return (
    <main
      onClick={handleScreenClick}
      className="crt-container relative min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 select-none cursor-pointer"
    >
      <Starfield />

      <div className="relative z-10 w-full max-w-3xl border-2 border-[#1a881a] bg-[#030803]/95 p-6 sm:p-10 shadow-[0_0_30px_rgba(26,136,26,0.25)]">
        {/* Top Terminal Header */}
        <div className="flex justify-between items-center border-b border-[#144414] pb-3 mb-6 text-xs tracking-widest text-[#1a881a]">
          <span className="text-[#33ff33]">
            {isComplete ? '[TRANSMISSION COMPLETE]' : '[RECEIVING STREAM... CLICK TO SKIP]'}
          </span>
        </div>

        {/* Typewriter Briefing Body */}
        <div className="min-h-64 space-y-5 font-mono text-sm sm:text-base leading-relaxed tracking-wide text-[#33ff33]">
          {visibleParagraphs.map((para, index) => {
            const isLastVisible = index === visibleParagraphs.length - 1;
            const isHeaderLine = index === 0;

            return (
              <p
                key={index}
                className={isHeaderLine ? 'text-amber-400 font-bold text-xs sm:text-sm tracking-widest' : ''}
              >
                {para}
                {isLastVisible && !isComplete && (
                  <span className="inline-block w-2.5 h-4 ml-1 align-middle bg-[#33ff33] animate-pulse" />
                )}
              </p>
            );
          })}
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-8 pt-5 border-t border-[#144414] flex flex-wrap justify-between items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playBlip();
              router.push('/');
            }}
            className="px-4 py-2 border border-[#144414] hover:border-[#1a881a] text-xs font-mono tracking-wider text-[#1a881a] hover:text-[#33ff33] cursor-pointer"
          >
            ◄ ABORT TO MAIN MENU
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className={`px-6 py-3 border-2 font-mono text-xs sm:text-sm font-bold tracking-widest transition-all cursor-pointer ${
              isComplete
                ? 'border-[#33ff33] bg-[#33ff33]/20 text-[#33ff33] hover:bg-[#33ff33]/35 shadow-[0_0_20px_rgba(51,255,51,0.4)]'
                : 'border-[#1a881a] bg-[#041004] text-[#22bb22] hover:border-[#33ff33] hover:text-[#33ff33]'
            }`}
          >
            CONTINUE TO VAB PLANNER ►
          </button>
        </div>
      </div>
    </main>
  );
}
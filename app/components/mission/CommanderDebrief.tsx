'use client';

import { useEffect, useRef, useState } from 'react';

const COMMANDER_SUCCESS_TEXT =
  'MISSION SUCCESS. TELEMETRY IS GREEN ACROSS THE BOARD AND ALL SYSTEM MARGINS ARE NOMINAL. I KNEW YOU HAD IT IN YOU, ENGINEER. YOU MADE THE RIGHT CHOICES IN THE DARK WHEN IT MATTERED MOST. NASA IS THANKFUL FOR YOUR SERVICE. DRINKS ARE ON HOUSTON TONIGHT. ENJOY THE WIN... TILL NEXT TIME WE NEED YOU. VANCE OUT.';

interface CommanderDebriefProps {
  imageSrc?: string;
  message?: string;
}

export default function CommanderDebrief({
  imageSrc = '/images/success_commander.png',
  message = COMMANDER_SUCCESS_TEXT,
}: CommanderDebriefProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const closeAudioContext = () => {
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  };

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    let ctx: AudioContext | null = null;
    try {
      ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      ctxRef.current = ctx;
    } catch {
      ctx = null;
    }

    const playTypingBlip = () => {
      if (!ctx || ctx.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(520 + Math.random() * 90, now);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } catch {}
    };

    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx += 1;
      setDisplayedText(message.slice(0, idx));

      const currentChar = message[idx - 1];
      if (currentChar && currentChar !== ' ' && idx % 2 === 0) {
        playTypingBlip();
      }

      if (idx >= message.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        closeAudioContext();
        setIsDone(true);
      }
    }, 32);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      closeAudioContext();
    };
  }, [message]);

  useEffect(() => {
    if (textScrollRef.current) {
      textScrollRef.current.scrollTop = textScrollRef.current.scrollHeight;
    }
  }, [displayedText]);

  const handleSkip = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    closeAudioContext();
    setDisplayedText(message);
    setIsDone(true);
  };

  return (
    <div className="mt-4 border-2 border-[#33ff33] bg-[#030b03]/95 p-4 shadow-[0_0_20px_rgba(51,255,51,0.2)]">
      <div className="text-[10px] font-bold tracking-widest text-amber-400 border-b border-[#144414] pb-1.5 mb-3 flex justify-between items-center">
        <span>INCOMING PRIORITY TRANSMISSION // COMMANDER VANCE</span>
        <span className="text-[#33ff33]">
          {isDone ? '[TRANSMISSION COMPLETE]' : '[RECEIVING...]'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-stretch gap-4">
        {/* Left: Scrollable Typewriter Briefing Text Box */}
        <div className="flex-1 min-w-0 font-mono text-xs sm:text-sm text-[#33ff33] leading-relaxed tracking-wide bg-[#020702] border border-[#144414] p-3.5 h-48 flex flex-col justify-between">
          <div
            ref={textScrollRef}
            className="flex-1 min-h-0 overflow-y-auto pr-1.5"
          >
            <p className="whitespace-pre-wrap break-words">
              {displayedText}
              {!isDone && (
                <span className="inline-block w-2 h-4 bg-[#33ff33] ml-1 align-middle animate-pulse" />
              )}
            </p>
          </div>

          {!isDone && (
            <button
              type="button"
              onClick={handleSkip}
              className="self-end shrink-0 mt-2 px-2 py-0.5 border border-[#1a881a] text-[9px] text-[#22bb22] hover:border-[#33ff33] hover:text-[#33ff33] cursor-pointer"
            >
              [SKIP BRIEFING ►]
            </button>
          )}
        </div>

        {/* Right: Commander Portrait from public/images/success_commander */}
        <div className="w-40 sm:w-48 shrink-0 border-2 border-[#1a881a] bg-[#020602] p-1.5 flex flex-col items-center justify-between">
          <img
            src={imageSrc}
            alt="Commander Vance"
            className="w-full h-44 object-cover border border-[#144414]"
          />
          <div className="w-full text-center text-[9px] font-bold tracking-widest text-amber-400 pt-1.5">
            CMDR. VANCE // FLIGHT DIR.
          </div>
        </div>
      </div>
    </div>
  );
}
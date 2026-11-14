'use client';

import { useEffect, useRef, useState } from 'react';

export default function AmbientSynth() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSynth = () => {
    if (ctxRef.current) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    // Subtle background volume
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.65;
    masterGainRef.current = masterGain;

    // Warm 80s analog low-pass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    filter.Q.value = 2.0;

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Classic 80s space-synth chord progression (Dm -> Bb -> Gm -> A)
    const chords = [
      [73.42, 146.83, 174.61, 220.0],
      [58.27, 116.54, 174.61, 233.08],
      [49.0, 146.83, 196.0, 233.08],
      [55.0, 110.0, 164.81, 220.0],
    ];

    let step = 0;
    const activeOscs: OscillatorNode[] = [];

    const playChord = (freqs: number[]) => {
      const now = ctx.currentTime;
      while (activeOscs.length) {
        const old = activeOscs.pop();
        try {
          old?.stop(now + 1.5);
        } catch {}
      }

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const voiceGain = ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = idx % 2 === 0 ? -5 : 5;

        voiceGain.gain.setValueAtTime(0.001, now);
        voiceGain.gain.exponentialRampToValueAtTime(idx === 0 ? 0.4 : 0.16, now + 1.5);
        voiceGain.gain.exponentialRampToValueAtTime(0.001, now + 5.8);

        osc.connect(voiceGain);
        voiceGain.connect(filter);
        osc.start(now);
        activeOscs.push(osc);
      });
    };

    playChord(chords[0]);
    intervalRef.current = setInterval(() => {
      step = (step + 1) % chords.length;
      playChord(chords[step]);
    }, 6000);

    setIsPlaying(true);
  };

  useEffect(() => {
    const unlock = () => {
      startSynth();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    // Automatically stops the music when leaving the main page
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      if (intervalRef.current) clearInterval(intervalRef.current);
      ctxRef.current?.close();
    };
  }, []);

  const toggleMute = () => {
    if (!ctxRef.current) {
      startSynth();
      return;
    }
    if (masterGainRef.current) {
      const nextMute = !isMuted;
      masterGainRef.current.gain.setTargetAtTime(
        nextMute ? 0 : 0.06,
        ctxRef.current.currentTime,
        0.15
      );
      setIsMuted(nextMute);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 px-2.5 py-1 bg-[#030803]/90 border border-[#1a881a] hover:border-[#33ff33] text-[10px] font-mono tracking-widest text-[#33ff33] cursor-pointer shadow-[0_0_10px_rgba(51,255,51,0.2)]"
    >
      {!isPlaying ? '♪ BGM: STANDBY' : isMuted ? '♪ BGM: OFF' : '♪ BGM: ON'}
    </button>
  );
}
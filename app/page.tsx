'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sound } from './lib/sound';
import Starfield from './components/StarField';
import AmbientSynth from './components/AmbientSynth';

export default function WelcomeScreen() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = [
    {
      id: 'solo',
      title: '[ 1 ] PLAY SOLO',
      subtext: 'SINGLE PLAYER // MISSION PLANNING',
      path: '/briefing',
    },
    {
      id: 'multiplayer',
      title: '[ 2 ] MULTIPLAYER',
      subtext: 'JOIN OR HOST LOBBY (CURRENTLY UNAVAILABLE)',
      path: '/lobby',
    },
  ];

  useEffect(() => {
    sound.playBoot();
  }, []);

  // Keyboard navigation: Up/Down/1/2/Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sound.playBlip();
        setSelectedIndex((prev) => (prev === 0 ? 1 : 0));
      } else if (e.key === '1') {
        sound.playClick();
        setSelectedIndex(0);
        router.push(options[0].path);
      } else if (e.key === '2') {
        sound.playClick();
        setSelectedIndex(1);
        router.push(options[1].path);
      } else if (e.key === 'Enter') {
        sound.playClick();
        router.push(options[selectedIndex].path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, router, options]);

  const handleSelect = (idx: number, path: string) => {
    sound.playClick();
    setSelectedIndex(idx);
    router.push(path);
  };

  const handleHover = (idx: number) => {
    if (selectedIndex !== idx) {
      sound.playBlip();
      setSelectedIndex(idx);
    }
  };

  return (
    <div className="crt-container relative min-h-screen flex items-center justify-center p-4 sm:p-8 select-none overflow-hidden">
      <Starfield />
      <AmbientSynth />

      {/* Main Terminal Frame */}
      <div className="relative z-10 w-full max-w-2xl border-2 border-[#1a881a] bg-[#030803]/92 backdrop-blur-[2px] shadow-[0_0_40px_rgba(26,136,26,0.35)] flex flex-col">
        
        {/* Terminal Header */}
        <header className="border-b border-[#1a881a] bg-[#071607] px-4 py-2 flex justify-between items-center text-xs tracking-widest text-[#1a881a]">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#33ff33] animate-pulse"></span>
            <span>TERMINAL ID: SOL-84</span>
          </div>
          <div>V3.86 ACTIVE</div>
        </header>

        {/* Console Body */}
        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          
          <pre className="font-mono text-[8px] sm:text-[10px] md:text-[11px] leading-tight text-[#33ff33] mb-3 overflow-x-auto drop-shadow-[0_0_10px_rgba(51,255,51,0.6)]">
{`
  ___ ___  _   ___ ___   __  __ ___ ___ ___ ___ ___  _  _ 
 / __| _ \\/_\\ / __| __| |  \\/  |_ _/ __/ __|_ _/ _ \\| \\| |
 \\__ \\  _/ _ \\ (__| _|  | |\\/| || |\\__ \\__ \\| | (_) | .\` |
 |___/_|/_/ \\_\\___|___| |_|  |_|___|___/___/___\\___/|_|\\_|
===========================================================
                    T H E   G A M E
`}
          </pre>

          {/* Button Options */}
          <div className="w-full space-y-4 max-w-md">
            {options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onMouseEnter={() => handleHover(idx)}
                  onClick={() => handleSelect(idx, opt.path)}
                  className={`w-full text-left transition-all px-5 py-4 border block cursor-pointer ${
                    isSelected
                      ? 'border-[#33ff33] bg-[#33ff33]/15 text-[#33ff33] shadow-[0_0_20px_rgba(51,255,51,0.35)] translate-x-1'
                      : 'border-[#144414] bg-[#051105] text-[#1a881a] hover:border-[#1a881a] hover:text-[#259925]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold tracking-widest text-sm sm:text-base">
                      {isSelected ? '► ' : '  '}{opt.title}
                    </span>
                    <span className="text-[10px] text-[#33ff33] opacity-80 uppercase tracking-widest">
                      {isSelected ? '[READY]' : '[STANDBY]'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#1a881a] mt-1 pl-4 tracking-wider">
                    {opt.subtext}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-[11px] text-[#1a881a] tracking-widest">
            USE <span className="text-[#33ff33]">[↑/↓]</span> OR <span className="text-[#33ff33]">[1 / 2]</span> TO EXECUTE PROTOCOL
          </div>
        </div>

        {/* Terminal Footer */}
        <footer className="border-t border-[#1a881a] bg-[#071607] px-4 py-2 flex justify-between items-center text-[10px] text-[#1a881a]">
          <div className="flex items-center gap-2">
            <span>READY</span>
            <span className="inline-block w-2 h-2.5 bg-[#33ff33] animate-pulse"></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
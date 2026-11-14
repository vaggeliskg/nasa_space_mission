'use client';

import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create 120 retro star particles
    const starCount = 120;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() > 0.85 ? 2.5 : Math.random() > 0.5 ? 1.5 : 1, // chunky 80s square pixels
      speed: 0.15 + Math.random() * 0.45,
      brightness: 0.2 + Math.random() * 0.8,
      twinkleSpeed: 0.01 + Math.random() * 0.03,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        // Move slowly downward
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }

        star.brightness += star.twinkleSpeed;
        if (star.brightness > 1 || star.brightness < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        // Draw vintage phosphor-tinted pixel stars
        ctx.fillStyle = `rgba(51, 255, 51, ${Math.max(0.1, Math.min(star.brightness, 0.85))})`;
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
    />
  );
}
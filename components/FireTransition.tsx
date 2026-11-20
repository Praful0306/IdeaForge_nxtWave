"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface FireTransitionContextType {
  navigateWithFire: (url: string) => void;
  triggerFire: (onMidpoint?: () => void) => void;
  isFireActive: boolean;
  fireSoundEnabled: boolean;
  setFireSoundEnabled: (val: boolean) => void;
}

const FireTransitionContext = createContext<FireTransitionContextType | null>(null);

export function FireTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFireActive, setIsFireActive] = useState(false);
  const [fireSoundEnabled, setFireSoundEnabled] = useState(true);
  const animationFrameRef = useRef<number | null>(null);

  const triggerFire = (onMidpoint?: () => void) => {
    if (isFireActive) return;
    setIsFireActive(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      if (onMidpoint) onMidpoint();
      setIsFireActive(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      if (onMidpoint) onMidpoint();
      setIsFireActive(false);
      return;
    }

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const width = canvas.width;
    const height = canvas.height;

    const startTime = performance.now();
    const duration = 900; // 900ms burn sweep
    let midpointTriggered = false;

    // Embers array
    const embers: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      color: string;
    }> = [];

    const emberColors = [
      "rgba(255, 230, 100, ",
      "rgba(255, 140, 20, ",
      "rgba(255, 60, 0, ",
      "rgba(255, 200, 40, ",
    ];

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Trigger navigation / action at peak flame coverage (45% progress)
      if (progress >= 0.45 && !midpointTriggered) {
        midpointTriggered = true;
        if (onMidpoint) onMidpoint();
      }

      ctx.clearRect(0, 0, width, height);

      // Calculate burning front line sweeping from bottom-left (0, H) to top-right (W, 0)
      // Line equation: distance along diagonal vector (W, -H)
      const diagonal = Math.sqrt(width * width + height * height);
      const sweepDist = progress * (diagonal * 1.5) - diagonal * 0.2;

      // Draw burning gradient sweep
      const gradX1 = (sweepDist / diagonal) * width;
      const gradY1 = height - (sweepDist / diagonal) * height;

      // Flame spread band
      const flameGradient = ctx.createRadialGradient(
        gradX1,
        gradY1,
        20,
        gradX1,
        gradY1,
        Math.max(width, height) * 0.9
      );

      flameGradient.addColorStop(0, "rgba(255, 240, 180, 0.95)"); // White-hot core
      flameGradient.addColorStop(0.15, "rgba(255, 130, 0, 0.85)"); // Vibrant molten gold
      flameGradient.addColorStop(0.35, "rgba(230, 40, 0, 0.75)"); // Crimson fire
      flameGradient.addColorStop(0.65, "rgba(40, 10, 5, 0.6)"); // Dark charred ash
      flameGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = flameGradient;
      ctx.fillRect(0, 0, width, height);

      // Spawn burning sparks along the active burn line
      if (progress < 0.8) {
        for (let i = 0; i < 25; i++) {
          const t = Math.random();
          const flameX = t * width + (Math.random() - 0.5) * 80;
          const flameY = height - t * height + (Math.random() - 0.5) * 80;

          embers.push({
            x: flameX,
            y: flameY,
            vx: (Math.random() - 0.3) * 6,
            vy: -Math.random() * 8 - 3,
            size: Math.random() * 4 + 1.5,
            life: 0,
            maxLife: Math.random() * 40 + 20,
            color: emberColors[Math.floor(Math.random() * emberColors.length)],
          });
        }
      }

      // Render & update embers
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.vy -= 0.15; // upward buoyancy
        e.life++;

        const alpha = Math.max(0, 1 - e.life / e.maxLife);
        ctx.fillStyle = `${e.color}${alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * alpha, 0, Math.PI * 2);
        ctx.fill();

        // Glow halo on large embers
        if (e.size > 3) {
          ctx.fillStyle = `rgba(255, 120, 0, ${alpha * 0.3})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
        }
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, width, height);
        setIsFireActive(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const navigateWithFire = (url: string) => {
    triggerFire(() => {
      router.push(url);
    });
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <FireTransitionContext.Provider
      value={{
        navigateWithFire,
        triggerFire,
        isFireActive,
        fireSoundEnabled,
        setFireSoundEnabled,
      }}
    >
      {children}
      {/* Full-screen Fire Canvas */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-[100] transition-opacity duration-200 ${
          isFireActive ? "opacity-100" : "opacity-0"
        }`}
      />
    </FireTransitionContext.Provider>
  );
}

export function useFire() {
  const context = useContext(FireTransitionContext);
  if (!context) {
    throw new Error("useFire must be used within a FireTransitionProvider");
  }
  return context;
}

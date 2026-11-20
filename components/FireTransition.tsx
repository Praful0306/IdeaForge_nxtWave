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

// Audio synthesizer for authentic paper fire crackle using Web Audio API
class FireAudioEngine {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public playFireCrackle(durationMs: number = 1300) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const duration = durationMs / 1000;

      // 1. Low frequency rumble (fire burning body)
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate brown noise for warm fire whoosh
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.5; // Gain
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(750, now + duration * 0.4);
      filter.frequency.exponentialRampToValueAtTime(180, now + duration);

      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.28, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

      // 2. Paper spark crackles (micro-bursts of high-freq clicks)
      const crackleCount = Math.floor(durationMs / 45);
      for (let c = 0; c < crackleCount; c++) {
        const burstTime = now + Math.random() * (duration * 0.85) + 0.05;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = Math.random() > 0.5 ? "triangle" : "sawtooth";
        osc.frequency.setValueAtTime(1200 + Math.random() * 3200, burstTime);

        oscGain.gain.setValueAtTime(0.001, burstTime);
        oscGain.gain.exponentialRampToValueAtTime(0.12 + Math.random() * 0.15, burstTime + 0.005);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, burstTime + 0.025 + Math.random() * 0.03);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);

        osc.start(burstTime);
        osc.stop(burstTime + 0.06);
      }
    } catch (e) {
      // Audio autoplay policy guard
    }
  }
}

const audioEngine = new FireAudioEngine();

export function FireTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isFireActive, setIsFireActive] = useState(false);
  const [fireSoundEnabled, setFireSoundEnabled] = useState(true);
  const animationFrameRef = useRef<number | null>(null);

  // Trigger realistic burning paper transition
  const triggerFire = (onMidpoint?: () => void) => {
    if (isFireActive) return;
    setIsFireActive(true);

    if (fireSoundEnabled) {
      audioEngine.playFireCrackle(1400);
    }

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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const width = canvas.width;
    const height = canvas.height;
    const diagonal = Math.sqrt(width * width + height * height);

    const startTime = performance.now();
    const duration = 1350; // 1350ms cinematic paper burn
    let midpointTriggered = false;

    // Embers and floating charred ash particles
    interface Ember {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      color: string;
      isAsh?: boolean;
    }

    const embers: Ember[] = [];

    // Pre-calculate organic edge noise seeds for consistent fractal paper burn
    const noiseOctaves = [
      { freq: 0.008, amp: 45, phase: Math.random() * 10 },
      { freq: 0.02, amp: 28, phase: Math.random() * 10 },
      { freq: 0.045, amp: 16, phase: Math.random() * 10 },
      { freq: 0.1, amp: 7, phase: Math.random() * 10 },
    ];

    const getEdgeNoise = (x: number, y: number, t: number) => {
      let n = 0;
      for (const oct of noiseOctaves) {
        n += Math.sin(x * oct.freq + oct.phase + t * 2) * Math.cos(y * oct.freq * 0.8 + oct.phase) * oct.amp;
      }
      return n;
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Trigger route transition at peak flame coverage (44% progress)
      if (progress >= 0.44 && !midpointTriggered) {
        midpointTriggered = true;
        if (onMidpoint) onMidpoint();
      }

      ctx.clearRect(0, 0, width, height);

      // Burn progress sweeps diagonally from bottom-left (0, H) towards top-right (W, 0)
      // Base diagonal distance from bottom-left corner
      const maxSweep = diagonal * 1.55;
      const currentSweep = progress * maxSweep - diagonal * 0.18;

      // Sample points along the screen diagonal to generate the jagged burn boundary
      // Screen parameter: s in [0, 1] maps along the diagonal baseline
      const sampleCount = 90;
      const burnFrontPoints: Array<{ x: number; y: number; normX: number; normY: number }> = [];

      for (let i = 0; i <= sampleCount; i++) {
        const s = i / sampleCount;
        // Point along perpendicular baseline of the sweep front
        // Direction vector from bottom-left to top-right: (width, -height) / diagonal
        // Normal vector: (height, width) / diagonal
        const nx = height / diagonal;
        const ny = width / diagonal;

        // Base center point on the sweep line
        const cx = (currentSweep / diagonal) * width;
        const cy = height - (currentSweep / diagonal) * height;

        // Spread across the perpendicular width of the screen
        const perpSpan = diagonal * 1.3;
        const offset = (s - 0.5) * perpSpan;

        let px = cx + nx * offset;
        let py = cy + ny * offset;

        // Apply organic fractal noise to simulate ripped, charred paper edge
        const noise = getEdgeNoise(px, py, progress * 4);
        px += (width / diagonal) * noise;
        py += (-height / diagonal) * noise;

        burnFrontPoints.push({ x: px, y: py, normX: width / diagonal, normY: -height / diagonal });
      }

      // --- 1. RENDER CHARRED BURN CONSUMPTION MASK ---
      // Fill the consumed region (behind the burn front) with charred dark smoke & fiery heat
      ctx.save();
      ctx.beginPath();
      // Start at bottom-left corner
      ctx.moveTo(-100, height + 100);

      // Draw through all jagged burn front points
      for (const pt of burnFrontPoints) {
        ctx.lineTo(pt.x, pt.y);
      }

      // Complete polygon to encompass the consumed side (bottom-left)
      ctx.lineTo(width + 100, -100);
      ctx.lineTo(-100, -100);
      ctx.closePath();

      // Deep charred gradient across the consumed area
      const charGrad = ctx.createLinearGradient(0, height, width, 0);
      charGrad.addColorStop(0, "rgba(5, 3, 2, 0.98)"); // Pitch black charred paper
      charGrad.addColorStop(0.35, "rgba(25, 12, 5, 0.92)"); // Scorched dark sepia
      charGrad.addColorStop(0.7, "rgba(80, 25, 5, 0.75)"); // Fiery singed transition
      charGrad.addColorStop(1, "rgba(180, 50, 0, 0)");

      ctx.fillStyle = charGrad;
      ctx.fill();
      ctx.restore();

      // --- 2. RENDER SCORCHED PAPER BORDER (Singed Brown Halo) ---
      // Simulates the heat discoloration of the paper ahead of the fire line
      ctx.save();
      ctx.lineWidth = 42;
      ctx.strokeStyle = "rgba(110, 48, 12, 0.55)";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < burnFrontPoints.length; i++) {
        const pt = burnFrontPoints[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Dark charred charcoal rim right on the edge
      ctx.lineWidth = 14;
      ctx.strokeStyle = "rgba(18, 12, 8, 0.95)";
      ctx.beginPath();
      for (let i = 0; i < burnFrontPoints.length; i++) {
        const pt = burnFrontPoints[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // --- 3. RENDER REAL LICKING FIRE TONGUES ALONG BURNING RIM ---
      // Draw animated flame shapes dancing upward from each sample point
      ctx.save();
      for (let i = 2; i < burnFrontPoints.length - 2; i += 2) {
        const pt = burnFrontPoints[i];

        // Only draw flames if point is within visible screen bounds
        if (pt.x < -80 || pt.x > width + 80 || pt.y < -80 || pt.y > height + 80) continue;

        // Individual flame tongue height oscillating with time
        const flameSeed = i * 1.73;
        const flicker = Math.sin(elapsed * 0.015 + flameSeed) * 0.5 + 0.5;
        const tongueHeight = 35 + flicker * 45;
        const tongueWidth = 14 + flicker * 10;

        // Fire licks upward (-Y) with slight lean along burn normal
        const tipX = pt.x + (Math.sin(elapsed * 0.01 + flameSeed) * 12);
        const tipY = pt.y - tongueHeight;

        // Outer Flame (Crimson-Orange)
        ctx.beginPath();
        ctx.moveTo(pt.x - tongueWidth, pt.y);
        ctx.quadraticCurveTo(pt.x - tongueWidth * 0.8, pt.y - tongueHeight * 0.5, tipX, tipY);
        ctx.quadraticCurveTo(pt.x + tongueWidth * 0.8, pt.y - tongueHeight * 0.5, pt.x + tongueWidth, pt.y);
        ctx.closePath();

        const flameGrad = ctx.createLinearGradient(pt.x, pt.y, tipX, tipY);
        flameGrad.addColorStop(0, "rgba(255, 100, 0, 0.85)"); // Intense molten orange base
        flameGrad.addColorStop(0.5, "rgba(255, 40, 0, 0.7)"); // Vivid crimson flame
        flameGrad.addColorStop(1, "rgba(200, 20, 0, 0)"); // Fading smoky tip

        ctx.fillStyle = flameGrad;
        ctx.fill();

        // Inner Incandescent Core (White-Hot Yellow)
        const innerTongueHeight = tongueHeight * 0.6;
        const innerTongueWidth = tongueWidth * 0.55;
        const innerTipY = pt.y - innerTongueHeight;

        ctx.beginPath();
        ctx.moveTo(pt.x - innerTongueWidth, pt.y);
        ctx.quadraticCurveTo(pt.x - innerTongueWidth * 0.6, pt.y - innerTongueHeight * 0.5, tipX * 0.7 + pt.x * 0.3, innerTipY);
        ctx.quadraticCurveTo(pt.x + innerTongueWidth * 0.6, pt.y - innerTongueHeight * 0.5, pt.x + innerTongueWidth, pt.y);
        ctx.closePath();

        const coreGrad = ctx.createLinearGradient(pt.x, pt.y, tipX, innerTipY);
        coreGrad.addColorStop(0, "rgba(255, 255, 230, 0.98)"); // Incandescent white core
        coreGrad.addColorStop(0.6, "rgba(255, 200, 50, 0.9)"); // Brilliant golden yellow
        coreGrad.addColorStop(1, "rgba(255, 130, 0, 0.3)");

        ctx.fillStyle = coreGrad;
        ctx.fill();
      }
      ctx.restore();

      // --- 4. SPAWN & RENDER FLYING SPARKS & ASH EMBERS ---
      if (progress < 0.85) {
        // Spawn sparks from random points along the burning boundary
        for (let k = 0; k < 6; k++) {
          const randIdx = Math.floor(Math.random() * burnFrontPoints.length);
          const p = burnFrontPoints[randIdx];
          if (p && p.x > -50 && p.x < width + 50 && p.y > -50 && p.y < height + 50) {
            const isAsh = Math.random() < 0.25;
            embers.push({
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y + (Math.random() - 0.5) * 15,
              vx: (Math.random() - 0.35) * 7 + (width / diagonal) * 2,
              vy: -Math.random() * 8 - 4, // Fast upward draft
              size: isAsh ? Math.random() * 5 + 2 : Math.random() * 3.5 + 1.2,
              life: 0,
              maxLife: Math.random() * 45 + 25,
              color: isAsh
                ? "rgba(35, 25, 20, "
                : Math.random() > 0.4
                ? "rgba(255, 235, 120, " // Yellow spark
                : "rgba(255, 110, 20, ", // Molten orange spark
              isAsh,
            });
          }
        }
      }

      // Update and draw embers
      ctx.save();
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.vy -= 0.18; // Buoyant rising draft
        e.vx += (Math.random() - 0.5) * 0.8; // Turbulent jitter
        e.life++;

        const alpha = Math.max(0, 1 - e.life / e.maxLife);
        ctx.fillStyle = `${e.color}${alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (1 - (e.life / e.maxLife) * 0.4), 0, Math.PI * 2);
        ctx.fill();

        // Glow halo for bright sparks
        if (!e.isAsh && e.size > 2.2) {
          ctx.fillStyle = `rgba(255, 140, 20, ${alpha * 0.45})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        if (e.life >= e.maxLife) {
          embers.splice(i, 1);
        }
      }
      ctx.restore();

      // Loop or terminate
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
      {/* Full-screen Paper Burning Canvas */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-[120] transition-opacity duration-150 ${
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

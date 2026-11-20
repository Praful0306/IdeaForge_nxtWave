# Cinematic Morphism & Kinetic Frontend Engineering Skill

> **Skill Identifier:** `cinematic-morphism-frontend`  
> **Source Location:** `C:\Users\ASUS\.gemini\config\skills\cinematic-morphism-frontend\SKILL.md`  
> **Project Copy:** `docs/CINEMATIC-MORPHISM-SKILL.md`

---

## 1. Overview & Core Philosophy

Generic AI frontends constantly fall into the same lazy design trap: **monotonous purple/violet gradients, stark white flashes, cookie-cutter cards, and flat lifeless layouts**. 

This skill codifies the complete design system and animation architecture engineered during the transformation of **NagarNetra** (and inspired by high-end motion design leaders like *animation-addons.com*). It teaches agents how to construct tactile, cinematic, high-performance web frontends with:
- **Zero generic AI purple/violet gradients**
- **Zero unstyled white screens**
- **Tactile multi-morphisms** (Obsidian Glassmorphism, 3D Claymorphism, Liquid Molten Metal)
- **Elemental kinetic animations** (Procedural paper-burning transitions with audio, electric lightning arcs)
- **Circular telemetry systems** (Conical radar sweeps, orbiting satellites, SVG stroke-dashoffset progress rings)
- **Split-text kinetic scroll choreography**

---

## 2. The Color Authority: Banishing the AI Cliché

### ❌ The "Banned AI Bin"
Never generate the following combinations for modern tech, AI, or dashboard interfaces:
- `from-purple-600 to-indigo-600` (The classic lazy AI template)
- `bg-gradient-to-r from-violet-500 to-purple-700`
- Stark white card backgrounds (`bg-white` with `shadow-sm`) that flash harsh light in dark themes
- Low-contrast unstyled grey text (`text-gray-400` on white)

### ✅ The Precious Obsidian Telemetry Palette
Every interface built with this skill follows an intentional, precious, high-contrast palette:

| Token | Hex / Value | Semantic Role |
| :--- | :--- | :--- |
| **Obsidian Void** | `#070A12` / `#0B0F19` | Deep tactile canvas; absorbs glare; feels expensive and intentional |
| **Molten Amber / Flame** | `#F59E0B` / `#F97316` | High-priority CTAs, burning transitions, active telemetry, critical highlights |
| **Electric Cyan** | `#06B6D4` / `#38BDF8` | 75m geospatial radar sweeps, GPS lock, lightning arcs, telemetry pins |
| **Safety Emerald** | `#10B981` / `#059669` | Verified fixes, completed audits, SLA adherence badges, positive health |
| **Crimson Hazard** | `#EF4444` / `#DC2626` | Level 5 emergencies, live electrical wire arcing, SLA breach warnings |

---

## 3. The Tri-Morphic Design System

Modern UI moves beyond flat design by utilizing three distinct, tactile morphisms:

### A. Deep Obsidian Glassmorphism
Translucent, frosted dark obsidian with ultra-fine specular light reflections along the top rim.
```css
.morphism-glass {
  background: rgba(10, 15, 29, 0.68);
  backdrop-filter: blur(28px) saturate(170%);
  -webkit-backdrop-filter: blur(28px) saturate(170%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.75), 
    inset 0 1px 1px rgba(255, 255, 255, 0.12);
}
```

### B. Tactile Volumetric Claymorphism
Gives buttons and cards a physical, sculpted 3D feel. Utilizes **dual inner shadows** (a light specular highlight on top + a deep inset shadow on bottom) that physically depresses upon touch.
```css
.morphism-clay {
  background: linear-gradient(145deg, #141c30, #0c1220);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.5rem;
  box-shadow: 
    inset 0 2px 2px rgba(255, 255, 255, 0.14),
    inset 0 -3px 6px rgba(0, 0, 0, 0.65),
    0 16px 32px rgba(0, 0, 0, 0.55),
    0 4px 8px rgba(0, 0, 0, 0.35);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.morphism-clay:hover {
  transform: translateY(-2px);
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 
    inset 0 2px 2px rgba(255, 255, 255, 0.18),
    inset 0 -3px 6px rgba(0, 0, 0, 0.6),
    0 22px 40px rgba(0, 0, 0, 0.65),
    0 0 20px rgba(245, 158, 11, 0.15);
}

.morphism-clay:active {
  box-shadow: 
    inset 0 3px 6px rgba(0, 0, 0, 0.85),
    inset 0 -1px 2px rgba(255, 255, 255, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}
```

### C. Liquid Molten Metal Morphism
Radiant thermal depth with molten gold/amber rim reflections and fire-ember ambient drop shadows.
```css
.morphism-molten {
  background: linear-gradient(135deg, rgba(26, 18, 10, 0.85), rgba(12, 9, 6, 0.95));
  border: 1px solid rgba(245, 158, 11, 0.38);
  box-shadow: 
    inset 0 1px 2px rgba(255, 220, 100, 0.22),
    0 16px 36px -8px rgba(245, 158, 11, 0.25);
}
```

---

## 4. Kinetic Elemental Animations

### A. Authentic Paper-Burning Page Transition
A realistic burn transition does not use a flat linear gradient wipe. It simulates the physical combustion of a paper sheet:
1. **Fractal Noise Burn Edge:** Multi-octave trigonometric noise creates organic, jagged paper fibers.
2. **Singed Paper Halo:** Amber-sepia heat halo (`rgba(110, 48, 12, 0.55)`) discoloration ahead of the fire line.
3. **Charred Curled Charcoal Rim:** Dense black carbon ash line (`rgba(18, 12, 8, 0.95)`).
4. **Dancing Flame Tongues:** Layered quadratic Bezier fire shapes with incandescent white-hot cores and molten amber tips dancing upward along the boundary.
5. **Buoyant Embers & Ash:** Sparks and black paper ash flakes flying upward with turbulence.
6. **Web Audio Crackle:** Synthesized paper fire crackle (filtered brown noise + micro-crackle clicks) for immersive sensory feedback.
7. **Midpoint Route Swap:** Page navigation occurs at 44% progress when the screen is engulfed, revealing the destination page as flames clear.

### B. Electric Lightning Arc Animation
For electrical hazards, high-voltage infrastructure, or critical alert banners:
```css
@keyframes lightning-flicker {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px #06b6d4) drop-shadow(0 0 22px #38bdf8); }
  22% { opacity: 0.35; filter: drop-shadow(0 0 3px #06b6d4); }
  38% { opacity: 1; filter: drop-shadow(0 0 16px #38bdf8) drop-shadow(0 0 28px #06b6d4); }
  62% { opacity: 0.6; }
  78% { opacity: 0.92; }
}

.lightning-arc {
  animation: lightning-flicker 1.8s infinite ease-in-out;
}
```

---

## 5. Circular Telemetry & Spatial Systems

### A. Conical Radar Sweeps & Orbiting Satellites
Used for geospatial deduplication (e.g. 75m clustering) and live sensor tracking:
```css
@keyframes radar-sweep {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-radar-sweep {
  animation: radar-sweep 4s linear infinite;
  transform-origin: center;
}

@keyframes orbit-spin {
  from { transform: rotate(0deg) translateX(55px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(55px) rotate(-360deg); }
}

.animate-orbit-1 {
  animation: orbit-spin 6s linear infinite;
}
```

### B. Circular SVG Gauge Rings
Dynamic circular progress meters for SLA clocks and AI confidence scoring:
```tsx
<div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
  <svg className="w-16 h-16 -rotate-90">
    <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="5" fill="none" />
    <circle
      cx="32"
      cy="32"
      r="26"
      stroke="#10b981"
      strokeWidth="5"
      fill="none"
      strokeDasharray="163"
      strokeDashoffset="4"
      strokeLinecap="round"
    />
  </svg>
  <span className="absolute font-mono text-xs font-black text-white">98%</span>
</div>
```

---

## 6. Kinetic Scroll Choreography (The Animation-Addons Model)

When constructing landing pages, adopt the layout and animation patterns of *animation-addons.com*:

1. **Split-Text Staggered Heading:**  
   Split display titles into word/character spans and animate them sequentially with cubic-bezier spring easing.
2. **The 4-Column Proof & Trust Strip:**  
   Place a modular proof bar directly beneath hero CTAs, featuring star ratings (`4.9 / 5`), verified audit badges, active metrics, and SLA guarantees separated by sleek vertical dividers.
3. **The Numbered Motion Showcase Tabs (`01` to `05`):**  
   Replace generic feature grids with a sleek 5-tab selector where clicking each numbered pill (`01`, `02`, `03`, `04`, `05`) smoothly cross-fades the interactive demonstration on the right.
4. **The Architectural Contrast Matrix:**  
   Contrast the failure points of traditional/legacy systems (red-tinted card with ✕ failure points) against the new atomic architecture (amber-tinted card with ✓ green proof points).

---

## 7. Verification Checklist

Before shipping any frontend, run this gated verification:
- [ ] **Zero Purple Gradients:** Grep code for `purple`, `violet`, `indigo`. None should exist in brand/AI UI.
- [ ] **Zero White Screen Flashes:** Verify all cards, popups, inputs, and map wrappers use obsidian/slate tokens.
- [ ] **Tactile Feel Check:** Buttons and interactive cards must have claymorphic or glassmorphic depth with active depression.
- [ ] **Transition Integrity:** Page transitions sweep smoothly without jump cuts or white flickers.
- [ ] **60fps Performance:** Canvas particles and SVG animations must not cause frame drops or layout thrashing.

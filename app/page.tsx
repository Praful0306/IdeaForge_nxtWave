"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Mic,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  MapPin,
  ExternalLink,
  Flame,
  Zap,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  Building2,
  Award,
  Users,
  Eye,
  Check,
  Volume2,
  VolumeX,
  Play,
  Sliders,
  Shield,
  Smartphone,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFire } from "@/components/FireTransition";

// Showcase tabs modeled after animation-addons.com's interactive motion showcase
const SHOWCASE_TABS = [
  {
    id: "01",
    label: "Multimodal Vision Intake",
    tagline: "Snap, Speak, or Type in Any Indian Language",
    badge: "Gemini Vision Multi-Key",
    title: "Instant Physical Severity & Pedestrian Hazard Scoring",
    description:
      "Citizen captures a smartphone photo or speaks in Hindi, Kannada, or English. Autonomous neural vision estimates defect depth, surface area, and proximity to active traffic, assigning an empirical hazard rating from Level 1 (Cosmetic) to Level 5 (Life-Threatening Emergency).",
    stats: [
      { label: "Neural Latency", value: "219 ms" },
      { label: "Vision Precision", value: "98.4%" },
      { label: "Languages Supported", value: "12 Indian Dialects" },
    ],
    demoType: "vision",
  },
  {
    id: "02",
    label: "75m Spatial Clustering",
    tagline: "Deduplication via Real-Time Haversine Geometry",
    badge: "96% Duplicate Reduction",
    title: "Consolidate 30 Repeat Citizen Calls into 1 Master Dispatch",
    description:
      "When a water pipe bursts or a transformer sparks, dozens of citizens report the same spot within 90 minutes. Legacy city apps generate 30 separate tickets that clog call centers. NagarNetra clusters reports within 75m, transforming duplicates into high-priority upvotes (+3 priority boost).",
    stats: [
      { label: "Spatial Radius", value: "75 Meters" },
      { label: "Priority Escalation", value: "+3 Pts / Corroboration" },
      { label: "Queue Clutter Saved", value: "96% Inbox Reduction" },
    ],
    demoType: "clustering",
  },
  {
    id: "03",
    label: "Statutory SLA Enforcement",
    tagline: "Direct Municipal Routing Without Bureaucratic Lag",
    badge: "2-Hour Emergency SLA",
    title: "Autonomous Department Dispatch with Auto-Escalation",
    description:
      "Eliminates departmental ping-pong between roads, power, and water authorities. Reports route directly into BBMP, BESCOM, or BWSSB field dispatch terminals with legally binding statutory resolution timers (2 hours for Level 5, 12 hours for Level 4).",
    stats: [
      { label: "Level 5 SLA", value: "2 Hours Max" },
      { label: "Level 4 SLA", value: "12 Hours Max" },
      { label: "Breach Escalation", value: "Direct Joint Comm. Alert" },
    ],
    demoType: "sla",
  },
  {
    id: "04",
    label: "AI Before/After Photo Closure",
    tagline: "Mandatory Proof of Physical Rectification",
    badge: "Neural Compaction Audit",
    title: "No Ticket Closed Without Verified Physical Repair Proof",
    description:
      "Officers cannot close grievances with paperwork excuses. The mobile field console requires an 'After' photo from the exact GPS coordinates. The AI comparator computes visual surface restoration score (e.g. 96.8% asphalt compaction) before marking the ticket resolved.",
    stats: [
      { label: "GPS Match Required", value: "Within 10 Meters" },
      { label: "Visual Audit Confidence", value: "96.8% Average" },
      { label: "Paperwork Fraud", value: "0% Tolerated" },
    ],
    demoType: "verify",
  },
  {
    id: "05",
    label: "Zonal Telemetry Matrix",
    tagline: "Public Transparency & Real-Time Accountability",
    badge: "Live Heatmap Stream",
    title: "Citywide Real-Time Triage Heatmap & Ward Scorecards",
    description:
      "Monitors live road conditions, active emergency squads, and SLA compliance across all 198 BBMP wards. Citizens track municipal accountability on an interactive dark telemetry map with sub-second websocket synchronization.",
    stats: [
      { label: "Active Wards", value: "198 Zonal Cells" },
      { label: "Telemetry Refresh", value: "Sub-Second Live" },
      { label: "Citizen Transparency", value: "100% Public Access" },
    ],
    demoType: "telemetry",
  },
];

// Hazard scenarios for the interactive AI Triage Simulator
const SIMULATOR_SCENARIOS = [
  {
    id: "electrical",
    title: "11kV Snapped High-Tension Wire",
    location: "Indiranagar 100ft Rd, Ward 112",
    dept: "BESCOM (Electricity Supply)",
    category: "Electrical",
    severity: 5,
    sla: "2 Hours (Statutory Emergency)",
    confidence: "99.2%",
    description: "Uninsulated live overhead conductor severed during heavy squall, actively arcing against pedestrian curb.",
    actionPlan: "Auto-trigger substation feeder trip, alert BESCOM Rapid Squad 1, geofence 50m civilian perimeter.",
    duplicates: "7 citizen reports merged within 45m radius",
  },
  {
    id: "pothole",
    title: "4-Foot Submerged Monsoon Pothole",
    location: "Koramangala 80ft Road, Ward 151",
    dept: "BBMP Road Infrastructure Division",
    category: "Roads",
    severity: 4,
    sla: "12 Hours (MoRTH High-Risk)",
    confidence: "96.7%",
    description: "Deep cavity obscured by standing water. Two two-wheeler skids reported within 30 minutes.",
    actionPlan: "Deploy Zone East Jet-Patcher asphalt truck, place reflective traffic barrels, notify Traffic Police.",
    duplicates: "14 citizen reports merged within 60m radius",
  },
  {
    id: "water",
    title: "300mm Potable Water Main Rupture",
    location: "Domlur Flyover Ramp, Ward 112",
    dept: "BWSSB (Water Supply & Sewerage)",
    category: "Water Supply",
    severity: 3,
    sla: "24 Hours (Standard Infrastructure)",
    confidence: "94.5%",
    description: "Pressurized distribution pipe leaking ~8,000 liters/hr, causing road subgrade saturation.",
    actionPlan: "Isolate sector sluice valve #4, dispatch BWSSB Emergency Pipeline Squad 3 for sleeve clamp repair.",
    duplicates: "5 citizen reports merged within 30m radius",
  },
  {
    id: "sanitation",
    title: "Commercial Toxic Chemical Dumping",
    location: "Whitefield EPIP Zone, Ward 84",
    dept: "KSPCB & BBMP Solid Waste Cell",
    category: "Sanitation / Pollution",
    severity: 4,
    sla: "12 Hours (Environmental Hazard)",
    confidence: "98.1%",
    description: "Unlabeled metal drums leaking caustic alkaline liquid into roadside stormwater drain.",
    actionPlan: "Dispatch Hazardous Spill Containment unit, sample effluent for chemical fingerprinting, summon polluter.",
    duplicates: "3 citizen reports merged within 75m radius",
  },
];

// Ward matrix data
const WARD_SCOREBOARD = [
  { ward: "Ward 112 - Domlur / Indiranagar", open: 3, resolved: 14, slaAdherence: "96%", avgTime: "4.2h", status: "Optimal" },
  { ward: "Ward 151 - Koramangala", open: 5, resolved: 22, slaAdherence: "91%", avgTime: "6.8h", status: "Attention" },
  { ward: "Ward 84 - Whitefield", open: 2, resolved: 18, slaAdherence: "98%", avgTime: "3.5h", status: "Optimal" },
  { ward: "Ward 168 - Jayanagar", open: 1, resolved: 19, slaAdherence: "99%", avgTime: "2.8h", status: "Optimal" },
  { ward: "Ward 174 - HSR Layout", open: 4, resolved: 15, slaAdherence: "93%", avgTime: "5.1h", status: "Optimal" },
];

export default function HomePage() {
  const { navigateWithFire } = useFire();
  const [activeShowcase, setActiveShowcase] = useState(SHOWCASE_TABS[0]);
  const [activeScenario, setActiveScenario] = useState(SIMULATOR_SCENARIOS[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Split-text animation character/word stagger
  const headlineWords = ["Snap.", "Speak.", "Resolve."];
  const subHeadlineWords = ["AI", "Triages", "the", "City's", "Hazards."];

  return (
    <div className="space-y-28 py-6 overflow-hidden">
      {/* 1. HERO SECTION WITH SPLIT-TEXT MOTION (Inspired by Animation-Addons.com) */}
      <section className="relative pt-6 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient glow backgrounds - strictly molten amber and cyan, no purple */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-24 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Micro Pill Badge with Live Pulse */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-xl shadow-amber-500/10 backdrop-blur-md"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-mono uppercase tracking-wider">IDEA//FORGE Track 1</span>
            <span className="text-slate-500">•</span>
            <span>Autonomous Civic Infrastructure Triage</span>
          </motion.div>

          {/* Staggered Split-Text Display Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight flex flex-wrap items-center justify-center gap-x-4">
              {headlineWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight flex flex-wrap items-center justify-center gap-x-3">
              {subHeadlineWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 35 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                  className={`inline-block ${
                    i >= 1
                      ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent"
                      : "text-white"
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </h2>
          </div>

          {/* Subtitle with High-Legibility Typography */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Report broken roads, live sparking wires, pipe bursts, or garbage dumping in any Indian language.
            NagarNetra autonomous vision evaluates danger levels 1–5, deduplicates repeat complaints within 75 meters,
            and routes accountability directly to municipal dispatchers.
          </motion.p>

          {/* Action CTAs with Burning Paper Transition Triggers */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3"
          >
            <button
              onClick={() => navigateWithFire("/report")}
              className="flame-button w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 cursor-pointer shadow-2xl shadow-amber-500/25 active:scale-95 transition-all group"
            >
              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Raise Civic Grievance</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigateWithFire("/login")}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm font-bold text-slate-200 hover:text-white hover:border-amber-500/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Sign In (Citizen / Admin)</span>
            </button>

            <button
              onClick={() => navigateWithFire("/dashboard")}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 text-sm font-bold text-cyan-300 hover:bg-cyan-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Live Public Map</span>
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </button>
          </motion.div>
        </div>

        {/* 2. THE PROOF & METRICS STRIP (Modeled after Animation-Addons.com) */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="obsidian-card rounded-3xl p-6 border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
            <div className="flex flex-col items-center justify-center text-center p-3 space-y-1">
              <div className="flex items-center gap-1 text-amber-400 text-sm font-black">
                ★★★★★ <span className="text-white text-xs ml-1 font-mono">4.9 / 5</span>
              </div>
              <div className="text-xs font-bold text-white">Citizen Trust Rating</div>
              <div className="text-[11px] text-slate-400">From 1,400+ Ward Verifications</div>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-3 space-y-1">
              <div className="text-2xl font-black text-white font-mono">9,438 Lives</div>
              <div className="text-xs font-bold text-red-400">MoRTH Indian Road Record</div>
              <div className="text-[11px] text-slate-400">Why autonomous triage is critical</div>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-3 space-y-1">
              <div className="text-2xl font-black text-cyan-400 font-mono">75 Meters</div>
              <div className="text-xs font-bold text-white">Spatial Deduplication</div>
              <div className="text-[11px] text-slate-400">96% Duplicate Inbox Reduction</div>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-3 space-y-1">
              <div className="text-2xl font-black text-emerald-400 font-mono">2h SLA Target</div>
              <div className="text-xs font-bold text-white">Emergency Response</div>
              <div className="text-[11px] text-slate-400">Mandatory After-Photo Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 5-TAB FEATURE SHOWCASE (Like Animation-Addons.com Motion Tabs) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Architecture Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            When Simple City Apps Are Not Enough.
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Explore the core pillars powering India's first end-to-end autonomous civic infrastructure triage platform.
          </p>
        </div>

        {/* Showcase Tab Navigation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {SHOWCASE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveShowcase(tab)}
              className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                activeShowcase.id === tab.id
                  ? "bg-slate-900 border-amber-500/80 shadow-xl shadow-amber-500/10 text-white"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="font-mono text-xs font-black text-amber-400 mb-1">{tab.id}</div>
              <div className="text-xs sm:text-sm font-bold text-white line-clamp-1">{tab.label}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{tab.tagline}</div>
            </button>
          ))}
        </div>

        {/* Dynamic Showcase Display Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeShowcase.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="obsidian-card rounded-3xl p-6 sm:p-10 border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left 7 Columns: Explanation & Stats */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-mono font-bold">
                  {activeShowcase.badge}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeShowcase.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeShowcase.description}
              </p>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {activeShowcase.stats.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">{s.label}</div>
                    <div className="text-sm sm:text-base font-black text-amber-400 font-mono">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigateWithFire("/report")}
                  className="flame-button px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Test in Live Intake Form</span>
                </button>

                <button
                  onClick={() => navigateWithFire("/dashboard")}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white"
                >
                  View Telemetry Stream →
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Visual Interactive Widget */}
            <div className="lg:col-span-5 h-80 rounded-2xl bg-slate-950/90 border border-slate-800 p-6 flex flex-col justify-between overflow-hidden relative">
              {activeShowcase.demoType === "vision" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span>NEURAL VISION AUDIT</span>
                    <span className="text-emerald-400 font-bold">● ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-16 h-16 -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="5" fill="none" />
                        <circle cx="32" cy="32" r="26" stroke="#10b981" strokeWidth="5" fill="none" strokeDasharray="163" strokeDashoffset="4" strokeLinecap="round" />
                      </svg>
                      <span className="absolute font-mono text-xs font-black text-white">98%</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white">Defect: Crater Pothole (Depth 18cm)</div>
                      <div className="text-[11px] text-amber-400 font-mono">Vision Precision: 98.4% Confidence</div>
                      <div className="text-[10px] text-slate-400">Traffic Risk: High (Two-Wheelers Vulnerable)</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Statutory Routing: BBMP Road Maintenance • SLA: 12 Hours
                  </div>
                </div>
              )}

              {activeShowcase.demoType === "clustering" && (
                <div className="relative h-full flex flex-col items-center justify-center overflow-hidden">
                  {/* Conical sweeping radar beam */}
                  <div className="absolute w-52 h-52 rounded-full border border-cyan-500/20" />
                  <div className="absolute w-36 h-36 rounded-full border border-cyan-500/35" />
                  <div className="absolute w-52 h-52 rounded-full border-t-2 border-r-2 border-cyan-400/60 animate-radar-sweep pointer-events-none" />

                  {/* Orbiting Satellite Citations */}
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-orbit-1" />
                  <div className="absolute w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-orbit-2" />

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30 z-10 morphism-clay">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-mono text-amber-400 bg-slate-900/90 px-2.5 py-1 rounded-full border border-amber-500/30 mt-3 z-10 backdrop-blur-md">
                    1 Master Ticket (+24 Upvotes)
                  </div>
                </div>
              )}

              {activeShowcase.demoType === "sla" && (
                <div className="space-y-4">
                  <div className="text-xs font-mono text-red-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    STATUTORY SLA COUNTDOWN
                  </div>
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-center space-y-1">
                    <div className="text-3xl font-black text-red-400 font-mono">01:42:18</div>
                    <div className="text-[10px] text-red-300 font-bold uppercase">Time Remaining for BESCOM 11kV Crew</div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Auto-Escalation: Joint Commissioner SMS armed</div>
                </div>
              )}

              {activeShowcase.demoType === "verify" && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-emerald-400 font-bold">BEFORE / AFTER NEURAL AUDIT</div>
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300">
                      BEFORE: 4ft Cavity
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                      AFTER: Hot-Mix Sealed
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-center text-emerald-400 font-bold font-mono">
                    ✓ Verified Match: 96.8% Integrity
                  </div>
                </div>
              )}

              {activeShowcase.demoType === "telemetry" && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-cyan-400 font-bold">BENGALURU ZONAL CELLS</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-white">Ward 112 (Domlur)</span>
                      <span className="text-emerald-400 font-mono font-bold">96% Optimal</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-white">Ward 151 (Koramangala)</span>
                      <span className="text-amber-400 font-mono font-bold">91% In SLA</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                <span>SYSTEM STATUS // TELEMETRY NORMAL</span>
                <span className="text-emerald-400 font-bold">100% ONLINE</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. ARCHITECTURE COMPARISON (Legacy Portals vs. NagarNetra) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>Architectural Contrast</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Built from Ground Truth: Why Legacy Systems Fail
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            A side-by-side breakdown of traditional government complaint portals vs NagarNetra's autonomous engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy System Card */}
          <div className="obsidian-card rounded-3xl p-6 sm:p-8 border-red-500/30 bg-gradient-to-b from-red-950/20 to-slate-950 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-red-400 uppercase tracking-wider">
                Legacy Portals (CPGRAMS / Typical Apps)
              </span>
              <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px]">
                Bottleneck Prone
              </Badge>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-red-400 font-bold">✕</span>
                <div>
                  <strong className="text-white block">Duplicate Call Floods:</strong>
                  30 citizens call about 1 fallen wire; creates 30 disjointed tickets that overwhelm municipal call centers.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-red-400 font-bold">✕</span>
                <div>
                  <strong className="text-white block">Bureaucratic Ping-Pong:</strong>
                  Manual clerical sorting causes delays between roads, electrical, and water supply cells.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-red-400 font-bold">✕</span>
                <div>
                  <strong className="text-white block">Paper-Only Resolution:</strong>
                  Tickets get marked 'Resolved' on office computers with zero photographic proof of actual road repair.
                </div>
              </div>
            </div>
          </div>

          {/* NagarNetra Atomic Architecture Card */}
          <div className="obsidian-card rounded-3xl p-6 sm:p-8 border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-950 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">
                NagarNetra Atomic Architecture
              </span>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-bold">
                100% Autonomous
              </Badge>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">75m Spatial Clustering:</strong>
                  All nearby reports consolidate into 1 master ticket with citizen corroboration upvotes (+3 priority).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Autonomous Statutory Routing:</strong>
                  AI vision scores physical danger in 219ms and routes directly to the accountable rapid crew with a binding SLA.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">✓</span>
                <div>
                  <strong className="text-white block">Mandatory AI Photo Audit:</strong>
                  Officers cannot close a ticket without uploading an 'After' photo that passes neural compaction verification.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE AI TRIAGE SIMULATOR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Experience NagarNetra's Multimodal Brain
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Select any real-world municipal emergency below to observe instant neural classification, severity calculation, and statutory SLA routing.
          </p>
        </div>

        {/* Hazard Preset Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {SIMULATOR_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenario(sc)}
              className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                activeScenario.id === sc.id
                  ? "bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/10 text-white"
                  : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                  Level {sc.severity}
                </span>
                {activeScenario.id === sc.id && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <div className="text-xs sm:text-sm font-bold text-white line-clamp-1">{sc.title}</div>
              <div className="text-[11px] text-slate-500 mt-1">{sc.category}</div>
            </button>
          ))}
        </div>

        {/* Simulator Terminal HUD */}
        <motion.div
          key={activeScenario.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="obsidian-card rounded-3xl p-6 sm:p-8 border-slate-800 space-y-6"
        >
          {/* Terminal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-mono text-xs text-slate-400 ml-2">
                NN-TRIAGE-ENGINE // {activeScenario.id.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs font-mono font-bold">
                Confidence {activeScenario.confidence}
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs font-mono font-bold">
                {activeScenario.sla}
              </Badge>
            </div>
          </div>

          {/* Triage Output Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Hazard Classification
                </span>
                <h3 className="text-xl font-black text-white mt-1">{activeScenario.title}</h3>
                <p className="text-xs text-cyan-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {activeScenario.location}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {activeScenario.description}
              </div>

              {/* Lightning Animation for High-Voltage Electrical Arc */}
              {activeScenario.id === "electrical" && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 flex items-center gap-3 relative overflow-hidden shadow-lg shadow-cyan-500/10">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 lightning-arc shrink-0 border border-cyan-500/40">
                    <Zap className="w-5 h-5 fill-cyan-400 text-cyan-200" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                      <span>11kV LIVE ELECTRICAL ARC DETECTED</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Active arcing to pedestrian curb. Ingress geofence 50m activated.
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-2 text-xs text-cyan-300">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{activeScenario.duplicates}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Autonomous Municipal Routing
                </span>
                <div className="text-lg font-black text-amber-400 mt-1 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  {activeScenario.dept}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Automated Dispatch Orders
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {activeScenario.actionPlan}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => navigateWithFire("/admin/dashboard")}
                  className="flame-button px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Inspect in Admin Console</span>
                </button>

                <button
                  onClick={() => navigateWithFire("/report")}
                  className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>Test with your own photo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5B. TACTILE MULTI-MORPHISM STUDIO */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Sliders className="w-4 h-4" />
            <span>Tactile Morphism Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Beyond Flat UI: Three Organic Morphisms
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Zero generic AI purple gradients. Experience true tactile depth crafted with precision lighting and physical physics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Glassmorphism Card */}
          <div className="morphism-glass rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
                Morphism 01
              </span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
              Obsidian Glassmorphism
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Frosted deep obsidian substrate with 28px sub-surface blur, 170% saturation, and specular micro-reflections along the top rim.
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-cyan-400">
              <span>Backdrop: 28px Blur</span>
              <span>Light Specular: 1px Rim</span>
            </div>
          </div>

          {/* 2. Claymorphism Card */}
          <div className="morphism-clay rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
                Morphism 02 (Interactive)
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
              Tactile Claymorphism
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Volumetric sculpted 3D depth with dual inner bevels (top highlight + dark bottom inset) that physically depresses upon user touch.
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-amber-400">
              <span>3D Inner Bevels</span>
              <span>Tap to Feel Depth</span>
            </div>
          </div>

          {/* 3. Molten Metal Card */}
          <div className="morphism-molten rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-orange-400 uppercase tracking-widest">
                Morphism 03
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-white group-hover:text-orange-300 transition-colors">
              Liquid Molten Metal
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Radiant thermal depth with molten gold/amber rim reflections, liquid surface gradients, and deep fire-ember drop shadows.
            </p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-orange-400">
              <span>Thermal Amber Rim</span>
              <span>Molten Ember Depth</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BENGALURU WARD SLA COMPLIANCE SCOREBOARD */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
            <Activity className="w-4 h-4" />
            <span>Zonal Performance Telemetry</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Bengaluru Municipal Ward SLA Compliance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Live telemetry tracking resolution speed across key East, South, and Central BBMP zones.
          </p>
        </div>

        <div className="obsidian-card rounded-3xl overflow-hidden border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-4 sm:px-6">Ward & Zone</th>
                  <th className="p-4">Active Hazards</th>
                  <th className="p-4">Resolved This Month</th>
                  <th className="p-4">SLA Adherence</th>
                  <th className="p-4">Avg Triage Speed</th>
                  <th className="p-4 sm:px-6">Field Crew Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {WARD_SCOREBOARD.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 sm:px-6 font-bold text-white flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {item.ward}
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">{item.open} Open</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{item.resolved} Fixed</td>
                    <td className="p-4 font-mono font-bold text-white">{item.slaAdherence}</td>
                    <td className="p-4 font-mono text-slate-300">{item.avgTime}</td>
                    <td className="p-4 sm:px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. CITIZEN & MUNICIPAL TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="obsidian-card rounded-3xl p-6 border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600/30 text-cyan-400 flex items-center justify-center font-bold text-sm border border-cyan-500/30">
                AS
              </div>
              <div>
                <div className="text-xs font-bold text-white">Aarav Sharma</div>
                <div className="text-[10px] text-slate-400">Resident, Indiranagar Ward 112</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "I snapped a picture of an open manhole on 12th Main while jogging. Within 15 minutes I saw the BESCOM team dispatched on the portal, and received an after-photo when it was sealed. No government paperwork."
            </p>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              ★★★★★ <span className="text-[10px] text-slate-500 font-mono ml-2">Verified Citizen</span>
            </div>
          </div>

          <div className="obsidian-card rounded-3xl p-6 border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                KS
              </div>
              <div>
                <div className="text-xs font-bold text-white">Er. K. Srinivas</div>
                <div className="text-[10px] text-slate-400">BBMP Executive Engineer (East)</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "The 75-meter clustering is a game changer for our control room. Instead of sorting 80 identical calls about a burst main during peak monsoon, we receive 1 consolidated ticket with 80 upvotes. We dispatch the right jetting truck on the first attempt."
            </p>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              ★★★★★ <span className="text-[10px] text-slate-500 font-mono ml-2">Municipal Command</span>
            </div>
          </div>

          <div className="obsidian-card rounded-3xl p-6 border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                RP
              </div>
              <div>
                <div className="text-xs font-bold text-white">Insp. Rajeshwar Patel</div>
                <div className="text-[10px] text-slate-400">Bengaluru Traffic Police (Traffic Control)</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Level 5 emergency alerts automatically ping our patrol units. When the 11kV line snapped near the metro, we received the alert before the traffic backup started. It saved commuters from electrocution."
            </p>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              ★★★★★ <span className="text-[10px] text-slate-500 font-mono ml-2">Public Safety</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400">
            Everything you need to know about NagarNetra autonomous civic triage.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does NagarNetra prevent spam or fake complaints?",
              a: "NagarNetra implements multi-layer defense: browser GPS coordinates must be within 100m of the photo EXIF or report origin; the Gemini Vision AI scores image authenticity and flags downloaded stock images; and repetitive fake reports are penalized in the citizen reputation index.",
            },
            {
              q: "What happens if a citizen speaks Kannada or Hindi instead of English?",
              a: "Our multimodal pipeline transcribes Indian regional languages using native Whisper and Gemini audio endpoints. A voice note spoken in Kannada: 'ಇಲ್ಲಿ ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ದೊಡ್ಡ ಗುಂಡಿ ಬಿದ್ದಿದೆ' is instantly parsed, translated to standard municipal taxonomy, and routed to BBMP.",
            },
            {
              q: "How is SLA breach escalated?",
              a: "Every category has a statutory SLA (e.g., Level 5 Live Wires: 2 hours; Level 4 Potholes: 12 hours). When 80% of the countdown expires without crew acknowledgment, the ticket is auto-escalated to the Zonal Joint Commissioner with SMS dispatch.",
            },
            {
              q: "Can citizens track the repair progress?",
              a: "Yes. Every grievance generates a unique shortlink (e.g. /c/NN-2024-RD01). When the repair crew uploads their completion photo, the AI runs an audit match, seals the ticket, and notifies the reporting citizen immediately.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="obsidian-card rounded-2xl border-slate-800 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openFaq === index ? "rotate-180 text-amber-400" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. BOTTOM FLAMING CTA BANNER WITH BURNING TRANSITION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 text-center space-y-6 shadow-2xl shadow-amber-500/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
            <Eye className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Transform Your City's Streets Today
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Experience the future of civic governance. Report a road hazard in seconds or monitor citywide emergency response in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigateWithFire("/report")}
              className="flame-button w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-amber-500/20 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>Report a Hazard Now</span>
            </button>

            <button
              onClick={() => navigateWithFire("/admin/dashboard")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Dispatch Console</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Camera,
  Mic,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFire } from "@/components/FireTransition";

// Hazard scenarios for the interactive AI Triage Simulator
const SIMULATOR_SCENARIOS = [
  {
    id: "electrical",
    title: "11kV Snapped High-Tension Wire",
    location: "Indiranagar 100ft Rd, Ward 112",
    dept: "BESCOM (Bangalore Electricity Supply)",
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
  const { navigateWithFire, triggerFire } = useFire();
  const [activeScenario, setActiveScenario] = useState(SIMULATOR_SCENARIOS[0]);
  const [simulating, setSimulating] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [kpis, setKpis] = useState({
    total: 25,
    open: 18,
    resolved: 7,
    resolvedPercent: 28,
    overdue: 3,
    avgResolutionHours: 28.5,
  });

  useEffect(() => {
    fetch("/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setKpis(data.metrics);
      })
      .catch(() => {});
  }, []);

  const handleScenarioChange = (scenario: typeof SIMULATOR_SCENARIOS[0]) => {
    setSimulating(true);
    setActiveScenario(scenario);
    setTimeout(() => {
      setSimulating(false);
    }, 450);
  };

  return (
    <div className="space-y-24 py-6 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient glow backgrounds - no purple, only molten amber and cyan */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-lg shadow-amber-500/10 backdrop-blur-md"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>IDEA//FORGE Track 1 • Autonomous Civic Triage Engine</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight"
          >
            Snap. Speak. Resolve.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              AI Triages the City's Hazards.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Report broken roads, live sparking wires, pipe bursts, or garbage dumping in any Indian language.
            NagarNetra autonomous vision evaluates danger levels 1–5, deduplicates repeat complaints within 75 meters,
            and routes accountability directly to municipal dispatchers.
          </motion.p>

          {/* Navigation Action Buttons with Burning Transition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={() => navigateWithFire("/report")}
              className="flame-button w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-amber-500/20 active:scale-95"
            >
              <Camera className="w-5 h-5" />
              <span>Raise Civic Grievance</span>
              <ArrowRight className="w-4 h-4 ml-1" />
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

          {/* Telemetry Ticker Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Gemini Vision Multi-Key Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              75m Geospatial Clustering Engaged
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Statutory 7-Dept SLA Enforcement
            </span>
          </motion.div>
        </div>

        {/* 2. MoRTH Evidence Cards */}
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="obsidian-card rounded-3xl p-6 border-l-4 border-l-red-500 hover:border-red-500/60 transition-all"
          >
            <div className="p-3 rounded-2xl bg-red-600/20 text-red-400 w-fit mb-4 border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-red-400">9,438 Fatalities</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Official MoRTH road safety record (2020-2024). Road pothole deaths surged 53% due to delayed municipal triage.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="obsidian-card rounded-3xl p-6 border-l-4 border-l-amber-500 hover:border-amber-500/60 transition-all"
          >
            <div className="p-3 rounded-2xl bg-amber-600/20 text-amber-400 w-fit mb-4 border border-amber-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-amber-400">26+ Lakh Grievances</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Logged annually across India via CPGRAMS and disparate city apps, creating massive bureaucratic backlog.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="obsidian-card rounded-3xl p-6 border-l-4 border-l-emerald-500 hover:border-emerald-500/60 transition-all"
          >
            <div className="p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 w-fit mb-4 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-emerald-400">75m Deduplication</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Consolidates dozens of repeat resident calls into a single high-priority municipal ticket with live citizen upvotes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE AI TRIAGE SIMULATOR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Experience NagarNetra's Multimodal Brain
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Select any real-world municipal emergency below to observe instant neural classification, severity calculation, and statutory SLA routing.
          </p>
        </motion.div>

        {/* Hazard Preset Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {SIMULATOR_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleScenarioChange(sc)}
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
            {/* Left: Visual Diagnosis */}
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

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-2 text-xs text-cyan-300">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{activeScenario.duplicates}</span>
              </div>
            </div>

            {/* Right: Autonomous Action Plan */}
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
                  onClick={() => triggerFire()}
                  className="flame-button px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                >
                  <Flame className="w-4 h-4" />
                  <span>Simulate Real-time Dispatch</span>
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

      {/* 4. 75-METER DEDUPLICATION VISUALIZER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="obsidian-card rounded-3xl p-8 sm:p-10 border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs font-bold gap-1">
              <Layers className="w-3.5 h-3.5" /> Spatial Clustering
            </Badge>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Why Indian Cities Drown in Duplicate Reports — and How 75m Clustering Solves It
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When a water main ruptures on 100ft road or a tree falls, 30 different citizens photograph and upload it within 2 hours. Traditional municipal apps create 30 separate tickets, creating confusion and dispatching multiple crews.
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              NagarNetra's spatial clustering calculates Haversine distance in real-time. Any submission within 75 meters matching the same hazard category is automatically appended to the parent ticket as an <strong className="text-amber-400">upvote (+3 priority boost)</strong> instead of an inbox duplicate.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center flex-1">
                <div className="text-2xl font-black text-red-400">30 Reports</div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">Legacy Systems (Clutter)</div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center flex-1">
                <div className="text-2xl font-black text-emerald-400">1 Master Ticket</div>
                <div className="text-[10px] text-emerald-300 uppercase mt-0.5">NagarNetra (30 Upvotes)</div>
              </div>
            </div>
          </div>

          {/* Visual Circle Clustering Graphic */}
          <div className="relative h-72 sm:h-80 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Radar concentric circles */}
            <div className="absolute w-64 h-64 rounded-full border border-cyan-500/20 animate-pulse" />
            <div className="absolute w-44 h-44 rounded-full border border-cyan-500/30" />
            <div className="absolute w-24 h-24 rounded-full border border-amber-500/40 bg-amber-500/5" />

            {/* Central Master Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-amber-300 font-mono mt-1 bg-slate-900 px-2 py-0.5 rounded border border-amber-500/30">
                Master #NN-2024-RD01
              </span>
            </div>

            {/* Orbiting Satellite Dots (Merged reports) */}
            <div className="absolute top-12 left-16 text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30">
              Citizen #1 (12m away)
            </div>
            <div className="absolute bottom-14 left-20 text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30">
              Citizen #2 (34m away)
            </div>
            <div className="absolute top-16 right-16 text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30">
              Citizen #3 (62m away)
            </div>
            <div className="absolute bottom-12 right-20 text-[10px] font-mono text-cyan-400 bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30">
              Citizen #4 (48m away)
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENGALURU WARD TELEMETRY SCOREBOARD */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3 mb-8"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
            <Activity className="w-4 h-4" />
            <span>Zonal Scoreboard</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            Bengaluru Municipal Ward SLA Compliance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Live telemetry tracking resolution speed across key East, South, and Central BBMP zones.
          </p>
        </motion.div>

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

      {/* 6. HOW NAGARNETRA WORKS (5-STEP LIFECYCLE) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Zap className="w-4 h-4" />
            <span>End-to-End Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            From Citizen Smartphone to Repaired Asphalt
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="obsidian-card rounded-2xl p-5 border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs border border-amber-500/30">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Multimodal Capture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizen uploads photo, audio note in Hindi/Kannada/English, or text description with browser GPS.
            </p>
          </div>

          <div className="obsidian-card rounded-2xl p-5 border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs border border-cyan-500/30">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Neural Severity Scoring</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini Vision computes physical hazard level (1–5) based on pedestrian threat, depth, and traffic volume.
            </p>
          </div>

          <div className="obsidian-card rounded-2xl p-5 border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-mono font-bold text-xs border border-orange-500/30">
              03
            </div>
            <h4 className="text-sm font-bold text-white">75m Deduplication</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spatial clustering detects prior reports within 75m, appending as upvotes (+3 priority) without inbox clutter.
            </p>
          </div>

          <div className="obsidian-card rounded-2xl p-5 border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono font-bold text-xs border border-blue-500/30">
              04
            </div>
            <h4 className="text-sm font-bold text-white">SLA Dispatch Routing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated routing to BBMP, BESCOM, or BWSSB with statutory SLA deadlines (2h for Level 5, 12h for Level 4).
            </p>
          </div>

          <div className="obsidian-card rounded-2xl p-5 border-slate-800 space-y-3 relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/30">
              05
            </div>
            <h4 className="text-sm font-bold text-white">AI Photo Closure</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Field crew uploads repair photo. Neural comparison verifies asphalt patch integrity before closing ticket.
            </p>
          </div>
        </div>
      </section>

      {/* 7. MUNICIPAL & CITIZEN TESTIMONIALS */}
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

      {/* 9. BOTTOM FLAMING CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-orange-950/60 text-center space-y-6 shadow-2xl shadow-amber-500/10">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
            <Flame className="w-8 h-8" />
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

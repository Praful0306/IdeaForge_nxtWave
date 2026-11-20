"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { translations, Locale } from "@/lib/i18n";

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [kpis, setKpis] = useState({
    total: 25,
    open: 18,
    resolved: 7,
    resolvedPercent: 28,
    overdue: 3,
    avgResolutionHours: 28.5,
  });

  useEffect(() => {
    const saved = localStorage.getItem("nn_locale") as Locale;
    if (saved) setLocale(saved);

    const handler = (e: Event) => {
      setLocale((e as CustomEvent).detail);
    };
    window.addEventListener("locale-change", handler);

    // Fetch live dashboard KPIs
    fetch("/api/complaints")
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setKpis(data.metrics);
      })
      .catch(() => {});

    return () => window.removeEventListener("locale-change", handler);
  }, []);

  const t = translations[locale];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/80 pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            IDEA//FORGE Track 1 • Civic Infrastructure AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Snap, Speak, or Type.
            <br />
            <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              AI Triages the City's Hazards.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Report broken roads, pipe bursts, garbage dumps, or hanging wires in any Indian language.
            Multimodal AI scores the danger, eliminates duplicate tickets within 75m, and routes
            accountability directly to municipal engineers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/report" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base gap-2 px-8 h-13 shadow-lg shadow-blue-600/25">
                <Camera className="w-5 h-5" />
                <span>{t.reportCTA}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base gap-2 px-6 h-13">
                <span>{t.dashboardLink}</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Real-world Evidence Banner */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-red-950">9,438 Deaths</div>
              <div className="text-xs text-red-800 leading-snug mt-0.5">
                Pothole-related fatalities in India (2020-2024, MoRTH official report). Up 53%.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-blue-950">26+ Lakh Reports</div>
              <div className="text-xs text-blue-800 leading-snug mt-0.5">
                Central grievances handled via CPGRAMS in 2024, excluding disconnected city apps.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-emerald-950">75m AI Clustering</div>
              <div className="text-xs text-emerald-800 leading-snug mt-0.5">
                Merges 40 repeat calls into 1 high-priority ticket with upvotes instead of clutter.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Live Municipal Triage Statistics
          </h2>
          <Link href="/dashboard" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            Explore Full Map <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-4 text-center">
            <div className="text-xs font-medium text-slate-500">Total Grievances</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.total}</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-xs font-medium text-amber-600">Active / Open</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{kpis.open}</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-xs font-medium text-emerald-600">Resolved Proofs</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{kpis.resolved}</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-xs font-medium text-blue-600">Resolution Rate</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{kpis.resolvedPercent}%</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-xs font-medium text-red-600">SLA Overdue</div>
            <div className="text-2xl font-black text-red-600 mt-1">{kpis.overdue}</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-xs font-medium text-slate-600">Avg Fix Time</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis.avgResolutionHours}h</div>
          </Card>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How NagarNetra Solves Civic Triage
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Eliminating long forms, language barriers, and untracked complaints in 3 automated steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-t-4 border-t-blue-600 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Multimodal Capture in Seconds</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take a quick photo or speak in Hindi, Kannada, or English. GPS coordinates and address
                are captured automatically with zero typing required.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
              <Camera className="w-4 h-4 text-blue-600" /> Photo • <Mic className="w-4 h-4 text-blue-600" /> Voice • <FileText className="w-4 h-4 text-blue-600" /> Text
            </div>
          </Card>

          <Card className="relative overflow-hidden border-t-4 border-t-amber-500 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">AI Severity & Spatial Deduplication</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Llama 4 Vision & Whisper rate danger 1-5, flag schools/hospitals nearby, and compare with
                existing complaints within 75m to merge duplicate reports into upvotes.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Severity Rubric • <MapPin className="w-4 h-4 text-amber-500" /> 75m PostGIS Radius
            </div>
          </Card>

          <Card className="relative overflow-hidden border-t-4 border-t-emerald-600 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Automated Routing & Proof of Fix</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tickets are assigned statutory SLA deadlines (e.g., 4 hours for open manholes) and
                dispatched to ward engineers. Closing a ticket requires a verified "after" photo.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
              <Clock className="w-4 h-4 text-emerald-600" /> SLA Deadlines • <CheckCircle2 className="w-4 h-4 text-emerald-600" /> "After" Photo Proof
            </div>
          </Card>
        </div>
      </section>

      {/* Quick Report CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-900/15">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Spot a dangerous hazard on your commute?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Report it in less than 3 taps. Help keep Indian roads and residential streets safe for
              everyone.
            </p>
          </div>
          <Link href="/report">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-base font-extrabold px-8 h-13 shadow-lg active:scale-95">
              <Camera className="w-5 h-5 mr-2" />
              {t.reportCTA}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

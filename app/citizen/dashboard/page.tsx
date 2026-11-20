"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  PlusCircle,
  ThumbsUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Bell,
  Sparkles,
  ExternalLink,
  Award,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useFire } from "@/components/FireTransition";
import { ComplaintRecord } from "@/lib/db";

export default function CitizenDashboardPage() {
  const { toast } = useToast();
  const { navigateWithFire } = useFire();

  const [citizenName, setCitizenName] = useState("Aarav Sharma");
  const [ward, setWard] = useState("Ward 112 - Domlur / Indiranagar");
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedName = sessionStorage.getItem("citizen_name");
    const savedWard = sessionStorage.getItem("citizen_ward");
    if (savedName) setCitizenName(savedName);
    if (savedWard) setWard(savedWard);

    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/complaints");
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = (id: string, ticket: string) => {
    if (upvotedIds.has(id)) {
      toast({
        title: "Already Supported",
        description: `You have already supported ticket #${ticket}.`,
        type: "info",
      });
      return;
    }

    setUpvotedIds((prev) => new Set(prev).add(id));
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, report_count: c.report_count + 1, priority: Math.round((c.priority + 3) * 10) / 10 }
          : c
      )
    );

    toast({
      title: "Upvote Recorded (+3 Priority)",
      description: `Your confirmation was merged into ticket #${ticket}. Municipal priority boosted.`,
      type: "success",
    });
  };

  // Divide into My Reports and Nearby Ward Issues
  const myReports = complaints.slice(0, 3);
  const nearbyWardIssues = complaints.slice(3, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Citizen Profile Banner */}
      <div className="obsidian-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-800">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/20 shrink-0">
            {citizenName.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white">{citizenName}</h1>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Citizen
              </Badge>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs gap-1 font-bold">
                <Award className="w-3.5 h-3.5" /> Guardian Level 3 (180 Pts)
              </Badge>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {ward}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigateWithFire("/report")}
            className="flame-button px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Raise New Grievance</span>
          </button>

          <button
            onClick={() => navigateWithFire("/dashboard")}
            className="px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/80 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>View Public Map</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Citizen Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="obsidian-card p-4 border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase">My Active Reports</div>
          <div className="text-2xl font-black text-white mt-1">2</div>
          <div className="text-[11px] text-cyan-400 mt-1">1 in field repair</div>
        </Card>

        <Card className="obsidian-card p-4 border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Resolved In Ward</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">7</div>
          <div className="text-[11px] text-slate-400 mt-1">Verified with after-photo</div>
        </Card>

        <Card className="obsidian-card p-4 border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Civic Upvotes Given</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{upvotedIds.size + 4}</div>
          <div className="text-[11px] text-slate-400 mt-1">Accelerated SLA priority</div>
        </Card>

        <Card className="obsidian-card p-4 border-l-4 border-l-blue-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Avg SLA Target</div>
          <div className="text-2xl font-black text-blue-400 mt-1">18h</div>
          <div className="text-[11px] text-slate-400 mt-1">Ward 112 average response</div>
        </Card>
      </div>

      {/* Grid: My Grievances Tracker vs Nearby Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Tracked Grievances (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              My Submitted Grievance Status
            </h2>
            <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
              Live Real-Time Tracker
            </Badge>
          </div>

          <div className="space-y-4">
            {myReports.map((c, i) => {
              const statusStep =
                c.status === "resolved" ? 4 : c.status === "in_progress" ? 3 : c.status === "acknowledged" ? 2 : 1;

              return (
                <Card key={c.id} className="obsidian-card p-5 space-y-4 border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-cyan-400">{c.ticket}</span>
                      <Badge variant={`sev${c.severity}` as any} className="text-[11px]">
                        Severity {c.severity}
                      </Badge>
                      <Badge variant="outline" className="text-[11px] capitalize border-slate-700 text-slate-300">
                        {c.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Due: {c.due_at ? new Date(c.due_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : "24h"}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.summary_en}</p>
                  </div>

                  {/* 4-Stage Progress Bar */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={statusStep >= 1 ? "text-cyan-400" : "text-slate-600"}>1. Reported</span>
                      <span className={statusStep >= 2 ? "text-cyan-400" : "text-slate-600"}>2. Acknowledged</span>
                      <span className={statusStep >= 3 ? "text-amber-400" : "text-slate-600"}>3. In Progress</span>
                      <span className={statusStep >= 4 ? "text-emerald-400" : "text-slate-600"}>4. Resolved Proof</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                      <div className={`h-full transition-all duration-500 ${statusStep >= 1 ? "w-1/4 bg-cyan-500" : "w-0"}`} />
                      <div className={`h-full transition-all duration-500 ${statusStep >= 2 ? "w-1/4 bg-blue-500" : "w-0"}`} />
                      <div className={`h-full transition-all duration-500 ${statusStep >= 3 ? "w-1/4 bg-amber-500" : "w-0"}`} />
                      <div className={`h-full transition-all duration-500 ${statusStep >= 4 ? "w-1/4 bg-emerald-500" : "w-0"}`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">
                      Assigned to: <strong className="text-slate-200 capitalize">{c.department_id}</strong>
                    </span>

                    <button
                      onClick={() => navigateWithFire(`/c/${c.ticket}`)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      View Live Audit Trail <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Nearby Ward Incidents (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Nearby Incidents Within 75m
            </h2>
            <span className="text-xs text-slate-400">Upvote to accelerate</span>
          </div>

          <div className="space-y-3">
            {nearbyWardIssues.map((c) => {
              const hasUpvoted = upvotedIds.has(c.id);

              return (
                <Card key={c.id} className="obsidian-card p-4 space-y-3 border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-400">{c.ticket}</span>
                        <Badge variant={`sev${c.severity}` as any} className="text-[10px]">
                          Sev {c.severity}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{c.address}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpvote(c.id, c.ticket)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        hasUpvoted
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-amber-500/50 hover:text-white"
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-amber-400 text-amber-400" : ""}`} />
                      <span className="text-[10px] mt-0.5">{c.report_count}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span className="capitalize">{c.category}</span>
                    <button
                      onClick={() => navigateWithFire(`/c/${c.ticket}`)}
                      className="text-cyan-400 hover:underline"
                    >
                      Track Issue →
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

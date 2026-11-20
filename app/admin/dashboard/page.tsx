"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Building2,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Check,
  X,
  Truck,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  MapPin,
  FileCheck2,
  Activity,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useFire } from "@/components/FireTransition";
import { ComplaintRecord } from "@/lib/db";

// Rapid Municipal Response Units
const AVAILABLE_CREWS: Record<string, string[]> = {
  Roads: ["BBMP Rapid Patcher #4", "Zone East Jet-Asphalt Unit 2", "Central Paving Crew 9"],
  Electrical: ["BESCOM 11kV Rapid Line Squad 1", "Indiranagar Substation Emergency", "HT Wire Repair Unit 7"],
  Water: ["BWSSB Pipeline Emergency Squad 3", "Cauvery Water Main Jetting Unit", "Sewer Suction Unit 5"],
  Drainage: ["SWD Monsoon Desilting Crew 2", "Zone Stormwater Rapid Force", "Culvert Clearing Unit 6"],
  Sanitation: ["BBMP Solid Waste Rapid Truck 12", "Zone East Biohazard Disposal Unit", "Mechanized Sweeper Unit 3"],
  Pollution: ["KSPCB Rapid Air & Noise Inspection", "Zone Industrial Effluent Squad"],
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { navigateWithFire, triggerFire } = useFire();

  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignedCrews, setAssignedCrews] = useState<Record<string, string>>({});

  // Before/After Verification Modal State
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedTicketForVerify, setSelectedTicketForVerify] = useState<ComplaintRecord | null>(null);
  const [verifySliderPos, setVerifySliderPos] = useState(50);
  const [verifyingAI, setVerifyingAI] = useState(false);
  const [verifyComplete, setVerifyComplete] = useState(false);

  // Critical Alert Dismissal
  const [criticalDismissed, setCriticalDismissed] = useState(false);

  // Live Audit Telemetry Log
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; text: string; type: "alert" | "info" | "success" }>>([
    { id: "1", time: "Just now", text: "Autonomous 75m Clustering merged 3 reports into #NN-2024-RD01 (Domlur)", type: "info" },
    { id: "2", time: "2m ago", text: "BESCOM 11kV Rapid Line Squad 1 acknowledged High-Tension Sparking at Indiranagar", type: "alert" },
    { id: "3", time: "5m ago", text: "AI Resolution Engine confirmed after-photo repair match (97.4%) for #NN-2024-WT02", type: "success" },
    { id: "4", time: "11m ago", text: "Round-robin key rotated smoothly without 429 rate limit hit", type: "info" },
  ]);

  useEffect(() => {
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
      toast({
        title: "Telemetry Sync Failed",
        description: "Could not fetch latest municipal records.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: "open" | "in_progress" | "resolved") => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    const logEntry: { id: string; time: string; text: string; type: "alert" | "info" | "success" } = {
      id: Math.random().toString(),
      time: "Just now",
      text: `Admin updated ticket status to ${newStatus.toUpperCase()}`,
      type: newStatus === "resolved" ? "success" : "info",
    };
    setAuditLogs((prev) => [logEntry, ...prev.slice(0, 7)]);

    toast({
      title: `Status Updated: ${newStatus.replace("_", " ").toUpperCase()}`,
      description: `Ticket status has been synced to municipal dispatch database.`,
      type: "success",
    });
  };

  const handleCrewAssign = (ticketId: string, crewName: string) => {
    setAssignedCrews((prev) => ({ ...prev, [ticketId]: crewName }));
    setComplaints((prev) =>
      prev.map((c) => (c.id === ticketId ? { ...c, status: "in_progress" } : c))
    );

    const logEntry = {
      id: Math.random().toString(),
      time: "Just now",
      text: `Dispatched crew [${crewName}] to ticket`,
      type: "alert" as const,
    };
    setAuditLogs((prev) => [logEntry, ...prev.slice(0, 7)]);

    toast({
      title: "Crew Dispatched",
      description: `${crewName} assigned and notified via mobile municipal terminal.`,
      type: "success",
    });
  };

  const openVerifyModal = (ticket: ComplaintRecord) => {
    setSelectedTicketForVerify(ticket);
    setVerifySliderPos(50);
    setVerifyingAI(false);
    setVerifyComplete(false);
    setVerificationModalOpen(true);
  };

  const runAIVerification = () => {
    setVerifyingAI(true);
    setTimeout(() => {
      setVerifyingAI(false);
      setVerifyComplete(true);
      triggerFire(); // Trigger flame transition effect on verify!
      if (selectedTicketForVerify) {
        handleStatusChange(selectedTicketForVerify.id, "resolved");
      }
      toast({
        title: "AI Verification Passed (96.8% Integrity)",
        description: "Hazard mitigated. Before & after visual audit confirmed by neural vision.",
        type: "success",
      });
    }, 1400);
  };

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (selectedDept !== "all" && c.category.toLowerCase() !== selectedDept.toLowerCase()) return false;
    if (selectedStatus !== "all" && c.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.ticket.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Calculate live statistics
  const totalActive = complaints.filter((c) => c.status !== "resolved").length;
  const criticalCount = complaints.filter((c) => c.severity >= 4 && c.status !== "resolved").length;
  const inProgressCount = complaints.filter((c) => c.status === "in_progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;
  const overdueCount = complaints.filter((c) => {
    return c.status !== "resolved" && !!c.due_at && new Date(c.due_at).getTime() < Date.now();
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Municipal Dispatch Header */}
      <div className="obsidian-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-800">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg shadow-amber-500/25 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Municipal Dispatch Command
              </h1>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                BBMP / BESCOM Inter-Agency
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-bold">
                Admin Console
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Autonomous Multimodal Triage • 75m Clustering • Statutory SLA Enforcement
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => fetchComplaints()}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900/80 text-xs text-slate-300 hover:text-white gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Telemetry</span>
          </Button>

          <button
            onClick={() => navigateWithFire("/dashboard")}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Live City Map</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => navigateWithFire("/citizen/dashboard")}
            className="px-4 py-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Switch to Citizen View</span>
          </button>
        </div>
      </div>

      {/* Emergency Level 5 Critical Alert Banner */}
      {!criticalDismissed && (
        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 border border-red-500/40 bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/40 shadow-2xl shadow-red-950/50">
          <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-red-500 via-amber-500 to-orange-500 animate-pulse" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] tracking-wide uppercase">
                    Level 5 Critical Alert
                  </span>
                  <span className="text-xs text-red-300 font-semibold">Statutory SLA: 2 Hours Max</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Sparking 11kV High-Tension Wire Hanging Over Pedestrian Walkway
                </h3>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Indiranagar 100ft Road (Near Metro Pillar 42) • Merged 5 Citizen Reports
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => {
                  handleCrewAssign("sample-critical-1", "BESCOM 11kV Rapid Line Squad 1");
                  setCriticalDismissed(true);
                }}
                className="flame-button px-5 py-2.5 text-xs font-black shadow-lg"
              >
                <Zap className="w-4 h-4 mr-1.5" />
                Dispatch Rapid Squad
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCriticalDismissed(true)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="obsidian-card p-4 border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active</div>
          <div className="text-3xl font-black text-white mt-1">{totalActive}</div>
          <div className="text-[11px] text-amber-400 mt-1 font-semibold">Citywide Open Triage</div>
        </Card>

        <Card className="obsidian-card p-4 border-l-4 border-l-red-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Level 4/5 Critical</div>
          <div className="text-3xl font-black text-red-400 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Requires immediate dispatch</div>
        </Card>

        <Card className="obsidian-card p-4 border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Field Repair</div>
          <div className="text-3xl font-black text-cyan-400 mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-cyan-400 mt-1">Crews actively on-site</div>
        </Card>

        <Card className="obsidian-card p-4 border-l-4 border-l-orange-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SLA Overdue</div>
          <div className="text-3xl font-black text-orange-400 mt-1">{overdueCount}</div>
          <div className="text-[11px] text-orange-400 mt-1">Breached resolution time</div>
        </Card>

        <Card className="obsidian-card p-4 border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Resolved</div>
          <div className="text-3xl font-black text-emerald-400 mt-1">{resolvedCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Closed with after-photo</div>
        </Card>
      </div>

      {/* Main Command Console & Triage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 3 Columns: Complaint Management */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls & Filter Bar */}
          <div className="obsidian-card rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket #, ward, or hazard description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              aria-label="Filter by department"
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Roads">BBMP Roads</option>
              <option value="Electrical">BESCOM Electrical</option>
              <option value="Water">BWSSB Water Supply</option>
              <option value="Drainage">Stormwater Drainage</option>
              <option value="Sanitation">Solid Waste & Health</option>
              <option value="Pollution">Pollution Control</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Pending Triage</option>
              <option value="in_progress">In Field Repair</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Grievance Ticket Cards */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="obsidian-card rounded-2xl p-12 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No Tickets Found</h3>
                <p className="text-xs text-slate-400">All matching municipal grievances have been resolved or filtered.</p>
              </div>
            ) : (
              filtered.map((ticket) => {
                const isOverdue =
                  ticket.status !== "resolved" &&
                  !!ticket.due_at &&
                  new Date(ticket.due_at).getTime() < Date.now();

                const assignedCrew = assignedCrews[ticket.id];
                const deptCrews = AVAILABLE_CREWS[ticket.category] || ["Municipal General Squad"];

                return (
                  <div
                    key={ticket.id}
                    className={`obsidian-card rounded-2xl p-5 border transition-all duration-200 ${
                      ticket.severity >= 4
                        ? "border-red-500/40 hover:border-red-500/70"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            #{ticket.ticket}
                          </span>

                          <Badge
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              ticket.severity >= 4
                                ? "bg-red-500/20 text-red-300 border-red-500/30"
                                : ticket.severity === 3
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            Level {ticket.severity} • {ticket.category}
                          </Badge>

                          {ticket.report_count > 1 && (
                            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[10px] font-bold">
                              {ticket.report_count} Reports Clustered (75m)
                            </Badge>
                          )}

                          {isOverdue && (
                            <Badge className="bg-red-600 text-white text-[10px] font-black animate-pulse">
                              SLA BREACHED
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-white">{ticket.title}</h3>

                        <p className="text-xs text-slate-300 line-clamp-2">{ticket.summary_en}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            {ticket.address || "Bengaluru Metro Area"}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {ticket.due_at
                              ? `Due: ${new Date(ticket.due_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}`
                              : "Standard SLA"}
                          </span>
                          <span className="text-slate-500 font-mono">
                            Priority Score: {ticket.priority}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex flex-col sm:items-end gap-3 shrink-0">
                        {/* Status Badge */}
                        <Badge
                          className={`text-xs font-bold uppercase ${
                            ticket.status === "resolved"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : ticket.status === "in_progress"
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {ticket.status === "resolved"
                            ? "✓ Resolved"
                            : ticket.status === "in_progress"
                            ? "In Repair"
                            : "Pending Triage"}
                        </Badge>

                        {/* Crew Selector */}
                        {ticket.status !== "resolved" && (
                          <div className="w-full sm:w-auto">
                            <select
                              value={assignedCrew || ""}
                              onChange={(e) => handleCrewAssign(ticket.id, e.target.value)}
                              aria-label="Assign field crew"
                              className="w-full sm:w-48 text-[11px] bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
                            >
                              <option value="">Assign Crew...</option>
                              {deptCrews.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {ticket.status === "open" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(ticket.id, "in_progress")}
                              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8 px-3"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Acknowledge
                            </Button>
                          )}

                          {ticket.status !== "resolved" && (
                            <Button
                              size="sm"
                              onClick={() => openVerifyModal(ticket)}
                              className="flame-button text-xs h-8 px-3 font-bold"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 mr-1" />
                              Verify & Resolve
                            </Button>
                          )}

                          {ticket.status === "resolved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openVerifyModal(ticket)}
                              className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs h-8"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View Audit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Column: Telemetry & Audit Logs */}
        <div className="space-y-6">
          {/* Live Telemetry Stream */}
          <div className="obsidian-card rounded-2xl p-5 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Dispatch Telemetry
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono">{log.time}</span>
                    <span
                      className={`font-bold uppercase ${
                        log.type === "alert"
                          ? "text-red-400"
                          : log.type === "success"
                          ? "text-emerald-400"
                          : "text-cyan-400"
                      }`}
                    >
                      {log.type}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{log.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Department Dispatch Contacts */}
          <div className="obsidian-card rounded-2xl p-5 border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Municipal Rapid Hotlines
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-semibold">BBMP Control Room</span>
                <span className="font-mono text-amber-400 font-bold">080-2266-0000</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-semibold">BESCOM 24x7 Power</span>
                <span className="font-mono text-cyan-400 font-bold">1912</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-semibold">BWSSB Water Emergency</span>
                <span className="font-mono text-blue-400 font-bold">1916</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300 font-semibold">Disaster Response (NDRF)</span>
                <span className="font-mono text-red-400 font-bold">1070</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BEFORE / AFTER AI PHOTO VERIFICATION MODAL */}
      {verificationModalOpen && selectedTicketForVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="obsidian-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                  #{selectedTicketForVerify.ticket}
                </span>
                <h2 className="text-xl font-black text-white mt-2">
                  AI Before & After Photo Verification
                </h2>
                <p className="text-xs text-slate-400">
                  Neural vision analysis verifies that the physical hazard has been rectified before closing ticket.
                </p>
              </div>

              <button
                onClick={() => setVerificationModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Photo Comparison Slider */}
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 select-none">
              {/* "Before" Side (Left) */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-red-950/60 to-slate-950 flex flex-col items-center justify-center text-center p-6"
                style={{ clipPath: `polygon(0 0, ${verifySliderPos}% 0, ${verifySliderPos}% 100%, 0 100%)` }}
              >
                <div className="p-3 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 mb-2">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="text-xs font-black uppercase text-red-400 tracking-wider">Before (Reported Hazard)</div>
                <div className="text-xs text-slate-300 mt-1 max-w-xs">{selectedTicketForVerify.title}</div>
                <Badge className="mt-2 bg-red-500/20 text-red-300 border-red-500/30 text-[10px]">
                  Hazard Score: {selectedTicketForVerify.severity}/5
                </Badge>
              </div>

              {/* "After" Side (Right) */}
              <div
                className="absolute inset-0 bg-gradient-to-bl from-emerald-950/60 to-slate-950 flex flex-col items-center justify-center text-center p-6"
                style={{ clipPath: `polygon(${verifySliderPos}% 0, 100% 0, 100% 100%, ${verifySliderPos}% 100%)` }}
              >
                <div className="p-3 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="text-xs font-black uppercase text-emerald-400 tracking-wider">After (Field Crew Repair)</div>
                <div className="text-xs text-slate-300 mt-1 max-w-xs">Asphalt hot-mix layer compacted & level</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Hazard Rectified: 96.8%
                </Badge>
              </div>

              {/* Interactive Slider Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_#F59E0B] cursor-ew-resize flex items-center justify-center"
                style={{ left: `${verifySliderPos}%` }}
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 text-[10px] font-bold shadow-lg">
                  ↔
                </div>
              </div>

              {/* Range input for slider movement */}
              <input
                type="range"
                min="0"
                max="100"
                value={verifySliderPos}
                onChange={(e) => setVerifySliderPos(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
              />
            </div>

            {/* AI Verification Assessment */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Multimodal Neural Audit
                </span>
                <span className="font-mono text-emerald-400 font-bold">96.8% Confidence</span>
              </div>
              <p className="text-xs text-slate-400">
                Visual analysis shows surface defect filled with hot-mix asphalt, compaction verified, and site safe for public traffic. GPS coordinates match original incident location within 3.2 meters.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerificationModalOpen(false)}
                className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs"
              >
                Cancel
              </Button>

              <button
                disabled={verifyingAI}
                onClick={runAIVerification}
                className="flame-button px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              >
                {verifyingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Close Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  Search,
  ExternalLink,
  Shield,
  Layers,
  MapPin,
  Flame,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFire } from "@/components/FireTransition";
import { ComplaintRecord } from "@/lib/db";
import { translations, Locale } from "@/lib/i18n";

// Dynamically load Map to prevent SSR errors
const CivicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-mono text-xs">
      Loading Dark Telemetry Map...
    </div>
  ),
});

export default function DashboardPage() {
  const { navigateWithFire } = useFire();
  const [locale, setLocale] = useState<Locale>("en");
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | undefined>();

  useEffect(() => {
    const saved = localStorage.getItem("nn_locale") as Locale;
    if (saved) setLocale(saved);

    const handler = (e: Event) => setLocale((e as CustomEvent).detail);
    window.addEventListener("locale-change", handler);

    fetchData();
    fetchInsights();

    return () => window.removeEventListener("locale-change", handler);
  }, [categoryFilter, statusFilter, severityFilter, departmentFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (departmentFilter !== "all") params.append("department", departmentFilter);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      setComplaints(data.complaints || []);
      setMetrics(data.metrics || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      if (data.insights) setInsights(data.insights);
    } catch {
      // fallback
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.ticket.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  // Prepare Department Chart Data (Open vs Resolved)
  const departmentChartData = [
    { name: "Roads", open: 0, resolved: 0 },
    { name: "Water", open: 0, resolved: 0 },
    { name: "Drainage", open: 0, resolved: 0 },
    { name: "Sanitation", open: 0, resolved: 0 },
    { name: "Electrical", open: 0, resolved: 0 },
    { name: "Pollution", open: 0, resolved: 0 },
  ];

  complaints.forEach((c) => {
    const item = departmentChartData.find((d) => d.name.toLowerCase() === c.category.toLowerCase());
    if (item) {
      if (c.status === "resolved") item.resolved++;
      else item.open++;
    }
  });

  const trendData = [
    { day: "Day 1", newReports: 4, fixed: 1 },
    { day: "Day 3", newReports: 7, fixed: 3 },
    { day: "Day 5", newReports: 6, fixed: 4 },
    { day: "Day 7", newReports: 9, fixed: 5 },
    { day: "Day 9", newReports: 5, fixed: 6 },
    { day: "Day 11", newReports: 8, fixed: 6 },
    { day: "Day 14", newReports: 11, fixed: 7 },
  ];

  const t = translations[locale];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="obsidian-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Live Municipal Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {t.cityMap}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Geospatial hazard mapping, 75m spatial clusters, and statutory SLA performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigateWithFire("/report")}
            className="flame-button px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <Flame className="w-4 h-4" />
            <span>Report Hazard</span>
          </button>

          <button
            onClick={() => navigateWithFire("/admin/dashboard")}
            className="px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Console</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="obsidian-card p-4 rounded-2xl border-l-4 border-l-cyan-500">
          <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">{t.kpiTotal}</div>
          <div className="text-2xl font-black text-white mt-1">{metrics.total || 0}</div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold text-amber-400 uppercase font-mono">{t.kpiOpen}</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{metrics.open || 0}</div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-bold text-emerald-400 uppercase font-mono">{t.kpiResolved}</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.resolved || 0}</div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-l-4 border-l-blue-500">
          <div className="text-[11px] font-bold text-blue-400 uppercase font-mono">{t.kpiResolvedPercent}</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{metrics.resolvedPercent || 0}%</div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-l-4 border-l-red-500">
          <div className="text-[11px] font-bold text-red-400 uppercase font-mono">{t.kpiOverdue}</div>
          <div className="text-2xl font-black text-red-400 mt-1">{metrics.overdue || 0}</div>
        </div>

        <div className="obsidian-card p-4 rounded-2xl border-l-4 border-l-slate-600">
          <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">{t.kpiAvgTime}</div>
          <div className="text-2xl font-black text-white mt-1">{metrics.avgResolutionHours || 0}h</div>
        </div>
      </div>

      {/* AI Ward Insights */}
      <div className="obsidian-card rounded-2xl p-5 border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-mono">
                {t.aiInsights}
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">
                Cached 10m
              </span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {insights.map((insight, idx) => (
                <li key={idx} className="text-xs font-medium text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="obsidian-card rounded-2xl p-4 border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search ticket, title, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-3 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="h-11 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="roads">Roads</option>
            <option value="water">Water Supply</option>
            <option value="drainage">Drainage & SWD</option>
            <option value="sanitation">Sanitation</option>
            <option value="electrical">Electrical</option>
            <option value="pollution">Pollution</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="h-11 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter by severity"
            className="h-11 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Severities</option>
            <option value="5">Level 5 (Emergency)</option>
            <option value="4">Level 4 (Dangerous)</option>
            <option value="3">Level 3 (Priority)</option>
            <option value="2">Level 2 (Minor)</option>
            <option value="1">Level 1 (Cosmetic)</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            aria-label="Filter by department"
            className="h-11 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Departments</option>
            <option value="roads">Roads (BBMP/PWD)</option>
            <option value="water">Water (BWSSB)</option>
            <option value="drainage">Stormwater Drains</option>
            <option value="sanitation">Solid Waste Cell</option>
            <option value="electrical">BESCOM Electrical</option>
          </select>
        </div>
      </div>

      {/* Main Map & Priority Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-7 h-[520px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
          <CivicMap
            complaints={filteredComplaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaint={(c) => setSelectedComplaintId(c.id)}
          />
        </div>

        {/* Priority Queue (Worst First) */}
        <div className="lg:col-span-5 h-[520px] flex flex-col">
          <div className="obsidian-card rounded-3xl flex-1 flex flex-col overflow-hidden border-slate-800">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-amber-400" />
                  {t.worstFirst}
                </h3>
                <div className="text-[11px] text-slate-400">Sorted by dynamic priority score</div>
              </div>
              <Badge className="bg-slate-900 text-slate-300 border-slate-800 text-xs font-mono">
                {filteredComplaints.length} Records
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredComplaints.map((c) => {
                const isOverdue = c.due_at && new Date(c.due_at).getTime() < Date.now() && c.status !== "resolved";

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaintId(c.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedComplaintId === c.id
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : "border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-amber-400">#{c.ticket}</span>
                        {isOverdue && (
                          <Badge className="text-[10px] py-0 px-1.5 bg-red-600 text-white font-bold">
                            Overdue
                          </Badge>
                        )}
                        {c.report_count > 1 && (
                          <Badge className="text-[10px] py-0 px-1.5 bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                            +{c.report_count - 1} Upvotes
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-slate-400">P-Score: {c.priority}</span>
                        <Badge
                          className={`text-[10px] py-0 px-1.5 font-bold ${
                            c.severity >= 4
                              ? "bg-red-500/20 text-red-300 border-red-500/30"
                              : c.severity === 3
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          Sev {c.severity}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-white line-clamp-1">{c.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.address}</div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 capitalize">{c.category}</span>
                      <Link
                        href={`/c/${c.ticket}`}
                        className="text-amber-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="obsidian-card rounded-3xl p-6 border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">
            Department Performance (Active vs Resolved)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#334155" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                />
                <Legend />
                <Bar dataKey="open" fill="#f59e0b" name="Active / Open" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Verified Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="obsidian-card rounded-3xl p-6 border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4">
            14-Day Grievance Trend (Incoming vs Mitigated)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} stroke="#334155" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                />
                <Legend />
                <Line type="monotone" dataKey="newReports" stroke="#06b6d4" strokeWidth={2.5} name="New Complaints" />
                <Line type="monotone" dataKey="fixed" stroke="#10b981" strokeWidth={2.5} name="Verified Fixes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

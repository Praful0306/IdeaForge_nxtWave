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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ComplaintRecord } from "@/lib/db";
import { translations, Locale } from "@/lib/i18n";

// Dynamically load Map to prevent SSR errors
const CivicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
      Loading City Map...
    </div>
  ),
});

export default function DashboardPage() {
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
      c.address?.toLowerCase().includes(q)
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

  // Prepare 14-day trend mockup data
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t.cityMap}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time geospatial monitoring, severity triage, and statutory SLA performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/report">
            <Button className="h-11 font-bold shadow-md shadow-blue-600/20">
              Report Problem
            </Button>
          </Link>
          <Link href="/officer">
            <Button variant="outline" className="h-11 font-semibold">
              Officer View
            </Button>
          </Link>
        </div>
      </div>

      {/* Top KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border-l-4 border-l-blue-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase">{t.kpiTotal}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.total || 0}</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold text-amber-600 uppercase">{t.kpiOpen}</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{metrics.open || 0}</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-600">
          <div className="text-[11px] font-bold text-emerald-600 uppercase">{t.kpiResolved}</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{metrics.resolved || 0}</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-600">
          <div className="text-[11px] font-bold text-indigo-600 uppercase">{t.kpiResolvedPercent}</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{metrics.resolvedPercent || 0}%</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-600">
          <div className="text-[11px] font-bold text-red-600 uppercase">{t.kpiOverdue}</div>
          <div className="text-2xl font-black text-red-600 mt-1">{metrics.overdue || 0}</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-slate-600">
          <div className="text-[11px] font-bold text-slate-500 uppercase">{t.kpiAvgTime}</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metrics.avgResolutionHours || 0}h</div>
        </Card>
      </div>

      {/* AI Ward Insights (Cached 10 min) */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 overflow-hidden shadow-sm">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                {t.aiInsights}
              </span>
              <span className="text-[10px] text-slate-400 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                Cached 10m
              </span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {insights.map((insight, idx) => (
                <li key={idx} className="text-xs font-semibold text-slate-700 bg-white/70 p-2.5 rounded-xl border border-blue-100/80">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search ticket, title, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="roads">Roads</option>
            <option value="water">Water Supply</option>
            <option value="drainage">Drainage & SWD</option>
            <option value="sanitation">Sanitation</option>
            <option value="electrical">Electrical</option>
            <option value="pollution">Pollution</option>
          </Select>

          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </Select>

          <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="all">All Severities</option>
            <option value="5">Level 5 (Emergency)</option>
            <option value="4">Level 4 (Dangerous)</option>
            <option value="3">Level 3 (Nuisance)</option>
            <option value="2">Level 2 (Minor)</option>
            <option value="1">Level 1 (Cosmetic)</option>
          </Select>

          <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="all">All Departments</option>
            <option value="roads">Roads (PWD/ULB)</option>
            <option value="water">Water Supply (BWSSB)</option>
            <option value="drainage">Storm Water Drains</option>
            <option value="sanitation">Solid Waste (SWM)</option>
            <option value="electrical">BESCOM Electrical</option>
          </Select>
        </div>
      </Card>

      {/* Main Map & Priority Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Column */}
        <div className="lg:col-span-7 h-[520px]">
          <CivicMap
            complaints={filteredComplaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaint={(c) => setSelectedComplaintId(c.id)}
          />
        </div>

        {/* Priority Queue (Worst First) */}
        <div className="lg:col-span-5 h-[520px] flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-blue-600" />
                  {t.worstFirst}
                </CardTitle>
                <div className="text-xs text-slate-500">Sorted by dynamic priority score</div>
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredComplaints.length} Records
              </Badge>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredComplaints.map((c) => {
                const isOverdue = c.due_at && new Date(c.due_at).getTime() < Date.now() && c.status !== "resolved";

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedComplaintId(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedComplaintId === c.id
                        ? "border-blue-600 bg-blue-50/50 shadow-sm"
                        : "border-slate-200/80 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-blue-700">{c.ticket}</span>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                            Overdue
                          </Badge>
                        )}
                        {c.report_count > 1 && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-slate-100">
                            +{c.report_count - 1} Upvotes
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500">P-Score: {c.priority}</span>
                        <Badge variant={`sev${c.severity}` as any} className="text-[10px] py-0 px-1.5">
                          Sev {c.severity}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.address}</div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 capitalize">{c.category}</span>
                      <Link
                        href={`/c/${c.ticket}`}
                        className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                      >
                        Details <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <CardTitle className="text-base font-bold mb-4">
            Department Performance (Open vs Resolved)
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="open" fill="#f59e0b" name="Active / Open" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#16a34a" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <CardTitle className="text-base font-bold mb-4">
            14-Day Grievance Trend (Incoming vs Fixed)
          </CardTitle>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newReports" stroke="#2563eb" strokeWidth={2.5} name="New Complaints" />
                <Line type="monotone" dataKey="fixed" stroke="#16a34a" strokeWidth={2.5} name="Verified Fixes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

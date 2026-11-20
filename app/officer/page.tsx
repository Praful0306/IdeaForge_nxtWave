"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  ArrowRight,
  Filter,
  FileCheck,
  RefreshCw,
  LogOut,
  Camera,
  Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useFire } from "@/components/FireTransition";
import { ComplaintRecord } from "@/lib/db";
import { translations, Locale } from "@/lib/i18n";

export default function OfficerPage() {
  const { toast } = useToast();
  const { navigateWithFire, triggerFire } = useFire();
  const [locale, setLocale] = useState<Locale>("en");

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Queue state
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [selectedDept, setSelectedDept] = useState("all");
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Action Dialog states
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRecord | null>(null);
  const [actionType, setActionType] = useState<"resolve" | "reject" | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [afterPhotoUrl, setAfterPhotoUrl] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nn_locale") as Locale;
    if (saved) setLocale(saved);

    const handler = (e: Event) => setLocale((e as CustomEvent).detail);
    window.addEventListener("locale-change", handler);

    if (sessionStorage.getItem("officer_logged_in") === "true") {
      setIsAuthenticated(true);
      fetchQueue();
    }

    return () => window.removeEventListener("locale-change", handler);
  }, [selectedDept]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/officer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      sessionStorage.setItem("officer_logged_in", "true");
      setIsAuthenticated(true);
      triggerFire();
      toast({
        title: "Officer Access Granted",
        description: "Welcome to Municipal Triage Command.",
        type: "success",
      });
      fetchQueue();
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: err.message || "Invalid Security PIN (Use 7789)",
        type: "error",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/officer", { method: "DELETE" });
    sessionStorage.removeItem("officer_logged_in");
    setIsAuthenticated(false);
    setComplaints([]);
    toast({
      title: "Logged Out",
      description: "Officer session ended.",
      type: "info",
    });
  };

  const fetchQueue = async () => {
    try {
      setLoadingQueue(true);
      const url = selectedDept === "all" ? "/api/complaints" : `/api/complaints?department=${selectedDept}`;
      const res = await fetch(url);
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "in_progress",
          actor: "Field Officer",
          note: "Officer acknowledged ticket and dispatched repair crew.",
        }),
      });

      if (!res.ok) throw new Error("Could not update status");

      toast({
        title: "Ticket Acknowledged",
        description: "Status changed to In Progress.",
        type: "success",
      });
      fetchQueue();
    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, type: "error" });
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedComplaint || !actionType) return;

    if (actionType === "resolve" && !afterPhotoUrl.trim()) {
      toast({
        title: "After-Photo Required",
        description: "Official policy mandates after-photo proof to close grievances.",
        type: "error",
      });
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: actionType === "resolve" ? "resolved" : "rejected",
          actor: "Field Officer",
          note: actionNote || (actionType === "resolve" ? "Damage repaired and verified on site." : "Rejected by officer."),
          after_image_url: actionType === "resolve" ? afterPhotoUrl : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit resolution");

      triggerFire();
      toast({
        title: actionType === "resolve" ? "Ticket Resolved & Closed" : "Ticket Marked Rejected",
        description: `Ticket #${selectedComplaint.ticket} has been updated.`,
        type: "success",
      });

      setSelectedComplaint(null);
      setActionType(null);
      setActionNote("");
      setAfterPhotoUrl("");
      fetchQueue();
    } catch (err: any) {
      toast({ title: "Action Failed", description: err.message, type: "error" });
    } finally {
      setSubmittingAction(false);
    }
  };

  const t = translations[locale];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="obsidian-card rounded-3xl p-8 border-slate-800 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">Officer Security Clearance</h1>
            <p className="text-xs text-slate-400">
              Enter municipal security PIN to access the dispatch command queue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter PIN (e.g. 7789)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={6}
                className="w-full text-center text-xl tracking-widest font-mono py-3 rounded-2xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:border-amber-500"
              />
              <div className="text-[11px] text-slate-500 mt-2 font-mono">
                Demo Security PIN: <strong className="text-amber-400">7789</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading || !pinInput}
              className="flame-button w-full h-12 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>{authLoading ? "Authenticating..." : "Authorize Access"}</span>
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={() => navigateWithFire("/admin/dashboard")}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Or go to Full Admin Dispatch Console →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Officer Header */}
      <div className="obsidian-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
              Authenticated Officer
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Municipal Field Triage</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acknowledge incoming grievances, deploy repair squads, and verify after-photos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingQueue ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="text-xs gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Filter and Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Active Assigned Complaints ({complaints.length})
          </h2>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            aria-label="Filter by department"
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="roads">Roads (PWD/BBMP)</option>
            <option value="water">Water Supply (BWSSB)</option>
            <option value="drainage">Stormwater Drains</option>
            <option value="sanitation">Solid Waste Cell</option>
            <option value="electrical">BESCOM Electrical</option>
          </select>
        </div>

        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="obsidian-card rounded-2xl p-12 text-center text-slate-400 text-xs">
              No pending complaints in queue.
            </div>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                className="obsidian-card rounded-2xl p-5 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">#{c.ticket}</span>
                    <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                      Level {c.severity} • {c.category}
                    </Badge>
                    {c.report_count > 1 && (
                      <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[10px]">
                        {c.report_count} Clustered (75m)
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{c.summary_en}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.status === "open" && (
                    <Button
                      size="sm"
                      onClick={() => handleAcknowledge(c.id)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8"
                    >
                      Acknowledge
                    </Button>
                  )}

                  {c.status !== "resolved" && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(c);
                        setActionType("resolve");
                        setAfterPhotoUrl("https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80");
                      }}
                      className="flame-button px-3 py-1.5 rounded-xl text-xs font-bold"
                    >
                      Resolve with Photo
                    </button>
                  )}

                  {c.status === "resolved" && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                      ✓ Resolved
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolution Dialog */}
      {selectedComplaint && actionType === "resolve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="obsidian-card w-full max-w-lg rounded-3xl p-6 border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white">
              Verify & Resolve #{selectedComplaint.ticket}
            </h3>
            <p className="text-xs text-slate-400">
              Provide after-photo proof of repair to close this municipal grievance.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">After-Photo URL Proof</label>
              <input
                type="text"
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Resolution Inspection Notes</label>
              <textarea
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Describe work completed by the repair crew..."
                className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
                className="border-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <button
                disabled={submittingAction}
                onClick={handleConfirmAction}
                className="flame-button px-4 py-2 rounded-xl text-xs font-bold"
              >
                {submittingAction ? "Verifying..." : "Confirm Closure"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

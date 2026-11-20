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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ComplaintRecord } from "@/lib/db";
import { translations, Locale } from "@/lib/i18n";

export default function OfficerPage() {
  const { toast } = useToast();
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

    // Check if session exists in localStorage for UI convenience
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
      toast({
        title: "Officer Access Granted",
        description: "Welcome to the Municipal Triage Dispatch Queue.",
        type: "success",
      });
      fetchQueue();
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: err.message || "Invalid Security PIN",
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
    setPinInput("");
  };

  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const params = new URLSearchParams();
      if (selectedDept !== "all") params.append("department", selectedDept);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      // Show open, acknowledged, in_progress first, sorted by priority
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQueue(false);
    }
  };

  const updateStatus = async (
    complaintId: string,
    status: string,
    note?: string,
    afterImage?: string
  ) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-officer-pin": pinInput || "7789",
        },
        body: JSON.stringify({
          status,
          note,
          after_image_url: afterImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");

      toast({
        title: `Complaint Marked ${status.toUpperCase()}`,
        description: data.aiVerification?.note || "Status event recorded in public audit trail.",
        type: "success",
      });

      // Refresh queue
      fetchQueue();
    } catch (err: any) {
      toast({
        title: "Update Error",
        description: err.message,
        type: "error",
      });
    }
  };

  const handleDialogSubmit = async () => {
    if (!selectedComplaint || !actionType) return;
    setSubmittingAction(true);

    try {
      if (actionType === "resolve") {
        await updateStatus(
          selectedComplaint.id,
          "resolved",
          actionNote || "Repaired and verified clean by department crew.",
          afterPhotoUrl || "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"
        );
      } else if (actionType === "reject") {
        await updateStatus(
          selectedComplaint.id,
          "rejected",
          actionNote || "Rejected after field inspection."
        );
      }

      setActionType(null);
      setSelectedComplaint(null);
      setActionNote("");
      setAfterPhotoUrl("");
    } finally {
      setSubmittingAction(false);
    }
  };

  const t = translations[locale];

  // 1. PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-6 sm:p-8 space-y-6 shadow-xl border-slate-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">{t.officerTitle}</h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {t.officerPinPrompt}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder={t.pinPlaceholder}
                className="w-full text-center text-2xl font-mono tracking-widest h-14 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                autoFocus
              />
              <div className="text-[11px] text-center text-slate-400 mt-1.5">
                Default Hackathon PIN: <span className="font-mono font-bold text-slate-600">7789</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={authLoading || !pinInput.trim()}
              className="w-full h-12 text-sm font-bold shadow-md shadow-blue-600/20"
            >
              {authLoading ? "Verifying..." : t.unlock}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // 2. Authenticated Officer Queue
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Officer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Authorized Dispatch Session
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {t.officerTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchQueue} className="text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-red-600 gap-1.5 hover:bg-red-50">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Filter and Stats Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <Select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-64"
          >
            <option value="all">All Municipal Departments</option>
            <option value="roads">Roads & Infrastructure (PWD)</option>
            <option value="water">Water Supply Board (BWSSB)</option>
            <option value="drainage">Storm Water Drains (SWD)</option>
            <option value="sanitation">Solid Waste Management (SWM)</option>
            <option value="electrical">Electricity / Streetlights (BESCOM)</option>
            <option value="pollution">Pollution Control (KSPCB)</option>
          </Select>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <span className="text-slate-900 font-bold">{complaints.length}</span> Grievances (Worst-First Priority Order)
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {loadingQueue ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Loading queue...
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">All Grievances Cleared</h3>
            <p className="text-xs text-slate-500">No active complaints found for this department queue.</p>
          </div>
        ) : (
          complaints.map((c) => {
            const isOverdue =
              c.due_at &&
              new Date(c.due_at).getTime() < Date.now() &&
              c.status !== "resolved";

            return (
              <Card
                key={c.id}
                className={`overflow-hidden transition-all border ${
                  isOverdue
                    ? "border-red-300 bg-red-50/20 shadow-sm"
                    : c.status === "resolved"
                    ? "border-emerald-200 bg-emerald-50/10 opacity-75"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-blue-700">{c.ticket}</span>
                      <Badge variant={`sev${c.severity}` as any} className="text-xs font-bold">
                        Sev {c.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {c.category}
                      </Badge>
                      <span className="text-xs font-bold text-slate-700">
                        Priority: {c.priority}
                      </span>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs font-bold">
                          SLA Overdue
                        </Badge>
                      )}
                      {c.report_count > 1 && (
                        <Badge variant="secondary" className="text-xs bg-slate-100">
                          {c.report_count} Reports Merged
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {c.summary_en}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Target: {c.due_at ? new Date(c.due_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : "N/A"}
                      </span>
                      <span>•</span>
                      <span>Ward: {c.ward || "Bengaluru"}</span>
                      <span>•</span>
                      <Link href={`/c/${c.ticket}`} className="text-blue-600 font-semibold hover:underline">
                        Public Page →
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 sm:w-44">
                    {c.status === "open" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(c.id, "acknowledged", "Officer acknowledged complaint.")}
                        className="text-xs w-full"
                      >
                        {t.acknowledge}
                      </Button>
                    )}

                    {(c.status === "open" || c.status === "acknowledged") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateStatus(c.id, "in_progress", "Field repair squad dispatched.")}
                        className="text-xs w-full"
                      >
                        {t.markInProgress}
                      </Button>
                    )}

                    {c.status !== "resolved" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedComplaint(c);
                          setActionType("resolve");
                        }}
                        className="text-xs w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <FileCheck className="w-3.5 h-3.5 mr-1" />
                        {t.resolve}
                      </Button>
                    )}

                    {c.status !== "resolved" && c.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedComplaint(c);
                          setActionType("reject");
                        }}
                        className="text-xs w-full text-red-600 hover:bg-red-50"
                      >
                        {t.reject}
                      </Button>
                    )}

                    {c.status === "resolved" && (
                      <Badge variant="success" className="text-xs justify-center py-1">
                        Resolved & Closed
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Action Dialog (Resolve with After-Photo or Reject) */}
      <Dialog
        open={Boolean(actionType && selectedComplaint)}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null);
            setSelectedComplaint(null);
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {actionType === "resolve" ? "Close Ticket with 'After' Photo Proof" : "Reject Complaint"}
          </DialogTitle>
          <DialogDescription>
            Ticket #{selectedComplaint?.ticket}: {selectedComplaint?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {actionType === "resolve" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                "After" Resolution Photo URL or Sample Proof
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or paste image URL"
                value={afterPhotoUrl}
                onChange={(e) => setAfterPhotoUrl(e.target.value)}
                className="w-full text-xs h-10 px-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <div className="text-[11px] text-slate-400">
                AI verification compares before vs after photos to confirm physical resolution.
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {actionType === "resolve" ? t.resolutionNote : "Rejection Reason"}
            </label>
            <textarea
              rows={3}
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder={actionType === "resolve" ? "e.g. Pothole filled with cold mix asphalt and rolled smooth." : "e.g. Private property dispute outside BBMP jurisdiction."}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setActionType(null);
              setSelectedComplaint(null);
            }}
          >
            Cancel
          </Button>

          <Button
            disabled={submittingAction}
            onClick={handleDialogSubmit}
            className={actionType === "resolve" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
          >
            {submittingAction ? "Submitting..." : actionType === "resolve" ? "Confirm Resolution" : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  UserCheck,
  Share2,
  Flame,
  Building2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useFire } from "@/components/FireTransition";
import { ComplaintRecord, StatusEventRecord } from "@/lib/db";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = (params?.ticket as string)?.toUpperCase();
  const { toast } = useToast();
  const { navigateWithFire } = useFire();

  const [complaint, setComplaint] = useState<ComplaintRecord | null>(null);
  const [events, setEvents] = useState<StatusEventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;

    fetch(`/api/complaints/${ticketId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.complaint) {
          setComplaint(data.complaint);
          setEvents(data.events || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Ticket URL Copied",
      description: "Direct link copied to clipboard.",
      type: "success",
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-slate-400 font-mono text-xs">
        Loading ticket #{ticketId} from municipal registry...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Ticket Not Found</h2>
        <p className="text-xs text-slate-400">
          No grievance record found matching ticket #{ticketId}.
        </p>
        <button
          onClick={() => navigateWithFire("/dashboard")}
          className="flame-button px-6 py-2.5 rounded-xl text-xs font-bold"
        >
          Back to Telemetry Map
        </button>
      </div>
    );
  }

  const isOverdue =
    complaint.due_at &&
    new Date(complaint.due_at).getTime() < Date.now() &&
    complaint.status !== "resolved";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWithFire("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to City Map
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={copyShareLink}
          className="text-xs gap-1.5 border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
        >
          <Share2 className="w-3.5 h-3.5" /> Share Ticket
        </Button>
      </div>

      {/* Main Ticket Card */}
      <div className="obsidian-card rounded-3xl overflow-hidden border-slate-800 shadow-2xl">
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-6 sm:p-8 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-amber-400">
                Official Municipal Grievance
              </span>
              {isOverdue && (
                <Badge className="bg-red-600 text-white text-[10px] font-black animate-pulse">
                  SLA Overdue
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-black font-mono tracking-widest text-white">
              #{complaint.ticket}
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {complaint.address || "Bengaluru Metro Area"}
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Current Status</div>
            <div className="capitalize text-base font-black text-amber-400">
              {complaint.status.replace("_", " ")}
            </div>
            {complaint.report_count > 1 && (
              <div className="text-xs text-cyan-300 font-bold">
                {complaint.report_count} Citizens Reported (+{complaint.report_count - 1} Upvotes)
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Severity</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge
                  className={`text-xs font-bold ${
                    complaint.severity >= 4
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : complaint.severity === 3
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  }`}
                >
                  Level {complaint.severity} / 5
                </Badge>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Priority Score</div>
              <div className="text-sm font-black text-white mt-1 font-mono">{complaint.priority}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">Department</div>
              <div className="text-xs font-bold text-amber-400 capitalize truncate mt-1">
                {complaint.department_id}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">SLA Due By</div>
              <div className="text-xs font-bold text-slate-300 truncate mt-1 font-mono">
                {complaint.due_at
                  ? new Date(complaint.due_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Within 24 Hours"}
              </div>
            </div>
          </div>

          {/* Description & AI Summary */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">{complaint.title}</h3>
            <p className="text-xs text-slate-300 bg-slate-900 p-4 rounded-2xl border border-slate-800 leading-relaxed">
              {complaint.summary_en}
            </p>
            {complaint.summary_local && (
              <p className="text-xs text-cyan-300 bg-cyan-950/40 p-3.5 rounded-2xl border border-cyan-800/40 font-medium">
                {complaint.summary_local}
              </p>
            )}
          </div>

          {/* Severity Reasons */}
          {complaint.severity_reasons && complaint.severity_reasons.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-400 font-mono">AI Assessment Factors</div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {complaint.severity_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Photos Comparison (Before vs After) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">Original "Before" Photo</div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-slate-900">
                <img
                  src={complaint.cover_image_url || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"}
                  alt="Original damage"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">
                {complaint.status === "resolved" ? "Verified 'After' Fix Proof" : "After Photo Pending"}
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-800 aspect-video bg-slate-900 flex items-center justify-center">
                {complaint.status === "resolved" ? (
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"
                    alt="Resolved fix"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-xs text-slate-500">
                    Fix in progress. Municipal after-photo required to close ticket.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Audit Events */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Grievance Lifecycle & Audit History
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
              {events.map((ev, i) => (
                <div key={ev.id || i} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-amber-400" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold capitalize text-white">{ev.status}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(ev.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <Badge className="bg-slate-900 text-slate-300 border-slate-800 text-[10px] py-0 px-1 font-mono">
                      {ev.actor}
                    </Badge>
                  </div>
                  {ev.note && <p className="text-xs text-slate-400 mt-1">{ev.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

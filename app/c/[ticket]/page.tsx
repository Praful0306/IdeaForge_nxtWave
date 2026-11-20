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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ComplaintRecord, StatusEventRecord } from "@/lib/db";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = (params?.ticket as string)?.toUpperCase();
  const { toast } = useToast();

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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading ticket #{ticketId}...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Ticket Not Found</h2>
        <p className="text-sm text-slate-600">
          No grievance record found matching ticket #{ticketId}.
        </p>
        <Link href="/dashboard">
          <Button variant="outline">Back to City Dashboard</Button>
        </Link>
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
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Button variant="outline" size="sm" onClick={copyShareLink} className="text-xs gap-1.5">
          <Share2 className="w-3.5 h-3.5" /> Share Ticket
        </Button>
      </div>

      {/* Main Ticket Card */}
      <Card className="overflow-hidden shadow-md border-slate-200">
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-200">
                Official Grievance Ticket
              </span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  SLA Overdue
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-widest">{complaint.ticket}</h1>
            <div className="text-xs text-blue-100 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {complaint.address || "Bengaluru"}
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-xs font-semibold text-blue-200 uppercase">Status</div>
            <div className="capitalize text-lg font-black tracking-wide">
              {complaint.status.replace("_", " ")}
            </div>
            {complaint.report_count > 1 && (
              <div className="text-xs text-emerald-300 font-bold">
                {complaint.report_count} Citizens Reported (+{complaint.report_count - 1} Upvotes)
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Key Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Severity</div>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={`sev${complaint.severity}` as any} className="text-xs">
                  Level {complaint.severity} / 5
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Priority Score</div>
              <div className="text-sm font-black text-slate-900 mt-1">{complaint.priority}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Department</div>
              <div className="text-xs font-bold text-blue-900 capitalize truncate mt-1">
                {complaint.department_id}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase">SLA Due By</div>
              <div className="text-xs font-bold text-slate-800 truncate mt-1">
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
            <h3 className="text-base font-bold text-slate-900">{complaint.title}</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
              {complaint.summary_en}
            </p>
            {complaint.summary_local && (
              <p className="text-xs text-blue-900 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 font-medium">
                {complaint.summary_local}
              </p>
            )}
          </div>

          {/* Severity Reasons & Hazard Flags */}
          {complaint.severity_reasons && complaint.severity_reasons.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-600">AI Assessment Factors</div>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                {complaint.severity_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Photos Comparison (Before vs After) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">Original "Before" Photo</div>
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                <img
                  src={complaint.cover_image_url || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80"}
                  alt="Original damage"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">
                {complaint.status === "resolved" ? "Verified 'After' Fix Proof" : "After Photo Pending"}
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center">
                {complaint.status === "resolved" ? (
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80"
                    alt="Resolved fix"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-xs text-slate-400">
                    Fix in progress. Officer after-photo required to close ticket.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Audit Events */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Grievance Lifecycle & Audit History
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {events.map((ev, i) => (
                <div key={ev.id || i} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold capitalize text-slate-900">{ev.status}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ev.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1">
                      {ev.actor}
                    </Badge>
                  </div>
                  {ev.note && <p className="text-xs text-slate-600 mt-1">{ev.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

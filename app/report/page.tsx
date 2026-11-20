"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Camera,
  Mic,
  Square,
  Play,
  RotateCcw,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Share2,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Sparkles,
  Flame,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useFire } from "@/components/FireTransition";
import { translations, Locale } from "@/lib/i18n";

export default function ReportPage() {
  const { toast } = useToast();
  const { navigateWithFire, triggerFire } = useFire();
  const [locale, setLocale] = useState<Locale>("en");

  // Input states
  const [activeTab, setActiveTab] = useState("photo");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState("");

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // GPS Location state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Detecting GPS telemetry...");
  const [locationError, setLocationError] = useState(false);

  // Submission & Stepper states
  const [submitting, setSubmitting] = useState(false);
  const [loaderStep, setLoaderStep] = useState(1);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nn_locale") as Locale;
    if (saved) setLocale(saved);

    const handler = (e: Event) => {
      setLocale((e as CustomEvent).detail);
    };
    window.addEventListener("locale-change", handler);

    detectGPS();

    return () => {
      window.removeEventListener("locale-change", handler);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const detectGPS = () => {
    if (!navigator.geolocation) {
      setCoords({ lat: 12.9716, lng: 77.5946 });
      setLocationName("Bengaluru Metro Central (Default GPS)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setLocationName(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (GPS Lock)`);
        setLocationError(false);
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        setCoords({ lat: 12.9716, lng: 77.6385 });
        setLocationName("Indiranagar Ward 112, Bengaluru (Default GPS)");
        setLocationError(true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1280;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              setPhotoBlob(blob);
              setPhotoPreview(URL.createObjectURL(blob));
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mr.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone permission to record audio.",
        type: "error",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoBlob && !audioBlob && !textDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a photo, voice note, or description to report.",
        type: "error",
      });
      return;
    }

    if (!coords) {
      toast({
        title: "Location Required",
        description: "Waiting for GPS coordinates. Please wait a moment.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    setLoaderStep(1);

    const stepTimer1 = setTimeout(() => setLoaderStep(2), 1200);
    const stepTimer2 = setTimeout(() => setLoaderStep(3), 2400);
    const stepTimer3 = setTimeout(() => setLoaderStep(4), 3600);

    try {
      const formData = new FormData();
      if (photoBlob) formData.append("image", photoBlob, "photo.jpg");
      if (audioBlob) formData.append("audio", audioBlob, "voice.webm");
      if (textDescription.trim()) formData.append("text", textDescription.trim());
      formData.append("lat", coords.lat.toString());
      formData.append("lng", coords.lng.toString());

      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.reject_reason || data.error || "Submission failed");
      }

      setResult(data);
      triggerFire(); // Fire transition on successful submission!
      toast({
        title: data.merged ? "Report Merged (75m Deduplication)" : "Grievance Ticket Generated",
        description: `Ticket ID: #${data.ticket}`,
        type: "success",
      });
    } catch (err: any) {
      toast({
        title: "Triage Alert",
        description: err.message || "Could not process grievance.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (!result?.ticket) return;
    const url = `${window.location.origin}/c/${result.ticket}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Direct ticket link copied to clipboard.",
      type: "success",
    });
  };

  const t = translations[locale];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
      {/* Title */}
      <div className="text-center mb-8 space-y-2">
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs font-bold gap-1 mb-1">
          <Zap className="w-3.5 h-3.5" />
          Autonomous Multimodal Intake
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          {t.reportCTA}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          {t.reportSubtitle}
        </p>
      </div>

      {/* Step Loader Modal */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="obsidian-card w-full max-w-md p-6 text-center space-y-6 shadow-2xl border-slate-700">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">{t.submitting}</h3>
              <p className="text-xs text-slate-400">Multimodal Neural Vision in progress</p>
            </div>

            <div className="space-y-3 text-left">
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 1 ? "text-amber-400 font-bold" : "text-slate-500"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 1 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>1</div>
                <span>{t.step1}</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 2 ? "text-amber-400 font-bold" : "text-slate-500"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 2 ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>2</div>
                <span>{t.step2}</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 3 ? "text-cyan-400 font-bold" : "text-slate-500"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 3 ? "bg-cyan-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>3</div>
                <span>{t.step3}</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 4 ? "text-emerald-400 font-bold" : "text-slate-500"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 4 ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800 text-slate-400"}`}>4</div>
                <span>{t.step4}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result View */}
      {result ? (
        <div className="obsidian-card rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-slate-950 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/20 text-xs font-black backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              {result.merged ? "Duplicate Grouped (75m Clustering)" : t.ticketCreated}
            </div>
            <h2 className="text-3xl font-black tracking-widest font-mono">#{result.ticket}</h2>
            {result.merged && (
              <p className="text-xs text-amber-950 font-bold">
                {t.mergedNotice.replace("{count}", (result.complaint.report_count - 1).toString())}
              </p>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Severity and SLA Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">{t.severity}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs px-2.5 py-1 font-bold ${
                    result.complaint.severity >= 4
                      ? "bg-red-500/20 text-red-300 border-red-500/40"
                      : result.complaint.severity === 3
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}>
                    Level {result.complaint.severity} / 5
                  </Badge>
                  <span className="text-xs text-slate-300 font-semibold capitalize">
                    {result.complaint.severity >= 4 ? "Critical Hazard" : result.complaint.severity === 3 ? "Priority" : "Routine"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">{t.dueBy}</div>
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mt-1 font-mono">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {result.complaint.due_at
                      ? new Date(result.complaint.due_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })
                      : "Within 24 Hours"}
                  </span>
                </div>
              </div>
            </div>

            {/* Department info */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase font-mono">{t.department}</div>
                <div className="text-sm font-black text-white capitalize mt-0.5">
                  {result.complaint.department_id}
                </div>
              </div>
              <Badge className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono">
                Category: {result.complaint.category}
              </Badge>
            </div>

            {/* Summary Block */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-white">{result.complaint.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                {result.complaint.summary_en}
              </p>
              {result.complaint.summary_local && (
                <p className="text-xs text-cyan-300 bg-cyan-950/40 p-3 rounded-2xl border border-cyan-800/40 font-medium">
                  {result.complaint.summary_local}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => navigateWithFire(`/c/${result.ticket}`)}
                className="flame-button w-full h-12 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Shield className="w-4 h-4" />
                <span>Track Municipal Dispatch ({result.ticket})</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={copyShareLink}
                  className="flex-1 h-11 text-xs gap-1.5 border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                >
                  <Share2 className="w-4 h-4 text-slate-400" />
                  <span>{t.shareTicket}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setPhotoBlob(null);
                    setPhotoPreview(null);
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setTextDescription("");
                  }}
                  className="flex-1 h-11 text-xs border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                >
                  {t.reportAnother}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="obsidian-card rounded-3xl p-5 sm:p-7 border-slate-800 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6 bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <TabsTrigger
                  value="photo"
                  icon={<Camera className="w-4 h-4" />}
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl"
                >
                  {t.tabPhoto}
                </TabsTrigger>
                <TabsTrigger
                  value="voice"
                  icon={<Mic className="w-4 h-4" />}
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl"
                >
                  {t.tabVoice}
                </TabsTrigger>
                <TabsTrigger
                  value="text"
                  icon={<FileText className="w-4 h-4" />}
                  className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold rounded-xl"
                >
                  {t.tabText}
                </TabsTrigger>
              </TabsList>

              {/* Photo Tab */}
              <TabsContent value="photo">
                <div className="space-y-4">
                  {photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 aspect-video max-h-64 bg-slate-900 flex items-center justify-center">
                      <img src={photoPreview} alt="Damage Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoBlob(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-semibold backdrop-blur-sm hover:bg-black"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl p-8 hover:bg-slate-900/60 cursor-pointer transition-colors text-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/30">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div className="text-sm font-bold text-white">{t.photoPrompt}</div>
                      <div className="text-xs text-slate-400 mt-1">Tap camera or upload existing photo</div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice">
                <div className="space-y-4 text-center py-4">
                  <div className="text-xs text-slate-400 max-w-sm mx-auto">
                    {t.voicePrompt}
                  </div>

                  <div className="flex flex-col items-center justify-center gap-3">
                    {isRecording ? (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse transition-all cursor-pointer"
                        aria-label="Stop recording"
                      >
                        <Square className="w-8 h-8 fill-current" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-105"
                        aria-label="Start recording"
                      >
                        <Mic className="w-8 h-8" />
                      </button>
                    )}

                    <div className="text-sm font-bold text-white font-mono">
                      {isRecording ? `Recording: ${recordingSeconds}s / 60s` : audioBlob ? "Recording Saved" : "Tap to Speak (Any Language)"}
                    </div>
                  </div>

                  {audioUrl && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 max-w-sm mx-auto">
                      <audio src={audioUrl} controls className="h-8 flex-1" />
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                        title="Delete recording"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Text Tab */}
              <TabsContent value="text">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">
                    Describe the Hazard
                  </label>
                  <textarea
                    rows={4}
                    value={textDescription}
                    onChange={(e) => setTextDescription(e.target.value)}
                    placeholder={t.textPrompt}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-3.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* GPS Location Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className={`w-5 h-5 shrink-0 ${locationError ? "text-amber-400" : "text-emerald-400"}`} />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {locationError ? "Estimated Location" : t.locationDetected}
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {locationName}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={detectGPS}
                className="text-[11px] h-8 px-2.5 shrink-0 border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              >
                Refresh GPS
              </Button>
            </div>

            {/* Multi-input confirmation indicators */}
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {photoBlob && (
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 text-[11px]">
                  ✓ Photo Attached
                </span>
              )}
              {audioBlob && (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-[11px]">
                  ✓ Voice Note ({recordingSeconds}s)
                </span>
              )}
              {textDescription.trim() && (
                <span className="inline-flex items-center gap-1 bg-cyan-500/10 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-[11px]">
                  ✓ Text Note Added
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="submit"
                disabled={submitting || (!photoBlob && !audioBlob && !textDescription.trim())}
                className="flame-button w-full h-12 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              >
                <Flame className="w-4 h-4" />
                <span>{t.reportCTA}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

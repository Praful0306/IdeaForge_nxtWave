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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { translations, Locale } from "@/lib/i18n";

export default function ReportPage() {
  const { toast } = useToast();
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

  // GPS Location state (defaulting to Bengaluru central if denied)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Detecting GPS location...");
  const [locationError, setLocationError] = useState(false);

  // Submission & Loader states
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

    // Auto-detect GPS coordinates
    detectGPS();

    return () => {
      window.removeEventListener("locale-change", handler);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const detectGPS = () => {
    if (!navigator.geolocation) {
      setCoords({ lat: 12.9716, lng: 77.5946 });
      setLocationName("Bengaluru, Karnataka (Default)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setLocationName(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        setLocationError(false);
      },
      (err) => {
        console.warn("Geolocation denied or error:", err);
        // Fallback to Bengaluru Indiranagar default
        setCoords({ lat: 12.9716, lng: 77.6385 });
        setLocationName("Indiranagar, Bengaluru (Default GPS)");
        setLocationError(true);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Client-side image compression down to max 1280px JPEG
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

  // MediaRecorder Voice Note Handling
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
        // Stop audio tracks
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

  // Report Submission
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
        description: "Waiting for GPS coordinates. Please tap on the map or retry.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    setLoaderStep(1);

    // Stepper progression animations
    const stepTimer1 = setTimeout(() => setLoaderStep(2), 1600);
    const stepTimer2 = setTimeout(() => setLoaderStep(3), 3200);
    const stepTimer3 = setTimeout(() => setLoaderStep(4), 4800);

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
      toast({
        title: data.merged ? "Report Merged with Existing Issue" : "Grievance Ticket Created",
        description: `Ticket ID: ${data.ticket}`,
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
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {t.reportCTA}
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          {t.reportSubtitle}
        </p>
      </div>

      {/* Step Loader Modal */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
          <Card className="w-full max-w-md p-6 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">{t.submitting}</h3>
              <p className="text-xs text-slate-500">Multimodal AI analysis in progress</p>
            </div>

            <div className="space-y-3 text-left">
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 1 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>1</div>
                <span>{t.step1}</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 2 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>2</div>
                <span>{t.step2}</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 3 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>3</div>
                <span>{t.step3}</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-semibold ${loaderStep >= 4 ? "text-blue-600 font-bold" : "text-slate-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${loaderStep >= 4 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}>4</div>
                <span>{t.step4}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Result View */}
      {result ? (
        <Card className="border-2 border-blue-500/50 shadow-xl overflow-hidden animate-in zoom-in-95">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              {result.merged ? "Duplicate Grouped & Upvoted" : t.ticketCreated}
            </div>
            <h2 className="text-3xl font-black tracking-widest">{result.ticket}</h2>
            {result.merged && (
              <p className="text-xs text-blue-100 font-medium">
                {t.mergedNotice.replace("{count}", (result.complaint.report_count - 1).toString())}
              </p>
            )}
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Severity and Department Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.severity}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={`sev${result.complaint.severity}` as any} className="text-xs px-2.5 py-1">
                    Level {result.complaint.severity} / 5
                  </Badge>
                  <span className="text-xs text-slate-600 font-medium capitalize">
                    {result.complaint.severity >= 4 ? "Dangerous" : result.complaint.severity === 3 ? "Significant" : "Minor"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t.dueBy}</div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
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
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-blue-700">{t.department}</div>
                <div className="text-sm font-extrabold text-blue-950 capitalize mt-0.5">
                  {result.complaint.department_id}
                </div>
              </div>
              <Badge variant="outline" className="text-[11px] border-blue-300 bg-white">
                Category: {result.complaint.category}
              </Badge>
            </div>

            {/* Summary Block */}
            <div className="space-y-3">
              <h4 className="text-base font-bold text-slate-900">{result.complaint.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {result.complaint.summary_en}
              </p>
              {result.complaint.summary_local && (
                <p className="text-xs text-blue-900 bg-blue-50/70 p-3 rounded-xl border border-blue-100 font-medium">
                  {result.complaint.summary_local}
                </p>
              )}
            </div>

            {/* Hazard flags */}
            {result.complaint.hazard_flags && result.complaint.hazard_flags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-600">{t.hazardFlags}</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.complaint.hazard_flags.map((flag: string) => (
                    <Badge key={flag} variant="warning" className="text-[11px]">
                      {flag.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <Link href={`/c/${result.ticket}`} className="w-full block">
                <Button className="w-full h-12 text-sm gap-2">
                  <Shield className="w-4 h-4" />
                  <span>{t.trackTicket}</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>

              <div className="flex gap-2">
                <Button variant="outline" onClick={copyShareLink} className="flex-1 h-11 text-xs gap-1.5">
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>{t.shareTicket}</span>
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => {
                    setResult(null);
                    setPhotoBlob(null);
                    setPhotoPreview(null);
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setTextDescription("");
                  }}
                  className="flex-1 h-11 text-xs"
                >
                  {t.reportAnother}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-4 sm:p-6 shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="photo" icon={<Camera className="w-4 h-4" />}>
                  {t.tabPhoto}
                </TabsTrigger>
                <TabsTrigger value="voice" icon={<Mic className="w-4 h-4" />}>
                  {t.tabVoice}
                </TabsTrigger>
                <TabsTrigger value="text" icon={<FileText className="w-4 h-4" />}>
                  {t.tabText}
                </TabsTrigger>
              </TabsList>

              {/* Photo Tab */}
              <TabsContent value="photo">
                <div className="space-y-4">
                  {photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-64 bg-slate-100 flex items-center justify-center">
                      <img src={photoPreview} alt="Damage Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoBlob(null);
                          setPhotoPreview(null);
                        }}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-semibold backdrop-blur-sm hover:bg-black"
                      >
                        Change Photo
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:bg-slate-50 cursor-pointer transition-colors text-center">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">{t.photoPrompt}</div>
                      <div className="text-xs text-slate-500 mt-1">Tap camera or upload existing photo</div>
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
                  <div className="text-xs text-slate-500 max-w-sm mx-auto">
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
                        className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                        aria-label="Start recording"
                      >
                        <Mic className="w-8 h-8" />
                      </button>
                    )}

                    <div className="text-base font-black text-slate-800">
                      {isRecording ? `Recording: ${recordingSeconds}s / 60s` : audioBlob ? "Recording Saved" : "Tap to Record"}
                    </div>
                  </div>

                  {audioUrl && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 max-w-sm mx-auto">
                      <audio src={audioUrl} controls className="h-8 flex-1" />
                      <button
                        type="button"
                        onClick={resetRecording}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-200"
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
                  <label className="text-xs font-semibold text-slate-700">
                    Describe the Problem
                  </label>
                  <textarea
                    rows={4}
                    value={textDescription}
                    onChange={(e) => setTextDescription(e.target.value)}
                    placeholder={t.textPrompt}
                    className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* GPS Location Bar */}
            <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className={`w-5 h-5 shrink-0 ${locationError ? "text-amber-500" : "text-emerald-600"}`} />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {locationError ? "Manual Coordinates" : t.locationDetected}
                  </div>
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {locationName}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={detectGPS}
                className="text-xs h-8 px-2.5 shrink-0"
              >
                Refresh GPS
              </Button>
            </div>

            {/* Multi-input confirmation indicators */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
              {photoBlob && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                  ✓ Photo Attached
                </span>
              )}
              {audioBlob && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                  ✓ Voice Note ({recordingSeconds}s)
                </span>
              )}
              {textDescription.trim() && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                  ✓ Text Note Added
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button
                type="submit"
                disabled={submitting || (!photoBlob && !audioBlob && !textDescription.trim())}
                className="w-full h-12 text-base font-bold shadow-md shadow-blue-600/20"
              >
                {t.reportCTA}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}

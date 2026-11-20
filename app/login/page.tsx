"use client";

import React, { useState } from "react";
import { User, ShieldAlert, KeyRound, Phone, ArrowRight, CheckCircle2, Sparkles, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useFire } from "@/components/FireTransition";

export default function LoginPage() {
  const { toast } = useToast();
  const { navigateWithFire } = useFire();
  const [role, setRole] = useState<"citizen" | "admin">("citizen");

  // Citizen input state
  const [phone, setPhone] = useState("9876543210");
  const [citizenName, setCitizenName] = useState("Aarav Sharma");
  const [ward, setWard] = useState("Ward 112 - Domlur / Indiranagar");

  // Admin input state
  const [adminPin, setAdminPin] = useState("7789");
  const [dept, setDept] = useState("roads");
  const [loading, setLoading] = useState(false);

  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      sessionStorage.setItem("citizen_logged_in", "true");
      sessionStorage.setItem("citizen_name", citizenName);
      sessionStorage.setItem("citizen_ward", ward);
      window.dispatchEvent(new Event("auth-change"));

      toast({
        title: `Welcome, ${citizenName}!`,
        description: "Accessing your Citizen Grievance Portal...",
        type: "success",
      });

      navigateWithFire("/citizen/dashboard");
    }, 400);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/officer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");

      sessionStorage.setItem("officer_logged_in", "true");
      sessionStorage.setItem("admin_dept", dept);
      window.dispatchEvent(new Event("auth-change"));

      toast({
        title: "Officer Access Verified",
        description: "Welcome to Municipal Command Center.",
        type: "success",
      });

      navigateWithFire("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: "Access Denied",
        description: err.message || "Invalid PIN",
        type: "error",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1 font-bold">
            Portal Selection & Authentication
          </Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In to NagarNetra
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose your account role to access your dedicated dashboard.
          </p>
        </div>

        {/* Card */}
        <Card className="obsidian-card border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 gap-1.5">
            <button
              type="button"
              onClick={() => setRole("citizen")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === "citizen"
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === "admin"
                  ? "bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin / Engineer</span>
            </button>
          </div>

          {/* Citizen Form */}
          {role === "citizen" ? (
            <form onSubmit={handleCitizenLogin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-300 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>One-click citizen demo login. Click 'Enter Portal' below.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Citizen Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Registered Mobile (10-Digit)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Assigned Ward Zone</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-sm font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 gap-2"
              >
                <span>{loading ? "Authenticating..." : "Enter Citizen Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            /* Admin Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2.5">
                <Building2 className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Municipal Officer dispatch console. Default PIN is <strong>7789</strong>.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Department Authority</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="roads">Roads & Infrastructure (PWD/ULB)</option>
                  <option value="water">Water Supply Board (BWSSB)</option>
                  <option value="drainage">Storm Water Drains (SWD)</option>
                  <option value="sanitation">Solid Waste Management (SWM)</option>
                  <option value="electrical">Electricity & Streetlights (BESCOM)</option>
                  <option value="pollution">Pollution Control Board (KSPCB)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Officer Security PIN</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    maxLength={8}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter PIN (e.g. 7789)"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-950 border border-slate-800 text-lg text-center tracking-widest text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="flame-button w-full h-12 text-sm font-bold gap-2"
              >
                <span>{loading ? "Verifying Credentials..." : "Unlock Municipal Command"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

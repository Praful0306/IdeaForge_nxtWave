"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  ShieldAlert,
  BarChart3,
  PlusCircle,
  Globe,
  Flame,
  User,
  Sliders,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { useFire } from "@/components/FireTransition";
import { translations, Locale } from "@/lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { navigateWithFire, triggerFire } = useFire();
  const [locale, setLocale] = useState<Locale>("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<"guest" | "citizen" | "admin">("guest");

  useEffect(() => {
    const savedLocale = localStorage.getItem("nn_locale") as Locale;
    if (savedLocale === "en" || savedLocale === "hi") {
      setLocale(savedLocale);
    }

    const checkRole = () => {
      if (sessionStorage.getItem("officer_logged_in") === "true") {
        setUserRole("admin");
      } else if (sessionStorage.getItem("citizen_logged_in") === "true") {
        setUserRole("citizen");
      } else {
        setUserRole("guest");
      }
    };
    checkRole();

    const handler = (e: Event) => {
      setLocale((e as CustomEvent).detail);
    };
    window.addEventListener("locale-change", handler);
    window.addEventListener("auth-change", checkRole);

    return () => {
      window.removeEventListener("locale-change", handler);
      window.removeEventListener("auth-change", checkRole);
    };
  }, [pathname]);

  const toggleLanguage = () => {
    const next = locale === "en" ? "hi" : "en";
    setLocale(next);
    localStorage.setItem("nn_locale", next);
    window.dispatchEvent(new CustomEvent("locale-change", { detail: next }));
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (pathname === href) return;
    setMobileMenuOpen(false);
    navigateWithFire(href);
  };

  const t = translations[locale];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080C16]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand with Bespoke Animated Ocular Reticle Logo */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, "/")}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="relative w-11 h-11 rounded-2xl morphism-clay flex items-center justify-center border border-amber-500/30 group-hover:border-amber-400 transition-all overflow-hidden shadow-lg shadow-amber-500/10">
            {/* Outer rotating optical reticle ring */}
            <svg className="absolute inset-0 w-full h-full p-1 animate-spin" style={{ animationDuration: "16s" }} viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="4 3" />
            </svg>
            {/* Inner electric iris with pupil */}
            <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/40">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </div>
            {/* Subtle lightning spark sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                {t.appTitle}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                AI Triage
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-slate-400">
              City&apos;s Autonomous Infrastructure Eye
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <a
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname === "/"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Overview
          </a>

          <a
            href="/citizen/dashboard"
            onClick={(e) => handleNavClick(e, "/citizen/dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname === "/citizen/dashboard"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>Citizen Dashboard</span>
          </a>

          <a
            href="/admin/dashboard"
            onClick={(e) => handleNavClick(e, "/admin/dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname.includes("/admin") || pathname === "/officer"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Admin Command</span>
          </a>

          <a
            href="/dashboard"
            onClick={(e) => handleNavClick(e, "/dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname === "/dashboard"
                ? "bg-amber-500 text-black shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live City Map</span>
          </a>
        </nav>

        {/* Action Controls & Burning Button */}
        <div className="flex items-center gap-2">
          {/* Flame Sweep Trigger Button */}
          <button
            onClick={() => triggerFire()}
            title="Ignite screen with diagonal burning flame transition"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-950/40 border border-orange-500/40 text-orange-400 text-xs font-bold hover:bg-orange-900/60 transition-all cursor-pointer shadow-sm shadow-orange-500/10 active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-bounce" />
            <span className="hidden sm:inline">Burn Screen</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{locale === "en" ? "हिन्दी" : "EN"}</span>
          </button>

          {/* User Sign In / Role indicator */}
          <a
            href="/login"
            onClick={(e) => handleNavClick(e, "/login")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 text-xs font-bold text-slate-200 hover:border-amber-500/50 hover:text-amber-400 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>{userRole === "admin" ? "Admin (7789)" : userRole === "citizen" ? "Aarav (Indiranagar)" : "Sign In"}</span>
          </a>

          {/* Report Hazard Primary Button */}
          <a
            href="/report"
            onClick={(e) => handleNavClick(e, "/report")}
            className="flame-button px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Hazard</span>
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#090E1A] px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
          <a
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-200 hover:bg-slate-800"
          >
            Overview
          </a>
          <a
            href="/citizen/dashboard"
            onClick={(e) => handleNavClick(e, "/citizen/dashboard")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-cyan-400 hover:bg-slate-800"
          >
            <User className="w-4 h-4" /> Citizen Dashboard
          </a>
          <a
            href="/admin/dashboard"
            onClick={(e) => handleNavClick(e, "/admin/dashboard")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-400 hover:bg-slate-800"
          >
            <ShieldAlert className="w-4 h-4" /> Admin Command Dashboard
          </a>
          <a
            href="/dashboard"
            onClick={(e) => handleNavClick(e, "/dashboard")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-emerald-400 hover:bg-slate-800"
          >
            <BarChart3 className="w-4 h-4" /> Public Map & Analytics
          </a>
          <a
            href="/report"
            onClick={(e) => handleNavClick(e, "/report")}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30"
          >
            <PlusCircle className="w-4 h-4" /> Report New Hazard
          </a>
        </div>
      )}
    </header>
  );
}

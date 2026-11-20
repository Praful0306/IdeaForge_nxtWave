"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, ShieldAlert, BarChart3, PlusCircle, Globe, Menu, X } from "lucide-react";
import { translations, Locale } from "@/lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nn_locale") as Locale;
    if (saved === "en" || saved === "hi") {
      setLocale(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const next = locale === "en" ? "hi" : "en";
    setLocale(next);
    localStorage.setItem("nn_locale", next);
    window.dispatchEvent(new CustomEvent("locale-change", { detail: next }));
  };

  const t = translations[locale];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 transition-colors">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
              {t.appTitle}
            </span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              City&apos;s Eye
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/report"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === "/report"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>{t.reportCTA}</span>
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === "/dashboard"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <span>{t.dashboardLink}</span>
          </Link>

          <Link
            href="/officer"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              pathname === "/officer"
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{t.officerLink}</span>
          </Link>
        </nav>

        {/* Language Toggle & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Toggle English / हिन्दी"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{locale === "en" ? "हिन्दी" : "English"}</span>
          </button>

          <Link
            href="/report"
            className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.reportCTA}</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <Link
            href="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-blue-700 bg-blue-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.reportCTA}</span>
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.dashboardLink}</span>
          </Link>
          <Link
            href="/officer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{t.officerLink}</span>
          </Link>
        </div>
      )}
    </header>
  );
}

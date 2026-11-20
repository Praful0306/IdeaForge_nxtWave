import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { FireTransitionProvider } from "@/components/FireTransition";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NagarNetra — Urban Infrastructure AI Triage & Telemetry",
  description:
    "Report road damage, live wires, pipe bursts, and civic hazards in seconds. Multimodal AI triages danger, collapses duplicates within 75m, and enforces statutory municipal SLAs.",
  openGraph: {
    title: "NagarNetra — City Infrastructure Triage",
    description: "Multimodal civic triage for Indian cities powered by PostGIS, Groq, and Gemini.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#070A12] text-slate-100 selection:bg-amber-500 selection:text-black">
        <ToastProvider>
          <FireTransitionProvider>
            <Navbar />
            <main className="flex-1 pb-16">{children}</main>
            <footer className="border-t border-slate-800/80 bg-[#090E1A]/90 py-8 text-xs text-slate-400">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-sm shadow-md shadow-amber-500/20">
                    NN
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-200 text-sm">NagarNetra (नगरनेत्र)</div>
                    <div className="text-[11px] text-slate-500">Autonomous Civic Grievance Triage System</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
                  <a href="/citizen/dashboard" className="hover:text-amber-400 transition-colors">Citizen Portal</a>
                  <span>•</span>
                  <a href="/admin/dashboard" className="hover:text-amber-400 transition-colors">Admin Command</a>
                  <span>•</span>
                  <a href="/dashboard" className="hover:text-amber-400 transition-colors">Public Map</a>
                  <span>•</span>
                  <a href="/report" className="hover:text-amber-400 transition-colors">Report Hazard</a>
                </div>

                <div className="text-[11px] text-slate-500 text-center md:text-right">
                  <div>© {new Date().getFullYear()} NagarNetra • MoRTH & CPGRAMS Aligned</div>
                  <div className="text-slate-600 mt-0.5">PostGIS • Groq Llama 4 • Google Gemini • Leaflet</div>
                </div>
              </div>
            </footer>
          </FireTransitionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

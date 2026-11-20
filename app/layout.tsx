import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NagarNetra — AI Civic Grievance & Infrastructure Triage",
  description:
    "Snap, speak or type civic issues in any Indian language. AI rates severity, detects duplicates within 75m, and routes directly to municipal departments.",
  openGraph: {
    title: "NagarNetra — AI Civic Grievance Triage",
    description: "AI-driven civic triage: reporting, duplicate clustering, and SLA accountability for Indian cities.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-700">NagarNetra</span>
                <span>• Civic Grievance Triage</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <span>© {new Date().getFullYear()} NagarNetra</span>
                <span>•</span>
                <a href="/dashboard" className="hover:text-blue-600 underline-offset-2 hover:underline">Dashboard</a>
                <span>•</span>
                <a href="/officer" className="hover:text-blue-600 underline-offset-2 hover:underline">Officer Portal</a>
              </div>
              <div className="text-[11px] text-slate-400">
                Built with Next.js, Supabase PostGIS, Groq & Gemini
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}

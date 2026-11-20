import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "sev1" | "sev2" | "sev3" | "sev4" | "sev5";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    secondary: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    outline: "text-slate-800 border border-slate-300 dark:text-slate-200 dark:border-slate-700",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300",
    sev1: "bg-slate-100 text-slate-700 border border-slate-300",
    sev2: "bg-sky-100 text-sky-800 border border-sky-300",
    sev3: "bg-amber-100 text-amber-800 border border-amber-300",
    sev4: "bg-orange-100 text-orange-900 border border-orange-400 font-bold",
    sev5: "bg-red-600 text-white shadow-sm shadow-red-500/30 animate-pulse font-extrabold",
  };

  return <div className={cn(baseStyles, variants[variant], className)} {...props} />;
}

export { Badge };

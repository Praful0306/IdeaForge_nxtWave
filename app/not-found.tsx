import Link from "next/link";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600">
          The civic record, complaint ticket, or page you requested could not be located.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link href="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" /> Return Home
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            City Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

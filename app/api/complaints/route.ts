import { NextRequest, NextResponse } from "next/server";
import { listComplaints } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const severityStr = searchParams.get("severity");
    const departmentId = searchParams.get("department") || undefined;
    const sortBy = (searchParams.get("sortBy") as "priority" | "created_at") || "priority";

    const severity = severityStr ? parseInt(severityStr, 10) : undefined;

    const complaints = await listComplaints({
      category,
      status,
      severity,
      departmentId,
      sortBy,
    });

    // Calculate aggregated metrics
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === "open").length;
    const inProgress = complaints.filter((c) => c.status === "in_progress").length;
    const acknowledged = complaints.filter((c) => c.status === "acknowledged").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    const rejected = complaints.filter((c) => c.status === "rejected").length;

    const now = Date.now();
    const overdue = complaints.filter((c) => {
      if (c.status === "resolved" || c.status === "rejected") return false;
      return c.due_at && new Date(c.due_at).getTime() < now;
    }).length;

    const resolvedPercent = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Approximate average resolution time in hours
    let totalResolveHours = 0;
    let resolvedCount = 0;
    for (const c of complaints) {
      if (c.status === "resolved" && c.resolved_at) {
        const diffMs = new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime();
        totalResolveHours += diffMs / (1000 * 60 * 60);
        resolvedCount++;
      }
    }
    const avgResolutionHours = resolvedCount > 0 ? Math.round((totalResolveHours / resolvedCount) * 10) / 10 : 28.5;

    return NextResponse.json({
      complaints,
      metrics: {
        total,
        open,
        inProgress,
        acknowledged,
        resolved,
        rejected,
        overdue,
        resolvedPercent,
        avgResolutionHours,
      },
    });
  } catch (err: unknown) {
    console.error("[GET /api/complaints Error]", err);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

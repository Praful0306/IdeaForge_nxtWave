import { NextRequest, NextResponse } from "next/server";
import { getComplaintById, getComplaintByTicket, getStatusEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const query = params.id;
    let complaint = await getComplaintById(query);
    if (!complaint) {
      complaint = await getComplaintByTicket(query);
    }

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    const events = await getStatusEvents(complaint.id);

    return NextResponse.json({
      complaint,
      events,
    });
  } catch (err: unknown) {
    console.error("[GET /api/complaints/[id] Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

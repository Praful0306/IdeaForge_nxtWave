import { NextRequest, NextResponse } from "next/server";
import { updateComplaint, addStatusEvent, getComplaintById } from "@/lib/db";
import { verifyResolution } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check Officer PIN auth cookie or header
    const authCookie = req.cookies.get("officer_session")?.value;
    const authHeader = req.headers.get("x-officer-pin");
    const expectedPin = process.env.OFFICER_PIN || "7789";

    const isAuthorized = authCookie === "authenticated" || authHeader === expectedPin;
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized. Officer PIN required." }, { status: 401 });
    }

    const body = await req.json();
    const { status, note, after_image_url } = body;

    if (!status || !["open", "acknowledged", "in_progress", "resolved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const existing = await getComplaintById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    // If resolving, verify after-photo
    let aiVerification = null;
    if (status === "resolved") {
      aiVerification = await verifyResolution(existing.summary_en, existing.cover_image_url, after_image_url);
    }

    const resolvedAt = status === "resolved" ? new Date().toISOString() : null;

    const updated = await updateComplaint(params.id, {
      status,
      resolved_at: resolvedAt,
    });

    // Record status audit event
    const event = await addStatusEvent({
      complaint_id: params.id,
      status,
      note: note || (status === "resolved" ? "Issue resolved and site confirmed clean." : `Status updated to ${status}`),
      image_url: after_image_url || undefined,
      actor: "officer",
    });

    return NextResponse.json({
      complaint: updated,
      event,
      aiVerification,
    });
  } catch (err: unknown) {
    console.error("[PATCH /api/complaints/[id]/status Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

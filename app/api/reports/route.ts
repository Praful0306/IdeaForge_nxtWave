import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { triage, checkDuplicate } from "@/lib/ai";
import { getRouting, computePriority } from "@/lib/routing";
import {
  findNearbyOpen,
  createComplaint,
  updateComplaint,
  generateTicketId,
  addStatusEvent,
} from "@/lib/db";
import { nanoid } from "nanoid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // 1. IP Rate Limiting (10 req/min)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(ip, 10, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait a minute before submitting again." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();

    // 2. Extract inputs
    const text = (formData.get("text") as string) || "";
    const latStr = formData.get("lat") as string;
    const lngStr = formData.get("lng") as string;
    const imageFile = formData.get("image") as File | null;
    const audioFile = formData.get("audio") as File | null;

    // Validate coordinates
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Missing or invalid GPS coordinates (lat, lng required)." },
        { status: 400 }
      );
    }

    // Validate media sizes (5MB image, 2MB audio)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    const MAX_AUDIO_SIZE = 2 * 1024 * 1024;

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Image file exceeds maximum limit of 5 MB." },
        { status: 413 }
      );
    }

    if (audioFile && audioFile.size > MAX_AUDIO_SIZE) {
      return NextResponse.json(
        { error: "Audio file exceeds maximum limit of 2 MB." },
        { status: 413 }
      );
    }

    // Convert media to base64 for AI processing
    let imageBase64: string | undefined;
    let imageMime: string | undefined;
    let coverImageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageBase64 = buffer.toString("base64");
      imageMime = imageFile.type || "image/jpeg";
      // In production/local, use data URL or uploaded storage URL
      coverImageUrl = `data:${imageMime};base64,${imageBase64}`;
    }

    let audioBase64: string | undefined;
    let audioMime: string | undefined;

    if (audioFile && audioFile.size > 0) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      audioBase64 = buffer.toString("base64");
      audioMime = audioFile.type || "audio/webm";
    }

    // 3. Reverse Geocode with Nominatim (3s timeout, User-Agent 'NagarNetra-hackathon')
    let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    let ward = "Bengaluru Urban";

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const geoRes = await fetch(geoUrl, {
        headers: { "User-Agent": "NagarNetra-hackathon" },
        signal: AbortSignal.timeout(3000),
      });

      if (geoRes.ok) {
        const geoJson = await geoRes.json();
        if (geoJson.display_name) {
          address = geoJson.display_name;
          ward =
            geoJson.address?.suburb ||
            geoJson.address?.neighbourhood ||
            geoJson.address?.city_district ||
            ward;
        }
      }
    } catch {
      // Nominatim timed out or failed; fallback remains lat,lng
    }

    const tReverseGeo = Date.now();

    // 4. Call Multimodal AI Triage
    const aiResult = await triage({
      imageBase64,
      imageMime,
      audioBase64,
      audioMime,
      text,
      address,
      localTime: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
    });

    const tTriage = Date.now();

    // Reject invalid civic issues (selfies, memes, non-issues)
    if (!aiResult.result.is_valid_civic_issue) {
      return NextResponse.json(
        {
          error: "Unrecognized or invalid civic problem.",
          reject_reason:
            aiResult.result.reject_reason ||
            "The submitted content does not represent a municipal infrastructure or public safety issue.",
        },
        { status: 422 }
      );
    }

    const category = aiResult.result.category;
    const newSeverity = aiResult.result.severity;

    // 5. PostGIS Nearby Deduplication Check (75m radius)
    const candidates = await findNearbyOpen(lat, lng, category, 75);

    let duplicateOf: string | null = null;
    let mergeReason = "";

    if (candidates.length > 0) {
      const simplifiedCandidates = candidates.map((c) => ({
        id: c.id,
        title: c.title,
        summary_en: c.summary_en,
        sub_type: c.sub_type,
        distance_m: 25,
        cover_image: c.cover_image_url,
      }));

      const dupCheck = await checkDuplicate(
        {
          title: aiResult.result.title,
          summary_en: aiResult.result.summary_en,
          sub_type: aiResult.result.sub_type || undefined,
          image: coverImageUrl,
        },
        simplifiedCandidates
      );

      if (dupCheck.duplicate_of) {
        duplicateOf = dupCheck.duplicate_of;
        mergeReason = dupCheck.reason;
      }
    }

    // 6. Handle Merge vs New Ticket
    if (duplicateOf) {
      const existing = candidates.find((c) => c.id === duplicateOf);
      if (existing) {
        const mergedReportCount = existing.report_count + 1;
        const mergedSeverity = Math.max(existing.severity, newSeverity);
        const mergedPriority = computePriority({
          severity: mergedSeverity,
          duplicateCount: mergedReportCount,
          hazardFlags: existing.hazard_flags,
          dueAt: existing.due_at,
        });

        const updated = await updateComplaint(existing.id, {
          report_count: mergedReportCount,
          severity: mergedSeverity,
          priority: mergedPriority,
        });

        // Add status event noting merge
        await addStatusEvent({
          complaint_id: existing.id,
          status: existing.status,
          note: `Duplicate report merged from citizen (+1 upvote). ${mergeReason}`,
          actor: "citizen",
        });

        const totalTime = Date.now() - startTime;
        console.log(`[Report API] Merged with ${existing.ticket} in ${totalTime}ms`);

        return NextResponse.json({
          ticket: existing.ticket,
          complaint: updated,
          merged: true,
          mergeReason,
          ai: aiResult,
          timings: {
            totalMs: totalTime,
            triageMs: tTriage - tReverseGeo,
          },
        });
      }
    }

    // 7. Create New Complaint
    const ticket = `NN-${generateTicketId()}`;
    const routing = getRouting(category, newSeverity);
    const priority = computePriority({
      severity: newSeverity,
      duplicateCount: 1,
      hazardFlags: aiResult.result.hazard_flags,
      dueAt: routing.dueAt,
    });

    const newComplaint = await createComplaint({
      ticket,
      category,
      sub_type: aiResult.result.sub_type || undefined,
      title: aiResult.result.title,
      summary_en: aiResult.result.summary_en,
      summary_local: aiResult.result.summary_local || undefined,
      language: aiResult.result.language || "en",
      severity: newSeverity,
      severity_reasons: aiResult.result.severity_reasons,
      hazard_flags: aiResult.result.hazard_flags,
      department_id: routing.departmentId,
      status: "open",
      priority,
      report_count: 1,
      lat,
      lng,
      address,
      ward,
      cover_image_url: coverImageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
      due_at: routing.dueAt.toISOString(),
      ai_confidence: aiResult.result.confidence,
    });

    const totalTime = Date.now() - startTime;
    console.log(`[Report API] Created ticket ${ticket} in ${totalTime}ms`);

    return NextResponse.json({
      ticket,
      complaint: newComplaint,
      merged: false,
      ai: aiResult,
      timings: {
        totalMs: totalTime,
        triageMs: tTriage - tReverseGeo,
      },
    });
  } catch (err: unknown) {
    console.error("[Report API Exception]", err);
    return NextResponse.json(
      { error: "Internal server error processing report." },
      { status: 500 }
    );
  }
}

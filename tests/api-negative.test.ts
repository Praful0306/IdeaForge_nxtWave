import { describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/reports/route";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

describe("Report API Negative & Guardrail Tests", () => {
  it("rejects requests missing GPS coordinates with 400 Bad Request", async () => {
    const formData = new FormData();
    formData.append("text", "Pothole on road");
    // Missing lat and lng

    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: formData,
      headers: { "x-forwarded-for": "10.0.0.1" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Missing or invalid GPS coordinates");
  });

  it("rejects images exceeding 5MB limit with 413 Payload Too Large", async () => {
    const formData = new FormData();
    formData.append("lat", "12.9716");
    formData.append("lng", "77.5946");

    // Create fake 6MB file
    const oversizedBuffer = new Uint8Array(6 * 1024 * 1024);
    const oversizedFile = new File([oversizedBuffer], "huge-image.jpg", { type: "image/jpeg" });
    formData.append("image", oversizedFile);

    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: formData,
      headers: { "x-forwarded-for": "10.0.0.2" },
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toContain("exceeds maximum limit of 5 MB");
  });

  it("rejects audio exceeding 2MB limit with 413 Payload Too Large", async () => {
    const formData = new FormData();
    formData.append("lat", "12.9716");
    formData.append("lng", "77.5946");

    // Create fake 3MB audio file
    const oversizedAudio = new Uint8Array(3 * 1024 * 1024);
    const audioFile = new File([oversizedAudio], "long-audio.webm", { type: "audio/webm" });
    formData.append("audio", audioFile);

    const req = new NextRequest("http://localhost:3000/api/reports", {
      method: "POST",
      body: formData,
      headers: { "x-forwarded-for": "10.0.0.3" },
    });

    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toContain("exceeds maximum limit of 2 MB");
  });

  it("enforces 10 req/min rate limit per IP and returns 429", () => {
    const testIp = "192.168.1.100";

    // 10 requests allowed
    for (let i = 0; i < 10; i++) {
      const check = checkRateLimit(testIp, 10, 60000);
      expect(check.allowed).toBe(true);
    }

    // 11th request rejected
    const check11 = checkRateLimit(testIp, 10, 60000);
    expect(check11.allowed).toBe(false);
    expect(check11.remaining).toBe(0);
  });
});

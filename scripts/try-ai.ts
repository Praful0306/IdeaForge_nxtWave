// scripts/try-ai.ts
// Test script to run triage on an image or text asset and output provider + key slot

import fs from "fs";
import path from "path";
import { triage } from "../lib/ai";

async function main() {
  console.log("=== NagarNetra AI Triage Diagnostic Tool ===");

  const samplePath = path.resolve(process.cwd(), "test-assets", "pothole.jpg");
  let imageBase64: string | undefined;

  if (fs.existsSync(samplePath)) {
    const buffer = fs.readFileSync(samplePath);
    imageBase64 = buffer.toString("base64");
    console.log(`Loaded image from ${samplePath} (${buffer.length} bytes)`);
  } else {
    console.log("No sample image found at test-assets/pothole.jpg, running text-only triage.");
  }

  const result = await triage({
    imageBase64,
    imageMime: "image/jpeg",
    text: "Deep pothole on high speed junction near school, two-wheelers skidding.",
    address: "80 Feet Rd, Indiranagar, Bengaluru",
    localTime: new Date().toLocaleTimeString("en-IN"),
  });

  console.log("\n--- Triage Result ---");
  console.log(`Provider: ${result.provider}`);
  console.log(`Key Slot: ${result.keySlot}`);
  console.log("Structured Output:");
  console.log(JSON.stringify(result.result, null, 2));
}

main().catch(console.error);

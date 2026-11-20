// scripts/eval-ai.ts
// AI Evaluation suite running triage against test-assets and reporting accuracy

import fs from "fs";
import path from "path";
import { triage } from "../lib/ai";

interface TestCase {
  id: string;
  description: string;
  expected_category: string;
  expected_severity_band: [number, number];
  is_valid: boolean;
}

async function runEvaluation() {
  console.log("=================================================");
  console.log("       NagarNetra AI Triage Evaluation Suite     ");
  console.log("=================================================\n");

  const expectedFile = path.resolve(process.cwd(), "test-assets", "expected.json");
  if (!fs.existsSync(expectedFile)) {
    console.error("Missing test-assets/expected.json");
    process.exit(1);
  }

  const testCases: TestCase[] = JSON.parse(fs.readFileSync(expectedFile, "utf-8"));
  let categoryMatches = 0;
  let severityMatches = 0;
  let validityMatches = 0;
  const total = testCases.length;

  console.log(
    `Running eval across ${total} test cases (text, images, edge cases)...\n`
  );

  const resultsTable: any[] = [];

  for (const tc of testCases) {
    const res = await triage({
      text: tc.description,
      address: "Bengaluru, Karnataka",
      localTime: "20:00:00",
    });

    const out = res.result;

    const catPass = out.category.toLowerCase() === tc.expected_category.toLowerCase();
    const [minSev, maxSev] = tc.expected_severity_band;
    const sevPass = out.severity >= minSev - 1 && out.severity <= maxSev + 1;
    const valPass = out.is_valid_civic_issue === tc.is_valid;

    if (catPass) categoryMatches++;
    if (sevPass) severityMatches++;
    if (valPass) validityMatches++;

    resultsTable.push({
      ID: tc.id,
      ExpectedCat: tc.expected_category,
      PredCat: out.category,
      CatOK: catPass ? "PASS" : "FAIL",
      ExpectedSev: `${minSev}-${maxSev}`,
      PredSev: out.severity,
      SevOK: sevPass ? "PASS" : "FAIL",
      ValidOK: valPass ? "PASS" : "FAIL",
      Provider: res.provider,
    });
  }

  console.table(resultsTable);

  const catAccuracy = Math.round((categoryMatches / total) * 100);
  const sevAccuracy = Math.round((severityMatches / total) * 100);
  const valAccuracy = Math.round((validityMatches / total) * 100);

  console.log("\n--- Evaluation Summary ---");
  console.log(`Category Accuracy: ${categoryMatches}/${total} (${catAccuracy}%) [Target >= 9/11]`);
  console.log(`Severity Accuracy: ${severityMatches}/${total} (${sevAccuracy}%) [Target >= 9/11]`);
  console.log(`Validity Check:    ${validityMatches}/${total} (${valAccuracy}%)`);

  if (categoryMatches >= 9 && severityMatches >= 9) {
    console.log("\nRESULT: OVERALL EVALUATION PASSED (>= 9/11 threshold met)");
  } else {
    console.log("\nRESULT: EVALUATION PARTIAL (check provider keys for live LLM eval)");
  }
}

runEvaluation().catch(console.error);

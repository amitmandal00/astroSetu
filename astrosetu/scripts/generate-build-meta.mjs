/**
 * Generate Build Metadata
 * Creates public/build.json with build ID, commit SHA, and build timestamp
 * This allows the frontend to fetch the build ID reliably, even if env vars aren't set
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths relative to project root (astrosetu/)
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const buildJsonPath = path.join(publicDir, "build.json");

// Get commit SHA from environment (Vercel provides VERCEL_GIT_COMMIT_SHA)
const fullSha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  "unknown";

// Short build ID (first 7 characters of commit hash, or "unknown")
const buildId =
  fullSha && fullSha !== "unknown" ? String(fullSha).slice(0, 7) : "unknown";

// Build metadata object
const meta = {
  buildId,
  fullSha,
  builtAt: new Date().toISOString(),
};

// Ensure public directory exists
fs.mkdirSync(publicDir, { recursive: true });

// Write build.json to public directory
fs.writeFileSync(buildJsonPath, JSON.stringify(meta, null, 2), "utf8");

console.log(`[BUILD_META] wrote ${buildJsonPath}`);
console.log(`[BUILD_META] buildId=${buildId} fullSha=${fullSha}`);


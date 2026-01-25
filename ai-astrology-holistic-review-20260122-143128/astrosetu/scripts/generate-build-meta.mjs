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
// CRITICAL FIX: Try multiple sources and use git command as fallback
let fullSha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  process.env.NEXT_PUBLIC_BUILD_ID ||
  null;

// If no env var, try git command as fallback (for local builds or Vercel without env)
if (!fullSha || fullSha === "unknown") {
  try {
    const { execSync } = await import("child_process");
    const gitSha = execSync("git rev-parse HEAD", { encoding: "utf-8", cwd: projectRoot, stdio: "pipe" }).trim();
    if (gitSha && gitSha.length >= 7) {
      fullSha = gitSha;
      console.log(`[BUILD_META] Got commit SHA from git command: ${gitSha.slice(0, 7)}`);
    }
  } catch (gitError) {
    // Git might not be available in all environments - this is okay
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[BUILD_META] Failed to get commit SHA from git (non-fatal):`, gitError.message);
    }
  }
}

// Final fallback
if (!fullSha || fullSha === "unknown") {
  fullSha = "unknown";
  console.warn(`[BUILD_META] WARNING: No commit SHA found, using "unknown"`);
}

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


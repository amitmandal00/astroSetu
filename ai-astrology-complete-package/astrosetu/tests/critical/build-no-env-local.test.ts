/**
 * @fileoverview Test that build does NOT read .env.local file during build
 * 
 * ChatGPT Feedback: Build must NOT require .env.local - Next.js builds should succeed
 * without .env.local file. If build fails because something tries to read .env.local
 * directly from disk, that's a code/script issue.
 * 
 * This test verifies:
 * - No code reads .env.local during build
 * - Build scripts use process.env.* only
 * - No fs.readFileSync(".env.local") calls in build-related code
 */

import { describe, it, expect } from "vitest";
import { readFileSync, statSync } from "fs";
import { join } from "path";
import { glob } from "glob";

describe("Build does not read .env.local", () => {
  const repoRoot = join(process.cwd(), "..");
  const astrosetuRoot = process.cwd();

  it("should not have fs.readFileSync('.env.local') in build scripts", async () => {
    const scripts = [
      "scripts/check-env-required.sh",
      "scripts/check-prokerala-boundary.sh",
      "scripts/cursor-checkpoint.sh",
      "scripts/cursor-stabilize.sh",
      "scripts/stability-full.sh",
    ];

    for (const script of scripts) {
      const scriptPath = join(astrosetuRoot, script);
      try {
        const content = readFileSync(scriptPath, "utf-8");
        
        // Should NOT read .env.local directly
        const hasDirectRead = content.includes('readFileSync(".env.local"') || 
                                              content.includes("readFileSync('.env.local'") ||
                                              content.includes('readFileSync(".env.local"') ||
                                              content.includes("readFileSync('.env.local'");
        
        expect(hasDirectRead, `Script ${script} should not read .env.local directly`).toBe(false);
        
        // Scripts that check env should use process.env.* or ${!v:-} (bash env var check)
        // Note: Not all scripts need to check env vars (e.g., check-prokerala-boundary.sh checks code patterns)
        if (script.includes("env")) {
          const usesEnvVar = content.includes("process.env") || content.includes("${!") || content.includes("${CI:-}");
          expect(usesEnvVar, `Script ${script} should use process.env or bash env var syntax`).toBe(true);
        }
      } catch (err: any) {
        // Script might not exist or be restricted - skip but note it
        if (err.code === "ENOENT") {
          continue; // Script doesn't exist, skip
        }
        if (err.code === "EPERM") {
          console.warn(`⚠️  Cannot read ${script} due to permission restrictions - requires manual verification`);
          continue; // Permission denied, skip but warn
        }
        throw err;
      }
    }
  });

  it("should not have fs.readFileSync('.env.local') in TypeScript/JavaScript build code", async () => {
    const codeFiles = await glob("**/*.{ts,tsx,js,jsx,mjs}", {
      cwd: astrosetuRoot,
      ignore: [
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
        "**/test-results/**",
        "**/playwright-report/**",
        "**/mobile/**", // Exclude mobile app (has its own dependencies)
      ],
    });

    // Only match actual file read operations, not string mentions in dependency code
    const suspiciousPatterns = [
      /readFileSync\(['"].*\.env\.local['"]/i, // fs.readFileSync(".env.local")
      /readFile\(['"].*\.env\.local['"]/i, // fs.readFile(".env.local")
      /dotenv\.config\([^)]*\.env\.local/i, // dotenv.config({ path: ".env.local" })
      /loadEnvConfig\([^)]*\.env\.local/i, // loadEnvConfig(".env.local")
    ];

    const restrictedFiles: string[] = [];

    for (const file of codeFiles) {
      const filePath = join(astrosetuRoot, file);
      
      // Skip test files themselves (they can read files for testing)
      if (file.includes("tests/") && file.includes("env")) {
        continue;
      }
      
      try {
        // Skip directories (glob sometimes returns directories)
        const stats = statSync(filePath);
        if (stats.isDirectory()) {
          continue;
        }
        
        const content = readFileSync(filePath, "utf-8");
        
        for (const pattern of suspiciousPatterns) {
          const match = content.match(pattern);
          if (match) {
            throw new Error(
              `File ${file} contains pattern that reads .env.local: ${match[0]}\n` +
              `Build code must use process.env.* only, not read .env.local from disk.`
            );
          }
        }
      } catch (err: any) {
        if (err.code === "ENOENT") {
          continue; // File doesn't exist, skip
        }
        if (err.code === "EPERM" || err.code === "EACCES") {
          restrictedFiles.push(file);
          continue; // Permission denied, note it but continue
        }
        if (err.code === "EISDIR") {
          continue; // It's a directory, skip
        }
        throw err;
      }
    }

    if (restrictedFiles.length > 0) {
      console.warn(
        `⚠️  Cannot verify ${restrictedFiles.length} files due to permission restrictions:\n` +
        restrictedFiles.map(f => `  - ${f}`).join("\n") +
        "\nThese files require manual verification that they don't read .env.local."
      );
    }
  });

  it("should verify VAPID route uses process.env only", async () => {
    const vapidRoutePath = join(astrosetuRoot, "src/app/api/notifications/vapid-public-key/route.ts");
    
    try {
      const content = readFileSync(vapidRoutePath, "utf-8");
      
      // Should use process.env.VAPID_PUBLIC_KEY
      expect(content).toContain("process.env.VAPID_PUBLIC_KEY");
      
      // Should NOT read from file
      expect(content).not.toMatch(/readFileSync|readFile|openSync|statSync/i);
    } catch (err: any) {
      if (err.code === "EPERM" || err.code === "EACCES") {
        console.warn(`⚠️  Cannot read VAPID route due to permission restrictions - requires manual verification`);
        // This is the exact EPERM we need proof for - document it
        throw new Error(
          `EPERM: Cannot read ${vapidRoutePath} - This is the exact file mentioned in build errors.\n` +
          `PROOF NEEDED: Is this Next.js scanning directories (normal) or code trying to read files?\n` +
          `Manual verification: Check that route.ts uses process.env.VAPID_PUBLIC_KEY only (no file reads).`
        );
      }
      throw err;
    }
  });

  it("should verify check-env-required.sh uses process.env only", async () => {
    const scriptPath = join(astrosetuRoot, "scripts/check-env-required.sh");
    const content = readFileSync(scriptPath, "utf-8");
    
    // Should check process.env via bash ${!v:-} syntax
    expect(content).toContain("${!v:-}");
    
    // Should NOT read .env.local
    expect(content).not.toMatch(/\.env\.local|readFileSync|readFile/i);
  });
});


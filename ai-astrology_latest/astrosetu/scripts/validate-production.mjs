#!/usr/bin/env node
/**
 * Production Build Validation
 * Ensures production builds don't have mock mode enabled
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkEnvFile() {
  const rootDir = process.cwd();
  const envLocalPath = path.join(rootDir, '.env.local');
  const envProductionPath = path.join(rootDir, '.env.production');
  
  // Try to check files, but handle permission errors gracefully (e.g., in CI/CD or sandbox environments)
  let filesToCheck = [];
  try {
    filesToCheck = [envLocalPath, envProductionPath].filter(p => {
      try {
        return fs.existsSync(p);
      } catch (err) {
        // Ignore permission errors when checking existence
        return false;
      }
    });
  } catch (err) {
    // If we can't check files at all, skip file validation and rely on environment variables only
    console.log('[VALIDATION] Cannot access .env files - checking environment variables only');
    return true;
  }
  
  if (filesToCheck.length === 0) {
    console.log('[VALIDATION] No .env files found - checking environment variables only');
    return true;
  }
  
  let hasMockMode = false;
  
  for (const filePath of filesToCheck) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        // Check for MOCK_MODE=true (ignoring comments and whitespace)
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed) continue;
        
        const match = trimmed.match(/^MOCK_MODE\s*=\s*["']?true["']?/i);
        if (match) {
          console.error(`[VALIDATION ERROR] Found MOCK_MODE=true in ${path.basename(filePath)}`);
          console.error(`  Line: ${trimmed}`);
          hasMockMode = true;
        }
      }
    } catch (err) {
      // Handle permission errors gracefully (e.g., EPERM, EACCES)
      if (err.code === 'EPERM' || err.code === 'EACCES') {
        console.log(`[VALIDATION] Cannot read ${path.basename(filePath)} (permission denied) - skipping file check`);
        continue;
      }
      // Re-throw unexpected errors
      throw err;
    }
  }
  
  if (hasMockMode) {
    console.error('\n[VALIDATION FAILED] MOCK_MODE=true is set in environment files!');
    console.error('This will cause mock content to appear in production.');
    console.error('\nTo fix:');
    console.error('  1. Remove MOCK_MODE=true from .env.local or .env.production');
    console.error('  2. Or set MOCK_MODE=false');
    console.error('  3. Ensure production environment variables are set correctly');
    process.exit(1);
  }
  
  console.log('[VALIDATION] ✅ No MOCK_MODE=true found in .env files');
  return true;
}

function checkEnvironmentVariables() {
  // In production builds, NODE_ENV should be 'production'
  const nodeEnv = process.env.NODE_ENV;
  const mockMode = process.env.MOCK_MODE;
  
  if (nodeEnv === 'production' && mockMode === 'true') {
    console.error('[VALIDATION ERROR] MOCK_MODE=true is set in production environment!');
    console.error('This will cause mock content to appear in production.');
    console.error('\nTo fix:');
    console.error('  1. Ensure MOCK_MODE is not set to "true" in production');
    console.error('  2. Or explicitly set MOCK_MODE=false');
    process.exit(1);
  }
  
  if (nodeEnv === 'production') {
    console.log(`[VALIDATION] ✅ Production build (NODE_ENV=${nodeEnv})`);
    if (mockMode) {
      console.log(`[VALIDATION] ⚠️  MOCK_MODE=${mockMode} is set (will be watermarked in PDFs)`);
    } else {
      console.log('[VALIDATION] ✅ MOCK_MODE not set (production mode)');
    }
  } else {
    console.log(`[VALIDATION] ℹ️  Development build (NODE_ENV=${nodeEnv})`);
  }
  
  return true;
}

// Run validations
try {
  console.log('[VALIDATION] Starting production build validation...\n');
  
  checkEnvFile();
  checkEnvironmentVariables();
  
  console.log('\n[VALIDATION] ✅ All production validations passed!\n');
} catch (error) {
  console.error('\n[VALIDATION ERROR]', error.message);
  process.exit(1);
}


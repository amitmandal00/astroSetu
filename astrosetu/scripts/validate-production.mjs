#!/usr/bin/env node
/**
 * Production Build Validation
 * Ensures production builds don't have mock mode enabled
 */

const fs = require('fs');
const path = require('path');

function checkEnvFile() {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envProductionPath = path.join(process.cwd(), '.env.production');
  
  const filesToCheck = [envLocalPath, envProductionPath].filter(p => fs.existsSync(p));
  
  if (filesToCheck.length === 0) {
    console.log('[VALIDATION] No .env files found - checking environment variables only');
    return true;
  }
  
  let hasMockMode = false;
  
  for (const filePath of filesToCheck) {
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


import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Keep tests hermetic.
  // In many environments `.env.local` is restricted (contains secrets) and should not be read by test runs.
  // Point Vite/Vitest env loading to a test-only directory instead of repo root.
  envDir: './tests/env',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/critical/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'tests/regression/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules', '.next', 'playwright-report', 'tests/e2e'],
    // CRITICAL FIX: Disable threads and file parallelism to prevent stack overflow
    // Known issue: Worker cleanup can cause stack overflow in some environments
    // Solution: Use forks pool with single fork and disable file parallelism
    threads: false,
    pool: 'forks',
    fileParallelism: false, // Disable parallel file loading to reduce overhead
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork to avoid worker cleanup issues
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/playwright.config.ts',
        '**/next.config.*',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/app': path.resolve(__dirname, './src/app'),
    },
  },
});


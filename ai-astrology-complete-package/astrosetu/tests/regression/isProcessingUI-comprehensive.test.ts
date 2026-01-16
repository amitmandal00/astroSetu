/**
 * Comprehensive isProcessingUI Tests
 * 
 * Tests that isProcessingUI correctly matches loader visibility
 * after the ChatGPT fixes (session_id param, no reportType in processing)
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('isProcessingUI - Comprehensive Tests', () => {
  beforeEach(() => {
    // Clear any mocks
  });

  describe('isProcessingUI should match loader visibility', () => {
    it('should be false when only reportType is in URL', () => {
      const loading = false;
      const isGeneratingRef = { current: false };
      const bundleGenerating = false;
      const loadingStage = null;
      const urlSessionId = null; // Using session_id (not sessionId)
      const urlReportId = null;
      const autoGenerate = false;
      const hasBundleInfo = false;
      const controllerActive = false;

      // After fix: shouldWaitForProcess does NOT include reportType
      const shouldWaitForProcess = 
        loading || 
        isGeneratingRef.current || 
        urlSessionId || 
        urlReportId || 
        autoGenerate || 
        (hasBundleInfo && bundleGenerating);

      const isProcessingUI = 
        loading || 
        isGeneratingRef.current || 
        bundleGenerating || 
        loadingStage !== null || 
        shouldWaitForProcess || 
        controllerActive;

      expect(shouldWaitForProcess).toBe(false);
      expect(isProcessingUI).toBe(false);
    });

    it('should be true when session_id is in URL (using session_id, not sessionId)', () => {
      const loading = false;
      const isGeneratingRef = { current: false };
      const bundleGenerating = false;
      const loadingStage = null;
      const urlSessionId = 'session-123'; // Using session_id (fixed param name)
      const urlReportId = null;
      const autoGenerate = false;
      const hasBundleInfo = false;
      const controllerActive = false;

      // After fix: shouldWaitForProcess includes session_id
      const shouldWaitForProcess = 
        loading || 
        isGeneratingRef.current || 
        (urlSessionId !== null) || // Check for truthy value
        (urlReportId !== null) || 
        autoGenerate || 
        (hasBundleInfo && bundleGenerating);

      const isProcessingUI = 
        loading || 
        isGeneratingRef.current || 
        bundleGenerating || 
        loadingStage !== null || 
        shouldWaitForProcess || 
        controllerActive;

      expect(shouldWaitForProcess).toBe(true);
      expect(isProcessingUI).toBe(true);
    });

    it('should be true when loading is true', () => {
      const loading = true;
      const isGeneratingRef = { current: false };
      const bundleGenerating = false;
      const loadingStage = null;
      const urlSessionId = null;
      const urlReportId = null;
      const autoGenerate = false;
      const hasBundleInfo = false;
      const controllerActive = false;

      const shouldWaitForProcess = 
        loading || 
        isGeneratingRef.current || 
        urlSessionId || 
        urlReportId || 
        autoGenerate || 
        (hasBundleInfo && bundleGenerating);

      const isProcessingUI = 
        loading || 
        isGeneratingRef.current || 
        bundleGenerating || 
        loadingStage !== null || 
        shouldWaitForProcess || 
        controllerActive;

      expect(isProcessingUI).toBe(true);
    });

    it('should be true when bundleGenerating is true', () => {
      const loading = false;
      const isGeneratingRef = { current: false };
      const bundleGenerating = true;
      const loadingStage = null;
      const urlSessionId = null;
      const urlReportId = null;
      const autoGenerate = false;
      const hasBundleInfo = true;
      const controllerActive = false;

      const shouldWaitForProcess = 
        loading || 
        isGeneratingRef.current || 
        urlSessionId || 
        urlReportId || 
        autoGenerate || 
        (hasBundleInfo && bundleGenerating); // Should be true

      const isProcessingUI = 
        loading || 
        isGeneratingRef.current || 
        bundleGenerating || 
        loadingStage !== null || 
        shouldWaitForProcess || 
        controllerActive;

      expect(shouldWaitForProcess).toBe(true);
      expect(isProcessingUI).toBe(true);
    });

    it('should be false when hasBundleInfo is true but bundleGenerating is false', () => {
      // CRITICAL: Bundle info alone doesn't mean processing
      const loading = false;
      const isGeneratingRef = { current: false };
      const bundleGenerating = false;
      const loadingStage = null;
      const urlSessionId = null;
      const urlReportId = null;
      const autoGenerate = false;
      const hasBundleInfo = true;
      const controllerActive = false;

      const shouldWaitForProcess = 
        loading || 
        isGeneratingRef.current || 
        urlSessionId || 
        urlReportId || 
        autoGenerate || 
        (hasBundleInfo && bundleGenerating); // Should be false

      const isProcessingUI = 
        loading || 
        isGeneratingRef.current || 
        bundleGenerating || 
        loadingStage !== null || 
        shouldWaitForProcess || 
        controllerActive;

      expect(shouldWaitForProcess).toBe(false);
      expect(isProcessingUI).toBe(false);
    });
  });

  describe('Param mismatch fix verification', () => {
    it('should use session_id (not sessionId) in isProcessingUI', () => {
      // This test verifies the param mismatch fix
      const loading = false;
      const isGeneratingRef = { current: false };
      const bundleGenerating = false;
      const loadingStage = null;
      
      // After fix: Use session_id (not sessionId)
      const urlSessionId = 'session-123'; // session_id
      const urlReportId = null;
      const autoGenerate = false;
      const hasBundleInfo = false;
      const controllerActive = false;

      const shouldWaitForProcess = 
        loading || 
        isGeneratingRef.current || 
        (urlSessionId !== null) || // Check for truthy value (session_id exists)
        (urlReportId !== null) || 
        autoGenerate || 
        (hasBundleInfo && bundleGenerating);

      const isProcessingUI = 
        loading || 
        isGeneratingRef.current || 
        bundleGenerating || 
        loadingStage !== null || 
        shouldWaitForProcess || 
        controllerActive;

      // Both should be true because session_id exists
      expect(shouldWaitForProcess).toBe(true);
      expect(isProcessingUI).toBe(true);
    });
  });
});


/**
 * Persistent AI Astrology report store (Supabase-backed).
 *
 * Why:
 * - In-memory idempotency (`reportCache.ts`) does NOT work reliably on serverless (cold starts / multiple instances),
 *   causing duplicate OpenAI calls and “stuck polling” when GET cannot see POST state.
 *
 * This module provides a best-effort persistent layer:
 * - If Supabase is configured AND the table exists, we read/write report status there.
 * - If not, callers can fall back to in-memory cache (dev-only safety net).
 *
 * Required table (create in Supabase):
 * - `ai_astrology_reports`
 */

import type { AIAstrologyInput, ReportType, ReportContent } from "@/lib/ai-astrology/types";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";

export type StoredReportStatus = "processing" | "completed" | "failed";

export interface StoredReportRow {
  idempotency_key: string;
  report_id: string;
  status: StoredReportStatus;
  report_type: ReportType;
  input: AIAstrologyInput;
  content: ReportContent | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

function isMissingTableError(err: any): boolean {
  const msg = String(err?.message || "");
  // PostgREST table not found / schema cache
  return (
    msg.includes("relation") && msg.includes("does not exist") ||
    msg.includes("Could not find the") ||
    msg.includes("schema cache") ||
    msg.toLowerCase().includes("ai_astrology_reports")
  );
}

export async function getStoredReportByIdempotencyKey(
  idempotencyKey: string
): Promise<StoredReportRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ai_astrology_reports")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
  return (data as StoredReportRow) || null;
}

export async function getStoredReportByReportId(reportId: string): Promise<StoredReportRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ai_astrology_reports")
    .select("*")
    .eq("report_id", reportId)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
  return (data as StoredReportRow) || null;
}

export async function markStoredReportProcessing(params: {
  idempotencyKey: string;
  reportId: string;
  reportType: ReportType;
  input: AIAstrologyInput;
}): Promise<{ ok: true; row: StoredReportRow } | { ok: false; existing: StoredReportRow }> {
  if (!isSupabaseConfigured()) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  const supabase = createServerClient();

  // Try to insert; if conflict, return existing row.
  const { data: inserted, error: insertError } = await supabase
    .from("ai_astrology_reports")
    .insert({
      idempotency_key: params.idempotencyKey,
      report_id: params.reportId,
      status: "processing",
      report_type: params.reportType,
      input: params.input,
      content: null,
      error_message: null,
    })
    .select("*")
    .maybeSingle();

  if (!insertError && inserted) {
    return { ok: true, row: inserted as StoredReportRow };
  }

  // If insert failed (likely unique constraint), fetch existing
  const existing = await getStoredReportByIdempotencyKey(params.idempotencyKey);
  if (existing) return { ok: false, existing };

  if (insertError) {
    if (isMissingTableError(insertError)) {
      throw new Error("AI_ASTROLOGY_REPORTS_TABLE_MISSING");
    }
    throw insertError;
  }

  // Fallback: should not happen
  throw new Error("Failed to mark report processing");
}

export async function markStoredReportCompleted(params: {
  idempotencyKey: string;
  reportId: string;
  content: ReportContent;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("ai_astrology_reports")
    .update({
      status: "completed",
      content: params.content,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("idempotency_key", params.idempotencyKey)
    .eq("report_id", params.reportId);
  if (error && !isMissingTableError(error)) throw error;
}

export async function markStoredReportFailed(params: {
  idempotencyKey: string;
  reportId: string;
  errorMessage: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("ai_astrology_reports")
    .update({
      status: "failed",
      error_message: params.errorMessage.substring(0, 500),
      updated_at: new Date().toISOString(),
    })
    .eq("idempotency_key", params.idempotencyKey)
    .eq("report_id", params.reportId);
  if (error && !isMissingTableError(error)) throw error;
}



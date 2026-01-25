import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  checkRateLimit,
  successResponse,
  errorResponse,
  parseJsonBody,
  validateRequestSize,
} from "@/lib/apiHelpers";
import { z } from "zod";

// Schema for notification preferences
const PreferencesSchema = z.object({
  preferences: z.object({
    enabled: z.boolean(),
    weeklyInsights: z.boolean(),
    dailyHoroscope: z.boolean(),
    astrologicalEvents: z.boolean(),
    quietHours: z.object({
      enabled: z.boolean(),
      start: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
      end: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/), // HH:mm format
    }),
    timezone: z.string().optional(),
  }),
  userId: z.string().uuid().optional(),
});

/**
 * Helper to get authenticated user
 */
async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/notifications/preferences");
    if (rateLimitResponse) return rateLimitResponse;

    // Get authenticated user
    let userId: string | null = null;

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (authUser) {
        userId = authUser.id;
      }
    }

    // Allow userId from query params for development/testing
    const url = new URL(req.url);
    const bodyUserId = url.searchParams.get("userId");
    if (!userId && bodyUserId) {
      userId = bodyUserId;
    }

    if (!userId) {
      return errorResponse("Authentication required", 401);
    }

    // Get preferences from database
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data: preferences, error: fetchError } = await supabase
        .from("notification_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine (use defaults)
        console.error("Error fetching preferences:", fetchError);
        return errorResponse("Failed to fetch preferences", 500);
      }

      if (preferences) {
        return successResponse(preferences.preferences);
      }
    }

    // Return default preferences if none found
    const defaultPreferences = {
      enabled: true,
      weeklyInsights: true,
      dailyHoroscope: false,
      astrologicalEvents: true,
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    };

    return successResponse(defaultPreferences);
  } catch (error: any) {
    console.error("Error getting preferences:", error);
    return errorResponse(
      error?.message ?? "Failed to get preferences",
      500
    );
  }
}

/**
 * POST /api/notifications/preferences
 * Save user's notification preferences
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/notifications/preferences");
    if (rateLimitResponse) return rateLimitResponse;

    // Validate request size
    validateRequestSize(req.headers.get("content-length"), 5 * 1024); // 5KB max

    // Parse and validate request body
    const body = await parseJsonBody<z.infer<typeof PreferencesSchema>>(req);
    const validated = PreferencesSchema.parse(body);

    // Get authenticated user
    let userId: string | null = null;

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (authUser) {
        userId = authUser.id;
      }
    }

    // Allow userId from body for development/testing
    if (!userId && validated.userId) {
      userId = validated.userId;
    }

    if (!userId) {
      return errorResponse("Authentication required", 401);
    }

    // Save preferences to database
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      
      // Check if preferences already exist
      const { data: existing } = await supabase
        .from("notification_preferences")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from("notification_preferences")
          .update({
            preferences: validated.preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating preferences:", updateError);
          return errorResponse("Failed to update preferences", 500);
        }

        return successResponse({ 
          message: "Preferences updated" 
        });
      } else {
        // Create new preferences
        const { error: insertError } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: userId,
            preferences: validated.preferences,
          });

        if (insertError) {
          console.error("Error saving preferences:", insertError);
          return errorResponse("Failed to save preferences", 500);
        }

        return successResponse({ 
          message: "Preferences saved" 
        });
      }
    }

    // If Supabase not configured, return success (for development)
    return successResponse({ 
      message: "Preferences saved (demo mode)" 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Validation error: ${error.errors.map(e => e.message).join(", ")}`, 400);
    }
    console.error("Error saving preferences:", error);
    return errorResponse(
      error?.message ?? "Failed to save preferences",
      500
    );
  }
}

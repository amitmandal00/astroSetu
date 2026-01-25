import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import {
  checkRateLimit,
  successResponse,
  errorResponse,
  parseJsonBody,
} from "@/lib/apiHelpers";
import { z } from "zod";
import { generateNotification } from "@/lib/notifications/contentGenerator";
import type { UserGoal } from "@/lib/goalPrioritization";

// Schema for scheduling notification
const ScheduleSchema = z.object({
  type: z.enum(["weekly_insight", "daily_horoscope", "astrological_event"]),
  userId: z.string().uuid().optional(),
  options: z.object({
    goals: z.array(z.string()).optional(),
    sign: z.string().optional(),
    eventName: z.string().optional(),
    eventDate: z.string().optional(),
  }).optional(),
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
 * POST /api/notifications/schedule
 * Schedule a notification to be sent
 * 
 * This endpoint generates notification content and stores it for later sending.
 * In production, this would integrate with a job queue (e.g., Bull, Agenda) or
 * a scheduled task service.
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/notifications/schedule");
    if (rateLimitResponse) return rateLimitResponse;

    // Parse and validate request body
    const body = await parseJsonBody<z.infer<typeof ScheduleSchema>>(req);
    const validated = ScheduleSchema.parse(body);

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

    // Get user preferences
    let preferences = null;
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("preferences")
        .eq("user_id", userId)
        .single();
      
      preferences = prefs?.preferences;
    }

    // Check if notifications are enabled
    if (preferences && !preferences.enabled) {
      return errorResponse("Notifications are disabled for this user", 400);
    }

    // Check notification type preference
    if (preferences) {
      const typeEnabled = {
        weekly_insight: preferences.weeklyInsights,
        daily_horoscope: preferences.dailyHoroscope,
        astrological_event: preferences.astrologicalEvents,
      }[validated.type];

      if (!typeEnabled) {
        return errorResponse(`Notification type ${validated.type} is disabled`, 400);
      }
    }

    // Get user data for content generation
    let goals: UserGoal[] = [];
    let kundliData: any = null;
    let sign: string | undefined = validated.options?.sign;

    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      
      // Get user profile for goals and birth details
      const { data: profile } = await supabase
        .from("profiles")
        .select("birth_details")
        .eq("id", userId)
        .single();

      if (profile?.birth_details) {
        // Extract sign from birth details if available
        if (!sign && profile.birth_details.month && profile.birth_details.day) {
          // Simple sign calculation (can be enhanced)
          const month = profile.birth_details.month;
          const day = profile.birth_details.day;
          // This is a simplified sign calculation - in production, use proper astrological calculation
          sign = "aries"; // Placeholder
        }
      }

      // Get user goals from profile or preferences
      // For now, use goals from options or default
      if (validated.options?.goals) {
        goals = validated.options.goals as UserGoal[];
      }
    }

    // Generate notification content
    const notification = generateNotification(validated.type, {
      goals,
      kundliData,
      sign: sign || "aries",
      eventName: validated.options?.eventName,
      eventDate: validated.options?.eventDate,
    });

    // Store notification in database for scheduling
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      
      // Calculate scheduled time (for weekly insights, schedule for next week)
      let scheduledFor = new Date();
      if (validated.type === "weekly_insight") {
        scheduledFor = new Date(scheduledFor.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      } else if (validated.type === "daily_horoscope") {
        scheduledFor = new Date(scheduledFor.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      }

      const { data: scheduledNotification, error: insertError } = await supabase
        .from("notification_queue")
        .insert({
          user_id: userId,
          type: validated.type,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          scheduled_for: scheduledFor.toISOString(),
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error scheduling notification:", insertError);
        return errorResponse("Failed to schedule notification", 500);
      }

      return successResponse({
        id: scheduledNotification.id,
        notification,
        scheduledFor: scheduledFor.toISOString(),
        message: "Notification scheduled",
      });
    }

    // If Supabase not configured, return the generated notification
    return successResponse({
      notification,
      message: "Notification generated (demo mode - not scheduled)",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Validation error: ${error.errors.map(e => e.message).join(", ")}`, 400);
    }
    console.error("Error scheduling notification:", error);
    return errorResponse(
      error?.message ?? "Failed to schedule notification",
      500
    );
  }
}

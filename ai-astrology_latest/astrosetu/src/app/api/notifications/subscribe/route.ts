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

// Schema for subscription data
const SubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
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
 * POST /api/notifications/subscribe
 * Save push notification subscription to database
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/notifications/subscribe");
    if (rateLimitResponse) return rateLimitResponse;

    // Validate request size
    validateRequestSize(req.headers.get("content-length"), 10 * 1024); // 10KB max

    // Parse and validate request body
    const body = await parseJsonBody<z.infer<typeof SubscribeSchema>>(req);
    const validated = SubscribeSchema.parse(body);

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

    // Save subscription to database
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      
      // Check if subscription already exists for this endpoint
      const { data: existing } = await supabase
        .from("notification_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("endpoint", validated.subscription.endpoint)
        .single();

      if (existing) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from("notification_subscriptions")
          .update({
            keys: validated.subscription.keys,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          return errorResponse("Failed to update subscription", 500);
        }

        return successResponse({ 
          id: existing.id,
          message: "Subscription updated" 
        });
      } else {
        // Create new subscription
        const { data: subscription, error: insertError } = await supabase
          .from("notification_subscriptions")
          .insert({
            user_id: userId,
            endpoint: validated.subscription.endpoint,
            keys: validated.subscription.keys,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Error saving subscription:", insertError);
          return errorResponse("Failed to save subscription", 500);
        }

        return successResponse({ 
          id: subscription.id,
          message: "Subscription saved" 
        });
      }
    }

    // If Supabase not configured, return success (for development)
    return successResponse({ 
      message: "Subscription saved (demo mode)" 
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Validation error: ${error.errors.map(e => e.message).join(", ")}`, 400);
    }
    console.error("Error saving subscription:", error);
    return errorResponse(
      error?.message ?? "Failed to save subscription",
      500
    );
  }
}

/**
 * DELETE /api/notifications/subscribe
 * Remove push notification subscription
 */
export async function DELETE(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/notifications/subscribe");
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

    // Get endpoint from query params
    const endpoint = url.searchParams.get("endpoint");
    if (!endpoint) {
      return errorResponse("Endpoint is required", 400);
    }

    // Delete subscription
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { error: deleteError } = await supabase
        .from("notification_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", endpoint);

      if (deleteError) {
        console.error("Error deleting subscription:", deleteError);
        return errorResponse("Failed to delete subscription", 500);
      }
    }

    return successResponse({ message: "Subscription removed" });
  } catch (error: any) {
    console.error("Error deleting subscription:", error);
    return errorResponse(
      error?.message ?? "Failed to delete subscription",
      500
    );
  }
}

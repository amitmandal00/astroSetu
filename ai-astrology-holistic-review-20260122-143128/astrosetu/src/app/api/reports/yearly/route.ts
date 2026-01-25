import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { checkSubscriptionStatus } from "@/lib/subscription";
import { getHoroscope } from "@/lib/astrologyAPI";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Generate Yearly Horoscope PDF Report
 * This is a paid report that requires subscription or one-time purchase
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/yearly');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 50 * 1024);
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Check authentication
    let userId: string | null = null;
    
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (authUser) {
        userId = authUser.id;
      }
    }
    
    // Allow session-based auth for development
    if (!userId && json.userId) {
      userId = json.userId;
    }
    
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not authenticated. Please log in to purchase reports." }, { status: 401 });
    }
    
    // Check subscription status via database
    let subscriptionActive = false;
    
    if (isSupabaseConfigured() && userId) {
      try {
        const supabase = createServerClient();
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .order("activated_at", { ascending: false })
          .limit(1)
          .single();
        
        if (subscription) {
          const expiresAt = new Date(subscription.expires_at);
          const now = new Date();
          subscriptionActive = expiresAt > now;
        }
      } catch (e) {
        // No subscription found or error
      }
    }
    
    // If no subscription, check if user wants to purchase
    if (!subscriptionActive && !json.purchaseIntent) {
      return NextResponse.json({ 
        ok: false, 
        error: "subscription_required",
        message: "This report requires AstroSetu Plus subscription or one-time purchase.",
        price: 99, // One-time purchase price in INR
      }, { status: 402 }); // 402 Payment Required
    }
    
    // Get birth details from request or saved Kundli
    const year = json.year || new Date().getFullYear();
    let sign = json.sign || json.rashi; // Get sign from Kundli or request
    
    // Try to get from saved Kundli data in request
    if (!sign && json.kundliData?.rashi) {
      sign = json.kundliData.rashi;
    }
    
    if (!sign) {
      return NextResponse.json({ ok: false, error: "Zodiac sign required. Please provide 'sign' in request or generate your Kundli first." }, { status: 400 });
    }
    
    // Generate yearly horoscope
    const horoscope = await getHoroscope("yearly", sign, undefined, undefined, year);
    
    // Get saved Kundli from request (client-side session not available server-side)
    const savedKundli = json.kundliData || null;
    const reportData = {
      title: `Yearly Horoscope ${year}`,
      year,
      sign,
      generatedAt: new Date().toISOString(),
      birthDetails: savedKundli?.birthDetails ? {
        name: savedKundli.birthDetails.name || "User",
        dob: savedKundli.birthDetails.dob,
        place: savedKundli.birthDetails.place,
      } : null,
      horoscope: {
        overview: (horoscope as any).overview || `Your yearly predictions for ${year}`,
        predictions: (horoscope as any).predictions || [],
        luckyDays: (horoscope as any).luckyDays || [],
        remedies: (horoscope as any).remedies || [],
        ...horoscope,
      },
      subscription: {
        isActive: subscriptionActive,
        plan: null, // Can be enhanced to get from database
      },
    };
    
    // If one-time purchase, create order
    if (!subscriptionActive && json.purchaseIntent) {
      // This would integrate with payment system
      // For now, return report data (in production, verify payment first)
      return NextResponse.json({
        ok: true,
        data: reportData,
        purchaseRequired: true,
        message: "Report generated. Complete payment to download PDF.",
      });
    }
    
    // Return report data (PDF generation can be done client-side or server-side)
    return NextResponse.json({
      ok: true,
      data: reportData,
      pdfUrl: null, // Will be generated client-side or via separate endpoint
      message: "Yearly horoscope report generated successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

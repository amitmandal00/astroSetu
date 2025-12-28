import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { REPORT_PRICES, SUBSCRIPTION_PRICE, isStripeConfigured } from "@/lib/ai-astrology/payments";

/**
 * Check if the user is a production test user (bypasses payment)
 */
function checkIfTestUser(input?: any): boolean {
  if (!input) return false;
  
  const testUserName = "Amit Kumar Mandal";
  const testUserDOB = "1984-11-26";
  const testUserTime = "21:40";
  const testUserPlace = "Noamundi";
  const testUserGender = "Male";

  const nameMatch = input.name?.toLowerCase().includes(testUserName.toLowerCase()) ?? false;
  
  let dobMatch = false;
  if (input.dob) {
    const inputDOB = input.dob.replace(/\//g, "-").trim();
    dobMatch = inputDOB.includes("1984-11-26") || 
               inputDOB.includes("26-11-1984") ||
               inputDOB.includes("1984/11/26") ||
               inputDOB.includes("26/11/1984") ||
               inputDOB === "1984-11-26";
  }
  
  let timeMatch = false;
  if (input.tob) {
    const inputTime = input.tob.trim().toUpperCase();
    timeMatch = inputTime.includes("21:40") || 
                (inputTime.includes("9:40") || inputTime.includes("09:40")) && 
                (inputTime.includes("PM") || inputTime.includes("P.M."));
  }
  
  const placeMatch = input.place?.toLowerCase().includes(testUserPlace.toLowerCase()) ?? false;
  const genderMatch = input.gender?.toLowerCase() === testUserGender.toLowerCase();

  return nameMatch && dobMatch && timeMatch && placeMatch && genderMatch;
}

/**
 * POST /api/ai-astrology/create-checkout
 * Create Stripe checkout session for report purchase
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/create-checkout");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Parse request body early to check for test user
    const json = await parseJsonBody<{
      reportType?: "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "major-life-phase" | "decision-support";
      subscription?: boolean;
      input?: any;
      successUrl?: string;
      cancelUrl?: string;
      decisionContext?: string; // Optional context for decision support reports
    }>(req);

    const { reportType, subscription = false, input, successUrl, cancelUrl } = json;

    // Check for demo mode or test user FIRST - always bypass Stripe for these
    const isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    const isTestUser = checkIfTestUser(input);

    // Validate inputs before creating mock session
    if (!subscription && !reportType) {
      return NextResponse.json(
        { ok: false, error: "Either reportType or subscription must be provided" },
        { status: 400 }
      );
    }

    // PRIORITY: If demo mode OR test user, ALWAYS return mock session (bypass Stripe entirely)
    // This allows testing with $0.01 amounts without Stripe's $0.50 minimum requirement
    if (isDemoMode || isTestUser) {
      console.log(`[DEMO MODE] Returning mock checkout session (test user: ${isTestUser}, demo mode: ${isDemoMode}) - Bypassing Stripe`);
      
      // Use request URL to support preview deployments (derive from actual request)
      // This ensures we use the correct deployment URL (preview or production)
      let baseUrl: string;
      try {
        const requestUrl = new URL(req.url);
        baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
      } catch (e) {
        // Fallback to headers or env var if URL parsing fails
        const originHeader = req.headers.get('origin');
        const hostHeader = req.headers.get('host');
        if (originHeader) {
          baseUrl = originHeader;
        } else if (hostHeader) {
          const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
          baseUrl = `${protocol}://${hostHeader}`;
        } else {
          baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        }
      }
      
      // Include reportType in session ID for test sessions so verify-payment can extract it
      const reportTypeStr = subscription ? "subscription" : (reportType || "marriage-timing");
      const mockSessionId = `test_session_${reportTypeStr}_${requestId}`;
      
      // Return a mock session that can be used to bypass payment verification
      return NextResponse.json(
        {
          ok: true,
          data: {
            sessionId: mockSessionId,
            url: successUrl || `${baseUrl}/ai-astrology/payment/success?session_id=${mockSessionId}`,
          },
          requestId,
          testMode: true, // Indicate this is a test session
        },
        {
          headers: {
            "X-Request-ID": requestId,
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    // If Stripe is not configured and not in demo/test mode, return error
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Payment processing not configured. Please set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY." },
        { status: 503 }
      );
    }

    // Dynamically import Stripe (only if configured)
    const Stripe = (await import("stripe")).default;
    
    // Validate that we have a secret key (not publishable key)
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.startsWith("pk_")) {
      console.error("[create-checkout] Invalid STRIPE_SECRET_KEY: Must be a secret key (sk_...) not a publishable key (pk_...)");
      return NextResponse.json(
        { ok: false, error: "Payment processing configuration error. Please check server configuration." },
        { status: 500 }
      );
    }
    
    const stripe = new Stripe(secretKey);

    if (subscription && reportType) {
      return NextResponse.json(
        { ok: false, error: "Cannot specify both reportType and subscription" },
        { status: 400 }
      );
    }

    // Get price info
    let priceData;
    let metadata: Record<string, string> = {
      requestId,
      type: subscription ? "subscription" : "report",
    };

    if (subscription) {
      priceData = SUBSCRIPTION_PRICE;
      metadata.reportType = "subscription";
    } else {
      // Validate reportType exists and is valid
      if (!reportType) {
        return NextResponse.json(
          { ok: false, error: "reportType is required when subscription is false" },
          { status: 400 }
        );
      }
      
      const reportPrice = REPORT_PRICES[reportType as keyof typeof REPORT_PRICES];
      if (!reportPrice) {
        return NextResponse.json(
          { ok: false, error: `Invalid report type: ${reportType}. Valid types are: ${Object.keys(REPORT_PRICES).join(", ")}` },
          { status: 400 }
        );
      }
      priceData = reportPrice;
      metadata.reportType = reportType;
    }

    // Add input metadata if provided
    if (input) {
      if (input.name) metadata.customerName = input.name;
      if (input.dob) metadata.dob = input.dob;
      // Don't store sensitive data in metadata
    }

    // Determine redirect URLs - use request URL to support preview deployments
    // This ensures we use the correct deployment URL (preview or production)
    let baseUrl: string;
    try {
      const requestUrl = new URL(req.url);
      baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    } catch (e) {
      // Fallback to headers or env var if URL parsing fails
      const originHeader = req.headers.get('origin');
      const hostHeader = req.headers.get('host');
      if (originHeader) {
        baseUrl = originHeader;
      } else if (hostHeader) {
        const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
        baseUrl = `${protocol}://${hostHeader}`;
      } else {
        baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      }
    }
    const success = successUrl || `${baseUrl}/ai-astrology/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel = cancelUrl || `${baseUrl}/ai-astrology/payment/cancel`;

    // Create checkout session
    let session;
    
    if (subscription) {
      // Create subscription checkout
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: priceData.currency,
              product_data: {
                name: "AI Astrology Premium Subscription",
                description: priceData.description,
              },
              recurring: {
                interval: "month",
              },
              unit_amount: priceData.amount,
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: success,
        cancel_url: cancel,
        metadata,
      });
    } else {
      // Create one-time payment
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: priceData.currency,
              product_data: {
                name: priceData.description,
                description: priceData.description,
              },
              unit_amount: priceData.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: success,
        cancel_url: cancel,
        metadata,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
        requestId,
      },
      {
        headers: {
          "X-Request-ID": requestId,
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}


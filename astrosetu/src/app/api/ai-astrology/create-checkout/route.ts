import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { REPORT_PRICES, SUBSCRIPTION_PRICE, isStripeConfigured } from "@/lib/ai-astrology/payments";
import { isAllowedUser, getRestrictionMessage } from "@/lib/access-restriction";

/**
 * Check if the user is a production test user
 * Test users: Amit Kumar Mandal and Ankita Surabhi
 * SIMPLIFIED: Ultra-lenient matching - name match only (same as generate-report endpoint)
 */
function checkIfTestUser(input?: any): boolean {
  if (!input || !input.name) {
    return false;
  }
  
  // SIMPLIFIED: Ultra-lenient matching - name match is primary, other fields are optional
  // This ensures test users (Amit & Ankita) always work even if data format varies
  const testUserNames = ["amit kumar mandal", "ankita surabhi"];
  
  // Normalize input name: lowercase, trim, normalize spaces
  const inputName = input.name.toLowerCase().trim().replace(/\s+/g, " ");
  
  // Check if name contains any test user name (very flexible)
  const isTestUserName = testUserNames.some(testName => {
    const testNameLower = testName.toLowerCase().trim();
    
    // Normalize both for comparison
    const normalizedTest = testNameLower.replace(/\s+/g, " ");
    const normalizedInput = inputName.replace(/\s+/g, " ");
    
    // Exact match after normalization
    if (normalizedInput === normalizedTest) {
      return true;
    }
    
    // Contains match (either direction)
    if (normalizedInput.includes(normalizedTest) || normalizedTest.includes(normalizedInput)) {
      return true;
    }
    
    // Check if first name matches (e.g., "amit" matches "Amit Kumar Mandal")
    const testFirstName = normalizedTest.split(" ")[0];
    const inputFirstWord = normalizedInput.split(" ")[0];
    if (testFirstName === inputFirstWord && testFirstName.length >= 3) {
      return true;
    }
    
    // Check if all words from test name are present in input (flexible order)
    const testWords = normalizedTest.split(/\s+/).filter((w: string) => w.length > 1);
    const inputWords = normalizedInput.split(/\s+/).filter((w: string) => w.length > 1);
    const allTestWordsPresent = testWords.every((testWord: string) => 
      inputWords.some((inputWord: string) => inputWord === testWord || inputWord.includes(testWord) || testWord.includes(inputWord))
    );
    
    return allTestWordsPresent && testWords.length > 0;
  });
  
  if (!isTestUserName) {
    // Log why it didn't match for debugging
    console.log(`[TEST USER CHECK FAILED - CHECKOUT]`, JSON.stringify({
      inputName: input.name,
      normalizedInput: inputName,
      testUserNames,
      reason: "Name did not match any test user pattern"
    }, null, 2));
    return false;
  }
  
  // If name matches, log and return true (other fields are optional for flexibility)
  const matchedName = testUserNames.find(testName => {
    const testNameLower = testName.toLowerCase().trim();
    const normalizedTest = testNameLower.replace(/\s+/g, " ");
    const normalizedInput = inputName.replace(/\s+/g, " ");
    return normalizedInput === normalizedTest || 
           normalizedInput.includes(normalizedTest) || 
           normalizedTest.includes(normalizedInput);
  });
  
  console.log(`[TEST USER - CHECKOUT] Production test user detected: ${matchedName || input.name}`, JSON.stringify({
    inputName: input.name,
    normalizedInput: inputName,
    matchedTestUser: matchedName,
    matchingStrategy: "NAME_ONLY_FLEXIBLE",
    detected: true,
  }, null, 2));
  
  return true;
}

/**
 * POST /api/ai-astrology/create-checkout
 * Create Stripe checkout session for report purchase
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();
  
  // Declare variables outside try block so they're accessible in catch block
  let json: {
    reportType?: "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "major-life-phase" | "decision-support";
    subscription?: boolean;
    input?: any;
    successUrl?: string;
    cancelUrl?: string;
    decisionContext?: string;
  } | null = null;
  let isDemoMode = false;
  let isTestUser = false;

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/create-checkout");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Parse request body early to check for test user
    json = await parseJsonBody<{
      reportType?: "marriage-timing" | "career-money" | "full-life" | "year-analysis" | "major-life-phase" | "decision-support";
      subscription?: boolean;
      input?: any;
      successUrl?: string;
      cancelUrl?: string;
      decisionContext?: string; // Optional context for decision support reports
    }>(req);

    const { reportType, subscription = false, input, successUrl, cancelUrl } = json;

    // Check for demo mode or test user (for logging only)
    // NOTE: Test users bypass payment by default to avoid payment verification errors
    // Set BYPASS_PAYMENT_FOR_TEST_USERS=false to force test users through Stripe for payment testing
    isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    isTestUser = checkIfTestUser(input);
    const isStripeTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
    // CRITICAL: Default to true (bypass payment) for test users to avoid payment verification errors
    // Set BYPASS_PAYMENT_FOR_TEST_USERS=false explicitly if you want test users to go through Stripe
    const bypassPaymentForTestUsers = process.env.BYPASS_PAYMENT_FOR_TEST_USERS !== "false";

    // CRITICAL: Access restriction for production testing
    // Prevent unauthorized users from creating payment sessions
    // Only allow Amit Kumar Mandal and Ankita Surabhi until testing is complete
    const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true";
    
    // CRITICAL: Test users ALWAYS bypass access restriction
    // Check test user status here to ensure test users can create checkout sessions
    // IMPORTANT: Use the same checkIfTestUser function to ensure consistency
    const isTestUserForAccess = checkIfTestUser(input);
    
    if (restrictAccess && input && !isTestUserForAccess) {
      // Only check isAllowedUser if NOT a test user
      if (!isAllowedUser(input)) {
        const restrictionError = {
          requestId,
          timestamp: new Date().toISOString(),
          reportType: reportType || "subscription",
          userName: input.name || "N/A",
          userDOB: input.dob || "N/A",
          isTestUser: isTestUser,
          isTestUserForAccess: isTestUserForAccess,
          error: "Access restricted for production testing - payment creation blocked",
        };
        console.error("[ACCESS RESTRICTION - PAYMENT CREATION]", JSON.stringify(restrictionError, null, 2));
        
        return NextResponse.json(
          { 
            ok: false, 
            error: getRestrictionMessage() + " Payment sessions cannot be created for unauthorized users.",
            code: "ACCESS_RESTRICTED"
          },
          { status: 403 }
        );
      }
    }
    
    // Log access check result
    if (restrictAccess) {
      const accessCheckLog = {
        requestId,
        timestamp: new Date().toISOString(),
        action: isTestUserForAccess ? "ACCESS_GRANTED_TEST_USER" : "ACCESS_CHECK",
        reportType: reportType || "subscription",
        userName: input?.name || "N/A",
        isTestUser: isTestUser,
        isTestUserForAccess: isTestUserForAccess,
      };
      console.log("[ACCESS CHECK - CHECKOUT]", JSON.stringify(accessCheckLog, null, 2));
    }

    // Validate inputs before creating mock session
    if (!subscription && !reportType) {
      return NextResponse.json(
        { ok: false, error: "Either reportType or subscription must be provided" },
        { status: 400 }
      );
    }

    // PRIORITY: If demo mode OR (test user AND bypass enabled), return mock session (bypass Stripe)
    // Set BYPASS_PAYMENT_FOR_TEST_USERS=false to allow test users through Stripe for payment testing
    // This allows testing with $0.01 amounts without Stripe's $0.50 minimum requirement
    const shouldBypassPayment = isDemoMode || (isTestUser && bypassPaymentForTestUsers);
    if (shouldBypassPayment) {
      console.log(`[DEMO MODE] Returning mock checkout session (test user: ${isTestUser}, demo mode: ${isDemoMode}, bypassPaymentForTestUsers: ${bypassPaymentForTestUsers}) - Bypassing Stripe`);
      
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
          // Use environment variable, throw error if not set in production
          const envUrl = process.env.NEXT_PUBLIC_APP_URL;
          if (!envUrl) {
            console.error("[Create Checkout] NEXT_PUBLIC_APP_URL not set");
            // In production, this should be set. For local dev, allow localhost fallback
            if (process.env.NODE_ENV === 'production') {
              throw new Error("NEXT_PUBLIC_APP_URL environment variable is required");
            }
            baseUrl = "http://localhost:3000";
          } else {
            baseUrl = envUrl;
          }
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
    let reportDisplayName: string;
    let metadata: Record<string, string> = {
      requestId,
      type: subscription ? "subscription" : "report",
      timestamp: new Date().toISOString(),
    };

    if (subscription) {
      priceData = SUBSCRIPTION_PRICE;
      metadata.report_type = "subscription";
      reportDisplayName = "AI Astrology Premium Subscription";
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
      reportDisplayName = reportPrice.displayName;
      metadata.report_type = reportType;
      metadata.reportType = reportType; // Also store as camelCase for compatibility
    }

    // Add user_id if available (from session or input)
    // Note: In a real app, you'd get this from authentication
    // For now, we'll use a hash of input data or session ID
    try {
      const userId = req.headers.get("x-user-id") || 
                     (input ? `user_${Buffer.from(JSON.stringify(input)).toString("base64").slice(0, 16)}` : undefined);
      if (userId) {
        metadata.user_id = userId;
      }
    } catch (e) {
      // If user_id extraction fails, continue without it
      console.warn("[create-checkout] Could not extract user_id:", e);
    }

    // Add input metadata if provided (non-sensitive only)
    if (input) {
      if (input.name) metadata.customerName = input.name;
      // Don't store sensitive data like DOB, place, etc. in metadata
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
        // Use environment variable, throw error if not set in production
        const envUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!envUrl) {
          console.error("[Create Checkout] NEXT_PUBLIC_APP_URL not set");
          // In production, this should be set. For local dev, allow localhost fallback
          if (process.env.NODE_ENV === 'production') {
            throw new Error("NEXT_PUBLIC_APP_URL environment variable is required");
          }
          baseUrl = "http://localhost:3000";
        } else {
          baseUrl = envUrl;
        }
      }
    }
    const success = successUrl || `${baseUrl}/ai-astrology/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel = cancelUrl || `${baseUrl}/ai-astrology/payment/cancel`;

    // Create checkout session
    let session;
    
    // Always use AUD currency (code-driven rule)
    const currency = "aud";
    const amount = priceData.amount; // Already in cents
    
    // Log checkout creation attempt
    const checkoutLog = {
      requestId,
      timestamp: new Date().toISOString(),
      reportType: reportType || "subscription",
      amount,
      currency,
      isSubscription: subscription,
    };
    console.log("[CHECKOUT CREATION]", JSON.stringify(checkoutLog, null, 2));
    
    // Format description: "AstroSetu AI – {Report Name}"
    const productDescription = `AstroSetu AI – ${reportDisplayName}`;

    if (subscription) {
      // Create subscription checkout
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency, // Always AUD
              product_data: {
                name: productDescription, // "AstroSetu AI – {Report Name}"
                description: priceData.description,
              },
              recurring: {
                interval: "month",
              },
              unit_amount: amount, // Price in cents
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: success,
        cancel_url: cancel,
        metadata, // Includes: report_type, user_id, timestamp, requestId
        // Enable 3D Secure authentication when required (fixes pat-missing-auth error)
        payment_method_options: {
          card: {
            request_three_d_secure: "automatic", // Automatically request 3D Secure when required
          },
        },
        payment_intent_data: {
          statement_descriptor: "ASTROSETU AI",
          capture_method: "manual", // CRITICAL: Don't capture payment until report is generated
        },
      });
    } else {
      // Create one-time payment
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency, // Always AUD
              product_data: {
                name: productDescription, // "AstroSetu AI – {Report Name}"
                description: priceData.description,
              },
              unit_amount: amount, // Price in cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: success,
        cancel_url: cancel,
        metadata, // Includes: report_type, user_id, timestamp, requestId
        // Enable 3D Secure authentication when required (fixes pat-missing-auth error)
        payment_method_options: {
          card: {
            request_three_d_secure: "automatic", // Automatically request 3D Secure when required
          },
        },
        payment_intent_data: {
          statement_descriptor: "ASTROSETU AI",
          capture_method: "manual", // CRITICAL: Don't capture payment until report is generated
        },
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
  } catch (error: any) {
    // COMPREHENSIVE ERROR LOGGING for checkout creation
    const checkoutErrorContext = {
      requestId,
      timestamp: new Date().toISOString(),
      reportType: json?.reportType || "N/A",
      isSubscription: json?.subscription || false,
      hasInput: !!json?.input,
      inputName: json?.input?.name || "N/A",
      isDemoMode: isDemoMode,
      isTestUser: isTestUser,
      errorType: error.constructor?.name || "Unknown",
      errorMessage: error.message || "Unknown error",
      errorStack: error.stack || "No stack trace",
    };
    
    console.error("[CHECKOUT CREATION ERROR]", JSON.stringify(checkoutErrorContext, null, 2));
    
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}


import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { REPORT_PRICES, SUBSCRIPTION_PRICE, isStripeConfigured } from "@/lib/ai-astrology/payments";
import { isAllowedUser, getRestrictionMessage } from "@/lib/access-restriction";
import { isProdTestUser } from "@/lib/prodAllowlist"; // CRITICAL FIX (ChatGPT Task 3): Import centralized allowlist
import { normalizeName, normalizeDOB, normalizeTime, normalizePlace, normalizeGender } from "@/lib/betaAccess"; // CRITICAL FIX (2026-01-18): Import normalization for fallback matching

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
    bundleReports?: string[];
    bundleType?: string;
    checkoutAttemptId?: string; // CRITICAL FIX (ChatGPT): Client-generated attempt ID for server-side tracing
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
      bundleReports?: string[]; // Array of report types for bundle purchases
      bundleType?: string; // Bundle type identifier
      checkoutAttemptId?: string; // CRITICAL FIX (ChatGPT): Client-generated attempt ID for server-side tracing
    }>(req);

    const { reportType, subscription = false, input, successUrl, cancelUrl, bundleReports, bundleType, checkoutAttemptId } = json;

    // CRITICAL FIX (ChatGPT): Log checkout attempt ID for server-side tracing
    // This allows correlating Vercel logs with user-reported "Purchase does nothing" issues
    if (checkoutAttemptId) {
      console.log(`[create-checkout] Checkout attempt started (ID: ${checkoutAttemptId})`, {
        requestId,
        checkoutAttemptId,
        reportType: reportType || "subscription",
        subscription,
      });
    }

    // Check for demo mode or test user (for logging only)
    // NOTE: Test users bypass payment by default to avoid payment verification errors
    // Set BYPASS_PAYMENT_FOR_TEST_USERS=false to force test users through Stripe for payment testing
    // CRITICAL FIX (2026-01-18 - ChatGPT Task 3): Use centralized allowlist function
    isDemoMode = process.env.AI_ASTROLOGY_DEMO_MODE === "true" || process.env.NODE_ENV === "development";
    
    // CRITICAL FIX (2026-01-18): Add logging to debug test user detection
    if (input) {
      console.log(`[TEST_USER_CHECK] Input received:`, {
        requestId,
        hasName: !!input.name,
        hasDOB: !!input.dob,
        hasTOB: !!input.tob,
        hasPlace: !!input.place,
        hasGender: !!input.gender,
        name: input.name?.substring(0, 20) || "N/A",
        dob: input.dob || "N/A",
        tob: input.tob || "N/A",
      });
    }
    
    isTestUser = isProdTestUser(input);
    
    // CRITICAL FIX (2026-01-18): Log test user detection result
    if (input) {
      console.log(`[TEST_USER_CHECK] Result:`, {
        requestId,
        isTestUser,
        userName: input.name?.substring(0, 20) || "N/A",
      });
    }
    
    const isStripeTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
    
    // P0.1: HARD-BLOCK MOCK SESSIONS IN PRODUCTION
    // MVP SAFETY: In production, NEVER create mock/prodtest sessions unless explicitly enabled
    // This ensures predictable behavior and prevents accidental payment bypass
    const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
    const isLocalOrPreview = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
    const allowProdTestBypass = process.env.ALLOW_PROD_TEST_BYPASS === "true";
    
    // P0.1: In production, force all bypass flags to false unless explicitly enabled
    // This is a structural guard to prevent any code path from creating mock sessions
    let bypassPaymentForTestUsers: boolean;
    if (isProd && !allowProdTestBypass) {
      // Force demo mode OFF in production
      isDemoMode = false;
      
      // Force bypass flags OFF in production
      // Test users can only bypass if ALLOW_PROD_TEST_BYPASS=true
      bypassPaymentForTestUsers = false;
      
      // Log the enforcement
      console.log("[PRODUCTION_GUARD] Enforcing production payment behavior - mock sessions disabled", {
        requestId,
        isProd,
        allowProdTestBypass,
        isTestUser,
        isDemoMode: false, // Forced
        bypassPaymentForTestUsers: false, // Forced
      });
    } else {
      // Non-production or explicitly enabled: allow bypass based on flags
      // Allow bypass only if:
      // 1. Explicitly enabled via env var, OR
      // 2. Local/preview environment (not production)
      bypassPaymentForTestUsers = process.env.BYPASS_PAYMENT_FOR_TEST_USERS === "true" || 
                                  (!isProd && isLocalOrPreview);
    }
    
    // P0.1: Hard-block prodtest sessions in production unless explicitly enabled
    // Check if we're about to create a prodtest_ session (isTestUser && !isDemoMode)
    const willCreateProdTestSession = isTestUser && !isDemoMode;
    
    // P0.1: In production, NEVER create prodtest_ sessions unless ALLOW_PROD_TEST_BYPASS=true
    // This is a structural guard - no exceptions, no test user bypass without flag
    if (willCreateProdTestSession && isProd && !allowProdTestBypass) {
      const prodtestBlockError = {
        requestId,
        timestamp: new Date().toISOString(),
        isTestUser,
        isDemoMode,
        willCreateProdTestSession,
        allowProdTestBypass,
        error: "PRODTEST_DISABLED_IN_PRODUCTION",
        message: "prodtest sessions are disabled in production. Enable ALLOW_PROD_TEST_BYPASS for controlled testing.",
      };
      console.error("[PRODTEST BLOCKED - PRODUCTION]", JSON.stringify(prodtestBlockError, null, 2));
      
      return NextResponse.json(
        {
          ok: false,
          error: "prodtest is disabled in production. Enable ALLOW_PROD_TEST_BYPASS for controlled testing.",
          code: "PRODTEST_DISABLED",
        },
        { status: 403, headers: { "X-Request-ID": requestId } }
      );
    }
    
    // P0.1: Log if creating prodtest session in production (only if explicitly enabled)
    if (willCreateProdTestSession && isProd && allowProdTestBypass) {
      console.warn("[PAYMENT BYPASS] Creating prodtest_ session in production with ALLOW_PROD_TEST_BYPASS flag", {
        requestId,
        isTestUser,
        isDemoMode,
        willCreateProdTestSession,
        allowProdTestBypass,
      });
    }

    // CRITICAL: Access restriction for production testing
    // Prevent unauthorized users from creating payment sessions
    // Only allow Amit Kumar Mandal and Ankita Surabhi until testing is complete
    const restrictAccess = process.env.NEXT_PUBLIC_RESTRICT_ACCESS === "true";
    
    // CRITICAL: Test users ALWAYS bypass access restriction
    // Check test user status here to ensure test users can create checkout sessions
    // CRITICAL FIX (2026-01-18 - ChatGPT Task 3): Use centralized allowlist function
    const isTestUserForAccess = isProdTestUser(input);
    
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
    // CRITICAL FIX (2026-01-18 - WORKAROUND): Fallback check if isProdTestUser fails
    // If BYPASS_PAYMENT_FOR_TEST_USERS=true, perform strict matching on full birth details
    // This ensures ONLY the 2 test users bypass payment (Amit Kumar Mandal, Ankita Surabhi)
    // Matching criteria: name, DOB, time, place, gender (all must match using same normalization as prodAllowlist)
    const forceBypassPaymentEnv = process.env.BYPASS_PAYMENT_FOR_TEST_USERS === "true";
    let fallbackTestUserCheck = false;
    if (forceBypassPaymentEnv && input && input.name && input.dob) {
      // Use same normalization functions as betaAccess/prodAllowlist for consistency
      // Test users (from betaAccess.ts):
      // - Amit Kumar Mandal / 1984-11-26 / 21:40 / noamundi, jharkhand / Male
      // - Ankita Surabhi / 1988-07-01 / 17:58 / ranchi, jharkhand / Female
      const timeValue = input.tob || input.time || '';
      const normalizedInput = {
        name: normalizeName(input.name || ''),
        dob: normalizeDOB(input.dob || ''),
        time: normalizeTime(timeValue),
        place: normalizePlace(input.place || ''),
        gender: normalizeGender(input.gender || ''),
      };
      
      // All required fields must be normalized successfully (same check as matchAllowlist)
      if (normalizedInput.dob && normalizedInput.time && normalizedInput.gender) {
        // Check against allowlist entries using exact matching (same logic as matchAllowlist)
        const isAmit = normalizedInput.name === 'amit kumar mandal' &&
                       normalizedInput.dob === '1984-11-26' &&
                       normalizedInput.time === '21:40' &&
                       normalizedInput.place === 'noamundi, jharkhand' &&
                       normalizedInput.gender === 'Male';
        
        const isAnkita = normalizedInput.name === 'ankita surabhi' &&
                         normalizedInput.dob === '1988-07-01' &&
                         normalizedInput.time === '17:58' &&
                         normalizedInput.place === 'ranchi, jharkhand' &&
                         normalizedInput.gender === 'Female';
        
        fallbackTestUserCheck = isAmit || isAnkita;
      }
    }
    
    // P0.1: Determine if payment should be bypassed
    // In production: ONLY bypass if ALLOW_PROD_TEST_BYPASS=true AND user is test user
    // In non-production: Allow bypass based on flags
    let shouldBypassForTestUser = false;
    if (isProd) {
      // Production: Only bypass if explicitly enabled AND user is test user
      shouldBypassForTestUser = allowProdTestBypass && (isTestUser || fallbackTestUserCheck);
    } else {
      // Non-production: Allow test users to bypass
      shouldBypassForTestUser = isTestUser || fallbackTestUserCheck;
    }
    
    // P0.1: Final bypass decision
    // In production: Only bypass if explicitly enabled
    // In non-production: Allow demo mode and test users
    const shouldBypassPayment = isDemoMode || shouldBypassForTestUser || (bypassPaymentForTestUsers && !isTestUser);
    
    // DEBUG: Log bypass decision
    console.log(`[PAYMENT_BYPASS_CHECK]`, JSON.stringify({
      requestId,
      isDemoMode,
      isTestUser,
      fallbackTestUserCheck,
      shouldBypassForTestUser,
      bypassPaymentForTestUsers,
      shouldBypassPayment,
      hasInput: !!input,
      userName: input?.name?.substring(0, 20) || "N/A",
    }, null, 2));
    
    if (shouldBypassPayment) {
      console.log(`[DEMO MODE] Returning mock checkout session (test user: ${isTestUser}, demo mode: ${isDemoMode}, bypassPaymentForTestUsers: ${bypassPaymentForTestUsers}, fallbackTestUserCheck: ${fallbackTestUserCheck}) - Bypassing Stripe`);
      
      // Use request URL to support preview deployments (derive from actual request)
      // CRITICAL FIX (ChatGPT): Make baseUrl resilient - same priority as production path
      let baseUrl: string;
      try {
        const requestUrl = new URL(req.url);
        baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
      } catch (e) {
        // Fallback 1: x-forwarded-proto + x-forwarded-host (Vercel/proxy)
        const forwardedProto = req.headers.get('x-forwarded-proto');
        const forwardedHost = req.headers.get('x-forwarded-host');
        if (forwardedProto && forwardedHost) {
          baseUrl = `${forwardedProto}://${forwardedHost}`;
        } else {
          // Fallback 2: origin header
          const originHeader = req.headers.get('origin');
          if (originHeader) {
            baseUrl = originHeader;
          } else {
            // Fallback 3: host header
            const hostHeader = req.headers.get('host');
            if (hostHeader) {
              const protocol = hostHeader.includes('localhost') ? 'http' : 'https';
              baseUrl = `${protocol}://${hostHeader}`;
            } else {
              // Fallback 4: environment variable (last resort)
              const envUrl = process.env.NEXT_PUBLIC_APP_URL;
              if (!envUrl) {
                // CRITICAL: Return clean JSON error instead of throwing
                console.error("[Create Checkout] Cannot derive baseUrl - all fallbacks failed");
                return NextResponse.json(
                  {
                    ok: false,
                    error: "Checkout configuration error. Please contact support if this persists.",
                    code: "CHECKOUT_CONFIG_ERROR"
                  },
                  { status: 500, headers: { "X-Request-ID": requestId } }
                );
              }
              baseUrl = envUrl;
            }
          }
        }
      }
      
      // Include reportType in session ID for test sessions so verify-payment can extract it
      // CRITICAL FIX: Use prodtest_ prefix for production test users, test_session_ for demo mode
      // This ensures test users get real reports while demo mode gets mock reports
      const reportTypeStr = subscription ? "subscription" : (reportType || "marriage-timing");
      const sessionPrefix = (isTestUser && !isDemoMode) ? "prodtest_" : "test_session_";
      const mockSessionId = `${sessionPrefix}${reportTypeStr}_${requestId}`;

      // If caller provided a Stripe-style template URL (with {CHECKOUT_SESSION_ID}), substitute it for mock mode.
      const substitutedSuccessUrl =
        successUrl && successUrl.includes("{CHECKOUT_SESSION_ID}")
          ? successUrl.replace("{CHECKOUT_SESSION_ID}", mockSessionId)
          : successUrl;
      
      // Return a mock session that can be used to bypass payment verification
      return NextResponse.json(
        {
          ok: true,
          data: {
            sessionId: mockSessionId,
            // For subscription, use dedicated success page so the journey mirrors production.
            // (Payment success page also supports subscription, but this is clearer and avoids cross-flow coupling.)
            url:
              substitutedSuccessUrl ||
              (subscription
                ? `${baseUrl}/ai-astrology/subscription/success?session_id=${mockSessionId}`
                : `${baseUrl}/ai-astrology/payment/success?session_id=${mockSessionId}`),
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
    // CRITICAL FIX (ChatGPT): Make baseUrl resilient with improved priority order
    // Priority: NEXT_PUBLIC_APP_URL → x-forwarded-proto + x-forwarded-host → host → request.nextUrl.origin → error
    let baseUrl: string | null = null;

    // Priority 1: NEXT_PUBLIC_APP_URL (most reliable if set)
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl) {
      baseUrl = envUrl;
    } else {
      // Priority 2: x-forwarded-proto + x-forwarded-host (Vercel/proxy)
      const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
      const forwardedHost = req.headers.get('x-forwarded-host');
      if (forwardedHost) {
        baseUrl = `${forwardedProto}://${forwardedHost}`;
      } else {
        // Priority 3: host header (with protocol detection)
        const hostHeader = req.headers.get('host');
        if (hostHeader) {
          const protocol = hostHeader.includes('localhost') || hostHeader.includes('127.0.0.1') ? 'http' : 'https';
          baseUrl = `${protocol}://${hostHeader}`;
        } else {
          // Priority 4: Try to parse request URL (fallback)
          try {
            const requestUrl = new URL(req.url);
            baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
          } catch (e) {
            // Priority 5: origin header (last resort)
            const originHeader = req.headers.get('origin');
            if (originHeader) {
              baseUrl = originHeader;
            }
          }
        }
      }
    }

    // CRITICAL: Return clean JSON error if baseUrl cannot be derived
    if (!baseUrl) {
      console.error("[Create Checkout] Cannot derive baseUrl - all fallbacks failed", {
        hasEnvUrl: !!envUrl,
        hasForwardedHost: !!req.headers.get('x-forwarded-host'),
        hasHost: !!req.headers.get('host'),
        hasOrigin: !!req.headers.get('origin'),
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Checkout configuration error. Please contact support if this persists.",
          code: "CHECKOUT_CONFIG_ERROR"
        },
        { status: 500, headers: { "X-Request-ID": requestId } }
      );
    }
    // IMPORTANT:
    // - Reports: payment success page owns verification + auto-generation.
    // - Subscriptions: dedicated success page verifies server-side and redirects back to subscription dashboard.
    const success = successUrl
      ? successUrl
      : subscription
      ? `${baseUrl}/ai-astrology/subscription/success?session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/ai-astrology/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel = cancelUrl
      ? cancelUrl
      : subscription
      ? `${baseUrl}/ai-astrology/subscription`
      : `${baseUrl}/ai-astrology/payment/cancel`;

    // Create checkout session
    let session;
    
    // Always use AUD currency (code-driven rule)
    const currency = "aud";
    const amount = priceData.amount; // Already in cents
    
    // Log checkout creation attempt (include attempt ID for correlation)
    const checkoutLog = {
      requestId,
      checkoutAttemptId: checkoutAttemptId || undefined, // Include client attempt ID
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
        // NOTE: `payment_intent_data` is NOT valid for mode=subscription and can break checkout creation.
        // For subscription, Stripe will handle PaymentIntent/SetupIntent internally.
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


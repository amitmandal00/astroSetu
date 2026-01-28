import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { PaymentAmountSchema } from "@/lib/validation";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/services/purchase');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 5 * 1024); // 5KB max
    
    if (!isSupabaseConfigured()) {
      // Mock mode - return success
      return NextResponse.json({
        ok: true,
        data: { success: true, message: "Service purchased (demo mode)" }
      });
    }

    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Validate amount
    const amountValidation = PaymentAmountSchema.parse({
      amount: json.amount,
      currency: json.currency || "INR",
      description: json.description,
    });
    
    const { serviceId, serviceName } = json;
    const amount = amountValidation.amount;

    if (!serviceId || typeof serviceId !== 'string' || serviceId.length > 100) {
      return NextResponse.json({ ok: false, error: "Invalid service ID" }, { status: 400 });
    }
    
    if (!serviceName || typeof serviceName !== 'string' || serviceName.length > 200) {
      return NextResponse.json({ ok: false, error: "Invalid service name" }, { status: 400 });
    }

    // Get current wallet balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", authUser.id)
      .single();

    const currentBalance = profile?.wallet_balance || 0;

    if (currentBalance < amount) {
      return NextResponse.json({ 
        ok: false, 
        error: `Insufficient balance. You need ₹${amount}, but have ₹${currentBalance}` 
      }, { status: 400 });
    }

    // Deduct from wallet
    const newBalance = currentBalance - amount;
    await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", authUser.id);

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: authUser.id,
      type: "debit",
      amount: amount,
      description: `Purchase: ${serviceName}`,
      metadata: {
        service_id: serviceId,
        service_name: serviceName,
        status: "completed"
      },
    });

    // Save purchased service (optional - for tracking)
    try {
      const { error } = await supabase.from("purchased_services").insert({
        user_id: authUser.id,
        service_id: serviceId,
        service_name: serviceName,
        amount: amount,
        purchased_at: new Date().toISOString()
      });
      if (error) {
        // Ignore if table doesn't exist or other database errors
        console.warn("Failed to save purchased service:", error.message);
      }
    } catch (e) {
      // Ignore database errors
    }

    return NextResponse.json({
      ok: true,
      data: {
        success: true,
        newBalance,
        message: `Successfully purchased ${serviceName}`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}


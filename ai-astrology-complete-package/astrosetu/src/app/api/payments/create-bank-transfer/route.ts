import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import crypto from "crypto";
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
    const rateLimitResponse = checkRateLimit(req, '/api/payments/create-bank-transfer');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 2 * 1024); // 2KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = PaymentAmountSchema.parse({
      amount: json.amount,
      currency: json.currency || "INR",
      description: json.description,
    });
    
    const { amount } = validated;

    // Check authentication
    let userId = null;
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (!authUser) {
        return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
      }
      userId = authUser.id;
    }

    // Generate unique reference number
    const referenceNumber = `BT${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Store pending transfer in database
    if (isSupabaseConfigured() && userId) {
      try {
        const supabase = createServerClient();
        const { error } = await supabase.from("bank_transfers").insert({
          user_id: userId,
          reference_number: referenceNumber,
          amount: amount,
          status: "pending",
          created_at: new Date().toISOString()
        });
        if (error) {
          // Ignore if table doesn't exist or other database errors
          console.warn("Failed to store bank transfer:", error.message);
        }
      } catch (e) {
        // Ignore database errors
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        referenceNumber,
        amount: amount,
        currency: "INR",
        status: "pending"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}


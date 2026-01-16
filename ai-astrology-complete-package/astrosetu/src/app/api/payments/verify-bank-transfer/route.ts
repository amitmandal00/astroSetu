import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const BankTransferVerifySchema = z.object({
  referenceNumber: z.string().min(1).max(100),
  amount: z.number().positive().max(1000000),
});

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/payments/verify-bank-transfer');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 2 * 1024); // 2KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = BankTransferVerifySchema.parse({
      referenceNumber: json.referenceNumber,
      amount: json.amount,
    });
    
    const { referenceNumber, amount } = validated;

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

    // In production, this would verify with bank or payment gateway
    // For now, check if transfer exists and is pending
    if (isSupabaseConfigured() && userId) {
      try {
        const supabase = createServerClient();
        const { data: transfer } = await supabase
          .from("bank_transfers")
          .select("*")
          .eq("reference_number", referenceNumber)
          .eq("user_id", userId)
          .eq("status", "pending")
          .single();

        if (transfer && transfer.amount === amount) {
          // In production, verify with bank API
          // For demo, mark as verified after manual verification
          // For now, return pending status
          return NextResponse.json({
            ok: true,
            data: {
              verified: false,
              success: false,
              message: "Bank transfer verification is pending. Our team will verify within 1-2 business days."
            }
          });
        }
      } catch (e) {
        // Ignore database errors
      }
    }

    // Mock mode - return pending
    return NextResponse.json({
      ok: true,
      data: {
        verified: false,
        success: false,
        message: "Bank transfer verification is pending. Our team will verify within 1-2 business days."
      },
      mock: true
    });
  } catch (error) {
    return handleApiError(error);
  }
}


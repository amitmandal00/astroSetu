import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
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
    const rateLimitResponse = checkRateLimit(req, '/api/payments/create-upi-order');
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
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const authUser = await getAuthenticatedUser(supabase);
      if (!authUser) {
        return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
      }
    }

    // Create Razorpay order for UPI
    if (isRazorpayConfigured()) {
      try {
        const order = await createRazorpayOrder(amount, "INR", `upi_${Date.now()}`);
        return NextResponse.json({
          ok: true,
          data: {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            // In production, generate QR code from Razorpay
            qrCode: null
          }
        });
      } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message ?? "Failed to create order" }, { status: 400 });
      }
    }

    // Mock mode - return mock order
    return NextResponse.json({
      ok: true,
      data: {
        orderId: `order_upi_mock_${Date.now()}`,
        amount: amount,
        currency: "INR",
        qrCode: null
      },
      mock: true
    });
  } catch (error) {
    return handleApiError(error);
  }
}


import { NextResponse } from "next/server";
import { getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/payments/config');
    if (rateLimitResponse) return rateLimitResponse;
    
    if (!isRazorpayConfigured()) {
      return NextResponse.json({
        ok: true,
        data: {
          keyId: "",
          configured: false,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        keyId: getRazorpayKeyId(),
        configured: true,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}


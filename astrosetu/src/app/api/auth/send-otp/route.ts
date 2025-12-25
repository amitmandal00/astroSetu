import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { OTPRequestSchema, sanitizePhone } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    // Rate limiting (stricter for OTP)
    const rateLimitResponse = checkRateLimit(req, '/api/auth/send-otp');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 2 * 1024); // 2KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    
    // Validate input using schema
    const validated = OTPRequestSchema.parse({
      phone: json.phone,
    });
    
    // Sanitize phone number
    const phone = sanitizePhone(validated.phone);

    // Demo mode: Generate a mock OTP
    if (!isSupabaseConfigured()) {
      // In production, integrate with SMS service like Twilio, AWS SNS, or Indian providers
      const mockOtp = "123456"; // For demo only
      console.log(`[DEMO] OTP for ${phone}: ${mockOtp}`);
      
      return NextResponse.json({
        ok: true,
        data: {
          message: "OTP sent successfully",
          otp: mockOtp, // Remove in production
          expiresIn: 300 // 5 minutes
        },
      });
    }

    // Production: Send OTP via SMS service
    // Example integration with Twilio or AWS SNS
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // await sendSMS(phone, `Your AstroSetu OTP is ${otp}. Valid for 5 minutes.`);
    
    // Store OTP in database/cache with expiration
    // await storeOTP(phone, otp, 300); // 5 minutes

    return NextResponse.json({
      ok: true,
      data: {
        message: "OTP sent successfully",
        expiresIn: 300
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}


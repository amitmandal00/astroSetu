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
    
    // More lenient validation - like AstroSage/AstroTalk
    const phoneInput = json.phone?.trim() || "";
    
    if (!phoneInput || phoneInput.length < 10) {
      return NextResponse.json({ ok: false, error: "Please enter a valid phone number (at least 10 digits)" }, { status: 400 });
    }
    
    // Sanitize phone number (remove all non-digits except +)
    let phone = phoneInput.replace(/[^\d+]/g, "");
    
    // Handle Indian numbers: if starts with 0, remove it; if 10 digits, add +91
    if (phone.startsWith("0")) {
      phone = phone.substring(1);
    }
    if (phone.length === 10 && !phone.startsWith("+")) {
      phone = "+91" + phone;
    } else if (!phone.startsWith("+") && phone.length > 10) {
      phone = "+" + phone;
    }
    
    // Final validation: should be 10-15 digits after +
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json({ ok: false, error: "Please enter a valid phone number (10-15 digits)" }, { status: 400 });
    }

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


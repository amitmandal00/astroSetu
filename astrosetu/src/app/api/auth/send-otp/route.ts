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
    const phoneInput = String(json.phone || "").trim();
    
    if (!phoneInput) {
      return NextResponse.json({ ok: false, error: "Phone number is required" }, { status: 400 });
    }
    
    // Aggressively sanitize phone number - remove ALL non-digit characters first
    // This handles cases like "I1234567890" or other invalid characters
    let digitsOnly = phoneInput.replace(/\D/g, "");
    
    // Remove leading zeros
    while (digitsOnly.startsWith("0") && digitsOnly.length > 10) {
      digitsOnly = digitsOnly.substring(1);
    }
    
    // Validate digit count
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return NextResponse.json({ 
        ok: false, 
        error: `Please enter a valid phone number (10-15 digits). You entered ${digitsOnly.length} digits.` 
      }, { status: 400 });
    }
    
    // Format as international number
    let phone: string;
    if (digitsOnly.length === 10) {
      // 10 digits = Indian number, add +91
      phone = "+91" + digitsOnly;
    } else if (digitsOnly.length > 10) {
      // More than 10 digits = already has country code
      phone = "+" + digitsOnly;
    } else {
      // Shouldn't reach here due to validation above, but handle it
      phone = "+91" + digitsOnly;
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


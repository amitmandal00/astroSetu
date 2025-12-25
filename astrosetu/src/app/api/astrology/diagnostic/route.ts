import { NextResponse } from "next/server";
import { isAPIConfigured } from "@/lib/astrologyAPI";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

/**
 * GET /api/astrology/diagnostic
 * Diagnostic endpoint to check API configuration and test Prokerala connection
 */
export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/astrology/diagnostic');
    if (rateLimitResponse) return rateLimitResponse;
    
    const configured = isAPIConfigured();
    
    // Test Prokerala connection if configured
    let prokeralaTest: any = { status: 'not_configured' };
    
    if (configured) {
      try {
        // Test with a simple request (get current date panchang)
        const testResponse = await fetch('https://api.prokerala.com/v2/astrology/panchang', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PROKERALA_API_KEY || 'test'}`,
          },
          body: JSON.stringify({
            datetime: new Date().toISOString().slice(0, 10),
            coordinates: '28.6139,77.2090', // Delhi coordinates
            timezone: 'Asia/Kolkata',
          }),
        });
        
        if (testResponse.ok) {
          prokeralaTest = { status: 'connected', ok: true };
        } else {
          const errorText = await testResponse.text();
          prokeralaTest = { 
            status: 'error', 
            error: errorText,
            statusCode: testResponse.status,
          };
        }
      } catch (error: any) {
        prokeralaTest = { 
          status: 'connection_failed', 
          error: error.message || 'Unknown error',
        };
      }
    }
    
    return NextResponse.json({
      ok: true,
      data: {
        prokeralaConfigured: configured,
        prokeralaTest,
        environment: process.env.NODE_ENV,
        hasClientId: !!process.env.PROKERALA_CLIENT_ID,
        hasClientSecret: !!process.env.PROKERALA_CLIENT_SECRET,
        hasApiKey: !!process.env.PROKERALA_API_KEY,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}


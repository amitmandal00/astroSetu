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
        // Test authentication by getting an access token
        // This is the most reliable way to verify credentials work
        const clientId = process.env.PROKERALA_CLIENT_ID;
        const clientSecret = process.env.PROKERALA_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
          prokeralaTest = {
            status: 'error',
            error: 'Client ID or Secret missing from environment',
          };
        } else {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const tokenResponse = await fetch("https://api.prokerala.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.access_token) {
              prokeralaTest = {
                status: 'connected',
                ok: true,
                message: 'Successfully authenticated with Prokerala API',
                tokenType: tokenData.token_type,
                expiresIn: tokenData.expires_in,
              };
            } else {
              prokeralaTest = {
                status: 'error',
                error: 'Token response missing access_token',
                response: tokenData,
              };
            }
          } else {
            const errorText = await tokenResponse.text();
            let errorMessage = errorText;
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error_description || errorJson.error || errorText;
            } catch {
              // Keep original error message
            }
            prokeralaTest = {
              status: 'error',
              error: errorMessage,
              statusCode: tokenResponse.status,
            };
          }
        }
      } catch (error: any) {
        prokeralaTest = {
          status: 'error',
          error: error?.message || 'Unknown error',
          details: error?.toString() || 'Connection test failed',
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


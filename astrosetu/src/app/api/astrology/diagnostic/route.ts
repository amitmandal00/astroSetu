import { NextResponse } from "next/server";
import { isAPIConfigured, getPanchangAPI } from "@/lib/astrologyAPI";
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
          
          // ProKerala token endpoint uses form-encoded body (not Basic Auth)
          // Diagnostic: Check for common credential issues
          const clientIdTrimmed = clientId?.trim() || '';
          const clientSecretTrimmed = clientSecret?.trim() || '';
          const hasSpaces = clientId?.includes(' ') || clientSecret?.includes(' ');
          const hasQuotes = (clientId?.startsWith('"') && clientId?.endsWith('"')) || 
                           (clientSecret?.startsWith('"') && clientSecret?.endsWith('"'));
          
          console.log(`[Diagnostic] Testing authentication - Client ID length: ${clientIdTrimmed.length}, Secret length: ${clientSecretTrimmed.length}, hasSpaces: ${hasSpaces}, hasQuotes: ${hasQuotes}`);
          
          const tokenResponse = await fetch("https://api.prokerala.com/token", {
            method: "POST",
            headers: { 
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientIdTrimmed)}&client_secret=${encodeURIComponent(clientSecretTrimmed)}`,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData.access_token) {
              // Test end-to-end by calling panchang API with GET method
              try {
                const today = new Date().toISOString().slice(0, 10);
                const [year, month, day] = today.split("-").map(Number);
                
                // Store debug info BEFORE calling
                const debugInfo: any = {
                  method: 'GET',
                  endpoint: '/panchang',
                  params: {
                    datetime: { year, month, day },
                    coordinates: '28.6139,77.2090',
                    timezone: 'Asia/Kolkata'
                  },
                  timestamp: new Date().toISOString(),
                };
                
                console.log("[Diagnostic] About to call getPanchangAPI with:", debugInfo);
                await getPanchangAPI(today, "Delhi", 28.6139, 77.2090);
                console.log("[Diagnostic] getPanchangAPI succeeded");
                
                prokeralaTest = {
                  status: 'connected',
                  ok: true,
                  message: 'Successfully authenticated and tested Prokerala API',
                  tokenType: tokenData.token_type,
                  expiresIn: tokenData.expires_in,
                  panchangTest: 'passed',
                  debug: { ...debugInfo, result: 'success' },
                };
              } catch (panchangError: any) {
                // Token works but panchang test failed
                const errorMessage = panchangError?.message || 'Panchang API test failed';
                const isPostError = errorMessage.includes('POST') && errorMessage.includes('Method Not Allowed');
                
                // Extract debug info from error message
                let debugInfo = null;
                if (errorMessage.includes('[PANCHANG_DEBUG:')) {
                  const debugMatch = errorMessage.match(/\[PANCHANG_DEBUG:([^\]]+)\]/);
                  if (debugMatch) {
                    try {
                      // Parse debug string like "originalMethod=POST, enforcedMethod=GET, ..."
                      const debugParts = debugMatch[1].split(', ').reduce((acc: any, part: string) => {
                        const [key, value] = part.split('=');
                        if (key && value) acc[key.trim()] = value.trim();
                        return acc;
                      }, {});
                      debugInfo = debugParts;
                    } catch (e) {
                      debugInfo = { raw: debugMatch[1] };
                    }
                  }
                }
                
                console.error("[Diagnostic] Panchang test failed:", errorMessage);
                console.error("[Diagnostic] Full error object:", JSON.stringify(panchangError, null, 2));
                
                prokeralaTest = {
                  status: 'connected',
                  ok: true,
                  message: 'Authentication successful, but panchang test failed',
                  tokenType: tokenData.token_type,
                  expiresIn: tokenData.expires_in,
                  panchangTest: 'failed',
                  panchangError: errorMessage,
                  debug: {
                    method: 'GET',
                    endpoint: '/panchang',
                    error: errorMessage,
                    isPostError: isPostError,
                    debugInfo: debugInfo,
                    fullError: panchangError?.toString(),
                    errorStack: panchangError?.stack,
                    note: isPostError ? 'ERROR: Code is still using POST method! Check debugInfo for actual method used.' : 'Different error occurred',
                    timestamp: new Date().toISOString(),
                  },
                };
              }
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
            let errorDetails: any = {};
            
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error_description || errorJson.error || errorText;
              errorDetails = errorJson;
            } catch {
              // Keep original error message
            }
            
            // Add diagnostic info for authentication errors
            const authDiagnostic: any = {
              statusCode: tokenResponse.status,
              clientIdLength: clientIdTrimmed.length,
              clientSecretLength: clientSecretTrimmed.length,
              clientIdHasSpaces: clientId?.includes(' ') || false,
              clientSecretHasSpaces: clientSecret?.includes(' ') || false,
              clientIdHasQuotes: (clientId?.startsWith('"') && clientId?.endsWith('"')) || false,
              clientSecretHasQuotes: (clientSecret?.startsWith('"') && clientSecret?.endsWith('"')) || false,
              errorDetails: errorDetails,
            };
            
            // Add helpful suggestions
            const suggestions: string[] = [];
            if (authDiagnostic.clientIdHasSpaces || authDiagnostic.clientSecretHasSpaces) {
              suggestions.push('Remove extra spaces from credentials in Vercel environment variables');
            }
            if (authDiagnostic.clientIdHasQuotes || authDiagnostic.clientSecretHasQuotes) {
              suggestions.push('Remove quotes from credentials in Vercel environment variables');
            }
            if (tokenResponse.status === 401) {
              suggestions.push('Verify credentials match ProKerala dashboard exactly');
              suggestions.push('Check if client is active in ProKerala dashboard');
              suggestions.push('Ensure credentials are set in Production environment in Vercel');
            }
            
            prokeralaTest = {
              status: 'error',
              error: errorMessage,
              statusCode: tokenResponse.status,
              authDiagnostic: authDiagnostic,
              suggestions: suggestions.length > 0 ? suggestions : ['Check ProKerala dashboard and Vercel environment variables'],
            };
          }
        }
      } catch (error: any) {
        // This catch handles any errors in the token/panchang test flow
        const errorMessage = error?.message || 'Unknown error';
        // Check if this is a panchang-related error (check for panchang in URL or POST method error)
        const isPanchangError = errorMessage.toLowerCase().includes('panchang') || 
                                (errorMessage.includes('POST') && errorMessage.includes('Method Not Allowed') && errorMessage.includes('/panchang'));
        const isPostError = errorMessage.includes('POST') && errorMessage.includes('Method Not Allowed');
        
        // Extract debug info if it's a panchang error
        let debugInfo = null;
        if (errorMessage.includes('[PANCHANG_DEBUG:')) {
          const debugMatch = errorMessage.match(/\[PANCHANG_DEBUG:([^\]]+)\]/);
          if (debugMatch) {
            try {
              const debugParts = debugMatch[1].split(', ').reduce((acc: any, part: string) => {
                const [key, value] = part.split('=');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
              }, {});
              debugInfo = debugParts;
            } catch (e) {
              debugInfo = { raw: debugMatch[1] };
            }
          }
        }
        
        console.error("[Diagnostic] Outer catch - error:", errorMessage);
        console.error("[Diagnostic] Is panchang error:", isPanchangError);
        console.error("[Diagnostic] Is POST error:", isPostError);
        console.error("[Diagnostic] Full error:", JSON.stringify(error, null, 2));
        
        // ALWAYS include debug object for better troubleshooting
        prokeralaTest = {
          status: 'error',
          error: errorMessage,
          details: error?.toString() || 'Connection test failed',
          debug: {
            method: isPanchangError ? 'GET' : 'unknown',
            endpoint: isPanchangError ? '/panchang' : 'unknown',
            error: errorMessage,
            isPanchangError: isPanchangError,
            isPostError: isPostError,
            debugInfo: debugInfo,
            fullError: error?.toString(),
            errorStack: error?.stack,
            note: isPanchangError 
              ? 'Panchang error caught in outer catch block - check if error bubbled up from inner catch'
              : isPostError
              ? 'POST method error detected - may be panchang endpoint issue'
              : 'Non-panchang error occurred',
            timestamp: new Date().toISOString(),
            errorMessageIncludesPanchang: errorMessage.toLowerCase().includes('panchang'),
            errorMessageIncludesPost: errorMessage.includes('POST'),
            errorMessageIncludesMethodNotAllowed: errorMessage.includes('Method Not Allowed'),
          },
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


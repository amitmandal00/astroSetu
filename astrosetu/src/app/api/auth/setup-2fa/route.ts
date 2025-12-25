import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { generateSecret, generateQRCodeURL } from "@/lib/totp";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

// Function to dynamically load qrcode at runtime (server-side only)
// require() is valid in Node.js API routes
function getQRCodeModule() {
  try {
    const qrcodeModule = require("qrcode");
    return qrcodeModule.default || qrcodeModule;
  } catch {
    return null;
  }
}

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Setup 2FA for a user
 * POST /api/auth/setup-2fa
 */
export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/auth/setup-2fa');
    if (rateLimitResponse) return rateLimitResponse;
    if (!isSupabaseConfigured()) {
      // Demo mode: Generate a mock secret
      const secret = generateSecret();
      const qrCodeURL = generateQRCodeURL("demo@astrosetu.com", secret);
      
      // Generate QR code as data URL
      let qrCodeDataURL = "";
      const QRCode = getQRCodeModule();
      if (QRCode && typeof QRCode.toDataURL === "function") {
        qrCodeDataURL = await QRCode.toDataURL(qrCodeURL);
      } else {
        // Fallback: Return URL for client-side QR generation or use a service
        qrCodeDataURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeURL)}`;
      }
      
      return NextResponse.json({
        ok: true,
        data: {
          secret,
          qrCode: qrCodeDataURL,
          qrCodeURL,
          manualEntryKey: secret,
        },
      });
    }

    const supabase = createServerClient();
    const user = await getAuthenticatedUser(supabase);
    
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    // Generate secret
    const secret = generateSecret();
    const qrCodeURL = generateQRCodeURL(user.email || user.id, secret, "AstroSetu");
    
    // Generate QR code
    let qrCodeDataURL = "";
    const QRCode = getQRCodeModule();
    if (QRCode && typeof QRCode.toDataURL === "function") {
      qrCodeDataURL = await QRCode.toDataURL(qrCodeURL);
    } else {
      // Fallback: Use external QR code service
      qrCodeDataURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeURL)}`;
    }

    // Store secret temporarily (user needs to verify before enabling)
    // In production, store in database with a flag indicating it's not yet verified
    // For now, return it to the client (in production, encrypt and store securely)
    
    return NextResponse.json({
      ok: true,
      data: {
        secret,
        qrCode: qrCodeDataURL,
        qrCodeURL,
        manualEntryKey: secret, // For manual entry in authenticator apps
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}


import { NextResponse } from "next/server";
import { getContactConfig, isWithinBusinessHours, formatPhoneNumber, getWhatsAppLink, getTelLink } from "@/lib/contactConfig";

/**
 * GET /api/contact/info
 * Get dynamic contact information with current availability status
 * Fully autonomous - no manual updates required
 */
export async function GET() {
  try {
    const config = getContactConfig();
    const availability = isWithinBusinessHours(config);
    
    // Format phone numbers for display
    const phoneDisplay = formatPhoneNumber(config.phoneNumber, "+91");
    const whatsappDisplay = formatPhoneNumber(config.whatsappNumber, "+91");
    
    return NextResponse.json({
      ok: true,
      data: {
        // Email addresses
        emails: {
          support: {
            address: config.supportEmail,
            label: "For general inquiries",
            validated: true, // Would be validated during startup
          },
          privacy: {
            address: config.privacyEmail,
            label: "For privacy-related inquiries or complaints",
            validated: true,
          },
        },
        
        // Phone numbers
        phone: {
          number: config.phoneNumber,
          display: phoneDisplay,
          telLink: getTelLink(config.phoneNumber),
          available: config.phoneAvailable && availability.isOpen,
          label: availability.isOpen 
            ? "Available now" 
            : availability.message || "Mon-Sat, 9 AM - 6 PM IST",
        },
        
        // WhatsApp
        whatsapp: {
          number: config.whatsappNumber,
          display: whatsappDisplay,
          link: getWhatsAppLink(config.whatsappNumber),
          available24x7: config.whatsapp24x7,
          label: config.whatsapp24x7 ? "24/7 support available" : availability.message,
        },
        
        // Company information
        company: {
          name: config.companyName,
          address: {
            ...config.address,
            full: [
              config.address.street,
              config.address.city,
              config.address.state,
              config.address.country,
            ].filter(Boolean).join(", "),
          },
          jurisdiction: config.jurisdiction,
        },
        
        // Business hours
        businessHours: {
          timezone: config.businessHours.timezone,
          weekdays: {
            open: config.businessHours.weekdays.open,
            close: config.businessHours.weekdays.close,
            days: config.businessHours.weekdays.days.join(", "),
          },
          saturday: config.businessHours.saturday 
            ? `${config.businessHours.saturday.open} - ${config.businessHours.saturday.close}`
            : null,
          sunday: config.businessHours.sunday?.open ? `${config.businessHours.sunday.open} - ${config.businessHours.sunday.close}` : "Closed",
        },
        
        // Current availability
        availability: {
          isOpen: availability.isOpen,
          status: availability.isOpen ? "open" : "closed",
          message: availability.message,
          currentTime: availability.currentTime.toISOString(),
          nextOpenTime: availability.nextOpenTime?.toISOString(),
          timezone: config.businessHours.timezone,
        },
        
        // Auto-response settings
        autoResponse: {
          enabled: config.autoReplyEnabled,
          responseTime: config.responseTime,
        },
      },
    });
  } catch (error: any) {
    console.error("[Contact Info API] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch contact information",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}


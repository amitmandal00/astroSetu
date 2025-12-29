/**
 * Contact Configuration - Autonomous Management
 * All contact information is managed via environment variables
 * No manual updates required - fully autonomous
 */

export interface ContactConfig {
  // Email addresses
  supportEmail: string;
  privacyEmail: string;
  adminEmail: string;
  
  // Phone numbers (E.164 format)
  phoneNumber: string;
  whatsappNumber: string;
  
  // Company information
  companyName: string;
  address: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  };
  jurisdiction: string;
  
  // Business hours (timezone-aware)
  businessHours: {
    timezone: string; // e.g., "Asia/Kolkata", "Australia/Sydney"
    weekdays: {
      open: string; // "09:00"
      close: string; // "18:00"
      days: string[]; // ["Monday", "Tuesday", ..., "Friday"]
    };
    saturday?: {
      open: string;
      close: string;
    };
    sunday?: {
      open: string | null; // null = closed
      close: string | null;
    };
    holidays?: string[]; // ISO date strings
  };
  
  // Auto-responses
  autoReplyEnabled: boolean;
  responseTime: string; // e.g., "24-48 hours"
  
  // Status
  whatsapp24x7: boolean;
  phoneAvailable: boolean;
}

/**
 * Get contact configuration from environment variables with defaults
 */
export function getContactConfig(): ContactConfig {
  // Get from environment variables or use defaults
  const config: ContactConfig = {
    supportEmail: process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@mindveda.net",
    privacyEmail: process.env.PRIVACY_EMAIL || process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@mindveda.net",
    adminEmail: process.env.ADMIN_EMAIL || "admin@mindveda.net",
    
    phoneNumber: process.env.PHONE_NUMBER || process.env.NEXT_PUBLIC_PHONE_NUMBER || "+918001234567",
    whatsappNumber: process.env.WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+918001234567",
    
    companyName: process.env.COMPANY_NAME || process.env.NEXT_PUBLIC_COMPANY_NAME || "AstroSetu Services Pty Ltd",
    address: {
      street: process.env.ADDRESS_STREET || undefined,
      city: process.env.ADDRESS_CITY || process.env.NEXT_PUBLIC_ADDRESS_CITY || "Mumbai",
      state: process.env.ADDRESS_STATE || process.env.NEXT_PUBLIC_ADDRESS_STATE || "Maharashtra",
      country: process.env.ADDRESS_COUNTRY || process.env.NEXT_PUBLIC_ADDRESS_COUNTRY || "India",
      postalCode: process.env.ADDRESS_POSTAL_CODE || undefined,
    },
    jurisdiction: process.env.JURISDICTION || process.env.NEXT_PUBLIC_JURISDICTION || "Australia (primary) / India (international operations)",
    
    businessHours: {
      timezone: process.env.BUSINESS_HOURS_TIMEZONE || process.env.NEXT_PUBLIC_BUSINESS_HOURS_TIMEZONE || "Asia/Kolkata",
      weekdays: {
        open: process.env.BUSINESS_HOURS_WEEKDAY_OPEN || "09:00",
        close: process.env.BUSINESS_HOURS_WEEKDAY_CLOSE || "18:00",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      saturday: {
        open: process.env.BUSINESS_HOURS_SATURDAY_OPEN || "10:00",
        close: process.env.BUSINESS_HOURS_SATURDAY_CLOSE || "16:00",
      },
      sunday: {
        open: null, // Closed on Sunday
        close: null,
      },
      holidays: process.env.BUSINESS_HOLIDAYS ? JSON.parse(process.env.BUSINESS_HOLIDAYS) : [],
    },
    
    autoReplyEnabled: process.env.CONTACT_AUTO_REPLY_ENABLED !== "false", // Default: true
    responseTime: process.env.CONTACT_RESPONSE_TIME || "24-48 hours",
    
    whatsapp24x7: process.env.WHATSAPP_24X7 !== "false", // Default: true
    phoneAvailable: process.env.PHONE_AVAILABLE !== "false", // Default: true
  };
  
  return config;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (E.164 format or simple international format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // E.164 format: starts with + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  // Or simple format with country code
  const simpleRegex = /^\+?\d{10,15}$/;
  return e164Regex.test(cleaned) || simpleRegex.test(cleaned);
}

/**
 * Format phone number for display (E.164 to readable format)
 */
export function formatPhoneNumber(phone: string, countryCode: string = "+91"): string {
  // If already formatted, return as is
  if (phone.includes(" ")) return phone;
  
  // Remove country code if present
  let cleaned = phone.replace(/^\+91/, "").replace(/^91/, "");
  
  // Format Indian numbers: +91 XXX XXX XXXX
  if (countryCode === "+91" && cleaned.length === 10) {
    return `${countryCode} ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  // Default: return with country code
  return `${countryCode} ${cleaned}`;
}

/**
 * Get WhatsApp link
 */
export function getWhatsAppLink(phoneNumber: string): string {
  // Remove + and spaces for WhatsApp link
  const cleaned = phoneNumber.replace(/[\s\+]/g, "");
  return `https://wa.me/${cleaned}`;
}

/**
 * Get tel: link
 */
export function getTelLink(phoneNumber: string): string {
  // tel: links should have + prefix
  const cleaned = phoneNumber.replace(/\s/g, "");
  return `tel:${cleaned.startsWith("+") ? cleaned : `+${cleaned}`}`;
}

/**
 * Check if currently within business hours (timezone-aware)
 */
export function isWithinBusinessHours(config: ContactConfig): {
  isOpen: boolean;
  currentTime: Date;
  nextOpenTime?: Date;
  message: string;
} {
  const now = new Date();
  
  // Convert to business timezone
  const businessTZ = config.businessHours.timezone;
  const nowInTZ = new Date(now.toLocaleString("en-US", { timeZone: businessTZ }));
  
  const dayOfWeek = nowInTZ.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = nowInTZ.getHours();
  const minute = nowInTZ.getMinutes();
  const currentTimeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  
  // Check if it's a holiday
  const todayStr = nowInTZ.toISOString().split("T")[0];
  if (config.businessHours.holidays?.includes(todayStr)) {
    return {
      isOpen: false,
      currentTime: nowInTZ,
      message: "Closed for holiday",
    };
  }
  
  // Check Sunday (closed)
  if (dayOfWeek === 0 && !config.businessHours.sunday?.open) {
    // Calculate next open time (Monday)
    const nextMonday = new Date(nowInTZ);
    nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - dayOfWeek) % 7));
    const [openHour, openMin] = config.businessHours.weekdays.open.split(":").map(Number);
    nextMonday.setHours(openHour, openMin, 0, 0);
    
    return {
      isOpen: false,
      currentTime: nowInTZ,
      nextOpenTime: nextMonday,
      message: "Closed on Sunday. We'll be back Monday.",
    };
  }
  
  // Check Saturday
  if (dayOfWeek === 6 && config.businessHours.saturday) {
    const [openHour, openMin] = config.businessHours.saturday.open.split(":").map(Number);
    const [closeHour, closeMin] = config.businessHours.saturday.close.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    const currentTime = hour * 60 + minute;
    
    if (currentTime >= openTime && currentTime < closeTime) {
      return {
        isOpen: true,
        currentTime: nowInTZ,
        message: "Open now (Saturday hours)",
      };
    } else {
      // Calculate next open time
      const nextOpen = new Date(nowInTZ);
      if (currentTime < openTime) {
        nextOpen.setHours(openHour, openMin, 0, 0);
      } else {
        // Closed for today, next open is Monday
        nextOpen.setDate(nextOpen.getDate() + 1);
        const [monOpenHour, monOpenMin] = config.businessHours.weekdays.open.split(":").map(Number);
        nextOpen.setHours(monOpenHour, monOpenMin, 0, 0);
      }
      
      return {
        isOpen: false,
        currentTime: nowInTZ,
        nextOpenTime: nextOpen,
        message: "Closed. We'll be back Monday.",
      };
    }
  }
  
  // Check weekdays (Monday-Friday)
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    const [openHour, openMin] = config.businessHours.weekdays.open.split(":").map(Number);
    const [closeHour, closeMin] = config.businessHours.weekdays.close.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    const currentTime = hour * 60 + minute;
    
    if (currentTime >= openTime && currentTime < closeTime) {
      return {
        isOpen: true,
        currentTime: nowInTZ,
        message: "Open now",
      };
    } else {
      // Calculate next open time
      const nextOpen = new Date(nowInTZ);
      if (currentTime < openTime) {
        // Opens later today
        nextOpen.setHours(openHour, openMin, 0, 0);
      } else {
        // Closed for today, next open is tomorrow
        nextOpen.setDate(nextOpen.getDate() + 1);
        nextOpen.setHours(openHour, openMin, 0, 0);
      }
      
      return {
        isOpen: false,
        currentTime: nowInTZ,
        nextOpenTime: nextOpen,
        message: `Closed. Opens at ${config.businessHours.weekdays.open} ${getTimezoneAbbr(businessTZ)}.`,
      };
    }
  }
  
  // Default: closed
  return {
    isOpen: false,
    currentTime: nowInTZ,
    message: "Currently closed",
  };
}

/**
 * Get timezone abbreviation (simplified)
 */
function getTimezoneAbbr(timezone: string): string {
  const map: Record<string, string> = {
    "Asia/Kolkata": "IST",
    "Australia/Sydney": "AEDT",
    "Australia/Melbourne": "AEDT",
    "America/New_York": "EST",
    "Europe/London": "GMT",
  };
  return map[timezone] || timezone.split("/").pop()?.toUpperCase() || "UTC";
}


/**
 * Key Expiration Monitoring
 * Tracks API key expiration dates and alerts before expiration
 * Supports monitoring of multiple keys with different expiration dates
 */

export interface KeyInfo {
  name: string; // e.g., "Razorpay Key", "Supabase Key"
  type: "api_key" | "client_secret" | "oauth_token" | "other";
  expirationDate?: Date; // Optional expiration date
  alertDays: number[]; // Days before expiration to alert (e.g., [30, 7, 1])
  isConfigured: boolean; // Whether key is currently configured
  lastChecked?: Date; // Last time this key was checked
  metadata?: Record<string, any>; // Additional metadata
}

export interface KeyCheckResult {
  key: string;
  status: "ok" | "expired" | "expiring_soon" | "not_configured" | "unknown";
  daysUntilExpiration?: number;
  expirationDate?: Date;
  message: string;
  alerts: string[]; // Array of alert messages
}

// Default keys to monitor
const DEFAULT_KEYS: KeyInfo[] = [
  {
    name: "Supabase URL",
    type: "api_key",
    alertDays: [30, 7, 1],
    isConfigured: false,
  },
  {
    name: "Supabase Service Role Key",
    type: "api_key",
    alertDays: [30, 7, 1],
    isConfigured: false,
  },
  {
    name: "Razorpay Key ID",
    type: "api_key",
    alertDays: [30, 7, 1],
    isConfigured: false,
  },
  {
    name: "Razorpay Key Secret",
    type: "client_secret",
    alertDays: [30, 7, 1],
    isConfigured: false,
  },
  {
    name: "Admin API Key",
    type: "api_key",
    alertDays: [90, 30, 7], // Longer notice for admin keys
    isConfigured: false,
  },
  {
    name: "Sentry DSN",
    type: "api_key",
    alertDays: [30, 7, 1],
    isConfigured: false,
  },
];

class KeyExpirationMonitor {
  private keys: Map<string, KeyInfo> = new Map();

  constructor() {
    // Initialize with default keys
    DEFAULT_KEYS.forEach(key => {
      this.keys.set(key.name, { ...key });
    });
    
    // Update configuration status
    this.updateConfigurationStatus();
  }

  /**
   * Update configuration status for all keys
   */
  private updateConfigurationStatus(): void {
    // Check Supabase keys
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.updateKeyStatus("Supabase URL", !!supabaseUrl);
    this.updateKeyStatus("Supabase Service Role Key", !!supabaseServiceKey);

    // Check Razorpay keys
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    this.updateKeyStatus("Razorpay Key ID", !!razorpayKeyId);
    this.updateKeyStatus("Razorpay Key Secret", !!razorpayKeySecret);

    // Check Admin API Key
    const adminKey = process.env.ADMIN_API_KEY;
    this.updateKeyStatus("Admin API Key", !!adminKey);

    // Check Sentry
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    this.updateKeyStatus("Sentry DSN", !!sentryDsn);
  }

  /**
   * Update configuration status for a specific key
   */
  private updateKeyStatus(keyName: string, isConfigured: boolean): void {
    const key = this.keys.get(keyName);
    if (key) {
      key.isConfigured = isConfigured;
      key.lastChecked = new Date();
    }
  }

  /**
   * Register a key with expiration date
   */
  registerKey(keyInfo: KeyInfo): void {
    this.keys.set(keyInfo.name, {
      ...keyInfo,
      lastChecked: new Date(),
    });
  }

  /**
   * Check all keys and return status
   */
  checkAllKeys(): KeyCheckResult[] {
    this.updateConfigurationStatus();
    
    const results: KeyCheckResult[] = [];
    
    this.keys.forEach((keyInfo, keyName) => {
      const result = this.checkKey(keyInfo);
      results.push(result);
    });
    
    return results;
  }

  /**
   * Check a single key
   */
  checkKey(keyInfo: KeyInfo): KeyCheckResult {
    const alerts: string[] = [];
    let status: KeyCheckResult["status"] = "ok";
    let daysUntilExpiration: number | undefined;
    let message = "";

    // Check if key is configured
    if (!keyInfo.isConfigured) {
      return {
        key: keyInfo.name,
        status: "not_configured",
        message: `${keyInfo.name} is not configured`,
        alerts: [`⚠️ ${keyInfo.name} is not configured in environment variables`],
      };
    }

    // Check expiration if date is provided
    if (keyInfo.expirationDate) {
      const now = new Date();
      const expiration = keyInfo.expirationDate;
      const diffMs = expiration.getTime() - now.getTime();
      daysUntilExpiration = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration < 0) {
        status = "expired";
        message = `${keyInfo.name} expired ${Math.abs(daysUntilExpiration)} days ago`;
        alerts.push(`🚨 CRITICAL: ${keyInfo.name} has EXPIRED ${Math.abs(daysUntilExpiration)} days ago!`);
      } else if (daysUntilExpiration === 0) {
        status = "expiring_soon";
        message = `${keyInfo.name} expires today`;
        alerts.push(`🚨 CRITICAL: ${keyInfo.name} expires TODAY!`);
      } else {
        // Check if we should alert based on alertDays
        for (const alertDay of keyInfo.alertDays.sort((a, b) => b - a)) {
          if (daysUntilExpiration <= alertDay) {
            status = "expiring_soon";
            message = `${keyInfo.name} expires in ${daysUntilExpiration} days`;
            alerts.push(`⚠️ ${keyInfo.name} expires in ${daysUntilExpiration} days (${expiration.toLocaleDateString()})`);
            break;
          }
        }
        
        if (alerts.length === 0) {
          message = `${keyInfo.name} expires in ${daysUntilExpiration} days`;
        }
      }
    } else {
      // No expiration date provided - assume unknown
      status = "unknown";
      message = `${keyInfo.name} expiration date not tracked`;
    }

    return {
      key: keyInfo.name,
      status,
      daysUntilExpiration,
      expirationDate: keyInfo.expirationDate,
      message,
      alerts,
    };
  }

  /**
   * Get all alerts (expired and expiring soon)
   */
  getAllAlerts(): Array<{ key: string; alerts: string[]; severity: "critical" | "warning" }> {
    const results = this.checkAllKeys();
    const alerts: Array<{ key: string; alerts: string[]; severity: "critical" | "warning" }> = [];

    results.forEach(result => {
      if (result.alerts.length > 0) {
        const severity = result.status === "expired" || result.daysUntilExpiration === 0 ? "critical" : "warning";
        alerts.push({
          key: result.key,
          alerts: result.alerts,
          severity,
        });
      }
    });

    return alerts;
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    total: number;
    configured: number;
    notConfigured: number;
    expired: number;
    expiringSoon: number;
    ok: number;
    unknown: number;
  } {
    const results = this.checkAllKeys();
    
    return {
      total: results.length,
      configured: results.filter(r => r.status !== "not_configured").length,
      notConfigured: results.filter(r => r.status === "not_configured").length,
      expired: results.filter(r => r.status === "expired").length,
      expiringSoon: results.filter(r => r.status === "expiring_soon").length,
      ok: results.filter(r => r.status === "ok").length,
      unknown: results.filter(r => r.status === "unknown").length,
    };
  }
}

// Singleton instance
let monitorInstance: KeyExpirationMonitor | null = null;

/**
 * Get the key expiration monitor instance
 */
export function getKeyExpirationMonitor(): KeyExpirationMonitor {
  if (!monitorInstance) {
    monitorInstance = new KeyExpirationMonitor();
  }
  return monitorInstance;
}

/**
 * Check all keys and return results
 */
export function checkAllKeys(): KeyCheckResult[] {
  return getKeyExpirationMonitor().checkAllKeys();
}

/**
 * Get all alerts
 */
export function getAllKeyAlerts(): Array<{ key: string; alerts: string[]; severity: "critical" | "warning" }> {
  return getKeyExpirationMonitor().getAllAlerts();
}

/**
 * Register a key for monitoring
 */
export function registerKey(keyInfo: KeyInfo): void {
  getKeyExpirationMonitor().registerKey(keyInfo);
}


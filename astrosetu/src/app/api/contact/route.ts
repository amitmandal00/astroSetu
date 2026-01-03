import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize, getClientIP } from "@/lib/apiHelpers";
import { z } from "zod";

const ContactFormSchema = z.object({
  name: z.string().optional(), // Optional for compliance requests
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(), // Auto-generated for compliance requests
  message: z.string().min(10, "Message must be at least 10 characters").max(500), // Reduced to 500 for compliance
  category: z.enum([
    "general", "support", "feedback", "bug", "partnership", "privacy", "other",
    "data_deletion", "account_access", "legal_notice", "privacy_complaint" // Compliance categories
  ]).optional(),
});

/**
 * POST /api/contact
 * Handle contact form submissions autonomously
 */
export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    // Rate limiting (stricter for contact form - prevent spam)
    const rateLimitResponse = checkRateLimit(req, '/api/contact');
    if (rateLimitResponse) {
      rateLimitResponse.headers.set('X-Request-ID', requestId);
      return rateLimitResponse;
    }

    // Validate request size
    validateRequestSize(req.headers.get('content-length'), 10 * 1024); // 10KB max

    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validatedData = ContactFormSchema.parse(json);

    const { name, email, phone, subject, message, category = "general" } = validatedData;

    // Log received category for debugging
    console.log("[Contact API] Received category from form:", category);

    // Get client IP for spam detection
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "";

    // Auto-generate subject if not provided (for compliance requests)
    const finalSubject = subject || `[COMPLIANCE REQUEST] ${category || "general"}`;

    // Auto-categorize based on subject/message content
    const autoCategory = categorizeMessage(finalSubject, message, category);
    
    // Log category after auto-categorization
    if (category !== autoCategory) {
      console.log(`[Contact API] Category changed: ${category} → ${autoCategory}`);
    } else {
      console.log(`[Contact API] Category preserved: ${autoCategory}`);
    }

    // Store submission in database (if Supabase configured)
    let submissionId: string | null = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = createServerClient();
        
        // Check for spam (multiple submissions from same IP in short time)
        // More lenient for testing: 10 submissions per hour instead of 5
        const { data: recentSubmissions } = await supabase
          .from("contact_submissions")
          .select("id")
          .eq("ip_address", clientIP)
          .gte("created_at", new Date(Date.now() - 3600000).toISOString()); // Last hour

        const spamLimit = parseInt(process.env.CONTACT_SPAM_LIMIT || "10", 10); // Default: 10 per hour
        const recentCount = recentSubmissions?.length || 0;
        
        console.log("[Contact API] Spam check:", {
          ip: clientIP.substring(0, 8) + "***",
          recentCount,
          spamLimit,
          withinLimit: recentCount < spamLimit,
        });

        if (recentCount >= spamLimit) {
          console.warn("[Contact API] ⚠️ Spam detection triggered:", {
            ip: clientIP.substring(0, 8) + "***",
            recentCount,
            spamLimit,
            timeWindow: "1 hour",
          });
          return NextResponse.json(
            {
              ok: false,
              error: "Too many submissions. Please wait before submitting again.",
            },
            { status: 429, headers: { 'X-Request-ID': requestId } }
          );
        }

        const { data: submission, error: dbError } = await supabase
          .from("contact_submissions")
          .insert({
            name: name || null,
            email,
            phone: phone || null,
            subject: finalSubject,
            message,
            category: autoCategory,
            ip_address: clientIP,
            user_agent: userAgent,
            status: "new",
            metadata: {
              auto_categorized: category !== autoCategory,
              original_category: category,
              compliance_request: true,
            },
          })
          .select()
          .single();

        if (dbError) {
          // Check if table doesn't exist
          if (dbError.code === 'PGRST205' || dbError.message?.includes('Could not find the table')) {
            console.error("[Contact API] Table 'contact_submissions' does not exist. Please run the SQL script from supabase-contact-submissions.sql in your Supabase SQL Editor.");
          } else {
            console.error("[Contact API] Database error:", dbError);
          }
          // Continue anyway - email will still be sent
        } else {
          submissionId = submission?.id || null;
        }
      } catch (dbError: any) {
        // Check if table doesn't exist
        if (dbError?.code === 'PGRST205' || dbError?.message?.includes('Could not find the table')) {
          console.error("[Contact API] Table 'contact_submissions' does not exist. Please run the SQL script from supabase-contact-submissions.sql in your Supabase SQL Editor.");
        } else {
          console.error("[Contact API] Database storage failed:", dbError);
        }
        // Continue anyway - email will still be sent
      }
    }

    // Send automated emails using waitUntil to ensure completion on Vercel
    // This ensures both user and internal emails are sent before function terminates
    // waitUntil ensures the background task completes even after HTTP response is sent
    console.log("[Contact API] 📧 Calling sendContactNotifications with category:", autoCategory);
    console.log("[Contact API] Email notification parameters:", {
      submissionId,
      email: email.substring(0, 3) + "***",
      category: autoCategory,
      hasResendKey: !!process.env.RESEND_API_KEY,
    });
    
    waitUntil(
      sendContactNotifications({
        submissionId,
        name: name || undefined,
        email,
        phone,
        subject: finalSubject,
        message,
        category: autoCategory,
        ipAddress: clientIP,
        userAgent: userAgent,
      })
      .then(() => {
        console.log("[Contact API] ✅ sendContactNotifications completed successfully");
      })
      .catch((error) => {
        console.error("[Contact API] ========================================");
        console.error("[Contact API] ❌ EMAIL NOTIFICATION FAILED");
        console.error("[Contact API] ========================================");
        console.error("[Contact API] Email notification failed with error:", error);
        console.error("[Contact API] Error stack:", error?.stack);
        console.error("[Contact API] Error message:", error?.message);
        console.error("[Contact API] Error type:", error?.constructor?.name);
        console.error("[Contact API] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        // Don't fail the request if email fails - but log it for debugging
      })
    );

    // Check if Resend email service is configured (only Resend, no SMTP)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const emailConfigured = !!RESEND_API_KEY;

    // Log successful submission for audit trail (required for compliance)
    console.log(`[Contact API] Regulatory request received:`, {
      submissionId,
      email: email.substring(0, 3) + "***", // Partial email for logging (PII redaction)
      category: autoCategory,
      timestamp: new Date().toISOString(),
      emailConfigured,
      stored: !!submissionId,
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          message: "Your regulatory request has been received. We will process it according to applicable privacy laws.",
          submissionId,
          autoReplySent: emailConfigured, // Only true if email service is configured
          emailConfigured, // Indicate if email service is available
        },
      },
      { headers: { 'X-Request-ID': requestId } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Auto-categorize message based on content
 */
function categorizeMessage(
  subject: string,
  message: string,
  userCategory?: string
): "general" | "support" | "feedback" | "bug" | "partnership" | "other" | "data_deletion" | "account_access" | "legal_notice" | "privacy_complaint" {
  // Preserve compliance categories if provided
  const complianceCategories = ["data_deletion", "account_access", "legal_notice", "privacy_complaint"];
  if (userCategory && complianceCategories.includes(userCategory)) {
    return userCategory as "data_deletion" | "account_access" | "legal_notice" | "privacy_complaint";
  }
  if (userCategory && userCategory !== "general") {
    return userCategory as any;
  }

  const subjectLower = subject.toLowerCase();
  const messageLower = message.toLowerCase();

  // Support keywords
  const supportKeywords = [
    "help", "support", "issue", "problem", "not working", "error", "can't", "cannot",
    "how to", "question", "assistance", "stuck", "trouble",
  ];
  if (supportKeywords.some((kw) => subjectLower.includes(kw) || messageLower.includes(kw))) {
    return "support";
  }

  // Bug keywords
  const bugKeywords = ["bug", "broken", "crash", "freeze", "glitch", "defect", "malfunction"];
  if (bugKeywords.some((kw) => subjectLower.includes(kw) || messageLower.includes(kw))) {
    return "bug";
  }

  // Feedback keywords
  const feedbackKeywords = [
    "feedback", "suggestion", "improve", "enhancement", "feature request",
    "opinion", "review", "rating", "recommend",
  ];
  if (feedbackKeywords.some((kw) => subjectLower.includes(kw) || messageLower.includes(kw))) {
    return "feedback";
  }

  // Partnership keywords
  const partnershipKeywords = [
    "partnership", "collaborate", "affiliate", "business", "sponsor",
    "advertise", "advertisement", "promote",
  ];
  if (partnershipKeywords.some((kw) => subjectLower.includes(kw) || messageLower.includes(kw))) {
    return "partnership";
  }

  return "general";
}

/**
 * Send automated email notifications
 */
async function sendContactNotifications(data: {
  submissionId: string | null;
  name?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  console.log("[Contact API] 📧 sendContactNotifications STARTED with category:", data.category);
  const { submissionId, name, email, phone, subject, message, category } = data;
  console.log("[Contact API] sendContactNotifications parameters:", {
    submissionId,
    email: email.substring(0, 3) + "***",
    category: category,
    hasName: !!name,
    hasPhone: !!phone,
    hasIpAddress: !!data.ipAddress,
    hasUserAgent: !!data.userAgent,
  });

  // LOCKED SENDER IDENTITY: Only Resend API, no SMTP
  // Authoritative sender rule (code-locked):
  // From: "AstroSetu AI" <privacy@mindveda.net> (changed from no-reply@ for better deliverability)
  // Reply-To: privacy@mindveda.net
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  // Use RESEND_FROM directly (recommended) or construct from separate variables (backwards compatibility)
  // IMPORTANT: Resend requires format "Name <email@domain.com>" for proper sender display
  // RECOMMENDED: Use privacy@mindveda.net instead of no-reply@ for better email deliverability
  let RESEND_FROM = process.env.RESEND_FROM;
  
  if (!RESEND_FROM) {
    // Default to privacy@mindveda.net for better deliverability (no-reply@ addresses are heavily filtered)
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "privacy@mindveda.net";
    const fromName = process.env.RESEND_FROM_NAME || "AstroSetu AI";
    RESEND_FROM = `${fromName} <${fromEmail}>`;
    console.log("[Contact API] Constructed RESEND_FROM:", RESEND_FROM);
  } else {
    console.log("[Contact API] Using RESEND_FROM from env:", RESEND_FROM);
  }
  
  // Validate and fix RESEND_FROM format - Resend requires "Name <email>" format
  if (!RESEND_FROM.includes("<") || !RESEND_FROM.includes(">")) {
    console.log("[Contact API] WARNING: RESEND_FROM format is invalid. Expected: 'Name <email@domain.com>', got:", RESEND_FROM);
    // Fix it if it's just an email address
    if (RESEND_FROM.includes("@") && !RESEND_FROM.includes("<")) {
      const fixedFrom = `AstroSetu AI <${RESEND_FROM}>`;
      console.log("[Contact API] AUTO-FIXING RESEND_FROM format from:", RESEND_FROM, "to:", fixedFrom);
      RESEND_FROM = fixedFrom;
    } else {
      console.error("[Contact API] ERROR: Cannot auto-fix RESEND_FROM. Invalid format:", RESEND_FROM);
    }
  } else {
    console.log("[Contact API] RESEND_FROM format is valid:", RESEND_FROM);
  }
  
  const RESEND_REPLY_TO = process.env.RESEND_REPLY_TO || "privacy@mindveda.net"; // Locked reply-to address
  
  // Route emails to appropriate compliance addresses based on category
  const getComplianceEmail = (category: string): string => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("privacy") || categoryLower.includes("data_deletion") || categoryLower.includes("account_access")) {
      return process.env.PRIVACY_EMAIL || "privacy@mindveda.net";
    }
    if (categoryLower.includes("legal") || categoryLower.includes("legal_notice") || categoryLower.includes("dispute")) {
      return process.env.LEGAL_EMAIL || "legal@mindveda.net";
    }
    if (categoryLower.includes("security") || categoryLower.includes("breach")) {
      return process.env.SECURITY_EMAIL || "security@mindveda.net";
    }
    // Default to support@ for consumer law and general compliance
    return process.env.SUPPORT_EMAIL || "support@mindveda.net";
  };
  
  const complianceEmail = getComplianceEmail(category);
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || complianceEmail;
  const COMPLIANCE_TO = process.env.COMPLIANCE_TO || complianceEmail;
  // For legal_notice, ensure legal email is in CC if not already the primary recipient
  const COMPLIANCE_CC = process.env.COMPLIANCE_CC || (
    (category === "legal_notice" || category.includes("legal")) 
      ? (process.env.LEGAL_EMAIL || "legal@mindveda.net")
      : undefined
  );
  const BRAND_NAME = process.env.BRAND_NAME || "AstroSetu AI";
  
  // Log routing for all categories to verify email addresses
  console.log("[Contact API] Email routing configuration:", {
    category,
    complianceEmail,
    adminEmail: ADMIN_EMAIL,
    complianceTo: COMPLIANCE_TO,
    complianceCc: COMPLIANCE_CC,
    privacyEmail: process.env.PRIVACY_EMAIL || "privacy@mindveda.net",
    legalEmail: process.env.LEGAL_EMAIL || "legal@mindveda.net",
  });

  // Only Resend is supported - check if configured
  if (!RESEND_API_KEY) {
    // No email service configured - log for manual processing
    console.log("[Contact API] Resend API not configured. Submission details:", {
      submissionId,
      name,
      email,
      phone,
      subject,
      category,
      message: message.substring(0, 200),
    });
    return;
  }

  try {
    // Format category for display - MUST match form labels
    const categoryDisplay = category === "data_deletion" ? "Data Deletion Request" 
      : category === "privacy_complaint" ? "Privacy Complaint" 
      : category === "legal_notice" ? "Legal Notice" 
      : category === "account_access" ? "Account Access Issue"  // Matches form label
      : category === "security" ? "Security Notification"
      : category === "breach" ? "Data Breach Notification"
      : category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    // PRODUCTION-SAFE EMAIL SENDER IDENTITY (per ChatGPT feedback):
    // Use ONE sender identity everywhere: RESEND_FROM (privacy@mindveda.net)
    // Move compliance address to replyTo, not from
    // This prevents Resend from blocking emails due to unverified domain identities
    // Using privacy@mindveda.net instead of no-reply@ for better email deliverability
    const lockedSender = RESEND_FROM; // Use RESEND_FROM for ALL emails: "AstroSetu AI <privacy@mindveda.net>"
    const lockedReplyTo = COMPLIANCE_TO || RESEND_REPLY_TO; // Use compliance email for replyTo: "privacy@mindveda.net"

    console.log("[Contact API] Starting email sending process:", {
      category,
      to: email,
      adminTo: ADMIN_EMAIL,
      from: lockedSender, // Single sender identity for all emails
      replyTo: lockedReplyTo, // Compliance address in replyTo
      resendApiKey: RESEND_API_KEY ? "configured" : "missing",
    });

    if (!RESEND_API_KEY) {
      console.error("[Contact API] ❌ RESEND_API_KEY is missing - emails will not be sent");
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log("[Contact API] ✅ RESEND_API_KEY is configured, proceeding with email sending");

    // 1️⃣ User Acknowledgement Email (External-Facing, Minimal)
    // Purpose: Legal acknowledgement to user
    // Recipient: User only, NO CC, NO admin addresses
    console.log("[Contact API] ========================================");
    console.log("[Contact API] 1️⃣ SENDING USER ACKNOWLEDGEMENT EMAIL");
    console.log("[Contact API] ========================================");
    console.log("[Contact API] Sending user acknowledgement email to:", email);
    console.log("[Contact API] Email payload preview:", {
      to: email,
      from: lockedSender, // Single sender: "AstroSetu AI <privacy@mindveda.net>"
      replyTo: lockedReplyTo, // Compliance address in replyTo
      subject: `Regulatory Request Received – ${BRAND_NAME}`,
      note: "No CC - external-facing only",
    });
    
    try {
      console.log("[Contact API] Generating minimal user acknowledgement email HTML...");
      const autoReplyHtml = generateAutoReplyEmail(name || "User", subject, category);
      console.log("[Contact API] User acknowledgement HTML generated, length:", autoReplyHtml.length);
      
      console.log("[Contact API] Calling sendEmail for user acknowledgement (no CC)...");
      
      // User acknowledgement email - NO CC, external-facing only
      const userEmailResult = await sendEmail({
        apiKey: RESEND_API_KEY,
        to: email,
        from: lockedSender, // Single sender identity: "AstroSetu AI <privacy@mindveda.net>"
        replyTo: lockedReplyTo, // Compliance address in replyTo
        subject: `Regulatory Request Received – ${BRAND_NAME}`,
        html: autoReplyHtml,
        // NO CC - internal notifications are sent separately
      });
      console.log("[Contact API] ✅ User acknowledgement email sent successfully", {
        to: email,
        from: lockedSender,
        replyTo: lockedReplyTo,
        resendEmailId: userEmailResult.id,
        resendEmailUrl: `https://resend.com/emails/${userEmailResult.id}`,
        note: "External-facing, no CC - Check Resend dashboard to verify",
      });
      console.log("[Contact API] ✅ User acknowledgement email completed - proceeding to internal notification");
    } catch (emailError: any) {
      console.error("[Contact API] ❌ Failed to send user acknowledgement email:", {
        error: emailError?.message || String(emailError),
        stack: emailError?.stack,
        to: email,
        from: lockedSender,
      });
      // Don't re-throw - continue to send internal notification even if user email fails
      console.warn("[Contact API] ⚠️ Continuing to send internal notification despite user email failure");
    }

    // 2️⃣ Internal Compliance Notification Email (Internal-Only, Detailed)
    // Purpose: Actionable record for compliance team
    // Recipient: Compliance inbox with CC to relevant teams
    // This is sent in a separate try-catch so it always runs, even if user email failed
    console.log("[Contact API] ========================================");
    console.log("[Contact API] 2️⃣ SENDING INTERNAL COMPLIANCE NOTIFICATION EMAIL");
    console.log("[Contact API] ========================================");
    try {
      // Format category for subject (uppercase with underscores)
      const categoryForSubject = category.toUpperCase().replace(/_/g, "_");
      const internalSubject = `[COMPLIANCE][${categoryForSubject}] New Request`;
      console.log("[Contact API] Internal notification subject:", internalSubject);
      
      // Determine CC recipients for internal notification based on category
      const internalCcRecipients: string[] = [];
      
      // For legal_notice, ensure legal email is CC'd
      if (category === "legal_notice" || category.includes("legal")) {
        const legalEmail = process.env.LEGAL_EMAIL || "legal@mindveda.net";
        if (legalEmail && !internalCcRecipients.includes(legalEmail) && legalEmail !== ADMIN_EMAIL) {
          internalCcRecipients.push(legalEmail);
        }
      }
      
      // For privacy-related categories, ensure privacy email is CC'd
      if (category === "privacy_complaint" || category === "data_deletion" || category === "account_access" || category.includes("privacy")) {
        const privacyEmail = process.env.PRIVACY_EMAIL || "privacy@mindveda.net";
        if (privacyEmail && !internalCcRecipients.includes(privacyEmail) && privacyEmail !== ADMIN_EMAIL) {
          internalCcRecipients.push(privacyEmail);
        }
      }
      
      // For security/breach categories, ensure security email is CC'd
      if (category === "security" || category === "breach" || category.includes("security") || category.includes("breach")) {
        const securityEmail = process.env.SECURITY_EMAIL || "security@mindveda.net";
        if (securityEmail && !internalCcRecipients.includes(securityEmail) && securityEmail !== ADMIN_EMAIL) {
          internalCcRecipients.push(securityEmail);
        }
      }
      
      // Add COMPLIANCE_CC if configured and not already in list
      if (COMPLIANCE_CC && !internalCcRecipients.includes(COMPLIANCE_CC) && COMPLIANCE_CC !== ADMIN_EMAIL) {
        internalCcRecipients.push(COMPLIANCE_CC);
      }
      
      // IMPORTANT: Always ensure the primary compliance email receives the notification
      // If ADMIN_EMAIL is the primary recipient, it will receive it in the 'to' field
      // But we should also ensure it's in CC if there are other recipients
      // Actually, ADMIN_EMAIL is already the 'to' field, so it will receive it
      
      console.log("[Contact API] Sending internal notification email to:", ADMIN_EMAIL);
      console.log("[Contact API] Internal notification CC recipients:", internalCcRecipients.length > 0 ? internalCcRecipients : "none");
      console.log("[Contact API] Internal notification sender:", lockedSender);
      console.log("[Contact API] Internal notification email payload preview:", {
        to: ADMIN_EMAIL,
        from: lockedSender,
        replyTo: email,
        subject: internalSubject,
        cc: internalCcRecipients.length > 0 ? internalCcRecipients : "none",
      });
      
      console.log("[Contact API] 🔵 About to call sendEmail for internal notification...");
      console.log("[Contact API] Internal notification details:", {
        to: ADMIN_EMAIL,
        from: lockedSender,
        subject: internalSubject,
        hasCc: internalCcRecipients.length > 0,
        ccCount: internalCcRecipients.length,
      });
      
      // Internal compliance notification - use compliance sender identity
      const complianceSender = process.env.COMPLIANCE_SENDER || "AstroSetu Compliance <privacy@mindveda.net>";
      
      console.log("[Contact API] 🔵 Sending internal compliance notification email...");
      console.log("[Contact API] Internal email configuration:", {
        to: ADMIN_EMAIL,
        cc: internalCcRecipients.length > 0 ? internalCcRecipients : "none",
        from: complianceSender,
        replyTo: email,
        subject: internalSubject,
      });
      
      const internalEmailResult = await sendEmail({
        apiKey: RESEND_API_KEY,
        to: ADMIN_EMAIL,
        from: complianceSender, // Compliance sender identity for internal emails
        replyTo: email, // Allow admin to reply directly to user
        subject: internalSubject,
        html: generateAdminNotificationEmail({
          submissionId,
          name,
          email,
          phone,
          subject,
          message,
          category,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        }),
        cc: internalCcRecipients.length > 0 ? internalCcRecipients : undefined,
      });
      
      console.log("[Contact API] ========================================");
      console.log("[Contact API] ✅ INTERNAL NOTIFICATION EMAIL SENT SUCCESSFULLY");
      console.log("[Contact API] ========================================");
      console.log("[Contact API] Internal notification email sent successfully", {
        to: ADMIN_EMAIL,
        from: complianceSender,
        replyTo: email,
        cc: internalCcRecipients.length > 0 ? internalCcRecipients : "none",
        resendEmailId: internalEmailResult.id,
        resendEmailUrl: `https://resend.com/emails/${internalEmailResult.id}`,
        note: "Internal-only, detailed - Check Resend dashboard to verify",
      });
    } catch (internalEmailError: any) {
      console.error("[Contact API] ========================================");
      console.error("[Contact API] ❌ FAILED TO SEND INTERNAL NOTIFICATION EMAIL");
      console.error("[Contact API] ========================================");
      console.error("[Contact API] Failed to send internal notification email:", {
        error: internalEmailError?.message || String(internalEmailError),
        stack: internalEmailError?.stack,
        to: ADMIN_EMAIL,
        from: lockedSender,
        errorType: internalEmailError?.constructor?.name,
        fullError: JSON.stringify(internalEmailError, Object.getOwnPropertyNames(internalEmailError)),
      });
      // Re-throw internal notification errors - these are critical
      throw internalEmailError;
    }
    
    console.log("[Contact API] ✅ Both emails (user + internal) completed successfully");
    console.log(`[Contact API] Emails sent for submission: ${submissionId || email} (via Resend, sender: ${lockedSender})`);
  } catch (error: any) {
    console.error("[Contact API] Email sending failed in sendContactNotifications:", {
      error: error?.message || String(error),
      errorType: error?.constructor?.name || typeof error,
      stack: error?.stack,
      submissionId,
      email: email?.substring(0, 3) + "***" || "unknown",
      category,
      resendApiKey: RESEND_API_KEY ? "configured" : "missing",
      resendFrom: RESEND_FROM,
    });
    console.error("[Contact API] Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    // Re-throw to be caught by outer catch handler
    throw error;
  }
}

/**
 * Send email using Resend API (ONLY method - SMTP removed)
 * SINGLE SENDER IDENTITY: All emails use ONE sender identity to prevent Resend blocking
 * From: "AstroSetu AI <privacy@mindveda.net>" (RESEND_FROM) - using privacy@ for better deliverability
 * Reply-To: privacy@mindveda.net (or custom if provided)
 * Note: Compliance addresses go in replyTo/cc, NOT in from field
 */
async function sendEmail(data: {
  apiKey: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string | string[];
}): Promise<{ id: string }> {
  console.log("[Contact API] sendEmail called:", {
    to: data.to,
    from: data.from,
    subject: data.subject,
    hasApiKey: !!data.apiKey,
    hasReplyTo: !!data.replyTo,
    hasCc: !!data.cc,
    cc: data.cc,
  });

  const emailPayload: {
    to: string;
    from: string;
    subject: string;
    html: string;
    reply_to?: string;
    cc?: string | string[];
  } = {
    to: data.to,
    from: data.from, // Single sender identity: "AstroSetu AI <privacy@mindveda.net>"
    subject: data.subject,
    html: data.html,
  };

  // Always set reply_to (compliance address: privacy@mindveda.net)
  if (data.replyTo) {
    emailPayload.reply_to = data.replyTo;
  }

  // Add CC recipients if provided
  if (data.cc) {
    emailPayload.cc = data.cc;
  }

  console.log("[Contact API] ========================================");
  console.log("[Contact API] 📤 SENDING REQUEST TO RESEND API");
  console.log("[Contact API] ========================================");
  console.log("[Contact API] Email payload sender verification:", {
    from: emailPayload.from,
    to: emailPayload.to,
    replyTo: emailPayload.reply_to,
    cc: emailPayload.cc,
    subject: emailPayload.subject,
    htmlLength: emailPayload.html.length,
  });
  console.log("[Contact API] 🔵 About to call fetch() to Resend API...");
  let response: Response;
  try {
    console.log("[Contact API] 🔵 Calling fetch() now with timeout...");
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error("[Contact API] ⏰ TIMEOUT: Resend API request taking longer than 30 seconds, aborting...");
      controller.abort();
    }, 30000); // 30 second timeout
    
    try {
      console.log("[Contact API] 🔵 Executing fetch() call to Resend API...");
      const fetchStartTime = Date.now();
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${data.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
        signal: controller.signal,
      });
      const fetchDuration = Date.now() - fetchStartTime;
      clearTimeout(timeoutId);
      console.log("[Contact API] ✅ Fetch() completed successfully in", fetchDuration, "ms");
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("[Contact API] ❌ Fetch() error caught:", {
        errorName: fetchError?.name,
        errorMessage: fetchError?.message,
        isAbortError: fetchError?.name === 'AbortError',
      });
      if (fetchError.name === 'AbortError') {
        throw new Error("Resend API request timed out after 30 seconds");
      }
      throw fetchError;
    }
    console.log("[Contact API] 🔵 Resend API response received:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });
    console.log("[Contact API] 🔵 About to parse response body...");
  } catch (fetchError: any) {
    console.error("[Contact API] ❌ Fetch error (network/timeout):", {
      error: fetchError?.message || String(fetchError),
      stack: fetchError?.stack,
    });
    throw new Error(`Failed to connect to Resend API: ${fetchError?.message || String(fetchError)}`);
  }

  if (!response.ok) {
    let errorText: string;
    try {
      errorText = await response.text();
    } catch (textError: any) {
      console.error("[Contact API] Failed to read error response body:", textError);
      errorText = `HTTP ${response.status} ${response.statusText}`;
    }
    
    let errorDetails: any;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = errorText;
    }
    const errorMessage = typeof errorDetails === 'object' && errorDetails.message 
      ? errorDetails.message 
      : errorText;
    
    console.log("[Contact API] Error response parsed:", {
      status: response.status,
      errorMessage,
      errorDetailsType: typeof errorDetails,
    });
    
    // Enhanced error logging for domain verification issues
    const isDomainError = response.status === 403 && (
      errorMessage.includes("domain is not verified") ||
      (errorMessage.includes("domain") && errorMessage.includes("verified"))
    );
    
    if (isDomainError) {
      console.error("[Contact API] ⚠️ DOMAIN VERIFICATION REQUIRED:", {
        status: response.status,
        error: errorMessage,
        from: emailPayload.from,
        action: "Verify domain in Resend Dashboard → Domains",
        url: "https://resend.com/domains",
        payload: { 
          to: emailPayload.to,
          from: emailPayload.from,
          subject: emailPayload.subject,
        },
      });
    } else {
      console.error("[Contact API] Resend API error details:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        payload: { 
          to: emailPayload.to,
          from: emailPayload.from,
          subject: emailPayload.subject,
          htmlLength: emailPayload.html.length,
        },
      });
    }
    throw new Error(`Resend API error: ${response.status} - ${errorMessage}`);
  }

  // Response is OK - parse the success response
  console.log("[Contact API] ✅ Response is OK, parsing success response...");
  let result: any;
  try {
    const responseText = await response.text();
    console.log("[Contact API] 🔵 Response text received, length:", responseText.length);
    console.log("[Contact API] 🔵 Response text (first 500 chars):", responseText.substring(0, 500));
    try {
      result = JSON.parse(responseText);
      console.log("[Contact API] Resend API response parsed successfully:", {
        hasId: !!result?.id,
        id: result?.id,
        keys: Object.keys(result || {}),
        fullResponse: JSON.stringify(result),
      });
    } catch (parseError: any) {
      console.error("[Contact API] Failed to parse response text as JSON:", {
        error: parseError?.message || String(parseError),
        responseText: responseText.substring(0, 200),
      });
      throw new Error(`Resend API returned invalid JSON. Status: ${response.status}, Response: ${responseText.substring(0, 200)}`);
    }
  } catch (textError: any) {
    console.error("[Contact API] Failed to read Resend API response text:", {
      error: textError?.message || String(textError),
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`Resend API returned invalid response. Status: ${response.status}`);
  }
  
  if (!result?.id) {
    console.error("[Contact API] ⚠️ Resend API did not return an email ID:", {
      status: response.status,
      statusText: response.statusText,
      responseBody: result,
      responseType: typeof result,
      payload: { 
        to: emailPayload.to,
        from: emailPayload.from,
        subject: emailPayload.subject,
        htmlLength: emailPayload.html.length,
      },
    });
    throw new Error(`Resend API error: Email sent but no ID returned. Status: ${response.status}, Response: ${JSON.stringify(result)}`);
  }

  console.log("[Contact API] ========================================");
  console.log("[Contact API] ✅ EMAIL SENT SUCCESSFULLY TO RESEND");
  console.log("[Contact API] ========================================");
  console.log("[Contact API] ✅ Email sent successfully to Resend:", {
    id: result.id,
    to: data.to,
    from: data.from,
    subject: data.subject,
    responseStatus: response.status,
  });
  
  // Return the email ID for verification
  return { id: result.id };
}

/**
 * Generate auto-reply email HTML (EXTERNAL-FACING, MINIMAL)
 * This is sent to users - no internal details, minimal information
 */
function generateAutoReplyEmail(name: string, subject: string, category: string): string {
  // Get base URL from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  "https://astrosetu.app";
  
  // Standard auto-reply message per ChatGPT feedback
  const standardAutoReply = "This is an automated acknowledgement. Requests are reviewed periodically as required by law. No individual response is guaranteed.";
  
  const categoryMessages: Record<string, string> = {
    privacy: `We have received your privacy request. ${standardAutoReply}`,
    privacy_complaint: `We have received your privacy complaint. ${standardAutoReply}`,
    data_deletion: `We have received your data deletion request. ${standardAutoReply}`,
    account_access: `We have received your account access request. ${standardAutoReply}`,
    legal_notice: `We have received your legal notice. ${standardAutoReply}`,
    security: `We have received your security notification. ${standardAutoReply}`,
    breach: `We have received your data breach notification. ${standardAutoReply}`,
    general: `We have received your request. ${standardAutoReply}`,
    other: `We have received your request. ${standardAutoReply}`,
  };

  const responseMessage = categoryMessages[category] || categoryMessages.general;
  const displayName = name || "User";
  
  // Format category for display (user-friendly) - MUST match form labels exactly
  const categoryDisplay = category === "data_deletion" ? "Data Deletion Request"
    : category === "privacy_complaint" ? "Privacy Complaint"
    : category === "legal_notice" ? "Legal Notice"
    : category === "account_access" ? "Account Access Issue"  // Matches form label
    : category === "security" ? "Security Notification"
    : category === "breach" ? "Data Breach Notification"
    : category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #8B5CF6, #6366F1, #3B82F6); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .notice { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Compliance Request Received</h1>
        </div>
        <div class="content">
          <p>Dear ${displayName},</p>
          <p>Thank you for your compliance request.</p>
          <p><strong>Request Type:</strong> ${categoryDisplay}</p>
          <p><strong>Received:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
          <p>${responseMessage}</p>
          
          <div class="notice">
            <p><strong>What happens next:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Your request has been logged and assigned a reference number</li>
              <li>It will be reviewed as required by applicable privacy and data protection laws</li>
              <li>No individual response is guaranteed</li>
            </ul>
            <p style="margin-top: 10px;"><strong>Note:</strong> AstroSetu AI is a fully automated platform and does not provide live support. For self-service information, please refer to our <a href="${baseUrl}/ai-astrology/faq" style="color: #6366f1; text-decoration: underline;">FAQs</a> and policies.</p>
          </div>
          
          <p>For self-help resources, please visit:</p>
          <ul>
            <li><a href="${baseUrl}/faq" style="color: #6366f1; text-decoration: underline;">Help & FAQs</a></li>
            <li><a href="${baseUrl}/privacy" style="color: #6366f1; text-decoration: underline;">Privacy Policy</a></li>
            <li><a href="${baseUrl}/terms" style="color: #6366f1; text-decoration: underline;">Terms & Conditions</a></li>
          </ul>
          
          <div class="footer">
            <p>Best regards,<br>The AstroSetu Compliance Team</p>
            <p><em>This is an automated response. Please do not reply to this email. For compliance matters, use the <a href="${baseUrl}/contact" style="color: #6366f1; text-decoration: underline;">contact form</a> on our website.</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate admin notification email HTML (INTERNAL-ONLY, DETAILED)
 * This is sent to compliance team - includes all details for triage
 */
function generateAdminNotificationEmail(data: {
  submissionId: string | null;
  name?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  ipAddress?: string;
  userAgent?: string;
}): string {
  // Get base URL from environment or use default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  "https://astrosetu.app";
  
  const { submissionId, name, email, phone, subject, message, category, ipAddress, userAgent } = data;
  
  // Format category for display - MUST match form labels exactly
  const categoryDisplay = category === "data_deletion" ? "Data Deletion Request" 
    : category === "privacy_complaint" ? "Privacy Complaint" 
    : category === "legal_notice" ? "Legal Notice" 
    : category === "account_access" ? "Account Access Issue"  // Matches form label
    : category === "security" ? "Security Notification"
    : category === "breach" ? "Data Breach Notification"
    : category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  
  // Generate Supabase link if submissionId exists
  const supabaseLink = submissionId 
    ? `https://supabase.com/dashboard/project/_/editor/table/contact_submissions?filter=id%3Deq%3D${submissionId}`
    : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #1f2937; margin-top: 5px; }
        .message-box { background: #f9fafb; padding: 15px; border-radius: 5px; border-left: 4px solid #6366f1; margin-top: 10px; white-space: pre-wrap; }
        .category-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .category-data_deletion { background: #fee2e2; color: #991b1b; }
        .category-account_access { background: #fef3c7; color: #92400e; }
        .category-legal_notice { background: #fee2e2; color: #991b1b; }
        .category-privacy_complaint { background: #fee2e2; color: #991b1b; }
        .category-security { background: #fee2e2; color: #991b1b; }
        .category-breach { background: #fee2e2; color: #991b1b; }
        .category-general { background: #f3f4f6; color: #374151; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .action-button { display: inline-block; margin-top: 15px; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Contact Form Submission</h2>
          <span class="category-badge category-${category}">${category}</span>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Submission ID:</div>
            <div class="value">
              ${submissionId || "N/A (Database not configured)"}
              ${supabaseLink ? ` <a href="${supabaseLink}" style="color: #6366f1; text-decoration: underline;">View in Supabase</a>` : ""}
            </div>
          </div>
          <div class="field">
            <div class="label">Category:</div>
            <div class="value"><strong>${categoryDisplay}</strong> (${category})</div>
          </div>
          <div class="field">
            <div class="label">Timestamp:</div>
            <div class="value">${new Date().toISOString()}</div>
          </div>
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${name || "Not provided"}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          ${phone ? `
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value"><a href="tel:${phone}">${phone}</a></div>
          </div>
          ` : ""}
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${subject}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="message-box">${message}</div>
          </div>
          ${ipAddress ? `
          <div class="field">
            <div class="label">IP Address:</div>
            <div class="value" style="font-family: monospace; font-size: 12px;">${ipAddress}</div>
          </div>
          ` : ""}
          ${userAgent ? `
          <div class="field">
            <div class="label">User Agent:</div>
            <div class="value" style="font-family: monospace; font-size: 11px; word-break: break-all;">${userAgent}</div>
          </div>
          ` : ""}
          <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 5px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              <strong>Quick Actions:</strong><br>
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="color: #6366f1; text-decoration: underline;">Reply to ${name || email}</a> | 
              ${supabaseLink ? `<a href="${supabaseLink}" style="color: #6366f1; text-decoration: underline;">View in Supabase</a> | ` : ""}
              <a href="https://resend.com/logs" style="color: #6366f1; text-decoration: underline;">View Resend Logs</a>
            </p>
          </div>
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="action-button">Reply to ${name || email}</a>
          <div class="footer">
            <p><strong>Internal Use Only</strong> - This email contains sensitive information for compliance team use.</p>
            <p>This email was automatically generated from the AstroSetu contact form.</p>
            <p>Reply to this email to respond directly to ${name || email}.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}


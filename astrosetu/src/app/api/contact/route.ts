import { NextResponse } from "next/server";
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
        const { data: recentSubmissions } = await supabase
          .from("contact_submissions")
          .select("id")
          .eq("ip_address", clientIP)
          .gte("created_at", new Date(Date.now() - 3600000).toISOString()); // Last hour

        if (recentSubmissions && recentSubmissions.length >= 5) {
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

    // Send automated emails (fire and forget - don't block response)
    sendContactNotifications({
      submissionId,
      name: name || undefined,
      email,
      phone,
      subject: finalSubject,
      message,
      category: autoCategory,
    }).catch((error) => {
      console.error("[Contact API] Email notification failed:", error);
      // Don't fail the request if email fails
    });

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
}): Promise<void> {
  const { submissionId, name, email, phone, subject, message, category } = data;

  // LOCKED SENDER IDENTITY: Only Resend API, no SMTP
  // Authoritative sender rule (code-locked):
  // From: "AstroSetu AI" <no-reply@mindveda.net>
  // Reply-To: privacy@mindveda.net
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  // Use RESEND_FROM directly (recommended) or construct from separate variables (backwards compatibility)
  const RESEND_FROM = process.env.RESEND_FROM || 
    (() => {
      const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "no-reply@mindveda.net";
      const fromName = process.env.RESEND_FROM_NAME || "AstroSetu AI";
      return `${fromName} <${fromEmail}>`;
    })();
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
  const COMPLIANCE_CC = process.env.COMPLIANCE_CC || (category.includes("legal") ? process.env.LEGAL_EMAIL : undefined);
  const BRAND_NAME = process.env.BRAND_NAME || "AstroSetu AI";

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
    // Format category for display
    const categoryDisplay = category === "data_deletion" ? "Data Deletion" 
      : category === "privacy_complaint" ? "Privacy Complaint" 
      : category === "legal_notice" ? "Legal Notice" 
      : category === "account_access" ? "Account Access" 
      : category;

    // LOCKED SENDER IDENTITY: All emails sent via Resend only
    // Authoritative sender rule (code-locked):
    // From: "AstroSetu AI" <no-reply@mindveda.net>
    // Reply-To: privacy@mindveda.net
    const lockedSender = RESEND_FROM; // Use RESEND_FROM directly
    const lockedReplyTo = RESEND_REPLY_TO; // Locked reply-to address

    console.log("[Contact API] Starting email sending process:", {
      category,
      to: email,
      adminTo: ADMIN_EMAIL,
      from: lockedSender,
      replyTo: lockedReplyTo,
    });

    // Send user acknowledgement email (auto-reply)
    await sendEmail({
      apiKey: RESEND_API_KEY,
      to: email,
      from: lockedSender, // "AstroSetu AI" <no-reply@mindveda.net>
      replyTo: lockedReplyTo, // privacy@mindveda.net
      subject: `Regulatory Request Received – ${BRAND_NAME}`,
      html: generateAutoReplyEmail(name || "User", subject, category),
    });

    // Send internal compliance notification to admin
    const internalSubject = `New Regulatory Request – ${categoryDisplay}`;
    
    await sendEmail({
      apiKey: RESEND_API_KEY,
      to: ADMIN_EMAIL,
      from: lockedSender, // "AstroSetu AI" <no-reply@mindveda.net>
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
      }),
    });

    // Send CC email if configured
    if (COMPLIANCE_CC) {
      await sendEmail({
        apiKey: RESEND_API_KEY,
        to: COMPLIANCE_CC,
        from: lockedSender, // "AstroSetu AI" <no-reply@mindveda.net>
        replyTo: email, // Allow CC recipient to reply directly to user
        subject: internalSubject,
        html: generateAdminNotificationEmail({
          submissionId,
          name,
          email,
          phone,
          subject,
          message,
          category,
        }),
      });
    }

    console.log(`[Contact API] Emails sent for submission: ${submissionId || email} (via Resend, sender: ${lockedSender})`);
  } catch (error: any) {
    console.error("[Contact API] Email sending failed:", {
      error: error?.message || error,
      stack: error?.stack,
      submissionId,
      email: email.substring(0, 3) + "***",
      category,
      resendApiKey: RESEND_API_KEY ? "configured" : "missing",
      resendFrom: RESEND_FROM,
    });
    // Don't throw - allow form submission to succeed even if email fails
    // This ensures the submission is stored in database
    console.warn("[Contact API] Email sending failed but submission was stored. Check Resend configuration.");
  }
}

/**
 * Send email using Resend API (ONLY method - SMTP removed)
 * LOCKED SENDER IDENTITY: All emails use locked sender format
 * From: "AstroSetu AI" <no-reply@mindveda.net>
 * Reply-To: privacy@mindveda.net (or custom if provided)
 */
async function sendEmail(data: {
  apiKey: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const emailPayload: {
    to: string;
    from: string;
    subject: string;
    html: string;
    reply_to?: string;
  } = {
    to: data.to,
    from: data.from, // Locked: "AstroSetu AI" <no-reply@mindveda.net>
    subject: data.subject,
    html: data.html,
  };

  // Always set reply_to (locked to privacy@mindveda.net or custom)
  if (data.replyTo) {
    emailPayload.reply_to = data.replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${data.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = errorText;
    }
    const errorMessage = typeof errorDetails === 'object' && errorDetails.message 
      ? errorDetails.message 
      : errorText;
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
    throw new Error(`Resend API error: ${response.status} - ${errorMessage}`);
  }

  const result = await response.json();
  console.log("[Contact API] Email sent successfully:", {
    id: result.id,
    to: data.to,
    from: data.from,
    subject: data.subject,
  });
}

/**
 * Generate auto-reply email HTML (Compliance-focused, no SLA promises)
 */
function generateAutoReplyEmail(name: string, subject: string, category: string): string {
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
          <p>Thank you for your compliance request regarding: <strong>${subject}</strong></p>
          <p>${responseMessage}</p>
          
          <div class="notice">
            <p><strong>Automated Compliance Mailbox:</strong> This is an automated acknowledgement. AstroSetu AI does not provide live support. Please refer to <a href="https://astrosetu.app/ai-astrology/faq">FAQs</a> and policies for self-service information.</p>
            <p><strong>No individual response is guaranteed.</strong> Requests are reviewed periodically as required by applicable privacy laws.</p>
          </div>
          
          <p>For self-help resources, please visit:</p>
          <ul>
            <li><a href="https://astrosetu.app/faq">Help & FAQs</a></li>
            <li><a href="https://astrosetu.app/privacy">Privacy Policy</a></li>
            <li><a href="https://astrosetu.app/terms">Terms & Conditions</a></li>
          </ul>
          
          <div class="footer">
            <p>Best regards,<br>The AstroSetu Compliance Team</p>
            <p><em>This is an automated response. Please do not reply to this email. For compliance matters, use the contact form on our website.</em></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate admin notification email HTML
 */
function generateAdminNotificationEmail(data: {
  submissionId: string | null;
  name?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
}): string {
  const { submissionId, name, email, phone, subject, message, category } = data;

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
        .category-support { background: #fef3c7; color: #92400e; }
        .category-bug { background: #fee2e2; color: #991b1b; }
        .category-feedback { background: #dbeafe; color: #1e40af; }
        .category-partnership { background: #e0e7ff; color: #3730a3; }
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
            <div class="value">${submissionId || "N/A"}</div>
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
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="action-button">Reply to ${name || email}</a>
          <div class="footer">
            <p>This email was automatically generated from the AstroSetu contact form.</p>
            <p>Reply to this email to respond directly to ${name || email}.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}


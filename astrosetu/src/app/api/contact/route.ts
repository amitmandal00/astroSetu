import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize, getClientIP } from "@/lib/apiHelpers";
import { z } from "zod";

const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  category: z.enum(["general", "support", "feedback", "bug", "partnership", "other"]).optional(),
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

    // Get client IP for spam detection
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get("user-agent") || "";

    // Auto-categorize based on subject/message content
    const autoCategory = categorizeMessage(subject, message, category);

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
            name,
            email,
            phone: phone || null,
            subject,
            message,
            category: autoCategory,
            ip_address: clientIP,
            user_agent: userAgent,
            status: "new",
            metadata: {
              auto_categorized: category !== autoCategory,
              original_category: category,
            },
          })
          .select()
          .single();

        if (dbError) {
          console.error("[Contact API] Database error:", dbError);
          // Continue anyway - email will still be sent
        } else {
          submissionId = submission?.id || null;
        }
      } catch (dbError) {
        console.error("[Contact API] Database storage failed:", dbError);
        // Continue anyway - email will still be sent
      }
    }

    // Send automated emails (fire and forget - don't block response)
    sendContactNotifications({
      submissionId,
      name,
      email,
      phone,
      subject,
      message,
      category: autoCategory,
    }).catch((error) => {
      console.error("[Contact API] Email notification failed:", error);
      // Don't fail the request if email fails
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          message: "Thank you for contacting us! We'll get back to you soon.",
          submissionId,
          autoReplySent: true,
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
): "general" | "support" | "feedback" | "bug" | "partnership" | "other" {
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
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
}): Promise<void> {
  const { submissionId, name, email, phone, subject, message, category } = data;

  // Use Resend API if configured, otherwise log for manual processing
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@astrosetu.app";
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || SUPPORT_EMAIL;

  if (!RESEND_API_KEY) {
    // No email service configured - log for manual processing
    console.log("[Contact API] Email service not configured. Submission details:", {
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
    // Send auto-reply to user
    await sendEmail({
      apiKey: RESEND_API_KEY,
      to: email,
      from: `AstroSetu Support <${SUPPORT_EMAIL}>`,
      subject: `Thank you for contacting AstroSetu - ${subject}`,
      html: generateAutoReplyEmail(name, subject, category),
    });

    // Send notification to admin
    await sendEmail({
      apiKey: RESEND_API_KEY,
      to: ADMIN_EMAIL,
      from: `AstroSetu Contact Form <${SUPPORT_EMAIL}>`,
      subject: `[${category.toUpperCase()}] New Contact: ${subject}`,
      html: generateAdminNotificationEmail({
        submissionId,
        name,
        email,
        phone,
        subject,
        message,
        category,
      }),
      replyTo: email, // Allow admin to reply directly
    });

    console.log(`[Contact API] Emails sent for submission: ${submissionId || email}`);
  } catch (error) {
    console.error("[Contact API] Email sending failed:", error);
    throw error;
  }
}

/**
 * Send email using Resend API
 */
async function sendEmail(data: {
  apiKey: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${data.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: data.to,
      from: data.from,
      subject: data.subject,
      html: data.html,
      reply_to: data.replyTo,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${error}`);
  }
}

/**
 * Generate auto-reply email HTML
 */
function generateAutoReplyEmail(name: string, subject: string, category: string): string {
  const categoryMessages: Record<string, string> = {
    support: "Our support team will review your request and get back to you within 24-48 hours.",
    bug: "Thank you for reporting this issue. Our technical team will investigate and address it promptly.",
    feedback: "Thank you for your feedback! We appreciate your input and will consider it for future improvements.",
    partnership: "Thank you for your interest in partnership. Our business development team will review your inquiry.",
    general: "We have received your message and will respond as soon as possible.",
    other: "We have received your message and will review it shortly.",
  };

  const responseMessage = categoryMessages[category] || categoryMessages.general;

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
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting AstroSetu</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for reaching out to us regarding: <strong>${subject}</strong></p>
          <p>${responseMessage}</p>
          <p>We typically respond within 24-48 hours during business hours (Monday-Friday, 9 AM - 6 PM IST).</p>
          <p>If you have an urgent matter, please call us at +91 800 123 4567 or reach out via WhatsApp.</p>
          <div class="footer">
            <p>Best regards,<br>The AstroSetu Team</p>
            <p>This is an automated response. Please do not reply to this email.</p>
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
  name: string;
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
            <div class="value">${name}</div>
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
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="action-button">Reply to ${name}</a>
          <div class="footer">
            <p>This email was automatically generated from the AstroSetu contact form.</p>
            <p>Reply to this email to respond directly to ${name}.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}


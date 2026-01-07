/**
 * Invoice Generation API
 * Generates ABN-compliant invoices for AI Astrology report purchases
 */

import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { generateInvoiceData, generateInvoiceHTML, generateInvoiceText } from "@/lib/ai-astrology/invoice";
import { z } from "zod";

const InvoiceRequestSchema = z.object({
  customerEmail: z.string().email(),
  amount: z.number().int().positive(),
  currency: z.string().optional().default("aud"),
  reportType: z.string().optional(),
  sessionId: z.string().optional(),
  paymentMethod: z.string().optional().default("Online (Stripe)"),
  paymentStatus: z.enum(["Paid", "Pending", "Failed"]).optional().default("Paid"),
  format: z.enum(["html", "text", "json"]).optional().default("html"),
});

/**
 * POST /api/ai-astrology/invoice
 * Generate invoice for a purchase
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/invoice");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Parse and validate request body
    const json = await parseJsonBody(req);
    const validated = InvoiceRequestSchema.parse(json);

    const { customerEmail, amount, currency, reportType, sessionId, paymentMethod, paymentStatus, format } = validated;

    // Generate invoice data
    const invoice = generateInvoiceData({
      customerEmail,
      amount,
      currency,
      reportType,
      sessionId,
      paymentMethod,
      paymentStatus,
    });

    // Return invoice in requested format
    if (format === "json") {
      return NextResponse.json(
        {
          ok: true,
          data: invoice,
          requestId,
        },
        {
          headers: {
            "X-Request-ID": requestId,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (format === "text") {
      const invoiceText = generateInvoiceText(invoice);
      return new NextResponse(invoiceText, {
        status: 200,
        headers: {
          "X-Request-ID": requestId,
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `inline; filename="invoice-${invoice.invoice.invoiceNumber}.txt"`,
        },
      });
    } else {
      // Default: HTML format
      const invoiceHTML = generateInvoiceHTML(invoice);
      return new NextResponse(invoiceHTML, {
        status: 200,
        headers: {
          "X-Request-ID": requestId,
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="invoice-${invoice.invoice.invoiceNumber}.html"`,
        },
      });
    }
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}


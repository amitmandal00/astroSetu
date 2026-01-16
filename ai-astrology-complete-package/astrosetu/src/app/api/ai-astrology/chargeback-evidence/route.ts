/**
 * Chargeback Evidence API
 * Provides production-ready chargeback defense text for Stripe disputes
 */

import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody } from "@/lib/apiHelpers";
import { generateRequestId } from "@/lib/requestId";
import { getChargebackEvidence, getFormattedChargebackEvidence, getChargebackEvidenceForDispute } from "@/lib/ai-astrology/chargeback-defense";
import { z } from "zod";

const ChargebackEvidenceRequestSchema = z.object({
  customerEmail: z.string().email().optional(),
  sessionId: z.string().optional(),
  reportType: z.string().optional(),
  paymentDate: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  format: z.enum(["structured", "formatted", "sections"]).optional().default("formatted"),
});

/**
 * GET /api/ai-astrology/chargeback-evidence
 * Get chargeback defense evidence text (general template)
 */
export async function GET() {
  const requestId = generateRequestId();

  try {
    const evidence = getChargebackEvidence();
    const formatted = getFormattedChargebackEvidence();

    return NextResponse.json(
      {
        ok: true,
        data: {
          evidence,
          formatted,
          instructions: {
            title: "How to Use in Stripe Dashboard",
            steps: [
              "1. Go to Stripe Dashboard → Disputes",
              "2. Select the disputed payment",
              "3. Click 'Submit Evidence'",
              "4. Copy and paste the 'formatted' text into the appropriate evidence fields",
              "5. Or use individual sections from the 'evidence' object",
            ],
          },
        },
        requestId,
      },
      {
        headers: {
          "X-Request-ID": requestId,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}

/**
 * POST /api/ai-astrology/chargeback-evidence
 * Get chargeback defense evidence with customer-specific details
 */
export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, "/api/ai-astrology/chargeback-evidence");
    if (rateLimitResponse) {
      rateLimitResponse.headers.set("X-Request-ID", requestId);
      return rateLimitResponse;
    }

    // Parse and validate request body
    const json = await parseJsonBody(req);
    const validated = ChargebackEvidenceRequestSchema.parse(json);

    const { customerEmail, sessionId, reportType, paymentDate, amount, currency, format } = validated;

    // If customer details provided, generate personalized evidence
    if (customerEmail && sessionId) {
      const evidenceData = getChargebackEvidenceForDispute({
        customerEmail,
        sessionId,
        reportType,
        paymentDate,
        amount,
        currency,
      });

      if (format === "structured") {
        return NextResponse.json(
          {
            ok: true,
            data: {
              evidence: evidenceData.evidence,
              customerDetails: evidenceData.customerDetails,
              formatted: evidenceData.formatted,
            },
            requestId,
          },
          {
            headers: {
              "X-Request-ID": requestId,
              "Content-Type": "application/json",
            },
          }
        );
      } else if (format === "sections") {
        const sections = [
          {
            title: "Product Description",
            content: evidenceData.evidence.productDescription,
            stripeField: "Product description",
          },
          {
            title: "Refund Policy",
            content: evidenceData.evidence.refundPolicy,
            stripeField: "Refund policy",
          },
          {
            title: "Service Model Disclosure",
            content: evidenceData.evidence.serviceModelDisclosure,
            stripeField: "Service documentation",
          },
          {
            title: "Proof of Delivery",
            content: evidenceData.evidence.proofOfDelivery,
            stripeField: "Proof of delivery",
          },
          {
            title: "Terms Acceptance",
            content: evidenceData.evidence.termsAcceptance,
            stripeField: "Terms acceptance",
          },
        ];

        return NextResponse.json(
          {
            ok: true,
            data: {
              sections,
              customerDetails: evidenceData.customerDetails,
              formatted: evidenceData.formatted,
            },
            requestId,
          },
          {
            headers: {
              "X-Request-ID": requestId,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Default: formatted text
        return new NextResponse(evidenceData.formatted, {
          status: 200,
          headers: {
            "X-Request-ID": requestId,
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": 'inline; filename="chargeback-evidence.txt"',
          },
        });
      }
    } else {
      // No customer details, return general template
      const evidence = getChargebackEvidence();
      const formatted = getFormattedChargebackEvidence();

      if (format === "structured") {
        return NextResponse.json(
          {
            ok: true,
            data: {
              evidence,
              formatted,
            },
            requestId,
          },
          {
            headers: {
              "X-Request-ID": requestId,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Default: formatted text
        return new NextResponse(formatted, {
          status: 200,
          headers: {
            "X-Request-ID": requestId,
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": 'inline; filename="chargeback-evidence.txt"',
          },
        });
      }
    }
  } catch (error) {
    const errorResponse = handleApiError(error);
    errorResponse.headers.set("X-Request-ID", requestId);
    return errorResponse;
  }
}


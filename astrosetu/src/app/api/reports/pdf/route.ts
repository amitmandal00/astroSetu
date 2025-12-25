import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const PDFRequestSchema = z.object({
  type: z.string().min(1).max(100),
  data: z.any(), // PDF data can be any structure
  title: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/reports/pdf');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate request size (larger for PDF data)
    validateRequestSize(req.headers.get('content-length'), 500 * 1024); // 500KB max
    
    // Parse and validate request body
    const json = await parseJsonBody<Record<string, any>>(req);
    const validated = PDFRequestSchema.parse({
      type: json.type,
      data: json.data,
      title: json.title,
    });
    
    const { type, data, title } = validated;

    // In production, use a library like jsPDF or puppeteer
    // For now, return a JSON response that can be used to generate PDF client-side
    return NextResponse.json({
      ok: true,
      data: {
        type,
        title: title || `${type} Report`,
        content: data,
        generatedAt: new Date().toISOString(),
        message: "PDF generation ready. Use jsPDF or similar library for client-side generation, or puppeteer for server-side."
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}


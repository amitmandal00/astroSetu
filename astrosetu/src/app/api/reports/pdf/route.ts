import { NextResponse } from "next/server";
import { checkRateLimit, handleApiError, parseJsonBody, validateRequestSize } from "@/lib/apiHelpers";
import { z } from "zod";

const PDFRequestSchema = z.object({
  type: z.string().min(1).max(100),
  data: z.any(), // PDF data can be any structure
  title: z.string().max(200).optional(),
  format: z.enum(["basic", "detailed", "premium"]).optional(),
  options: z.any().optional(),
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
      format: json.format || "detailed",
      options: json.options,
    });
    
    const { type, data, format, options } = validated;

    // Return data for client-side PDF generation
    // The actual PDF generation happens client-side using pdfGenerator.ts
    return NextResponse.json({
      ok: true,
      data: {
        type,
        format: format || "detailed",
        title: validated.title || `${type} Report`,
        content: data,
        options: options || {},
        generatedAt: new Date().toISOString(),
        message: "PDF data ready for client-side generation using jsPDF"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}


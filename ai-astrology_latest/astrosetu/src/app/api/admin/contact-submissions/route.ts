import { NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/admin/contact-submissions
 * Get contact form submissions for admin review
 * Requires ADMIN_API_KEY in Authorization header
 */
export async function GET(req: Request) {
  // Check authentication
  const authHeader = req.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey) {
    return NextResponse.json(
      { error: "Admin API key not configured. Set ADMIN_API_KEY environment variable." },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json(
      { error: "Unauthorized. Provide Authorization: Bearer <ADMIN_API_KEY>" },
      { status: 401 }
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      error: "Supabase not configured",
      message: "Contact submissions require database connection",
      mock: true,
    });
  }

  try {
    const supabase = createServerClient();
    
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error("Contact submissions query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions", details: error.message },
        { status: 500 }
      );
    }

    // Get summary statistics
    const { data: allSubmissions } = await supabase
      .from("contact_submissions")
      .select("status, category");

    const summary = {
      total: allSubmissions?.length || 0,
      new: allSubmissions?.filter(s => s.status === "new").length || 0,
      inProgress: allSubmissions?.filter(s => s.status === "in_progress").length || 0,
      resolved: allSubmissions?.filter(s => s.status === "resolved").length || 0,
      byCategory: {
        support: allSubmissions?.filter(s => s.category === "support").length || 0,
        bug: allSubmissions?.filter(s => s.category === "bug").length || 0,
        feedback: allSubmissions?.filter(s => s.category === "feedback").length || 0,
        partnership: allSubmissions?.filter(s => s.category === "partnership").length || 0,
        general: allSubmissions?.filter(s => s.category === "general").length || 0,
      },
    };

    return NextResponse.json({
      ok: true,
      data: {
        submissions: submissions || [],
        summary,
        pagination: {
          limit,
          offset,
          total: summary.total,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Contact submissions error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch contact submissions",
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


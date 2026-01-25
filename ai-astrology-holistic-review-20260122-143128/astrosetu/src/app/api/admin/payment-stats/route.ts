import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/admin/payment-stats
 * Get payment statistics for monitoring
 * Requires ADMIN_API_KEY in Authorization header
 */
export async function GET(req: Request) {
  // Check authentication
  const authHeader = req.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey) {
    return NextResponse.json(
      { error: "Admin API key not configured" },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json(
      { error: "Unauthorized. Provide Authorization: Bearer <ADMIN_API_KEY>" },
      { status: 401 }
    );
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      error: "Supabase not configured",
      message: "Payment stats require database connection",
      mock: true,
    });
  }

  try {
    const supabase = createServerClient();

    // Get payment stats from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // Get all credit transactions (payments) from last 24 hours
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("id, type, amount, metadata, created_at")
      .gte("created_at", yesterday.toISOString())
      .eq("type", "credit")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Payment stats query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment stats", details: error.message },
        { status: 500 }
      );
    }

    const total = transactions?.length || 0;
    
    // Count failed payments (status: failed, verified: false, or amount: 0)
    const failed = transactions?.filter(t => {
      const metadata = t.metadata as any;
      return (
        metadata?.status === "failed" ||
        metadata?.verified === false ||
        t.amount === 0 ||
        metadata?.payment_id === null
      );
    }).length || 0;

    const successful = total - failed;
    const failureRate = total > 0 ? (failed / total) * 100 : 0;

    // Alert threshold: >5% failure rate or >0 failures in high-volume scenario
    const alertThreshold = 5;
    const needsAlert = failureRate > alertThreshold || (total > 10 && failed > 0);

    // Calculate total amount processed
    const totalAmount = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const successfulAmount = transactions
      ?.filter(t => {
        const metadata = t.metadata as any;
        return !(
          metadata?.status === "failed" ||
          metadata?.verified === false ||
          t.amount === 0
        );
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return NextResponse.json({
      period: "24 hours",
      timestamp: new Date().toISOString(),
      stats: {
        total,
        successful,
        failed,
        failureRate: parseFloat(failureRate.toFixed(2)),
        totalAmount: totalAmount / 100, // Convert from paise to rupees
        successfulAmount: successfulAmount / 100,
        failedAmount: (totalAmount - successfulAmount) / 100,
      },
      alert: needsAlert,
      message: needsAlert
        ? `⚠️ Payment failure rate is ${failureRate.toFixed(2)}% - Action required`
        : total > 0
        ? `✅ Payment processing healthy - ${failureRate.toFixed(2)}% failure rate`
        : "ℹ️ No payments in last 24 hours",
      threshold: alertThreshold,
    });
  } catch (error: any) {
    console.error("Payment stats error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch payment stats",
        message: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


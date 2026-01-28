import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (e) {
    // Supabase not configured or error - return null for fallback mode
    return null;
  }
}

export async function GET(req: Request) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/wallet');
    if (rateLimitResponse) return rateLimitResponse;
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    
    // Fallback to mock data if not authenticated (for development/demo mode)
    if (!authUser) {
      return NextResponse.json({
        ok: true,
        data: {
          balance: 0,
          currency: "INR",
          transactions: []
        }
      });
    }

    // Get all transactions
    const { data: transactions, error: txnError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    if (txnError) {
      return NextResponse.json({ ok: false, error: txnError.message }, { status: 400 });
    }

    // Calculate balance
    const balance = (transactions || []).reduce((sum, txn) => {
      return sum + (txn.type === "credit" ? txn.amount : -txn.amount);
    }, 0);

    return NextResponse.json({
      ok: true,
      data: {
        balance: balance / 100, // Convert paise to rupees
        currency: "INR",
        transactions: (transactions || []).map((txn) => ({
          id: txn.id,
          type: txn.type,
          amount: txn.amount / 100, // Convert to rupees
          description: txn.description,
          timestamp: new Date(txn.created_at).getTime(),
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}


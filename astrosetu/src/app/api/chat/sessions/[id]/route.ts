import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, handleApiError } from "@/lib/apiHelpers";

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/chat/sessions');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate session ID
    if (!params.id || typeof params.id !== 'string' || params.id.length > 100) {
      return NextResponse.json({ ok: false, error: "Invalid session ID" }, { status: 400 });
    }
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    const { data: session, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", authUser.id)
      .single();

    if (error || !session) {
      return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: session.id,
        userId: session.user_id,
        astrologerId: session.astrologer_id,
        status: session.status,
        createdAt: new Date(session.started_at).getTime(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(req, '/api/chat/sessions');
    if (rateLimitResponse) return rateLimitResponse;
    
    // Validate session ID
    if (!params.id || typeof params.id !== 'string' || params.id.length > 100) {
      return NextResponse.json({ ok: false, error: "Invalid session ID" }, { status: 400 });
    }
    
    const supabase = createServerClient();
    const authUser = await getAuthenticatedUser(supabase);
    if (!authUser) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

    const json = await req.json().catch(() => ({}));
    
    if (json?.action === "end") {
      // Get session to calculate duration
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", authUser.id)
        .single();

      if (!session) {
        return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
      }

      const startedAt = new Date(session.started_at);
      const endedAt = new Date();
      const durationMinutes = Math.ceil((endedAt.getTime() - startedAt.getTime()) / (1000 * 60));
      const costPerMinute = 10; // ₹10 per minute
      const costPaise = durationMinutes * costPerMinute * 100; // Convert to paise

      // Update session
      const { data: updatedSession, error: updateError } = await supabase
        .from("chat_sessions")
        .update({
          status: "ended",
          ended_at: endedAt.toISOString(),
          duration_minutes: durationMinutes,
          cost_paise: costPaise,
        })
        .eq("id", params.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ ok: false, error: updateError.message }, { status: 400 });
      }

      // Deduct from wallet (create transaction)
      if (costPaise > 0) {
        // Get current wallet balance
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", authUser.id);

        const balance = (transactions || []).reduce((sum, txn) => {
          return sum + (txn.type === "credit" ? txn.amount : -txn.amount);
        }, 0);

        if (balance >= costPaise) {
          // Create debit transaction
          await supabase.from("transactions").insert({
            user_id: authUser.id,
            type: "debit",
            amount: costPaise,
            description: `Chat consultation - ${durationMinutes} minutes`,
            metadata: { session_id: params.id },
          });
        }
      }

      return NextResponse.json({
        ok: true,
        data: {
          id: updatedSession.id,
          userId: updatedSession.user_id,
          astrologerId: updatedSession.astrologer_id,
          status: updatedSession.status,
          createdAt: new Date(updatedSession.started_at).getTime(),
        },
      });
    }

    return NextResponse.json({ ok: false, error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import { ChatMessageCreateSchema } from "@/lib/validators";
import { createServerClient } from "@/lib/supabase";
import { astrologers } from "@/lib/mockAstrologers";
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

    const { searchParams } = new URL(req.url);
    const after = searchParams.get("after");

    // Verify session belongs to user
    const { data: session } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", params.id)
      .eq("user_id", authUser.id)
      .single();

    if (!session) {
      return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
    }

    // Get messages
    let query = supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", params.id)
      .order("created_at", { ascending: true });

    if (after) {
      const afterDate = new Date(Number(after));
      query = query.gt("created_at", afterDate.toISOString());
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      return NextResponse.json({ ok: false, error: messagesError.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      data: (messages || []).map((msg) => ({
        id: msg.id,
        sessionId: msg.session_id,
        sender: msg.sender,
        text: msg.text,
        createdAt: new Date(msg.created_at).getTime(),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
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

    // Verify session belongs to user and is active
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", authUser.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "active") {
      return NextResponse.json({ ok: false, error: "Session ended" }, { status: 400 });
    }

    const json = await req.json();
    const input = ChatMessageCreateSchema.parse(json);

    // Add message
    const { data: message, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: params.id,
        sender: input.sender,
        text: input.text,
      })
      .select()
      .single();

    if (messageError) {
      return NextResponse.json({ ok: false, error: messageError.message }, { status: 400 });
    }

    // Auto-reply from astrologer if user sent message
    if (input.sender === "user") {
      const astro = astrologers.find((a) => a.id === session.astrologer_id);
      const reply = `(${astro?.name ?? "Astrologer"}): Thanks. Please confirm DOB, TOB, place, and the main question (marriage/career/finance/health).`;
      
      await supabase.from("chat_messages").insert({
        session_id: params.id,
        sender: "astrologer",
        text: reply,
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: message.id,
        sessionId: message.session_id,
        sender: message.sender,
        text: message.text,
        createdAt: new Date(message.created_at).getTime(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

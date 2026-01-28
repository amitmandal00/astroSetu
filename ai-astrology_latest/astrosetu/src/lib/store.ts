import type { ChatMessage, ChatSession } from "@/types/astrology";

type StoreShape = { sessions: Record<string, ChatSession>; messages: Record<string, ChatMessage[]> };

function getGlobalStore(): StoreShape {
  const g = globalThis as unknown as { __astrosetuStore?: StoreShape };
  if (!g.__astrosetuStore) g.__astrosetuStore = { sessions: {}, messages: {} };
  return g.__astrosetuStore;
}

export const store = {
  createSession(input: Omit<ChatSession, "id" | "createdAt" | "status">) {
    const s = getGlobalStore();
    const id = crypto.randomUUID();
    s.sessions[id] = { id, status: "active", createdAt: Date.now(), ...input };
    s.messages[id] = [{
      id: crypto.randomUUID(),
      sessionId: id,
      sender: "system",
      text: "Welcome to AstroSetu. Share your DOB, TOB, place, and your question to begin.",
      createdAt: Date.now()
    }];
    return s.sessions[id];
  },
  getSession(id: string) {
    return getGlobalStore().sessions[id] ?? null;
  },
  endSession(id: string) {
    const s = getGlobalStore();
    const sess = s.sessions[id];
    if (!sess) return null;
    sess.status = "ended";
    return sess;
  },
  addMessage(sessionId: string, sender: ChatMessage["sender"], text: string) {
    const s = getGlobalStore();
    if (!s.messages[sessionId]) s.messages[sessionId] = [];
    const msg: ChatMessage = { id: crypto.randomUUID(), sessionId, sender, text, createdAt: Date.now() };
    s.messages[sessionId].push(msg);
    return msg;
  },
  listMessages(sessionId: string, after?: number) {
    const all = getGlobalStore().messages[sessionId] ?? [];
    if (!after) return all;
    return all.filter(m => m.createdAt > after);
  }
};

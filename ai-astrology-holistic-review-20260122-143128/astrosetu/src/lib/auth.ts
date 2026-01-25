import type { User, BirthDetails } from "@/types/astrology";

type AuthStoreShape = { users: Record<string, User>; currentUserId: string | null };

function getAuthStore(): AuthStoreShape {
  const g = globalThis as unknown as { __astrosetuAuth?: AuthStoreShape };
  if (!g.__astrosetuAuth) {
    g.__astrosetuAuth = { users: {}, currentUserId: null };
    // Create demo user
    const demoId = "user-demo-1";
    g.__astrosetuAuth.users[demoId] = {
      id: demoId,
      name: "Demo User",
      email: "demo@astrosetu.com",
      phone: "+91 9876543210",
      createdAt: Date.now(),
      savedKundlis: [],
      savedMatches: []
    };
    g.__astrosetuAuth.currentUserId = demoId;
  }
  return g.__astrosetuAuth;
}

export const auth = {
  getCurrentUser(): User | null {
    const store = getAuthStore();
    if (!store.currentUserId) return null;
    return store.users[store.currentUserId] ?? null;
  },
  register(name: string, email: string, phone?: string): User {
    const store = getAuthStore();
    const id = `user-${crypto.randomUUID()}`;
    const user: User = {
      id,
      name,
      email,
      phone,
      createdAt: Date.now(),
      savedKundlis: [],
      savedMatches: []
    };
    store.users[id] = user;
    store.currentUserId = id;
    return user;
  },
  login(email: string): User | null {
    const store = getAuthStore();
    const user = Object.values(store.users).find(u => u.email === email);
    if (!user) return null;
    store.currentUserId = user.id;
    return user;
  },
  logout() {
    const store = getAuthStore();
    store.currentUserId = null;
  },
  updateProfile(updates: Partial<User>): User | null {
    const store = getAuthStore();
    if (!store.currentUserId) return null;
    const user = store.users[store.currentUserId];
    if (!user) return null;
    store.users[store.currentUserId] = { ...user, ...updates };
    return store.users[store.currentUserId];
  },
  saveBirthDetails(birthDetails: BirthDetails): User | null {
    const store = getAuthStore();
    if (!store.currentUserId) return null;
    const user = store.users[store.currentUserId];
    if (!user) return null;
    store.users[store.currentUserId] = { ...user, birthDetails };
    return store.users[store.currentUserId];
  }
};


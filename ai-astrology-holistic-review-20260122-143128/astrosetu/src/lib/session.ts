"use client";

import type { User, BirthDetails, KundliResult } from "@/types/astrology";

const SESSION_KEY = "astrosetu_session";
const USER_KEY = "astrosetu_user";
const BIRTH_DETAILS_KEY = "astrosetu_birth_details";
const SAVED_KUNDLIS_KEY = "astrosetu_saved_kundlis";
const REMEMBER_ME_KEY = "astrosetu_remember_me";
const GOALS_KEY = "astrosetu_goals";

// Session expiration times
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export const session = {
  // Save user session with "Remember me" support
  save(user: User, rememberMe: boolean = false) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        userId: user.id,
        email: user.email,
        timestamp: Date.now(),
        rememberMe
      }));
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
      
      // Save birth details if available
      if (user.birthDetails) {
        localStorage.setItem(BIRTH_DETAILS_KEY, JSON.stringify(user.birthDetails));
      }
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  },

  // Get current user from session
  getUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      const user = JSON.parse(userStr) as User;
      
      // Check if session is still valid
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const rememberMe = session.rememberMe || localStorage.getItem(REMEMBER_ME_KEY) === "true";
        const maxAge = rememberMe ? REMEMBER_ME_DURATION : DEFAULT_SESSION_DURATION;
        const age = Date.now() - session.timestamp;
        
        if (age > maxAge) {
          // Session expired
          this.clear();
          return null;
        }
      }
      
      // Load birth details from localStorage if not in user object
      if (!user.birthDetails) {
        const birthDetailsStr = localStorage.getItem(BIRTH_DETAILS_KEY);
        if (birthDetailsStr) {
          try {
            user.birthDetails = JSON.parse(birthDetailsStr);
          } catch (e) {
            console.error("Failed to parse birth details:", e);
          }
        }
      }
      
      return user;
    } catch (e) {
      console.error("Failed to get session:", e);
      return null;
    }
  },

  // Check if user is logged in
  isAuthenticated(): boolean {
    return this.getUser() !== null;
  },

  // Clear session
  clear() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error("Failed to clear session:", e);
    }
  },

  // Update user in session
  updateUser(updates: Partial<User>) {
    const user = this.getUser();
    if (!user) return;
    const updated = { ...user, ...updates };
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    this.save(updated, rememberMe);
  },

  // Save birth details
  saveBirthDetails(birthDetails: BirthDetails) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(BIRTH_DETAILS_KEY, JSON.stringify(birthDetails));
      // Also update user object
      const user = this.getUser();
      if (user) {
        this.updateUser({ birthDetails });
      }
    } catch (e) {
      console.error("Failed to save birth details:", e);
    }
  },

  // Get saved birth details
  getBirthDetails(): BirthDetails | null {
    if (typeof window === "undefined") return null;
    try {
      const user = this.getUser();
      if (user?.birthDetails) {
        return user.birthDetails;
      }
      const birthDetailsStr = localStorage.getItem(BIRTH_DETAILS_KEY);
      if (birthDetailsStr) {
        return JSON.parse(birthDetailsStr) as BirthDetails;
      }
      return null;
    } catch (e) {
      console.error("Failed to get birth details:", e);
      return null;
    }
  },

  // Save Kundli result
  saveKundli(kundli: KundliResult & { birthDetails?: BirthDetails; name?: string }) {
    if (typeof window === "undefined") return;
    try {
      const savedKundlis = this.getSavedKundlis();
      const newKundli = {
        ...kundli,
        id: `kundli-${Date.now()}`,
        savedAt: Date.now(),
        name: kundli.name || "My Kundli",
      };
      savedKundlis.unshift(newKundli); // Add to beginning
      // Keep only last 10 Kundlis
      const limitedKundlis = savedKundlis.slice(0, 10);
      localStorage.setItem(SAVED_KUNDLIS_KEY, JSON.stringify(limitedKundlis));
      
      // Update user object
      const user = this.getUser();
      if (user) {
        this.updateUser({
          savedKundlis: limitedKundlis.map(k => k.id || ""),
        });
      }
    } catch (e) {
      console.error("Failed to save Kundli:", e);
    }
  },

  // Get saved Kundlis
  getSavedKundlis(): Array<KundliResult & { id?: string; savedAt?: number; name?: string; birthDetails?: BirthDetails }> {
    if (typeof window === "undefined") return [];
    try {
      const kundlisStr = localStorage.getItem(SAVED_KUNDLIS_KEY);
      if (kundlisStr) {
        return JSON.parse(kundlisStr);
      }
      return [];
    } catch (e) {
      console.error("Failed to get saved Kundlis:", e);
      return [];
    }
  },

  // Get latest Kundli
  getLatestKundli(): (KundliResult & { id?: string; savedAt?: number; name?: string; birthDetails?: BirthDetails }) | null {
    const kundlis = this.getSavedKundlis();
    return kundlis.length > 0 ? kundlis[0] : null;
  },

  // Check if "Remember me" is enabled
  isRememberMe(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(REMEMBER_ME_KEY) === "true";
  },

  // Save user goals (e.g. ["marriage","career"])
  saveGoals(goals: string[]) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
      } catch (e) {
        console.error("Failed to save goals:", e);
      }
    }
  },

  getGoals(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(GOALS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to get goals:", e);
      return [];
    }
  }
};


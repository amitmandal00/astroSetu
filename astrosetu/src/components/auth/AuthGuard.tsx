"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { session } from "@/lib/session";
import type { User } from "@/types/astrology";
import { apiGet } from "@/lib/http";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
};

export function AuthGuard({ children, requireAuth = false, redirectTo = "/login" }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkAuth() {
      // Check local session first
      const localUser = session.getUser();
      if (localUser) {
        setUser(localUser);
        setLoading(false);
        return;
      }

      // If no local session, check server
      try {
        const res = await apiGet<{ ok: boolean; data?: User; error?: string }>("/api/auth/me");
        if (res.ok && res.data) {
          session.save(res.data);
          setUser(res.data);
        } else if (requireAuth) {
          router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (e) {
        if (requireAuth) {
          router.push(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [requireAuth, redirectTo, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div>
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}


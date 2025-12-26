"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect /reports/life to /lifereport
 * This maintains backward compatibility with footer links
 */
export default function LifeReportRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/lifereport");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600 mx-auto mb-4"></div>
        <div className="text-slate-600">Redirecting to Life Report...</div>
      </div>
    </div>
  );
}


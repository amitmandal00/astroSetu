/**
 * AI Astrology Section Layout
 * Dedicated layout for all AI astrology pages
 * Includes autonomous header and footer (no human support elements)
 */

import type { ReactNode } from "react";
import { AIHeader } from "@/components/ai-astrology/AIHeader";
import { AIFooter } from "@/components/ai-astrology/AIFooter";

export default function AIAstrologyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AIHeader />
      <main className="flex-1">
        {children}
      </main>
      <AIFooter />
    </div>
  );
}


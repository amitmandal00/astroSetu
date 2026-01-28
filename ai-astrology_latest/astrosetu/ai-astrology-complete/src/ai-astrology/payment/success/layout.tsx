// Layout segment config to force dynamic rendering for this route
// This prevents Next.js from statically generating the success page
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

import type { ReactNode } from "react";

export default function PaymentSuccessLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}


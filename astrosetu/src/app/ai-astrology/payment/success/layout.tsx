// Layout segment config to force dynamic rendering for this route
// This prevents Next.js from statically generating the success page
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


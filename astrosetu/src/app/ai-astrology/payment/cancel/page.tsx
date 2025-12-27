/**
 * Payment Cancelled Page
 * Shown when user cancels Stripe checkout
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-3xl font-bold mb-4 text-amber-900">Payment Cancelled</h1>
            <p className="text-lg text-amber-800 mb-8">
              Your payment was cancelled. No charges were made.
            </p>
            
            <div className="space-y-4">
              <p className="text-slate-700">
                You can try again anytime, or explore our free Life Summary report.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/ai-astrology">
                  <Button className="bg-purple-600 hover:bg-purple-700 px-8">
                    Back to AI Astrology
                  </Button>
                </Link>
                <Link href="/ai-astrology/input">
                  <Button variant="secondary" className="px-8">
                    Get Free Life Summary
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


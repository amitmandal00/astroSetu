"use client";

import { clsx } from "clsx";

export function HeaderPattern({ className }: { className?: string }) {
  return (
    <div className={clsx("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Geometric shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full blur-2xl" />
      
      {/* Decorative lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 100" preserveAspectRatio="none">
        <path
          d="M 0 50 Q 100 30, 200 50 T 400 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white"
        />
        <path
          d="M 0 60 Q 100 40, 200 60 T 400 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-white"
        />
      </svg>

      {/* Dot pattern overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />
    </div>
  );
}


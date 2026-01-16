"use client";

import { clsx } from "clsx";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={clsx("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={clsx(
          "border-4 border-saffron-200 border-t-saffron-500 rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
      {text && <div className="text-sm text-slate-600">{text}</div>}
    </div>
  );
}


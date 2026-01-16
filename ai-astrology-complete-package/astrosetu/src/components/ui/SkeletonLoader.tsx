/**
 * Skeleton Loader Component
 * Provides smooth loading placeholders instead of spinners (P1 enhancement)
 */

"use client";

import { clsx } from "clsx";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  lines?: number; // For text variant
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className,
  variant = "rectangular",
  lines,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]";

  if (variant === "text" && lines) {
    return (
      <div className={clsx("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              baseClasses,
              "h-4 rounded"
            )}
            style={{
              width: i === lines - 1 ? "75%" : "100%",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circular") {
    return (
      <div
        className={clsx(baseClasses, "rounded-full", className)}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }}
      />
    );
  }

  return (
    <div
      className={clsx(baseClasses, className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
      }}
    />
  );
}

/**
 * Skeleton Card - Pre-built skeleton for card layouts
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx("rounded-2xl bg-white border-2 border-slate-200 p-5 sm:p-6", className)}>
      <SkeletonLoader width="60%" height={24} borderRadius={12} className="mb-4" />
      <SkeletonLoader variant="text" lines={3} className="mb-4" />
      <div className="flex gap-2 mt-4">
        <SkeletonLoader width={80} height={24} borderRadius={12} />
        <SkeletonLoader width={100} height={24} borderRadius={12} />
      </div>
    </div>
  );
}

/**
 * Skeleton Chart - Pre-built skeleton for chart layouts
 */
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={clsx("rounded-xl bg-white border-2 border-slate-200 p-6", className)}>
      <SkeletonLoader width="40%" height={20} borderRadius={8} className="mb-4" />
      <div className="grid grid-cols-4 gap-3 mt-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonLoader
            key={i}
            variant="rectangular"
            width="100%"
            height={80}
            borderRadius={12}
          />
        ))}
      </div>
      <SkeletonLoader width="50%" height={16} borderRadius={8} className="mt-6 mx-auto" />
    </div>
  );
}


import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red" | "amber" | "indigo";
  className?: string;
}) {
  const styles =
    tone === "green"
      ? "bg-emerald-600 text-white border-2 border-emerald-700 shadow-md"
      : tone === "red"
        ? "bg-rose-600 text-white border-2 border-rose-700 shadow-md"
        : tone === "amber"
          ? "bg-amber-600 text-white border-2 border-amber-700 shadow-md"
          : tone === "indigo"
            ? "bg-indigo-600 text-white border-2 border-indigo-700 shadow-md"
            : "bg-slate-600 text-white border-2 border-slate-700 shadow-md";
  return <span className={clsx("inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-extrabold", styles, className)}>{children}</span>;
}

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
      ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300 shadow-sm"
      : tone === "red"
        ? "bg-rose-100 text-rose-800 border-2 border-rose-300 shadow-sm"
        : tone === "amber"
          ? "bg-amber-100 text-amber-900 border-2 border-amber-300 shadow-sm"
          : tone === "indigo"
            ? "bg-indigo-100 text-indigo-800 border-2 border-indigo-300 shadow-sm"
            : "bg-slate-100 text-slate-800 border-2 border-slate-300 shadow-sm";
  return <span className={clsx("inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold", styles, className)}>{children}</span>;
}

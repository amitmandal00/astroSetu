"use client";

import { clsx } from "clsx";

export function Tabs({
  value,
  onChange,
  items
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string; icon?: string }[];
}) {
  return (
    <div className="inline-flex rounded-2xl bg-white p-1 border border-slate-200 shadow-sm">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onChange(it.value)}
          className={clsx(
            "px-4 py-2 text-sm font-semibold rounded-xl transition flex items-center gap-2",
            value === it.value 
              ? "bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 text-white shadow-md" 
              : "text-slate-600 hover:text-slate-900 bg-transparent"
          )}
          type="button"
        >
          {it.icon && <span className="text-base">{it.icon}</span>}
          {it.label}
        </button>
      ))}
    </div>
  );
}

import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", type = "button", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-base font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:ring-offset-2";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-saffron-600 via-amber-600 to-orange-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-[1.02] hover:from-saffron-700 hover:via-amber-700 hover:to-orange-700 border-2 border-saffron-700/30"
      : variant === "secondary"
        ? "bg-white text-slate-800 border-2 border-slate-400 hover:border-saffron-500 hover:bg-saffron-50 shadow-md hover:shadow-lg font-semibold"
        : "bg-white/80 text-slate-700 hover:bg-saffron-50 hover:text-slate-900 font-semibold border border-slate-300 shadow-sm";
  return (
    <button 
      type={type} 
      className={clsx(base, styles, className)} 
      {...props}
      role={props.role || "button"}
      aria-disabled={props.disabled}
    />
  );
}

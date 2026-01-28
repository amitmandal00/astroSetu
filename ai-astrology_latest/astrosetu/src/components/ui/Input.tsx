import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-xl border-2 border-slate-400 bg-white text-slate-900 px-4 py-3 text-base outline-none transition-all shadow-sm",
          "focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 focus:bg-white focus:shadow-md",
          "hover:border-slate-500 hover:bg-white hover:shadow-sm",
          "placeholder:text-slate-500",
          "disabled:bg-slate-100 disabled:border-slate-300 disabled:cursor-not-allowed disabled:text-slate-600",
          "appearance-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

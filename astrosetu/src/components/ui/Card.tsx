import type { ReactNode, MouseEvent } from "react";
import { clsx } from "clsx";
import { HeaderPattern } from "./HeaderPattern";

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: (e: MouseEvent<HTMLDivElement>) => void }) {
  return (
    <div
      className={clsx(
        // Base card style – enhanced contrast with stronger borders and shadows
        "rounded-3xl bg-white border-2 border-slate-300 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden",
        "backdrop-blur-sm",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ eyebrow, title, subtitle, icon }: { eyebrow?: string; title: string; subtitle?: string; icon?: string }) {
  return (
    <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b-2 border-indigo-600/50 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden shadow-xl">
      <HeaderPattern />
      {/* Spiritual symbol */}
      <div className="absolute top-2 right-4 text-xl opacity-30">ॐ</div>
      <div className="relative z-10">
        {eyebrow ? (
          <div className="inline-flex items-center gap-2 text-xs font-bold text-white mb-3 px-3 py-1.5 rounded-full bg-white/30 border-2 border-white/40 shadow-md">
            <span>✨</span>
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          {icon && <span className="text-3xl drop-shadow-lg">{icon}</span>}
          <div className="flex-1">
            <div className="text-2xl font-bold tracking-tight text-white mb-1 drop-shadow-md">{title}</div>
            {subtitle ? <div className="text-sm text-white leading-relaxed drop-shadow-sm">{subtitle}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("px-5 sm:px-6 pb-5 sm:pb-6 card-enhanced", className)}>{children}</div>;
}

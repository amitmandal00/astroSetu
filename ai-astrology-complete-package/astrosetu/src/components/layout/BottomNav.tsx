"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const bottomNavItems = [
  { href: "/kundli", label: "Kundli", icon: "🔮" },
  { href: "/match", label: "Match", icon: "💑" },
  { href: "/panchang", label: "Panchang", icon: "📿" },
  { href: "/numerology", label: "Numerology", icon: "🔢" }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-soft lg:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-14 sm:h-16 max-w-md mx-auto px-1 sm:px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-0.5 transition-all relative",
                "active:scale-95 touch-manipulation", // Touch feedback and optimization
                isActive
                  ? "text-saffron-600"
                  : "text-slate-500 active:text-saffron-600"
              )}
            >
              <div className={clsx(
                "absolute inset-0 rounded-t-xl sm:rounded-t-2xl transition-all",
                isActive ? "bg-gradient-to-b from-saffron-100 to-transparent" : ""
              )} />
              <span className={clsx(
                "text-xl sm:text-2xl relative z-10 transition-transform",
                isActive && "scale-110"
              )}>{item.icon}</span>
              <span className={clsx(
                "text-[9px] sm:text-[10px] font-semibold relative z-10 transition-all leading-tight text-center",
                isActive ? "font-bold text-saffron-700" : "text-slate-500"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r from-saffron-500 via-amber-500 to-saffron-500 rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


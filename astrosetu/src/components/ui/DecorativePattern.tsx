import type { ReactNode } from "react";

type PatternProps = {
  variant?: "dots" | "grid" | "waves" | "stars" | "mandala";
  className?: string;
  children?: ReactNode;
};

export function DecorativePattern({ variant = "dots", className = "", children }: PatternProps) {
  const patterns = {
    dots: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
        <defs>
          <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    ),
    grid: (
      <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100">
        <defs>
          <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    ),
    waves: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 200">
        <defs>
          <pattern id="waves" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 20 Q 10 0, 20 20 T 40 20" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" />
      </svg>
    ),
    stars: (
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
        <defs>
          <pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 12 7 L 20 7 L 13 12 L 15 20 L 10 15 L 5 20 L 7 12 L 0 7 L 8 7 Z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)" />
      </svg>
    ),
    mandala: (
      <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 200 200">
        <defs>
          <pattern id="mandala" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="25" cy="25" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="25" cy="25" r="2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mandala)" />
      </svg>
    )
  };

  return (
    <div className={`relative ${className}`}>
      {patterns[variant]}
      {children}
    </div>
  );
}


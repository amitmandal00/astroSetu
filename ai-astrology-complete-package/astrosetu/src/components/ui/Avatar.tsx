"use client";

import Image from "next/image";
import { clsx } from "clsx";

type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
};

const sizeClasses = {
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-lg",
  lg: "w-24 h-24 text-2xl",
  xl: "w-32 h-32 text-3xl"
};

export function Avatar({ name, src, size = "md", className = "", online }: AvatarProps) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate avatar from name if no image provided
  const avatarUrl = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9333ea&color=fff&size=128&bold=true`;

  return (
    <div className={clsx("relative inline-block", className)}>
      <div className={clsx(
        "rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden",
        sizeClasses[size]
      )}>
        {src ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {online !== undefined && (
        <div className={clsx(
          "absolute bottom-0 right-0 rounded-full border-2 border-white",
          online ? "bg-green-500" : "bg-gray-400",
          size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"
        )} />
      )}
    </div>
  );
}


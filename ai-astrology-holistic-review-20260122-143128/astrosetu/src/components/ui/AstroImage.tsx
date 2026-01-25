"use client";

import Image from "next/image";
import { clsx } from "clsx";
import { useState } from "react";

type AstroImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
};

export function AstroImage({ src, alt, width = 400, height = 300, className = "", fallback }: AstroImageProps) {
  const [imageSrc, setImageSrc] = useState(src || fallback || `https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=${width}&h=${height}&fit=crop&q=80`);
  
  return (
    <div className={clsx("relative overflow-hidden rounded-2xl", className)}>
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        unoptimized={false}
        onError={() => {
          // Fallback to placeholder if image fails to load
          if (fallback && imageSrc !== fallback) {
            setImageSrc(fallback);
          } else if (imageSrc !== `https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=${width}&h=${height}&fit=crop&q=80`) {
            setImageSrc(`https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=${width}&h=${height}&fit=crop&q=80`);
          }
        }}
      />
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}


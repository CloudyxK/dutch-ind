"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ImageWithShimmer({ className, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-brand-gray-800 animate-pulse" />
      )}
      <Image
        {...props}
        className={cn(className, "transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

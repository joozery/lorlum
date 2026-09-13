"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  videoUrl?: string;
  intervalMs?: number;
}

export function HeroBackground({ images, videoUrl, intervalMs = 6000 }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (videoUrl || images.length < 2) return;
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs, videoUrl]);

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Hero background"
          fill
          className="object-cover transition-opacity duration-[1200ms]"
          style={{ opacity: i === active ? 1 : 0 }}
          unoptimized
          priority={i === 0}
        />
      ))}
    </>
  );
}

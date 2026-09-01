"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  intervalMs?: number;
}

export function HeroBackground({ images, intervalMs = 6000 }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

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

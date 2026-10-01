"use client";

import { useState } from "react";

// Photography is the emotion of the House: always large enough to matter,
// always cropped with intent, never decorated.

export interface PictureSource {
  url: string | null;
  alt: string;
}

interface Props {
  src: PictureSource | string;
  alt?: string;
  /** CSS aspect-ratio, e.g. "4 / 5". Omit to fill the parent. */
  aspect?: string;
  /** object-position, to keep the subject in frame. */
  position?: string;
  className?: string;
  priority?: boolean;
  /** A sealed memory: the picture is there, but not yet for you. */
  veiled?: boolean;
  hover?: boolean;
}

export function Picture({ src, alt, aspect, position = "50% 50%", className = "", priority, veiled, hover }: Props) {
  const url = typeof src === "string" ? src : src.url;
  const text = alt ?? (typeof src === "string" ? "" : src.alt);
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`photo ${hover ? "photo-hover" : ""} ${className}`} style={{ aspectRatio: aspect }}>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- photography may come from any storage host
        <img
          src={url}
          alt={veiled ? "" : text}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          ref={(el) => {
            if (el?.complete) setLoaded(true);
          }}
          onLoad={() => setLoaded(true)}
          style={{
            objectPosition: position,
            opacity: loaded ? 1 : 0,
            filter: veiled ? "blur(18px) saturate(0.6) brightness(0.9)" : undefined,
            transform: veiled ? "scale(1.12)" : undefined,
            transition: "opacity 1200ms cubic-bezier(.22,.61,.24,1), transform 1600ms cubic-bezier(.22,.61,.24,1)",
          }}
        />
      )}
    </div>
  );
}

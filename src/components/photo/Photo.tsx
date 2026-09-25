"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { MediaView } from "@/lib/house/compose";
import { Scene } from "@/components/objects/Scene";

// Photography belongs to the room, not to the page: prints lie on surfaces,
// Polaroids carry handwriting, frames hang on plaster, a full-bleed image is a
// window. One component, several physical forms.

export type PhotoForm = "print" | "polaroid" | "framed" | "bleed";

interface Props {
  media: Pick<MediaView, "url" | "scene" | "alt"> & { caption?: string | null };
  form?: PhotoForm;
  /** Handwritten on the Polaroid's margin. */
  note?: string | null;
  /** The camera's orange date imprint, e.g. "'26 9 12". */
  stamp?: string | null;
  /** Develop from white the first time it is seen. */
  develop?: boolean;
  aspect?: string;
  className?: string;
  sizes?: string;
}

export function PhotoImage({ media, aspect, className = "", develop, sizes }: Pick<Props, "media" | "aspect" | "className" | "develop" | "sizes">) {
  const reduce = useReducedMotion();
  const inner = media.url ? (
    // eslint-disable-next-line @next/next/no-img-element -- photography may live on any storage host; sizes are controlled by the source
    <img src={media.url} alt={media.alt} loading="lazy" decoding="async" sizes={sizes} className="h-full w-full object-cover" draggable={false} />
  ) : (
    <Scene scene={media.scene ?? "linen"} role="img" aria-label={media.alt} className="block h-full w-full" />
  );
  return (
    <motion.div
      className={`relative overflow-hidden bg-[#2b221b] ${className}`}
      style={{ aspectRatio: aspect }}
      initial={develop && !reduce ? { filter: "brightness(2.1) contrast(0.4) sepia(0.8) blur(6px)" } : false}
      whileInView={develop ? { filter: "brightness(1) contrast(1) sepia(0) blur(0px)" } : undefined}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 3.2, ease: [0.22, 0.61, 0.24, 1] }}
    >
      {inner}
    </motion.div>
  );
}

/** The orange date a film camera burns into the corner of the frame. */
export function DateStamp({ children }: { children: string }) {
  return (
    <span
      className="type pointer-events-none absolute bottom-[5%] right-[5%] text-[max(0.45rem,4cqw)] font-bold tracking-[0.12em] text-[#ff9a4d]"
      style={{ textShadow: "0 0 6px rgba(255,120,40,0.8)", mixBlendMode: "screen" }}
    >
      {children}
    </span>
  );
}

export function Photo({ media, form = "print", note, stamp, develop, aspect, className = "", sizes }: Props) {
  switch (form) {
    case "polaroid":
      return (
        <figure className={`tex-paper @container relative p-[6%] pb-[22%] ${className}`} style={{ backgroundColor: "#f4f1ea" }}>
          <div className="@container relative">
            <PhotoImage media={media} aspect="1 / 1" develop={develop} sizes={sizes} />
            {stamp && <DateStamp>{stamp}</DateStamp>}
            {/* the slightly glossy surface of instant film */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.12),transparent_40%)]" />
          </div>
          {note && (
            <figcaption className="hand absolute inset-x-[7%] bottom-[6%] truncate text-[7.5cqw] leading-none text-[#2b2620]">
              {note}
            </figcaption>
          )}
        </figure>
      );
    case "framed":
      return (
        <figure className={`relative bg-[#3a2a1e] p-[3.5%] shadow-[0_2px_3px_rgba(0,0,0,0.3),0_22px_40px_-16px_rgba(40,24,10,0.55)] ${className}`}>
          <div className="tex-paper p-[9%]" style={{ backgroundColor: "#f3eee4", boxShadow: "inset 0 1px 4px rgba(0,0,0,0.25)" }}>
            <PhotoImage media={media} aspect={aspect ?? "4 / 5"} develop={develop} sizes={sizes} />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.14),transparent_35%)]" />
        </figure>
      );
    case "bleed":
      return (
        <figure className={`relative ${className}`}>
          <PhotoImage media={media} aspect={aspect ?? "21 / 9"} develop={develop} className="w-full" sizes="100vw" />
          <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.35)]" />
          {media.caption && <figcaption className="type absolute bottom-3 left-4 text-[0.72rem] text-white/80">{media.caption}</figcaption>}
        </figure>
      );
    default:
      return (
        <figure className={`relative bg-[#f6f3ec] p-[3.5%] ${className}`}>
          <div className="@container relative">
            <PhotoImage media={media} aspect={aspect ?? "4 / 3"} develop={develop} sizes={sizes} />
            {stamp && <DateStamp>{stamp}</DateStamp>}
          </div>
          {media.caption && <figcaption className="type mt-[3%] text-[0.72rem] leading-snug text-[#4f463c]">{media.caption}</figcaption>}
        </figure>
      );
  }
}

/** "'26 9 12" — how a film camera writes a date. */
export function cameraDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", { year: "2-digit", month: "numeric", day: "numeric", timeZone: "Europe/Paris" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `'${get("year")} ${Number(get("month"))} ${Number(get("day"))}`;
}

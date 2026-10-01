"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { BlockView, ObjectView } from "@/lib/house/compose";
import { dateTime } from "@/lib/house/light";
import { useMounted } from "@/lib/use-mounted";
import { Picture } from "@/components/ui/Picture";
import { MemoryBody } from "./MemoryBody";

/** The first photograph a memory holds: its cover. */
export function coverOf(o: ObjectView) {
  const b = o.memory?.blocks.find((x) => x.type === "photos");
  return b && b.type === "photos" ? (b.photos[0] ?? null) : null;
}

/** The first lines of its text, for an index. */
export function excerptOf(o: ObjectView) {
  const b = o.memory?.blocks.find((x) => x.type === "note");
  return b && b.type === "note" ? b.text.split(/\n/)[0] : null;
}

/**
 * Opening a memory: a quiet page slides over the room. The essentials first;
 * "Remember more" for the rest. Closing returns you exactly where you were.
 */
export function MemoryEntry({ object, onClose, roomName = "The Memory Room" }: { object: ObjectView; onClose: () => void; roomName?: string }) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const m = object.memory;
  const sealed = object.state === "sealed";
  const cover = coverOf(object);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  if (!mounted) return null;

  // Essentials: the words. The rest waits for "Remember more".
  const blocks = m?.blocks ?? [];
  const firstPhotos = blocks.findIndex((b) => b.type === "photos");
  const rest: BlockView[] = blocks
    .map((b, i) => (i === firstPhotos && b.type === "photos" ? { ...b, photos: b.photos.slice(1) } : b))
    .filter((b) => !(b.type === "photos" && b.photos.length === 0));
  const essentials: BlockView[] = rest.filter((b) => b.type === "note").slice(0, 1);
  const remaining = rest.filter((b) => !essentials.includes(b));
  const chapter = [object.chapter?.label, m?.location_label].filter(Boolean).join(" · ");
  const when = dateTime(m?.occurred_at ?? null);

  return createPortal(
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={object.title}
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-ivory text-ink outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.24, 1] }}
    >
      <div className="grain" aria-hidden />
      <div className="sticky top-0 z-10 flex items-center justify-between bg-ivory/90 px-6 py-5 backdrop-blur-sm sm:px-10 lg:px-14">
        <p className="eyebrow muted">{roomName}</p>
        <button type="button" onClick={onClose} className="eyebrow transition-opacity hover:opacity-60">
          Close
        </button>
      </div>

      <motion.article
        className="mx-auto grid max-w-[84rem] gap-12 px-6 pb-28 pt-6 sm:px-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:px-14"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
      >
        <div className="lg:sticky lg:top-24 lg:self-start">
          {cover ? (
            <Picture src={cover} aspect="4 / 5" priority veiled={sealed} />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center bg-paper">
              <p className="lede max-w-[14rem] text-center text-[1.6rem] muted">{object.title}</p>
            </div>
          )}
          {cover?.caption && !sealed && <p className="mt-4 text-[1rem] italic muted">{cover.caption}</p>}
        </div>

        <div className="max-w-[36rem] lg:pt-6">
          {chapter && <p className="eyebrow muted">{chapter}</p>}
          <h1 className="display mt-6 text-[2.8rem] sm:text-[3.6rem]">{m?.title ?? object.title}</h1>
          {when && !sealed && <p className="meta mt-6 text-[0.72rem]">{when}</p>}
          <div className="my-10 h-px w-14 bg-ink/30" />

          {sealed ? (
            <div>
              <p className="lede text-[1.9rem]">{object.sealed_hint ?? "Not yet."}</p>
              <p className="mt-6 text-[1.15rem] muted">Some things here are kept until the right moment. Nothing needs to be done; it will open on its own.</p>
            </div>
          ) : (
            <>
              {object.caption && <p className="lede text-[1.5rem] muted">{object.caption}</p>}
              {essentials.length > 0 && (
                <div className="mt-10">
                  <MemoryBody blocks={essentials} />
                </div>
              )}
              {remaining.length > 0 && !more && (
                <button type="button" onClick={() => setMore(true)} className="btn-primary mt-14">
                  Remember more <span aria-hidden>→</span>
                </button>
              )}
              {more && (
                <motion.div className="mt-16" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}>
                  <MemoryBody blocks={remaining} />
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.article>
    </motion.div>,
    document.body,
  );
}

"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { shortDate } from "@/lib/house/light";
import { Blocks } from "./Blocks";
import { ASPECT, ObjectArt, Thread } from "./ObjectArt";
import { sceneOf } from "./ObjectFigure";
import { useMounted } from "@/lib/use-mounted";

/** Picking an object up. It grows toward you, and what it holds unfolds beside it. */
export function MemorySheet({ object, onClose }: { object: ObjectView; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const sealed = object.state === "sealed";
  const m = object.memory;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => ref.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, [onClose]);

  if (!mounted) return null;

  const meta = [m?.location_label, shortDate(m?.occurred_at ?? null)].filter(Boolean).join(" · ");

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={object.title}>
      <motion.div
        className="absolute inset-0 bg-[#0c0b0a]/80 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
        onClick={onClose}
      />
      <motion.div
        ref={ref}
        tabIndex={-1}
        className="absolute inset-0 overflow-y-auto overscroll-contain outline-none sm:inset-x-6 sm:inset-y-6 lg:inset-x-[max(2rem,calc(50vw-36rem))]"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
      >
        <article className="paper relative min-h-full text-ink sm:min-h-0">
          <div className="grain !absolute" aria-hidden style={{ opacity: 0.06 }} />
          <button
            type="button"
            onClick={onClose}
            className="caps sticky top-0 z-10 ml-auto flex w-full justify-end bg-gradient-to-b from-[#f7f3ec] via-[#f7f3ec]/90 to-transparent px-6 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-ink-soft transition-colors hover:text-ink sm:px-10 sm:pt-7"
          >
            Put it back
          </button>

          <div className="grid gap-12 px-6 pb-20 sm:px-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:pb-24 lg:px-16">
            {/* the object, held */}
            <div className="md:sticky md:top-20 md:self-start">
              <motion.div
                layoutId={`object-${object.id}`}
                className="relative mx-auto w-[min(72vw,20rem)] text-ink md:w-full md:max-w-[22rem]"
                style={{ aspectRatio: ASPECT[object.kind] ?? 1.3, rotate: (object.placement.rotate ?? 0) / 3 }}
              >
                <div className="h-full w-full drop-shadow-[0_18px_22px_rgba(28,26,23,0.25)]">
                  <ObjectArt kind={object.kind} label={object.label} scene={sceneOf(object)} />
                </div>
                {sealed && <Thread tight />}
              </motion.div>
              {object.caption && <p className="mx-auto mt-10 max-w-sm text-center text-lg italic leading-snug text-ink-soft md:text-left">{object.caption}</p>}
            </div>

            {/* what it holds */}
            <div className="max-w-[38rem]">
              {object.chapter && <p className="caps text-ink-faint">{object.chapter.label}</p>}
              <h2 className="mt-4 text-[2.4rem] font-light leading-[1.05] tracking-[-0.01em] sm:text-[3.1rem]">
                {m?.title ?? object.title}
              </h2>
              {meta && <p className="type mt-4 text-[0.8rem] text-ink-soft">{meta}</p>}
              <div className="mt-8 h-px w-16 bg-ink/25" />

              <div className="mt-10">
                {sealed ? (
                  <div className="space-y-4">
                    <p className="text-2xl italic leading-snug">{object.sealed_hint ?? "Tied with thread."}</p>
                    <p className="text-ink-soft">
                      Some things in the House are kept until the right moment. Nothing needs to be done. It will open on its own.
                    </p>
                  </div>
                ) : m ? (
                  <Blocks blocks={m.blocks} />
                ) : (
                  <p className="italic text-ink-soft">Nothing more is written about this. It is enough that it is here.</p>
                )}
              </div>
            </div>
          </div>
        </article>
      </motion.div>
    </div>,
    document.body,
  );
}

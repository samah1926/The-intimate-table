"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { useMounted } from "@/lib/use-mounted";
import { Thread } from "./ObjectArt";
import { Fragments } from "./Fragments";
import { PHYSICAL_ASPECT, Physical } from "./Physical";

// Picking something up. Not a modal: the room dims, the object comes toward
// you, a tag tied to it says when it was. "Remember more" lays out what else it
// holds. Putting it back returns it exactly where it was lying.

const when = (iso: string | null) => {
  if (!iso) return { date: null, time: null };
  const d = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(d),
    time: new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Paris" }).format(d),
  };
};

export function MemoryFocus({ object, onClose }: { object: ObjectView; onClose: () => void }) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const sealed = object.state === "sealed";
  const m = object.memory;
  const aspect = PHYSICAL_ASPECT[object.kind] ?? 1.3;
  const { date, time } = when(m?.occurred_at ?? null);

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

  // Sized by height for tall things, by width for long ones.
  const width = more ? `min(19rem, 70vw, calc(34vh * ${aspect}))` : `min(34rem, 82vw, calc(56vh * ${aspect}))`;

  return createPortal(
    <div className="fixed inset-0 z-[70] text-[#f0e5d4]" role="dialog" aria-modal="true" aria-label={object.title}>
      {/* the room goes out of focus behind */}
      <motion.div
        className="absolute inset-0 bg-[#140d08]/70 backdrop-blur-[6px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6 } }}
        transition={{ duration: 0.9 }}
        onClick={onClose}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(55% 50% at 50% 38%, rgba(255,210,150,0.16), transparent 70%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <div ref={ref} tabIndex={-1} className="absolute inset-0 overflow-y-auto overscroll-contain outline-none" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="mx-auto flex min-h-full max-w-6xl flex-col px-5 pb-24 pt-[max(4.5rem,env(safe-area-inset-top))] sm:px-10">
          <motion.button
            type="button"
            onClick={onClose}
            className="label fixed right-5 top-[max(1.25rem,env(safe-area-inset-top))] z-10 opacity-70 hover:opacity-100 sm:right-10 sm:top-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
          >
            Put it back
          </motion.button>

          <motion.div layout className={`flex w-full flex-col items-center ${more ? "md:flex-row md:items-start md:gap-14" : "my-auto"}`} transition={{ duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}>
            {/* the object, held */}
            <motion.div layout className={`flex shrink-0 flex-col items-center ${more ? "md:sticky md:top-20" : ""}`}>
              <div className="relative">
                <motion.div
                  layoutId={`object-${object.id}`}
                  className="on-surface relative"
                  style={{ width, aspectRatio: aspect, rotate: -1 }}
                  transition={{ duration: 0.95, ease: [0.22, 0.61, 0.24, 1] }}
                >
                  <Physical object={object} large />
                  {sealed && <Thread tight />}
                </motion.div>
                <Tag chapter={object.chapter?.label ?? null} date={date} time={time} hint={sealed ? object.sealed_hint : null} />
              </div>

              <motion.div className="mt-16 max-w-md text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.2 } }} transition={{ delay: 0.6, duration: 0.9 }}>
                <h2 className="text-[1.9rem] font-light italic leading-tight sm:text-[2.3rem]">{m?.title ?? object.title}</h2>
                {object.caption && <p className="mt-3 text-[1.1rem] leading-snug text-[#cdbba5]">{object.caption}</p>}
                {sealed ? (
                  <p className="mt-6 text-[1.05rem] text-[#cdbba5]">Some things here are kept until the right moment. It will open on its own.</p>
                ) : (
                  m &&
                  m.blocks.length > 0 &&
                  !more && (
                    <button type="button" onClick={() => setMore(true)} className="group mt-8 inline-flex flex-col items-center text-[1.2rem] italic">
                      remember more
                      <span className="mt-1 h-px w-8 bg-current opacity-40 transition-all duration-700 group-hover:w-24 group-hover:opacity-80" />
                    </button>
                  )
                )}
              </motion.div>
            </motion.div>

            {/* what else it holds, laid out on the table */}
            {more && m && (
              <motion.div className="mt-16 w-full min-w-0 flex-1 md:mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }} transition={{ duration: 0.6 }}>
                <Fragments blocks={m.blocks} skipFirstPhoto={object.kind === "photograph"} occurredAt={m.occurred_at} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** A manila tag, tied to the object with a length of thread. */
function Tag({ chapter, date, time, hint }: { chapter: string | null; date: string | null; time: string | null; hint: string | null }) {
  if (!chapter && !date && !hint) return null;
  return (
    <motion.div
      className="absolute -right-3 -top-7 z-10 w-40 sm:-right-28 sm:-top-4 sm:w-44"
      initial={{ opacity: 0, rotate: 4, y: -10 }}
      animate={{ opacity: 1, rotate: 9, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ delay: 0.55, duration: 1, ease: [0.22, 0.61, 0.24, 1] }}
      style={{ transformOrigin: "0% 50%" }}
    >
      <svg className="absolute -left-10 top-1/2 h-10 w-12 -translate-y-1/2 overflow-visible" viewBox="0 0 48 40" aria-hidden>
        <path d="M2 4 C18 2 20 30 44 20" fill="none" stroke="#151311" strokeWidth="1" />
      </svg>
      <div
        className="tex-paper relative py-3 pl-8 pr-4 text-[#2a2118] shadow-[0_10px_18px_-10px_rgba(0,0,0,0.7)]"
        style={{ backgroundColor: "#d9bf8f", clipPath: "polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 70%, 0 30%)" }}
      >
        <span className="absolute left-[9%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#140d08] ring-2 ring-[#c4a672]" />
        {hint ? (
          <p className="text-[1rem] italic leading-tight">{hint}</p>
        ) : (
          <>
            {chapter && <p className="caps text-[0.52rem] leading-snug">{chapter}</p>}
            {date && <p className="type mt-1.5 text-[0.72rem]">{date}</p>}
            {time && <p className="type text-[0.72rem]">{time}</p>}
          </>
        )}
      </div>
    </motion.div>
  );
}

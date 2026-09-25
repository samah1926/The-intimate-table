"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { markSeen } from "@/app/house/actions";
import type { KnowledgeView } from "@/lib/house/compose";
import { useMounted } from "@/lib/use-mounted";
import { Thread } from "@/components/objects/ObjectArt";
import { Traces } from "@/components/objects/Traces";

// Books on a shelf, notebooks and cards on the desk.
// Not a blog: you take something down, read it, and put it back.

/** Books that haven't been opened to you. They have no titles yet. */
const UNOPENED = [
  { h: 74, bg: "#2b302c" },
  { h: 82, bg: "#3a2f27" },
  { h: 68, bg: "#2f3531" },
  { h: 88, bg: "#1f2422" },
  { h: 70, bg: "#4a3b2f" },
  { h: 78, bg: "#2a2e2b", lean: 9 },
];

const TONE: Record<string, { bg: string; ink: string }> = {
  ink: { bg: "#23272a", ink: "#e9e3d4" },
  clay: { bg: "#7c503a", ink: "#f1e6d6" },
  moss: { bg: "#3c4a3b", ink: "#e9e3d4" },
  bone: { bg: "#e4ddcf", ink: "#1c1a17" },
  linen: { bg: "#cfc3ad", ink: "#1c1a17" },
};

export function Library({ items, initialOpen }: { items: KnowledgeView[]; initialOpen?: string | null }) {
  const [openSlug, setOpenSlug] = useState<string | null>(initialOpen ?? null);
  const [, start] = useTransition();
  const open = items.find((k) => k.slug === openSlug) ?? null;
  const books = items.filter((k) => k.kind === "book" || k.kind === "audio" || k.kind === "letter");
  const desk = items.filter((k) => !books.includes(k));

  const take = (k: KnowledgeView) => {
    setOpenSlug(k.slug);
    const url = new URL(window.location.href);
    url.searchParams.set("open", k.slug);
    window.history.pushState(null, "", url);
    if (k.isNew && k.state === "open") start(() => markSeen("knowledge_item", k.id));
  };
  const putBack = useCallback(() => {
    setOpenSlug(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("open");
    window.history.replaceState(null, "", url);
  }, []);

  return (
    <>
      {books.length > 0 && (
        <section aria-label="The shelf" className="relative mx-auto max-w-6xl px-5 pt-20 sm:px-10 sm:pt-24">
          <div aria-hidden className="pointer-events-none absolute -top-10 left-[12%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(241,220,168,0.13),transparent)]" />
          <div className="scroll-quiet -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max items-end gap-2.5 sm:gap-3.5">
              {books.map((k, i) => (
                <motion.li key={k.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.1, duration: 1, ease: [0.22, 0.61, 0.24, 1] }}>
                  <Spine item={k} onOpen={() => take(k)} />
                </motion.li>
              ))}
              {UNOPENED.map((b, i) => (
                <li key={i} aria-hidden>
                  <div
                    className="w-[1.4rem] shadow-[inset_-3px_0_6px_rgba(0,0,0,0.3)] sm:w-[1.9rem]"
                    style={{ height: `calc(${b.h / 100} * var(--shelf-h, 13rem))`, background: b.bg, opacity: 0.55, transform: b.lean ? `rotate(${b.lean}deg)` : undefined, transformOrigin: "bottom left" }}
                  />
                </li>
              ))}
            </ul>
          </div>
          {/* the shelf itself */}
          <div aria-hidden className="tex-wood h-3 shadow-[0_18px_30px_-10px_rgba(40,30,20,0.55)]" style={{ backgroundSize: "600px" }} />
        </section>
      )}

      {desk.length > 0 && (
        <section aria-label="On the desk" className="relative mx-auto mt-24 max-w-6xl sm:px-10">
          <p className="label muted px-5 sm:px-0">On the desk</p>
          {/* an oak desk under the window: someone was reading here */}
          <div className="relative mt-6 overflow-hidden px-6 pb-14 pt-12 sm:px-12">
            <div aria-hidden className="tex-wood absolute inset-0" style={{ backgroundSize: "700px" }} />
            <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(236,214,178,0.62), rgba(196,160,118,0.5) 60%, rgba(150,118,84,0.5))", mixBlendMode: "screen" }} />
            <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(60% 90% at 10% 30%, rgba(255,252,240,0.35), transparent 70%)" }} />
            <div className="hidden sm:block">
              <Traces room="library" />
            </div>
            <div className="sm:hidden">
              <Traces room="library" mobile />
            </div>
          <ul className="relative flex flex-wrap gap-x-12 gap-y-12">
            {desk.map((k, i) => (
              <motion.li key={k.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.12, duration: 1 }}>
                <DeskItem item={k} onOpen={() => take(k)} />
              </motion.li>
            ))}
          </ul>
          </div>
        </section>
      )}

      <AnimatePresence>{open && <Reading key={open.id} item={open} onClose={putBack} />}</AnimatePresence>
    </>
  );
}

function Spine({ item, onOpen }: { item: KnowledgeView; onOpen: () => void }) {
  const tone = TONE[item.spine.tone ?? "ink"];
  const sealed = item.state === "sealed";
  const h = item.spine.height ?? 88;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`lit group relative block ${item.isNew ? "is-new" : ""}`}
      aria-label={sealed ? `${item.subject} — tied with thread` : `${item.title}, ${item.author ?? item.subject}`}
    >
      <div
        className="relative flex w-[3.2rem] items-center justify-center overflow-hidden shadow-[inset_-4px_0_8px_rgba(0,0,0,0.25),inset_3px_0_4px_rgba(255,255,255,0.08)] transition-transform duration-700 ease-[var(--ease-house)] group-hover:-translate-y-3 group-focus-visible:-translate-y-3 sm:w-[3.8rem]"
        style={{ height: `calc(${h / 100} * var(--shelf-h, 13rem))`, background: tone.bg, color: tone.ink }}
      >
        <span className="caps max-h-[82%] text-[0.58rem] leading-[1.7] tracking-[0.22em] [writing-mode:vertical-rl] sm:text-[0.62rem]" style={{ transform: "rotate(180deg)" }}>
          {sealed ? item.subject : item.title}
        </span>
        <span aria-hidden className="absolute inset-x-1.5 top-4 h-px bg-current opacity-40" />
        <span aria-hidden className="absolute inset-x-1.5 bottom-4 h-px bg-current opacity-40" />
        {sealed && <Thread tight />}
      </div>
    </button>
  );
}

function DeskItem({ item, onOpen }: { item: KnowledgeView; onOpen: () => void }) {
  const sealed = item.state === "sealed";
  if (item.kind === "notebook") {
    return (
      <button type="button" onClick={onOpen} className={`lit group relative block text-left ${item.isNew ? "is-new" : ""}`}>
        <div className="relative h-52 w-40 rotate-[-3deg] bg-[#cfc3ad] px-5 py-6 text-[#1c1a17] shadow-[0_18px_26px_-12px_rgba(0,0,0,0.7)] transition-transform duration-700 group-hover:-translate-y-1">
          <span aria-hidden className="absolute inset-y-0 right-6 w-[3px] bg-[#1c1a17]/80" />
          <p className="caps text-[0.56rem] leading-relaxed">{item.title}</p>
          <p className="hand mt-24 text-2xl">notes</p>
          {sealed && <Thread tight />}
        </div>
        <p className="label mt-5 text-[#2a2118] opacity-80">{item.subject}</p>
      </button>
    );
  }
  return (
    <button type="button" onClick={onOpen} className={`lit group relative block text-left ${item.isNew ? "is-new" : ""}`}>
      <div className="relative h-36 w-56 rotate-[2deg] bg-[repeating-linear-gradient(to_bottom,#f6f2ea_0,#f6f2ea_1.2rem,#b8c8d4_1.2rem,#b8c8d4_calc(1.2rem+1px))] px-5 pb-4 pt-7 text-[#1c1a17] shadow-[0_16px_24px_-12px_rgba(0,0,0,0.7)] transition-transform duration-700 group-hover:-translate-y-1">
        <span aria-hidden className="absolute inset-x-0 top-6 h-px bg-[#c9867a]" />
        <p className="type text-[0.78rem] leading-[1.2rem]">{item.title}</p>
        {sealed && <Thread tight />}
      </div>
      <p className="label mt-5 text-[#2a2118] opacity-80">{item.subject}</p>
    </button>
  );
}

function Reading({ item, onClose }: { item: KnowledgeView; onClose: () => void }) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);
  const sealed = item.state === "sealed";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => ref.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;
  const typed = item.kind === "notebook" || item.kind === "card";

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={item.title}>
      <motion.div className="absolute inset-0 bg-[#0c0b0a]/80 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        ref={ref}
        tabIndex={-1}
        className="absolute inset-0 overflow-y-auto outline-none sm:inset-y-6"
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
        style={{ transformPerspective: 1200 }}
      >
        <article className="paper relative mx-auto min-h-full max-w-2xl px-7 pb-24 pt-[max(1.5rem,env(safe-area-inset-top))] sm:min-h-0 sm:px-16 sm:pt-10">
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="label text-ink-soft hover:text-ink">
              Put it back
            </button>
          </div>
          <p className="label mt-10 text-ink-faint">{item.subject}{item.chapter ? ` · ${item.chapter.label}` : ""}</p>
          <h2 className="mt-5 text-[2.4rem] font-light leading-[1.05] sm:text-[3rem]">{item.title}</h2>
          {item.author && <p className="mt-4 text-lg italic text-ink-soft">{item.author}</p>}
          <div className="mt-8 h-px w-16 bg-ink/25" />
          {sealed ? (
            <p className="mt-12 text-2xl italic leading-snug">{item.sealed_hint ?? "Tied with thread. Not yet."}</p>
          ) : (
            <>
              {item.excerpt && <p className="mt-12 text-[1.65rem] italic leading-snug text-ink">{item.excerpt}</p>}
              <div className={`mt-10 space-y-5 ${typed ? "type text-[0.93rem] leading-[1.9]" : "text-[1.22rem] leading-[1.7]"}`}>
                {(item.body ?? "").split(/\n{2,}/).map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </>
          )}
        </article>
      </motion.div>
    </div>,
    document.body,
  );
}

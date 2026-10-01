"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { markSeen } from "@/app/house/actions";
import type { KnowledgeView } from "@/lib/house/compose";
import { useMounted } from "@/lib/use-mounted";
import { Picture } from "@/components/ui/Picture";

// The Library as a table of contents: subject, title, one line. Not a blog —
// you take something down, read it, and put it back. What is not yet yours
// to read is listed, quietly, with when it will be.

const KIND: Record<string, string> = { book: "Essay", notebook: "Notebook", card: "Card", audio: "Recording", letter: "Letter" };

export function Library({ items, initialOpen }: { items: KnowledgeView[]; initialOpen?: string | null }) {
  const [openSlug, setOpenSlug] = useState<string | null>(initialOpen ?? null);
  const [, start] = useTransition();
  const open = items.find((k) => k.slug === openSlug) ?? null;

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
      <section aria-label="On the shelves">
        <div className="flex items-baseline justify-between border-b pb-5 hairline">
          <h2 className="eyebrow">On the shelves</h2>
          <span className="meta text-[0.66rem] muted">( {items.length} )</span>
        </div>
        <ol>
          {items.map((k, i) => {
            const sealed = k.state === "sealed";
            return (
              <li key={k.id} className="border-b hairline">
                <button type="button" onClick={() => take(k)} className="group grid w-full gap-2 py-9 text-left sm:grid-cols-[3rem_12rem_1fr_auto] sm:items-baseline sm:gap-8">
                  <span className="meta hidden text-[0.64rem] muted sm:block">{String(i + 1).padStart(2, "0")}</span>
                  <span className="meta text-[0.64rem] muted">{k.subject}</span>
                  <span>
                    <span className={`display block text-[1.9rem] sm:text-[2.3rem] ${sealed ? "muted" : ""}`}>{k.title}</span>
                    <span className="mt-2 block max-w-[38rem] text-[1.1rem] italic muted">{sealed ? (k.sealed_hint ?? "Not yet.") : k.excerpt}</span>
                    {k.isNew && !sealed && <span className="meta mt-3 block text-[0.6rem] text-oxblood">New on the shelf</span>}
                  </span>
                  <span aria-hidden className="hidden text-[1.1rem] muted transition-transform duration-500 group-hover:translate-x-1 sm:block">
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <AnimatePresence>{open && <Reading key={open.id} item={open} onClose={putBack} />}</AnimatePresence>
    </>
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
    const opener = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      opener?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  if (!mounted) return null;
  const cover = !sealed ? item.spine.cover : undefined;

  return createPortal(
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-ivory text-ink outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.24, 1] }}
    >
      <div className="grain" aria-hidden />
      <div className="sticky top-0 z-10 flex items-center justify-between bg-ivory/90 px-6 py-5 backdrop-blur-sm sm:px-10 lg:px-14">
        <p className="eyebrow muted">The Library</p>
        <button type="button" onClick={onClose} className="eyebrow transition-opacity hover:opacity-60">
          Put it back
        </button>
      </div>

      <motion.article
        className={`mx-auto grid max-w-[84rem] gap-12 px-6 pb-28 pt-10 sm:px-10 lg:gap-20 lg:px-14 ${cover ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]" : ""}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
      >
        {cover && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Picture src={cover} alt={item.title} aspect="4 / 5" priority />
          </div>
        )}
        <div className={cover ? "max-w-[36rem]" : "mx-auto w-full max-w-[38rem]"}>
          <p className="eyebrow muted">
            {KIND[item.kind] ?? item.kind} · {item.subject}
            {item.chapter ? ` · ${item.chapter.label}` : ""}
          </p>
          <h1 className="display mt-6 text-[2.8rem] sm:text-[3.6rem]">{item.title}</h1>
          {item.author && <p className="mt-5 text-[1.15rem] italic muted">{item.author}</p>}
          <div className="my-10 h-px w-14 bg-ink/30" />
          {sealed ? (
            <>
              <p className="lede text-[1.9rem]">{item.sealed_hint ?? "Not yet."}</p>
              <p className="mt-6 text-[1.15rem] muted">It will be here to read when the time comes. Nothing needs to be done.</p>
            </>
          ) : (
            <>
              {item.excerpt && <p className="lede text-[1.8rem] leading-snug">{item.excerpt}</p>}
              <div className={`prose-house mt-10 leading-[1.7] ${item.kind === "notebook" ? "text-[1.2rem]" : "text-[1.28rem]"}`}>
                {(item.body ?? "").split(/\n{2,}/).map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.article>
    </motion.div>,
    document.body,
  );
}

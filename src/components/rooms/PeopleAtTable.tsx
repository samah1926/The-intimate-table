"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { setConsent } from "@/app/house/actions";
import type { PlaceCardView } from "@/lib/house/compose";
import { useMounted } from "@/lib/use-mounted";

// The people you sat with, as a seating list. No profiles, no following.
// You can ask to find someone again; they only ever learn it if they asked too.

export function PeopleAtTable({ cards }: { cards: PlaceCardView[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = cards.find((c) => c.person_id === openId) ?? null;

  return (
    <>
      <ol className="grid grid-cols-1 border-t hairline sm:grid-cols-2 sm:gap-x-16">
        {cards.map((c, i) => (
          <li key={c.person_id} className="min-w-0 border-b hairline">
            <button type="button" onClick={() => setOpenId(c.person_id)} className="group flex w-full items-baseline gap-6 py-6 text-left">
              <span className="meta w-8 text-[0.64rem] muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1">
                <span className="display block text-[1.9rem]">{c.first_name}</span>
                {c.line && <span className="mt-1 block truncate text-[1.05rem] italic muted">{c.line}</span>}
              </span>
              {c.connection === "mutual" && <span className="meta text-[0.58rem] text-oxblood">Found again</span>}
              <span aria-hidden className="muted transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </button>
          </li>
        ))}
      </ol>
      <AnimatePresence>{open && <Person key={open.person_id} card={open} onClose={() => setOpenId(null)} />}</AnimatePresence>
    </>
  );
}

function Person({ card, onClose }: { card: PlaceCardView; onClose: () => void }) {
  const mounted = useMounted();
  const ref = useRef<HTMLDivElement>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={card.first_name}>
      <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        ref={ref}
        tabIndex={-1}
        className="relative max-h-[92dvh] w-full overflow-y-auto bg-ivory px-8 pb-[max(3rem,env(safe-area-inset-bottom))] pt-8 text-ink outline-none sm:max-w-xl sm:px-14 sm:py-14"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.24, 1] }}
      >
        <div className="flex items-baseline justify-between">
          <p className="eyebrow muted">
            {card.chapter.label}
            {card.role !== "guest" ? ` · ${card.role}` : ""}
          </p>
          <button type="button" onClick={onClose} className="eyebrow transition-opacity hover:opacity-60">
            Close
          </button>
        </div>
        <h2 className="display mt-12 text-[3.4rem]">{card.first_name}</h2>
        {card.line && <p className="lede mt-5 text-[1.6rem] muted">{card.line}</p>}

        <div className="mt-12 border-t pt-10 hairline">
          {card.connection === "mutual" ? (
            <>
              <p className="lede text-[1.6rem]">You both said yes.</p>
              {card.contact && <p className="mt-6 select-all text-[1.25rem]">{card.contact}</p>}
              <p className="mt-6 text-[1.05rem] italic muted">What happens next happens outside the House.</p>
            </>
          ) : card.connection === "asked" ? (
            <>
              <p className="lede text-[1.6rem]">You’d like to find {card.first_name} again.</p>
              <p className="mt-4 max-w-sm text-[1.1rem] muted">If {card.first_name} would like the same, their details will be here. If not, nobody will know you asked.</p>
              <button disabled={pending} onClick={() => start(() => setConsent(card.person_id, false))} className="btn-quiet mt-10 muted disabled:opacity-40">
                Take it back
              </button>
            </>
          ) : (
            <>
              <p className="lede text-[1.6rem]">Would you like to find {card.first_name} again?</p>
              <p className="mt-4 max-w-sm text-[1.1rem] muted">They will only know if they would like the same.</p>
              <button disabled={pending} onClick={() => start(() => setConsent(card.person_id, true))} className="btn-primary mt-10 disabled:opacity-50">
                {pending ? "Keeping it" : "Yes, I’d like that"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { setConsent } from "@/app/house/actions";
import type { PlaceCardView } from "@/lib/house/compose";
import { useMounted } from "@/lib/use-mounted";
import { renderMotif } from "@/components/objects/Motif";

// The people you sat with, as place cards. No profiles, no following.
// You can ask to find someone again; they only ever learn it if they asked too.

export function PeopleAtTable({ cards }: { cards: PlaceCardView[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = cards.find((c) => c.person_id === openId) ?? null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 sm:gap-x-12 lg:grid-cols-4 lg:px-10">
        {cards.map((c, i) => (
          <motion.li
            key={c.person_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.09, duration: 1, ease: [0.22, 0.61, 0.24, 1] }}
          >
            <button
              type="button"
              onClick={() => setOpenId(c.person_id)}
              className="group relative mx-auto block w-full max-w-[7.5rem] sm:max-w-[8.5rem]"
              style={{ transform: `rotate(${[-3, 2, -1.5, 3.5, -2.5, 1, 2.5, -3.5][i % 8]}deg) translateY(${[0, 14, -6, 8, 18, -4, 6, 12][i % 8]}px)` }}
              aria-label={`${c.first_name}${c.role !== "guest" ? `, ${c.role}` : ""}`}
            >
              <Card card={c} />
            </button>
          </motion.li>
        ))}
      </ul>
      <AnimatePresence>{open && <PersonSheet key={open.person_id} card={open} onClose={() => setOpenId(null)} />}</AnimatePresence>
    </>
  );
}

function Card({ card, large = false }: { card: PlaceCardView; large?: boolean }) {
  return (
    <div className="relative pt-12 transition-transform duration-700 ease-[var(--ease-house)] group-hover:-translate-y-1">
      <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 drop-shadow-[0_6px_6px_rgba(0,0,0,0.35)]">
        <svg width={large ? 104 : 76} height={large ? 104 : 76} viewBox="0 0 40 40" aria-hidden>
          {renderMotif(card.motif)}
        </svg>
      </div>
      <div
        className={`tex-paper flex aspect-[5/7] items-center justify-center text-[#231d17] shadow-[0_2px_2px_rgba(0,0,0,0.35),0_18px_26px_-12px_rgba(0,0,0,0.65)] ${large ? "w-48" : "w-full"}`}
        style={{ backgroundColor: "#efe8da", filter: large ? undefined : "sepia(0.12) brightness(0.93)" }}
      >
        <span className={`caps ${large ? "text-[0.95rem]" : "text-[0.74rem]"} tracking-[0.34em]`}>{card.first_name}</span>
      </div>
    </div>
  );
}

function PersonSheet({ card, onClose }: { card: PlaceCardView; onClose: () => void }) {
  const mounted = useMounted();
  const [pending, start] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={card.first_name}>
      <motion.div className="absolute inset-0 bg-[#0c0b0a]/75 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative max-h-[92dvh] w-full overflow-y-auto bg-[#2a1f18] px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 text-[#efe6d8] sm:max-w-lg sm:px-12 sm:py-12"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 0.61, 0.24, 1] }}
      >
        <button type="button" onClick={onClose} className="label absolute right-6 top-6 opacity-60 hover:opacity-100">
          Close
        </button>
        <div className="flex justify-center pt-4">
          <Card card={card} large />
        </div>
        <div className="mt-10 text-center">
          <p className="label text-[#a8998a]">
            {card.chapter.label}
            {card.role !== "guest" ? ` · ${card.role}` : ""}
          </p>
          {card.line && <p className="mx-auto mt-5 max-w-xs text-[1.45rem] font-light italic leading-snug">{card.line}</p>}
        </div>

        <div className="mt-10 border-t border-[#efe6d8]/15 pt-8 text-center">
          {card.connection === "mutual" ? (
            <>
              <p className="text-xl italic">You both said yes.</p>
              {card.contact && <p className="type mt-5 select-all text-[0.95rem]">{card.contact}</p>}
              <p className="mt-6 text-base text-[#a8998a]">What happens next happens outside the House.</p>
            </>
          ) : card.connection === "asked" ? (
            <>
              <p className="text-xl italic">You’d like to find {card.first_name} again.</p>
              <p className="mx-auto mt-3 max-w-xs text-base text-[#a8998a]">If {card.first_name} would like the same, their details will be here. If not, nobody will know you asked.</p>
              <button disabled={pending} onClick={() => start(() => setConsent(card.person_id, false))} className="label mt-7 opacity-50 hover:opacity-90">
                Take it back
              </button>
            </>
          ) : (
            <>
              <p className="text-xl italic">Would you like to find {card.first_name} again?</p>
              <p className="mx-auto mt-3 max-w-xs text-base text-[#a8998a]">They will only know if they would like the same.</p>
              <button
                disabled={pending}
                onClick={() => start(() => setConsent(card.person_id, true))}
                className="label mt-7 border-b border-[#efe6d8]/40 pb-1 transition-colors hover:border-[#efe6d8] disabled:opacity-40"
              >
                {pending ? "…" : "Yes, I’d like that"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

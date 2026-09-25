"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LetterView } from "@/lib/house/compose";

/** Black, then a sliver of light that widens as the door opens. Then a letter, lit from the gap. */
export function UnmarkedDoor({ letters }: { letters: LetterView[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(245,228,192,0.16)_35%,rgba(245,228,192,0.22)_50%,rgba(245,228,192,0.16)_65%,transparent)]"
        initial={{ width: "0.2rem", opacity: 0.9 }}
        animate={{ width: reduce ? "46rem" : ["0.2rem", "0.2rem", "46rem"], opacity: 1 }}
        transition={{ duration: 3.4, times: [0, 0.35, 1], ease: [0.65, 0, 0.35, 1] }}
      />
      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-32">
        {letters.length === 0 ? (
          <motion.p className="text-center text-2xl italic" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 2.4, duration: 1.4 }}>
            The room is empty. Something will be here.
          </motion.p>
        ) : (
          letters.map((l, i) => (
            <motion.article
              key={l.id}
              className="paper relative px-8 py-12 sm:px-12 sm:py-14"
              initial={{ opacity: 0, y: 24, filter: "brightness(0.2)" }}
              animate={{ opacity: 1, y: 0, filter: "brightness(1)" }}
              transition={{ delay: 2.2 + i * 0.4, duration: 2, ease: [0.22, 0.61, 0.24, 1] }}
            >
              {l.title && <p className="caps text-center text-ink-soft">{l.title}</p>}
              <div className="type mt-8 space-y-5 text-[0.92rem] leading-[1.85]">
                {l.body.split(/\n{2,}/).map((p, j) => (
                  <p key={j} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
              {l.signature && <p className="mt-10 text-right text-lg italic text-ink-soft">{l.signature}</p>}
            </motion.article>
          ))
        )}
        <motion.p
          className="type mt-12 text-center text-[0.72rem]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 4.2, duration: 1.5 }}
        >
          This door is only here for some people. Please don’t describe it.
        </motion.p>
      </div>
    </div>
  );
}

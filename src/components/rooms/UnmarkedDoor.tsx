"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LetterView } from "@/lib/house/compose";

/** Darkness, then a narrow band of warm light. Then a letter, set in it. */
export function UnmarkedDoor({ letters }: { letters: LetterView[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(245,228,192,0.06)_30%,rgba(245,228,192,0.09)_50%,rgba(245,228,192,0.06)_70%,transparent)]"
        initial={{ width: "1px", opacity: 0.9 }}
        animate={{ width: reduce ? "44rem" : ["1px", "1px", "44rem"], opacity: 1 }}
        transition={{ duration: 3, times: [0, 0.3, 1], ease: [0.65, 0, 0.35, 1] }}
      />
      <div className="relative mx-auto flex min-h-dvh max-w-[36rem] flex-col justify-center px-6 py-32">
        {letters.length === 0 ? (
          <motion.p className="lede text-center text-[1.9rem]" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 2, duration: 1.4 }}>
            The room is empty. Something will be here.
          </motion.p>
        ) : (
          letters.map((l, i) => (
            <motion.article
              key={l.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 + i * 0.4, duration: 1.8, ease: [0.22, 0.61, 0.24, 1] }}
            >
              {l.title && <p className="eyebrow text-center opacity-60">{l.title}</p>}
              <div className="prose-house mt-10 text-[1.35rem] leading-[1.75]">
                {l.body.split(/\n{2,}/).map((p, j) => (
                  <p key={j} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
              </div>
              {l.signature && <p className="lede mt-10 text-right text-[1.4rem] opacity-70">{l.signature}</p>}
            </motion.article>
          ))
        )}
        <motion.p className="meta mt-20 text-center text-[0.6rem]" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 4, duration: 1.5 }}>
          This door is only here for some people. Please don’t describe it.
        </motion.p>
      </div>
    </div>
  );
}

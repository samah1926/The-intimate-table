"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LetterView } from "@/lib/house/compose";

/** A typewritten letter from the House, rising slowly out of the machine. */
export function Letter({ letter, delay = 0.3 }: { letter: LetterView; delay?: number }) {
  const reduce = useReducedMotion();
  const paragraphs = letter.body.split(/\n{2,}/);
  return (
    <motion.article
      className="paper relative mx-auto w-full max-w-[34rem] px-7 pb-12 pt-12 sm:px-14 sm:pb-16 sm:pt-16"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, clipPath: "inset(100% 0 0 0)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
      transition={{ delay, duration: 1.6, ease: [0.22, 0.61, 0.24, 1] }}
    >
      {letter.title && <p className="caps mb-8 text-center text-ink-soft">{letter.title}</p>}
      <div className="type space-y-5 text-[0.92rem] leading-[1.85] text-ink sm:text-[0.98rem]">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
      {letter.signature && (
        <p className="mt-10 text-right">
          <span className="hand block text-[2.1rem] leading-none text-ink">{letter.signature.replace(/^—\s*/, "")}</span>
        </p>
      )}
    </motion.article>
  );
}

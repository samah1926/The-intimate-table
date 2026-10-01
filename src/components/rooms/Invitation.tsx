"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { answerPrelude } from "@/app/house/actions";
import type { ChapterMoment } from "@/lib/house/compose";

// The next Chapter, as a printed invitation: the name first, the details only
// once you choose to open it. One question, if there is one. Nothing else.

const KIND_LABEL: Record<string, string> = {
  question: "One question",
  bring: "Something to bring",
  dress: "What to wear",
  music: "Something to listen to",
  clue: "A clue",
  coordinates: "Where",
  challenge: "Before you come",
  thought: "Something to think about",
};

function when(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" }).format(d);
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Paris" }).format(d));
  return `${day}, ${h < 7 ? "before sunrise" : h < 12 ? "in the morning" : h < 18 ? "in the afternoon" : "in the evening"}`;
}

export function Invitation({ moment }: { moment: ChapterMoment }) {
  const [open, setOpen] = useState(false);
  const c = moment.chapter;
  return (
    <section aria-label={`An invitation: ${c.label}`} className="bg-paper">
      <div className="mx-auto grid max-w-[84rem] gap-12 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24 lg:px-14">
        <div>
          <p className="eyebrow muted">An invitation</p>
          <h2 className="display mt-6 text-[2.8rem] sm:text-[3.8rem]">
            Chapter {c.number}
            {c.title && (
              <>
                <span className="muted"> — </span>
                {c.title}
              </>
            )}
          </h2>
          {c.subtitle && <p className="lede mt-5 max-w-md text-[1.5rem] muted">{c.subtitle}</p>}
          {!open && (
            <button type="button" onClick={() => setOpen(true)} className="btn-primary mt-12">
              Open the invitation <span aria-hidden>→</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }} className="lg:pt-3">
              {moment.invitation?.message && <p className="lede text-[1.7rem] leading-snug">{moment.invitation.message}</p>}
              <dl className="mt-10 grid gap-6 border-t pt-8 hairline sm:grid-cols-2">
                {c.starts_at && (
                  <div>
                    <dt className="eyebrow muted">When</dt>
                    <dd className="mt-2 text-[1.15rem]">{when(c.starts_at)}</dd>
                  </div>
                )}
                {c.location_label && (
                  <div>
                    <dt className="eyebrow muted">Where</dt>
                    <dd className="mt-2 text-[1.15rem] italic">{c.location_label}</dd>
                  </div>
                )}
              </dl>
              {moment.preludes.map((p) => (
                <div key={p.id} className="mt-10 border-t pt-8 hairline">
                  <p className="eyebrow muted">{KIND_LABEL[p.kind] ?? p.title}</p>
                  {p.body && <p className="display mt-4 text-[2rem]">{p.body}</p>}
                  {p.response_prompt && <Answer preludeId={p.id} prompt={p.response_prompt} answered={!!p.answer} />}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Answer({ preludeId, prompt, answered }: { preludeId: string; prompt: string; answered: boolean }) {
  const [pending, setPending] = useState(false);
  if (answered) return <p className="mt-6 text-[1.1rem] italic muted">Kept. You will see it again, later — when you have forgotten you wrote it.</p>;
  return (
    <form action={answerPrelude.bind(null, preludeId)} onSubmit={() => setPending(true)} className="mt-6">
      <label htmlFor={`answer-${preludeId}`} className="block text-[1.1rem] italic muted">
        {prompt}
      </label>
      <textarea
        id={`answer-${preludeId}`}
        name="body"
        required
        rows={4}
        className="mt-5 w-full resize-none border-0 border-b bg-transparent p-0 pb-2 text-[1.25rem] leading-relaxed outline-none hairline focus:border-ink/50"
      />
      <button disabled={pending} className="btn-quiet mt-8 disabled:opacity-40">
        {pending ? "Keeping it" : "Leave it with the House"}
      </button>
    </form>
  );
}

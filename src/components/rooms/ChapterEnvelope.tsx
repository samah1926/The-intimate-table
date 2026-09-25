"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { answerPrelude } from "@/app/house/actions";
import type { ChapterMoment } from "@/lib/house/compose";

// An invitation to the next Chapter arrives as an envelope tied with thread.
// Untying it is the only interaction; what's inside is one thing, not ten.

const key = (id: string) => `house:untied:${id}`;

function useUntied(id: string) {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => {
      try {
        return localStorage.getItem(key(id)) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
}

export function ChapterEnvelope({ moment, firstName }: { moment: ChapterMoment; firstName: string }) {
  const remembered = useUntied(moment.chapter.id);
  const [untying, setUntying] = useState(false);
  const [open, setOpen] = useState(false);
  const isOpen = open || remembered;

  const untie = () => {
    setUntying(true);
    setTimeout(() => {
      setOpen(true);
      try {
        localStorage.setItem(key(moment.chapter.id), "1");
      } catch {}
    }, 1100);
  };

  return (
    <div className="mx-auto w-full max-w-[30rem]">
      <AnimatePresence mode="wait" initial={false}>
        {!isOpen ? (
          <motion.button
            key="envelope"
            type="button"
            onClick={untie}
            disabled={untying}
            className="group relative block w-full text-left [perspective:900px]"
            exit={{ opacity: 0, y: 30, transition: { duration: 0.6 } }}
            aria-label={`An envelope: ${moment.chapter.label}. Untie the thread.`}
          >
            <Envelope label={`CHAPTER ${moment.chapter.number}`} to={firstName} untying={untying} />
            <span className="caps mt-5 block text-center text-[0.62rem] opacity-60 transition-opacity group-hover:opacity-100">
              {untying ? "…" : "Untie the thread"}
            </span>
          </motion.button>
        ) : (
          <motion.div key="card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.22, 0.61, 0.24, 1] }}>
            <InvitationCard moment={moment} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Envelope({ label, to, untying }: { label: string; to: string; untying: boolean }) {
  const t = { duration: 0.9, ease: [0.65, 0, 0.35, 1] as const };
  return (
    <div className="relative aspect-[10/7] w-full drop-shadow-[0_18px_24px_rgba(28,26,23,0.22)]">
      <svg viewBox="0 0 200 140" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x=".5" y=".5" width="199" height="139" fill="#f4efe6" stroke="#cfc5b4" strokeWidth=".6" />
        <path d="M.5 139.5 L82 66 M199.5 139.5 L118 66" stroke="#d6cdbd" strokeWidth=".6" fill="none" />
        <text x="100" y="116" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="6.4" letterSpacing="2.8" fill="#1c1a17">
          {label}
        </text>
        <text x="26" y="104" fontFamily="var(--font-hand)" fontSize="15" fill="#1c1a17" opacity=".85">
          for {to}
        </text>
      </svg>
      {/* the flap lifts */}
      <motion.svg
        viewBox="0 0 200 80"
        className="absolute inset-x-0 top-0 w-full"
        style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
        animate={untying ? { rotateX: 175 } : { rotateX: 0 }}
        transition={{ ...t, delay: 0.45 }}
        aria-hidden
      >
        <path d="M.5 .5 L100 78 L199.5 .5 Z" fill="#ebe4d7" stroke="#cfc5b4" strokeWidth=".6" />
      </motion.svg>
      {/* thread */}
      <svg viewBox="0 0 200 140" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {["M-8 50 L208 84", "M-8 56 L208 89", "M72 -8 L98 148", "M84 -8 L106 148"].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke="#151311"
            strokeWidth=".9"
            fill="none"
            initial={false}
            animate={untying ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
            transition={{ ...t, delay: i * 0.08 }}
          />
        ))}
        <motion.circle cx="90" cy="68" r="2.2" fill="#151311" animate={untying ? { opacity: 0, scale: 0 } : { opacity: 1 }} transition={t} />
      </svg>
    </div>
  );
}

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
  const day = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" }).format(d);
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Paris" }).format(d));
  const part = h < 7 ? "before sunrise" : h < 12 ? "in the morning" : h < 18 ? "in the afternoon" : "in the evening";
  return `${day}, ${part}`;
}

export function InvitationCard({ moment }: { moment: ChapterMoment }) {
  const c = moment.chapter;
  return (
    <article className="paper relative px-7 py-12 sm:px-12 sm:py-14">
      <p className="caps text-center text-ink-soft">Chapter {c.number}</p>
      {c.title && <h2 className="mt-5 text-center text-[3rem] font-light italic leading-none sm:text-[3.6rem]">{c.title}</h2>}
      {c.subtitle && <p className="mx-auto mt-5 max-w-xs text-center text-lg leading-snug text-ink-soft">{c.subtitle}</p>}
      <div className="mx-auto my-9 h-px w-12 bg-ink/30" />

      {moment.invitation?.message && (
        <p className="type mx-auto max-w-sm text-center text-[0.9rem] leading-[1.85] text-ink">{moment.invitation.message}</p>
      )}

      <dl className="mx-auto mt-9 grid max-w-sm gap-4 text-center">
        {c.starts_at && (
          <div>
            <dt className="caps text-[0.6rem] text-ink-faint">When</dt>
            <dd className="mt-1 text-lg">{when(c.starts_at)}</dd>
          </div>
        )}
        {c.location_label && (
          <div>
            <dt className="caps text-[0.6rem] text-ink-faint">Where</dt>
            <dd className="mt-1 text-lg italic">{c.location_label}</dd>
          </div>
        )}
      </dl>

      {moment.preludes.map((p) => (
        <section key={p.id} className="mt-12 border-t border-ink/15 pt-10 text-center">
          <p className="caps text-ink-faint">{KIND_LABEL[p.kind] ?? p.title}</p>
          {p.body && <p className="mx-auto mt-5 max-w-sm text-[1.7rem] font-light italic leading-tight">{p.body}</p>}
          {p.response_prompt && <PreludeAnswer preludeId={p.id} prompt={p.response_prompt} answered={!!p.answer} />}
        </section>
      ))}
    </article>
  );
}

function PreludeAnswer({ preludeId, prompt, answered }: { preludeId: string; prompt: string; answered: boolean }) {
  const [pending, setPending] = useState(false);
  if (answered) {
    return <p className="mx-auto mt-8 max-w-xs text-ink-soft">Kept. You’ll see it again, later — when you’ve forgotten you wrote it.</p>;
  }
  const action = answerPrelude.bind(null, preludeId);
  return (
    <form action={action} onSubmit={() => setPending(true)} className="mx-auto mt-8 max-w-sm text-left">
      <label htmlFor={`answer-${preludeId}`} className="block text-center italic text-ink-soft">
        {prompt}
      </label>
      <textarea
        id={`answer-${preludeId}`}
        name="body"
        required
        rows={5}
        className="type mt-6 w-full resize-none border-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_1.8rem,#1c1a1722_1.8rem,#1c1a1722_calc(1.8rem+1px))] bg-transparent p-0 text-[0.92rem] leading-[1.8rem] text-ink outline-none placeholder:text-ink-faint/70"
        placeholder="…"
      />
      <div className="mt-6 text-center">
        <button disabled={pending} className="caps border-b border-ink/40 pb-1 transition-colors hover:border-ink disabled:opacity-50">
          {pending ? "Folding it away" : "Leave it with the House"}
        </button>
      </div>
    </form>
  );
}

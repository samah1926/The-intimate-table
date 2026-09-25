"use client";

import Link from "next/link";
import { useActionState, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { enterAsGuest, sendKey, type KeyState } from "@/app/actions";
import { applyLight } from "@/lib/house/apply-light";
import { LIGHT } from "@/lib/house/light";

// The threshold: a dark doorway with light underneath it. One sentence.
// Nothing to browse from outside.

interface Props {
  signedInAs: string | null;
  mode: "demo" | "invited";
  guests: { id: string; name: string }[];
  keyExpired: boolean;
}

export function Threshold({ signedInAs, mode, guests, keyExpired }: Props) {
  const [knocking, setKnocking] = useState(keyExpired);
  useLayoutEffect(() => applyLight(LIGHT.threshold), []);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden px-6 py-[max(2rem,env(safe-area-inset-top))] text-center">
      <div className="grain" aria-hidden />

      <p className="caps pt-4 opacity-70">The Intimate Table</p>

      <div className="flex flex-col items-center">
        <Door open={knocking} onKnock={() => setKnocking(true)} />

        <div className="mt-12 min-h-[12rem] w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!knocking ? (
              <motion.div key="words" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 1.4, delay: 0.6 }}>
                <h1 className="text-[2.6rem] font-light italic leading-none sm:text-[3.2rem]">The House</h1>
                <p className="mt-6 text-xl leading-snug muted">
                  You don’t open an app.
                  <br />
                  You come back to a place.
                </p>
              </motion.div>
            ) : (
              <motion.div key="enter" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
                {signedInAs ? (
                  <Link href="/house" className="group inline-flex flex-col items-center">
                    <span className="text-[2rem] font-light italic">Come in, {signedInAs}.</span>
                    <span className="caps mt-5 border-b border-current/40 pb-1 opacity-70 transition-opacity group-hover:opacity-100">
                      The light is on
                    </span>
                  </Link>
                ) : mode === "demo" ? (
                  <DemoEntry guests={guests} />
                ) : (
                  <KeyEntry expired={keyExpired} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="type pb-2 text-[0.7rem] opacity-40">{mode === "demo" ? "A prototype. Everything inside is placeholder." : "By invitation."}</p>
    </div>
  );
}

function Door({ open, onKnock }: { open: boolean; onKnock: () => void }) {
  return (
    <button
      type="button"
      onClick={onKnock}
      aria-label="Knock"
      className="group relative h-[15rem] w-[8.5rem] sm:h-[19rem] sm:w-[10.5rem]"
      disabled={open}
    >
      <svg viewBox="0 0 100 180" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5e1b5" stopOpacity="0" />
            <stop offset="1" stopColor="#f5e1b5" stopOpacity=".55" />
          </linearGradient>
          <radialGradient id="floor" cx="50%" cy="0%" r="60%">
            <stop offset="0" stopColor="#f5e1b5" stopOpacity=".35" />
            <stop offset="1" stopColor="#f5e1b5" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* light on the floor */}
        <ellipse cx="50" cy="182" rx="80" ry="14" fill="url(#floor)" className="flicker" />
        {/* the frame */}
        <path d="M2 180 V14 Q2 2 14 2 H86 Q98 2 98 14 V180" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".55" />
        {/* the door itself, which swings a little when you knock */}
        <motion.g
          style={{ transformOrigin: "6px 90px" }}
          animate={open ? { scaleX: 0.72, skewY: -3 } : { scaleX: 1, skewY: 0 }}
          transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
        >
          <rect x="6" y="6" width="88" height="174" fill="#0d0c0b" stroke="currentColor" strokeWidth=".5" opacity=".95" />
          <circle cx="82" cy="98" r="1.6" fill="currentColor" opacity=".6" />
        </motion.g>
        {/* the gap once it opens */}
        <motion.rect
          x="68"
          y="6"
          width="26"
          height="174"
          fill="url(#spill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 1.6, delay: 0.4 }}
        />
        {/* the line of light under the door */}
        <rect x="8" y="178.5" width="84" height="1.5" fill="#f5e1b5" className="flicker" />
      </svg>
      {!open && (
        <span className="caps absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] opacity-0 transition-opacity duration-700 group-hover:opacity-60 group-focus-visible:opacity-60">
          Knock
        </span>
      )}
    </button>
  );
}

function DemoEntry({ guests }: { guests: { id: string; name: string }[] }) {
  const [first, ...others] = guests;
  return (
    <div>
      <form action={enterAsGuest}>
        <input type="hidden" name="guest" value={first.id} />
        <button className="group inline-flex flex-col items-center">
          <span className="text-[2rem] font-light italic">Come in, {first.name}.</span>
          <span className="caps mt-5 border-b border-current/40 pb-1 opacity-70 transition-opacity group-hover:opacity-100">Step inside</span>
        </button>
      </form>
      {others.map((g) => (
        <form key={g.id} action={enterAsGuest} className="mt-10">
          <input type="hidden" name="guest" value={g.id} />
          <button className="text-base italic opacity-50 transition-opacity hover:opacity-90">
            …or enter as {g.name}, who hasn’t lived anything here yet
          </button>
        </form>
      ))}
    </div>
  );
}

function KeyEntry({ expired }: { expired: boolean }) {
  const [state, action, pending] = useActionState<KeyState, FormData>(sendKey, {});
  if (state.sent) {
    return (
      <div>
        <p className="text-[1.7rem] font-light italic leading-snug">A key is on its way.</p>
        <p className="mt-4 muted">Look for it at {state.sent}. It opens the door once.</p>
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col items-center">
      <label htmlFor="email" className="text-[1.6rem] font-light italic leading-snug">
        {expired ? "That key has already been used." : "Leave your name at the door."}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="your email"
        className="type mt-8 w-full max-w-[17rem] border-0 border-b border-current/30 bg-transparent pb-2 text-center text-[0.95rem] outline-none placeholder:opacity-40 focus:border-current/70"
      />
      <button disabled={pending} className="caps mt-8 opacity-70 transition-opacity hover:opacity-100 disabled:opacity-40">
        {pending ? "…" : "Ask for a key"}
      </button>
      {state.error && <p className="mt-6 max-w-xs text-base italic muted">{state.error}</p>}
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { enterAsGuest, sendKey, type KeyState } from "@/app/actions";
import { applyLight } from "@/lib/house/apply-light";
import { LIGHT } from "@/lib/house/light";
import { Picture } from "@/components/ui/Picture";
import { Wordmark } from "@/components/ui/Wordmark";

// The entrance: dusk, one photograph, one sentence, one way in.
// Nothing to browse from outside.

interface Props {
  signedInAs: string | null;
  mode: "demo" | "invited";
  guests: { id: string; name: string }[];
  keyExpired: boolean;
}

const ease = [0.22, 0.61, 0.24, 1] as const;

export function Threshold({ signedInAs, mode, guests, keyExpired }: Props) {
  useLayoutEffect(() => applyLight(LIGHT.threshold), []);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="grain" aria-hidden />
      <div className="mx-auto grid min-h-dvh max-w-[84rem] gap-12 px-6 py-[max(1.75rem,env(safe-area-inset-top))] sm:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24 lg:px-14 lg:py-14">
        <motion.div className="order-2 flex flex-col justify-between gap-16 lg:order-1 lg:py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, ease }}>
          <Wordmark size="1.08rem" />

          <div>
            <p className="eyebrow opacity-60">The House</p>
            <h1 className="lede mt-8 text-[2.6rem] leading-[1.1] sm:text-[3.4rem]">
              You don’t open an app.
              <br />
              You come back to a place.
            </h1>
            <div className="mt-14">
              {signedInAs ? (
                <Link href="/house" className="btn-primary">
                  Come in, {signedInAs} <span aria-hidden>→</span>
                </Link>
              ) : mode === "demo" ? (
                <DemoEntry guests={guests} />
              ) : (
                <KeyEntry expired={keyExpired} />
              )}
            </div>
          </div>

          <p className="meta text-[0.6rem] opacity-40">{mode === "demo" ? "A prototype — everything inside is placeholder" : "By invitation"}</p>
        </motion.div>

        <motion.div className="order-1 lg:order-2" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2.2, ease }}>
          <Picture src="/house/photos/chapter-0/calla.webp" alt="A single calla lily in low light" position="50% 40%" priority className="aspect-[4/5] max-h-[46dvh] w-full lg:aspect-auto lg:h-full lg:max-h-none" />
        </motion.div>
      </div>
    </div>
  );
}

function DemoEntry({ guests }: { guests: { id: string; name: string }[] }) {
  const [first, ...others] = guests;
  return (
    <div>
      <form action={enterAsGuest}>
        <input type="hidden" name="guest" value={first.id} />
        <button className="btn-primary">
          Enter as {first.name} <span aria-hidden>→</span>
        </button>
      </form>
      {others.map((g) => (
        <form key={g.id} action={enterAsGuest} className="mt-8">
          <input type="hidden" name="guest" value={g.id} />
          <button className="text-[1.1rem] italic opacity-60 transition-opacity hover:opacity-100">…or as {g.name}, who hasn’t lived anything here yet</button>
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
        <p className="lede text-[1.8rem]">A key is on its way.</p>
        <p className="mt-4 opacity-60">Look for it at {state.sent}. It opens the door once.</p>
      </div>
    );
  }
  return (
    <form action={action} className="max-w-sm">
      <label htmlFor="email" className="block text-[1.2rem] italic opacity-70">
        {expired ? "That key has already been used. Ask for another." : "Leave your email at the door."}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="your@email"
        className="mt-6 w-full border-0 border-b border-current/30 bg-transparent pb-2 text-[1.25rem] outline-none placeholder:opacity-30 focus:border-current/70"
      />
      <button disabled={pending} className="btn-primary mt-10 disabled:opacity-50">
        {pending ? "Asking" : "Ask for a key"} <span aria-hidden>→</span>
      </button>
      {state.error && <p className="mt-6 text-[1.05rem] italic opacity-60">{state.error}</p>}
    </form>
  );
}

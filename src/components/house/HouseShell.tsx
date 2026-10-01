"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { leave } from "@/app/actions";
import { Wordmark } from "@/components/ui/Wordmark";
import type { RoomView } from "@/lib/house/compose";
import { applyLight } from "@/lib/house/apply-light";
import { LIGHT, roomFromPath } from "@/lib/house/light";
import { Plan } from "./Plan";
import { SoundToggle } from "./SoundToggle";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface Props {
  rooms: RoomView[];
  /** e.g. ["Chapter 0", "Morocco", "12 — 15 March 2027"] */
  context: string[];
  preview: { clock: string | null; viewAs: string | null } | null;
  isHost: boolean;
  children: React.ReactNode;
}

/**
 * The frame of every room: the wordmark, where you are in time, the plan.
 * Nothing floats over the photography; the header scrolls away with the page.
 */
export function HouseShell({ rooms, context, preview, isHost, children }: Props) {
  const pathname = usePathname();
  const room = roomFromPath(pathname);
  const [planOpen, setPlanOpen] = useState(false);
  const dark = LIGHT[room].tone === "dark";

  useIsoLayoutEffect(() => applyLight(LIGHT[room]), [room]);

  return (
    <div className="relative min-h-dvh">
      <div className="grain" aria-hidden />

      <header className="relative z-30 mx-auto flex max-w-[84rem] items-start justify-between gap-6 px-6 pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-10 sm:pt-9 lg:px-14">
        <Link href="/house" aria-label="The House — the Hall" className="transition-opacity duration-500 hover:opacity-70">
          <Wordmark size="1.08rem" />
        </Link>
        <div className="flex items-start gap-10">
          {context.length > 0 && (
            <p className={`meta hidden text-[0.66rem] leading-[1.9] sm:block ${dark ? "text-[#a39684]" : "text-ink-soft"}`}>
              {context.map((c) => (
                <span key={c} className="block">
                  {c}
                </span>
              ))}
            </p>
          )}
          <button type="button" onClick={() => setPlanOpen(true)} aria-haspopup="dialog" className="eyebrow flex items-center gap-3 pt-0.5 transition-opacity hover:opacity-60">
            The plan
            <span aria-hidden className="text-[0.9rem] tracking-normal">→</span>
          </button>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 mx-auto mt-28 flex max-w-[84rem] flex-wrap items-center justify-between gap-6 border-t px-6 py-8 hairline sm:px-10 lg:px-14">
        <p className="meta text-[0.62rem] muted">The Intimate Table — The House</p>
        <div className="flex items-center gap-8">
          <SoundToggle room={room} />
          <form action={leave}>
            <button className="meta text-[0.62rem] muted transition-opacity hover:opacity-60">Leave</button>
          </form>
        </div>
      </footer>

      {preview && (
        <div className="fixed bottom-0 left-1/2 z-40 -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Link href="/admin" className="meta block whitespace-nowrap bg-ink/85 px-4 py-2 text-[0.6rem] text-ivory backdrop-blur transition-opacity hover:opacity-80">
            Preview{preview.clock ? ` · ${preview.clock}` : ""}
            {preview.viewAs ? ` · as ${preview.viewAs}` : ""}
          </Link>
        </div>
      )}

      <AnimatePresence>{planOpen && <Plan rooms={rooms} current={room} isHost={isHost} onClose={() => setPlanOpen(false)} />}</AnimatePresence>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { RoomView } from "@/lib/house/compose";
import { applyLight } from "@/lib/house/apply-light";
import { LIGHT, roomFromPath } from "@/lib/house/light";
import { Atmosphere } from "./Atmosphere";
import { Plan } from "./Plan";
import { SoundToggle } from "./SoundToggle";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface Props {
  rooms: RoomView[];
  preview: { clock: string | null; viewAs: string | null } | null;
  isHost: boolean;
  children: React.ReactNode;
}

export function HouseShell({ rooms, preview, isHost, children }: Props) {
  const pathname = usePathname();
  const room = roomFromPath(pathname);
  const [planOpen, setPlanOpen] = useState(false);

  // The light changes as you walk from room to room.
  useIsoLayoutEffect(() => applyLight(LIGHT[room]), [room]);

  return (
    <div className="relative min-h-dvh">
      <Atmosphere room={room} />
      <div className="grain" aria-hidden />

      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 sm:pt-8">
        <Link href="/house" className="pointer-events-auto text-[1.05rem] italic opacity-80 transition-opacity duration-500 hover:opacity-100">
          The House
        </Link>
        <button
          type="button"
          onClick={() => setPlanOpen(true)}
          className="label pointer-events-auto flex items-center gap-3 opacity-75 transition-opacity duration-500 hover:opacity-100"
          aria-haspopup="dialog"
          aria-label="The plan"
        >
          <PlanGlyph />
          <span className="hidden sm:inline">The plan</span>
        </button>
      </header>

      <main className="relative z-10">{children}</main>

      <div className="pointer-events-none fixed bottom-0 left-0 z-40 px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-7">
        <SoundToggle room={room} />
      </div>

      {preview && (
        <div className="label fixed bottom-0 left-1/2 z-40 -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Link
            href="/admin"
            className="block whitespace-nowrap rounded-full border border-current/20 bg-[var(--room-bg)]/70 px-4 py-1.5 opacity-70 backdrop-blur transition-opacity hover:opacity-100"
          >
            Preview{preview.clock ? ` · ${preview.clock}` : ""}
            {preview.viewAs ? ` · as ${preview.viewAs}` : ""} — change
          </Link>
        </div>
      )}

      <AnimatePresence>
        {planOpen && <Plan rooms={rooms} current={room} isHost={isHost} onClose={() => setPlanOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

/** A folded floor plan. */
function PlanGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M1.5 3.5 6.5 1.5l5 2 5-2v13l-5 2-5-2-5 2z" />
      <path d="M6.5 1.5v13M11.5 3.5v13" opacity=".6" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { leave } from "@/app/actions";
import type { RoomKey } from "@/lib/domain/types";
import type { RoomView } from "@/lib/house/compose";
import { ROOM_PATH } from "@/lib/house/light";
import { Picture } from "@/components/ui/Picture";

// The plan of the house, set like the contents page of a book: the rooms in
// order, one line each, and the photograph of the one you're pointing at.
// A door that doesn't exist for you is simply not listed.

export const ROOM_PORTRAIT: Partial<Record<RoomKey, { line: string; image: string; position?: string }>> = {
  hall: { line: "Letters, and what comes next", image: "/house/photos/chapter-0/house-arch.webp" },
  table: { line: "People, places, conversations", image: "/house/photos/chapter-0/table-sunset.webp", position: "50% 70%" },
  library: { line: "What we learned, kept to read again", image: "/house/photos/chapter-0/conversations-book.webp" },
  studio: { line: "Movement, mornings, recovery", image: "/house/photos/chapter-0/morning-arch.webp" },
  memory: { line: "What remains", image: "/house/photos/chapter-0/calla.webp", position: "50% 40%" },
};

export function Plan({ rooms, current, isHost, onClose }: { rooms: RoomView[]; current: RoomKey; isHost: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = rooms.filter((r) => r.state === "open");
  const listed = visible.filter((r) => r.key !== "door");
  const door = visible.find((r) => r.key === "door");
  const [pointing, setPointing] = useState<RoomKey>(ROOM_PORTRAIT[current] ? current : "hall");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const shown = ROOM_PORTRAIT[pointing];

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="The plan of the house"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ivory text-ink outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.24, 1] }}
    >
      <div className="grain" aria-hidden />
      <div className="mx-auto flex w-full max-w-[84rem] items-center justify-between px-6 pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-10 sm:pt-9 lg:px-14">
        <p className="eyebrow">The plan</p>
        <button type="button" onClick={onClose} className="eyebrow transition-opacity hover:opacity-60">
          Close
        </button>
      </div>

      <motion.div
        className="mx-auto grid w-full max-w-[84rem] flex-1 gap-14 px-6 py-14 sm:px-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-center lg:gap-24 lg:px-14"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
      >
        <nav aria-label="Rooms">
          <ol className="border-t hairline">
            {listed.map((r, i) => {
              const here = r.key === current;
              const p = ROOM_PORTRAIT[r.key];
              return (
                <li key={r.key} className="border-b hairline">
                  <Link
                    href={ROOM_PATH[r.key]}
                    onClick={onClose}
                    onMouseEnter={() => setPointing(r.key)}
                    onFocus={() => setPointing(r.key)}
                    aria-current={here ? "page" : undefined}
                    className="group flex items-baseline gap-6 py-6 sm:gap-10 sm:py-7"
                  >
                    <span className="meta w-8 text-[0.66rem] muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">
                      <span className="display block text-[2.1rem] transition-transform duration-500 group-hover:translate-x-1 sm:text-[2.8rem]">{r.name}</span>
                      {p && <span className="mt-2 block text-[1.05rem] italic muted">{p.line}</span>}
                    </span>
                    {here && <span className="meta hidden text-[0.6rem] text-oxblood sm:inline">You are here</span>}
                  </Link>
                </li>
              );
            })}
          </ol>
          {door && (
            <Link href={ROOM_PATH.door} onClick={onClose} className="mt-10 inline-block text-[1.1rem] italic muted transition-opacity hover:opacity-70">
              And a door that wasn’t there before →
            </Link>
          )}
        </nav>

        <div className="hidden lg:block">
          {shown && (
            <motion.div key={pointing} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
              <Picture src={shown.image} alt="" aspect="4 / 5" position={shown.position} />
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="mx-auto flex w-full max-w-[84rem] items-end justify-between px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-9 lg:px-14">
        <form action={leave}>
          <button className="meta text-[0.62rem] muted transition-opacity hover:opacity-60">Leave the house</button>
        </form>
        {isHost && (
          <Link href="/admin" className="meta text-[0.62rem] muted transition-opacity hover:opacity-60">
            Back office
          </Link>
        )}
      </div>
    </motion.div>
  );
}

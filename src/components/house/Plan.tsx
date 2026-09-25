"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { leave } from "@/app/actions";
import type { RoomKey } from "@/lib/domain/types";
import type { RoomView } from "@/lib/house/compose";
import { ROOM_PATH } from "@/lib/house/light";

// The house, drawn as an architect would: thin walls, door swings, names in
// spaced capitals. Rooms are reached by touching them. A door that doesn't
// exist for you is simply not drawn.

const GEOMETRY: Record<RoomKey, { x: number; y: number; w: number; h: number }> = {
  library: { x: 20, y: 20, w: 150, h: 140 },
  memory: { x: 170, y: 20, w: 150, h: 140 },
  studio: { x: 320, y: 20, w: 140, h: 140 },
  table: { x: 20, y: 160, w: 220, h: 150 },
  hall: { x: 240, y: 160, w: 220, h: 150 },
  door: { x: 460, y: 196, w: 58, h: 78 },
};

/** Openings in walls: [x1, y1, x2, y2] along a wall, plus which way the leaf swings. */
const OPENINGS: { at: [number, number, number, number]; swing: string }[] = [
  { at: [240, 214, 240, 246], swing: "M240 214 A32 32 0 0 0 208 246" }, // hall ↔ table
  { at: [252, 160, 284, 160], swing: "M252 160 A32 32 0 0 1 284 128" }, // hall ↔ memory
  { at: [392, 160, 424, 160], swing: "M424 160 A32 32 0 0 0 392 128" }, // hall ↔ studio
  { at: [70, 160, 102, 160], swing: "M70 160 A32 32 0 0 0 102 128" }, // table ↔ library
  { at: [170, 118, 170, 150], swing: "M170 118 A32 32 0 0 1 202 150" }, // library ↔ memory
  { at: [330, 310, 372, 310], swing: "" }, // entrance
];
const DOOR_OPENING = { at: [460, 219, 460, 251] as [number, number, number, number], swing: "M460 251 A32 32 0 0 1 492 219" };

const PAPER = "#f1ebe0";

export function Plan({ rooms, current, isHost, onClose }: { rooms: RoomView[]; current: RoomKey; isHost: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = rooms.filter((r) => r.state === "open");
  const hasDoor = visible.some((r) => r.key === "door");

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

  const openings = hasDoor ? [...OPENINGS, DOOR_OPENING] : OPENINGS;

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="The plan of the house"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto text-ink outline-none"
      style={{ background: PAPER }}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
    >
      <div className="grain" aria-hidden style={{ opacity: 0.08 }} />
      <div className="flex items-start justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 sm:pt-8">
        <p className="label">The plan</p>
        <button type="button" onClick={onClose} className="label opacity-70 transition-opacity hover:opacity-100">
          Fold it away
        </button>
      </div>

      <motion.div
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
      >
        <p className="mb-8 max-w-sm text-lg italic leading-snug text-ink-soft">
          Ground floor. Some rooms are not on this drawing yet.
        </p>

        <svg viewBox="0 0 540 340" className="w-full" role="group" aria-label="Rooms of the house">
          {/* hatching, like a real plan */}
          <defs>
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#1c1a17" strokeWidth=".4" opacity=".25" />
            </pattern>
          </defs>

          {visible.map((r) => {
            const g = GEOMETRY[r.key];
            const here = r.key === current;
            const isDoor = r.key === "door";
            return (
              <Link key={r.key} href={ROOM_PATH[r.key]} onClick={onClose} aria-label={r.name} className="group">
                <rect
                  x={g.x}
                  y={g.y}
                  width={g.w}
                  height={g.h}
                  fill={here ? "url(#hatch)" : PAPER}
                  stroke="#1c1a17"
                  strokeWidth={isDoor ? 1 : 1.6}
                  strokeDasharray={isDoor ? "3 3" : undefined}
                  className="transition-[fill] duration-500 group-hover:fill-[#e7dfd1]"
                />
                {!isDoor && (
                  <text
                    x={g.x + g.w / 2}
                    y={g.y + g.h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="var(--font-serif)"
                    fontSize="9.5"
                    letterSpacing="3"
                    fill="#1c1a17"
                  >
                    {r.name.replace(/^The /, "").toUpperCase()}
                  </text>
                )}
                {isDoor && (
                  <text x={g.x + g.w / 2} y={g.y + g.h / 2 + 3} textAnchor="middle" fontFamily="var(--font-serif)" fontSize="11" fill="#1c1a17">
                    ?
                  </text>
                )}
                {here && (
                  <g>
                    <circle cx={g.x + g.w / 2} cy={g.y + g.h / 2 + 18} r="2.4" fill="#1c1a17" />
                    <text
                      x={g.x + g.w / 2}
                      y={g.y + g.h / 2 + 32}
                      textAnchor="middle"
                      fontFamily="var(--font-serif)"
                      fontStyle="italic"
                      fontSize="9"
                      fill="#4d483f"
                    >
                      you are here
                    </text>
                  </g>
                )}
              </Link>
            );
          })}

          {/* openings and door swings */}
          {openings.map((o, i) => (
            <g key={i} pointerEvents="none">
              <line x1={o.at[0]} y1={o.at[1]} x2={o.at[2]} y2={o.at[3]} stroke={PAPER} strokeWidth="3.2" />
              {o.swing && <path d={o.swing} fill="none" stroke="#1c1a17" strokeWidth=".6" opacity=".6" />}
            </g>
          ))}
          <text x="351" y="328" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="7" letterSpacing="2.5" fill="#4d483f">
            ENTRANCE
          </text>
        </svg>

        <nav aria-label="Rooms" className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
          {visible.map((r) => (
            <Link key={r.key} href={ROOM_PATH[r.key]} onClick={onClose} className="label link-quiet" aria-current={r.key === current ? "page" : undefined}>
              {r.key === "door" ? "A door" : r.name.replace(/^The /, "")}
            </Link>
          ))}
        </nav>
      </motion.div>

      <div className="flex items-end justify-between px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-8">
        <form action={leave}>
          <button className="label opacity-60 transition-opacity hover:opacity-100">Leave the house</button>
        </form>
        {isHost && (
          <Link href="/admin" className="label opacity-60 transition-opacity hover:opacity-100">
            Back office
          </Link>
        )}
      </div>
    </motion.div>
  );
}

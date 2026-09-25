"use client";

import { motion } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { Thread } from "./ObjectArt";
import { PHYSICAL_ASPECT, Physical } from "./Physical";

const WIDTH = {
  sm: "w-[7.5rem] sm:w-[9rem]",
  md: "w-[10rem] sm:w-[13rem]",
  lg: "w-[13rem] sm:w-[17rem]",
} as const;

/** An object resting in a room laid out as a line. Touch it to pick it up. */
export function ObjectFigure({ object, onOpen, index = 0, hidden = false }: { object: ObjectView; onOpen: () => void; index?: number; hidden?: boolean }) {
  const p = object.placement;
  const sealed = object.state === "sealed";
  const aspect = PHYSICAL_ASPECT[object.kind] ?? 1.3;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className={`lit group relative flex flex-col items-center text-center outline-none ${object.isNew ? "is-new" : ""}`}
      style={{ marginTop: p.lift ? `${p.lift}rem` : undefined }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.13, duration: 1.2, ease: [0.22, 0.61, 0.24, 1] }}
      aria-label={sealed ? `${object.title} — tied with thread` : object.title}
    >
      <div className={`relative ${WIDTH[p.size ?? "md"]}`} style={{ aspectRatio: aspect }}>
        {!hidden && (
          <motion.div
            layoutId={`object-${object.id}`}
            className="on-surface relative h-full w-full transition-transform duration-700 ease-[var(--ease-house)] group-hover:-translate-y-1"
            style={{ rotate: p.rotate ?? 0 }}
            transition={{ duration: 0.95, ease: [0.22, 0.61, 0.24, 1] }}
          >
            <div className={`h-full w-full ${sealed ? "opacity-85 saturate-[.6]" : ""}`}>
              <Physical object={object} />
            </div>
            {sealed && <Thread tight />}
          </motion.div>
        )}
      </div>
      <span className="label mt-5 max-w-[12rem] opacity-60 transition-opacity duration-500 group-hover:opacity-100">{object.title}</span>
    </motion.button>
  );
}

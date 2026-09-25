"use client";

import { motion } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { ASPECT, ObjectArt, Thread } from "./ObjectArt";

const WIDTH = {
  sm: "w-[7.5rem] sm:w-[9rem]",
  md: "w-[10rem] sm:w-[13rem]",
  lg: "w-[13rem] sm:w-[17rem]",
} as const;

export function sceneOf(o: ObjectView) {
  const photos = o.memory?.blocks.find((b) => b.type === "photos");
  return photos && photos.type === "photos" ? photos.photos[0]?.scene ?? undefined : undefined;
}

/** An object resting in a room. Touch it to pick it up. */
export function ObjectFigure({ object, onOpen, index = 0 }: { object: ObjectView; onOpen: () => void; index?: number }) {
  const p = object.placement;
  const sealed = object.state === "sealed";
  const aspect = ASPECT[object.kind] ?? 1.3;

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
      <motion.div
        layoutId={`object-${object.id}`}
        className={`relative ${WIDTH[p.size ?? "md"]} transition-transform duration-700 ease-[var(--ease-house)] group-hover:-translate-y-1 group-focus-visible:-translate-y-1`}
        style={{ aspectRatio: aspect, rotate: p.rotate ?? 0 }}
      >
        <div className={`h-full w-full drop-shadow-[0_14px_18px_rgba(0,0,0,0.28)] ${sealed ? "opacity-80 saturate-[.6]" : ""}`}>
          <ObjectArt kind={object.kind} label={object.label} scene={sceneOf(object)} />
        </div>
        {sealed && <Thread tight />}
      </motion.div>
      <span className="caps mt-5 max-w-[12rem] text-[0.64rem] opacity-70 transition-opacity duration-500 group-hover:opacity-100">
        {object.title}
      </span>
      {sealed && object.sealed_hint && (
        <span className="mt-1.5 max-w-[12rem] text-[0.95rem] italic leading-snug opacity-0 transition-opacity duration-700 group-hover:opacity-70 group-focus-visible:opacity-70">
          {object.sealed_hint}
        </span>
      )}
    </motion.button>
  );
}

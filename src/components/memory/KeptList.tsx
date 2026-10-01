"use client";

import { AnimatePresence } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { dateTime } from "@/lib/house/light";
import { MemoryEntry } from "./MemoryEntry";
import { useHeld } from "./useHeld";

// What a room keeps, as an index: when, what, one line. Typeset like the
// running order of an evening. Each line opens the memory it belongs to.

export function KeptList({ objects, initialOpen, roomName, title }: { objects: ObjectView[]; initialOpen?: string | null; roomName: string; title: string }) {
  const { held, pickUp, putBack } = useHeld(objects, initialOpen);
  return (
    <>
      <section aria-label={title}>
        <div className="flex items-baseline justify-between border-b pb-5 hairline">
          <h2 className="eyebrow">{title}</h2>
          <span className="meta text-[0.66rem] muted">( {objects.length} )</span>
        </div>
        <ul>
          {objects.map((o) => {
            const sealed = o.state === "sealed";
            const when = o.memory?.occurred_at ? dateTime(o.memory.occurred_at) : null;
            return (
              <li key={o.id} className="border-b hairline">
                <button type="button" onClick={() => pickUp(o)} className="group grid w-full gap-2 py-8 text-left sm:grid-cols-[14rem_1fr_auto] sm:items-baseline sm:gap-10">
                  <span className="meta text-[0.64rem] muted">{sealed ? "Kept for later" : (when ?? o.chapter?.label ?? "")}</span>
                  <span>
                    <span className={`display block text-[1.9rem] sm:text-[2.2rem] ${sealed ? "muted" : ""}`}>{o.memory?.title ?? o.title}</span>
                    <span className="mt-2 block max-w-[38rem] text-[1.1rem] italic muted">{sealed ? o.sealed_hint : o.caption}</span>
                    {o.isNew && !sealed && <span className="meta mt-3 block text-[0.6rem] text-oxblood">Left recently</span>}
                  </span>
                  <span aria-hidden className="hidden text-[1.1rem] muted transition-transform duration-500 group-hover:translate-x-1 sm:block">
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <AnimatePresence>{held && <MemoryEntry key={held.id} object={held} onClose={putBack} roomName={roomName} />}</AnimatePresence>
    </>
  );
}

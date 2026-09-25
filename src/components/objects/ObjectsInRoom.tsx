"use client";

import { AnimatePresence, LayoutGroup } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { MemoryFocus } from "./MemoryFocus";
import { ObjectFigure } from "./ObjectFigure";
import { useHeld } from "./useHeld";

/** Objects resting in a room laid out as a line (the Table, the Studio), and the one in your hands. */
export function ObjectsInRoom({ objects, initialOpen, className = "" }: { objects: ObjectView[]; initialOpen?: string | null; className?: string }) {
  const { held, pickUp, putBack } = useHeld(objects, initialOpen);
  return (
    <LayoutGroup>
      <div className={className}>
        {objects.map((o, i) => (
          <ObjectFigure key={o.id} object={o} index={i} onOpen={() => pickUp(o)} hidden={held?.id === o.id} />
        ))}
      </div>
      <AnimatePresence>{held && <MemoryFocus key={held.id} object={held} onClose={putBack} />}</AnimatePresence>
    </LayoutGroup>
  );
}

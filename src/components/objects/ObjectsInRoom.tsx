"use client";

import { useCallback, useState, useTransition } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { markSeen } from "@/app/house/actions";
import type { ObjectView } from "@/lib/house/compose";
import { MemorySheet } from "./MemorySheet";
import { ObjectFigure } from "./ObjectFigure";

/**
 * Objects resting in a room, and the one currently in your hands.
 * The open object is mirrored in the URL (?open=slug) so it survives a reload
 * and the back button puts it down again.
 */
export function ObjectsInRoom({
  objects,
  initialOpen,
  className = "",
}: {
  objects: ObjectView[];
  initialOpen?: string | null;
  className?: string;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(initialOpen ?? null);
  const [, startTransition] = useTransition();
  const open = objects.find((o) => o.slug === openSlug) ?? null;

  const pickUp = (o: ObjectView) => {
    setOpenSlug(o.slug);
    const url = new URL(window.location.href);
    url.searchParams.set("open", o.slug);
    window.history.pushState(null, "", url);
    if (o.isNew && o.state === "open") startTransition(() => markSeen("memory_object", o.id));
  };

  const putBack = useCallback(() => {
    setOpenSlug(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("open")) {
      url.searchParams.delete("open");
      window.history.replaceState(null, "", url);
    }
  }, []);

  return (
    <LayoutGroup>
      <div className={className}>
        {objects.map((o, i) => (
          <ObjectFigure key={o.id} object={o} index={i} onOpen={() => pickUp(o)} />
        ))}
      </div>
      <AnimatePresence>{open && <MemorySheet key={open.id} object={open} onClose={putBack} />}</AnimatePresence>
    </LayoutGroup>
  );
}

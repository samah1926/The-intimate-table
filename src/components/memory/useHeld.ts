"use client";

import { useCallback, useState, useTransition } from "react";
import { markSeen } from "@/app/house/actions";
import type { ObjectView } from "@/lib/house/compose";

/**
 * The object currently in your hands. Mirrored in the URL (?open=slug) so it
 * survives a reload and the back button puts it down.
 */
export function useHeld(objects: ObjectView[], initialOpen?: string | null) {
  const [slug, setSlug] = useState<string | null>(initialOpen ?? null);
  const [, start] = useTransition();
  const held = objects.find((o) => o.slug === slug) ?? null;

  const pickUp = useCallback(
    (o: ObjectView) => {
      setSlug(o.slug);
      const url = new URL(window.location.href);
      url.searchParams.set("open", o.slug);
      window.history.pushState(null, "", url);
      if (o.isNew && o.state === "open") start(() => markSeen("memory_object", o.id));
    },
    [start],
  );

  const putBack = useCallback(() => {
    setSlug(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has("open")) {
      url.searchParams.delete("open");
      window.history.replaceState(null, "", url);
    }
  }, []);

  return { held, pickUp, putBack };
}

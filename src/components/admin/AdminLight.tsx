"use client";

import { useLayoutEffect } from "react";
import { applyLight } from "@/lib/house/apply-light";

/** The back office is plain daylight. */
export function AdminLight() {
  useLayoutEffect(
    () => applyLight({ bg: "#f5f4f1", ink: "#171717", muted: "#737373", rule: "#e5e5e5", glow: "#ffffff", tone: "light", grain: 0 }),
    [],
  );
  return null;
}

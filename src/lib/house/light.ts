import type { RoomKey } from "@/lib/domain/types";

export interface RoomLight {
  bg: string;
  ink: string;
  muted: string;
  rule: string;
  glow: string;
  tone: "light" | "dark";
  grain: number;
}

/** Each room is defined by its light, not by a colour scheme. */
export const LIGHT: Record<RoomKey | "threshold", RoomLight> = {
  // Evening cream: the lamp in the entrance is always on.
  hall: { bg: "#ebe4d7", ink: "#1c1a17", muted: "#6c655a", rule: "#1c1a1724", glow: "#fff2d6", tone: "light", grain: 0.075 },
  // Dark oiled wood, candle-warm.
  table: { bg: "#221913", ink: "#efe6d8", muted: "#a8998a", rule: "#efe6d81f", glow: "#f3c98b", tone: "dark", grain: 0.05 },
  // Green-black, one reading lamp.
  library: { bg: "#1a211d", ink: "#e9e3d4", muted: "#9aa194", rule: "#e9e3d41c", glow: "#f1dca8", tone: "dark", grain: 0.05 },
  // Limestone, early morning.
  studio: { bg: "#e2e0da", ink: "#21201d", muted: "#6b6961", rule: "#21201d22", glow: "#ffffff", tone: "light", grain: 0.06 },
  // Almost dark. Only the objects are lit.
  memory: { bg: "#0f0e0d", ink: "#ebe5d9", muted: "#8f887c", rule: "#ebe5d91a", glow: "#f6e7c8", tone: "dark", grain: 0.045 },
  // Black, with light under the door.
  door: { bg: "#080808", ink: "#e8e1d3", muted: "#8a8478", rule: "#e8e1d31a", glow: "#f5e4c0", tone: "dark", grain: 0.04 },
  threshold: { bg: "#0d0c0b", ink: "#e8e1d3", muted: "#8a8478", rule: "#e8e1d31a", glow: "#f5e1b5", tone: "dark", grain: 0.05 },
};

export function roomFromPath(pathname: string): RoomKey {
  const seg = pathname.split("/")[2] as RoomKey | undefined;
  return seg && seg in LIGHT ? seg : "hall";
}

export const ROOM_PATH: Record<RoomKey, string> = {
  hall: "/house",
  table: "/house/table",
  library: "/house/library",
  studio: "/house/studio",
  memory: "/house/memory",
  door: "/house/door",
};

/** The hour colours the Hall a little: morning cooler, night lower. */
export function timeOfDay(now: Date, timeZone = "Europe/Paris") {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(now));
  if (h < 5) return "night";
  if (h < 11) return "morning";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

export function houseDate(now: Date | string, timeZone = "Europe/Paris") {
  const d = typeof now === "string" ? new Date(now) : now;
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone }).format(d);
}

export function shortDate(iso: string | null, timeZone = "Europe/Paris") {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone }).format(new Date(iso));
}

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

/**
 * Each room is defined by its light, not by a colour scheme.
 * Darkness is always warm and always has a source: never flat black.
 */
export const LIGHT: Record<RoomKey | "threshold", RoomLight> = {
  // Late afternoon: sun through an arched window, palm shadows on plaster.
  hall: { bg: "#d8c6ad", ink: "#2a2118", muted: "#6f604f", rule: "#2a211826", glow: "#ffe3b3", tone: "light", grain: 0.07 },
  // Night: candles burning down over an oiled walnut table.
  table: { bg: "#1f160f", ink: "#f1e6d6", muted: "#b09d88", rule: "#f1e6d61f", glow: "#ffc27a", tone: "dark", grain: 0.06 },
  // Soft daylight on sage plaster. Quiet.
  library: { bg: "#c9c9b9", ink: "#23261f", muted: "#5d6255", rule: "#23261f22", glow: "#fbfbef", tone: "light", grain: 0.06 },
  // Early morning: long beams across limestone.
  studio: { bg: "#d9d7d0", ink: "#22211e", muted: "#65635b", rule: "#22211e22", glow: "#fffaf0", tone: "light", grain: 0.06 },
  // One warm lamp over a walnut surface; dust in the light.
  memory: { bg: "#2a1f18", ink: "#f0e5d4", muted: "#b19d86", rule: "#f0e5d41c", glow: "#ffd9a3", tone: "dark", grain: 0.055 },
  // Almost dark, but warm: light comes from behind the door.
  door: { bg: "#120d0a", ink: "#ece2d2", muted: "#9a8b79", rule: "#ece2d21a", glow: "#f5dcae", tone: "dark", grain: 0.05 },
  threshold: { bg: "#17110d", ink: "#ece2d2", muted: "#9a8b79", rule: "#ece2d21a", glow: "#f5d9a6", tone: "dark", grain: 0.055 },
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

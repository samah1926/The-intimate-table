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
 * One calm canvas for the whole House — ivory, ink, oxblood — so photography
 * can carry the emotion. Only the threshold and the unmarked door are dark.
 */
const IVORY: RoomLight = { bg: "#f5f0e8", ink: "#1d1814", muted: "#7d7165", rule: "#1d181424", glow: "#fff6e6", tone: "light", grain: 0.035 };
const NIGHT: RoomLight = { bg: "#15100d", ink: "#efe7db", muted: "#a39684", rule: "#efe7db1f", glow: "#f2dcb4", tone: "dark", grain: 0.05 };

export const LIGHT: Record<RoomKey | "threshold", RoomLight> = {
  hall: IVORY,
  table: IVORY,
  library: IVORY,
  studio: IVORY,
  memory: IVORY,
  door: NIGHT,
  threshold: NIGHT,
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

/** "12 — 15 March 2027" */
export function dateRange(start: string | null, end: string | null, timeZone = "Europe/Paris") {
  if (!start) return null;
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const day = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone }).format(d);
  const full = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone }).format(d);
  if (!e || day(s) === day(e)) return full(s);
  const sameMonth = new Intl.DateTimeFormat("en-GB", { month: "numeric", timeZone }).format(s) === new Intl.DateTimeFormat("en-GB", { month: "numeric", timeZone }).format(e);
  return sameMonth ? `${day(s)} — ${full(e)}` : `${full(s)} — ${full(e)}`;
}

/** "13 March 2027 — 23:41" */
export function dateTime(iso: string | null, timeZone = "Europe/Paris") {
  if (!iso) return null;
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone }).format(d);
  return `${date} — ${time}`;
}

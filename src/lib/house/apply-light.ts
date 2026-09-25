import type { RoomLight } from "./light";

/** Sets the room's light on the document; CSS transitions do the rest. */
export function applyLight(l: RoomLight) {
  const s = document.documentElement.style;
  s.setProperty("--room-bg", l.bg);
  s.setProperty("--room-ink", l.ink);
  s.setProperty("--room-muted", l.muted);
  s.setProperty("--room-rule", l.rule);
  s.setProperty("--room-glow", l.glow);
  s.setProperty("--grain-opacity", String(l.grain));
  document.documentElement.dataset.light = l.tone;
  document.documentElement.style.colorScheme = l.tone;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", l.bg);
}


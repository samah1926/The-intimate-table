import type { Chapter, ChapterParticipant, World } from "./types";

/**
 * Where a Chapter stands in time.
 *
 *  unannounced ─ prelude ─ during ─ interlude ─ afterglow ─ past
 *              ↑          ↑        ↑           ↑           ↑
 *   prelude_opens_at  starts_at  ends_at  afterglow_at  +30 days
 */
export type ChapterPhase = "unannounced" | "prelude" | "during" | "interlude" | "afterglow" | "past";

export const AFTERGLOW_DAYS = 30;
const DAY = 86_400_000;

const t = (iso: string | null) => (iso ? new Date(iso).getTime() : null);

export function chapterPhase(chapter: Chapter, now: Date): ChapterPhase {
  const n = now.getTime();
  const prelude = t(chapter.prelude_opens_at);
  const start = t(chapter.starts_at);
  const end = t(chapter.ends_at) ?? start;
  const glow = t(chapter.afterglow_at) ?? (end !== null ? end + DAY / 2 : null);

  if (start === null) return prelude !== null && n >= prelude ? "prelude" : "unannounced";
  if (n < start) return prelude !== null && n >= prelude ? "prelude" : "unannounced";
  if (end !== null && n < end) return "during";
  if (glow !== null && n < glow) return "interlude";
  if (glow !== null && n < glow + AFTERGLOW_DAYS * DAY) return "afterglow";
  return "past";
}

/** When the House changes because a Chapter was lived. */
export function afterglowMoment(chapter: Chapter): Date | null {
  const glow = t(chapter.afterglow_at);
  if (glow !== null) return new Date(glow);
  const end = t(chapter.ends_at) ?? t(chapter.starts_at);
  return end !== null ? new Date(end + DAY / 2) : null;
}

export function participation(world: World, chapterId: string, userId: string): ChapterParticipant | undefined {
  return world.participants.find((p) => p.chapter_id === chapterId && p.user_id === userId);
}

/**
 * Attendance is only real once the Chapter has actually happened.
 * A participant marked `attended` in advance does not see the afterglow early.
 */
export function hasAttended(world: World, chapter: Chapter, userId: string, now: Date): boolean {
  const p = participation(world, chapter.id, userId);
  if (!p || p.status !== "attended") return false;
  const glow = afterglowMoment(chapter);
  return glow !== null && now >= glow;
}

export function isInvited(world: World, chapterId: string, userId: string): boolean {
  const p = participation(world, chapterId, userId);
  if (p && p.status !== "declined") return true;
  return world.invitations.some((i) => i.chapter_id === chapterId && i.user_id === userId && i.status !== "declined");
}

export function chapterLabel(chapter: Pick<Chapter, "number" | "title">): string {
  return `Chapter ${chapter.number}${chapter.title ? ` — ${chapter.title}` : ""}`;
}

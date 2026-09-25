// The vocabulary of appearance.
//
// Each leaf condition is one registry entry: a schema (what the admin may write)
// and an evaluator (whether it holds for this viewer, now — and since when).
// To add a new kind of rule, add one entry to `registry`. Nothing else changes.

import { z } from "zod";
import {
  afterglowMoment,
  chapterPhase,
  hasAttended,
  isInvited,
  type ChapterPhase,
} from "@/lib/domain/chapters";
import type { TargetType, World } from "@/lib/domain/types";

export interface EvalContext {
  world: World;
  viewerId: string;
  now: Date;
  /** Resolves another entity's state, for `has_unlocked`. Cycle-safe. */
  stateOf: (type: TargetType, id: string) => { state: "absent" | "sealed" | "open"; since: Date | null };
}

export interface Verdict {
  ok: boolean;
  /** When the condition became true. Null when unknown or not true. */
  since: Date | null;
}

const NO: Verdict = { ok: false, since: null };
const yes = (since: Date | null): Verdict => ({ ok: true, since });
const DAY = 86_400_000;

type Entry<S extends z.ZodTypeAny> = {
  schema: S;
  describe: (c: z.infer<S>) => string;
  evaluate: (c: z.infer<S>, ctx: EvalContext) => Verdict;
};

const entry = <S extends z.ZodTypeAny>(e: Entry<S>) => e;

const chapter = (ctx: EvalContext, id: string) => ctx.world.chapters.find((c) => c.id === id);

export const registry = {
  attended_chapter: entry({
    schema: z.object({ type: z.literal("attended_chapter"), chapter_id: z.string() }),
    describe: (c) => `attended ${c.chapter_id}`,
    evaluate: (c, ctx) => {
      const ch = chapter(ctx, c.chapter_id);
      if (!ch || !hasAttended(ctx.world, ch, ctx.viewerId, ctx.now)) return NO;
      return yes(afterglowMoment(ch));
    },
  }),

  invited_to_chapter: entry({
    schema: z.object({ type: z.literal("invited_to_chapter"), chapter_id: z.string() }),
    describe: (c) => `invited to ${c.chapter_id}`,
    evaluate: (c, ctx) => {
      if (!isInvited(ctx.world, c.chapter_id, ctx.viewerId)) return NO;
      const inv = ctx.world.invitations.find((i) => i.chapter_id === c.chapter_id && i.user_id === ctx.viewerId);
      const since = inv ? new Date(inv.created_at) : null;
      if (since && since > ctx.now) return NO;
      return yes(since);
    },
  }),

  days_since_chapter: entry({
    schema: z.object({
      type: z.literal("days_since_chapter"),
      chapter_id: z.string(),
      days: z.number().int().min(0),
    }),
    describe: (c) => `${c.days} days after ${c.chapter_id}`,
    evaluate: (c, ctx) => {
      const ch = chapter(ctx, c.chapter_id);
      if (!ch || !hasAttended(ctx.world, ch, ctx.viewerId, ctx.now)) return NO;
      const from = afterglowMoment(ch);
      if (!from) return NO;
      const at = new Date(from.getTime() + c.days * DAY);
      return ctx.now >= at ? yes(at) : NO;
    },
  }),

  chapter_phase: entry({
    schema: z.object({
      type: z.literal("chapter_phase"),
      chapter_id: z.string(),
      phase: z.enum(["unannounced", "prelude", "during", "interlude", "afterglow", "past"]),
    }),
    describe: (c) => `${c.chapter_id} is in ${c.phase}`,
    evaluate: (c, ctx) => {
      const ch = chapter(ctx, c.chapter_id);
      if (!ch) return NO;
      const phase: ChapterPhase = chapterPhase(ch, ctx.now);
      if (phase !== c.phase) return NO;
      const since =
        phase === "prelude" ? ch.prelude_opens_at : phase === "during" ? ch.starts_at : phase === "interlude" ? ch.ends_at : ch.afterglow_at;
      return yes(since ? new Date(since) : null);
    },
  }),

  date_after: entry({
    schema: z.object({ type: z.literal("date_after"), date: z.string() }),
    describe: (c) => `after ${c.date}`,
    evaluate: (c, ctx) => {
      const d = new Date(c.date);
      return ctx.now >= d ? yes(d) : NO;
    },
  }),

  date_before: entry({
    schema: z.object({ type: z.literal("date_before"), date: z.string() }),
    describe: (c) => `before ${c.date}`,
    evaluate: (c, ctx) => (ctx.now < new Date(c.date) ? yes(null) : NO),
  }),

  anniversary_of_chapter: entry({
    schema: z.object({
      type: z.literal("anniversary_of_chapter"),
      chapter_id: z.string(),
      window_days: z.number().int().min(0).default(3),
    }),
    describe: (c) => `around the anniversary of ${c.chapter_id}`,
    evaluate: (c, ctx) => {
      const ch = chapter(ctx, c.chapter_id);
      if (!ch?.starts_at || !hasAttended(ctx.world, ch, ctx.viewerId, ctx.now)) return NO;
      const start = new Date(ch.starts_at);
      for (let y = start.getUTCFullYear() + 1; y <= ctx.now.getUTCFullYear() + 1; y++) {
        const a = new Date(start);
        a.setUTCFullYear(y);
        const from = a.getTime() - (c.window_days ?? 3) * DAY;
        const to = a.getTime() + (c.window_days ?? 3) * DAY;
        if (ctx.now.getTime() >= from && ctx.now.getTime() <= to) return yes(new Date(from));
      }
      return NO;
    },
  }),

  season: entry({
    schema: z.object({ type: z.literal("season"), months: z.array(z.number().int().min(1).max(12)) }),
    describe: (c) => `in months ${c.months.join(", ")}`,
    evaluate: (c, ctx) => {
      if (!c.months.includes(ctx.now.getUTCMonth() + 1)) return NO;
      return yes(new Date(Date.UTC(ctx.now.getUTCFullYear(), ctx.now.getUTCMonth(), 1)));
    },
  }),

  mutual_connection: entry({
    schema: z.object({ type: z.literal("mutual_connection"), person_id: z.string() }),
    describe: (c) => `mutual connection with ${c.person_id}`,
    evaluate: (c, ctx) => {
      const mine = ctx.world.connections.find((x) => x.from_user === ctx.viewerId && x.to_user === c.person_id);
      const theirs = ctx.world.connections.find((x) => x.from_user === c.person_id && x.to_user === ctx.viewerId);
      if (!mine || !theirs) return NO;
      const since = new Date(Math.max(+new Date(mine.created_at), +new Date(theirs.created_at)));
      return since <= ctx.now ? yes(since) : NO;
    },
  }),

  has_unlocked: entry({
    schema: z.object({
      type: z.literal("has_unlocked"),
      target_type: z.enum(["memory_object", "knowledge_item", "room", "house_event", "chapter"]),
      target_id: z.string(),
    }),
    describe: (c) => `${c.target_type} ${c.target_id} is open`,
    evaluate: (c, ctx) => {
      const s = ctx.stateOf(c.target_type, c.target_id);
      return s.state === "open" ? yes(s.since) : NO;
    },
  }),

  scanned_code: entry({
    schema: z.object({ type: z.literal("scanned_code"), code: z.string() }),
    describe: (c) => `scanned “${c.code}”`,
    evaluate: (c, ctx) => {
      const scan = ctx.world.interactions
        .filter((i) => i.user_id === ctx.viewerId && i.kind === "scan" && i.ref === c.code)
        .map((i) => new Date(i.created_at))
        .filter((d) => d <= ctx.now)
        .sort((a, b) => +a - +b)[0];
      return scan ? yes(scan) : NO;
    },
  }),
} as const;

export type LeafType = keyof typeof registry;
export type LeafCondition = { [K in LeafType]: z.infer<(typeof registry)[K]["schema"]> }[LeafType];

export type Condition =
  | LeafCondition
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

const leafSchemas = Object.values(registry).map((e) => e.schema) as unknown as [
  z.ZodTypeAny,
  z.ZodTypeAny,
  ...z.ZodTypeAny[],
];

export const conditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(conditionSchema) }).strict(),
    z.object({ any: z.array(conditionSchema) }).strict(),
    z.object({ not: conditionSchema }).strict(),
    ...leafSchemas,
  ]),
) as z.ZodType<Condition>;

/** Parse untrusted JSON (admin input, database rows) into a Condition. */
export function parseCondition(input: unknown): Condition {
  return conditionSchema.parse(input);
}

export function evaluate(cond: Condition, ctx: EvalContext): Verdict {
  if ("all" in cond) {
    if (cond.all.length === 0) return yes(null);
    let since: Date | null = null;
    for (const c of cond.all) {
      const v = evaluate(c, ctx);
      if (!v.ok) return NO;
      if (v.since && (!since || v.since > since)) since = v.since;
    }
    return yes(since);
  }
  if ("any" in cond) {
    let best: Verdict = NO;
    for (const c of cond.any) {
      const v = evaluate(c, ctx);
      if (v.ok && (!best.ok || (v.since && best.since && v.since < best.since))) best = v;
    }
    return best;
  }
  if ("not" in cond) {
    return evaluate(cond.not, ctx).ok ? NO : yes(null);
  }
  const e = registry[cond.type] as Entry<z.ZodTypeAny>;
  if (!e) return NO;
  return e.evaluate(cond, ctx);
}

export function describe(cond: Condition): string {
  if ("all" in cond) return cond.all.map(describe).join(" AND ");
  if ("any" in cond) return `(${cond.any.map(describe).join(" OR ")})`;
  if ("not" in cond) return `NOT ${describe(cond.not)}`;
  const e = registry[cond.type] as Entry<z.ZodTypeAny>;
  return e ? e.describe(cond) : cond.type;
}

// Decides, for one viewer at one moment, whether each thing in the House is
// absent, sealed or open — and since when.

import { afterglowMoment, hasAttended, isInvited } from "@/lib/domain/chapters";
import type { HouseState, TargetType, World } from "@/lib/domain/types";
import { evaluate, type EvalContext } from "./conditions";

export interface Resolution {
  state: HouseState;
  since: Date | null;
  /** Rules that currently hold for this entity (for the admin preview). */
  reasons: string[];
}

const RANK: Record<HouseState, number> = { absent: 0, sealed: 1, open: 2 };
const EFFECT_STATE = { reveal: "sealed", open: "open" } as const;

const d = (iso: string | null | undefined) => (iso ? new Date(iso) : null);

export class Resolver {
  private memo = new Map<string, Resolution>();
  private visiting = new Set<string>();
  private ctx: EvalContext;

  constructor(
    private world: World,
    private viewerId: string,
    private now: Date,
  ) {
    this.ctx = {
      world,
      viewerId,
      now,
      stateOf: (type, id) => this.resolve(type, id),
    };
  }

  resolve(type: TargetType, id: string): Resolution {
    const key = `${type}:${id}`;
    const hit = this.memo.get(key);
    if (hit) return hit;
    // A rule that depends on itself never holds.
    if (this.visiting.has(key)) return { state: "absent", since: null, reasons: [] };
    this.visiting.add(key);
    const r = this.compute(type, id);
    this.visiting.delete(key);
    this.memo.set(key, r);
    return r;
  }

  /** Base state after scoping: who this thing can exist for at all. */
  private base(type: TargetType, id: string): { state: HouseState; since: Date | null; scoped: boolean } | null {
    const { world, viewerId, now } = this;
    const attended = (chapterId: string) => {
      const ch = world.chapters.find((c) => c.id === chapterId);
      return ch && hasAttended(world, ch, viewerId, now) ? ch : null;
    };

    switch (type) {
      case "memory_object": {
        const o = world.objects.find((x) => x.id === id);
        if (!o) return null;
        if (o.user_id && o.user_id !== viewerId) return { state: "absent", since: null, scoped: true };
        if (o.chapter_id) {
          const ch = attended(o.chapter_id);
          if (!ch) return { state: "absent", since: null, scoped: true };
          return { state: o.base_state, since: afterglowMoment(ch), scoped: false };
        }
        return { state: o.base_state, since: d(o.created_at), scoped: false };
      }
      case "knowledge_item": {
        const k = world.knowledge.find((x) => x.id === id);
        if (!k) return null;
        if (k.chapter_id) {
          const ch = attended(k.chapter_id);
          if (!ch) return { state: "absent", since: null, scoped: true };
          return { state: k.base_state, since: afterglowMoment(ch), scoped: false };
        }
        return { state: k.base_state, since: d(k.created_at), scoped: false };
      }
      case "house_event": {
        const e = world.events.find((x) => x.id === id);
        if (!e) return null;
        if (e.user_id && e.user_id !== viewerId) return { state: "absent", since: null, scoped: true };
        if (e.chapter_id && !isInvited(world, e.chapter_id, viewerId)) return { state: "absent", since: null, scoped: true };
        const starts = d(e.starts_at);
        const ends = d(e.ends_at);
        if ((starts && now < starts) || (ends && now >= ends)) return { state: "absent", since: null, scoped: true };
        return { state: e.base_state, since: starts ?? d(e.created_at), scoped: false };
      }
      case "room": {
        const r = world.rooms.find((x) => x.key === id);
        if (!r) return null;
        return { state: r.base_state, since: null, scoped: false };
      }
      case "chapter": {
        const c = world.chapters.find((x) => x.id === id);
        if (!c) return null;
        const state: HouseState = isInvited(world, c.id, viewerId) ? "open" : c.base_state;
        return { state, since: d(c.prelude_opens_at), scoped: false };
      }
    }
  }

  private compute(type: TargetType, id: string): Resolution {
    const base = this.base(type, id);
    if (!base || base.scoped) return { state: "absent", since: null, reasons: [] };

    let state = base.state;
    let since = base.since;
    const reasons: string[] = [];

    const raise = (to: HouseState, at: Date | null, reason: string) => {
      reasons.push(reason);
      if (RANK[to] > RANK[state]) {
        state = to;
        since = at;
      } else if (to === state && at && (!since || at < since)) {
        since = at;
      }
    };

    for (const rule of this.world.rules) {
      if (!rule.active || rule.target_type !== type || rule.target_id !== id) continue;
      const v = evaluate(rule.conditions, this.ctx);
      if (v.ok) raise(EFFECT_STATE[rule.effect], v.since, rule.name);
    }

    const grant = this.world.unlocks.find(
      (u) => u.user_id === this.viewerId && u.target_type === type && u.target_id === id && u.granted_state,
    );
    if (grant?.granted_state && (!grant.granted_at || new Date(grant.granted_at) <= this.now)) {
      raise(grant.granted_state, d(grant.granted_at), `granted (${grant.source ?? "host"})`);
    }

    return { state, since, reasons };
  }
}

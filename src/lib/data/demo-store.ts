import "server-only";
import * as seed from "@/lib/seed";
import type { World } from "@/lib/domain/types";
import type { HouseStore, Row, Table } from "./store";
import { PRIMARY_KEYS } from "./store";
import { WORLD_KEY, privateTo } from "./tables";

type Data = Omit<World, "viewer">;

const fresh = (): Data =>
  structuredClone({
    profiles: seed.profiles,
    chapters: seed.chapters,
    participants: seed.participants,
    preludes: seed.preludes,
    invitations: seed.invitations,
    rooms: seed.rooms,
    media: seed.media,
    objects: seed.objects,
    memories: seed.memories,
    knowledge: seed.knowledge,
    events: seed.events,
    rules: seed.rules,
    unlocks: seed.unlocks,
    connections: seed.connections,
    journal: seed.journal,
    interactions: seed.interactions,
  });

// Survives hot reloads in development. Resets when the server restarts.
const g = globalThis as unknown as { __house?: Data };
const data = () => (g.__house ??= fresh());

const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const matches = (row: Row, key: Row) => Object.entries(key).every(([k, v]) => row[k] === v);

export class DemoStore implements HouseStore {
  readonly mode = "demo" as const;

  async loadWorld(viewerId: string): Promise<World | null> {
    const d = data();
    const viewer = d.profiles.find((p) => p.id === viewerId);
    if (!viewer) return null;
    return structuredClone({ ...d, ...privateTo(d, viewerId), viewer });
  }

  async getProfile(id: string) {
    return data().profiles.find((p) => p.id === id) ?? null;
  }

  async listProfiles() {
    return [...data().profiles];
  }

  async markSeen(userId: string, type: World["unlocks"][number]["target_type"], targetId: string, at: Date) {
    const d = data();
    const u = d.unlocks.find((x) => x.user_id === userId && x.target_type === type && x.target_id === targetId);
    if (u) u.seen_at = at.toISOString();
    else
      d.unlocks.push({ id: id("unl"), user_id: userId, target_type: type, target_id: targetId, granted_state: null, granted_at: null, seen_at: at.toISOString(), source: null });
  }

  async grant(userId: string, type: World["unlocks"][number]["target_type"], targetId: string, state: World["unlocks"][number]["granted_state"], source: string, at: Date) {
    const d = data();
    const u = d.unlocks.find((x) => x.user_id === userId && x.target_type === type && x.target_id === targetId);
    if (u) Object.assign(u, { granted_state: state, granted_at: at.toISOString(), source });
    else d.unlocks.push({ id: id("unl"), user_id: userId, target_type: type, target_id: targetId, granted_state: state, granted_at: at.toISOString(), seen_at: null, source });
  }

  async recordInteraction(i: Omit<World["interactions"][number], "id">) {
    data().interactions.push({ id: id("int"), ...i });
  }

  async setConsent(from: string, to: string, chapterId: string | null, consent: boolean, at: Date) {
    const d = data();
    d.connections = d.connections.filter((c) => !(c.from_user === from && c.to_user === to));
    if (consent) d.connections.push({ id: id("con"), from_user: from, to_user: to, chapter_id: chapterId, created_at: at.toISOString() });
  }

  async writeJournal(e: Omit<World["journal"][number], "id">) {
    data().journal.push({ id: id("j"), ...e });
  }

  async list(table: Table) {
    return structuredClone(data()[WORLD_KEY[table]]) as unknown as Row[];
  }

  async upsert(table: Table, row: Row) {
    const rows = data()[WORLD_KEY[table]] as unknown as Row[];
    const pk = PRIMARY_KEYS[table];
    if (pk.length === 1 && pk[0] === "id" && !row.id) row.id = id(table.split("_")[0].slice(0, 4));
    if (table === "memory_objects" || table === "knowledge_items" || table === "house_events") row.created_at ??= new Date().toISOString();
    const key = Object.fromEntries(pk.map((k) => [k, row[k]]));
    const existing = rows.find((r) => matches(r, key));
    if (existing) Object.assign(existing, row);
    else rows.push(row);
  }

  async remove(table: Table, key: Row) {
    const d = data() as unknown as Record<string, Row[]>;
    const k = WORLD_KEY[table];
    d[k] = d[k].filter((r) => !matches(r, key));
  }
}

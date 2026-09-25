import type { World } from "@/lib/domain/types";
import type { Table } from "./store";

/** Which World collection each table fills. */
export const WORLD_KEY: Record<Table, Exclude<keyof World, "viewer">> = {
  chapters: "chapters",
  chapter_participants: "participants",
  profiles: "profiles",
  preludes: "preludes",
  invitations: "invitations",
  rooms: "rooms",
  memory_objects: "objects",
  memories: "memories",
  media_assets: "media",
  knowledge_items: "knowledge",
  house_events: "events",
  unlock_rules: "rules",
  user_unlocks: "unlocks",
  people_connections: "connections",
  journal_entries: "journal",
  interactions: "interactions",
};

/** Rows that belong to one person and must never reach anyone else. */
export function privateTo<T extends World>(w: Omit<T, "viewer">, viewerId: string) {
  return {
    unlocks: w.unlocks.filter((u) => u.user_id === viewerId),
    journal: w.journal.filter((j) => j.user_id === viewerId),
    interactions: w.interactions.filter((i) => i.user_id === viewerId),
    connections: w.connections.filter((c) => c.from_user === viewerId || c.to_user === viewerId),
    invitations: w.invitations.filter((i) => i.user_id === viewerId),
  };
}

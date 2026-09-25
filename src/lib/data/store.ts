import "server-only";
import type {
  HouseState,
  Interaction,
  JournalEntry,
  Profile,
  TargetType,
  World,
} from "@/lib/domain/types";

/** Tables the admin can manage. Keys match the database. */
export const TABLES = [
  "chapters",
  "chapter_participants",
  "profiles",
  "preludes",
  "invitations",
  "rooms",
  "memory_objects",
  "memories",
  "media_assets",
  "knowledge_items",
  "house_events",
  "unlock_rules",
  "user_unlocks",
  "people_connections",
  "journal_entries",
  "interactions",
] as const;
export type Table = (typeof TABLES)[number];

export type Row = Record<string, unknown>;

export interface HouseStore {
  readonly mode: "demo" | "supabase";

  /** Everything needed to compose the House for one viewer. Private rows are limited to that viewer. */
  loadWorld(viewerId: string): Promise<World | null>;
  getProfile(id: string): Promise<Profile | null>;
  listProfiles(): Promise<Profile[]>;

  markSeen(userId: string, type: TargetType, id: string, at: Date): Promise<void>;
  grant(userId: string, type: TargetType, id: string, state: HouseState, source: string, at: Date): Promise<void>;
  recordInteraction(i: Omit<Interaction, "id">): Promise<void>;
  setConsent(from: string, to: string, chapterId: string | null, consent: boolean, at: Date): Promise<void>;
  writeJournal(e: Omit<JournalEntry, "id">): Promise<void>;

  // Admin
  list(table: Table): Promise<Row[]>;
  upsert(table: Table, row: Row): Promise<void>;
  remove(table: Table, key: Row): Promise<void>;
}

/** Primary key columns per table. */
export const PRIMARY_KEYS: Record<Table, string[]> = {
  chapters: ["id"],
  chapter_participants: ["chapter_id", "user_id"],
  profiles: ["id"],
  preludes: ["id"],
  invitations: ["id"],
  rooms: ["key"],
  memory_objects: ["id"],
  memories: ["id"],
  media_assets: ["id"],
  knowledge_items: ["id"],
  house_events: ["id"],
  unlock_rules: ["id"],
  user_unlocks: ["id"],
  people_connections: ["id"],
  journal_entries: ["id"],
  interactions: ["id"],
};

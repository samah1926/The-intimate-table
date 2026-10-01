// Domain types. Field names mirror the database (snake_case) so rows need no mapping.
// See DATABASE_SCHEMA.md.

import type { Condition } from "@/lib/rules/conditions";

export type HouseState = "absent" | "sealed" | "open";
export type ISODate = string;

export type RoomKey = "hall" | "table" | "library" | "studio" | "memory" | "door";

export interface Profile {
  id: string;
  display_name: string;
  first_name: string;
  place_card_motif: string;
  line: string | null;
  contact: string | null;
  role: "guest" | "host";
}

export interface ChapterIdentity {
  paper?: string;
  ink?: string;
  accent?: string;
  motif?: string;
}

export interface Chapter {
  id: string;
  slug: string;
  number: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  location_label: string | null;
  prelude_opens_at: ISODate | null;
  starts_at: ISODate | null;
  ends_at: ISODate | null;
  afterglow_at: ISODate | null;
  identity: ChapterIdentity;
  base_state: HouseState;
  sort: number;
}

export type ParticipantStatus = "invited" | "confirmed" | "attended" | "declined";

export interface ChapterParticipant {
  chapter_id: string;
  user_id: string;
  status: ParticipantStatus;
  role: "guest" | "host" | "coach" | "chef" | "speaker";
  seat_label: string | null;
  place_card_motif: string | null;
}

export type PreludeKind =
  | "question"
  | "music"
  | "clue"
  | "coordinates"
  | "dress"
  | "bring"
  | "challenge"
  | "thought";

export interface Prelude {
  id: string;
  chapter_id: string;
  kind: PreludeKind;
  title: string;
  body: string | null;
  response_prompt: string | null;
  opens_at: ISODate | null;
  sort: number;
}

export interface Invitation {
  id: string;
  chapter_id: string;
  user_id: string;
  code: string;
  message: string | null;
  status: "sent" | "opened" | "accepted" | "declined";
  expires_at: ISODate | null;
  opened_at: ISODate | null;
  created_at: ISODate;
}

export interface Room {
  key: RoomKey;
  name: string;
  epigraph: string | null;
  base_state: HouseState;
  sort: number;
}

export interface MediaAsset {
  id: string;
  kind: "image" | "audio" | "video";
  url: string | null;
  storage_path: string | null;
  alt: string | null;
  caption: string | null;
  credit: string | null;
  /** Placeholder drawing used until a real file exists. */
  scene: string | null;
  chapter_id: string | null;
  owner_user_id: string | null;
}

export type ObjectKind =
  | "envelope"
  | "invitation"
  | "note"
  | "menu"
  | "photograph"
  | "record"
  | "shoes"
  | "flower"
  | "key"
  | "place_card"
  | "stone"
  | "postcard"
  | "book"
  | "mat"
  | "bowl"
  | "bib";

export interface Placement {
  /** degrees */
  rotate?: number;
  /** vertical offset in rem, for a hand-placed feel */
  lift?: number;
  size?: "sm" | "md" | "lg";
  /** Where it lies in a room drawn as a scene: centre x / y and width, in % of the scene. */
  x?: number;
  y?: number;
  w?: number;
  /** The same, on a narrow (portrait) screen. */
  mx?: number;
  my?: number;
  mw?: number;
}

export interface MemoryObject {
  id: string;
  slug: string;
  kind: ObjectKind;
  label: string | null;
  title: string;
  caption: string | null;
  room_key: RoomKey;
  chapter_id: string | null;
  user_id: string | null;
  base_state: HouseState;
  sealed_hint: string | null;
  placement: Placement;
  sort: number;
  created_at: ISODate;
}

export type MemoryBlock =
  | { type: "note"; text: string }
  | { type: "photos"; media_ids: string[] }
  | { type: "learned"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "people"; people?: { name: string; role?: string }[]; from_chapter?: boolean }
  | { type: "music"; side?: string; tracks: { title: string; artist: string }[]; sealed?: boolean }
  | { type: "recipe"; title: string; serves?: string; ingredients: string[]; steps: string[] }
  | { type: "route"; label: string; distance?: string; points: [number, number][] }
  | { type: "audio"; media_id: string; caption?: string }
  | { type: "journal"; prompt: string }
  | { type: "schedule"; title?: string; days: { day: string; items: [string, string][] }[] };

export interface Memory {
  id: string;
  object_id: string;
  title: string | null;
  occurred_at: ISODate | null;
  location_label: string | null;
  blocks: MemoryBlock[];
}

export type KnowledgeKind = "book" | "notebook" | "card" | "letter" | "audio" | "annotated";

export interface KnowledgeItem {
  id: string;
  slug: string;
  kind: KnowledgeKind;
  subject: string;
  title: string;
  author: string | null;
  excerpt: string | null;
  body: string | null;
  chapter_id: string | null;
  base_state: HouseState;
  sealed_hint: string | null;
  spine: { height?: number; tone?: "ink" | "clay" | "moss" | "bone" | "linen"; cover?: string };
  sort: number;
  created_at: ISODate;
}

export interface HouseEvent {
  id: string;
  kind: "letter" | "clue" | "seasonal" | "notice";
  room_key: RoomKey;
  title: string | null;
  body: string;
  signature: string | null;
  chapter_id: string | null;
  user_id: string | null;
  base_state: HouseState;
  starts_at: ISODate | null;
  ends_at: ISODate | null;
  created_at: ISODate;
}

export type TargetType = "memory_object" | "knowledge_item" | "room" | "house_event" | "chapter";

export interface UnlockRule {
  id: string;
  name: string;
  target_type: TargetType;
  target_id: string;
  effect: "reveal" | "open";
  conditions: Condition;
  active: boolean;
  notes: string | null;
}

export interface UserUnlock {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string;
  granted_state: HouseState | null;
  granted_at: ISODate | null;
  seen_at: ISODate | null;
  source: string | null;
}

export interface PeopleConnection {
  id: string;
  from_user: string;
  to_user: string;
  chapter_id: string | null;
  created_at: ISODate;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  chapter_id: string | null;
  prelude_id: string | null;
  object_id: string | null;
  prompt: string | null;
  body: string;
  sealed_until: ISODate | null;
  created_at: ISODate;
}

export interface Interaction {
  id: string;
  user_id: string;
  kind: "scan";
  ref: string;
  created_at: ISODate;
}

/** Everything the House needs to compose itself for one viewer. */
export interface World {
  viewer: Profile;
  profiles: Profile[];
  chapters: Chapter[];
  participants: ChapterParticipant[];
  preludes: Prelude[];
  invitations: Invitation[];
  rooms: Room[];
  media: MediaAsset[];
  objects: MemoryObject[];
  memories: Memory[];
  knowledge: KnowledgeItem[];
  events: HouseEvent[];
  rules: UnlockRule[];
  unlocks: UserUnlock[];
  connections: PeopleConnection[];
  journal: JournalEntry[];
  interactions: Interaction[];
}

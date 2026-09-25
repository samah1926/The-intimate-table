import type { Table } from "@/lib/data/store";

// The back office is driven by this description of each table.
// Adding a column to the admin = adding a field here.

export type FieldType = "text" | "textarea" | "number" | "bool" | "datetime" | "select" | "ref" | "json";

export interface Field {
  name: string;
  label?: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  /** For `ref`: which table, and which column to show. */
  ref?: { table: Table; label: string; value?: string };
  help?: string;
  /** Leave blank on create to let the database (or demo store) fill it. */
  auto?: boolean;
}

export interface Resource {
  table: Table;
  label: string;
  group: "Chapters" | "The House" | "Logic" | "People";
  description: string;
  title: string;
  columns: string[];
  fields: Field[];
}

const STATES = ["open", "sealed", "absent"] as const;
const ROOMS = ["hall", "table", "library", "studio", "memory", "door"] as const;
const TARGETS = ["memory_object", "knowledge_item", "room", "house_event", "chapter"] as const;
const MOTIFS = ["scallop", "cockle", "auger", "limpet", "urchin", "coral", "sprig", "stone", "pebble"] as const;
export const OBJECT_KINDS = [
  "envelope", "invitation", "note", "menu", "photograph", "record", "shoes", "flower", "key",
  "place_card", "stone", "postcard", "book", "mat", "bowl", "bib",
] as const;
const SCENES = ["table", "candle", "hands", "road", "dawn", "window", "linen"] as const;

const id: Field = { name: "id", type: "text", auto: true, help: "Leave blank to generate. Readable ids (obj-…) make rules easier to write." };
const createdAt: Field = { name: "created_at", type: "datetime", auto: true };
const chapter: Field = { name: "chapter_id", label: "Chapter", type: "ref", ref: { table: "chapters", label: "title" } };
const person = (name: string, label: string, required = false): Field => ({
  name,
  label,
  type: "ref",
  required,
  ref: { table: "profiles", label: "display_name" },
});

export const RESOURCES: Resource[] = [
  {
    table: "chapters",
    label: "Chapters",
    group: "Chapters",
    description: "Real experiences. Dates drive the prelude, the quiet during, and the afterglow.",
    title: "title",
    columns: ["number", "title", "starts_at", "base_state"],
    fields: [
      id,
      { name: "slug", type: "text", required: true },
      { name: "number", type: "text", required: true, help: "Shown as-is: 0, 01, 02…" },
      { name: "title", type: "text", help: "Leave empty to keep it untitled in the contents." },
      { name: "subtitle", type: "text" },
      { name: "description", type: "textarea" },
      { name: "location_label", label: "Location (as guests see it)", type: "text" },
      { name: "prelude_opens_at", label: "Prelude opens", type: "datetime" },
      { name: "starts_at", label: "Starts", type: "datetime" },
      { name: "ends_at", label: "Ends", type: "datetime" },
      { name: "afterglow_at", label: "Afterglow (the House changes)", type: "datetime", help: "Usually the next morning." },
      { name: "identity", type: "json", help: '{"paper":"#efe9dd","ink":"#1c1a17","motif":"thread"}' },
      { name: "base_state", label: "Visible in contents", type: "select", options: STATES, required: true, help: "open: listed with title · sealed: listed untitled · absent: hidden. Invited guests always see it." },
      { name: "sort", type: "number" },
    ],
  },
  {
    table: "chapter_participants",
    label: "Participants",
    group: "Chapters",
    description: "Who was — or will be — at each Chapter. Attendance only counts once the afterglow has begun.",
    title: "user_id",
    columns: ["chapter_id", "user_id", "status", "role"],
    fields: [
      { ...chapter, required: true },
      person("user_id", "Person", true),
      { name: "status", type: "select", options: ["invited", "confirmed", "attended", "declined"], required: true },
      { name: "role", type: "select", options: ["guest", "host", "coach", "chef", "speaker"], required: true },
      { name: "seat_label", type: "text" },
      { name: "place_card_motif", label: "Place card motif", type: "select", options: MOTIFS },
    ],
  },
  {
    table: "preludes",
    label: "Preludes",
    group: "Chapters",
    description: "The one thing before a Chapter. One is better than ten.",
    title: "title",
    columns: ["chapter_id", "kind", "title", "opens_at"],
    fields: [
      id,
      { ...chapter, required: true },
      { name: "kind", type: "select", options: ["question", "music", "clue", "coordinates", "dress", "bring", "challenge", "thought"], required: true },
      { name: "title", type: "text", required: true },
      { name: "body", type: "textarea" },
      { name: "response_prompt", label: "Ask for an answer", type: "text", help: "If set, guests can write a reply. It is kept and can resurface later (journal blocks)." },
      { name: "opens_at", type: "datetime" },
      { name: "sort", type: "number" },
    ],
  },
  {
    table: "invitations",
    label: "Invitations",
    group: "Chapters",
    description: "Private ways in. Also used by rules (invited_to_chapter).",
    title: "code",
    columns: ["chapter_id", "user_id", "status", "created_at"],
    fields: [
      id,
      { ...chapter, required: true },
      person("user_id", "Person", true),
      { name: "code", type: "text", required: true },
      { name: "message", type: "textarea" },
      { name: "status", type: "select", options: ["sent", "opened", "accepted", "declined"], required: true },
      { name: "expires_at", type: "datetime" },
      createdAt,
    ],
  },
  {
    table: "memory_objects",
    label: "Objects",
    group: "The House",
    description: "Things resting in rooms. An object with a Chapter exists only for those who attended it.",
    title: "title",
    columns: ["title", "kind", "room_key", "chapter_id", "base_state"],
    fields: [
      id,
      { name: "slug", type: "text", required: true },
      { name: "kind", type: "select", options: OBJECT_KINDS, required: true },
      { name: "title", type: "text", required: true },
      { name: "label", type: "text", help: "Printed on the object in spaced capitals." },
      { name: "caption", type: "textarea" },
      { name: "room_key", label: "Room", type: "select", options: ROOMS, required: true },
      chapter,
      person("user_id", "Only for this person"),
      { name: "base_state", type: "select", options: STATES, required: true, help: "Rules can raise it: absent → sealed → open." },
      { name: "sealed_hint", type: "text", help: "What a tied object says. “Not before March.”" },
      { name: "placement", type: "json", help: '{"rotate":-4,"lift":1,"size":"sm|md|lg"}' },
      { name: "sort", type: "number" },
      createdAt,
    ],
  },
  {
    table: "memories",
    label: "Memories",
    group: "The House",
    description: "What an object holds, as a sequence of blocks.",
    title: "title",
    columns: ["object_id", "title", "occurred_at"],
    fields: [
      id,
      { name: "object_id", label: "Object", type: "ref", required: true, ref: { table: "memory_objects", label: "title" } },
      { name: "title", type: "text" },
      { name: "occurred_at", type: "datetime" },
      { name: "location_label", type: "text" },
      {
        name: "blocks",
        type: "json",
        required: true,
        help:
          'Array of blocks: note{text} · quote{text,attribution} · photos{media_ids[]} · learned{text} · people{people[] | from_chapter:true} · music{side,tracks[{title,artist}]} · recipe{title,serves,ingredients[],steps[]} · route{label,distance,points[[x,y]]} · audio{media_id} · journal{prompt}',
      },
    ],
  },
  {
    table: "media_assets",
    label: "Media",
    group: "The House",
    description: "Photographs, audio, video. Until a file exists, a drawn scene stands in.",
    title: "caption",
    columns: ["id", "kind", "caption", "scene"],
    fields: [
      id,
      { name: "kind", type: "select", options: ["image", "audio", "video"], required: true },
      { name: "url", type: "text", help: "Any public or signed URL." },
      { name: "storage_path", type: "text", help: "Path in the private `house` bucket." },
      { name: "scene", label: "Placeholder scene", type: "select", options: SCENES },
      { name: "alt", type: "text" },
      { name: "caption", type: "text" },
      { name: "credit", type: "text" },
      chapter,
      person("owner_user_id", "Private to"),
    ],
  },
  {
    table: "knowledge_items",
    label: "Library",
    group: "The House",
    description: "Books, notebooks and cards. With a Chapter, only its guests find it on the shelf.",
    title: "title",
    columns: ["title", "kind", "subject", "base_state"],
    fields: [
      id,
      { name: "slug", type: "text", required: true },
      { name: "kind", type: "select", options: ["book", "notebook", "card", "letter", "audio", "annotated"], required: true },
      { name: "subject", type: "text", required: true },
      { name: "title", type: "text", required: true },
      { name: "author", type: "text" },
      { name: "excerpt", type: "text" },
      { name: "body", type: "textarea" },
      chapter,
      { name: "base_state", type: "select", options: STATES, required: true },
      { name: "sealed_hint", type: "text" },
      { name: "spine", type: "json", help: '{"height":90,"tone":"ink|clay|moss|bone|linen"}' },
      { name: "sort", type: "number" },
      createdAt,
    ],
  },
  {
    table: "house_events",
    label: "Letters & clues",
    group: "The House",
    description: "Things that happen in the House: letters, clues, seasonal notes. {first_name} is replaced.",
    title: "title",
    columns: ["kind", "room_key", "title", "starts_at", "base_state"],
    fields: [
      id,
      { name: "kind", type: "select", options: ["letter", "clue", "seasonal", "notice"], required: true },
      { name: "room_key", label: "Room", type: "select", options: ROOMS, required: true },
      { name: "title", type: "text" },
      { name: "body", type: "textarea", required: true },
      { name: "signature", type: "text" },
      { ...chapter, help: "With a Chapter: only for people invited to it." },
      person("user_id", "Only for this person"),
      { name: "base_state", type: "select", options: STATES, required: true },
      { name: "starts_at", label: "Appears", type: "datetime" },
      { name: "ends_at", label: "Disappears", type: "datetime" },
      createdAt,
    ],
  },
  {
    table: "rooms",
    label: "Rooms",
    group: "The House",
    description: "The plan. The Unmarked Door starts absent and is revealed by rules.",
    title: "name",
    columns: ["key", "name", "base_state"],
    fields: [
      { name: "key", type: "select", options: ROOMS, required: true },
      { name: "name", type: "text", required: true },
      { name: "epigraph", type: "text" },
      { name: "base_state", type: "select", options: STATES, required: true },
      { name: "sort", type: "number" },
    ],
  },
  {
    table: "unlock_rules",
    label: "Rules",
    group: "Logic",
    description: "IF conditions THEN reveal (→ sealed) or open. Evaluated per person, every visit.",
    title: "name",
    columns: ["name", "target_type", "target_id", "effect", "active"],
    fields: [
      id,
      { name: "name", type: "text", required: true },
      { name: "target_type", type: "select", options: TARGETS, required: true },
      { name: "target_id", type: "text", required: true, help: "The id of the object, book, letter or chapter — or the room key." },
      { name: "effect", type: "select", options: ["reveal", "open"], required: true },
      { name: "conditions", type: "json", required: true },
      { name: "active", type: "bool" },
      { name: "notes", type: "textarea" },
    ],
  },
  {
    table: "user_unlocks",
    label: "Grants & seen",
    group: "Logic",
    description: "Per person: a host's gift (granted state), and when something was first opened.",
    title: "target_id",
    columns: ["user_id", "target_type", "target_id", "granted_state", "seen_at"],
    fields: [
      id,
      person("user_id", "Person", true),
      { name: "target_type", type: "select", options: TARGETS, required: true },
      { name: "target_id", type: "text", required: true },
      { name: "granted_state", type: "select", options: STATES },
      { name: "granted_at", type: "datetime" },
      { name: "seen_at", type: "datetime" },
      { name: "source", type: "text" },
    ],
  },
  {
    table: "interactions",
    label: "Scans",
    group: "Logic",
    description: "Physical signals: a QR or NFC card scanned at a Chapter (/r/<code>).",
    title: "ref",
    columns: ["user_id", "kind", "ref", "created_at"],
    fields: [id, person("user_id", "Person", true), { name: "kind", type: "select", options: ["scan"], required: true }, { name: "ref", label: "Code", type: "text", required: true }, createdAt],
  },
  {
    table: "profiles",
    label: "People",
    group: "People",
    description: "Everyone in the House. With Supabase, a profile is created when someone is invited to sign in.",
    title: "display_name",
    columns: ["display_name", "role", "place_card_motif"],
    fields: [
      { name: "id", type: "text", required: true, help: "With Supabase this must be the auth user id." },
      { name: "display_name", type: "text", required: true },
      { name: "first_name", type: "text", required: true },
      { name: "place_card_motif", type: "select", options: MOTIFS, required: true },
      { name: "line", type: "text", help: "One sentence others at the table may read." },
      { name: "contact", type: "text", help: "Revealed only on mutual consent." },
      { name: "role", type: "select", options: ["guest", "host"], required: true },
    ],
  },
  {
    table: "people_connections",
    label: "Consents",
    group: "People",
    description: "One row per direction. A connection is revealed only when both rows exist.",
    title: "id",
    columns: ["from_user", "to_user", "chapter_id", "created_at"],
    fields: [id, person("from_user", "From", true), person("to_user", "To", true), chapter, createdAt],
  },
  {
    table: "journal_entries",
    label: "Journal",
    group: "People",
    description: "What people wrote. Private; shown only to its author.",
    title: "prompt",
    columns: ["user_id", "chapter_id", "prompt", "created_at"],
    fields: [
      id,
      person("user_id", "Person", true),
      chapter,
      { name: "prelude_id", label: "Prelude", type: "ref", ref: { table: "preludes", label: "title" } },
      { name: "object_id", label: "Object", type: "ref", ref: { table: "memory_objects", label: "title" } },
      { name: "prompt", type: "text" },
      { name: "body", type: "textarea", required: true },
      { name: "sealed_until", type: "datetime" },
      createdAt,
    ],
  },
];

export function resource(table: string) {
  return RESOURCES.find((r) => r.table === table);
}

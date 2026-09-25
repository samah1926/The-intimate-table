// Composes the House for one viewer at one moment.
// Only what this person may see leaves this function. Sealed things carry
// their silhouette and a hint, never their contents.

import { chapterLabel, chapterPhase, hasAttended, isInvited, type ChapterPhase } from "@/lib/domain/chapters";
import type {
  Chapter,
  HouseState,
  KnowledgeItem,
  MediaAsset,
  MemoryBlock,
  MemoryObject,
  Placement,
  Profile,
  RoomKey,
  TargetType,
  World,
} from "@/lib/domain/types";
import { Resolver } from "@/lib/rules/resolve";

const DAY = 86_400_000;
/** How long something counts as "recently appeared" if it hasn't been opened. */
const NEW_FOR_DAYS = 21;

// ── View types ───────────────────────────────────────────────────────────

export interface ChapterRef {
  id: string;
  slug: string;
  number: string;
  title: string | null;
  label: string;
}

export interface MediaView {
  id: string;
  kind: MediaAsset["kind"];
  url: string | null;
  scene: string | null;
  alt: string;
  caption: string | null;
}

export type BlockView =
  | Exclude<MemoryBlock, { type: "photos" } | { type: "journal" } | { type: "people" } | { type: "audio" }>
  | { type: "photos"; photos: MediaView[] }
  | { type: "audio"; media: MediaView | null; caption?: string }
  | { type: "people"; people: { name: string; role?: string }[] }
  | { type: "journal"; prompt: string; body: string | null; written_at: string | null };

export interface MemoryView {
  title: string | null;
  occurred_at: string | null;
  location_label: string | null;
  blocks: BlockView[];
}

export interface ObjectView {
  id: string;
  slug: string;
  kind: MemoryObject["kind"];
  label: string | null;
  title: string;
  caption: string | null;
  room: RoomKey;
  state: Exclude<HouseState, "absent">;
  since: string | null;
  isNew: boolean;
  sealed_hint: string | null;
  placement: Placement;
  chapter: ChapterRef | null;
  memory: MemoryView | null;
}

export interface KnowledgeView {
  id: string;
  slug: string;
  kind: KnowledgeItem["kind"];
  subject: string;
  title: string;
  author: string | null;
  excerpt: string | null;
  body: string | null;
  state: Exclude<HouseState, "absent">;
  isNew: boolean;
  sealed_hint: string | null;
  spine: KnowledgeItem["spine"];
  chapter: ChapterRef | null;
}

export interface LetterView {
  id: string;
  kind: "letter" | "clue" | "seasonal" | "notice";
  title: string | null;
  body: string;
  signature: string | null;
  since: string | null;
}

export interface PreludeView {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  response_prompt: string | null;
  answer: string | null;
}

export interface ChapterMoment {
  chapter: ChapterRef & { subtitle: string | null; description: string | null; location_label: string | null; starts_at: string | null };
  phase: ChapterPhase;
  invitation: { message: string | null; code: string } | null;
  preludes: PreludeView[];
  attended: boolean;
}

export interface PlaceCardView {
  person_id: string;
  first_name: string;
  motif: string;
  line: string | null;
  role: string;
  chapter: ChapterRef;
  /** Never reveals whether the other person asked. */
  connection: "none" | "asked" | "mutual";
  contact: string | null;
}

export interface RoomView {
  key: RoomKey;
  name: string;
  epigraph: string | null;
  state: HouseState;
}

export interface ContentsLine {
  number: string;
  title: string | null;
  lived: boolean;
  current: boolean;
}

export interface HouseView {
  now: string;
  viewer: { id: string; first_name: string; role: Profile["role"] };
  hasLived: boolean;
  rooms: RoomView[];
  hall: {
    letters: LetterView[];
    clues: LetterView[];
    moments: ChapterMoment[];
    recent: { room: RoomKey; title: string; slug: string; kind: string }[];
    contents: ContentsLine[];
  };
  objects: ObjectView[];
  library: KnowledgeView[];
  table: { placeCards: PlaceCardView[] };
  door: { letters: LetterView[] };
}

// ── Composition ──────────────────────────────────────────────────────────

export function composeHouse(world: World, now: Date): HouseView {
  const viewer = world.viewer;
  const resolver = new Resolver(world, viewer.id, now);

  const seenAt = (type: TargetType, id: string) =>
    world.unlocks.find((u) => u.user_id === viewer.id && u.target_type === type && u.target_id === id)?.seen_at ?? null;

  const isNew = (type: TargetType, id: string, since: Date | null, origin: string) => {
    if (origin === "base" || !since || now.getTime() - since.getTime() > NEW_FOR_DAYS * DAY) return false;
    const seen = seenAt(type, id);
    return !seen || new Date(seen) < since;
  };

  const chapterRef = (id: string | null): ChapterRef | null => {
    const c = id ? world.chapters.find((x) => x.id === id) : undefined;
    return c ? { id: c.id, slug: c.slug, number: c.number, title: c.title, label: chapterLabel(c) } : null;
  };

  const media = (id: string): MediaView | null => {
    const m = world.media.find((x) => x.id === id);
    if (!m || (m.owner_user_id && m.owner_user_id !== viewer.id)) return null;
    return { id: m.id, kind: m.kind, url: m.url, scene: m.scene, alt: m.alt ?? "", caption: m.caption };
  };

  const blocksFor = (obj: MemoryObject, blocks: MemoryBlock[]): BlockView[] =>
    blocks.flatMap((b): BlockView[] => {
      switch (b.type) {
        case "photos": {
          const photos = b.media_ids.map(media).filter((m): m is MediaView => !!m);
          return photos.length ? [{ type: "photos", photos }] : [];
        }
        case "audio":
          return [{ type: "audio", media: media(b.media_id), caption: b.caption }];
        case "people": {
          let people = b.people ?? [];
          if (b.from_chapter && obj.chapter_id) {
            people = world.participants
              .filter((p) => p.chapter_id === obj.chapter_id && p.status === "attended" && p.user_id !== viewer.id)
              .map((p) => {
                const prof = world.profiles.find((x) => x.id === p.user_id);
                return { name: prof?.first_name ?? "Someone", role: p.role === "guest" ? undefined : p.role };
              });
          }
          return people.length ? [{ type: "people", people }] : [];
        }
        case "journal": {
          const entry = world.journal
            .filter((j) => j.user_id === viewer.id && (j.object_id === obj.id || (j.chapter_id === obj.chapter_id && j.prompt === b.prompt)))
            .filter((j) => new Date(j.created_at) <= now)
            .sort((a, z) => +new Date(z.created_at) - +new Date(a.created_at))[0];
          return [{ type: "journal", prompt: b.prompt, body: entry?.body ?? null, written_at: entry?.created_at ?? null }];
        }
        default:
          return [b];
      }
    });

  // Objects in every room.
  const objects: ObjectView[] = [];
  for (const o of [...world.objects].sort((a, b) => a.sort - b.sort)) {
    const r = resolver.resolve("memory_object", o.id);
    if (r.state === "absent") continue;
    const m = r.state === "open" ? world.memories.find((x) => x.object_id === o.id) : undefined;
    objects.push({
      id: o.id,
      slug: o.slug,
      kind: o.kind,
      label: o.label,
      title: o.title,
      caption: r.state === "open" ? o.caption : null,
      room: o.room_key,
      state: r.state,
      since: r.since?.toISOString() ?? null,
      isNew: isNew("memory_object", o.id, r.since, r.origin),
      sealed_hint: r.state === "sealed" ? o.sealed_hint : null,
      placement: o.placement ?? {},
      chapter: chapterRef(o.chapter_id),
      memory: m
        ? { title: m.title, occurred_at: m.occurred_at, location_label: m.location_label, blocks: blocksFor(o, m.blocks) }
        : null,
    });
  }

  // The Library.
  const library: KnowledgeView[] = [];
  for (const k of [...world.knowledge].sort((a, b) => a.sort - b.sort)) {
    const r = resolver.resolve("knowledge_item", k.id);
    if (r.state === "absent") continue;
    const open = r.state === "open";
    library.push({
      id: k.id,
      slug: k.slug,
      kind: k.kind,
      subject: k.subject,
      title: k.title,
      author: open ? k.author : null,
      excerpt: open ? k.excerpt : null,
      body: open ? k.body : null,
      state: r.state,
      isNew: isNew("knowledge_item", k.id, r.since, r.origin),
      sealed_hint: open ? null : k.sealed_hint,
      spine: k.spine ?? {},
      chapter: chapterRef(k.chapter_id),
    });
  }

  // Letters, clues, notices.
  const events = world.events
    .map((e) => ({ e, r: resolver.resolve("house_event", e.id) }))
    .filter(({ r }) => r.state === "open")
    .sort((a, b) => (b.r.since?.getTime() ?? 0) - (a.r.since?.getTime() ?? 0))
    .map(({ e, r }) => ({
      room: e.room_key,
      view: { id: e.id, kind: e.kind, title: e.title, body: e.body, signature: e.signature, since: r.since?.toISOString() ?? null },
    }));

  // Chapters as they touch this viewer now.
  const moments: ChapterMoment[] = world.chapters
    .filter((c) => isInvited(world, c.id, viewer.id))
    .map((c) => momentFor(world, c, now))
    .filter((m): m is ChapterMoment => !!m);

  const lived = world.chapters.filter((c) => hasAttended(world, c, viewer.id, now));

  // People met at a table.
  const placeCards: PlaceCardView[] = [];
  for (const c of lived) {
    for (const p of world.participants.filter((x) => x.chapter_id === c.id && x.status === "attended" && x.user_id !== viewer.id)) {
      const prof = world.profiles.find((x) => x.id === p.user_id);
      if (!prof) continue;
      const asked = world.connections.some((x) => x.from_user === viewer.id && x.to_user === prof.id && new Date(x.created_at) <= now);
      const theyAsked = world.connections.some((x) => x.from_user === prof.id && x.to_user === viewer.id && new Date(x.created_at) <= now);
      const mutual = asked && theyAsked;
      placeCards.push({
        person_id: prof.id,
        first_name: prof.first_name,
        motif: p.place_card_motif ?? prof.place_card_motif,
        line: prof.line,
        role: p.role,
        chapter: chapterRef(c.id)!,
        connection: mutual ? "mutual" : asked ? "asked" : "none",
        contact: mutual ? prof.contact : null,
      });
    }
  }

  const rooms: RoomView[] = [...world.rooms]
    .sort((a, b) => a.sort - b.sort)
    .map((r) => ({ key: r.key, name: r.name, epigraph: r.epigraph, state: resolver.resolve("room", r.key).state }));

  const recent = [
    ...objects.filter((o) => o.isNew).map((o) => ({ room: o.room, title: o.title, slug: o.slug, kind: o.kind as string, since: o.since })),
    ...library.filter((k) => k.isNew).map((k) => ({ room: "library" as RoomKey, title: k.title, slug: k.slug, kind: k.kind as string, since: null })),
  ].map(({ room, title, slug, kind }) => ({ room, title, slug, kind }));

  const contents: ContentsLine[] = [...world.chapters]
    .sort((a, b) => a.sort - b.sort)
    .filter((c) => resolver.resolve("chapter", c.id).state !== "absent")
    .map((c) => {
      const visible = resolver.resolve("chapter", c.id).state === "open";
      const phase = chapterPhase(c, now);
      return {
        number: c.number,
        title: visible ? c.title : null,
        lived: lived.some((l) => l.id === c.id),
        current: visible && (phase === "prelude" || phase === "during"),
      };
    });

  return {
    now: now.toISOString(),
    viewer: { id: viewer.id, first_name: viewer.first_name, role: viewer.role },
    hasLived: lived.length > 0,
    rooms,
    hall: {
      letters: events.filter((x) => x.room === "hall" && x.view.kind === "letter").map((x) => x.view),
      clues: events.filter((x) => x.room === "hall" && x.view.kind !== "letter").map((x) => x.view),
      moments,
      recent,
      contents,
    },
    objects,
    library,
    table: { placeCards },
    door: { letters: events.filter((x) => x.room === "door").map((x) => x.view) },
  };
}

function momentFor(world: World, c: Chapter, now: Date): ChapterMoment | null {
  const phase = chapterPhase(c, now);
  if (phase === "unannounced" || phase === "past") return null;
  const viewerId = world.viewer.id;
  const inv = world.invitations.find((i) => i.chapter_id === c.id && i.user_id === viewerId);
  const attended = hasAttended(world, c, viewerId, now);
  // After a Chapter, only those who lived it carry it forward.
  if ((phase === "interlude" || phase === "afterglow") && !attended && world.participants.find((p) => p.chapter_id === c.id && p.user_id === viewerId)?.status !== "attended") {
    return null;
  }
  const preludes = world.preludes
    .filter((p) => p.chapter_id === c.id && (!p.opens_at || new Date(p.opens_at) <= now))
    .sort((a, b) => a.sort - b.sort)
    .map((p) => ({
      id: p.id,
      kind: p.kind,
      title: p.title,
      body: p.body,
      response_prompt: p.response_prompt,
      answer:
        world.journal
          .filter((j) => j.user_id === viewerId && j.prelude_id === p.id && new Date(j.created_at) <= now)
          .sort((a, z) => +new Date(z.created_at) - +new Date(a.created_at))[0]?.body ?? null,
    }));
  return {
    chapter: {
      id: c.id,
      slug: c.slug,
      number: c.number,
      title: c.title,
      label: chapterLabel(c),
      subtitle: c.subtitle,
      description: c.description,
      location_label: c.location_label,
      starts_at: c.starts_at,
    },
    phase,
    invitation: inv ? { message: inv.message, code: inv.code } : null,
    preludes,
    attended,
  };
}

export function objectsIn(view: HouseView, room: RoomKey) {
  return view.objects.filter((o) => o.room === room);
}

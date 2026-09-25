import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { World } from "@/lib/domain/types";
import { composeHouse } from "@/lib/house/compose";
import * as seed from "@/lib/seed";
import { parseCondition } from "./conditions";

function world(viewerId: string, patch: Partial<World> = {}): World {
  const w = structuredClone({
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
  }) as Omit<World, "viewer">;
  return { ...w, ...patch, viewer: w.profiles.find((p) => p.id === viewerId)! };
}

const at = (iso: string) => new Date(iso);
const NOW = at("2026-09-25T15:00:00Z");
const obj = (v: ReturnType<typeof composeHouse>, slug: string) => v.objects.find((o) => o.slug === slug);

describe("before Chapter 0", () => {
  const v = composeHouse(world(seed.LEA), at("2026-08-25T10:00:00Z"));
  it("the Memory Room is empty", () => expect(v.objects.filter((o) => o.room === "memory")).toHaveLength(0));
  it("the Hall holds the invitation and its one question", () => {
    const m = v.hall.moments.find((x) => x.chapter.id === seed.CH0);
    expect(m?.phase).toBe("prelude");
    expect(m?.preludes[0].response_prompt).toBeTruthy();
  });
  it("there is no door", () => expect(v.rooms.find((r) => r.key === "door")?.state).toBe("absent"));
});

describe("during Chapter 0", () => {
  it("the House goes quiet", () => {
    const v = composeHouse(world(seed.LEA), at("2026-09-12T20:00:00Z"));
    expect(v.hall.moments.find((m) => m.chapter.id === seed.CH0)?.phase).toBe("during");
    expect(v.objects.filter((o) => o.room === "memory")).toHaveLength(0);
  });
});

describe("after Chapter 0, for Léa", () => {
  const v = composeHouse(world(seed.LEA), NOW);

  it("objects have appeared, and are new", () => {
    expect(obj(v, "a-photograph")?.state).toBe("open");
    expect(obj(v, "a-photograph")?.isNew).toBe(true);
  });
  it("chapter-based unlock: the key is there", () => expect(obj(v, "a-key")?.state).toBe("open"));
  it("the locked object is sealed and says nothing of its contents", () => {
    const record = obj(v, "a-record");
    expect(record?.state).toBe("sealed");
    expect(record?.memory).toBeNull();
    expect(record?.sealed_hint).toMatch(/Motion/);
  });
  it("the letter to herself is still tied", () => expect(obj(v, "a-letter-to-yourself")?.state).toBe("sealed"));
  it("the postcard hasn't arrived", () => expect(obj(v, "six-months-later")).toBeUndefined());
  it("the Unmarked Door exists: key + invitation", () => expect(v.rooms.find((r) => r.key === "door")?.state).toBe("open"));
  it("scanning the card during dinner opened the note", () => expect(obj(v, "under-your-glass")?.state).toBe("open"));
  it("the Chapter 0 notebook is on her shelf", () => expect(v.library.some((k) => k.slug === "notes-on-hospitality")).toBe(true));
  it("books that were always there are not 'new'", () => expect(v.library.find((k) => k.slug === "a-card-about-sleep")?.isNew).toBe(false));
  it("she never learns that Jakub asked", () => {
    const jakub = v.table.placeCards.find((c) => c.first_name === "Jakub");
    expect(jakub?.connection).toBe("none");
    expect(jakub?.contact).toBeNull();
  });
});

describe("time-based unlock", () => {
  it("180 days after Chapter 0, the letter opens with what she wrote", () => {
    const v = composeHouse(world(seed.LEA), at("2027-03-14T10:00:00Z"));
    const letter = obj(v, "a-letter-to-yourself");
    expect(letter?.state).toBe("open");
    const journal = letter?.memory?.blocks.find((b) => b.type === "journal");
    expect(journal && journal.type === "journal" && journal.body).toMatch(/Sing/);
    expect(obj(v, "six-months-later")?.state).toBe("open");
  });
});

describe("mutual consent", () => {
  it("reveals contact only when both asked", () => {
    const w = world(seed.LEA);
    const jakub = w.profiles.find((p) => p.first_name === "Jakub")!;
    w.connections.push({ id: "x", from_user: seed.LEA, to_user: jakub.id, chapter_id: seed.CH0, created_at: "2026-09-20T10:00:00Z" });
    const card = composeHouse(w, NOW).table.placeCards.find((c) => c.person_id === jakub.id);
    expect(card?.connection).toBe("mutual");
    expect(card?.contact).toBeTruthy();
  });
  it("one side alone shows only your own ask", () => {
    const w = world(seed.LEA);
    const selma = w.profiles.find((p) => p.first_name === "Selma")!;
    w.connections.push({ id: "y", from_user: seed.LEA, to_user: selma.id, chapter_id: seed.CH0, created_at: "2026-09-20T10:00:00Z" });
    const card = composeHouse(w, NOW).table.placeCards.find((c) => c.person_id === selma.id);
    expect(card?.connection).toBe("asked");
    expect(card?.contact).toBeNull();
  });
});

describe("Omar, who has lived nothing yet", () => {
  const v = composeHouse(world(seed.OMAR), NOW);
  it("has an empty Memory Room", () => expect(v.objects).toHaveLength(0));
  it("has no door and no Chapter 0 notebook", () => {
    expect(v.rooms.find((r) => r.key === "door")?.state).toBe("absent");
    expect(v.library.some((k) => k.slug === "notes-on-hospitality")).toBe(false);
  });
  it("has the Motion invitation", () => expect(v.hall.moments.map((m) => m.chapter.id)).toEqual([seed.CH02]));
  it("never receives another person's journal", () => expect(JSON.stringify(v)).not.toMatch(/Sing\. Badly/));
});

describe("conditions", () => {
  it("rejects unknown rule types", () => expect(() => parseCondition({ type: "popularity", min: 10 })).toThrow());
  it("accepts nested logic", () =>
    expect(parseCondition({ all: [{ type: "season", months: [1] }, { not: { type: "attended_chapter", chapter_id: "x" } }] })).toBeTruthy());
});

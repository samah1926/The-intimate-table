// Demo content for The House. Placeholder, meant to be replaced.
// Used as-is by the demo store, and pushed to Supabase by scripts/seed-supabase.ts.
// Keep imports type-only and relative so the seed script can run under plain Node.

import type {
  Chapter,
  ChapterParticipant,
  HouseEvent,
  Interaction,
  Invitation,
  JournalEntry,
  KnowledgeItem,
  MediaAsset,
  Memory,
  MemoryObject,
  PeopleConnection,
  Prelude,
  Profile,
  Room,
  UnlockRule,
  UserUnlock,
} from "../domain/types";

export const LEA = "00000000-0000-4000-8000-00000000a001";
export const OMAR = "00000000-0000-4000-8000-00000000a002";
export const HOST = "00000000-0000-4000-8000-00000000a000";
const TAMARA = "00000000-0000-4000-8000-00000000b001";
const JAKUB = "00000000-0000-4000-8000-00000000b002";
const SELMA = "00000000-0000-4000-8000-00000000b003";
const HENRY = "00000000-0000-4000-8000-00000000b004";
const LARISSA = "00000000-0000-4000-8000-00000000b005";
const PHIL = "00000000-0000-4000-8000-00000000b006";

/** In the demo, "now" is ten days after Chapter 0. Hosts can preview any other moment. */
export const DEMO_NOW = "2027-03-26T17:00:00Z";

export const CH0 = "ch-0";
export const CH01 = "ch-01";
export const CH02 = "ch-02";
const CH03 = "ch-03";

/** Accounts used to enter the demo, and their emails when seeded into Supabase. */
export const demoGuests = [
  { id: LEA, email: "lea@the-house.test", note: "lived Chapter 0, invited to Chapter 02" },
  { id: OMAR, email: "omar@the-house.test", note: "invited to Chapter 02, has lived nothing yet" },
  { id: HOST, email: "host@the-house.test", note: "the host (admin)" },
];

const profile = (id: string, first_name: string, motif: string, line: string | null, contact: string | null = null, role: Profile["role"] = "guest"): Profile => ({
  id,
  display_name: first_name,
  first_name,
  place_card_motif: motif,
  line,
  contact,
  role,
});

export const profiles: Profile[] = [
  profile(HOST, "The host", "stone", "Sets the table. Clears it last.", null, "host"),
  profile(LEA, "Léa", "sprig", "Learning to say yes before the plan is finished."),
  profile(OMAR, "Omar", "pebble", null),
  profile(TAMARA, "Tamara", "scallop", "Architect. Collects staircases.", "tamara@studio-meridian.test"),
  profile(JAKUB, "Jakub", "auger", "Makes bread on Sundays and bad jokes on Mondays.", "+33 6 12 34 56 78 · jakub"),
  profile(SELMA, "Selma", "limpet", "Swims all year. Doesn't talk about it.", "selma.o@post.test"),
  profile(HENRY, "Henry", "urchin", "Coach. Believes rest is a skill.", "henry@longroad.test"),
  profile(LARISSA, "Larissa", "cockle", "Translates poetry, badly and happily.", "larissa@letters.test"),
  profile(PHIL, "Phil", "coral", "Came for the food. Stayed for the questions.", "phil@phil.test"),
];

export const chapters: Chapter[] = [
  {
    id: CH0,
    slug: "thirty",
    number: "0",
    title: "Thirty",
    subtitle: "Before feeling ready",
    description:
      "Three days in Morocco about stepping in before the preparation is finished. A long table under the Atlas, eight people, one question — and a road the next morning.",
    location_label: "Morocco",
    prelude_opens_at: "2027-01-13T09:00:00Z",
    starts_at: "2027-03-13T17:30:00Z",
    ends_at: "2027-03-16T11:00:00Z",
    afterglow_at: "2027-03-17T08:00:00Z",
    identity: { paper: "#efe9dd", ink: "#1c1a17", motif: "thread" },
    base_state: "open",
    sort: 0,
  },
  {
    id: CH01,
    slug: "chapter-01",
    number: "01",
    title: null,
    subtitle: null,
    description: null,
    location_label: null,
    prelude_opens_at: null,
    starts_at: null,
    ends_at: null,
    afterglow_at: null,
    identity: {},
    base_state: "sealed",
    sort: 1,
  },
  {
    id: CH02,
    slug: "motion",
    number: "02",
    title: "Motion",
    subtitle: "When to push, and when to make space",
    description:
      "A long road at dawn, a slow breakfast, and a conversation about effort. For people who move, and people who would like to.",
    location_label: "Somewhere with a long road at dawn",
    prelude_opens_at: "2027-03-20T09:00:00Z",
    starts_at: "2027-06-12T04:30:00Z",
    ends_at: "2027-06-13T12:00:00Z",
    afterglow_at: "2027-06-14T07:00:00Z",
    identity: { paper: "#ece6da", ink: "#2a221c", accent: "#8a5a3c", motif: "road" },
    base_state: "sealed",
    sort: 2,
  },
  {
    id: CH03,
    slug: "somewhere-south",
    number: "03",
    title: "Somewhere South",
    subtitle: null,
    description: null,
    location_label: null,
    prelude_opens_at: null,
    starts_at: null,
    ends_at: null,
    afterglow_at: null,
    identity: {},
    base_state: "absent",
    sort: 3,
  },
];

const guest = (chapter_id: string, user_id: string, status: ChapterParticipant["status"], motif: string | null, role: ChapterParticipant["role"] = "guest"): ChapterParticipant => ({
  chapter_id,
  user_id,
  status,
  role,
  seat_label: null,
  place_card_motif: motif,
});

export const participants: ChapterParticipant[] = [
  guest(CH0, HOST, "attended", "stone", "host"),
  guest(CH0, LEA, "attended", "sprig"),
  guest(CH0, TAMARA, "attended", "scallop"),
  guest(CH0, JAKUB, "attended", "auger"),
  guest(CH0, SELMA, "attended", "limpet"),
  guest(CH0, HENRY, "attended", "urchin", "coach"),
  guest(CH0, LARISSA, "attended", "cockle"),
  guest(CH0, PHIL, "attended", "coral"),
  guest(CH02, LEA, "invited", null),
  guest(CH02, OMAR, "invited", null),
  guest(CH02, HENRY, "confirmed", null, "coach"),
];

export const invitations: Invitation[] = [
  {
    id: "inv-0-lea",
    chapter_id: CH0,
    user_id: LEA,
    code: "thirty-lea",
    message: "Come before you feel ready. That is the only condition.",
    status: "accepted",
    expires_at: null,
    opened_at: "2027-01-13T18:02:00Z",
    created_at: "2027-01-13T09:00:00Z",
  },
  {
    id: "inv-02-lea",
    chapter_id: CH02,
    user_id: LEA,
    code: "motion-lea",
    message: "There is a road we would like to show you, very early in the morning.",
    status: "sent",
    expires_at: null,
    opened_at: null,
    created_at: "2027-03-20T09:00:00Z",
  },
  {
    id: "inv-02-omar",
    chapter_id: CH02,
    user_id: OMAR,
    code: "motion-omar",
    message: "There is a road we would like to show you, very early in the morning.",
    status: "sent",
    expires_at: null,
    opened_at: null,
    created_at: "2027-03-20T09:00:00Z",
  },
];

export const preludes: Prelude[] = [
  {
    id: "pre-0-question",
    chapter_id: CH0,
    kind: "question",
    title: "One question",
    body: "What would you do if being good at it wasn’t a requirement?",
    response_prompt: "Write it down. No one else will read it — not yet, not even you.",
    opens_at: "2027-01-13T09:00:00Z",
    sort: 0,
  },
  {
    id: "pre-02-bring",
    chapter_id: CH02,
    kind: "bring",
    title: "Something to bring",
    body: "Shoes you don’t mind ruining.",
    response_prompt: null,
    opens_at: "2027-03-20T09:00:00Z",
    sort: 0,
  },
];

export const rooms: Room[] = [
  { key: "hall", name: "The Hall", epigraph: "Come in. Some things have moved since you were last here.", base_state: "open", sort: 0 },
  { key: "table", name: "The Table", epigraph: "Where the evening is kept.", base_state: "open", sort: 1 },
  { key: "library", name: "The Library", epigraph: "What we understood, and what we are still trying to.", base_state: "open", sort: 2 },
  { key: "studio", name: "The Studio", epigraph: "The body remembers what the mind files away.", base_state: "open", sort: 3 },
  { key: "memory", name: "The Memory Room", epigraph: "Everything you lived left something behind.", base_state: "open", sort: 4 },
  { key: "door", name: "The Unmarked Door", epigraph: null, base_state: "absent", sort: 5 },
];

const photo = (id: string, file: string, scene: string, caption: string, alt: string): MediaAsset => ({
  id,
  kind: "image",
  url: `/house/photos/${file}.webp`,
  storage_path: null,
  alt,
  caption,
  credit: "Placeholder — to be replaced by Chapter 0 photography",
  scene,
  chapter_id: CH0,
  owner_user_id: null,
});

/** Photographs from Chapter 0, by The Intimate Table. */
const shot = (id: string, file: string, caption: string, alt: string): MediaAsset => ({
  ...photo(id, `chapter-0/${file}`, "table", caption, alt),
  credit: "The Intimate Table",
});

export const media: MediaAsset[] = [
  shot("p-table-sunset", "table-sunset", "The table, an hour before.", "A long table on a terrace at sunset: linen, anthuriums, glasses, olive trees and the Atlas beyond"),
  shot("p-table-anthurium", "table-anthurium", "Anthuriums and river stones, down the middle.", "The long table from its end, dark red anthuriums between the glasses"),
  shot("p-envelope", "invitation-envelope", "It came in a burgundy envelope.", "A burgundy envelope with the ITT monogram; a card inside reads Chapter 0 — Thirty, Morocco, 13–16 March 2027"),
  shot("p-ticket", "ticket", "13 March 2027, 18:30. The coordinates came a week later.", "A ticket for Chapter 0 — Thirty, Morocco, with a palm tree photograph and coordinates"),
  shot("p-menu", "menu", "The menu, under an anthurium.", "A printed menu on linen: charred vegetables, sea bass, lamb, orange blossom"),
  shot("p-welcome", "welcome", "On every bed.", "A card: Welcome to Morocco — New conversations. Familiar feelings."),
  shot("p-bundle", "bundle", "Tied with string, the last morning.", "Photographs tied with twine and a tag: Chapter 0, Morocco, 13.03.27"),
  shot("p-morning", "morning-arch", "The morning after, through the arch.", "A sheer curtain, an arched door onto a pool and an olive tree"),
  shot("p-dorian", "dorian-gray", "Someone left it on the chair.", "A hand holding The Picture of Dorian Gray over a velvet armchair"),
  shot("p-shelf", "library-shelf", "", "Hands taking a book from a shelf"),
  photo("m-table", "table-night", "table", "The table, a little after eleven.", "A long table from above after dinner: plates, glasses, candles burning down"),
  photo("m-candle", "candles", "candle", "Around eleven.", "Candlelight, out of focus"),
  photo("m-hands", "glasses", "hands", "The last glasses, around one.", "Wine glasses in candlelight, one still half full"),
  photo("m-road", "road-dawn", "road", "6:12. The road still blue.", "An empty road at first light, three runners far away"),
  photo("m-dawn", "sea-dawn", "dawn", "Kilometre four. Nobody talking.", "The sea at sunrise"),
  photo("m-window", "window-linen", "window", "The morning after.", "Morning light through a window onto crumpled linen"),
  photo("m-linen", "linen-burgundy", "linen", "Someone’s napkin, left on the tiles.", "A burgundy linen napkin on green zellige, palm shadows"),
  photo("m-tea", "tea", "linen", "Mint tea, before anyone went to bed.", "A brass tray from above with a teapot and two glasses of mint tea"),
  photo("m-arch", "arch", "window", "The courtyard, from the door.", "A plaster arch opening onto a garden, palm shadows on the wall"),
];

const obj = (o: Partial<MemoryObject> & Pick<MemoryObject, "id" | "slug" | "kind" | "title" | "room_key">): MemoryObject => ({
  label: null,
  caption: null,
  chapter_id: CH0,
  user_id: null,
  base_state: "open",
  sealed_hint: null,
  placement: {},
  sort: 0,
  created_at: "2027-03-16T12:00:00Z",
  ...o,
});

export const objects: MemoryObject[] = [
  // ── The Memory Room ──
  obj({
    id: "obj-invitation",
    slug: "the-invitation",
    kind: "invitation",
    label: "CHAPTER 0",
    title: "The invitation",
    caption: "Cream card, black thread. It arrived before you were ready.",
    room_key: "memory",
    placement: { rotate: -7, x: 15, y: 50, w: 17, mx: 30, my: 23, mw: 42 },
    sort: 1,
  }),
  obj({
    id: "obj-photograph",
    slug: "a-photograph",
    kind: "photograph",
    title: "A photograph",
    caption: "Nobody was looking at the camera.",
    room_key: "memory",
    placement: { rotate: 5, x: 34, y: 49, w: 12.5, mx: 74, my: 24, mw: 32 },
    sort: 2,
  }),
  obj({
    id: "obj-note",
    slug: "under-your-glass",
    kind: "note",
    title: "A handwritten note",
    caption: "It was under your glass. You found it when the card asked you to look.",
    room_key: "memory",
    base_state: "absent",
    placement: { rotate: -4, x: 50, y: 44, w: 10, mx: 27, my: 40, mw: 30 },
    sort: 3,
  }),
  obj({
    id: "obj-record",
    slug: "a-record",
    kind: "record",
    label: "THIRTY · SIDE A",
    title: "A record",
    caption: "What was playing, more or less in order.",
    room_key: "memory",
    base_state: "sealed",
    sealed_hint: "Still in its sleeve. It plays after Motion.",
    placement: { rotate: -3, x: 83, y: 49, w: 18, mx: 34, my: 59, mw: 46 },
    sort: 4,
  }),
  obj({
    id: "obj-flower",
    slug: "a-small-flower",
    kind: "flower",
    title: "An anthurium",
    caption: "From the middle of the table. It has been drying ever since.",
    room_key: "memory",
    placement: { rotate: 62, x: 24, y: 79, w: 7, mx: 80, my: 70, mw: 15 },
    sort: 5,
  }),
  obj({
    id: "obj-letter-to-self",
    slug: "a-letter-to-yourself",
    kind: "envelope",
    label: "NOT BEFORE SEPTEMBER",
    title: "A letter to yourself",
    caption: "You wrote this in February, before the first Chapter. The House kept it sealed for six months.",
    room_key: "memory",
    base_state: "sealed",
    sealed_hint: "Not before September.",
    placement: { rotate: -2, x: 45, y: 76, w: 15, mx: 32, my: 79, mw: 40 },
    sort: 6,
  }),
  obj({
    id: "obj-key",
    slug: "a-key",
    kind: "key",
    title: "A key",
    caption: "It wasn’t on the table. It was in your coat pocket when you got home.",
    room_key: "memory",
    base_state: "absent",
    placement: { rotate: -16, x: 63, y: 84, w: 11, mx: 74, my: 86, mw: 34 },
    sort: 7,
  }),
  obj({
    id: "obj-postcard",
    slug: "six-months-later",
    kind: "postcard",
    label: "SIX MONTHS",
    title: "A postcard",
    caption: "It arrived on its own, half a year later.",
    room_key: "memory",
    base_state: "absent",
    placement: { rotate: 6, x: 82, y: 80, w: 13, mx: 30, my: 94, mw: 32 },
    sort: 8,
  }),

  // ── The Table ──
  obj({
    id: "obj-menu",
    slug: "the-menu",
    kind: "menu",
    label: "THIRTY",
    title: "A folded menu",
    caption: "Four courses and an anthurium. Someone folded it and put it in a coat pocket.",
    room_key: "memory",
    placement: { rotate: 7, x: 65, y: 54, w: 11, mx: 72, my: 45, mw: 28 },
    sort: 1,
  }),
  obj({
    id: "obj-place-card-lea",
    slug: "your-place-card",
    kind: "place_card",
    label: "LÉA",
    title: "Your place card",
    caption: "Seat six. Between an architect and a man who makes bread.",
    room_key: "table",
    user_id: LEA,
    placement: { rotate: 2, size: "sm" },
    sort: 2,
  }),
  obj({
    id: "obj-fragment",
    slug: "overheard-around-eleven",
    kind: "note",
    label: "23:04",
    title: "Overheard, around eleven",
    caption: "A fragment of the conversation, written down by the host on the back of a napkin.",
    room_key: "table",
    placement: { rotate: -3, size: "sm" },
    sort: 3,
  }),

  // ── The Studio ──
  obj({
    id: "obj-shoes",
    slug: "running-shoes",
    kind: "shoes",
    title: "Running shoes",
    caption: "Still some red dust in the laces.",
    room_key: "studio",
    placement: { rotate: -3, size: "lg" },
    sort: 1,
  }),
  obj({
    id: "obj-mat",
    slug: "a-folded-mat",
    kind: "mat",
    title: "A folded mat",
    caption: "Twenty minutes on the floor, before breakfast.",
    room_key: "studio",
    placement: { rotate: 1, size: "md" },
    sort: 2,
  }),
  obj({
    id: "obj-bowl",
    slug: "a-ceramic-bowl",
    kind: "bowl",
    title: "A ceramic bowl",
    caption: "Warm water, salt, and nothing to do for a while.",
    room_key: "studio",
    placement: { rotate: 0, size: "md" },
    sort: 3,
  }),
];

export const memories: Memory[] = [
  {
    id: "mem-invitation",
    object_id: "obj-invitation",
    title: "Chapter 0 — Thirty",
    occurred_at: "2027-01-13T09:00:00Z",
    location_label: "It came to you",
    blocks: [
      {
        type: "note",
        text:
          "You are invited to the first table.\n\nThere is nothing to prepare. Come a little before you feel ready — that is the only condition. We will begin when everyone has sat down and nobody is quite sure what happens next.",
      },
      { type: "photos", media_ids: ["p-envelope", "p-ticket", "p-welcome"] },
      { type: "quote", text: "New conversations. Familiar feelings.", attribution: "the card left on every bed" },
    ],
  },
  {
    id: "mem-photograph",
    object_id: "obj-photograph",
    title: "The table, before and after",
    occurred_at: "2027-03-13T22:41:00Z",
    location_label: "Morocco, a house outside Marrakech",
    blocks: [
      { type: "photos", media_ids: ["p-table-sunset", "p-table-anthurium", "p-bundle"] },
      {
        type: "note",
        text:
          "Nobody was looking at the camera, which is why these were kept. The candles were lit a little too early. The bread went round twice. The sun went behind the Atlas during the second course, and nobody noticed until it was gone.",
      },
    ],
  },
  {
    id: "mem-note",
    object_id: "obj-note",
    title: "Under your glass",
    occurred_at: "2027-03-13T21:10:00Z",
    location_label: "Seat six",
    blocks: [
      { type: "quote", text: "You came. That was the whole point. The rest we can learn at the table." },
      {
        type: "note",
        text: "Every guest had one. Nobody had the same sentence. Nobody was told what the others said.",
      },
    ],
  },
  {
    id: "mem-record",
    object_id: "obj-record",
    title: "What was playing",
    occurred_at: "2027-03-13T19:00:00Z",
    location_label: null,
    blocks: [
      {
        type: "music",
        side: "A",
        tracks: [
          { title: "Pink Moon", artist: "Nick Drake" },
          { title: "Cherish the Day", artist: "Sade" },
          { title: "La Javanaise", artist: "Serge Gainsbourg" },
          { title: "Harvest Moon", artist: "Neil Young" },
          { title: "Avril 14th", artist: "Aphex Twin" },
        ],
      },
      { type: "note", text: "Side B was recorded on the road, the morning after Motion." },
    ],
  },
  {
    id: "mem-flower",
    object_id: "obj-flower",
    title: "From the middle of the table",
    occurred_at: "2027-03-14T08:30:00Z",
    location_label: null,
    blocks: [
      { type: "photos", media_ids: ["p-table-anthurium"] },
      {
        type: "note",
        text:
          "Anthuriums, between river stones and glasses. They were chosen because they last. This one has been drying since the Sunday, and has kept its colour better than anyone expected.",
      },
    ],
  },
  {
    id: "mem-letter-to-self",
    object_id: "obj-letter-to-self",
    title: "What you wrote before",
    occurred_at: "2027-02-02T00:00:00Z",
    location_label: null,
    blocks: [
      { type: "journal", prompt: "What would you do if being good at it wasn’t a requirement?" },
      {
        type: "note",
        text:
          "Six months is long enough to have done some of it, and to have forgotten you wrote it down. Either answer is fine.",
      },
    ],
  },
  {
    id: "mem-key",
    object_id: "obj-key",
    title: "A key",
    occurred_at: "2027-03-16T01:00:00Z",
    location_label: null,
    blocks: [
      {
        type: "note",
        text:
          "Some doors are only there for people who have already walked through one.\n\nIf you have noticed a door in the Hall that wasn’t there before — this is for that.",
      },
    ],
  },
  {
    id: "mem-postcard",
    object_id: "obj-postcard",
    title: "Six months later",
    occurred_at: null,
    location_label: null,
    blocks: [
      { type: "photos", media_ids: ["p-bundle", "p-morning"] },
      {
        type: "note",
        text:
          "Half a year ago you sat at a long table with people you didn’t know yet. Some of them you still don’t. That’s all right.\n\nWhatever you did since, the House hopes some of it was done before you felt ready.",
      },
    ],
  },
  {
    id: "mem-menu",
    object_id: "obj-menu",
    title: "Morocco, 13 March — the menu",
    occurred_at: "2027-03-13T17:30:00Z",
    location_label: "Morocco, a house outside Marrakech",
    blocks: [
      {
        type: "note",
        text:
          "Charred vegetables, olive and citrus.\nSea bass, herbs, lemon.\nLamb, slow cooked.\nOrange blossom, almond, honey.\n\nMint tea afterwards, on the terrace, until the candles gave up.",
      },
      { type: "photos", media_ids: ["p-menu"] },
      {
        type: "recipe",
        title: "Lamb, slow cooked",
        serves: "for a long table",
        ingredients: ["A shoulder of lamb", "Preserved lemon, green olives", "Ginger, saffron, cumin, a little cinnamon", "Onions, garlic, a bunch of coriander"],
        steps: [
          "Rub the lamb with the spices the night before.",
          "Soften the onions and garlic, lay the lamb on top, add a glass of water.",
          "Cover and leave it on the lowest heat for five hours. Do not hurry it.",
          "Add the lemon and olives for the last half hour. Bring the pot to the table and let people help themselves.",
        ],
      },
      { type: "people", from_chapter: true },
    ],
  },
  {
    id: "mem-place-card",
    object_id: "obj-place-card-lea",
    title: "Seat six",
    occurred_at: "2027-03-13T17:30:00Z",
    location_label: null,
    blocks: [
      {
        type: "note",
        text:
          "The sprig was rosemary. The seating was not random, but it was not clever either: we sat people next to someone they would not have chosen, and hoped.",
      },
    ],
  },
  {
    id: "mem-fragment",
    object_id: "obj-fragment",
    title: "Overheard, around eleven",
    occurred_at: "2027-03-13T22:04:00Z",
    location_label: null,
    blocks: [
      {
        type: "quote",
        text: "I think I stopped doing things I was bad at around the age of twelve. I would like that back.",
        attribution: "someone at the far end of the table",
      },
      {
        type: "quote",
        text: "Being ready is a feeling. It usually arrives after you’ve started.",
        attribution: "someone else, in reply",
      },
    ],
  },
  {
    id: "mem-shoes",
    object_id: "obj-shoes",
    title: "The morning run",
    occurred_at: "2027-03-14T05:12:00Z",
    location_label: "The road through the olive groves",
    blocks: [
      {
        type: "route",
        label: "Out along the road, back through the olive trees",
        distance: "7.4 km · easy",
        points: [
          [0.08, 0.82], [0.14, 0.7], [0.22, 0.64], [0.3, 0.52], [0.36, 0.38], [0.46, 0.3], [0.58, 0.26],
          [0.7, 0.2], [0.82, 0.24], [0.88, 0.36], [0.84, 0.5], [0.72, 0.58], [0.6, 0.66], [0.46, 0.74],
          [0.32, 0.8], [0.18, 0.86], [0.08, 0.82],
        ],
      },
      { type: "photos", media_ids: ["m-road", "m-dawn"] },
      {
        type: "note",
        text:
          "Nine people, most of whom had gone to bed at two. Nobody talked for the first four kilometres. Somebody laughed at nothing at the turn, and then everybody did.",
      },
      {
        type: "learned",
        text:
          "Easy means you could hold a conversation. If you can’t, slow down — you are not being lazy, you are training the thing that lets you go far.",
      },
      { type: "people", people: [{ name: "Henry", role: "coach" }] },
      {
        type: "music",
        side: "In one ear",
        tracks: [
          { title: "Weightless", artist: "Marconi Union" },
          { title: "Motion Sickness", artist: "Phoebe Bridgers" },
        ],
      },
    ],
  },
  {
    id: "mem-mat",
    object_id: "obj-mat",
    title: "Mobility, before breakfast",
    occurred_at: "2027-03-14T07:00:00Z",
    location_label: "The terrace",
    blocks: [
      {
        type: "note",
        text: "Hips, ankles, thoracic spine. Slowly, on a terrace that still held the cold from the night.",
      },
      {
        type: "learned",
        text: "Range of motion you don’t use, you lose. Twenty minutes, most mornings, is a better deal than an hour once a week.",
      },
      { type: "photos", media_ids: ["p-morning"] },
    ],
  },
  {
    id: "mem-bowl",
    object_id: "obj-bowl",
    title: "A recovery ritual",
    occurred_at: "2027-03-14T09:00:00Z",
    location_label: null,
    blocks: [
      {
        type: "note",
        text: "Feet in warm salted water. Mint tea. Twelve minutes where nobody was allowed to be useful.",
      },
      { type: "photos", media_ids: ["m-tea"] },
      {
        type: "learned",
        text: "Adaptation happens during rest, not during effort. The run asks the question; the recovery answers it.",
      },
    ],
  },
];

const book = (k: Partial<KnowledgeItem> & Pick<KnowledgeItem, "id" | "slug" | "kind" | "subject" | "title">): KnowledgeItem => ({
  author: null,
  excerpt: null,
  body: null,
  chapter_id: null,
  base_state: "open",
  sealed_hint: null,
  spine: {},
  sort: 0,
  created_at: "2027-01-10T09:00:00Z",
  ...k,
});

export const knowledge: KnowledgeItem[] = [
  book({
    id: "k-recovery",
    slug: "why-recovery-is-part-of-training",
    kind: "book",
    subject: "Recovery",
    title: "Why recovery is part of training",
    author: "Notes from Henry",
    excerpt: "The run asks the question. The rest answers it.",
    body:
      "Training is a conversation with the body. Effort is the question you ask; recovery is where the answer is written.\n\nWhen you stress a muscle, a tendon, a heart, you don’t get stronger during the session — you get slightly broken. The adaptation, the part you actually came for, happens afterwards: while you sleep, eat, walk slowly, sit with your feet in warm water and do nothing useful.\n\nMost people who stop improving are not training too little. They are resting too little, and calling it discipline.",
    spine: { height: 92, tone: "moss" },
    sort: 1,
  }),
  book({
    id: "k-effort",
    slug: "the-physiology-of-effort",
    kind: "book",
    subject: "Physiology",
    title: "The physiology of effort",
    author: "For Chapter 02",
    excerpt: "What happens between easy and hard.",
    body:
      "There are roughly three places you can be when you move: easy, where you could hold a conversation; steady, where you could say a sentence; and hard, where you could say a word.\n\nMost of the good happens in the first place. Some happens in the third. Very little happens in the middle, which is, unfortunately, where most of us live.\n\nWe will talk about this on the road, very early, when nobody has the breath to disagree.",
    base_state: "sealed",
    sealed_hint: "On the shelf, tied. After Motion.",
    spine: { height: 100, tone: "ink" },
    sort: 2,
  }),
  book({
    id: "k-hospitality",
    slug: "notes-on-hospitality",
    kind: "notebook",
    subject: "Hospitality",
    title: "Notes on hospitality",
    author: "The host’s notebook, the week of Chapter 0",
    excerpt: "Seat people next to someone they wouldn’t have chosen.",
    body:
      "— Light the candles before anyone arrives, so nobody watches it happen.\n— Seat people next to someone they wouldn’t have chosen. Then hope.\n— One question for the whole table, asked only once.\n— Serve something that has to be broken open in front of everyone.\n— Don’t explain the evening. It will explain itself, or it won’t, and both are fine.\n— Nobody should leave with nothing. Nobody should leave with a gift bag.",
    chapter_id: CH0,
    spine: { height: 78, tone: "linen", cover: "/house/photos/chapter-0/library-book.webp" },
    sort: 3,
  }),
  book({
    id: "k-food-memory",
    slug: "food-memory-and-culture",
    kind: "book",
    subject: "Food",
    title: "Food, memory and culture",
    author: "A reading, collected",
    excerpt: "We rarely remember what we ate. We remember who passed it.",
    body:
      "Ask anyone to describe the best meal of their life and they will spend very little time on the food.\n\nThey will tell you where they were sitting, who was there, what the light was doing, whether it was raining. The dish is the excuse. The table is the memory.\n\nEvery culture has a version of this: bread broken in front of others, a pot put in the middle, a meal that takes too long on purpose.",
    spine: { height: 86, tone: "clay" },
    sort: 4,
  }),
  book({
    id: "k-sleep",
    slug: "a-card-about-sleep",
    kind: "card",
    subject: "Sleep",
    title: "Sleep is not the absence of effort",
    excerpt: "It is where the effort goes to become something.",
    body:
      "Same time to bed, most nights. Darker than you think. Cooler than you think. The phone in another room — which, in this House, we are in favour of anyway.",
    spine: { tone: "bone" },
    sort: 5,
  }),
];

const letter = (e: Partial<HouseEvent> & Pick<HouseEvent, "id" | "kind" | "body">): HouseEvent => ({
  room_key: "hall",
  title: null,
  signature: null,
  chapter_id: null,
  user_id: null,
  base_state: "open",
  starts_at: null,
  ends_at: null,
  created_at: "2027-01-10T09:00:00Z",
  ...e,
});

export const events: HouseEvent[] = [
  letter({
    id: "ev-welcome",
    kind: "letter",
    body:
      "Dear {first_name},\n\nThis house is new. Most of its rooms are still empty, and that is how it should be. Nothing here is put on display — things arrive only once they have been lived.\n\nWalk around. Open what opens. Leave what doesn’t.\n\nWe’ll keep a light on.",
    signature: "— The House",
    starts_at: "2027-01-10T09:00:00Z",
  }),
  letter({
    id: "ev-afterglow-0",
    kind: "letter",
    chapter_id: CH0,
    base_state: "absent",
    body:
      "{first_name},\n\nThe table has been cleared, but not everything was taken away. Some of the weekend is in the Memory Room now. A pair of shoes is drying in the Studio.\n\nThere is no need to look at any of it today. It will still be here.",
    signature: "— The House, the morning after",
    starts_at: "2027-03-17T08:00:00Z",
  }),
  letter({
    id: "ev-clue-02",
    kind: "clue",
    chapter_id: CH02,
    body: "31.0° N —",
    title: "Found on the console",
    signature: "the rest when you need it",
    starts_at: "2027-03-22T09:00:00Z",
  }),
  letter({
    id: "ev-spring",
    kind: "seasonal",
    base_state: "absent",
    body: "The orange trees are in flower. The Library is brightest in the morning.",
  }),
  letter({
    id: "ev-door",
    kind: "letter",
    room_key: "door",
    chapter_id: CH02,
    title: "The night before the road",
    body:
      "You have sat at one table. There is another, smaller one, before Motion — six people, the night before the road. It is not on any list.\n\nThere is nothing to prepare. Eat early. Sleep early. We will knock.\n\n31.0587° N, 7.9154° W · Friday · 19:30",
    signature: "— for those who kept the key",
  }),
];

const rule = (r: Omit<UnlockRule, "active" | "notes"> & Partial<Pick<UnlockRule, "notes">>): UnlockRule => ({
  active: true,
  notes: null,
  ...r,
});

export const rules: UnlockRule[] = [
  rule({
    id: "rule-key",
    name: "The key belongs to those who were at the first table",
    target_type: "memory_object",
    target_id: "obj-key",
    effect: "open",
    conditions: { type: "attended_chapter", chapter_id: CH0 },
    notes: "Chapter-based unlock.",
  }),
  rule({
    id: "rule-letter-to-self",
    name: "The letter to yourself opens after six months",
    target_type: "memory_object",
    target_id: "obj-letter-to-self",
    effect: "open",
    conditions: { type: "days_since_chapter", chapter_id: CH0, days: 180 },
    notes: "Time-based unlock.",
  }),
  rule({
    id: "rule-postcard",
    name: "A postcard arrives six months later",
    target_type: "memory_object",
    target_id: "obj-postcard",
    effect: "open",
    conditions: { type: "days_since_chapter", chapter_id: CH0, days: 180 },
  }),
  rule({
    id: "rule-record",
    name: "The record plays after Motion",
    target_type: "memory_object",
    target_id: "obj-record",
    effect: "open",
    conditions: { type: "attended_chapter", chapter_id: CH02 },
  }),
  rule({
    id: "rule-note",
    name: "The note under the glass, once the card was scanned",
    target_type: "memory_object",
    target_id: "obj-note",
    effect: "open",
    conditions: { type: "scanned_code", code: "under-your-glass" },
    notes: "During the Chapter: a card at each seat carries this code.",
  }),
  rule({
    id: "rule-door",
    name: "The door appears for those holding the key and invited onwards",
    target_type: "room",
    target_id: "door",
    effect: "open",
    conditions: {
      all: [
        { type: "has_unlocked", target_type: "memory_object", target_id: "obj-key" },
        { type: "invited_to_chapter", chapter_id: CH02 },
      ],
    },
  }),
  rule({
    id: "rule-effort",
    name: "The physiology of effort, after Motion",
    target_type: "knowledge_item",
    target_id: "k-effort",
    effect: "open",
    conditions: { type: "attended_chapter", chapter_id: CH02 },
  }),
  rule({
    id: "rule-afterglow-letter",
    name: "The morning-after letter",
    target_type: "house_event",
    target_id: "ev-afterglow-0",
    effect: "open",
    conditions: { type: "attended_chapter", chapter_id: CH0 },
  }),
  rule({
    id: "rule-spring",
    name: "Spring light",
    target_type: "house_event",
    target_id: "ev-spring",
    effect: "open",
    conditions: { type: "season", months: [3, 4, 5] },
  }),
];

export const unlocks: UserUnlock[] = [];

export const connections: PeopleConnection[] = [
  // Jakub has already asked to find Léa again. Léa can't see this until she asks too.
  { id: "con-jakub-lea", from_user: JAKUB, to_user: LEA, chapter_id: CH0, created_at: "2027-03-18T20:00:00Z" },
];

export const journal: JournalEntry[] = [
  {
    id: "j-lea-question",
    user_id: LEA,
    chapter_id: CH0,
    prelude_id: "pre-0-question",
    object_id: null,
    prompt: "What would you do if being good at it wasn’t a requirement?",
    body:
      "Sing. Badly, and in front of people.\n\nStop rehearsing the conversation with my father and actually have it.\n\nRun somewhere I’ve never been, slowly, with strangers.",
    sealed_until: null,
    created_at: "2027-02-02T21:40:00Z",
  },
];

export const interactions: Interaction[] = [
  { id: "int-lea-glass", user_id: LEA, kind: "scan", ref: "under-your-glass", created_at: "2027-03-13T21:10:00Z" },
];

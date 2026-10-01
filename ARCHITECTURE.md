# Architecture

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · React 19 · Tailwind CSS 4 ·
Framer Motion · Supabase (Postgres, Auth, Storage) · Vercel.

One Next.js application. No microservices. PWA-ready (manifest + installable
layout). A service worker comes later.

## The central idea: the House is *composed*, not queried

The client never asks "give me all memory objects". The server builds a
**HouseView** for one person at one moment, then sends only that.

```
 ┌──────────────┐    loadWorld(userId)    ┌────────────────────┐
 │  HouseStore  │ ──────────────────────▶ │  World (snapshot)  │
 │ demo | supa  │                         │ chapters, objects, │
 └──────────────┘                         │ rules, unlocks...  │
                                          └─────────┬──────────┘
                                                    │ composeHouse(world, viewer, now)
                                                    ▼
                                ┌──────────────────────────────────┐
                                │ rule engine (pure, no I/O)        │
                                │ every entity → absent|sealed|open │
                                │ + "since" (when it appeared)      │
                                └─────────┬────────────────────────┘
                                          ▼
                                   HouseView  ──▶ Server Components ──▶ rooms (client, animated)
```

Why this shape:

- **Mystery stays on the server.** Hidden objects are never serialised to the
  browser. Row Level Security denies direct client reads of content tables; the
  server reads with the service role *after* resolving the viewer.
- **One place decides visibility.** `src/lib/house/compose.ts` +
  `src/lib/rules/`. Rooms only render what they are given.
- **Pure and testable.** `composeHouse` is a pure function of `(world, viewer, now)`.
  That is also what makes the *time preview* work: the admin can see the House
  as it will be in 180 days, or as it was before Chapter 0.

## Rule engine

`src/lib/rules/`

- An **unlock rule** targets one entity (`memory_object`, `knowledge_item`,
  `room`, `house_event`, `chapter`) and has an **effect**: `reveal`
  (absent → sealed) or `open` (→ open).
- Its `conditions` is a JSON tree: `all` / `any` / `not` plus leaf conditions.
- Each leaf type is one entry in a **registry** (`conditions.ts`): a Zod schema and
  an evaluator returning `{ ok, since }`. `since` is *when* the condition became
  true, which is how the House knows something is new, without a notifications
  table.
- Adding a rule type = adding one registry entry. Nothing else changes.

Leaf conditions at launch:

| type | true when |
|---|---|
| `attended_chapter` | viewer attended chapter X (since = its afterglow) |
| `invited_to_chapter` | viewer holds an invitation to X |
| `days_since_chapter` | N days have passed since X ended (and viewer attended) |
| `chapter_phase` | X is currently in `prelude` / `during` / `afterglow` for the viewer |
| `date_after` / `date_before` | calendar |
| `anniversary_of_chapter` | within a window around the yearly anniversary |
| `season` | current month in list |
| `mutual_connection` | viewer and person P have both consented |
| `has_unlocked` | another entity is already open for the viewer |
| `scanned_code` | viewer scanned a physical card / QR / NFC tag |

Example — "IF attended Chapter 0 AND 180 days have passed THEN open the letter":

```json
{ "target_type": "memory_object", "target_id": "…letter-to-yourself",
  "effect": "open",
  "conditions": { "type": "days_since_chapter", "chapter_id": "…chapter-0", "days": 180 } }
```

Entities also carry a `base_state` (`absent` | `sealed` | `open`) and optional
`chapter_id` / `user_id` scoping. Final state = max(base, effects of satisfied rules),
after scoping (a Chapter object exists only for that Chapter's participants).

## Data access

`src/lib/data/`

- `HouseStore` interface: `loadWorld`, `markSeen`, `recordInteraction`,
  `setConsent`, `writeJournal`, plus generic admin `list/get/upsert/remove`.
- `DemoStore` — in-memory, seeded from `src/lib/seed/`. Used automatically when
  Supabase env vars are absent, so the prototype runs anywhere with zero setup.
  Admin edits persist for the life of the server process.
- `SupabaseStore` — same interface over Postgres, service-role client, server-only.

`getStore()` picks one. Nothing above the store knows which is in use.

## Auth

- Supabase Auth, email magic link (no passwords — entering a house, not logging in).
- Demo mode: "Enter" sets a signed-in cookie for the example guest.
- `src/proxy.ts` (Next 16's replacement for middleware) refreshes the Supabase
  session and turns people without one away from `/house` and `/admin`.
- Admin requires `profiles.role = 'host'`.

## Routes

```
/                        the threshold (entrance, sign in)
/house                   the Hall
/house/[room]            table · library · studio · memory · door
/house/[room]?open=slug  an object opened in place (shareable, back-button safe)
/r/[code]                a physical reveal (QR / NFC on a card at the table)
/admin/...               private content management (conventional UI on purpose)
```

## Components

```
src/components/
  ui/         Picture (photograph, fades in, can be veiled), Wordmark
  house/      HouseShell (wordmark, chapter context, the plan, footer), Plan
              (contents page of the rooms), RoomOpening + NextRoom, SoundToggle
  memory/     MemoryRoomView, KeptList (a room's index), MemoryEntry (an opened
              memory), MemoryBody (one case per block type), useHeld (?open=)
  rooms/      Invitation, Library, PeopleAtTable, UnmarkedDoor
  threshold/  Threshold (the entrance)
  admin/      generic ResourceTable / ResourceForm driven by resource config
```

## Design language: an editorial house

Not an app but a place; not illustrative but photographic; curated, not
assembled. Every screen follows the same discipline:

- **One photograph, one idea, one or two actions.** Each room opens with
  `RoomOpening`: its name on a hairline rule, one line of italic serif, one real
  photograph of Chapter 0. Nothing is drawn — no SVG objects, no scrapbook.
- **Photography carries the emotion; typography carries the story.** One serif
  family (Cormorant) at a few sizes: spaced capitals for labels, italic for the
  voice of the House, roman for titles. Rules, not cards.
- **Lists are indexes.** What a room keeps is set like a table of contents or the
  running order of an evening (`KeptList`, the Library, the seating list): date,
  title, one line. Opening a line brings a quiet full-screen page
  (`MemoryEntry`): photograph on one side, words on the other, the essentials
  first and "Remember more" for the rest.
- **Palette.** Ivory and paper, ink, oxblood for the single primary action, brass,
  walnut, olive, stone. Warm, never dark — only the entrance and the Unmarked
  Door are night.
- **Motion is a settle, not a show.** Pages fade and rise a few pixels;
  photographs fade in once loaded. `prefers-reduced-motion` removes it.
- **Navigation.** No tabs. A wordmark home, "The plan" (the rooms as a contents
  page with the photograph of the one you point at), and at the end of each
  room a single "Next" and "Back to the Hall".

**Sound** (`src/lib/house/ambience.ts`, `SoundToggle.tsx`) is off until a person
turns it on, every visit. Each room names a recording (`file`) and, until one
exists, a quiet synthesised stand-in. Rooms cross-fade.

## Trade-offs

| Decision | Why | Cost |
|---|---|---|
| Compose on the server, deny direct client reads | Keeps hidden content hidden; single source of visibility logic | No realtime client subscriptions (not needed) |
| Load a per-viewer world snapshot, evaluate in memory | Rules stay simple TypeScript, and time preview is free | Fine for thousands of objects, not millions. Can move to SQL views later behind the same interface |
| Editorial, photographic pages; no drawn objects, no WebGL | Quiet, fast on phones, accessible; the photographs carry the feeling | Every room depends on having one good photograph: a Chapter without photography looks bare |
| Fixed atmosphere layer + scrolling surfaces | Light stays in place as you move through a room; the table scrolls with its objects | Two layers to keep in tune per room |
| Synthesised ambience | Proves the sound architecture with zero assets | Recordings will sound far better: drop files in `public/house/sound/` |
| Demo store fallback | The prototype runs with zero setup and on any Vercel preview | Demo edits are not persistent |
| Content blocks as JSON on `memories` | Memories vary a lot (route, recipe, playlist); new block types need no migration | Less relational querying inside a memory (not needed) |
| Generic admin driven by config | One CRUD for twelve tables; easy to extend | Conventional look, which the brief allows |

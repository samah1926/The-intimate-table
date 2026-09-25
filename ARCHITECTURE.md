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
  house/      HouseShell (light, grain, transitions), Threshold, Plan (floor-plan
              navigation), Doorway, RoomHeader
  rooms/      Hall, Table, Library, Studio, MemoryRoom, UnmarkedDoor
  objects/    ObjectArt (one drawing per kind: envelope, place card, menu,
              photograph, cassette, shoes, flower, key, note, book...),
              MemorySheet (opened memory), blocks/ (note, photos, music, recipe,
              route, people, learned, journal, quote, audio)
  paper/      Letter (typewritten), Thread (tied / untied), SpacedCaps
  admin/      generic ResourceTable / ResourceForm driven by resource config
```

## Navigation and motion

- **No bottom bar, no tabs.** Rooms are reached through doorways drawn in the Hall
  and at the end of each room, and through **the Plan**: a small folded floor-plan
  in the corner that opens an architectural drawing of the house. Rooms you have
  not been given are drawn without a name.
- **Light carries the transition.** Each room defines its light (background, ink,
  glow). Moving between rooms cross-fades the light over ~900 ms while the new
  room rises slightly out of depth (scale .985 → 1, blur 6px → 0).
- **Shared-element opening.** An object grows into its memory sheet (Framer
  Motion `layoutId`). Photographs develop (blur + exposure to clear).
- **Thread.** Sealed objects are drawn tied with thread. Opening one unties it.
- `prefers-reduced-motion` turns all of this into plain fades.
- No sound by default. Audio only plays when a person presses play on a cassette
  or voice note.

## Trade-offs

| Decision | Why | Cost |
|---|---|---|
| Compose on the server, deny direct client reads | Keeps hidden content hidden; single source of visibility logic | No realtime client subscriptions (not needed) |
| Load a per-viewer world snapshot, evaluate in memory | Rules stay simple TypeScript, and time preview is free | Fine for thousands of objects, not millions. Can move to SQL views later behind the same interface |
| 2D + depth, drawn objects, no WebGL | Performant on phones, accessible, timeless. Emotion over spectacle | Less "wow" than 3D. Real photography replaces drawings as it arrives |
| Drawn SVG objects as placeholders | No stock imagery, consistent tone | Real Chapter photos should be added through `media_assets` |
| Demo store fallback | The prototype runs with zero setup and on any Vercel preview | Demo edits are not persistent |
| Content blocks as JSON on `memories` | Memories vary a lot (route, recipe, playlist); new block types need no migration | Less relational querying inside a memory (not needed) |
| Generic admin driven by config | One CRUD for twelve tables; easy to extend | Conventional look, which the brief allows |

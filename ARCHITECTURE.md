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

## Atmosphere, photography, sound

The House should feel inhabited, so every room has four layers, back to front:

1. **Light** (`src/lib/house/light.ts`): background, ink and glow per room.
   Darkness is always warm and has a source (a lamp, candles); never flat black.
2. **Air** (`components/house/Atmosphere.tsx`): a fixed layer per room with its
   plate (plaster lit by the sun, sage wall by a window, limestone in morning
   beams), palm-leaf shadows that sway, dust turning in the light, a curtain,
   candle flicker. It cross-fades when you change rooms.
3. **Surfaces and traces**: rooms that are surfaces (the Table, the Memory
   Room, the Library desk) are drawn as walnut or oak; `components/objects/Traces.tsx`
   lays out what people left (glasses, napkins, candles burned down, an open
   book, a half-drunk coffee, a towel). Decorative only, never data.
4. **Objects** (`components/objects/Physical.tsx`): the things that hold
   memories, drawn as physical objects (Polaroid, folded menu, dried flower,
   brass key, record in its sleeve, folded note).

**Picking something up** (`MemoryFocus.tsx`) is a shared-element transition
(Framer Motion `layoutId`): the object leaves its exact place, comes forward,
and a tag tied to it gives chapter, date and time. *Remember more* lays out the
memory's blocks as more objects (`Fragments.tsx`): prints, a torn slip for a
quote, a tape label for the song, an index card, a folded map for a route.
Putting it back returns it to where it lay.

**Moving between rooms** plays `.through-door` (pure CSS): the next room opens
from an arch while the light cross-fades. `prefers-reduced-motion` turns every
ambient movement off.

**Photography** (`components/photo/Photo.tsx`) has physical forms: `polaroid`
(with handwriting and the camera's orange date stamp), `print`, `framed`,
`bleed`. Any `media_assets.url` is used as-is; the prototype ships placeholder
film-like photographs in `public/house/photos/`.

**Materials and placeholder imagery** are rendered offline by
`scripts/darkroom/` (Python, numpy): tileable textures (paper, linen, plaster,
walnut, stone, terracotta, zellige), room plates, leaf shadows with alpha, and
the photographs. Re-run to regenerate; replace any file with real material.

**Sound** (`src/lib/house/ambience.ts`, `SoundToggle.tsx`) is off until a person
turns it on, every visit. Each room names a recording (`file`) and, until one
exists, a quiet synthesised stand-in from filtered noise (room tone, air,
vinyl crackle, a distant glass). Rooms cross-fade.

## Trade-offs

| Decision | Why | Cost |
|---|---|---|
| Compose on the server, deny direct client reads | Keeps hidden content hidden; single source of visibility logic | No realtime client subscriptions (not needed) |
| Load a per-viewer world snapshot, evaluate in memory | Rules stay simple TypeScript, and time preview is free | Fine for thousands of objects, not millions. Can move to SQL views later behind the same interface |
| 2D + depth, drawn objects, no WebGL | Performant on phones, accessible, timeless. Emotion over spectacle | Less "wow" than 3D. Real photography replaces drawings as it arrives |
| Drawn SVG objects as placeholders | No stock imagery, consistent tone | Real Chapter photos should be added through `media_assets` |
| Procedural placeholder photographs | Stock photo hosts are unreachable here, and stock would feel generic; these are soft, film-like and on-palette | They read as impressions, not real photos: replace with Chapter 0 photography |
| Fixed atmosphere layer + scrolling surfaces | Light stays in place as you move through a room; the table scrolls with its objects | Two layers to keep in tune per room |
| Synthesised ambience | Proves the sound architecture with zero assets | Recordings will sound far better: drop files in `public/house/sound/` |
| Demo store fallback | The prototype runs with zero setup and on any Vercel preview | Demo edits are not persistent |
| Content blocks as JSON on `memories` | Memories vary a lot (route, recipe, playlist); new block types need no migration | Less relational querying inside a memory (not needed) |
| Generic admin driven by config | One CRUD for twelve tables; easy to extend | Conventional look, which the brief allows |

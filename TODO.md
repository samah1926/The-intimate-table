# TODO

Legend: `[x]` done · `[ ]` open · `[~]` in progress

## Milestone 1 — Plan
- [x] PRODUCT_VISION.md
- [x] ARCHITECTURE.md
- [x] DATABASE_SCHEMA.md
- [x] MVP_PLAN.md

## Milestone 2 — Foundations
- [x] Design tokens + fonts (paper, ink, thread; spaced caps, typewriter, hand)
- [x] SQL migration
- [x] Domain types
- [x] Rule engine (registry, evaluator, `since`)
- [x] Seed: Chapter 0, Chapter 01, Chapter 02, Léa, Omar, guests, objects, library, studio
- [x] Stores: demo (in-memory) + Supabase
- [x] composeHouse

## Milestone 3 — The House
- [x] Threshold + auth (magic link / demo)
- [x] proxy.ts session guard
- [x] HouseShell: room light, grain, transitions
- [x] The Plan (floor-plan navigation)
- [x] The Hall

## Milestone 4 — Rooms
- [x] Object drawings (ObjectArt)
- [x] Memory sheet + blocks
- [x] Memory Room
- [x] The Table + mutual reconnection
- [x] The Library
- [x] The Studio
- [x] The Unmarked Door
- [x] Physical reveal `/r/[code]`

## Milestone 5 — Admin
- [x] Generic resource CRUD
- [x] Rule presets + validation
- [x] Time preview + view-as

## Milestone 6 — Polish
- [x] Mobile pass
- [x] Reduced motion
- [x] Typography / spacing review of every screen

## Next
- [ ] Try it against a real Supabase project (schema, seed, magic link) — built, not yet run against one
- [ ] Signed URLs for media in the private `house` bucket, and uploads from the admin
- [ ] Real photography and audio for Chapter 0 to replace the drawn scenes
- [ ] Mark an invitation "opened" when its envelope is untied (today: remembered in the browser only)
- [ ] Participants invited to a Chapter before its invitation date see its title early — date participants too
- [ ] Journal: let people leave a sentence for later from the Memory Room (sealed_until)
- [ ] Admin: a small “preview this rule” on the rule form, and pickers instead of raw ids
- [ ] PWA: manifest icons + service worker; offline reading of the Memory Room
- [ ] Accessibility pass with a screen reader (focus trapping in sheets)
- [ ] Sound, only where it earns its place (the record, voice notes)

## Decisions taken along the way
- The first chapter's "during" state replaces the Hall entirely: no doors, no letters — only "The table is set."
- Sealed things are tied with black thread (from the moodboard), never padlocked.
- "New" is never a badge: a slow breath of light under the object, and one sentence in the Hall.
- Things that were always in the House are never "new"; only what a Chapter, a rule or a host put there.
- A person never learns that someone asked to find them, unless they asked too.

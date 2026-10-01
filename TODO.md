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

## Milestone 7 — Make the House feel alive
- [x] Darkroom: textures, room plates, leaf shadows, placeholder photographs
- [x] Light per room; warm darkness with a source; ambient movement (leaves, dust, candles, curtain, grain)
- [x] Doorway transition: the next room opens from an arch
- [x] Memory Room as a lamp-lit table; objects where they were left; phone arrangement
- [x] Picking an object up: comes forward, tag with chapter / date / time, "remember more"
- [x] Human traces in the Hall, Table, Library, Studio and Memory Room
- [x] Photo component (polaroid, print, framed, full bleed, date stamp)
- [x] Sound architecture (off by default, synthesised stand-ins)
- [x] Typography: Instrument Sans for functional text; uppercase only on printed objects

## Milestone 8 — Chapter 0 in its own images
- [x] Real photographs of Chapter 0 (table at sunset, anthuriums, envelope, ticket, menu, welcome card, bundle, morning arch, library)
- [x] Chapter 0 content aligned: Morocco, 13–16 March 2027, dinner at 18:30, the real menu, anthuriums
- [x] ITT monogram, burgundy envelope, ticket-style invitation with a stub
- [x] Demo "present" fixed ten days after Chapter 0 (hosts can switch to real time in Preview)

## Milestone 9 — Elevated: an editorial house
- [x] One serif family, ivory palette, oxblood for the single primary action
- [x] Every room opens on one real photograph and one idea (`RoomOpening`)
- [x] Memory Room: one memory brought forward, everything else as an index; opened memory as a quiet page
- [x] Table: overheard line, "The table" (breakfast / lunch / dinner), seating list, what was left
- [x] Library as a table of contents; reading page with cover
- [x] Studio as a running order of mornings
- [x] Entrance: dusk, the calla, one sentence, "Enter"; Unmarked Door set in serif
- [x] The plan as a contents page
- [x] Removed all drawn objects, procedural photographs, room plates and textures (paper grain kept)
- [x] Chapter 0 dates aligned with the programme: 12 — 15 March 2027, with the itinerary in the invitation

## Next
- [ ] Try it against a real Supabase project (schema, seed, magic link) — built, not yet run against one
- [ ] Signed URLs for media in the private `house` bucket, and uploads from the admin
- [ ] Photography for the Studio (run, yoga, pool) at full resolution — today a small crop of the collage
- [ ] Real ambient recordings per room (`public/house/sound/`)
- [ ] Decide whether the running shoes live in the Studio (today) or the Memory Room (one field in the admin)
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

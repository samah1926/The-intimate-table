# Database schema

Source of truth: [`supabase/migrations/0001_the_house.sql`](supabase/migrations/0001_the_house.sql).
Demo content: [`src/lib/seed/`](src/lib/seed/), pushed to Supabase with `npm run seed:supabase`.

Primary keys are `text`, so seeds and rules can use readable ids
(`obj-letter-to-yourself`). They default to a random uuid. `profiles.id` is the
`auth.users` uuid.

## Entities

```
auth.users ─1:1─ profiles
                   │
chapters ──< chapter_participants >── profiles
   │ ──< preludes
   │ ──< invitations >── profiles
   │ ──< memory_objects ──1:1── memories        (blocks jsonb → media_assets)
   │ ──< knowledge_items
   │ ──< house_events
   │ ──< media_assets
rooms ──< memory_objects

unlock_rules  ── target (target_type, target_id) → any entity above, or a room
user_unlocks  ── per viewer: explicit grants + "seen" markers
people_connections  ── one row per direction of consent; mutual = both rows exist
journal_entries     ── what a person wrote (prelude answers, letters to self)
interactions        ── physical-world signals (QR / NFC scans)
```

## Tables

| table | purpose | key columns |
|---|---|---|
| `profiles` | a person in the House | `display_name`, `first_name`, `place_card_motif` (shell, stone, sprig…), `line` (one sentence others may read), `contact` (revealed only on mutual consent), `role` (`guest`/`host`) |
| `chapters` | a real experience | `slug`, `number`, `title`, `subtitle`, `description`, `location_label`, `prelude_opens_at`, `starts_at`, `ends_at`, `afterglow_at`, `identity` jsonb (paper, ink, accent, motif), `base_state` |
| `chapter_participants` | who was (or will be) there | `status` (`invited`/`confirmed`/`attended`/`declined`), `role` (`guest`/`host`/`coach`/`chef`/`speaker`), `seat_label`, `place_card_motif` |
| `rooms` | the house plan | `key` (`hall`, `table`, `library`, `studio`, `memory`, `door`), `name`, `epigraph`, `base_state` (the door starts `absent`) |
| `memory_objects` | a thing in a room | `kind`, `label` (text printed on the object), `title`, `caption`, `room_key`, `chapter_id`, `user_id` (personal object), `base_state`, `sealed_hint`, `placement` jsonb |
| `memories` | what an object holds | `object_id` (1:1), `title`, `occurred_at`, `location_label`, `blocks` jsonb |
| `media_assets` | photographs, audio, video | `kind`, `url` or `storage_path`, `alt`, `caption`, `chapter_id`, `owner_user_id` (private media) |
| `knowledge_items` | the Library | `kind` (`book`/`notebook`/`card`/`letter`/`audio`/`annotated`), `subject`, `title`, `author`, `excerpt`, `body`, `chapter_id`, `base_state`, `spine` jsonb |
| `preludes` | the one thing before a Chapter | `kind` (`question`/`music`/`clue`/`coordinates`/`dress`/`bring`/`challenge`/`thought`), `title`, `body`, `response_prompt`, `opens_at` |
| `invitations` | a private way in | `chapter_id`, `user_id`, `code`, `message`, `status`, `expires_at` |
| `house_events` | things that happen *in* the House | `kind` (`letter`/`clue`/`seasonal`/`notice`), `room_key`, `title`, `body`, `signature`, `chapter_id`, `user_id`, `starts_at`, `ends_at`, `base_state` |
| `unlock_rules` | the logic of appearance | `target_type`, `target_id`, `effect` (`reveal`/`open`), `conditions` jsonb, `active` |
| `user_unlocks` | per-person state | `granted_state`, `granted_at`, `seen_at`, `source` |
| `people_connections` | consent to find each other again | `from_user`, `to_user`, `chapter_id` |
| `journal_entries` | what a person wrote | `chapter_id`, `prelude_id`, `object_id`, `prompt`, `body`, `sealed_until` |
| `interactions` | physical signals | `kind` (`scan`), `ref` (code) |

## Memory blocks

`memories.blocks` is an ordered array. New types need no migration, only a renderer.

```ts
{ type: "note",     text }
{ type: "photos",   media_ids: string[] }
{ type: "learned",  text }
{ type: "quote",    text, attribution? }
{ type: "people",   people: { name, role? }[] }        // or { from_chapter: true }
{ type: "music",    side?: "A" | "B", tracks: { title, artist }[] }
{ type: "recipe",   title, serves?, ingredients: string[], steps: string[] }
{ type: "route",    label, distance?, points: [x, y][] } // normalised 0..1
{ type: "audio",    media_id, caption? }
{ type: "journal",  prompt }                            // shows what *this viewer* wrote
```

## Visibility

State per entity per viewer: `absent` < `sealed` < `open`.

1. **Scope.** An entity with `chapter_id` exists only for that Chapter's
   participants (invited or attended, depending on the entity). One with `user_id`
   exists only for that person.
2. **Base.** `base_state`.
3. **Rules.** Each satisfied active rule raises the state to its effect.
4. **Grants.** `user_unlocks.granted_state` (a host's gift, a scanned card).
5. **Schedule.** `house_events.starts_at` / `ends_at` bound everything.

The evaluator also returns **`since`**: when the entity reached its state. Together
with `user_unlocks.seen_at`, that is how the House knows something is new.

## Security

- RLS is enabled on every table. Content tables have **no** policies for
  `anon`/`authenticated`, so the browser cannot read them directly. The server
  composes the House with the service role after resolving the viewer.
- `profiles`: a person can read and update their own row.
- `storage`: bucket `house` is private. The server issues signed URLs.

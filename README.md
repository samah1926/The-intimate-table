# The Intimate Table — The House

> You don't open an app. You come back to a place.

A digital house that fills slowly with what people have actually lived at The
Intimate Table's Chapters. Read [PRODUCT_VISION.md](PRODUCT_VISION.md) first.

| Document | What it covers |
|---|---|
| [PRODUCT_VISION.md](PRODUCT_VISION.md) | The idea, the principles, the rooms, the visual language |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the House is composed, the rule engine, trade-offs |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Tables, memory blocks, visibility, security |
| [MVP_PLAN.md](MVP_PLAN.md) | Scope, and a five-minute demo script |
| [TODO.md](TODO.md) | What's done and what's next |

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

With no environment variables, the House runs on its built-in demo content
(`src/lib/seed`). Knock on the door, then enter as **Léa** (lived Chapter 0) or
**Omar** (invited to Chapter 02, has lived nothing yet). In the demo, "now" is
26 March 2027, ten days after Chapter 0; Preview in the back office moves the
clock anywhere, including to today.

**Back office:** open the plan (top right) → *Back office*, or go to `/admin`.
From there, **Preview** lets you see the House before, during and after a
Chapter, 180 days later, or as someone else.

Demo edits live in memory and reset when the server restarts.

## With Supabase

1. Create a project. Run `supabase/migrations/0001_the_house.sql` in the SQL editor
   (or `supabase db push`).
2. Copy `.env.example` to `.env.local` and fill the three values.
3. `npm run seed:supabase` — creates the demo people as auth users and furnishes
   the House.
4. In Auth → URL configuration, add `http://localhost:3000/auth/callback` (and
   your Vercel URL) as redirect URLs.
5. Sign in with a magic link: `lea@the-house.test`, `omar@the-house.test`, or
   `host@the-house.test` for the back office. Use real addresses for real guests.
   Only people who already exist can ask for a key: the House is by invitation.

## Imagery

The House is photographic: every room opens on one real photograph of Chapter 0,
kept in `public/house/photos/chapter-0/`. Nothing is drawn. The only generated
image is the faint paper grain laid over every page:

```bash
pip install numpy pillow scipy
python3 scripts/darkroom/paper.py
```

To use real photography, upload it and set `url` on the media asset (back
office → Media). To add real ambient sound, put a recording in
`public/house/sound/` and name it in `src/lib/house/ambience.ts`.

## Deploy

Vercel, with the three environment variables. Without them, a Vercel preview
runs the demo.

## Checks

```bash
npm run typecheck    # route types + TypeScript
npm run lint
npm test             # the rule engine, as Léa and Omar would experience it
npm run build
```

## Where things live

```
src/app/                 routes: threshold, /house/*, /admin/*, /r/[code]
src/components/house/    shell, light, plan, doorways
src/components/rooms/    Hall pieces, Table, Library, Unmarked Door
src/components/objects/  drawn objects, memory sheets, memory blocks
src/lib/rules/           conditions registry + resolver (+ tests)
src/lib/house/           composeHouse, session, light
src/lib/data/            demo store, Supabase store
src/lib/seed/            demo content
supabase/migrations/     schema
```

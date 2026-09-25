# MVP plan

The prototype has to communicate the **idea** before it tries to be complete.

## Scope

| # | Item | Notes |
|---|---|---|
| 1 | Authentication | Supabase magic link; demo "Enter" when Supabase isn't configured |
| 2 | The threshold | a dark door, a line of light, one sentence |
| 3 | The Hall | letter from the House, envelope for the next Chapter, what appeared, doors |
| 4 | The Table | place cards of people met, the menu, fragments; mutual reconnection |
| 5 | The Library | shelf of spines, notebooks and cards; one book only for Chapter 0 guests |
| 6 | The Studio | shoes (morning run, with route), mat (mobility), bowl (recovery) |
| 7 | The Memory Room | dark room, lit objects, memory sheets |
| 8 | The Unmarked Door | appears for Chapter 0 guests invited to the next Chapter |
| 9 | Example users | **Léa** attended Chapter 0. **Omar** is invited to Chapter 02 and has lived nothing yet. |
| 10 | Chapter 0 — Thirty | prelude → during → afterglow, all driven by dates |
| 11 | Memory objects | invitation, handwritten note, menu, photograph, record, shoes, flower, key |
| 12 | Locked object | the record: Side B is tied until you've lived *Motion* |
| 13 | Time-based unlock | the letter you wrote to yourself opens 180 days after Chapter 0 |
| 14 | Chapter-based unlock | the key appears only if you attended Chapter 0, and opens the Unmarked Door |
| 15 | Transitions | light cross-fade between rooms, shared-element object opening, developing photographs |
| 16 | Mobile | designed phone-first; spatial layouts collapse into a vertical walk |
| 17 | Admin | generic CRUD for every table, rule presets, **time preview** and **view as** |
| 18 | Schema | `supabase/migrations/0001_the_house.sql` |
| 19 | Seed | `src/lib/seed/`, same data for demo mode and Supabase |

## Demonstrating the product in five minutes

1. Enter as Léa. The Hall: a typewritten letter. The next Chapter's envelope.
   A door that wasn't there.
2. Memory Room: the objects from Chapter 0. Open the photograph; it develops.
   The letter to yourself is tied: *"Not before March."*
3. Admin → Time preview → **+180 days**. Back in the Memory Room the thread is
   gone; the letter reads what Léa wrote before Chapter 0.
4. Time preview → **before Chapter 0**. The House is almost empty: one envelope,
   one question.
5. Time preview → **during Chapter 0**. The House goes quiet: "The table is set."
6. View as **Omar**. The Memory Room holds nothing yet. No key, no door.
7. The Table: ask to find Jakub again. He had already said yes, so his contact
   appears. Selma hasn't, and nothing tells you so.

## Explicitly not in the MVP

Realtime, push notifications (deliberately), native apps, payments, Chapter
booking flow, full 3D, uploads from guests, offline mode, i18n.

## Milestones (commits)

1. Docs and plan
2. Foundations: tokens, fonts, schema, domain types, seed, rule engine
3. The House: shell, threshold, plan, Hall
4. Rooms: Memory Room + memory sheet, Table, Library, Studio, Unmarked Door
5. Admin + time preview
6. Polish pass: mobile, reduced motion, typography review

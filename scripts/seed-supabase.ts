// Pushes the demo content (src/lib/seed) into a Supabase project.
// Usage: npm run seed:supabase   (reads .env.local)
// Safe to re-run: every row is upserted.

import { createClient } from "@supabase/supabase-js";
import * as seed from "../src/lib/seed/index.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

// 1. People: an auth user for each profile, with the same id.
for (const p of seed.profiles) {
  const email = seed.demoGuests.find((g) => g.id === p.id)?.email ?? `${p.first_name.toLowerCase()}@the-house.test`;
  const { error } = await db.auth.admin.createUser({
    id: p.id,
    email,
    email_confirm: true,
    user_metadata: { display_name: p.display_name, first_name: p.first_name },
  } as never);
  if (error && !/already/i.test(error.message)) throw error;
}

const steps: [string, unknown[], string][] = [
  ["profiles", seed.profiles, "id"],
  ["chapters", seed.chapters, "id"],
  ["rooms", seed.rooms, "key"],
  ["chapter_participants", seed.participants, "chapter_id,user_id"],
  ["preludes", seed.preludes, "id"],
  ["invitations", seed.invitations, "id"],
  ["media_assets", seed.media, "id"],
  ["memory_objects", seed.objects, "id"],
  ["memories", seed.memories, "id"],
  ["knowledge_items", seed.knowledge, "id"],
  ["house_events", seed.events, "id"],
  ["unlock_rules", seed.rules, "id"],
  ["people_connections", seed.connections, "id"],
  ["journal_entries", seed.journal, "id"],
  ["interactions", seed.interactions, "id"],
];

for (const [table, rows, onConflict] of steps) {
  if (!rows.length) continue;
  const { error } = await db.from(table).upsert(rows as never[], { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table} (${rows.length})`);
}

console.log("\nThe House is furnished. Sign in as:");
for (const g of seed.demoGuests) console.log(`  ${g.email} — ${g.note}`);

import "server-only";
import type { HouseState, Interaction, JournalEntry, Profile, TargetType, World } from "@/lib/domain/types";
import { serviceClient } from "@/lib/supabase/server";
import type { HouseStore, Row, Table } from "./store";
import { PRIMARY_KEYS } from "./store";

// Composition happens on the server with the service role, after the viewer is
// resolved. Private tables are always filtered to that viewer here.

export class SupabaseStore implements HouseStore {
  readonly mode = "supabase" as const;

  private get db() {
    return serviceClient();
  }

  private async all<T>(table: Table, where?: { eq?: [string, string]; or?: string }): Promise<T[]> {
    let q = this.db.from(table).select("*");
    if (where?.eq) q = q.eq(where.eq[0], where.eq[1]);
    if (where?.or) q = q.or(where.or);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    return (data ?? []) as T[];
  }

  async loadWorld(viewerId: string): Promise<World | null> {
    const viewer = await this.getProfile(viewerId);
    if (!viewer) return null;
    const [
      profiles, chapters, participants, preludes, invitations, rooms, media, objects, memories,
      knowledge, events, rules, unlocks, connections, journal, interactions,
    ] = await Promise.all([
      this.all<World["profiles"][number]>("profiles"),
      this.all<World["chapters"][number]>("chapters"),
      this.all<World["participants"][number]>("chapter_participants"),
      this.all<World["preludes"][number]>("preludes"),
      this.all<World["invitations"][number]>("invitations", { eq: ["user_id", viewerId] }),
      this.all<World["rooms"][number]>("rooms"),
      this.all<World["media"][number]>("media_assets"),
      this.all<World["objects"][number]>("memory_objects"),
      this.all<World["memories"][number]>("memories"),
      this.all<World["knowledge"][number]>("knowledge_items"),
      this.all<World["events"][number]>("house_events"),
      this.all<World["rules"][number]>("unlock_rules"),
      this.all<World["unlocks"][number]>("user_unlocks", { eq: ["user_id", viewerId] }),
      this.all<World["connections"][number]>("people_connections", { or: `from_user.eq.${viewerId},to_user.eq.${viewerId}` }),
      this.all<World["journal"][number]>("journal_entries", { eq: ["user_id", viewerId] }),
      this.all<World["interactions"][number]>("interactions", { eq: ["user_id", viewerId] }),
    ]);
    return {
      viewer, profiles, chapters, participants, preludes, invitations, rooms, media, objects, memories,
      knowledge, events, rules, unlocks, connections, journal, interactions,
    };
  }

  async getProfile(id: string) {
    const { data } = await this.db.from("profiles").select("*").eq("id", id).maybeSingle();
    return (data as Profile | null) ?? null;
  }

  async listProfiles() {
    return this.all<Profile>("profiles");
  }

  async markSeen(userId: string, type: TargetType, id: string, at: Date) {
    await this.db
      .from("user_unlocks")
      .upsert({ user_id: userId, target_type: type, target_id: id, seen_at: at.toISOString() } as never, {
        onConflict: "user_id,target_type,target_id",
      });
  }

  async grant(userId: string, type: TargetType, id: string, state: HouseState, source: string, at: Date) {
    await this.db
      .from("user_unlocks")
      .upsert(
        { user_id: userId, target_type: type, target_id: id, granted_state: state, granted_at: at.toISOString(), source } as never,
        { onConflict: "user_id,target_type,target_id" },
      );
  }

  async recordInteraction(i: Omit<Interaction, "id">) {
    await this.db.from("interactions").insert(i as never);
  }

  async setConsent(from: string, to: string, chapterId: string | null, consent: boolean, at: Date) {
    if (consent) {
      await this.db
        .from("people_connections")
        .upsert({ from_user: from, to_user: to, chapter_id: chapterId, created_at: at.toISOString() } as never, {
          onConflict: "from_user,to_user",
        });
    } else {
      await this.db.from("people_connections").delete().eq("from_user", from).eq("to_user", to);
    }
  }

  async writeJournal(e: Omit<JournalEntry, "id">) {
    await this.db.from("journal_entries").insert(e as never);
  }

  async list(table: Table) {
    return this.all<Row>(table);
  }

  async upsert(table: Table, row: Row) {
    const { error } = await this.db.from(table).upsert(row as never, { onConflict: PRIMARY_KEYS[table].join(",") });
    if (error) throw new Error(error.message);
  }

  async remove(table: Table, key: Row) {
    let q = this.db.from(table).delete();
    for (const [k, v] of Object.entries(key)) q = q.eq(k, v as string);
    const { error } = await q;
    if (error) throw new Error(error.message);
  }
}

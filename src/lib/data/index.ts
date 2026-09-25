import "server-only";
import { DemoStore } from "./demo-store";
import type { HouseStore } from "./store";
import { SupabaseStore } from "./supabase-store";
import { isSupabaseConfigured } from "@/lib/supabase/env";

let store: HouseStore | null = null;

/** The House's memory. Supabase when configured, an in-memory demo otherwise. */
export function getStore(): HouseStore {
  if (!store) store = isSupabaseConfigured() ? new SupabaseStore() : new DemoStore();
  return store;
}

export type { HouseStore, Table, Row } from "./store";
export { TABLES, PRIMARY_KEYS } from "./store";

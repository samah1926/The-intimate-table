"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { resource, type Field } from "@/lib/admin/resources";
import { getStore, PRIMARY_KEYS, type Row } from "@/lib/data";
import { parseCondition } from "@/lib/rules/conditions";
import { CLOCK_COOKIE, VIEW_AS_COOKIE, canPreview, getSignedIn } from "@/lib/house/session";

async function requireHost() {
  const me = await getSignedIn();
  if (!(await canPreview(me))) redirect("/");
  return me!;
}

function coerce(field: Field, raw: FormDataEntryValue | null): unknown {
  const v = typeof raw === "string" ? raw.trim() : "";
  switch (field.type) {
    case "bool":
      return raw === "on" || raw === "true";
    case "number":
      return v === "" ? 0 : Number(v);
    case "datetime":
      // Inputs are in UTC, labelled as such in the form.
      return v === "" ? null : new Date(`${v}Z`).toISOString();
    case "json":
      if (v === "") return field.name === "blocks" ? [] : {};
      try {
        return JSON.parse(v);
      } catch {
        throw new Error(`${field.label ?? field.name}: not valid JSON`);
      }
    default:
      return v === "" ? null : v;
  }
}

export async function saveRow(table: string, originalKey: string | null, formData: FormData) {
  await requireHost();
  const res = resource(table);
  if (!res) redirect("/admin");
  const back = `/admin/${table}/edit${originalKey ? `?k=${encodeURIComponent(originalKey)}` : ""}`;

  const row: Row = {};
  try {
    for (const f of res.fields) {
      const value = coerce(f, formData.get(f.name));
      if ((value === null || value === "") && f.auto) continue;
      if (value === null && f.required) throw new Error(`${f.label ?? f.name} is required`);
      row[f.name] = value;
    }
    if (res.fields.some((f) => f.name === "created_at") && !row.created_at) row.created_at = new Date().toISOString();
    if (table === "unlock_rules") {
      try {
        row.conditions = parseCondition(row.conditions);
      } catch (e) {
        throw new Error(
          e instanceof z.ZodError
            ? "Conditions: not a known rule. Use all / any / not, or one of the presets."
            : "Conditions: invalid",
        );
      }
    }
    if (table === "memories" && !Array.isArray(row.blocks)) throw new Error("blocks must be an array");
  } catch (e) {
    redirect(`${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent(e instanceof Error ? e.message.split("\n")[0] : "Invalid")}`);
  }

  const store = getStore();
  // Changing a primary key: remove the old row first.
  if (originalKey) {
    const old = JSON.parse(originalKey) as Row;
    const changed = PRIMARY_KEYS[res.table].some((k) => row[k] !== undefined && row[k] !== old[k]);
    if (changed) await store.remove(res.table, old);
  }
  await store.upsert(res.table, row);
  revalidatePath("/", "layout");
  redirect(`/admin/${table}?saved=1`);
}

export async function deleteRow(table: string, key: string) {
  await requireHost();
  const res = resource(table);
  if (!res) redirect("/admin");
  await getStore().remove(res.table, JSON.parse(key) as Row);
  revalidatePath("/", "layout");
  redirect(`/admin/${table}`);
}

/** Preview the House at another moment, or as someone else. */
export async function setPreview(formData: FormData) {
  await requireHost();
  const jar = await cookies();
  const clock = String(formData.get("clock") ?? "");
  const custom = String(formData.get("custom") ?? "");
  const as = String(formData.get("as") ?? "");
  const opts = { httpOnly: true, sameSite: "lax" as const, path: "/" };

  const t = clock === "custom" ? (custom ? new Date(`${custom}Z`) : null) : clock && clock !== "real" ? new Date(clock) : null;
  if (clock === "real") jar.set(CLOCK_COOKIE, "real", opts);
  else if (t && !Number.isNaN(t.getTime())) jar.set(CLOCK_COOKIE, t.toISOString(), opts);
  else jar.delete(CLOCK_COOKIE);

  if (as) jar.set(VIEW_AS_COOKIE, as, opts);
  else jar.delete(VIEW_AS_COOKIE);

  revalidatePath("/", "layout");
  redirect(formData.get("go") === "house" ? "/house" : "/admin");
}

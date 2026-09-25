import Link from "next/link";
import { setPreview } from "../admin/actions";
import { getStore } from "@/lib/data";
import { chapterLabel, chapterPhase } from "@/lib/domain/chapters";
import type { TargetType, World } from "@/lib/domain/types";
import { getHouseContext } from "@/lib/house/session";
import { describe } from "@/lib/rules/conditions";
import { Resolver } from "@/lib/rules/resolve";
import { DEMO_NOW } from "@/lib/seed";

const DAY = 86_400_000;
const fmt = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Paris" }).format(d);

/** Useful moments to preview, derived from the Chapters themselves. */
function moments(world: World) {
  const out: { label: string; at: Date }[] = [];
  for (const c of [...world.chapters].sort((a, b) => a.sort - b.sort)) {
    if (!c.starts_at) continue;
    const name = chapterLabel(c);
    const start = new Date(c.starts_at);
    const glow = c.afterglow_at ? new Date(c.afterglow_at) : new Date(start.getTime() + DAY);
    const prelude = c.prelude_opens_at ? new Date(c.prelude_opens_at) : null;
    out.push({ label: `Before ${name} — the prelude`, at: prelude ? new Date(prelude.getTime() + 2 * DAY) : new Date(start.getTime() - 7 * DAY) });
    out.push({ label: `During ${name}`, at: new Date(start.getTime() + 3 * 3_600_000) });
    out.push({ label: `The morning after ${name}`, at: new Date(glow.getTime() + 3 * 3_600_000) });
    out.push({ label: `${name} + 180 days`, at: new Date(glow.getTime() + 181 * DAY) });
  }
  return out;
}

const TYPES: { type: TargetType; label: string; list: (w: World) => { id: string; name: string }[] }[] = [
  { type: "room", label: "Rooms", list: (w) => w.rooms.map((r) => ({ id: r.key, name: r.name })) },
  { type: "memory_object", label: "Objects", list: (w) => w.objects.map((o) => ({ id: o.id, name: `${o.title} · ${o.room_key}` })) },
  { type: "knowledge_item", label: "Library", list: (w) => w.knowledge.map((k) => ({ id: k.id, name: k.title })) },
  { type: "house_event", label: "Letters & clues", list: (w) => w.events.map((e) => ({ id: e.id, name: e.title ?? e.body.slice(0, 48) })) },
  { type: "chapter", label: "Chapters", list: (w) => w.chapters.map((c) => ({ id: c.id, name: chapterLabel(c) })) },
];

const STATE_STYLE = {
  open: "bg-emerald-100 text-emerald-900",
  sealed: "bg-amber-100 text-amber-900",
  absent: "bg-neutral-200 text-neutral-500",
};

export default async function AdminHome() {
  const ctx = (await getHouseContext())!;
  const store = getStore();
  const [world, people] = await Promise.all([store.loadWorld(ctx.viewerId), store.listProfiles()]);
  if (!world) return null;
  const resolver = new Resolver(world, ctx.viewerId, ctx.now);
  const presets = moments(world);
  const demo = store.mode === "demo";
  const isoLocal = ctx.now.toISOString().slice(0, 16);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold">Preview</h1>
      <p className="mt-1 text-neutral-600">See the House at any moment, as anyone. Only you see the preview; nothing is changed for them.</p>

      <form action={setPreview} className="mt-6 grid gap-5 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-medium">When</legend>
          <div className="mt-2 space-y-1.5 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="clock" value="" defaultChecked={!ctx.previewing.clock} /> {demo ? `The demo’s present · ${fmt(new Date(DEMO_NOW))}` : "Now"}
            </label>
            {demo && (
              <label className="flex items-center gap-2">
                <input type="radio" name="clock" value="real" /> Today (real time)
              </label>
            )}
            {presets.map((p) => (
              <label key={p.label} className="flex items-center gap-2">
                <input type="radio" name="clock" value={p.at.toISOString()} defaultChecked={ctx.previewing.clock && Math.abs(+p.at - +ctx.now) < 60_000} />
                {p.label} <span className="text-neutral-400">· {fmt(p.at)}</span>
              </label>
            ))}
            <label className="flex flex-wrap items-center gap-2">
              <input type="radio" name="clock" value="custom" /> Another moment
              <input type="datetime-local" name="custom" defaultValue={isoLocal} className="rounded border border-neutral-300 px-2 py-0.5" />
              <span className="text-neutral-400">UTC</span>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">As</legend>
          <select name="as" defaultValue={ctx.previewing.viewAs ? ctx.viewerId : ""} className="mt-2 w-full rounded border border-neutral-300 px-2 py-1.5 text-sm">
            <option value="">Myself ({ctx.signedIn.display_name})</option>
            {people
              .filter((p) => p.id !== ctx.signedIn.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
          </select>
          <div className="mt-6 flex flex-wrap gap-2">
            <button name="go" value="house" className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">
              Apply and enter the House
            </button>
            <button name="go" value="admin" className="rounded border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100">
              Apply
            </button>
          </div>
        </fieldset>
      </form>

      <h2 className="mt-12 text-lg font-semibold">
        What {world.viewer.display_name} sees on {fmt(ctx.now)}
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        Chapters:{" "}
        {world.chapters
          .filter((c) => c.starts_at)
          .map((c) => `${chapterLabel(c)} is in ${chapterPhase(c, ctx.now)}`)
          .join(" · ")}
      </p>

      <div className="mt-6 space-y-8">
        {TYPES.map((t) => (
          <section key={t.type}>
            <h3 className="text-sm font-medium text-neutral-500">{t.label}</h3>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {t.list(world).map((e) => {
                  const r = resolver.resolve(t.type, e.id);
                  return (
                    <tr key={e.id} className="border-t border-neutral-200 align-top">
                      <td className="w-24 py-1.5">
                        <span className={`rounded px-1.5 py-0.5 text-xs ${STATE_STYLE[r.state]}`}>{r.state}</span>
                      </td>
                      <td className="py-1.5 pr-4">{e.name}</td>
                      <td className="py-1.5 text-neutral-500">{r.reasons.join(" · ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold">Rules</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {world.rules.map((r) => (
          <li key={r.id} className="rounded border border-neutral-200 bg-white px-4 py-3">
            <Link href={`/admin/unlock_rules/edit?k=${encodeURIComponent(JSON.stringify({ id: r.id }))}`} className="font-medium hover:underline">
              {r.name}
            </Link>
            {!r.active && <span className="ml-2 text-xs text-neutral-400">inactive</span>}
            <p className="mt-1 font-mono text-xs text-neutral-600">
              IF {describe(r.conditions)} THEN {r.effect} {r.target_type} {r.target_id}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

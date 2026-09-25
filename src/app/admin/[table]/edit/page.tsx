import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRow, saveRow } from "@/app/admin/actions";
import { RulePresets } from "@/components/admin/RulePresets";
import { resource, type Field } from "@/lib/admin/resources";
import { getStore, PRIMARY_KEYS, type Row } from "@/lib/data";

const input = "mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

function asInput(f: Field, v: unknown): string {
  if (v === null || v === undefined) return "";
  if (f.type === "json") return JSON.stringify(v, null, 2);
  if (f.type === "datetime") return String(v).slice(0, 16);
  return String(v);
}

export default async function ResourceEdit({ params, searchParams }: PageProps<"/admin/[table]/edit">) {
  const { table } = await params;
  const { k, error } = await searchParams;
  const res = resource(table);
  if (!res) notFound();
  const store = getStore();
  const key = typeof k === "string" ? k : null;

  let row: Row | undefined;
  if (key) {
    const want = JSON.parse(key) as Row;
    row = (await store.list(res.table)).find((r) => PRIMARY_KEYS[res.table].every((p) => r[p] === want[p]));
    if (!row) notFound();
  }

  // Options for reference fields.
  const refs = new Map<string, { value: string; label: string }[]>();
  for (const f of res.fields.filter((f) => f.type === "ref")) {
    const rows = await store.list(f.ref!.table);
    const valueKey = f.ref!.value ?? PRIMARY_KEYS[f.ref!.table][0];
    refs.set(
      f.name,
      rows.map((r) => ({ value: String(r[valueKey]), label: `${r[f.ref!.label] ?? r[valueKey]} (${r[valueKey]})` })),
    );
  }

  const save = saveRow.bind(null, table, key);
  const remove = key ? deleteRow.bind(null, table, key) : null;

  return (
    <div className="max-w-3xl">
      <Link href={`/admin/${table}`} className="text-sm text-neutral-500 hover:underline">
        ← {res.label}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{row ? String(row[res.title] ?? "Edit") : `New — ${res.label}`}</h1>
      {typeof error === "string" && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

      <form action={save} className="mt-6 space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
        {res.fields.map((f) => {
          const v = row?.[f.name] ?? (f.type === "bool" && !row ? true : undefined);
          const label = (
            <span className="text-sm font-medium">
              {f.label ?? f.name.replace(/_/g, " ")}
              {f.required && <span className="text-red-600"> *</span>}
              {f.type === "datetime" && <span className="ml-1 font-normal text-neutral-400">UTC</span>}
            </span>
          );
          const help = f.help && <span className="mt-1 block text-xs text-neutral-500">{f.help}</span>;
          switch (f.type) {
            case "textarea":
              return (
                <label key={f.name} className="block">
                  {label}
                  <textarea name={f.name} defaultValue={asInput(f, v)} rows={6} className={input} />
                  {help}
                </label>
              );
            case "json":
              return (
                <label key={f.name} className="block">
                  {label}
                  {table === "unlock_rules" && f.name === "conditions" && <RulePresets target="conditions" />}
                  <textarea id={f.name} name={f.name} defaultValue={asInput(f, v)} rows={f.name === "blocks" ? 18 : 6} className={`${input} font-mono text-xs`} />
                  {help}
                </label>
              );
            case "bool":
              return (
                <label key={f.name} className="flex items-center gap-2">
                  <input type="checkbox" name={f.name} defaultChecked={Boolean(v)} />
                  {label}
                </label>
              );
            case "select":
            case "ref": {
              const options = f.type === "ref" ? refs.get(f.name)! : (f.options ?? []).map((o) => ({ value: o, label: o }));
              return (
                <label key={f.name} className="block">
                  {label}
                  <select name={f.name} defaultValue={asInput(f, v)} className={input}>
                    {!f.required && <option value="">—</option>}
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {help}
                </label>
              );
            }
            default:
              return (
                <label key={f.name} className="block">
                  {label}
                  <input
                    name={f.name}
                    type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : "text"}
                    defaultValue={asInput(f, v)}
                    className={input}
                  />
                  {help}
                </label>
              );
          }
        })}
        <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
          <button className="rounded bg-neutral-900 px-5 py-2 text-sm text-white hover:bg-neutral-700">Save</button>
          {remove && (
            <button formAction={remove} formNoValidate className="text-sm text-red-700 hover:underline">
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

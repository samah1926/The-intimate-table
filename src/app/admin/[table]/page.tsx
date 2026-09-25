import Link from "next/link";
import { notFound } from "next/navigation";
import { resource } from "@/lib/admin/resources";
import { getStore, PRIMARY_KEYS, type Row } from "@/lib/data";

function cell(v: unknown) {
  if (v === null || v === undefined || v === "") return <span className="text-neutral-300">—</span>;
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "object") return <span className="font-mono text-xs text-neutral-500">{JSON.stringify(v).slice(0, 60)}</span>;
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 16).replace("T", " ");
  return s.length > 70 ? `${s.slice(0, 70)}…` : s;
}

export default async function ResourceList({ params, searchParams }: PageProps<"/admin/[table]">) {
  const { table } = await params;
  const { saved } = await searchParams;
  const res = resource(table);
  if (!res) notFound();
  const rows = await getStore().list(res.table);
  const keyOf = (r: Row) => encodeURIComponent(JSON.stringify(Object.fromEntries(PRIMARY_KEYS[res.table].map((k) => [k, r[k]]))));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{res.label}</h1>
          <p className="mt-1 max-w-2xl text-neutral-600">{res.description}</p>
        </div>
        <Link href={`/admin/${table}/edit`} className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700">
          New
        </Link>
      </div>
      {saved && <p className="mt-4 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Saved.</p>}
      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              {res.columns.map((c) => (
                <th key={c} className="px-4 py-2.5 font-medium">
                  {c.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={keyOf(r)} className="border-t border-neutral-100 hover:bg-neutral-50">
                {res.columns.map((c, i) => (
                  <td key={c} className="px-4 py-2.5">
                    {i === 0 ? (
                      <Link href={`/admin/${table}/edit?k=${keyOf(r)}`} className="hover:underline">
                        {cell(r[c])}
                      </Link>
                    ) : (
                      cell(r[c])
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={res.columns.length} className="px-4 py-8 text-center text-neutral-400">
                  Nothing yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

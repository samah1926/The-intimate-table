import Link from "next/link";
import { redirect } from "next/navigation";
import { RESOURCES } from "@/lib/admin/resources";
import { getStore } from "@/lib/data";
import { canPreview, getSignedIn } from "@/lib/house/session";
import { AdminLight } from "@/components/admin/AdminLight";

export const metadata = { title: "Back office" };

// Functional and conventional on purpose. The House must never look like this.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const me = await getSignedIn();
  if (!(await canPreview(me))) redirect("/house");
  const groups = [...new Set(RESOURCES.map((r) => r.group))];
  const demo = getStore().mode === "demo";

  return (
    <div className="min-h-dvh bg-[#f5f4f1] font-sans text-[15px] leading-normal text-neutral-900">
      <AdminLight />
      <div className="mx-auto flex max-w-[92rem] flex-col md:flex-row">
        <aside className="border-b border-neutral-200 px-5 py-5 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r md:py-8">
          <Link href="/admin" className="block text-sm font-semibold">
            The House · back office
          </Link>
          <p className="mt-1 text-xs text-neutral-500">{demo ? "Demo store — changes last until the server restarts" : "Supabase"}</p>
          <nav className="mt-6 flex gap-6 overflow-x-auto md:block md:space-y-6">
            <div>
              <Link href="/admin" className="block rounded px-2 py-1 text-sm hover:bg-neutral-200/60">
                Preview &amp; rules
              </Link>
              <Link href="/house" className="block rounded px-2 py-1 text-sm hover:bg-neutral-200/60">
                ← Enter the House
              </Link>
            </div>
            {groups.map((g) => (
              <div key={g} className="shrink-0">
                <p className="px-2 text-[11px] font-medium uppercase tracking-wider text-neutral-400">{g}</p>
                <ul className="mt-1.5">
                  {RESOURCES.filter((r) => r.group === g).map((r) => (
                    <li key={r.table}>
                      <Link href={`/admin/${r.table}`} className="block whitespace-nowrap rounded px-2 py-1 text-sm hover:bg-neutral-200/60">
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}

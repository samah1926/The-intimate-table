import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/data";
import type { Condition } from "@/lib/rules/conditions";
import { getHouseContext } from "@/lib/house/session";
import { composeHouse } from "@/lib/house/compose";
import { ROOM_PATH } from "@/lib/house/light";

// A physical reveal: a QR code or NFC tag on a card at the table.
// Scanning records the moment; the rules decide what, if anything, opens.

function mentions(cond: Condition, code: string): boolean {
  if ("all" in cond) return cond.all.some((c) => mentions(c, code));
  if ("any" in cond) return cond.any.some((c) => mentions(c, code));
  if ("not" in cond) return mentions(cond.not, code);
  return cond.type === "scanned_code" && cond.code === code;
}

export async function GET(request: NextRequest, ctx: RouteContext<"/r/[code]">) {
  const { code } = await ctx.params;
  const house = await getHouseContext();
  if (!house) return NextResponse.redirect(new URL("/", request.url));

  const store = getStore();
  const world = await store.loadWorld(house.viewerId);
  const rule = world?.rules.find((r) => r.active && mentions(r.conditions, code));
  if (!world || !rule || house.previewing.viewAs) return NextResponse.redirect(new URL("/house", request.url));

  if (!world.interactions.some((i) => i.kind === "scan" && i.ref === code)) {
    await store.recordInteraction({ user_id: house.viewerId, kind: "scan", ref: code, created_at: house.now.toISOString() });
    world.interactions.push({ id: "just-now", user_id: house.viewerId, kind: "scan", ref: code, created_at: house.now.toISOString() });
  }

  // Go straight to what opened, if it can be shown.
  const view = composeHouse(world, house.now);
  const obj = rule.target_type === "memory_object" ? view.objects.find((o) => o.id === rule.target_id) : null;
  if (obj) return NextResponse.redirect(new URL(`${ROOM_PATH[obj.room]}?open=${obj.slug}`, request.url));
  return NextResponse.redirect(new URL("/house", request.url));
}

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getStore } from "@/lib/data";
import type { Profile } from "@/lib/domain/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";
import { composeHouse } from "./compose";
import { DEMO_NOW } from "@/lib/seed";

export const GUEST_COOKIE = "house_guest";
export const CLOCK_COOKIE = "house_clock";
export const VIEW_AS_COOKIE = "house_view_as";

/** The person actually signed in (not who they may be previewing as). */
export const getSignedIn = cache(async (): Promise<Profile | null> => {
  const store = getStore();
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    const { data } = await supabase.auth.getUser();
    return data.user ? store.getProfile(data.user.id) : null;
  }
  const id = (await cookies()).get(GUEST_COOKIE)?.value;
  return id ? store.getProfile(id) : null;
});

/** Hosts may preview the House at another time, or as someone else. So can anyone in the demo. */
export async function canPreview(p: Profile | null) {
  return !!p && (p.role === "host" || !isSupabaseConfigured());
}

export interface HouseContext {
  signedIn: Profile;
  viewerId: string;
  now: Date;
  previewing: { clock: boolean; viewAs: boolean };
}

export const getHouseContext = cache(async (): Promise<HouseContext | null> => {
  const signedIn = await getSignedIn();
  if (!signedIn) return null;
  const jar = await cookies();
  let viewerId = signedIn.id;
  // In the demo the present is fixed a few days after Chapter 0, so the House
  // is lived in when you arrive. "real" in the clock cookie uses today's date.
  let now = isSupabaseConfigured() ? new Date() : new Date(DEMO_NOW);
  const previewing = { clock: false, viewAs: false };

  if (await canPreview(signedIn)) {
    const asId = jar.get(VIEW_AS_COOKIE)?.value;
    if (asId && asId !== signedIn.id && (await getStore().getProfile(asId))) {
      viewerId = asId;
      previewing.viewAs = true;
    }
    const clock = jar.get(CLOCK_COOKIE)?.value;
    const t = clock === "real" ? new Date() : clock ? new Date(clock) : null;
    if (t && !Number.isNaN(t.getTime())) {
      now = t;
      previewing.clock = true;
    }
  }
  return { signedIn, viewerId, now, previewing };
});

/** The House as it stands for this person, now. Redirects to the threshold when nobody is signed in. */
export const getHouse = cache(async () => {
  const ctx = await getHouseContext();
  if (!ctx) redirect("/");
  const world = await getStore().loadWorld(ctx.viewerId);
  if (!world) redirect("/");
  // Letters address the viewer by name.
  const view = composeHouse(world, ctx.now);
  for (const l of [...view.hall.letters, ...view.hall.clues, ...view.door.letters]) {
    l.body = l.body.replaceAll("{first_name}", view.viewer.first_name);
  }
  return { view, ctx };
});

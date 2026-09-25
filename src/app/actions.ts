"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getStore } from "@/lib/data";
import { CLOCK_COOKIE, GUEST_COOKIE, VIEW_AS_COOKIE } from "@/lib/house/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

const YEAR = 60 * 60 * 24 * 365;

/** Demo only: step inside as one of the example guests. */
export async function enterAsGuest(formData: FormData) {
  if (isSupabaseConfigured()) redirect("/");
  const id = z.string().parse(formData.get("guest"));
  if (!(await getStore().getProfile(id))) redirect("/");
  const jar = await cookies();
  jar.set(GUEST_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: YEAR });
  jar.delete(VIEW_AS_COOKIE);
  redirect("/house");
}

export interface KeyState {
  sent?: string;
  error?: string;
}

/** Sends a magic link. Entering a house, not logging in: no passwords. */
export async function sendKey(_: KeyState, formData: FormData): Promise<KeyState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim());
  if (!email.success) return { error: "That address doesn’t look quite right." };
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: false },
  });
  if (error) return { error: "The House doesn’t recognise that address yet. Invitations come first." };
  return { sent: email.data };
}

export async function leave() {
  const jar = await cookies();
  jar.delete(GUEST_COOKIE);
  jar.delete(VIEW_AS_COOKIE);
  jar.delete(CLOCK_COOKIE);
  if (isSupabaseConfigured()) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

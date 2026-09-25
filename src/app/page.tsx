import { Threshold } from "@/components/threshold/Threshold";
import { demoGuests } from "@/lib/seed";
import { getSignedIn } from "@/lib/house/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function Entrance({ searchParams }: PageProps<"/">) {
  const signedIn = await getSignedIn();
  const { key } = await searchParams;
  const demo = !isSupabaseConfigured();
  return (
    <Threshold
      signedInAs={signedIn?.first_name ?? null}
      mode={demo ? "demo" : "invited"}
      guests={demo ? [{ id: demoGuests[0].id, name: "Léa" }, { id: demoGuests[1].id, name: "Omar" }] : []}
      keyExpired={key === "expired"}
    />
  );
}

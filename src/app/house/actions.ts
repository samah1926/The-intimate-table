"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getStore } from "@/lib/data";
import type { TargetType } from "@/lib/domain/types";
import { getHouse } from "@/lib/house/session";

// Every action re-resolves the viewer and checks against what they can see.
// Nobody can act on something the House hasn't shown them.

/** Keep what someone wrote in answer to a Prelude. */
export async function answerPrelude(preludeId: string, formData: FormData) {
  const { view, ctx } = await getHouse();
  const body = z.string().trim().min(1).max(4000).safeParse(formData.get("body"));
  if (!body.success || ctx.previewing.viewAs) return;
  const moment = view.hall.moments.find((m) => m.preludes.some((p) => p.id === preludeId));
  const prelude = moment?.preludes.find((p) => p.id === preludeId);
  if (!moment || !prelude?.response_prompt) return;
  await getStore().writeJournal({
    user_id: ctx.viewerId,
    chapter_id: moment.chapter.id,
    prelude_id: preludeId,
    object_id: null,
    prompt: prelude.body ?? prelude.title,
    body: body.data,
    sealed_until: null,
    created_at: ctx.now.toISOString(),
  });
  revalidatePath("/house");
}

/** Remember that something has been opened, so it no longer glows. */
export async function markSeen(type: TargetType, id: string) {
  const { view, ctx } = await getHouse();
  if (ctx.previewing.viewAs) return;
  const known =
    (type === "memory_object" && view.objects.some((o) => o.id === id)) ||
    (type === "knowledge_item" && view.library.some((k) => k.id === id));
  if (!known) return;
  await getStore().markSeen(ctx.viewerId, type, id, ctx.now);
  revalidatePath("/house", "layout");
}

/** "I'd like to find this person again." Only ever revealed when it is mutual. */
export async function setConsent(personId: string, consent: boolean) {
  const { view, ctx } = await getHouse();
  if (ctx.previewing.viewAs) return;
  const card = view.table.placeCards.find((c) => c.person_id === personId);
  if (!card) return;
  await getStore().setConsent(ctx.viewerId, personId, card.chapter.id, consent, ctx.now);
  revalidatePath("/house/table");
}

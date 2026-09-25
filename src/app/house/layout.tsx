import { HouseShell } from "@/components/house/HouseShell";
import { getStore } from "@/lib/data";
import { houseDate } from "@/lib/house/light";
import { canPreview, getHouse } from "@/lib/house/session";

export default async function HouseLayout({ children }: LayoutProps<"/house">) {
  const { view, ctx } = await getHouse();
  const mayPreview = await canPreview(ctx.signedIn);
  const viewAs = ctx.previewing.viewAs ? (await getStore().getProfile(ctx.viewerId))?.first_name ?? null : null;
  const preview =
    ctx.previewing.clock || ctx.previewing.viewAs
      ? { clock: ctx.previewing.clock ? houseDate(ctx.now) : null, viewAs }
      : null;

  return (
    <HouseShell rooms={view.rooms} preview={preview} isHost={mayPreview}>
      {children}
    </HouseShell>
  );
}

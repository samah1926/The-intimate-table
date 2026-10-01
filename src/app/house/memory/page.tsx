import { NextRoom } from "@/components/house/RoomOpening";
import { MemoryRoomView } from "@/components/memory/MemoryRoomView";
import { objectsIn } from "@/lib/house/compose";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Memory Room" };

export default async function MemoryRoom({ searchParams }: PageProps<"/house/memory">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  return (
    <>
      <MemoryRoomView
        objects={objectsIn(view, "memory")}
        initialOpen={typeof open === "string" ? open : null}
        place={view.chapter?.lived ? view.chapter.location_label : null}
      />
      <NextRoom from="memory" rooms={view.rooms} />
    </>
  );
}

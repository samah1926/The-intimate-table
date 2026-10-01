import { NextRoom, RoomOpening } from "@/components/house/RoomOpening";
import { KeptList } from "@/components/memory/KeptList";
import { objectsIn } from "@/lib/house/compose";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Studio" };

export default async function Studio({ searchParams }: PageProps<"/house/studio">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  const room = view.rooms.find((r) => r.key === "studio")!;
  const objects = objectsIn(view, "studio");

  return (
    <div>
      <RoomOpening
        room={room}
        aside="Not a record of performance"
        title={room.epigraph}
        lede={
          objects.length > 0 ? (
            <p>Not how fast, or how far. What the mornings were like, and what the body learned from them.</p>
          ) : (
            <p>Whatever your body learns at a Chapter will be kept here.</p>
          )
        }
        image="/house/photos/chapter-0/morning-arch.webp"
        alt="Morning light through an arch onto a terrace"
        narrow
      />
      {objects.length > 0 && (
        <div className="mx-auto mt-32 max-w-[84rem] px-6 sm:mt-40 sm:px-10 lg:px-14">
          <KeptList objects={objects} initialOpen={typeof open === "string" ? open : null} roomName={room.name} title="Mornings" />
        </div>
      )}
      <NextRoom from="studio" rooms={view.rooms} />
    </div>
  );
}

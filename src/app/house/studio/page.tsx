import { Doorways } from "@/components/house/Doorways";
import { RoomHeader } from "@/components/house/RoomHeader";
import { Traces } from "@/components/objects/Traces";
import { Photo } from "@/components/photo/Photo";
import { ObjectsInRoom } from "@/components/objects/ObjectsInRoom";
import { objectsIn } from "@/lib/house/compose";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Studio" };

export default async function Studio({ searchParams }: PageProps<"/house/studio">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  const room = view.rooms.find((r) => r.key === "studio")!;
  const objects = objectsIn(view, "studio");

  return (
    <>
      <RoomHeader room={room} aside="Not a record of performance. A record of mornings." />
      {objects.length > 0 && (
        <Photo
          form="bleed"
          aspect="21 / 7"
          develop
          className="mt-16 sm:mt-20"
          media={{ url: "/house/photos/road-dawn.webp", scene: "road", alt: "The road behind the house at first light", caption: "The road behind the house, 6:12" }}
        />
      )}
      {objects.length === 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-32 text-center sm:px-10 sm:py-44">
          <p className="text-[1.7rem] font-light italic">The floor is swept.</p>
          <p className="mt-4 text-lg muted">Whatever your body learns at a Chapter will be left here.</p>
        </section>
      ) : (
        <section aria-label="On the floor" className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-10 sm:pt-28">
          {/* morning light through a tall window */}
          <div aria-hidden className="pointer-events-none absolute -top-10 right-0 h-[36rem] w-[60%] skew-x-[-18deg] bg-gradient-to-b from-white/60 to-transparent opacity-60 blur-2xl" />
          <div className="hidden md:block">
            <Traces room="studio" />
          </div>
          <div className="md:hidden">
            <Traces room="studio" mobile />
          </div>
          <ObjectsInRoom
            objects={objects}
            initialOpen={typeof open === "string" ? open : null}
            className="relative flex flex-wrap items-end justify-center gap-x-16 gap-y-20 sm:justify-between"
          />
        </section>
      )}
      <Doorways from="studio" rooms={view.rooms} />
    </>
  );
}

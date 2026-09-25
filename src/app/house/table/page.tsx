import { Doorways } from "@/components/house/Doorways";
import { RoomHeader } from "@/components/house/RoomHeader";
import { ObjectsInRoom } from "@/components/objects/ObjectsInRoom";
import { PeopleAtTable } from "@/components/rooms/PeopleAtTable";
import { objectsIn } from "@/lib/house/compose";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Table" };

export default async function Table({ searchParams }: PageProps<"/house/table">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  const room = view.rooms.find((r) => r.key === "table")!;
  const objects = objectsIn(view, "table");
  const cards = view.table.placeCards;
  const chapters = [...new Set(cards.map((c) => c.chapter.label))];

  if (!objects.length && !cards.length) {
    return (
      <>
        <RoomHeader room={room} />
        <section className="mx-auto max-w-6xl px-5 py-32 text-center sm:px-10 sm:py-44">
          <p className="text-[1.7rem] font-light italic">Nobody has sat down here yet.</p>
          <p className="mt-4 text-lg muted">The first evening you spend at a Chapter will be set out on this table.</p>
        </section>
        <Doorways from="table" rooms={view.rooms} />
      </>
    );
  }

  return (
    <>
      <RoomHeader room={room} />

      {objects.length > 0 && (
        <section aria-label="Left on the table" className="relative mx-auto max-w-6xl px-5 pt-20 sm:px-10 sm:pt-24">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[30rem] max-w-3xl bg-[radial-gradient(closest-side,rgba(243,201,139,0.1),transparent)]" />
          <ObjectsInRoom
            objects={objects}
            initialOpen={typeof open === "string" ? open : null}
            className="relative flex flex-wrap items-start justify-center gap-x-14 gap-y-16 sm:gap-x-20"
          />
        </section>
      )}

      {cards.length > 0 && (
        <section aria-label="The people at your table" className="mx-auto mt-32 max-w-6xl px-5 sm:px-10">
          <div className="mb-14 flex flex-wrap items-baseline justify-between gap-4">
            <p className="caps">At your table</p>
            <p className="text-lg italic muted">{chapters.join(" · ")}</p>
          </div>
          <PeopleAtTable cards={cards} />
          <p className="mx-auto mt-20 max-w-md text-center text-lg italic muted">
            You can ask to find someone again. They will only ever know if they asked too.
          </p>
        </section>
      )}

      <div className="mt-16">
        <Doorways from="table" rooms={view.rooms} />
      </div>
    </>
  );
}

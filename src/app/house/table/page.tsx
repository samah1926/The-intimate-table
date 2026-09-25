import { Doorways } from "@/components/house/Doorways";
import { RoomHeader } from "@/components/house/RoomHeader";
import { ObjectsInRoom } from "@/components/objects/ObjectsInRoom";
import { PeopleAtTable } from "@/components/rooms/PeopleAtTable";
import { Traces } from "@/components/objects/Traces";
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
      <TableTop empty>
        <RoomHeader room={room} />
        <section className="mx-auto max-w-6xl px-5 py-32 text-center sm:px-10 sm:py-44">
          <p className="text-[1.7rem] font-light italic">Nobody has sat down here yet.</p>
          <p className="mt-4 text-lg muted">The first evening you spend at a Chapter will be set out on this table.</p>
        </section>
        <Doorways from="table" rooms={view.rooms} />
      </TableTop>
    );
  }

  return (
    <TableTop>
      <RoomHeader room={room} />

      {objects.length > 0 && (
        <section aria-label="Left on the table" className="relative mx-auto max-w-6xl px-5 pt-20 sm:px-10 sm:pt-24">
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
            <p className="label">At your table</p>
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
    </TableTop>
  );
}

/** The whole room is the table, seen from above, the morning after nobody cleared it. */
function TableTop({ children, empty = false }: { children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="tex-wood absolute inset-0" />
      {/* night: the wood only shows where the candles reach */}
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,12,7,0.55), rgba(20,12,7,0.25) 30%, rgba(20,12,7,0.35) 70%, rgba(20,12,7,0.7))" }} />
      <div aria-hidden className="candle absolute inset-0" style={{ background: "radial-gradient(40% 25% at 50% 20%, rgba(255,180,100,0.10), transparent 70%), radial-gradient(35% 20% at 50% 62%, rgba(255,170,90,0.08), transparent 70%)" }} />
      {!empty && (
        <>
          <div className="hidden md:block">
            <Traces room="table" />
          </div>
          <div className="md:hidden">
            <Traces room="table" mobile />
          </div>
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

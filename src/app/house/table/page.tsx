import { NextRoom, RoomOpening } from "@/components/house/RoomOpening";
import { KeptList } from "@/components/memory/KeptList";
import { PeopleAtTable } from "@/components/rooms/PeopleAtTable";
import { objectsIn } from "@/lib/house/compose";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Table" };

/** How the House cooks, whichever country it is in. */
const THE_TABLE: [string, string][] = [
  ["Breakfast", "Seasonal, local, simple."],
  ["Lunch", "Light and nourishing."],
  ["Dinner", "Generous, beautiful, to share."],
];

export default async function Table({ searchParams }: PageProps<"/house/table">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  const room = view.rooms.find((r) => r.key === "table")!;
  const objects = objectsIn(view, "table");
  const cards = view.table.placeCards;
  const chapters = [...new Set(cards.map((c) => c.chapter.label))];

  // The line the evening is remembered by, once the evening has been lived.
  const overheard = objects
    .filter((o) => o.state === "open")
    .flatMap((o) => o.memory?.blocks ?? [])
    .flatMap((b) => (b.type === "quote" ? [b] : []))
    .at(-1);
  const lived = objects.length > 0 || cards.length > 0;

  return (
    <div>
      <RoomOpening
        room={room}
        aside={chapters.join(" · ") || undefined}
        title={overheard ? <>“{overheard.text}”</> : lived ? room.epigraph : "Nobody has sat down here yet."}
        lede={
          overheard ? (
            <p className="meta text-[0.66rem]">Overheard — {overheard.attribution ?? "at the table"}</p>
          ) : lived ? null : (
            <p>The first evening you spend at a Chapter will be set out here — who was there, what was said, what was served.</p>
          )
        }
        image="/house/photos/chapter-0/table-sunset.webp"
        alt="A long table under the palms at sunset, set with linen, brass and red anthuriums"
        position="50% 65%"
      />

      <section aria-label="The table" className="mx-auto mt-32 max-w-[84rem] px-6 sm:mt-40 sm:px-10 lg:px-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <p className="eyebrow">The table</p>
            <p className="lede mt-6 max-w-xs text-[1.6rem] muted">What we eat matters less than who passes it.</p>
          </div>
          <dl className="grid border-t hairline sm:grid-cols-3">
            {THE_TABLE.map(([meal, line]) => (
              <div key={meal} className="border-b py-8 hairline sm:border-b-0 sm:border-r sm:px-8 sm:first:pl-0 sm:last:border-r-0">
                <dt className="display text-[1.9rem]">{meal}</dt>
                <dd className="mt-3 text-[1.1rem] italic muted">{line}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {cards.length > 0 && (
        <section aria-label="At your table" className="mx-auto mt-32 max-w-[84rem] px-6 sm:mt-40 sm:px-10 lg:px-14">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="eyebrow">At your table</h2>
            <p className="text-[1.05rem] italic muted">You can ask to find someone again. They will only know if they asked too.</p>
          </div>
          <PeopleAtTable cards={cards} />
        </section>
      )}

      {objects.length > 0 && (
        <div className="mx-auto mt-32 max-w-[84rem] px-6 sm:mt-40 sm:px-10 lg:px-14">
          <KeptList objects={objects} initialOpen={typeof open === "string" ? open : null} roomName={room.name} title="Left on the table" />
        </div>
      )}

      <NextRoom from="table" rooms={view.rooms} />
    </div>
  );
}

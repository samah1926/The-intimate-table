import { NextRoom, RoomOpening } from "@/components/house/RoomOpening";
import { Library } from "@/components/rooms/Library";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Library" };

export default async function LibraryRoom({ searchParams }: PageProps<"/house/library">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  const room = view.rooms.find((r) => r.key === "library")!;
  const subjects = [...new Set(view.library.map((k) => k.subject))];
  return (
    <div>
      <RoomOpening
        room={room}
        aside={subjects.join(" · ")}
        title={room.epigraph}
        lede={<p>Notes from the people who cooked, coached and hosted — kept here to be read again, slowly, at home.</p>}
        image="/house/photos/chapter-0/conversations-book.webp"
        alt="Hands taking a burgundy book, The Intimate Table — Conversations at the House, from a shelf"
      />
      <div className="mx-auto mt-32 max-w-[84rem] px-6 sm:mt-40 sm:px-10 lg:px-14">
        {view.library.length > 0 ? (
          <Library items={view.library} initialOpen={typeof open === "string" ? open : null} />
        ) : (
          <p className="lede text-[1.8rem] muted">The shelves are still empty.</p>
        )}
      </div>
      <NextRoom from="library" rooms={view.rooms} />
    </div>
  );
}

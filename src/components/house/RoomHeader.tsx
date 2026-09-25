import type { RoomView } from "@/lib/house/compose";

/** The name of the room, and one line — like a card by the door of a small museum. */
export function RoomHeader({ room, aside }: { room: Pick<RoomView, "name" | "epigraph">; aside?: React.ReactNode }) {
  return (
    <header className="relative mx-auto max-w-6xl px-5 pt-28 sm:px-10 sm:pt-36">
      <p className="label muted">{room.name}</p>
      {room.epigraph && <p className="mt-5 max-w-xl text-[2rem] font-light italic leading-[1.12] sm:text-[2.8rem]">{room.epigraph}</p>}
      {aside && <div className="mt-5 max-w-xl text-lg muted">{aside}</div>}
    </header>
  );
}

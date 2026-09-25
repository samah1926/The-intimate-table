import { Doorways } from "@/components/house/Doorways";
import { RoomHeader } from "@/components/house/RoomHeader";
import { Library } from "@/components/rooms/Library";
import { Photo } from "@/components/photo/Photo";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Library" };

export default async function LibraryRoom({ searchParams }: PageProps<"/house/library">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  const room = view.rooms.find((r) => r.key === "library")!;
  return (
    <div className="[--shelf-h:13rem] sm:[--shelf-h:17rem]">
      <RoomHeader room={room} />
      <Photo
        form="bleed"
        aspect="21 / 8"
        develop
        className="mt-14 sm:mt-16"
        media={{ url: "/house/photos/chapter-0/conversations-book.webp", scene: "linen", alt: "Hands taking a burgundy book, The Intimate Table — Conversations at the House, from a shelf" }}
      />
      <Library items={view.library} initialOpen={typeof open === "string" ? open : null} />
      <div className="mt-24">
        <Doorways from="library" rooms={view.rooms} />
      </div>
    </div>
  );
}

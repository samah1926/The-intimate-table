import { Doorways } from "@/components/house/Doorways";
import { RoomHeader } from "@/components/house/RoomHeader";
import { MemoryStage } from "@/components/objects/MemoryStage";
import { objectsIn } from "@/lib/house/compose";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Memory Room" };

export default async function MemoryRoom({ searchParams }: PageProps<"/house/memory">) {
  const { view } = await getHouse();
  const { open } = await searchParams;
  const room = view.rooms.find((r) => r.key === "memory")!;
  const objects = objectsIn(view, "memory");

  return (
    <>
      <div className="relative z-[3]">
        <RoomHeader room={room} />
      </div>
      <section aria-label="On the table" className="relative mt-6 md:-mt-44 lg:-mt-52">
        <MemoryStage objects={objects} initialOpen={typeof open === "string" ? open : null} />
        {objects.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <p className="max-w-md text-[1.7rem] font-light italic leading-snug">Nothing has been left here yet.</p>
            <p className="mt-4 max-w-sm text-lg muted">It fills slowly, with what you live — and with nothing else.</p>
          </div>
        )}
      </section>
      <div className="mt-16">
        <Doorways from="memory" rooms={view.rooms} />
      </div>
    </>
  );
}

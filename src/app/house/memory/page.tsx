import { Doorways } from "@/components/house/Doorways";
import { RoomHeader } from "@/components/house/RoomHeader";
import { ObjectsInRoom } from "@/components/objects/ObjectsInRoom";
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
      <RoomHeader room={room} />
      {objects.length === 0 ? (
        <Empty />
      ) : (
        <section aria-label="Objects" className="relative mx-auto max-w-6xl px-5 pb-24 pt-20 sm:px-10 sm:pt-28">
          {/* a single lamp from above */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-[40rem] max-w-4xl bg-[radial-gradient(closest-side,rgba(246,231,200,0.07),transparent)]"
          />
          <ObjectsInRoom
            objects={objects}
            initialOpen={typeof open === "string" ? open : null}
            className="grid grid-cols-2 items-start justify-items-center gap-x-6 gap-y-16 sm:gap-y-24 md:grid-cols-3 lg:grid-cols-4"
          />
        </section>
      )}
      <Doorways from="memory" rooms={view.rooms} />
    </>
  );
}

function Empty() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-5 py-32 text-center sm:px-10 sm:py-44">
      <div className="h-px w-40 bg-current opacity-20" />
      <p className="mt-12 max-w-md text-[1.7rem] font-light italic leading-snug">Nothing has been left here yet.</p>
      <p className="mt-5 max-w-sm text-lg muted">It fills slowly, with what you live — and with nothing else.</p>
    </section>
  );
}

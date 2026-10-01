import Link from "next/link";
import type { RoomKey } from "@/lib/domain/types";
import type { RoomView } from "@/lib/house/compose";
import { ROOM_PATH } from "@/lib/house/light";
import { Picture } from "@/components/ui/Picture";

// How every room opens: its name, one idea, one photograph. Nothing else
// above the fold.

interface Props {
  room: RoomView;
  /** A count or a chapter, set small on the right of the rule. */
  aside?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  image: string;
  alt: string;
  position?: string;
  /** Some photographs only hold up at a modest size. */
  narrow?: boolean;
}

export function RoomOpening({ room, aside, title, lede, image, alt, position, narrow }: Props) {
  return (
    <div className="mx-auto max-w-[84rem] px-6 sm:px-10 lg:px-14">
      <div className="mt-16 flex items-baseline justify-between border-b pb-5 hairline sm:mt-24">
        <h1 className="eyebrow">{room.name}</h1>
        {aside && <span className="meta text-[0.66rem] muted">{aside}</span>}
      </div>
      <section className={`mt-12 grid gap-12 lg:items-end lg:gap-20 ${narrow ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]" : "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]"}`}>
        <div className={narrow ? "order-2 lg:order-1 lg:pb-6" : "order-2 lg:pb-6"}>
          <h2 className="lede text-[2.5rem] leading-[1.08] sm:text-[3.4rem]">{title}</h2>
          {lede && <div className="mt-8 max-w-[32rem] text-[1.25rem] leading-[1.6] muted">{lede}</div>}
        </div>
        <div className={narrow ? "order-1 mx-auto w-full max-w-[24rem] lg:order-2" : "order-1"}>
          <Picture src={image} alt={alt} aspect="4 / 5" position={position} priority />
        </div>
      </section>
    </div>
  );
}

const ORDER: RoomKey[] = ["hall", "table", "library", "studio", "memory"];

/** The end of a room: a single way on, and a way back. */
export function NextRoom({ from, rooms }: { from: RoomKey; rooms: RoomView[] }) {
  const open = (k: RoomKey) => rooms.find((r) => r.key === k && r.state === "open");
  const i = ORDER.indexOf(from);
  const next = [...ORDER.slice(i + 1), ...ORDER.slice(1, i)].map(open).find(Boolean);
  return (
    <nav aria-label="Onwards" className="mx-auto mt-32 max-w-[84rem] px-6 sm:mt-40 sm:px-10 lg:px-14">
      <div className="flex flex-col gap-8 border-t pt-10 hairline sm:flex-row sm:items-end sm:justify-between">
        {next && (
          <Link href={ROOM_PATH[next.key]} className="group block">
            <span className="eyebrow muted">Next</span>
            <span className="display mt-4 block text-[2.4rem] sm:text-[3rem]">
              {next.name} <span aria-hidden className="inline-block text-[0.6em] transition-transform duration-500 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        )}
        <Link href="/house" className="eyebrow muted transition-opacity hover:opacity-60">
          Back to the Hall
        </Link>
      </div>
    </nav>
  );
}

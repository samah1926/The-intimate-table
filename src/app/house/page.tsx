import Link from "next/link";
import { Invitation } from "@/components/rooms/Invitation";
import { Picture } from "@/components/ui/Picture";
import type { HouseView, LetterView, RoomView } from "@/lib/house/compose";
import { ROOM_PATH, dateRange, houseDate } from "@/lib/house/light";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Hall" };

/** How each room introduces itself in the Hall. */
const ROOMS: Record<string, { image: string; position?: string; words: string[] }> = {
  table: { image: "/house/photos/chapter-0/table-sunset.webp", position: "50% 70%", words: ["People", "Places", "Conversations"] },
  library: { image: "/house/photos/chapter-0/conversations-book.webp", position: "55% 50%", words: ["Food", "Conversation", "Movement", "Culture"] },
  memory: { image: "/house/photos/chapter-0/calla.webp", position: "50% 40%", words: ["What remains"] },
};

export default async function Hall() {
  const { view } = await getHouse();
  const hall = view.rooms.find((r) => r.key === "hall")!;
  const during = view.hall.moments.find((m) => m.phase === "during");
  const interlude = view.hall.moments.find((m) => m.phase === "interlude" && !m.attended);

  if (during) return <Quiet title="The table is set." line="Put the phone away. The House will keep everything." />;
  if (interlude) return <Quiet title="The House is being rearranged." line="Some of tonight will be here in the morning." />;

  const [letter, ...older] = view.hall.letters;
  const seasonal = view.hall.clues.find((c) => c.kind === "seasonal");
  const clue = view.hall.clues.find((c) => c.kind === "clue");
  const invitation = view.hall.moments.find((m) => m.phase === "prelude");
  const c = view.chapter;

  return (
    <div className="pb-8">
      {/* 1. Where the House is, in time */}
      <section className="mx-auto mt-14 grid max-w-[84rem] gap-10 px-6 sm:mt-20 sm:px-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-20 lg:px-14">
        <div className="order-2 lg:order-1 lg:pb-4">
          {c ? (
            <>
              {c.location_label && <p className="eyebrow muted">{c.location_label}</p>}
              <h1 className="display mt-6 text-[3.2rem] sm:text-[4.6rem]">
                Chapter {c.number}
                {c.title && <> — {c.title}</>}
              </h1>
              {c.subtitle && <p className="lede mt-6 max-w-md text-[1.6rem] muted">{c.subtitle}.</p>}
              <p className="meta mt-8 text-[0.74rem]">{dateRange(c.starts_at, c.ends_at)}</p>
            </>
          ) : (
            <h1 className="lede text-[2.6rem] leading-tight">{hall.epigraph}</h1>
          )}
        </div>
        <div className="order-1 lg:order-2">
          <Picture src="/house/photos/chapter-0/house-arch.webp" alt="The dining room under a lantern, an arch opening onto olive trees and the Atlas" aspect="3 / 2" priority />
        </div>
      </section>

      {/* 2. One letter */}
      {letter && (
        <section aria-label="A letter from the House" className="mx-auto mt-28 max-w-[38rem] px-6 sm:mt-36">
          <div className="flex items-baseline justify-between border-b pb-5 hairline">
            <p className="eyebrow">A letter from the House</p>
            <p className="meta text-[0.64rem] muted">{houseDate(view.now)}</p>
          </div>
          <div className="prose-house mt-10 text-[1.32rem] leading-[1.7]">
            {letter.body.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
          {letter.signature && <p className="lede mt-10 text-[1.4rem]">{letter.signature}</p>}
          <Since view={view} />
          {seasonal && <p className="mt-6 text-[1.05rem] italic muted">{seasonal.body}</p>}
          {older.length > 0 && <Drawer letters={older} />}
        </section>
      )}

      {/* 3. What comes next */}
      {invitation && (
        <div className="mt-28 sm:mt-36">
          <Invitation moment={invitation} />
          {clue && (
            <p className="mx-auto mt-10 max-w-[84rem] px-6 text-[1.1rem] italic muted sm:px-10 lg:px-14">
              {clue.title ?? "Found on the console"}: <span className="not-italic text-ink">{clue.body}</span> {clue.signature && (/^[—–-]/.test(clue.signature) ? clue.signature : `— ${clue.signature}`)}
            </p>
          )}
        </div>
      )}

      {/* 4. The rooms */}
      <Rooms rooms={view.rooms} />
    </div>
  );
}

function Since({ view }: { view: HouseView }) {
  const inMemory = view.hall.recent.filter((r) => r.room === "memory").length;
  if (!inMemory) return null;
  const words = ["", "One thing", "Two things", "Three things", "Four things", "Five things", "Six things", "Seven things", "Eight things", "Nine things", "Ten things"];
  return (
    <Link href="/house/memory" className="group mt-12 flex items-center justify-between border-y py-5 hairline">
      <span className="text-[1.15rem]">
        {words[inMemory] ?? `${inMemory} things`} {inMemory === 1 ? "was" : "were"} left in the Memory Room since you were last here.
      </span>
      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

function Rooms({ rooms }: { rooms: RoomView[] }) {
  const open = (k: string) => rooms.find((r) => r.key === k && r.state === "open");
  const main = ["table", "library", "memory"].map(open).filter((r): r is RoomView => !!r);
  const studio = open("studio");
  const door = open("door");
  return (
    <section aria-label="The rooms" className="mx-auto mt-32 max-w-[84rem] px-6 sm:mt-40 sm:px-10 lg:px-14">
      <div className="flex items-baseline justify-between border-b pb-5 hairline">
        <h2 className="eyebrow">The House</h2>
        <span className="meta text-[0.64rem] muted">Rooms</span>
      </div>
      <ul className="scroll-quiet -mx-6 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-8 sm:overflow-visible sm:px-0">
        {main.map((r) => {
          const meta = ROOMS[r.key];
          return (
            <li key={r.key} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <Link href={ROOM_PATH[r.key]} className="group block">
                <Picture src={meta.image} alt="" aspect="3 / 4" position={meta.position} hover />
                <div className="mt-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="display text-[2rem]">{r.name}</h3>
                    <div className="my-4 h-px w-8 bg-ink/40" />
                    <p className="meta text-[0.64rem] leading-[1.9] muted">
                      {meta.words.map((w) => (
                        <span key={w} className="block">
                          {w}
                        </span>
                      ))}
                    </p>
                  </div>
                  <span aria-hidden className="pt-3 transition-transform duration-500 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      {(studio || door) && (
        <div className="mt-16 flex flex-col gap-4 border-t pt-8 hairline sm:flex-row sm:items-baseline sm:justify-between">
          {studio && (
            <Link href={ROOM_PATH.studio} className="group text-[1.2rem]">
              <span className="eyebrow mr-4 muted">Also</span>
              <span className="link-quiet">The Studio — movement, mornings, recovery</span> <span aria-hidden>→</span>
            </Link>
          )}
          {door && (
            <Link href={ROOM_PATH.door} className="text-[1.1rem] italic muted transition-opacity hover:opacity-70">
              A door that wasn’t there before →
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

function Quiet({ title, line }: { title: string; line: string }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-8 text-center">
      <p className="eyebrow muted">The House</p>
      <h1 className="display mt-8 text-[3rem] sm:text-[4.2rem]">{title}</h1>
      <p className="lede mt-6 max-w-md text-[1.5rem] muted">{line}</p>
    </div>
  );
}

function Drawer({ letters }: { letters: LetterView[] }) {
  return (
    <details className="group mt-10">
      <summary className="eyebrow cursor-pointer list-none muted transition-opacity hover:opacity-70 [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">{letters.length === 1 ? "An earlier letter" : `${letters.length} earlier letters`}</span>
        <span className="hidden group-open:inline">Close</span>
      </summary>
      <div className="mt-8 space-y-10">
        {letters.map((l) => (
          <div key={l.id} className="prose-house border-t pt-8 text-[1.2rem] leading-[1.7] muted hairline">
            {l.body.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
            {l.signature && <p className="lede mt-6">{l.signature}</p>}
          </div>
        ))}
      </div>
    </details>
  );
}

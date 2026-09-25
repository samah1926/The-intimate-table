import Link from "next/link";
import { Doorway } from "@/components/house/Doorways";
import { Letter } from "@/components/paper/Letter";
import { ChapterEnvelope } from "@/components/rooms/ChapterEnvelope";
import { Console } from "@/components/rooms/Console";
import { Photo } from "@/components/photo/Photo";
import type { HouseView, LetterView } from "@/lib/house/compose";
import { ROOM_PATH, houseDate, timeOfDay } from "@/lib/house/light";
import { getHouse } from "@/lib/house/session";

export const metadata = { title: "The Hall" };

const ROOM_IN: Record<string, string> = {
  memory: "in the Memory Room",
  studio: "in the Studio",
  table: "on the Table",
  library: "on a shelf in the Library",
  door: "behind a door",
};

export default async function Hall() {
  const { view } = await getHouse();
  const hall = view.rooms.find((r) => r.key === "hall")!;
  const now = new Date(view.now);
  const during = view.hall.moments.find((m) => m.phase === "during");
  const interlude = view.hall.moments.find((m) => m.phase === "interlude" && m.attended === false);

  // While a Chapter is happening, the House goes quiet.
  if (during) return <Quiet title="The table is set." lines={["Put the phone away.", "The House will keep everything."]} footnote="If a card at your place asks you to look, look." />;
  if (interlude)
    return <Quiet title="The House is being rearranged." lines={["Some of tonight will be here in the morning."]} footnote="Sleep. Nothing needs to be done." />;

  const [letter, ...olderLetters] = view.hall.letters;
  const seasonal = view.hall.clues.filter((c) => c.kind === "seasonal");
  const clues = view.hall.clues.filter((c) => c.kind !== "seasonal");
  const invitations = view.hall.moments.filter((m) => m.phase === "prelude");
  const door = view.rooms.find((r) => r.key === "door" && r.state === "open");
  // A Polaroid from the last Chapter, tucked into the corner of the letter.
  const tucked = view.objects.find((o) => o.kind === "photograph" && o.state === "open")?.memory?.blocks.flatMap((b) => (b.type === "photos" ? b.photos : []))[0] ?? null;
  const doors = view.rooms.filter((r) => r.state === "open" && r.key !== "hall" && r.key !== "door");

  return (
    <div className="pb-24">
      <header className="mx-auto max-w-6xl px-5 pt-28 sm:px-10 sm:pt-36">
        <p className="label muted">
          {houseDate(now)}, {timeOfDay(now)}
        </p>
        <h1 className="mt-6 max-w-2xl text-[2.3rem] font-light italic leading-[1.08] sm:text-[3.4rem]">{hall.epigraph}</h1>
        {seasonal.map((s) => (
          <p key={s.id} className="mt-5 max-w-lg text-lg muted">
            {s.body}
          </p>
        ))}
      </header>

      {/* The letter, and the console by the door */}
      <section className="mx-auto mt-16 grid max-w-6xl gap-16 px-5 sm:mt-20 sm:px-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <div className="relative">
          {letter && <Letter letter={letter} />}
          {tucked && (
            <Link
              href="/house/memory?open=a-photograph"
              aria-label="A photograph, tucked into the corner of the letter"
              className="on-surface absolute -right-2 -top-8 w-28 rotate-[8deg] transition-transform duration-700 hover:rotate-[4deg] sm:-right-10 sm:w-36"
            >
              <Photo form="polaroid" media={tucked} note="the table" />
            </Link>
          )}
          {olderLetters.length > 0 && <Drawer letters={olderLetters} />}
        </div>

        <aside aria-label="On the console" className="lg:pt-10">
          <Console>
            <div className="space-y-16">
              {invitations.map((m) => (
                <div key={m.chapter.id}>
                  <p className="label mb-6 muted">Left for you</p>
                  <ChapterEnvelope moment={m} firstName={view.viewer.first_name} />
                </div>
              ))}
              {clues.map((c) => (
                <Clue key={c.id} clue={c} />
              ))}
            </div>
          </Console>
        </aside>
      </section>

      <Recent view={view} />

      {/* Doors */}
      <section aria-label="Rooms" className="mx-auto mt-28 max-w-6xl px-5 sm:px-10">
        <p className="label muted">Doors</p>
        <ul className="mt-10 grid grid-cols-2 gap-y-14 sm:flex sm:flex-wrap sm:items-end sm:gap-x-16">
          {doors.map((r) => (
            <li key={r.key} className="flex justify-center sm:block">
              <Doorway room={r} size="lg" />
            </li>
          ))}
          {door && (
            <li className="col-span-2 flex flex-col items-center sm:ml-auto sm:block">
              <Doorway room={door} size="lg" />
              <p className="mt-3 max-w-[10rem] text-center text-[0.95rem] italic leading-snug muted">A door that wasn’t there before.</p>
            </li>
          )}
        </ul>
      </section>

      <Contents view={view} />
    </div>
  );
}

function Quiet({ title, lines, footnote }: { title: string; lines: string[]; footnote: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
      <div className="mb-12 h-10 w-px bg-current opacity-30" />
      <h1 className="text-[2.6rem] font-light italic leading-tight sm:text-[3.6rem]">{title}</h1>
      <div className="mt-8 space-y-1 text-xl muted">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <p className="type mt-16 max-w-xs text-[0.78rem] muted">{footnote}</p>
    </div>
  );
}

function Drawer({ letters }: { letters: LetterView[] }) {
  return (
    <details className="group mx-auto mt-10 max-w-[34rem]">
      <summary className="label cursor-pointer list-none text-center muted transition-opacity hover:opacity-100 [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">
          {letters.length === 1 ? "An older letter" : `${letters.length} older letters`} in the drawer
        </span>
        <span className="hidden group-open:inline">Close the drawer</span>
      </summary>
      <div className="mt-10 space-y-10">
        {letters.map((l) => (
          <Letter key={l.id} letter={l} delay={0} />
        ))}
      </div>
    </details>
  );
}

function Clue({ clue }: { clue: LetterView }) {
  return (
    <div>
      <p className="label mb-6 muted">{clue.title ?? "Found on the console"}</p>
      <div className="paper relative mx-auto w-full max-w-[18rem] rotate-[1.5deg] px-7 py-8">
        <p className="type text-[1.35rem] tracking-wide">{clue.body}</p>
        {clue.signature && <p className="mt-4 text-[1rem] italic text-ink-soft">{clue.signature}</p>}
      </div>
    </div>
  );
}

function Recent({ view }: { view: HouseView }) {
  if (!view.hall.recent.length) return null;
  const byRoom = new Map<string, { title: string; slug: string }[]>();
  for (const r of view.hall.recent) byRoom.set(r.room, [...(byRoom.get(r.room) ?? []), r]);
  return (
    <section aria-label="Since you were last here" className="mx-auto mt-28 max-w-6xl px-5 sm:px-10">
      <p className="label muted">Since you were last here</p>
      <div className="mt-8 max-w-3xl space-y-5 text-[1.45rem] font-light leading-snug sm:text-[1.7rem]">
        {[...byRoom.entries()].map(([room, items]) => (
          <p key={room}>
            Something was left {ROOM_IN[room] ?? "in the house"}:{" "}
            {items.map((it, i) => (
              <span key={it.slug}>
                <Link href={`${ROOM_PATH[room as keyof typeof ROOM_PATH]}?open=${it.slug}`} className="link-quiet italic">
                  {it.title.toLowerCase().replace(/^the /, "the ")}
                </Link>
                {i < items.length - 2 ? ", " : i === items.length - 2 ? " and " : "."}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}

function Contents({ view }: { view: HouseView }) {
  if (!view.hall.contents.length) return null;
  return (
    <section aria-label="Chapters" className="mx-auto mt-28 max-w-6xl px-5 sm:px-10">
      <p className="label muted">Contents</p>
      <ol className="mt-8 max-w-md">
        {view.hall.contents.map((c) => (
          <li key={c.number} className="rule flex items-baseline gap-6 border-b py-3.5">
            <span className="w-8 text-[1.05rem] tabular-nums muted">{c.number}</span>
            <span className={`flex-1 text-[1.35rem] ${c.title ? "italic" : "muted"}`}>{c.title ?? "—"}</span>
            {c.lived && <span className="label muted">lived</span>}
            {c.current && !c.lived && <span className="label muted">soon</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

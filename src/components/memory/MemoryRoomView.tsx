"use client";

import { AnimatePresence } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { dateTime, shortDate } from "@/lib/house/light";
import { Picture } from "@/components/ui/Picture";
import { MemoryEntry, coverOf, excerptOf } from "./MemoryEntry";
import { useHeld } from "./useHeld";

// The Memory Room: one memory brought forward, everything else kept in an
// index below. Fewer things, better chosen.

export function MemoryRoomView({ objects, initialOpen, place }: { objects: ObjectView[]; initialOpen?: string | null; place?: string | null }) {
  const { held, pickUp, putBack } = useHeld(objects, initialOpen);
  const open = objects.filter((o) => o.state === "open");
  const featured = open.find((o) => o.kind === "photograph") ?? open.find((o) => coverOf(o)) ?? open[0] ?? null;
  const others = objects.filter((o) => o !== featured);

  return (
    <>
      <div className="mx-auto max-w-[84rem] px-6 sm:px-10 lg:px-14">
        <div className="mt-16 flex items-baseline justify-between border-b pb-5 hairline sm:mt-24">
          <h1 className="eyebrow">The Memory Room</h1>
          <span className="meta text-[0.7rem] muted">( {objects.length} )</span>
        </div>

        {objects.length === 0 && <Empty />}

        {featured && <Featured object={featured} onOpen={() => pickUp(featured)} place={place} />}

        {others.length > 0 && (
          <section aria-label="Everything kept" className="mt-32">
            <div className="flex items-baseline justify-between border-b pb-5 hairline">
              <h2 className="eyebrow">Everything kept</h2>
              <span className="meta text-[0.66rem] muted">Some things open later</span>
            </div>
            <ul className="grid gap-x-16 sm:grid-cols-2">
              {others.map((o) => (
                <li key={o.id} className="border-b hairline">
                  <IndexRow object={o} onOpen={() => pickUp(o)} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <AnimatePresence>{held && <MemoryEntry key={held.id} object={held} onClose={putBack} />}</AnimatePresence>
    </>
  );
}

function Featured({ object, onOpen, place }: { object: ObjectView; onOpen: () => void; place?: string | null }) {
  const cover = coverOf(object);
  const photos = object.memory?.blocks.flatMap((b) => (b.type === "photos" ? b.photos : [])).slice(1, 4) ?? [];
  return (
    <section aria-label="A memory" className="mt-10">
      {cover && (
        <button type="button" onClick={onOpen} className="block w-full" aria-label={`Open: ${object.memory?.title ?? object.title}`}>
          <Picture src={cover} position="50% 62%" priority hover className="aspect-[4/5] sm:aspect-[16/9]" />
        </button>
      )}

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
        <div>
          <p className="lede text-[2.6rem] leading-[1.08] sm:text-[3.6rem]">
            Everything you lived
            <br />
            left something behind.
          </p>
          <h2 className="display mt-14 text-[2.2rem] sm:text-[2.8rem]">{object.memory?.title ?? object.title}</h2>
          {object.memory?.occurred_at && <p className="meta mt-4 text-[0.72rem]">{dateTime(object.memory.occurred_at)}</p>}
          {excerptOf(object) && <p className="mt-8 max-w-[34rem] text-[1.3rem] leading-[1.6]">{excerptOf(object)}</p>}
        </div>
        <div className="lg:pt-6">
          <div className="h-px w-10 bg-ink/40" />
          <p className="meta mt-5 text-[0.66rem] leading-[1.9] muted">
            A memory
            <br />
            from {place ?? "the House"}
          </p>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="mt-12 grid grid-cols-3 gap-3 sm:gap-5 lg:w-[64%]">
          {photos.map((p) => (
            <Picture key={p.id} src={p} aspect="1 / 1" />
          ))}
        </div>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
        <button type="button" onClick={onOpen} className="btn-primary">
          Open this memory <span aria-hidden>→</span>
        </button>
      </div>
    </section>
  );
}

function IndexRow({ object, onOpen }: { object: ObjectView; onOpen: () => void }) {
  const sealed = object.state === "sealed";
  const cover = coverOf(object);
  const when = object.memory?.occurred_at ? shortDate(object.memory.occurred_at) : null;
  return (
    <button type="button" onClick={onOpen} className="group flex w-full items-center gap-6 py-7 text-left">
      <div className="w-24 shrink-0 sm:w-28">
        {cover || sealed ? (
          <Picture src={cover ?? { url: null, alt: "" }} aspect="4 / 5" veiled={sealed} hover={!sealed} className={sealed && !cover ? "bg-paper" : ""} />
        ) : (
          <div className="aspect-[4/5] bg-paper" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="meta text-[0.64rem] muted">{sealed ? "Kept for later" : when ?? (object.chapter?.label ?? "")}</p>
        <p className={`display mt-2 text-[1.65rem] ${sealed ? "muted" : ""}`}>{object.title}</p>
        <p className="mt-1 line-clamp-2 text-[1.02rem] italic muted">{sealed ? object.sealed_hint : object.caption}</p>
        {object.isNew && !sealed && <p className="meta mt-3 text-[0.6rem] text-oxblood">Left recently</p>}
      </div>
      <span aria-hidden className="text-[1.1rem] muted transition-transform duration-500 group-hover:translate-x-1">
        →
      </span>
    </button>
  );
}

function Empty() {
  return (
    <div className="grid gap-12 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-20">
      <Picture src="/house/photos/chapter-0/calla.webp" alt="" aspect="4 / 5" className="max-w-md" />
      <div>
        <p className="lede text-[2.4rem] leading-tight">Nothing has been left here yet.</p>
        <p className="mt-6 max-w-sm text-[1.2rem] muted">It fills slowly, with what you live — and with nothing else.</p>
      </div>
    </div>
  );
}

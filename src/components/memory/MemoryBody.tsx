import type { BlockView } from "@/lib/house/compose";
import { shortDate } from "@/lib/house/light";
import { Picture } from "@/components/ui/Picture";

// What a memory holds, typeset like a printed programme: generous measure,
// quiet labels, the photograph given room. One case per block type.

export function MemoryBody({ blocks }: { blocks: BlockView[] }) {
  return (
    <div className="space-y-16">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}

function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`prose-house ${className}`}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

function Block({ block: b }: { block: BlockView }) {
  switch (b.type) {
    case "note":
      return <Paragraphs text={b.text} className="text-[1.28rem] leading-[1.65]" />;

    case "quote":
      return (
        <figure className="border-y py-12 text-center hairline">
          <blockquote className="lede mx-auto max-w-xl text-[1.9rem] sm:text-[2.3rem]">“{b.text}”</blockquote>
          {b.attribution && <figcaption className="meta mt-6 text-[0.66rem] muted">{b.attribution}</figcaption>}
        </figure>
      );

    case "photos":
      return (
        <div className={`grid gap-4 sm:gap-6 ${b.photos.length === 1 ? "" : "grid-cols-2"}`}>
          {b.photos.map((m, i) => (
            <figure key={m.id} className={b.photos.length === 3 && i === 0 ? "col-span-2" : ""}>
              <Picture src={m} aspect={b.photos.length === 3 && i === 0 ? "16 / 10" : "4 / 5"} />
              {m.caption && <figcaption className="mt-3 text-[0.98rem] italic muted">{m.caption}</figcaption>}
            </figure>
          ))}
        </div>
      );

    case "learned":
      return (
        <div className="border-l-2 border-oxblood pl-7">
          <p className="eyebrow muted">What stayed</p>
          <p className="lede mt-4 text-[1.45rem]">{b.text}</p>
        </div>
      );

    case "people":
      return (
        <div>
          <p className="eyebrow muted">At the table</p>
          <p className="mt-5 text-[1.35rem] leading-relaxed">
            {b.people.map((p, i) => (
              <span key={p.name}>
                {p.name}
                {p.role && <span className="italic muted"> ({p.role})</span>}
                {i < b.people.length - 1 && <span className="mx-3 muted">·</span>}
              </span>
            ))}
          </p>
        </div>
      );

    case "music": {
      const label = b.side && b.side.length <= 2 ? `Side ${b.side}` : (b.side ?? "What was playing");
      return (
        <div>
          <p className="eyebrow muted">{label}</p>
          <ol className="mt-5 border-t hairline">
            {b.tracks.map((t, i) => (
              <li key={i} className="flex items-baseline gap-6 border-b py-3.5 hairline">
                <span className="meta w-6 text-[0.66rem] muted">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-[1.2rem]">{t.title}</span>
                <span className="text-[1.05rem] italic muted">{t.artist}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    }

    case "recipe":
      return (
        <div className="bg-paper px-8 py-10 sm:px-12">
          <p className="eyebrow muted">A recipe{b.serves ? ` · ${b.serves}` : ""}</p>
          <h3 className="display mt-4 text-[2.1rem]">{b.title}</h3>
          <div className="mt-8 grid gap-10 sm:grid-cols-[2fr_3fr]">
            <ul className="space-y-2 text-[1.08rem]">
              {b.ingredients.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <ol className="space-y-4 text-[1.12rem] leading-relaxed">
              {b.steps.map((s, i) => (
                <li key={i} className="flex gap-5">
                  <span className="meta pt-1 text-[0.66rem] muted">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      );

    case "schedule":
      return (
        <div>
          <p className="eyebrow">{b.title ?? "Programme"}</p>
          <div className="mt-6 border-t hairline">
            {b.days.map((d) => (
              <div key={d.day} className="grid gap-3 border-b py-6 hairline sm:grid-cols-[10rem_1fr]">
                <p className="meta pt-1 text-[0.68rem]">{d.day}</p>
                <ul className="space-y-1.5">
                  {d.items.map(([time, what]) => (
                    <li key={time + what} className="flex gap-6 text-[1.12rem]">
                      <span className="meta w-12 pt-[0.3rem] text-[0.66rem] muted">{time}</span>
                      <span>{what}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "route":
      return (
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-y py-6 hairline">
          <p className="eyebrow muted">The route</p>
          <p className="lede flex-1 text-[1.3rem] sm:text-right">{b.label}</p>
          {b.distance && <p className="meta w-full text-[0.66rem] muted sm:w-auto">{b.distance}</p>}
        </div>
      );

    case "audio":
      return (
        <div>
          <p className="eyebrow muted">A recording</p>
          {b.media?.url ? <audio controls preload="none" src={b.media.url} className="mt-4 w-full" /> : <p className="mt-3 italic muted">Not yet transferred.</p>}
        </div>
      );

    case "journal":
      return (
        <div className="bg-paper px-8 py-10 sm:px-12">
          <p className="eyebrow muted">You were asked</p>
          <p className="lede mt-4 text-[1.6rem]">{b.prompt}</p>
          <div className="my-8 h-px w-12 bg-ink/25" />
          {b.body ? (
            <>
              <p className="eyebrow muted">You wrote{b.written_at ? `, ${shortDate(b.written_at)}` : ""}</p>
              <Paragraphs text={b.body} className="mt-4 text-[1.25rem] leading-relaxed" />
            </>
          ) : (
            <p className="italic muted">You didn’t write anything. That is an answer too.</p>
          )}
        </div>
      );
  }
}

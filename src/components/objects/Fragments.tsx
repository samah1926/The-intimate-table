"use client";

import { motion } from "framer-motion";
import type { BlockView } from "@/lib/house/compose";
import { shortDate } from "@/lib/house/light";
import { Photo, cameraDate } from "@/components/photo/Photo";

// What an object holds, laid out on the table as more things: prints, a slip
// of paper, a torn strip, an index card, the label of a tape. Never a list of
// fields. Adding a block type = one case here.

const TILT = [-2.2, 1.6, -1, 2.4, -1.8, 0.8, -2.6, 1.2];

export function Fragments({ blocks, skipFirstPhoto, occurredAt }: { blocks: BlockView[]; skipFirstPhoto?: boolean; occurredAt?: string | null }) {
  // A little order: photographs, a song, a sentence, a private note — then the rest.
  const rank = (b: BlockView) =>
    ({ photos: 0, music: 1, quote: 2, journal: 3, note: 4, learned: 5, route: 6, recipe: 7, people: 8, audio: 9 })[b.type] ?? 10;
  const ordered = [...blocks].sort((a, b) => rank(a) - rank(b));

  return (
    <div className="columns-1 gap-10 md:columns-2 [&>*]:mb-12 [&>*]:break-inside-avoid">
      {ordered.map((b, i) => {
        const content = fragment(b, { skipFirstPhoto, occurredAt, i });
        if (!content) return null;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -18, rotate: TILT[i % TILT.length] * 2.2, scale: 1.04 }}
            animate={{ opacity: 1, y: 0, rotate: TILT[i % TILT.length], scale: 1 }}
            transition={{ delay: 0.15 + i * 0.16, duration: 1.1, ease: [0.22, 0.61, 0.24, 1] }}
          >
            {content}
          </motion.div>
        );
      })}
    </div>
  );
}

function fragment(b: BlockView, ctx: { skipFirstPhoto?: boolean; occurredAt?: string | null; i: number }) {
  switch (b.type) {
    case "photos": {
      const photos = ctx.skipFirstPhoto ? b.photos.slice(1) : b.photos;
      if (!photos.length) return null;
      return (
        <div className="relative space-y-[-8%] pb-4">
          {photos.map((m, j) => (
            <div
              key={m.id}
              className="on-surface relative"
              style={{ width: j % 2 ? "82%" : "90%", marginLeft: j % 2 ? "16%" : "0", transform: `rotate(${TILT[(j + 3) % TILT.length] * 1.4}deg)`, zIndex: j }}
            >
              <Photo media={m} form="print" develop stamp={j === 0 ? cameraDate(ctx.occurredAt ?? null) : null} sizes="(min-width: 768px) 32vw, 90vw" />
            </div>
          ))}
        </div>
      );
    }
    case "note":
      return (
        <div className="paper px-7 py-7 sm:px-9">
          {b.text.split(/\n{2,}/).map((p, j) => (
            <p key={j} className="whitespace-pre-line text-[1.18rem] leading-[1.6] text-ink [&+&]:mt-4">
              {p}
            </p>
          ))}
        </div>
      );
    case "quote":
      return (
        <figure
          className="paper px-8 py-9"
          style={{ clipPath: "polygon(0 4%, 6% 0, 14% 3%, 25% 0, 37% 4%, 50% 1%, 63% 4%, 75% 0, 88% 3%, 100% 1%, 100% 96%, 91% 100%, 79% 97%, 66% 100%, 52% 96%, 39% 100%, 27% 97%, 13% 100%, 0 97%)" }}
        >
          <blockquote className="type text-[1rem] leading-[1.8] text-ink">“{b.text}”</blockquote>
          {b.attribution && <figcaption className="hand mt-4 text-[1.5rem] leading-none text-ink-soft">{b.attribution}</figcaption>}
        </figure>
      );
    case "learned":
      return (
        <div className="relative bg-[repeating-linear-gradient(to_bottom,#f7f4ec_0,#f7f4ec_1.7rem,#b8c8d4_1.7rem,#b8c8d4_calc(1.7rem+1px))] px-7 pb-6 pt-9 text-ink shadow-[0_14px_30px_-16px_rgba(30,20,10,0.6)]">
          <span aria-hidden className="absolute inset-x-0 top-7 h-px bg-[#c9867a]" />
          <p className="label -mt-5 mb-3 text-ink-faint">What stayed</p>
          <p className="text-[1.15rem] italic leading-[1.7rem]">{b.text}</p>
        </div>
      );
    case "music": {
      const [first, ...rest] = b.tracks;
      if (!first) return null;
      return (
        <div className="relative flex items-center gap-5 bg-[#ece6da] px-6 py-5 text-ink shadow-[0_12px_26px_-14px_rgba(30,20,10,0.6)]">
          <div className="spin-slow relative h-16 w-16 shrink-0 rounded-full" style={{ background: "repeating-radial-gradient(circle, #151210 0 1px, #262019 1px 2px)" }}>
            <span className="absolute inset-[34%] rounded-full bg-[#a9623f]" />
          </div>
          <div className="min-w-0">
            <p className="hand text-[1.6rem] leading-none">{b.side && b.side.length <= 2 ? `Side ${b.side}` : (b.side ?? "Playing")}</p>
            <p className="type mt-2 text-[0.88rem] leading-snug">
              {first.title} <span className="text-ink-faint">— {first.artist}</span>
            </p>
            {rest.length > 0 && <p className="mt-1 text-sm italic text-ink-faint">and {rest.length} more, in the order they were played</p>}
          </div>
        </div>
      );
    }
    case "recipe":
      return (
        <div className="tex-paper px-7 py-7 text-ink shadow-[0_14px_30px_-16px_rgba(30,20,10,0.6)]" style={{ backgroundColor: "#faf7f0" }}>
          <p className="label text-ink-faint">A recipe{b.serves ? ` · ${b.serves}` : ""}</p>
          <h4 className="mt-2 text-2xl italic">{b.title}</h4>
          <ul className="type mt-4 space-y-1 text-[0.82rem] text-ink-soft">
            {b.ingredients.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
          <ol className="mt-5 space-y-2.5 text-[1.05rem] leading-relaxed">
            {b.steps.map((s, j) => (
              <li key={j} className="flex gap-3">
                <span className="label pt-1 text-ink-faint">{j + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "route": {
      const W = 320;
      const H = 200;
      const d = b.points.map(([x, y], i) => `${i ? "L" : "M"}${(x * W).toFixed(1)} ${(y * H).toFixed(1)}`).join(" ");
      return (
        <figure className="tex-paper relative px-5 pb-5 pt-5 text-ink shadow-[0_14px_30px_-16px_rgba(30,20,10,0.6)]" style={{ backgroundColor: "#efe8d8" }}>
          {/* folded in four */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_49.6%,rgba(60,40,20,0.14)_50%,transparent_50.4%),linear-gradient(0deg,transparent_49.4%,rgba(60,40,20,0.1)_50%,transparent_50.6%)]" />
          <svg viewBox={`-10 -10 ${W + 20} ${H + 20}`} className="w-full" role="img" aria-label={b.label}>
            <path d="M-10 40 C60 20 120 70 200 40 S 300 60 340 30 M-10 120 C80 100 140 150 220 120 S 300 140 340 110" fill="none" stroke="#8a7f71" strokeWidth=".4" opacity=".6" />
            <motion.path
              d={d}
              fill="none"
              stroke="#a9623f"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.6, duration: 3.4, ease: [0.45, 0, 0.3, 1] }}
            />
            <circle cx={b.points[0][0] * W} cy={b.points[0][1] * H} r="3.5" fill="#231d17" />
          </svg>
          <figcaption className="mt-2 flex items-baseline justify-between gap-3">
            <span className="text-[1.02rem] italic">{b.label}</span>
            {b.distance && <span className="type shrink-0 text-[0.75rem] text-ink-soft">{b.distance}</span>}
          </figcaption>
        </figure>
      );
    }
    case "people":
      return (
        <div className="flex flex-wrap gap-3">
          {b.people.map((p) => (
            <div key={p.name} className="flex h-20 min-w-24 flex-col items-center justify-center bg-[#f8f7f3] px-4 text-ink shadow-[0_10px_20px_-12px_rgba(0,0,0,0.6)]">
              <span className="caps text-[0.66rem]">{p.name}</span>
              {p.role && <span className="mt-1 text-sm italic text-ink-faint">{p.role}</span>}
            </div>
          ))}
        </div>
      );
    case "journal":
      return (
        <div className="paper px-7 py-8 sm:px-10">
          <p className="text-[1.25rem] italic leading-snug text-ink">{b.prompt}</p>
          <div className="mx-0 my-6 h-px w-10 bg-ink/25" />
          {b.body ? (
            <>
              {b.body.split(/\n{2,}/).map((p, j) => (
                <p key={j} className="type text-[0.93rem] leading-[1.9] text-ink [&+&]:mt-4">
                  {p}
                </p>
              ))}
              {b.written_at && <p className="hand mt-6 text-right text-[1.5rem] leading-none text-ink-soft">{shortDate(b.written_at)}</p>}
            </>
          ) : (
            <p className="type text-[0.9rem] text-ink-soft">You didn’t write anything. That is an answer too.</p>
          )}
        </div>
      );
    case "audio":
      return (
        <div className="bg-[#ece6da] px-6 py-5 text-ink shadow-[0_12px_26px_-14px_rgba(30,20,10,0.6)]">
          <p className="hand text-[1.5rem] leading-none">A recording</p>
          {b.media?.url ? <audio controls preload="none" src={b.media.url} className="mt-3 w-full" /> : <p className="type mt-2 text-[0.85rem] text-ink-soft">Not yet transferred from the tape.</p>}
        </div>
      );
  }
}

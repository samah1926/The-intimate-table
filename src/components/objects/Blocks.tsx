"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { BlockView, MediaView } from "@/lib/house/compose";
import { shortDate } from "@/lib/house/light";
import { Scene } from "./Scene";

// Renderers for the contents of a memory. Each block type is one component.
// Adding a new block type: add it to MemoryBlock (types.ts) and a case here.

export function Blocks({ blocks }: { blocks: BlockView[] }) {
  return (
    <div className="space-y-12">
      {blocks.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 + i * 0.12, duration: 0.9, ease: [0.22, 0.61, 0.24, 1] }}
        >
          <Block block={b} />
        </motion.div>
      ))}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="caps mb-4 text-ink-faint">{children}</p>;
}

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(/\n{2,}/).map((p, i) => (
        <p key={i} className="whitespace-pre-line [&+&]:mt-4">
          {p}
        </p>
      ))}
    </div>
  );
}

function Block({ block }: { block: BlockView }) {
  switch (block.type) {
    case "note":
      return <Paragraphs text={block.text} className="text-[1.2rem] leading-[1.65] text-ink sm:text-[1.28rem]" />;

    case "quote":
      return (
        <figure className="border-l border-ink/20 pl-6">
          <blockquote className="text-[1.5rem] italic leading-snug text-ink sm:text-[1.7rem]">“{block.text}”</blockquote>
          {block.attribution && <figcaption className="caps mt-4 text-ink-faint">— {block.attribution}</figcaption>}
        </figure>
      );

    case "learned":
      return (
        <div className="bg-[#ece5d8] px-6 py-6 sm:px-8">
          <Label>What stayed</Label>
          <p className="text-[1.15rem] leading-relaxed text-ink">{block.text}</p>
        </div>
      );

    case "people":
      return (
        <div>
          <Label>At the table</Label>
          <p className="caps flex flex-wrap gap-x-5 gap-y-2 text-[0.78rem] text-ink">
            {block.people.map((p) => (
              <span key={p.name}>
                {p.name}
                {p.role && <span className="ml-2 normal-case tracking-normal italic text-ink-faint">{p.role}</span>}
              </span>
            ))}
          </p>
        </div>
      );

    case "photos":
      return (
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {block.photos.map((m, i) => (
            <DevelopingPhoto key={m.id} media={m} wide={block.photos.length % 2 === 1 && i === 0} />
          ))}
        </div>
      );

    case "music":
      return (
        <div className="bg-[#efebe3] px-6 py-6 ring-1 ring-[#bdb5a7] sm:px-8">
          <Label>{block.side ? (block.side.length <= 2 ? `Side ${block.side}` : block.side) : "Music"}</Label>
          <ol className="type mt-2 space-y-2 text-[0.86rem] text-ink">
            {block.tracks.map((t, i) => (
              <li key={i} className="flex gap-4">
                <span className="text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  {t.title} <span className="text-ink-faint">— {t.artist}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "recipe":
      return (
        <div className="bg-[#f9f7f2] px-6 py-7 shadow-[0_1px_0_#d9d0c0,0_10px_30px_-18px_#1c1a17] sm:px-9">
          <Label>A recipe{block.serves ? ` · ${block.serves}` : ""}</Label>
          <h3 className="text-2xl italic text-ink">{block.title}</h3>
          <ul className="type mt-5 space-y-1.5 text-[0.84rem] text-ink-soft">
            {block.ingredients.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
          <ol className="mt-6 space-y-3 text-[1.08rem] leading-relaxed text-ink">
            {block.steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="caps pt-1.5 text-ink-faint">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "route":
      return <Route block={block} />;

    case "audio":
      return (
        <div>
          <Label>A recording</Label>
          {block.media?.url ? (
            <audio controls preload="none" src={block.media.url} className="w-full" />
          ) : (
            <p className="italic text-ink-soft">Not yet transferred from the tape.</p>
          )}
          {block.caption && <p className="type mt-2 text-sm text-ink-faint">{block.caption}</p>}
        </div>
      );

    case "journal":
      return (
        <div className="relative bg-[#f6f2e9] px-6 py-8 shadow-[0_1px_0_#d9d0c0,0_14px_40px_-20px_#1c1a17] sm:px-10">
          <p className="caps mb-5 text-ink-faint">You were asked</p>
          <p className="mb-8 text-xl italic leading-snug text-ink">{block.prompt}</p>
          {block.body ? (
            <>
              <p className="caps mb-4 text-ink-faint">You wrote{block.written_at ? `, ${shortDate(block.written_at)}` : ""}</p>
              <Paragraphs text={block.body} className="type text-[0.95rem] leading-[1.9] text-ink" />
            </>
          ) : (
            <p className="type text-[0.92rem] text-ink-soft">You didn’t write anything. That is an answer too.</p>
          )}
        </div>
      );
  }
}

/** A photograph develops the first time you look at it. */
export function DevelopingPhoto({ media, wide }: { media: MediaView; wide?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <figure className={wide ? "col-span-2" : ""}>
      <div className="bg-[#f8f5ef] p-2 shadow-[0_8px_24px_-14px_#1c1a17] sm:p-2.5">
        <motion.div
          className="overflow-hidden"
          initial={reduce ? false : { filter: "blur(14px) brightness(1.9) contrast(0.45) sepia(0.7)" }}
          whileInView={{ filter: "blur(0px) brightness(1) contrast(1) sepia(0.12)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 2.8, ease: [0.22, 0.61, 0.24, 1] }}
        >
          {media.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- media may live on any storage host
            <img src={media.url} alt={media.alt} className={`w-full object-cover ${wide ? "aspect-[16/9]" : "aspect-[4/3]"}`} />
          ) : (
            <Scene scene={media.scene ?? "linen"} role="img" aria-label={media.alt} className={`block w-full ${wide ? "aspect-[16/9]" : "aspect-[4/3]"}`} />
          )}
        </motion.div>
      </div>
      {media.caption && <figcaption className="type mt-2.5 text-[0.78rem] text-ink-soft">{media.caption}</figcaption>}
    </figure>
  );
}

function Route({ block }: { block: Extract<BlockView, { type: "route" }> }) {
  const W = 320;
  const H = 200;
  const d = block.points.map(([x, y], i) => `${i ? "L" : "M"}${(x * W).toFixed(1)} ${(y * H).toFixed(1)}`).join(" ");
  const [sx, sy] = block.points[0];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="caps text-ink-faint">The route</p>
        {block.distance && <p className="type text-[0.8rem] text-ink-soft">{block.distance}</p>}
      </div>
      <svg viewBox={`-10 -10 ${W + 20} ${H + 20}`} className="mt-4 w-full" role="img" aria-label={block.label}>
        <defs>
          <pattern id="contours" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20 C10 12 30 28 40 20" fill="none" stroke="#1c1a17" strokeWidth=".3" opacity=".25" />
          </pattern>
        </defs>
        <rect x="-10" y="-10" width={W + 20} height={H + 20} fill="url(#contours)" />
        <motion.path
          d={d}
          fill="none"
          stroke="#1c1a17"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 3.4, ease: [0.45, 0, 0.3, 1] }}
        />
        <circle cx={sx * W} cy={sy * H} r="3.5" fill="#1c1a17" />
        <text x={sx * W + 8} y={sy * H + 4} fontFamily="var(--font-type)" fontSize="9" fill="#4d483f">
          start
        </text>
      </svg>
      <p className="mt-3 italic text-ink-soft">{block.label}</p>
    </div>
  );
}

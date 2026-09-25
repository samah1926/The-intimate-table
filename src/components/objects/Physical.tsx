"use client";

import { useId } from "react";
import type { ObjectView } from "@/lib/house/compose";
import { Photo, cameraDate } from "@/components/photo/Photo";
import { ObjectArt } from "./ObjectArt";

// Objects as they would lie on a table: paper with grain, brass that catches
// the lamp, a record half out of its sleeve. Each returns a box that fills its
// parent; the parent decides size, position and rotation.

/** Width / height of each physical object. */
export const PHYSICAL_ASPECT: Record<string, number> = {
  photograph: 0.84,
  menu: 0.74,
  flower: 0.5,
  key: 2.6,
  record: 1.22,
  note: 1.3,
  envelope: 1.43,
  invitation: 1.33,
  postcard: 1.5,
  place_card: 0.71,
  shoes: 2,
  mat: 2,
  bowl: 1.45,
};

export function firstPhoto(o: ObjectView) {
  const b = o.memory?.blocks.find((x) => x.type === "photos");
  return b && b.type === "photos" ? b.photos[0] ?? null : null;
}

export function Physical({ object, large = false }: { object: ObjectView; large?: boolean }) {
  switch (object.kind) {
    case "photograph": {
      const photo = firstPhoto(object);
      return (
        <Photo
          form="polaroid"
          media={photo ?? { url: null, scene: "table", alt: object.title }}
          note={large ? object.caption?.split(".")[0] ?? null : "before anyone sat down"}
          stamp={cameraDate(object.memory?.occurred_at ?? null)}
          className="h-full w-full"
          sizes="(min-width: 768px) 30vw, 60vw"
        />
      );
    }
    case "menu":
      return <FoldedMenu label={object.label} />;
    case "flower":
      return <DriedFlower />;
    case "key":
      return <BrassKey />;
    case "record":
      return <Vinyl label={object.label} spinning={large && object.state === "open"} />;
    case "note":
      return object.label ? <ObjectArt kind="note" label={object.label} /> : <FoldedNote />;
    default:
      return <ObjectArt kind={object.kind} label={object.label} scene={firstPhoto(object)?.scene ?? undefined} />;
  }
}

function FoldedMenu({ label }: { label: string | null }) {
  const lines = ["Bread, butter, radishes", "Tomato, peach, basil", "Fish baked in salt", "Whatever was left", "Fig leaf, coffee"];
  return (
    <div className="relative flex h-full w-full [perspective:600px]">
      {/* folded in half: the left leaf lifts a little */}
      <div className="tex-paper relative h-full w-1/2 origin-right bg-[#f2ece1] [transform:rotateY(14deg)]" style={{ boxShadow: "inset -14px 0 18px -12px rgba(60,40,20,0.35)" }}>
        <div className="absolute inset-x-[14%] top-[12%] text-center">
          <p className="caps text-[clamp(0.35rem,1vw,0.6rem)] text-[#2a2118]">{label ?? "Menu"}</p>
          <div className="mx-auto mt-[12%] h-px w-1/3 bg-[#2a2118]/40" />
        </div>
        <p className="hand absolute bottom-[10%] left-[14%] text-[clamp(0.6rem,1.6vw,1.1rem)] text-[#2a2118]/70">for Léa</p>
      </div>
      <div className="tex-paper relative h-full w-1/2 bg-[#f5efe5]" style={{ boxShadow: "inset 10px 0 14px -10px rgba(60,40,20,0.3)" }}>
        <div className="absolute inset-x-[10%] top-[14%] space-y-[9%] text-center">
          {lines.map((l, i) => (
            <p key={l} className="text-[clamp(0.3rem,0.85vw,0.55rem)] leading-tight text-[#4f463c]">
              <span className="block italic text-[#8a7f71]">{["i", "ii", "iii", "iv", "v"][i]}</span>
              {l}
            </p>
          ))}
        </div>
        {/* a small wine stain */}
        <div className="absolute bottom-[8%] right-[12%] h-[16%] w-[26%] rounded-full border border-[#7a2a33]/30 opacity-70" />
      </div>
    </div>
  );
}

function DriedFlower() {
  const petal = `petal-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 100 200" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={petal} cx="50%" cy="20%" r="80%">
          <stop offset="0" stopColor="#efe2c6" />
          <stop offset="1" stopColor="#c9ab7c" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="#7d6a45" strokeWidth="1.2" strokeLinecap="round">
        <path d="M52 196 C49 150 44 110 50 60" />
        <path d="M48 140 C36 130 28 134 20 122 C32 120 40 126 48 134" fill="#a39062" fillOpacity=".5" />
        <path d="M50 110 C62 102 72 104 80 94 C68 92 60 98 50 104" fill="#a39062" fillOpacity=".5" />
        <path d="M51 150 C58 146 64 140 66 132" stroke="#8d7a50" />
      </g>
      <g transform="translate(50 46)">
        {Array.from({ length: 13 }).map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-15"
            rx="3.6"
            ry={9 + (i % 3)}
            fill={`url(#${petal})`}
            stroke="#a58a5c"
            strokeWidth=".4"
            transform={`rotate(${(i / 13) * 360 + (i % 2) * 7})`}
            opacity={i === 4 || i === 9 ? 0 : 0.95}
          />
        ))}
        <circle r="7.5" fill="#b9892e" />
        <circle r="7.5" fill={`url(#${petal})`} opacity=".25" />
      </g>
      <g transform="translate(70 72) scale(.42) rotate(20)">
        {Array.from({ length: 10 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="-15" rx="3.6" ry="9" fill="#e3d2ad" transform={`rotate(${(i / 10) * 360})`} />
        ))}
        <circle r="7" fill="#a87c2c" />
      </g>
      {/* two fallen petals */}
      <ellipse cx="22" cy="176" rx="3" ry="7" fill="#dcc79f" transform="rotate(40 22 176)" />
      <ellipse cx="80" cy="160" rx="3" ry="6.5" fill="#d8c396" transform="rotate(-25 80 160)" />
    </svg>
  );
}

function BrassKey() {
  const brass = `brass-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 260 100" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={brass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0d79a" />
          <stop offset=".45" stopColor="#b98f4a" />
          <stop offset="1" stopColor="#6e4f23" />
        </linearGradient>
      </defs>
      {/* a length of black thread through the bow */}
      <path d="M36 30 C14 8 -4 22 6 40 C14 56 30 46 24 30" fill="none" stroke="#151311" strokeWidth="1.1" />
      <path d="M46 20 C60 2 90 0 96 10" fill="none" stroke="#151311" strokeWidth="1.1" />
      <g fill={`url(#${brass})`} stroke="#5a3f1c" strokeWidth=".8">
        <path d="M40 50 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 Z M40 50 m-11 0 a11 11 0 1 1 22 0 a11 11 0 1 1 -22 0 Z" fillRule="evenodd" />
        <rect x="68" y="44" width="162" height="12" rx="3" />
        <path d="M196 56 H230 V80 H220 V70 H212 V84 H202 V66 H196 Z" />
        <rect x="70" y="40" width="10" height="20" rx="2" />
      </g>
      <path d="M72 46 H226" stroke="#fff3cf" strokeWidth="1.4" opacity=".6" />
      <ellipse cx="30" cy="36" rx="8" ry="4" fill="#fff5d8" opacity=".5" transform="rotate(-30 30 36)" />
    </svg>
  );
}

function Vinyl({ label, spinning }: { label: string | null; spinning: boolean }) {
  return (
    <div className="relative h-full w-full">
      {/* the record, half out of its sleeve */}
      <div className="absolute right-0 top-[4%] aspect-square h-[92%] rounded-full" style={{ background: "repeating-radial-gradient(circle at 50% 50%, #151210 0 1.2px, #221c18 1.2px 2.4px)", boxShadow: "0 10px 20px -8px rgba(0,0,0,0.6)" }}>
        <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 20deg, transparent 0 18%, rgba(255,240,210,0.16) 22%, transparent 28% 60%, rgba(255,240,210,0.1) 64%, transparent 70%)" }} />
        <div className={`absolute left-1/2 top-1/2 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#a9623f] ${spinning ? "spin-slow" : "spin-slow [animation-duration:120s]"}`}>
          <span className="hand text-[clamp(0.5rem,1.4vw,0.95rem)] text-[#f4e7d4]">Thirty</span>
          <span className="absolute left-1/2 top-1/2 h-[9%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a1512]" />
        </div>
      </div>
      <div className="tex-paper absolute left-0 top-0 aspect-square h-full bg-[#e9dfcd]" style={{ boxShadow: "6px 0 10px -6px rgba(0,0,0,0.4)" }}>
        <div className="absolute inset-[10%] rounded-full border border-[#2a2118]/10" />
        <p className="hand absolute left-[12%] top-[10%] text-[clamp(0.8rem,2.2vw,1.6rem)] leading-none text-[#2a2118]">Thirty</p>
        {label && <p className="caps absolute bottom-[9%] left-[12%] text-[clamp(0.3rem,0.8vw,0.5rem)] text-[#2a2118]/80">{label}</p>}
      </div>
    </div>
  );
}

function FoldedNote() {
  return (
    <div className="tex-paper relative h-full w-full bg-[#f6f1e6]" style={{ boxShadow: "inset 0 -18px 16px -16px rgba(60,40,20,0.25)" }}>
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#2a2118]/10" />
      <p className="hand absolute left-[10%] top-[14%] text-[clamp(1rem,2.8vw,1.9rem)] leading-none text-[#2a2118]">You came.</p>
      <p className="hand absolute left-[10%] top-[48%] w-[85%] text-[clamp(0.7rem,1.8vw,1.2rem)] leading-tight text-[#2a2118]/80">
        That was the whole point
      </p>
    </div>
  );
}

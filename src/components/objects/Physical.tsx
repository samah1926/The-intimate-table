"use client";

import { useId } from "react";
import type { ObjectView } from "@/lib/house/compose";
import { Photo, cameraDate } from "@/components/photo/Photo";
import { ObjectArt } from "./ObjectArt";
import { Monogram } from "@/components/paper/Monogram";

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
  invitation: 1.2,
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
      return <FoldedMenu />;
    case "flower":
      return <DriedFlower />;
    case "key":
      return <BrassKey />;
    case "record":
      return <Vinyl label={object.label} spinning={large && object.state === "open"} />;
    case "invitation":
      return <BurgundyEnvelope chapter={object.chapter?.label ?? null} />;
    case "note":
      return object.label ? <ObjectArt kind="note" label={object.label} /> : <FoldedNote />;
    default:
      return <ObjectArt kind={object.kind} label={object.label} scene={firstPhoto(object)?.scene ?? undefined} />;
  }
}

function FoldedMenu() {
  const courses = ["Charred vegetables, olive and citrus", "Sea bass, herbs, lemon", "Lamb, slow cooked", "Orange blossom, almond, honey"];
  return (
    <div className="@container relative flex h-full w-full [perspective:600px]">
      {/* folded in half: the left leaf lifts a little */}
      <div className="tex-paper relative h-full w-1/2 origin-right bg-[#f2ece1] [transform:rotateY(14deg)]" style={{ boxShadow: "inset -14px 0 18px -12px rgba(60,40,20,0.35)" }}>
        <div className="absolute inset-x-[10%] top-[16%] text-center text-[#2a2118]">
          <p className="font-serif text-[7cqw] uppercase leading-[1.05] tracking-[0.08em]">
            The
            <br />
            Intimate
            <br />
            Table
          </p>
          <p className="mt-[14%] font-serif text-[3.2cqw] uppercase tracking-[0.2em]">Morocco</p>
          <p className="font-serif text-[3.2cqw] uppercase tracking-[0.2em]">13 March 2027</p>
        </div>
        <p className="hand absolute bottom-[8%] left-[12%] text-[8cqw] text-[#2a2118]/70">for Léa</p>
      </div>
      <div className="tex-paper relative h-full w-1/2 bg-[#f5efe5]" style={{ boxShadow: "inset 10px 0 14px -10px rgba(60,40,20,0.3)" }}>
        <div className="absolute inset-x-[10%] top-[18%] space-y-[16%] text-center">
          {courses.map((l) => (
            <p key={l} className="font-serif text-[3.6cqw] leading-tight text-[#3d342b]">
              {l}
            </p>
          ))}
        </div>
        {/* a burgundy ribbon, still tied */}
        <div className="absolute inset-y-0 left-[18%] w-[5%] bg-[#5a2028] opacity-90 shadow-[1px_0_2px_rgba(0,0,0,0.3)]" />
        <div className="absolute bottom-[8%] right-[12%] h-[14%] w-[24%] rounded-full border border-[#7a2a33]/30 opacity-70" />
      </div>
    </div>
  );
}

function DriedFlower() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 200" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`spathe-${id}`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#8e2a33" />
          <stop offset=".7" stopColor="#5a1a22" />
          <stop offset="1" stopColor="#3a1016" />
        </radialGradient>
      </defs>
      {/* a dried anthurium: the stem long and a little bent */}
      <path d="M58 196 C54 150 50 108 54 70" fill="none" stroke="#6d5a3c" strokeWidth="2" strokeLinecap="round" />
      <path d="M54 70 C30 72 10 56 12 34 C14 14 34 6 48 20 C54 8 76 6 86 22 C96 40 80 66 54 70 Z" fill={`url(#spathe-${id})`} stroke="#2e0c11" strokeWidth=".6" />
      {/* the veins, as it dries */}
      <g fill="none" stroke="#b8505a" strokeOpacity=".35" strokeWidth=".7">
        <path d="M54 68 C44 56 32 44 22 32" />
        <path d="M54 68 C60 54 70 42 80 30" />
        <path d="M54 68 C50 50 48 36 48 22" />
      </g>
      <path d="M20 40 C28 30 38 26 46 28" fill="none" stroke="#e6a3a8" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
      {/* the spadix */}
      <path d="M52 52 C56 40 60 30 62 16" stroke="#c9a14a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M52 52 C56 40 60 30 62 16" stroke="#8a6a26" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="1 2" fill="none" opacity=".6" />
      {/* a fallen fleck */}
      <ellipse cx="30" cy="170" rx="3" ry="5" fill="#5a1a22" opacity=".7" transform="rotate(30 30 170)" />
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

function BurgundyEnvelope({ chapter }: { chapter: string | null }) {
  return (
    <div className="@container relative h-full w-full">
      {/* the card, half drawn out */}
      <div className="tex-paper absolute inset-x-[6%] top-0 h-[62%] bg-[#f3ede2] px-[6%] pt-[5%] text-[#2a2118] shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
        <p className="font-serif text-[5.4cqw] uppercase leading-[1.02] tracking-[0.06em]">
          The
          <br />
          Intimate
          <br />
          Table
        </p>
        <p className="absolute bottom-[10%] right-[6%] text-right font-serif text-[2.4cqw] uppercase leading-snug tracking-[0.14em]">
          Morocco
          <br />
          {chapter ?? "Chapter 0"}
          <br />
          13 — 16 March 2027
        </p>
      </div>
      {/* the envelope */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[#4a1a20] shadow-[0_-6px_10px_-6px_rgba(0,0,0,0.5)]" style={{ backgroundImage: "linear-gradient(170deg, rgba(255,255,255,0.06), transparent 40%), url(/house/textures/paper.webp)", backgroundBlendMode: "normal, multiply", backgroundSize: "auto, 256px" }}>
        <div className="absolute inset-x-0 top-0 h-[42%]" style={{ background: "linear-gradient(160deg, rgba(0,0,0,0.25), transparent 60%)", clipPath: "polygon(0 0, 50% 100%, 100% 0)" }} />
        <div className="absolute bottom-[8%] right-[6%] text-[#d9c5a8]">
          <Monogram size={0} className="h-[22cqw] w-[22cqw]" />
        </div>
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

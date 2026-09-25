"use client";

import { createContext, useContext } from "react";

// Human traces: what people leave without meaning to. A glass not quite
// finished, a napkin dropped, a candle burned down, a book left face down.
// Decorative only: they belong to the room, not to anyone's memories.

type Trace = { el: React.ReactNode; x: number; y: number; w: number; r?: number; hideOnPhone?: boolean };

const LAYOUT: Record<string, { desktop: Trace[]; phone: Trace[] }> = {
  memory: {
    desktop: [
      { el: <TeaGlass />, x: 93, y: 66, w: 4.5 },
      { el: <Pencil />, x: 56, y: 66, w: 9, r: 28 },
      { el: <CandleStub />, x: 6, y: 72, w: 4 },
      { el: <Crumbs />, x: 72, y: 70, w: 6 },
    ],
    phone: [
      { el: <TeaGlass />, x: 88, y: 93, w: 13 },
      { el: <Pencil />, x: 58, y: 70, w: 24, r: 32 },
      { el: <CandleStub />, x: 10, y: 49, w: 10 },
    ],
  },
  table: {
    desktop: [
      { el: <CandleStub lit />, x: 6, y: 16, w: 3.6 },
      { el: <CandleStub lit />, x: 94, y: 33, w: 3.4 },
      { el: <CandleStub lit />, x: 7, y: 63, w: 3.4 },
      { el: <CandleStub lit />, x: 92, y: 78, w: 3.2 },
      { el: <WineGlass level={0.4} />, x: 13, y: 24, w: 5 },
      { el: <WineGlass level={0} />, x: 88, y: 45, w: 4.6 },
      { el: <WineGlass level={0.15} />, x: 93, y: 12, w: 4.8 },
      { el: <WineGlass level={0.55} />, x: 12, y: 74, w: 4.6 },
      { el: <Plate />, x: 90, y: 62, w: 10, r: 20 },
      { el: <Plate crumbs />, x: 8, y: 88, w: 9, r: -30 },
      { el: <Napkin />, x: 6, y: 42, w: 10, r: -12 },
      { el: <Napkin />, x: 94, y: 93, w: 9, r: 150 },
      { el: <Crumbs />, x: 72, y: 7, w: 7 },
      { el: <Crumbs />, x: 20, y: 52, w: 5 },
      { el: <TeaGlass />, x: 86, y: 86, w: 3.4 },
    ],
    phone: [
      { el: <CandleStub lit />, x: 88, y: 4, w: 10 },
      { el: <WineGlass level={0.4} />, x: 90, y: 22, w: 13 },
      { el: <Napkin />, x: 99, y: 63, w: 18, r: -20 },
      { el: <CandleStub lit />, x: 3, y: 57, w: 8 },
      { el: <Plate crumbs />, x: 97, y: 99, w: 24, r: -30 },
      { el: <WineGlass level={0.1} />, x: 2, y: 76, w: 11 },
    ],
  },
  studio: {
    desktop: [
      { el: <Towel />, x: 38, y: 74, w: 10, r: -6 },
      { el: <WaterGlass />, x: 67, y: 44, w: 3.6 },
    ],
    phone: [{ el: <WaterGlass />, x: 88, y: 12, w: 12 }],
  },
  library: {
    desktop: [
      { el: <OpenBook />, x: 62, y: 44, w: 18, r: -8 },
      { el: <ReadingGlasses />, x: 83, y: 64, w: 10, r: 14 },
      { el: <CoffeeCup />, x: 92, y: 30, w: 6.5 },
    ],
    phone: [
      { el: <OpenBook />, x: 70, y: 76, w: 44, r: -8 },
      { el: <CoffeeCup />, x: 18, y: 84, w: 18 },
    ],
  },
};

export function Traces({ room, mobile = false }: { room: keyof typeof LAYOUT; mobile?: boolean }) {
  const items = LAYOUT[room]?.[mobile ? "phone" : "desktop"] ?? [];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((t, i) => (
        <div
          key={i}
          className="on-surface absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.w}%`, transform: `translate(-50%, -50%) rotate(${t.r ?? 0}deg)` }}
        >
          <IdScope id={`${room}-${mobile ? "p" : "d"}-${i}`}>{t.el}</IdScope>
        </div>
      ))}
    </div>
  );
}

// SVG gradient ids must be unique on the page (the phone and desktop scenes
// are both in the DOM), so each trace draws inside its own id scope.
const Scope = createContext("t");
function IdScope({ id, children }: { id: string; children: React.ReactNode }) {
  return <Scope.Provider value={id}>{children}</Scope.Provider>;
}
const useScoped = (name: string) => `${name}-${useContext(Scope)}`;

// ── the traces themselves, seen from above ───────────────────────────────

function TeaGlass() {
  const shine = useScoped("teaShine");
  return (
    <svg viewBox="0 0 60 60" className="w-full" aria-hidden>
      <circle cx="30" cy="30" r="26" fill="#d9a44a" fillOpacity=".18" stroke="#fff2d8" strokeOpacity=".75" strokeWidth="1.4" />
      <circle cx="30" cy="30" r="21" fill="#b8742a" fillOpacity=".8" />
      <circle cx="30" cy="30" r="21" fill={`url(#${shine})`} />
      <path d="M22 26 c6 -8 14 -6 16 0 c-6 4 -12 4 -16 0z" fill="#5d8a3e" />
      <path d="M20 19 a14 14 0 0 1 16 -4" stroke="#fff6e4" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
      <defs>
        <radialGradient id={shine} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffd98a" stopOpacity=".8" />
          <stop offset="1" stopColor="#7a4515" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function WineGlass({ level }: { level: number }) {
  return (
    <svg viewBox="0 0 70 70" className="w-full" aria-hidden>
      <circle cx="35" cy="35" r="31" fill="#ffffff" fillOpacity=".04" stroke="#fff1dc" strokeOpacity=".7" strokeWidth="1.3" />
      {level > 0 ? (
        <circle cx="37" cy="37" r={10 + level * 18} fill="#5a1520" fillOpacity=".92" />
      ) : (
        <path d="M22 44 a18 18 0 0 0 26 4" stroke="#6d1f2a" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7" />
      )}
      <circle cx="35" cy="35" r="31" fill="none" stroke="#6d1f2a" strokeOpacity=".25" strokeWidth="5" />
      <path d="M14 26 a24 24 0 0 1 18 -14" stroke="#fffaf0" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".85" />
    </svg>
  );
}

function CandleStub({ lit = false }: { lit?: boolean }) {
  return (
    <div className="relative">
      {lit && (
        <div
          className="candle pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[900%] w-[900%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,184,100,0.34), rgba(255,150,70,0.1) 45%, transparent 75%)" }}
        />
      )}
      <svg viewBox="0 0 50 50" className="w-full" aria-hidden>
        <circle cx="25" cy="25" r="20" fill="#e9dcc1" />
        <path d="M8 30 c-4 6 0 12 6 10 M40 16 c6 -2 8 6 3 9" fill="#e2d2b2" stroke="#d3c19c" strokeWidth=".5" />
        <circle cx="25" cy="25" r="15" fill="#f3e8d2" />
        <circle cx="25" cy="25" r="3" fill={lit ? "#fff4c8" : "#2a2118"} />
        {lit && <circle cx="25" cy="25" r="7" fill="#ffc86b" opacity=".6" className="candle" />}
      </svg>
    </div>
  );
}

function Plate({ crumbs = false }: { crumbs?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full" aria-hidden>
      <circle cx="60" cy="60" r="56" fill="#f5f1e9" />
      <circle cx="60" cy="60" r="40" fill="#ece5d8" />
      <path d="M44 62 c8 -6 18 -4 24 2 c-6 8 -18 8 -24 -2z" fill="#9a5a34" opacity=".55" />
      <path d="M70 48 c4 -2 8 0 9 4" stroke="#7a8448" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
      {crumbs && [30, 52, 78, 64, 46].map((x, i) => <circle key={i} cx={x} cy={40 + ((i * 17) % 40)} r="1.6" fill="#c19a63" />)}
      {/* a fork, left across the rim */}
      <g stroke="#cfcac1" strokeWidth="3" strokeLinecap="round">
        <path d="M78 96 L112 20" />
        <path d="M106 26 L118 4 M110 28 L122 6 M102 24 L114 2" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

function Napkin() {
  const nap = useScoped("nap");
  return (
    <svg viewBox="0 0 120 90" className="w-full" aria-hidden>
      <defs>
        <linearGradient id={nap} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d2a33" />
          <stop offset="1" stopColor="#3f141b" />
        </linearGradient>
      </defs>
      <path d="M10 30 C24 6 60 10 78 4 C100 0 118 20 110 40 C104 56 116 72 96 84 C72 96 44 80 26 86 C6 90 0 70 8 56 C14 46 2 40 10 30 Z" fill={`url(#${nap})`} />
      <g stroke="#2a0c11" strokeOpacity=".45" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M22 44 C40 30 58 52 84 34" />
        <path d="M34 70 C52 56 76 74 100 58" />
      </g>
      <g stroke="#b0606a" strokeOpacity=".35" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M24 41 C42 27 60 49 86 31" />
        <path d="M36 67 C54 53 78 71 102 55" />
        <path d="M58 16 C70 30 52 44 62 60" />
      </g>
    </svg>
  );
}

function Crumbs() {
  const pts = [
    [10, 20, 2.2], [24, 14, 1.4], [30, 28, 1.8], [42, 18, 1.2], [52, 30, 2.6], [64, 22, 1.4], [70, 34, 1.8], [18, 34, 1.2], [80, 16, 1.6], [36, 40, 1],
  ];
  return (
    <svg viewBox="0 0 90 50" className="w-full" aria-hidden>
      {pts.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? "#d4b27c" : "#a8773f"} />
      ))}
    </svg>
  );
}

function Pencil() {
  return (
    <svg viewBox="0 0 200 16" className="w-full" aria-hidden>
      <rect x="18" y="3" width="170" height="10" rx="1" fill="#c9a46b" />
      <rect x="18" y="3" width="170" height="3.4" fill="#e0c28a" />
      <rect x="182" y="2" width="16" height="12" rx="2" fill="#b8955a" />
      <path d="M18 3 L2 8 L18 13 Z" fill="#e8d3ad" />
      <path d="M8 6 L2 8 L8 10 Z" fill="#2b2826" />
    </svg>
  );
}

function Towel() {
  return (
    <svg viewBox="0 0 160 110" className="w-full" aria-hidden>
      <rect x="4" y="6" width="152" height="98" rx="6" fill="#efe8dc" />
      {[22, 30, 80, 88].map((x) => (
        <rect key={x} x={x} y="6" width="3" height="98" fill="#5a2028" opacity=".75" />
      ))}
      <path d="M4 56 H156" stroke="#d5cabb" strokeWidth="2" />
      <path d="M156 20 c6 4 6 10 0 14 M156 70 c6 4 6 10 0 14" stroke="#e2d9ca" strokeWidth="2" fill="none" />
    </svg>
  );
}

function WaterGlass() {
  return (
    <svg viewBox="0 0 60 60" className="w-full" aria-hidden>
      <circle cx="30" cy="30" r="26" fill="#dfe8ea" fillOpacity=".35" stroke="#ffffff" strokeWidth="1.4" />
      <circle cx="31" cy="31" r="17" fill="#cfdde0" fillOpacity=".6" />
      <path d="M16 22 a16 16 0 0 1 12 -9" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function OpenBook() {
  return (
    <svg viewBox="0 0 200 120" className="w-full" aria-hidden>
      {/* face down, open at the page someone was reading */}
      <path d="M6 20 L98 8 L100 112 L10 104 Z" fill="#3c4a3b" />
      <path d="M194 20 L102 8 L100 112 L190 104 Z" fill="#34412f" />
      <path d="M10 104 L100 112 L100 116 L12 108 Z M190 104 L100 112 L100 116 L188 108 Z" fill="#efe6d4" />
      <path d="M98 8 L102 8 L100 112 Z" fill="#232c22" />
      <text x="50" y="62" fontFamily="var(--font-serif)" fontSize="7" letterSpacing="2" fill="#e9e3d4" transform="rotate(-4 50 62)">
        RECOVERY
      </text>
    </svg>
  );
}

function ReadingGlasses() {
  return (
    <svg viewBox="0 0 120 50" className="w-full" aria-hidden>
      <g fill="#e9eef0" fillOpacity=".25" stroke="#2a2118" strokeWidth="2.4">
        <ellipse cx="30" cy="25" rx="22" ry="18" />
        <ellipse cx="90" cy="25" rx="22" ry="18" />
      </g>
      <path d="M52 22 C58 16 62 16 68 22" stroke="#2a2118" strokeWidth="2.4" fill="none" />
      <path d="M22 16 a10 8 0 0 1 12 -3 M82 16 a10 8 0 0 1 12 -3" stroke="#fff" strokeWidth="1.6" fill="none" opacity=".7" />
    </svg>
  );
}

function CoffeeCup() {
  return (
    <svg viewBox="0 0 80 80" className="w-full" aria-hidden>
      <circle cx="40" cy="40" r="36" fill="#efe9de" />
      <circle cx="40" cy="40" r="26" fill="#f8f4ec" stroke="#ddd3c3" strokeWidth="1" />
      <circle cx="40" cy="40" r="19" fill="#4a2e1c" />
      <circle cx="40" cy="40" r="19" fill="none" stroke="#7a5236" strokeWidth="2" opacity=".6" />
      <path d="M64 34 c8 0 10 12 0 12" stroke="#f8f4ec" strokeWidth="5" fill="none" />
    </svg>
  );
}

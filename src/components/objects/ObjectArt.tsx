// Every object in the House is drawn: paper things in paper colours,
// other things as fine ink lines in the room's own ink (currentColor).

import type { ObjectKind } from "@/lib/domain/types";
import { renderMotif } from "./Motif";
import { Scene } from "./Scene";

const CARD = "#f3eee5";
const CARD_SHADE = "#e7e0d3";
const EDGE = "#c9bfae";
const INK = "#1c1a17";
const THREAD = "#151311";

const serif = "var(--font-serif)";
const type = "var(--font-type)";
const hand = "var(--font-hand)";

interface ArtProps {
  kind: ObjectKind;
  label?: string | null;
  motif?: string;
  scene?: string;
}

/** Aspect ratio of each drawing, used to size it in a room. */
export const ASPECT: Record<string, number> = {
  envelope: 200 / 140,
  invitation: 200 / 150,
  note: 140 / 110,
  menu: 120 / 180,
  photograph: 160 / 130,
  record: 200 / 126,
  shoes: 220 / 110,
  flower: 100 / 170,
  key: 200 / 80,
  place_card: 100 / 140,
  postcard: 180 / 120,
  mat: 200 / 100,
  bowl: 160 / 110,
  stone: 120 / 80,
  book: 140 / 180,
  bib: 160 / 130,
};

export function ObjectArt({ kind, label, motif, scene }: ArtProps) {
  switch (kind) {
    case "envelope":
      return <Envelope label={label} />;
    case "invitation":
      return <Invitation label={label} />;
    case "note":
      return <Note label={label} />;
    case "menu":
      return <Menu label={label} />;
    case "photograph":
      return <Photograph scene={scene ?? "table"} />;
    case "record":
      return <Cassette label={label} />;
    case "shoes":
      return <Shoes />;
    case "flower":
      return <Flower />;
    case "key":
      return <Key />;
    case "place_card":
      return <PlaceCard label={label} motif={motif ?? "sprig"} />;
    case "postcard":
      return <Postcard label={label} />;
    case "mat":
      return <Mat />;
    case "bowl":
      return <Bowl />;
    case "bib":
      return <Bib label={label} />;
    case "book":
      return <Book label={label} />;
    case "stone":
    default:
      return (
        <svg viewBox="0 0 120 80" className="h-full w-full" aria-hidden>
          <g transform="translate(20 0) scale(2)">{renderMotif("stone")}</g>
        </svg>
      );
  }
}

/** Black cotton thread, wound around whatever is sealed. */
export function Thread({ tight = false }: { tight?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <g stroke={THREAD} strokeWidth={tight ? 0.9 : 0.7} fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="round">
        <path d="M-4 38 L104 58" vectorEffect="non-scaling-stroke" />
        <path d="M-4 44 L104 62" vectorEffect="non-scaling-stroke" opacity=".85" />
        <path d="M34 -4 L58 104" vectorEffect="non-scaling-stroke" />
        <path d="M70 -4 L44 104" vectorEffect="non-scaling-stroke" opacity=".85" />
      </g>
      <circle cx="51" cy="51" r="1.6" fill={THREAD} />
    </svg>
  );
}

function Paper({ w, h, children, fill = CARD }: { w: number; h: number; children?: React.ReactNode; fill?: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" aria-hidden>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} fill={fill} stroke={EDGE} strokeWidth=".6" />
      {children}
    </svg>
  );
}

function Caps({ x, y, children, size = 6.2, anchor = "middle", rotate }: { x: number; y: number; children: React.ReactNode; size?: number; anchor?: "middle" | "start" | "end"; rotate?: number }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily={serif}
      fontSize={size}
      letterSpacing={size * 0.42}
      fill={INK}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

function Envelope({ label }: { label?: string | null }) {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full overflow-visible" aria-hidden>
      <rect x=".5" y=".5" width="199" height="139" fill={CARD} stroke={EDGE} strokeWidth=".6" />
      <path d="M.5 .5 L100 78 L199.5 .5" fill={CARD_SHADE} stroke={EDGE} strokeWidth=".6" />
      <path d="M.5 139.5 L80 70 M199.5 139.5 L120 70" stroke={EDGE} strokeWidth=".5" fill="none" />
      {label && <Caps x={100} y={118} size={6}>{label}</Caps>}
    </svg>
  );
}

function Invitation({ label }: { label?: string | null }) {
  return (
    <svg viewBox="0 0 200 150" className="h-full w-full overflow-visible" aria-hidden>
      {/* a photograph slipped inside, as on the moodboard */}
      <g transform="rotate(-4 100 40)">
        <rect x="34" y="4" width="132" height="70" fill="#f9f6f0" stroke={EDGE} strokeWidth=".5" />
        <Scene scene="window" x="40" y="9" width="120" height="60" />
      </g>
      <rect x=".5" y="40.5" width="199" height="109" fill={CARD} stroke={EDGE} strokeWidth=".6" />
      <path d="M.5 40.5 L100 104 L199.5 40.5" fill={CARD_SHADE} stroke={EDGE} strokeWidth=".6" />
      <g stroke={THREAD} strokeWidth=".9" fill="none">
        <path d="M-6 70 L206 120" />
        <path d="M-6 76 L206 124" />
        <path d="M120 30 L86 156" />
        <path d="M132 30 L96 156" />
      </g>
      {label && <Caps x={62} y={132} size={6} rotate={-12}>{label}</Caps>}
    </svg>
  );
}

function Note({ label }: { label?: string | null }) {
  return (
    <Paper w={140} h={110} fill="#f6f2ea">
      {label ? (
        <>
          <text x="14" y="26" fontFamily={type} fontSize="9" fill={INK}>
            {label}
          </text>
          {[44, 58, 72, 86].map((y, i) => (
            <line key={y} x1="14" y1={y} x2={i === 3 ? 76 : 124} y2={y} stroke="#8b8478" strokeWidth="1.3" opacity=".35" />
          ))}
        </>
      ) : (
        <>
          <text x="16" y="44" fontFamily={hand} fontSize="22" fill={INK}>
            You came.
          </text>
          <text x="16" y="72" fontFamily={hand} fontSize="16" fill={INK} opacity=".8">
            That was the whole point
          </text>
        </>
      )}
    </Paper>
  );
}

function Menu({ label }: { label?: string | null }) {
  const lines = ["Bread, butter, radishes", "Tomato, peach, basil", "Fish in salt", "Whatever was left", "Fig leaf, coffee"];
  return (
    <Paper w={120} h={180}>
      <Caps x={60} y={30} size={7.5}>{label ?? "MENU"}</Caps>
      <line x1="48" y1="40" x2="72" y2="40" stroke={INK} strokeWidth=".5" />
      {lines.map((l, i) => (
        <g key={l}>
          <text x="60" y={62 + i * 20} textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize="5.4" fill={INK}>
            {["i", "ii", "iii", "iv", "v"][i]}
          </text>
          <text x="60" y={70 + i * 20} textAnchor="middle" fontFamily={serif} fontSize="5.6" fill="#4d483f">
            {l}
          </text>
        </g>
      ))}
      <text x="60" y="170" textAnchor="middle" fontFamily={type} fontSize="4.2" fill="#8b8478">
        12 · IX
      </text>
    </Paper>
  );
}

function Photograph({ scene }: { scene: string }) {
  return (
    <svg viewBox="0 0 160 130" className="h-full w-full overflow-visible" aria-hidden>
      <rect x=".5" y=".5" width="159" height="129" fill="#f8f5ef" stroke={EDGE} strokeWidth=".5" />
      <Scene scene={scene} x="8" y="8" width="144" height="100" />
      <text x="12" y="122" fontFamily={hand} fontSize="11" fill={INK} opacity=".75">
        before anyone sat down
      </text>
    </svg>
  );
}

function Cassette({ label }: { label?: string | null }) {
  const reel = (cx: number) => (
    <g>
      <circle cx={cx} cy="58" r="15" fill="none" stroke="#3b3552" strokeWidth="3.2" />
      <circle cx={cx} cy="58" r="11" fill="#f2efe8" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x={cx - 1.2} y="48" width="2.4" height="4" fill="#cfc9bd" transform={`rotate(${a} ${cx} 58)`} />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 200 126" className="h-full w-full overflow-visible" aria-hidden>
      <rect x="1" y="1" width="198" height="124" rx="6" fill="#efebe3" stroke="#bdb5a7" strokeWidth=".8" />
      {[
        [9, 9],
        [191, 9],
        [9, 117],
        [191, 117],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="#2b2926" />
      ))}
      <path d="M52 104 L60 90 L140 90 L148 104" fill="#e6e1d6" stroke="#bdb5a7" strokeWidth=".6" />
      {reel(62)}
      {reel(138)}
      <rect x="84" y="48" width="32" height="20" rx="2" fill="#f8f6f1" stroke="#bdb5a7" strokeWidth=".6" />
      <rect x="88" y="54" width="18" height="8" fill="#1d1b19" />
      <text x="100" y="30" textAnchor="middle" fontFamily={hand} fontSize="19" fill={INK}>
        Thirty
      </text>
      <text x="14" y="86" fontFamily={serif} fontSize="12" fill={INK}>
        A
      </text>
      {label && (
        <text x="100" y="82" textAnchor="middle" fontFamily={serif} fontSize="4.6" letterSpacing="1.6" fill="#57514a">
          {label}
        </text>
      )}
    </svg>
  );
}

function Shoes() {
  const shoe = (tone: string, sole: string) => (
    <g strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 80 C12 72 18 68 30 67 L118 61 C138 59 160 49 178 52 C194 55 200 68 194 76 C189 84 172 86 150 86 L32 88 C20 88 15 85 14 80 Z" fill={sole} stroke="#5b4a3c" strokeWidth="1" />
      <path d="M30 67 C31 50 42 36 60 30 L78 26 C86 36 98 42 112 42 L128 40 C146 42 164 47 178 52 C160 49 138 59 118 61 Z" fill={tone} stroke="#5b4a3c" strokeWidth="1" />
      <path d="M16 76 C60 76 120 74 196 70" stroke="#8a7a68" strokeWidth=".8" fill="none" />
      <path d="M60 30 C66 42 70 54 70 64" stroke="#8a7a68" strokeWidth=".8" fill="none" />
      <path d="M78 26 C80 22 86 20 92 22" stroke="#5b4a3c" strokeWidth="1" fill="none" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${84 + i * 8} ${33 + i * 2} l7 -6`} stroke="#6b5a4a" strokeWidth="1.4" />
      ))}
      <path d="M40 60 C60 56 90 58 118 54" stroke="#a89a88" strokeWidth=".8" strokeDasharray="2 3" fill="none" />
      <path d="M26 80 h4 M44 80 h4 M62 80 h4 M80 79 h4 M98 79 h4 M116 78 h4 M134 77 h4 M152 76 h4" stroke="#8a7a68" strokeWidth="1" />
    </g>
  );
  return (
    <svg viewBox="0 0 220 110" className="h-full w-full overflow-visible" aria-hidden>
      <g transform="translate(18 -14)">{shoe("#d9d1c4", "#c9bfae")}</g>
      {shoe("#efe9df", "#dcd3c4")}
      {/* red dust from the road, in the laces and along the sole */}
      {[
        [92, 30],
        [104, 34],
        [98, 38],
        [40, 84],
        [70, 85],
        [150, 82],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i > 2 ? 1.6 : 0.9} fill="#a0543a" opacity=".7" />
      ))}
    </svg>
  );
}

function Flower() {
  return (
    <svg viewBox="0 0 100 170" className="h-full w-full overflow-visible" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M52 166 C50 130 46 96 50 52" />
        <path d="M49 120 C38 112 30 114 24 106 C34 104 42 108 49 116" />
        <path d="M50 96 C60 90 70 92 76 84 C66 82 58 86 50 92" />
        <path d="M51 70 C56 64 58 60 66 58" opacity=".7" />
      </g>
      <g transform="translate(50 40)">
        {Array.from({ length: 14 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="-14" rx="3.4" ry="10" fill="#f4efe6" stroke="currentColor" strokeWidth=".6" transform={`rotate(${(i / 14) * 360})`} opacity=".95" />
        ))}
        <circle r="7" fill="#d9a441" stroke="#8a6420" strokeWidth=".6" />
      </g>
      <g transform="translate(66 60) scale(.45)">
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="-14" rx="3.4" ry="10" fill="#f4efe6" stroke="currentColor" strokeWidth="1" transform={`rotate(${(i / 12) * 360})`} />
        ))}
        <circle r="7" fill="#d9a441" />
      </g>
    </svg>
  );
}

function Key() {
  return (
    <svg viewBox="0 0 200 80" className="h-full w-full overflow-visible" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <circle cx="34" cy="40" r="22" />
        <circle cx="34" cy="40" r="9" />
        <path d="M56 36 H172 V44 H56" />
        <path d="M150 44 V58 H158 V52 H164 V62 H172 V44" />
        <path d="M60 32 C64 28 68 28 72 32 C76 36 80 36 84 32" opacity=".6" />
        <path d="M60 48 C64 52 68 52 72 48 C76 44 80 44 84 48" opacity=".6" />
      </g>
      {/* a length of thread through the bow */}
      <path d="M26 22 C10 6 0 12 4 26 C8 40 18 30 14 18" fill="none" stroke={THREAD} strokeWidth=".8" className="text-current" />
    </svg>
  );
}

function PlaceCard({ label, motif }: { label?: string | null; motif: string }) {
  return (
    <svg viewBox="0 0 100 140" className="h-full w-full overflow-visible" aria-hidden>
      <rect x=".5" y="28.5" width="99" height="111" fill="#f8f7f3" stroke={EDGE} strokeWidth=".5" />
      <g transform="translate(26 0) scale(1.2)">{renderMotif(motif)}</g>
      {label && <Caps x={50} y={100} size={7.2}>{label}</Caps>}
    </svg>
  );
}

function Postcard({ label }: { label?: string | null }) {
  return (
    <Paper w={180} h={120}>
      <line x1="96" y1="16" x2="96" y2="104" stroke={EDGE} strokeWidth=".6" />
      <rect x="140" y="12" width="28" height="34" fill="#efe7d8" stroke={EDGE} strokeWidth=".6" strokeDasharray="1.5 1.2" />
      <Scene scene="dawn" x="143" y="15" width="22" height="28" />
      {[64, 78, 92].map((y) => (
        <line key={y} x1="104" y1={y} x2="168" y2={y} stroke={EDGE} strokeWidth=".6" />
      ))}
      <text x="16" y="46" fontFamily={hand} fontSize="15" fill={INK}>
        Half a year.
      </text>
      <text x="16" y="66" fontFamily={hand} fontSize="12" fill={INK} opacity=".75">
        Still here.
      </text>
      {label && <Caps x={16} y={100} size={5.4} anchor="start">{label}</Caps>}
    </Paper>
  );
}

function Mat() {
  return (
    <svg viewBox="0 0 200 100" className="h-full w-full overflow-visible" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={20 + i * 2} y={66 - i * 12} width="160" height="14" rx="5" fill={i % 2 ? "#cbbfab" : "#d8cdb9"} stroke="#9a8e7c" strokeWidth=".6" />
      ))}
      <path d="M60 30 V84 M140 30 V84" stroke="#3a322b" strokeWidth="2.2" />
      <path d="M60 30 C60 22 64 18 70 18" fill="none" stroke="#3a322b" strokeWidth="1.2" />
    </svg>
  );
}

function Bowl() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full overflow-visible" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" opacity=".7">
        <path d="M62 30 C56 22 68 16 62 6" />
        <path d="M80 26 C74 18 86 12 80 2" />
        <path d="M98 30 C92 22 104 16 98 6" />
      </g>
      <path d="M18 50 C22 88 50 102 80 102 C110 102 138 88 142 50 Z" fill="#e6ddcf" stroke="#9f937f" strokeWidth=".8" />
      <ellipse cx="80" cy="50" rx="62" ry="12" fill="#d2c6b3" stroke="#9f937f" strokeWidth=".8" />
      <ellipse cx="80" cy="52" rx="54" ry="8" fill="#b9c0bd" opacity=".55" />
      <path d="M30 70 C50 80 110 80 130 70" fill="none" stroke="#b9ab94" strokeWidth=".7" />
    </svg>
  );
}

function Bib({ label }: { label?: string | null }) {
  return (
    <Paper w={160} h={130}>
      {[12, 148].map((x) => [12, 118].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="none" stroke={EDGE} />))}
      <text x="80" y="80" textAnchor="middle" fontFamily={serif} fontSize="44" fill={INK}>
        {label ?? "30"}
      </text>
    </Paper>
  );
}

function Book({ label }: { label?: string | null }) {
  return (
    <svg viewBox="0 0 140 180" className="h-full w-full overflow-visible" aria-hidden>
      <rect x="8" y="4" width="126" height="172" fill="#3f4a3e" />
      <rect x="4" y="6" width="126" height="172" fill="#2f3a30" />
      {label && (
        <text x="67" y="90" textAnchor="middle" fontFamily={serif} fontSize="8" letterSpacing="3" fill="#e9e3d4">
          {label}
        </text>
      )}
    </svg>
  );
}

// Small things that rest on a place card: a shell, a stone, a sprig.
// Drawn in a 40×40 box, centred on (20, 20).

const SHELL = "#efe8dc";
const LINE = "#7d7164";

export function Motif({ kind, size = 40 }: { kind: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      {renderMotif(kind)}
    </svg>
  );
}

export function renderMotif(kind: string) {
  switch (kind) {
    case "scallop":
      return (
        <g>
          <path d="M20 34 L5 16 Q20 1 35 16 Z" fill={SHELL} stroke={LINE} strokeWidth=".7" strokeLinejoin="round" />
          {[-12, -7, -2.5, 2.5, 7, 12].map((dx) => (
            <path key={dx} d={`M20 34 L${20 + dx} ${9 + Math.abs(dx) * 0.35}`} stroke={LINE} strokeWidth=".45" />
          ))}
          <path d="M16 34 h8 l-1.5 3 h-5 z" fill={SHELL} stroke={LINE} strokeWidth=".6" />
        </g>
      );
    case "cockle":
      return (
        <g>
          <path d="M20 35 C7 35 5 22 8 15 C11 7 29 7 32 15 C35 22 33 35 20 35 Z" fill="#b8745a" stroke="#6f3f2c" strokeWidth=".7" />
          {[-9, -5.5, -2, 2, 5.5, 9].map((dx) => (
            <path key={dx} d={`M20 35 Q${20 + dx * 0.8} 22 ${20 + dx * 1.15} ${10 + Math.abs(dx) * 0.3}`} fill="none" stroke="#f0d8c8" strokeWidth=".7" opacity=".8" />
          ))}
        </g>
      );
    case "auger":
      return (
        <g transform="rotate(-8 20 20)">
          <path d="M20 3 C23 12 26 24 25 36 L15 36 C14 24 17 12 20 3 Z" fill={SHELL} stroke={LINE} strokeWidth=".7" />
          {[9, 14, 19, 24, 29].map((y) => (
            <path key={y} d={`M${16 + (36 - y) * 0.08} ${y} Q20 ${y + 2.6} ${24 - (36 - y) * 0.05} ${y - 1}`} fill="none" stroke={LINE} strokeWidth=".45" />
          ))}
        </g>
      );
    case "limpet":
      return (
        <g>
          <ellipse cx="20" cy="22" rx="15" ry="13" fill="#e6ddd0" stroke={LINE} strokeWidth=".7" />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            return <line key={i} x1="20" y1="21" x2={20 + Math.cos(a) * 14.5} y2={22 + Math.sin(a) * 12.5} stroke="#8b7a6a" strokeWidth=".5" />;
          })}
          <circle cx="20" cy="21" r="3" fill="#f4efe6" stroke={LINE} strokeWidth=".5" />
        </g>
      );
    case "urchin":
      return (
        <g>
          <path d="M6 30 C6 16 34 16 34 30 Z" fill="#d9d2c8" stroke="#6f675d" strokeWidth=".7" />
          {Array.from({ length: 22 }).map((_, i) => {
            const x = 8 + (i % 11) * 2.4;
            const y = 21 + Math.floor(i / 11) * 4 + (i % 2);
            return <circle key={i} cx={x} cy={y + Math.abs(x - 20) * 0.18} r=".7" fill="#6f675d" />;
          })}
          <circle cx="20" cy="18.6" r="1.2" fill="#3d3833" />
        </g>
      );
    case "coral":
      return (
        <g fill="#ece6db" stroke={LINE} strokeWidth=".6">
          <circle cx="15" cy="22" r="7" />
          <circle cx="25" cy="20" r="7.5" />
          <circle cx="20" cy="28" r="6.5" />
          {[
            [15, 22],
            [25, 20],
            [20, 28],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="none" />
              <circle cx={x} cy={y} r="1" fill={LINE} stroke="none" />
            </g>
          ))}
        </g>
      );
    case "sprig":
      return (
        <g stroke="#4f5b47" strokeWidth=".7" fill="none" strokeLinecap="round">
          <path d="M8 34 C16 26 24 16 33 6" />
          {Array.from({ length: 9 }).map((_, i) => {
            const t = i / 9;
            const x = 9 + t * 23;
            const y = 33 - t * 26;
            return (
              <g key={i}>
                <path d={`M${x} ${y} l-5 -1.5`} />
                <path d={`M${x} ${y} l2 4`} />
              </g>
            );
          })}
        </g>
      );
    case "pebble":
      return <ellipse cx="20" cy="24" rx="12" ry="8" fill="#a39c92" stroke="#6b645b" strokeWidth=".6" />;
    case "stone":
    default:
      return (
        <g>
          <path d="M8 27 C8 18 16 14 23 15 C31 16 34 22 32 28 C30 33 11 34 8 27 Z" fill="#8f877c" stroke="#5b544c" strokeWidth=".6" />
          <path d="M14 21 C18 19 22 19 26 21" fill="none" stroke="#b9b1a5" strokeWidth=".6" />
        </g>
      );
  }
}

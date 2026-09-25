// Placeholder photographs: soft, out-of-focus analogue scenes drawn in SVG.
// Replaced by real images as soon as a media asset has a url.

import { useId, type SVGProps } from "react";

type SceneProps = { scene: string } & Omit<SVGProps<SVGSVGElement>, "viewBox">;

export function Scene({ scene, ...rest }: SceneProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden {...rest}>
      <defs>
        <filter id={`soft-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation=".85" />
        </filter>
        <filter id={`glow-${id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 .22 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id={`vig-${id}`} cx="50%" cy="50%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity=".45" />
        </radialGradient>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d6a7a" />
          <stop offset=".55" stopColor="#b9a592" />
          <stop offset="1" stopColor="#e2c49f" />
        </linearGradient>
      </defs>
      <g filter={`url(#soft-${id})`}>{draw(scene, id)}</g>
      <rect width="160" height="120" fill={`url(#vig-${id})`} />
      <rect width="160" height="120" filter={`url(#grain-${id})`} />
    </svg>
  );
}

function draw(scene: string, id: string) {
  switch (scene) {
    case "table":
      return (
        <g>
          <rect width="160" height="120" fill="#2c211a" />
          <path d="M-10 92 L120 -10 L175 20 L40 130 Z" fill="#e6dccb" />
          {[
            [44, 78],
            [70, 58],
            [96, 38],
            [78, 90],
            [104, 70],
            [128, 50],
          ].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="10" ry="7" fill="#f6f1e8" />
              <ellipse cx={x} cy={y} rx="6" ry="4.2" fill="#d8ccb8" />
            </g>
          ))}
          {[
            [60, 72],
            [86, 52],
            [112, 34],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#ffd89a" filter={`url(#glow-${id})`} />
          ))}
          <path d="M40 60 C60 50 90 40 120 44" stroke="#8a9a6f" strokeWidth="3" fill="none" opacity=".7" />
        </g>
      );
    case "candle":
      return (
        <g>
          <rect width="160" height="120" fill="#1b1410" />
          {[
            [40, 52, 16, "#f7c77e"],
            [78, 44, 22, "#ffdca3"],
            [118, 58, 14, "#e9a863"],
            [58, 86, 10, "#c98a4f"],
            [104, 88, 18, "#f2b86f"],
            [140, 30, 9, "#d9975a"],
          ].map(([x, y, r, c], i) => (
            <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={c as string} opacity=".55" filter={`url(#glow-${id})`} />
          ))}
          <rect x="74" y="60" width="8" height="40" fill="#efe4d0" opacity=".85" />
          <ellipse cx="78" cy="54" rx="3" ry="6" fill="#fff1cf" />
        </g>
      );
    case "hands":
      return (
        <g>
          <rect width="160" height="120" fill="#4a3a2e" />
          <rect y="70" width="160" height="50" fill="#dcd0bc" />
          <ellipse cx="54" cy="66" rx="30" ry="13" fill="#c69a7c" transform="rotate(-12 54 66)" />
          <ellipse cx="110" cy="60" rx="28" ry="12" fill="#a87459" transform="rotate(10 110 60)" />
          <ellipse cx="82" cy="62" rx="22" ry="11" fill="#d8b27c" />
          <path d="M66 60 q16 -10 32 0" stroke="#b58a52" strokeWidth="2" fill="none" />
          <circle cx="30" cy="96" r="10" fill="#f3ede3" />
        </g>
      );
    case "road":
      return (
        <g>
          <rect width="160" height="120" fill={`url(#sky-${id})`} />
          <rect y="66" width="160" height="54" fill="#6b5a4a" />
          <path d="M74 66 L86 66 L130 120 L30 120 Z" fill="#9b8f84" />
          <path d="M80 70 L80 76 M80 84 L80 94 M80 102 L80 118" stroke="#e8e0d0" strokeWidth="1.4" />
          <path d="M0 66 Q40 60 70 66 Q110 58 160 64" stroke="#3e352d" strokeWidth="5" fill="none" />
        </g>
      );
    case "dawn":
      return (
        <g>
          <rect width="160" height="120" fill={`url(#sky-${id})`} />
          <circle cx="112" cy="70" r="12" fill="#ffe3b0" filter={`url(#glow-${id})`} />
          <circle cx="112" cy="70" r="7" fill="#fff4d9" />
          <rect y="74" width="160" height="46" fill="#4b3f35" />
          <path d="M0 74 Q30 70 60 74 T160 72" stroke="#2f2822" strokeWidth="4" fill="none" />
          {[20, 34, 46].map((x) => (
            <rect key={x} x={x} y="62" width="2.2" height="14" fill="#231d18" />
          ))}
        </g>
      );
    case "window":
      return (
        <g>
          <rect width="160" height="120" fill="#cfc4b2" />
          <path d="M30 0 L100 0 L130 120 L50 120 Z" fill="#f7efdf" opacity=".95" />
          <path d="M64 0 L78 120 M40 50 L112 58" stroke="#b9ad99" strokeWidth="4" opacity=".7" />
          <path d="M0 96 C40 86 80 104 160 92 L160 120 L0 120 Z" fill="#e9e1d2" />
        </g>
      );
    case "linen":
    default:
      return (
        <g>
          <rect width="160" height="120" fill="#b7a58c" />
          <path d="M10 40 C50 30 90 50 150 36 L150 90 C100 100 60 84 10 96 Z" fill="#ece4d6" />
          <path d="M20 56 C60 48 100 66 140 54 M16 74 C60 66 100 84 146 72" stroke="#cfc3b0" strokeWidth="3" fill="none" />
        </g>
      );
  }
}

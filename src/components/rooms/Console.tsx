import { Photo } from "@/components/photo/Photo";

/**
 * A walnut console by the door, with what always ends up on one: a vase of
 * stems left to dry, a brass dish with somebody's keys, a photograph leaning
 * against the wall.
 */
export function Console({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div aria-hidden className="relative mt-10 h-40 sm:h-48">
        {/* what stands on it */}
        <div className="absolute bottom-3 left-[4%] w-16 sm:w-20">
          <Vase />
        </div>
        <div className="absolute bottom-3 left-[34%] w-24 rotate-[-3deg] sm:w-28" style={{ transformOrigin: "bottom" }}>
          <Photo form="framed" media={{ url: "/house/photos/chapter-0/morning-arch.webp", scene: "window", alt: "" }} aspect="4 / 5" />
        </div>
        <div className="absolute bottom-3 right-[8%] w-24 sm:w-28">
          <KeyDish />
        </div>
        {/* the console top, and its shadow on the wall */}
        <div className="tex-wood absolute inset-x-0 bottom-0 h-3 shadow-[0_18px_24px_-8px_rgba(60,35,15,0.55)]" style={{ backgroundSize: "600px" }} />
        <div className="absolute inset-x-[6%] -bottom-10 h-10 bg-gradient-to-b from-[rgba(60,35,15,0.25)] to-transparent" />
      </div>
    </div>
  );
}

function Vase() {
  return (
    <svg viewBox="0 0 80 190" className="w-full overflow-visible" aria-hidden>
      {/* dried stems, a little past their best */}
      <g fill="none" stroke="#8c6f45" strokeWidth="1.1" strokeLinecap="round">
        <path d="M40 120 C36 80 22 50 10 18" />
        <path d="M40 120 C42 76 48 40 58 6" />
        <path d="M40 120 C44 90 64 64 76 42" />
        <path d="M40 120 C38 96 30 74 24 60" />
      </g>
      {[
        [10, 18, -20],
        [58, 6, 10],
        [76, 42, 40],
        [24, 60, -35],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="15" fill="#d8c3a0" opacity=".85" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {/* a terracotta vase */}
      <path d="M26 118 C18 132 16 160 24 176 C30 186 50 186 56 176 C64 160 62 132 54 118 Z" fill="#a9623f" />
      <path d="M26 118 C18 132 16 160 24 176 C30 186 50 186 56 176 C64 160 62 132 54 118 Z" fill="url(#vaseShade)" />
      <ellipse cx="40" cy="118" rx="14" ry="3.5" fill="#7a4228" />
      <defs>
        <linearGradient id="vaseShade" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function KeyDish() {
  return (
    <svg viewBox="0 0 120 50" className="w-full overflow-visible" aria-hidden>
      <path d="M8 26 C14 44 106 44 112 26 Z" fill="#9e7a3e" />
      <ellipse cx="60" cy="26" rx="52" ry="8" fill="#c9a563" />
      <ellipse cx="60" cy="25" rx="44" ry="5.5" fill="#b08a4a" />
      {/* someone's keys, and a hair tie */}
      <g stroke="#57493a" strokeWidth="1.6" fill="none">
        <circle cx="50" cy="20" r="5" />
        <path d="M54 22 L72 18 M68 18 v4 M72 18 v3" />
      </g>
      <ellipse cx="82" cy="22" rx="6" ry="2.4" fill="none" stroke="#5a2028" strokeWidth="1.6" />
    </svg>
  );
}

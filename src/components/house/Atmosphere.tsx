"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { RoomKey } from "@/lib/domain/types";

// The air of each room: its light, what moves in it, what it is made of.
// Fixed behind the content, cross-fading as you walk from room to room.
// Everything here is decorative and hidden from assistive technology.

export function Atmosphere({ room }: { room: RoomKey }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={room}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 0.61, 0.24, 1] }}
        >
          {AIR[room]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const plate = (src: string, position = "center") => (
  <div className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${src})`, backgroundPosition: position }} />
);

const leaves = (opacity: number, position = "right top") => (
  <div
    className="sway absolute -inset-[4%] bg-no-repeat mix-blend-multiply max-sm:!opacity-[0.16]"
    style={{ backgroundImage: "url(/house/plates/leaves.webp)", backgroundSize: "cover", backgroundPosition: position, opacity }}
  />
);

const vignette = (color: string, strength = 0.55) => (
  <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 50% 40%, transparent 45%, ${color} 100%)`, opacity: strength }} />
);

const AIR: Record<RoomKey, React.ReactNode> = {
  hall: (
    <>
      {plate("/house/plates/hall.webp", "70% 40%")}
      {/* the sun moves across the wall over the afternoon */}
      <div className="drift absolute -inset-[10%]" style={{ background: "radial-gradient(40% 50% at 70% 40%, rgba(255,214,150,0.28), transparent 70%)", mixBlendMode: "soft-light" }} />
      {leaves(0.34)}
      <Dust count={14} region={[55, 10, 40, 70]} />
      {vignette("#6b4f34", 0.35)}
    </>
  ),
  table: (
    <>
      {/* candlelight reaching the edges of the room */}
      <div className="candle absolute inset-0" style={{ background: "radial-gradient(60% 45% at 40% 35%, rgba(255,170,90,0.10), transparent 70%)" }} />
      <div className="candle absolute inset-0" style={{ animationDelay: "-1.7s", background: "radial-gradient(50% 40% at 70% 70%, rgba(255,160,80,0.08), transparent 70%)" }} />
      {vignette("#0c0806", 0.7)}
    </>
  ),
  library: (
    <>
      {plate("/house/plates/library.webp", "left center")}
      <div className="drift absolute -inset-[10%]" style={{ background: "radial-gradient(45% 60% at 15% 35%, rgba(255,255,244,0.35), transparent 70%)", mixBlendMode: "soft-light" }} />
      {leaves(0.1, "left top")}
      <Dust count={16} region={[2, 5, 35, 80]} />
      {vignette("#5b5d4c", 0.3)}
    </>
  ),
  studio: (
    <>
      {plate("/house/plates/studio.webp")}
      {/* a sheer curtain at the edge of the window */}
      <div
        className="curtain tex-linen absolute inset-y-0 left-0 w-[16vw] min-w-24"
        style={{ backgroundColor: "rgba(250,247,240,0.55)", maskImage: "linear-gradient(90deg, black 20%, transparent)", WebkitMaskImage: "linear-gradient(90deg, black 20%, transparent)" }}
      />
      {leaves(0.12, "right top")}
      <Dust count={22} region={[15, 0, 60, 95]} />
      {vignette("#6f6c63", 0.25)}
    </>
  ),
  memory: (
    <>
      <div className="tex-plaster absolute inset-0 opacity-[0.12] mix-blend-overlay" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 45%, rgba(255,205,140,0.16), transparent 70%)" }} />
      {vignette("#0f0a07", 0.8)}
    </>
  ),
  door: vignette("#000000", 0.6),
};

/** Motes of dust turning in a beam of light. Deterministic, so server and client agree. */
export function Dust({ count, region }: { count: number; region: [number, number, number, number] }) {
  const [x0, y0, w, h] = region;
  return (
    <div className="absolute inset-0">
      {Array.from({ length: count }, (_, i) => {
        const r = (n: number) => {
          const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
          return v - Math.floor(v);
        };
        const f = (n: number, d = 2) => n.toFixed(d);
        const size = 1 + r(1) * 2.2;
        return (
          <span
            key={i}
            className="dust"
            style={
              {
                left: `${f(x0 + r(2) * w)}%`,
                top: `${f(y0 + r(3) * h)}%`,
                width: `${f(size)}px`,
                height: `${f(size)}px`,
                filter: size > 2.4 ? "blur(1px)" : undefined,
                animationDuration: `${f(22 + r(4) * 26, 1)}s`,
                animationDelay: `${f(-r(5) * 40, 1)}s`,
                "--dx": `${f((r(6) - 0.4) * 80, 1)}px`,
                "--dy": `${f((r(7) - 0.6) * 120, 1)}px`,
                "--o": f(0.25 + r(8) * 0.5),
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

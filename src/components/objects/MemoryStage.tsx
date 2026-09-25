"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import type { ObjectView } from "@/lib/house/compose";
import { Dust } from "@/components/house/Atmosphere";
import { Photo } from "@/components/photo/Photo";
import { Thread } from "./ObjectArt";
import { MemoryFocus } from "./MemoryFocus";
import { PHYSICAL_ASPECT, Physical } from "./Physical";
import { Traces } from "./Traces";
import { useHeld } from "./useHeld";
import { useMedia } from "@/lib/use-media";

// The Memory Room drawn as a place: a long walnut surface under one lamp.
// Every object lies where it was left (placement x / y / w, in % of the scene),
// with a narrower arrangement for phones. Things placed without coordinates
// find a free spot along the table.

const FEATHER = "linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent), linear-gradient(180deg, transparent, #000 10%, #000 93%, transparent)";

/** Two photographs someone hung above the table. */
function OnTheWall() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute left-[64%] top-[6%] w-[8%] rotate-[-1.5deg]">
        <Photo form="framed" media={{ url: "/house/photos/arch.webp", scene: "window", alt: "" }} aspect="3 / 4" />
      </div>
      <div className="absolute left-[75%] top-[11%] w-[6%] rotate-[1deg]">
        <Photo form="framed" media={{ url: "/house/photos/sea-dawn.webp", scene: "dawn", alt: "" }} aspect="1 / 1" />
      </div>
      {/* the lamp's light falls on the wall too */}
      <div className="absolute inset-x-0 top-0 h-[36%]" style={{ background: "radial-gradient(40% 70% at 50% 100%, rgba(255,200,130,0.14), transparent 70%)" }} />
    </div>
  );
}

type Spot = { x: number; y: number; w: number; r: number };

function spots(objects: ObjectView[], mobile: boolean): Spot[] {
  let auto = 0;
  return objects.map((o) => {
    const p = o.placement;
    const x = mobile ? p.mx : p.x;
    const y = mobile ? p.my : p.y;
    const w = mobile ? p.mw : p.w;
    if (x !== undefined && y !== undefined) return { x, y, w: w ?? (mobile ? 34 : 12), r: p.rotate ?? 0 };
    const k = auto++;
    return mobile
      ? { x: 28 + (k % 2) * 44, y: 30 + Math.floor(k / 2) * 17, w: 32, r: (k % 3) * 4 - 4 }
      : { x: 12 + ((k * 19) % 76), y: 48 + (k % 3) * 16, w: 12, r: (k % 3) * 5 - 5 };
  });
}

export function MemoryStage({ objects, initialOpen }: { objects: ObjectView[]; initialOpen?: string | null }) {
  const { held, pickUp, putBack } = useHeld(objects, initialOpen);
  // Both arrangements are rendered (no layout shift on load); only the visible one takes part in the shared animation.
  const phone = useMedia("(max-width: 767px)");

  const scene = (mobile: boolean) => {
    const at = spots(objects, mobile);
    return (
      <div
        className={`relative w-full overflow-hidden ${mobile ? "aspect-[9/17] md:hidden" : "hidden aspect-[16/10] md:block"}`}
        style={{
          backgroundImage: `url(/house/plates/${mobile ? "memory-portrait" : "memory"}.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          // the scene has no edges: it dissolves into the room
          maskImage: FEATHER,
          WebkitMaskImage: FEATHER,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        {!mobile && <OnTheWall />}
        {/* the lamp, breathing very slightly */}
        <div aria-hidden className="candle pointer-events-none absolute inset-0" style={{ background: "radial-gradient(45% 40% at 52% 55%, rgba(255,200,130,0.16), transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Dust count={mobile ? 12 : 20} region={mobile ? [20, 10, 60, 50] : [35, 5, 35, 55]} />
        </div>
        <Traces room="memory" mobile={mobile} />

        {objects.map((o, i) => {
          const s = at[i];
          const aspect = PHYSICAL_ASPECT[o.kind] ?? 1.3;
          const isHeld = held?.id === o.id;
          return (
            <motion.button
              key={o.id}
              type="button"
              onClick={() => pickUp(o)}
              aria-label={o.state === "sealed" ? `${o.title} — tied with thread` : o.title}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 outline-none ${o.isNew ? "z-[2]" : "z-[1]"}`}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%` }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.12, duration: 1.3, ease: [0.22, 0.61, 0.24, 1] }}
            >
              {/* light gathers a little more on what was recently left */}
              {o.isNew && <span aria-hidden className="lit is-new pointer-events-none absolute inset-0" />}
              {!isHeld && (
                <motion.div
                  layoutId={mobile === phone ? `object-${o.id}` : undefined}
                  className="on-surface relative transition-[filter] duration-700 group-hover:brightness-110 group-focus-visible:brightness-110"
                  style={{ aspectRatio: aspect, rotate: s.r }}
                  transition={{ duration: 0.95, ease: [0.22, 0.61, 0.24, 1] }}
                >
                  <Physical object={o} />
                  {o.state === "sealed" && <Thread tight />}
                </motion.div>
              )}
              {isHeld && <div style={{ aspectRatio: aspect }} />}
              <span className="label pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] text-[#f0e5d4] opacity-0 transition-opacity duration-700 group-hover:opacity-80 group-focus-visible:opacity-80">
                {o.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    );
  };

  return (
    <LayoutGroup>
      <div className="relative mx-auto max-w-[110rem] md:px-6">
        {scene(false)}
        {scene(true)}
      </div>
      <AnimatePresence>{held && <MemoryFocus key={held.id} object={held} onClose={putBack} />}</AnimatePresence>
    </LayoutGroup>
  );
}

import Link from "next/link";
import type { RoomKey } from "@/lib/domain/types";
import type { RoomView } from "@/lib/house/compose";
import { ROOM_PATH } from "@/lib/house/light";

/** Which rooms open onto which, following the plan. */
const ADJACENT: Record<RoomKey, RoomKey[]> = {
  hall: ["table", "memory", "studio", "library", "door"],
  table: ["hall", "library"],
  library: ["memory", "table"],
  memory: ["hall", "library"],
  studio: ["hall", "memory"],
  door: ["hall"],
};

/** Arched openings at the edge of a room. */
export function Doorways({ from, rooms, title = "Through here" }: { from: RoomKey; rooms: RoomView[]; title?: string }) {
  const onward = ADJACENT[from]
    .map((k) => rooms.find((r) => r.key === k && r.state === "open"))
    .filter((r): r is RoomView => !!r);
  if (!onward.length) return null;

  return (
    <nav aria-label={title} className="mx-auto max-w-6xl px-5 pb-28 pt-10 sm:px-10">
      <p className="label muted">{title}</p>
      <ul className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-10 sm:gap-x-14">
        {onward.map((r) => (
          <li key={r.key}>
            <Doorway room={r} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** What you glimpse of each room through its doorway: its light. */
const GLIMPSE: Partial<Record<RoomKey, string>> = {
  hall: "/house/plates/hall.webp",
  table: "/house/photos/chapter-0/table-sunset.webp",
  library: "/house/plates/library.webp",
  studio: "/house/plates/studio.webp",
  memory: "/house/plates/memory.webp",
};

/** A horseshoe arch cut into the wall, with the next room's light inside. */
export function Doorway({ room, size = "sm" }: { room: RoomView; size?: "sm" | "lg" }) {
  const unmarked = room.key === "door";
  const w = size === "lg" ? 84 : 50;
  const h = size === "lg" ? 134 : 80;
  const id = `arch-${room.key}-${size}`;
  const glimpse = GLIMPSE[room.key];
  return (
    <Link href={ROOM_PATH[room.key]} className="group flex flex-col items-center gap-4 text-center" aria-label={unmarked ? "A door that wasn’t there before" : room.name}>
      <svg width={w} height={h} viewBox="0 0 60 96" className="overflow-visible" aria-hidden>
        <defs>
          <clipPath id={id}>
            <path d="M10 96 V48 A26 26 0 1 1 50 48 V96 Z" />
          </clipPath>
        </defs>
        {/* the depth of the wall */}
        <path d="M7 96 V48 A29 29 0 1 1 53 48 V96" fill="none" stroke="currentColor" strokeOpacity=".22" strokeWidth="3" />
        <g clipPath={`url(#${id})`}>
          <rect width="60" height="96" fill={unmarked ? "#0c0806" : "#2a1f18"} />
          {glimpse && (
            <image
              href={glimpse}
              x="-30"
              y="-10"
              width="120"
              height="120"
              preserveAspectRatio="xMidYMid slice"
              className="opacity-80 transition-[opacity,transform] duration-1000 group-hover:opacity-100"
            />
          )}
          {/* the reveal: shadow on the inner edge of the arch */}
          <path d="M10 96 V48 A26 26 0 1 1 50 48" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="5" />
          {unmarked && <rect x="10" y="90" width="40" height="6" fill="var(--room-glow)" className="flicker" />}
        </g>
        <path d="M10 96 V48 A26 26 0 1 1 50 48 V96" fill="none" stroke="currentColor" strokeWidth={unmarked ? 0.8 : 0.9} strokeDasharray={unmarked ? "2 2.4" : undefined} opacity=".7" />
      </svg>
      <span className="label opacity-70 transition-opacity group-hover:opacity-100">{unmarked ? "—" : room.name.replace(/^The /, "")}</span>
    </Link>
  );
}

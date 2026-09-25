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
      <div className="rule mb-10 border-t" />
      <p className="caps muted">{title}</p>
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

export function Doorway({ room, size = "sm" }: { room: RoomView; size?: "sm" | "lg" }) {
  const unmarked = room.key === "door";
  const w = size === "lg" ? 76 : 44;
  const h = size === "lg" ? 124 : 72;
  return (
    <Link href={ROOM_PATH[room.key]} className="group flex flex-col items-center gap-4 text-center" aria-label={unmarked ? "A door that wasn’t there before" : room.name}>
      <svg width={w} height={h} viewBox="0 0 44 72" className="overflow-visible" aria-hidden>
        <path d="M2 72 V22 A20 20 0 0 1 42 22 V72" fill="none" stroke="currentColor" strokeWidth={unmarked ? 0.8 : 1} strokeDasharray={unmarked ? "2 2.4" : undefined} />
        {/* light spilling from the next room */}
        <path
          d="M5 72 V23 A17 17 0 0 1 39 23 V72 Z"
          fill="var(--room-glow)"
          className={`opacity-0 transition-opacity duration-700 group-hover:opacity-25 group-focus-visible:opacity-25 ${unmarked ? "flicker !opacity-20" : ""}`}
        />
        {unmarked && <rect x="4" y="70" width="36" height="2" fill="var(--room-glow)" className="flicker" />}
      </svg>
      <span className="caps text-[0.62rem] opacity-75 transition-opacity group-hover:opacity-100">
        {unmarked ? "—" : room.name.replace(/^The /, "")}
      </span>
    </Link>
  );
}

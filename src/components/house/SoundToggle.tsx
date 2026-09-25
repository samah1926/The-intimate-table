"use client";

import { useEffect, useRef, useState } from "react";
import type { RoomKey } from "@/lib/domain/types";
import { AMBIENCE, RoomSound } from "@/lib/house/ambience";

/**
 * Off until someone turns it on. Never autoplays, and never remembered across
 * visits: sound is something you choose each time you come in.
 */
export function SoundToggle({ room }: { room: RoomKey }) {
  const [on, setOn] = useState(false);
  const ctx = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const current = useRef<RoomSound | null>(null);

  // Cross-fade when walking into another room.
  useEffect(() => {
    if (!on || !ctx.current || !master.current) return;
    const next = new RoomSound(ctx.current, AMBIENCE[room], master.current);
    current.current?.stop();
    current.current = next;
    void next.start();
  }, [room, on]);

  useEffect(
    () => () => {
      current.current?.stop(0.3);
      void ctx.current?.close();
    },
    [],
  );

  const toggle = () => {
    if (!on) {
      ctx.current ??= new AudioContext();
      if (!master.current) {
        master.current = ctx.current.createGain();
        master.current.gain.value = 0.9;
        master.current.connect(ctx.current.destination);
      }
      void ctx.current.resume();
      setOn(true);
    } else {
      current.current?.stop();
      current.current = null;
      setOn(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className="label pointer-events-auto flex items-center gap-2.5 opacity-60 transition-opacity duration-500 hover:opacity-100"
    >
      <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
        {[0.5, 0.9, 0.65, 1, 0.55].map((h, i) => (
          <rect
            key={i}
            x={i * 3.8}
            y={0}
            width="1.2"
            height="12"
            rx="0.6"
            fill="currentColor"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: `scaleY(${on ? h : 0.14})`,
              transition: "transform 900ms cubic-bezier(.22,.61,.24,1)",
            }}
          />
        ))}
      </svg>
      <span className="hidden sm:inline">{on ? "Sound on" : "Sound off"}</span>
      <span className="sr-only sm:hidden">{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

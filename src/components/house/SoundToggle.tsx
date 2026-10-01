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
    <button type="button" onClick={toggle} aria-pressed={on} className="meta text-[0.62rem] muted transition-opacity hover:opacity-60">
      {on ? "Sound — on" : "Sound — off"}
    </button>
  );
}

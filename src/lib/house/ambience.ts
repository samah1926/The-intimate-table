// Ambient sound for each room. Presence, never entertainment.
//
// Nothing plays until a person turns sound on. Each room names a recorded
// file (drop it in /public/house/sound/) and, until that exists, a quiet
// synthesised stand-in built from filtered noise.

import type { RoomKey } from "@/lib/domain/types";

export type Layer =
  | { kind: "file"; src: string; gain: number }
  | { kind: "tone"; lowpass: number; gain: number } // room tone: the sound of a quiet space
  | { kind: "air"; band: number; gain: number; rate: number } // wind, leaves, distant sea
  | { kind: "crackle"; gain: number; density: number } // vinyl, a candle
  | { kind: "clink"; gain: number; every: [number, number] }; // glass, a plate set down, far away

export interface Ambience {
  /** A real recording, when there is one. Used instead of the stand-in. */
  file?: string;
  layers: Layer[];
}

/** Add `file: "/house/sound/<room>.mp3"` to a room once a recording exists. */
export const AMBIENCE: Record<RoomKey, Ambience> = {
  hall: { layers: [{ kind: "tone", lowpass: 380, gain: 0.05 }, { kind: "air", band: 900, gain: 0.018, rate: 0.07 }] },
  table: {
   
    layers: [
      { kind: "tone", lowpass: 260, gain: 0.06 },
      { kind: "crackle", gain: 0.012, density: 3 },
      { kind: "clink", gain: 0.02, every: [7, 19] },
    ],
  },
  library: { layers: [{ kind: "tone", lowpass: 320, gain: 0.04 }, { kind: "air", band: 600, gain: 0.008, rate: 0.04 }] },
  studio: { layers: [{ kind: "tone", lowpass: 420, gain: 0.035 }, { kind: "air", band: 1400, gain: 0.03, rate: 0.11 }] },
  memory: { layers: [{ kind: "tone", lowpass: 240, gain: 0.05 }, { kind: "crackle", gain: 0.03, density: 9 }] },
  door: { layers: [{ kind: "air", band: 300, gain: 0.03, rate: 0.05 }] },
};

// ── engine ─────────────────────────────────────────────────────────────

function noiseBuffer(ctx: AudioContext, seconds = 4, brown = false) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = white;
  }
  return buf;
}

async function fileExists(src: string) {
  try {
    const r = await fetch(src, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

/** One room's sound, fading in and out. */
export class RoomSound {
  private out: GainNode;
  private stops: (() => void)[] = [];

  constructor(
    private ctx: AudioContext,
    private ambience: Ambience,
    destination: AudioNode,
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(destination);
  }

  async start(fade = 2.5) {
    const { ctx } = this;
    if (this.ambience.file && (await fileExists(this.ambience.file))) {
      const el = new Audio(this.ambience.file);
      el.loop = true;
      el.crossOrigin = "anonymous";
      const src = ctx.createMediaElementSource(el);
      src.connect(this.out);
      void el.play();
      this.stops.push(() => el.pause());
    } else {
      for (const layer of this.ambience.layers) this.layer(layer);
    }
    this.out.gain.setTargetAtTime(1, ctx.currentTime, fade / 3);
  }

  stop(fade = 1.8) {
    const { ctx } = this;
    this.out.gain.setTargetAtTime(0, ctx.currentTime, fade / 3);
    setTimeout(() => {
      this.stops.forEach((s) => s());
      this.out.disconnect();
    }, fade * 1000 + 200);
  }

  private layer(l: Layer) {
    const { ctx } = this;
    if (l.kind === "file") return;
    if (l.kind === "tone" || l.kind === "air") {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer(ctx, 6, l.kind === "tone");
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = l.kind === "tone" ? "lowpass" : "bandpass";
      filter.frequency.value = l.kind === "tone" ? l.lowpass : l.band;
      filter.Q.value = l.kind === "tone" ? 0.5 : 0.8;
      const g = ctx.createGain();
      g.gain.value = l.gain;
      src.connect(filter).connect(g).connect(this.out);
      if (l.kind === "air") {
        // gusts: a very slow swell
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.frequency.value = l.rate;
        depth.gain.value = l.gain * 0.8;
        lfo.connect(depth).connect(g.gain);
        lfo.start();
        this.stops.push(() => lfo.stop());
      }
      src.start();
      this.stops.push(() => src.stop());
    }
    if (l.kind === "crackle") {
      const buf = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        if (Math.random() < l.density / ctx.sampleRate) {
          const amp = Math.random() * 0.9;
          for (let k = 0; k < 40 && i + k < d.length; k++) d[i + k] += amp * Math.exp(-k / 6) * (Math.random() * 2 - 1);
        }
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1200;
      const g = ctx.createGain();
      g.gain.value = l.gain;
      src.connect(hp).connect(g).connect(this.out);
      src.start();
      this.stops.push(() => src.stop());
    }
    if (l.kind === "clink") {
      let timer: ReturnType<typeof setTimeout>;
      const ring = () => {
        const t = ctx.currentTime;
        const f = 1800 + Math.random() * 1600;
        [1, 2.76, 5.4].forEach((m, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = f * m;
          g.gain.setValueAtTime(l.gain / (i + 1), t);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2 / (i + 1));
          o.connect(g).connect(this.out);
          o.start(t);
          o.stop(t + 1.3);
        });
        timer = setTimeout(ring, (l.every[0] + Math.random() * (l.every[1] - l.every[0])) * 1000);
      };
      timer = setTimeout(ring, 2500);
      this.stops.push(() => clearTimeout(timer));
    }
  }
}

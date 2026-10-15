"use client";
// Small game sounds made with Web Audio (no files). Quiet by design; off in the sales-page demo phone.

let enabled = true;
let muted = false;
let ctx: AudioContext | null = null;
export const setSfx = (on: boolean) => {
  enabled = on;
  if (!on) music.stop();
};
try {
  muted = typeof localStorage !== "undefined" && localStorage.getItem("patt-mute") === "1";
} catch {}
const muteFns = new Set<(m: boolean) => void>();
export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("patt-mute", m ? "1" : "0");
  } catch {}
  if (m) music.stop();
  muteFns.forEach((f) => f(m));
}
export const onMute = (f: (m: boolean) => void) => (muteFns.add(f), () => void muteFns.delete(f));

function ac(): AudioContext | null {
  if (!enabled || muted || typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, len: number, { type = "sine", vol = 0.12, at = 0, slide = 0, abs, out }: { type?: OscillatorType; vol?: number; at?: number; slide?: number; abs?: number; out?: AudioNode } = {}) {
  const a = ac();
  if (!a) return;
  const t = abs ?? a.currentTime + at;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + len);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(out ?? a.destination);
  o.start(t);
  o.stop(t + len + 0.05);
}

let noiseBuf: AudioBuffer | null = null;
function noise(len: number, { vol = 0.08, at = 0, hp = 1200, lp, abs, out }: { vol?: number; at?: number; hp?: number; lp?: number; abs?: number; out?: AudioNode } = {}) {
  const a = ac();
  if (!a) return;
  const t = abs ?? a.currentTime + at;
  if (!noiseBuf) {
    noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = noiseBuf;
  f.type = lp ? "lowpass" : "highpass";
  f.frequency.value = lp ?? hp;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(f).connect(g).connect(out ?? a.destination);
  s.start(t, Math.random() * 0.5, len + 0.02);
}

export const sfx = {
  tap: () => tone(660, 0.06, { type: "triangle", vol: 0.06 }),
  swipe: () => noise(0.18, { vol: 0.05, hp: 2500 }),
  correct: () => (tone(660, 0.12, { type: "triangle" }), tone(990, 0.18, { type: "triangle", at: 0.09 })),
  wrong: () => tone(220, 0.25, { type: "sawtooth", vol: 0.05, slide: -80 }),
  coin: () => (tone(988, 0.07, { type: "square", vol: 0.04 }), tone(1319, 0.12, { type: "square", vol: 0.04, at: 0.06 })),
  jump: () => tone(300, 0.18, { type: "triangle", vol: 0.07, slide: 500 }),
  crash: () => (noise(0.4, { vol: 0.12, hp: 200 }), tone(120, 0.35, { type: "sawtooth", vol: 0.06, slide: -60 })),
  kick: () => (noise(0.08, { vol: 0.12, hp: 400 }), tone(140, 0.1, { vol: 0.12, slide: -60 })),
  goal: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, { type: "triangle", vol: 0.09, at: i * 0.09 })),
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, { type: "triangle", vol: 0.08, at: i * 0.1 })),
  engine: (rpm: number) => tone(60 + rpm * 80, 0.06, { type: "sawtooth", vol: 0.015 }),
  pop: () => tone(520 + Math.random() * 300, 0.09, { type: "sine", vol: 0.1, slide: 600 }),
  slice: () => (noise(0.16, { vol: 0.09, hp: 3000 }), tone(1800, 0.08, { type: "sine", vol: 0.03, slide: -900 })),
  splat: () => (noise(0.22, { vol: 0.14, lp: 900 }), tone(180, 0.15, { vol: 0.08, slide: -90 })),
  boom: () => (noise(0.8, { vol: 0.25, lp: 500 }), tone(90, 0.7, { type: "sawtooth", vol: 0.1, slide: -60 })),
  flap: () => (noise(0.1, { vol: 0.07, lp: 1400 }), tone(420, 0.08, { type: "triangle", vol: 0.05, slide: 240 })),
  thud: () => (tone(110, 0.18, { vol: 0.16, slide: -50 }), noise(0.08, { vol: 0.06, lp: 600 })),
  perfect: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.12, { type: "square", vol: 0.035, at: i * 0.05 })),
  bounce: () => tone(260, 0.12, { type: "sine", vol: 0.12, slide: 140 }),
  rim: () => tone(1250, 0.25, { type: "triangle", vol: 0.06, slide: -200 }),
  swish: () => (noise(0.35, { vol: 0.08, hp: 1800 }), [659, 880, 1319].forEach((f, i) => tone(f, 0.14, { type: "triangle", vol: 0.06, at: 0.12 + i * 0.07 }))),
  combo: (n: number) => tone(523 * 2 ** (Math.min(n, 12) / 12), 0.12, { type: "square", vol: 0.04 }),
  count: (last = false) => tone(last ? 1047 : 523, last ? 0.35 : 0.12, { type: "square", vol: 0.05 }),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.22, { type: "triangle", vol: 0.08, at: i * 0.14 })),
};

/* ---------- Background music: tiny chiptune loops, scheduled ahead on the audio clock ---------- */

type Song = { bpm: number; lead: number[]; bass: number[]; drums: string; leadType?: OscillatorType; swing?: number };
const _ = 0;
// 32 sixteenth-note steps per loop. Notes are MIDI numbers; 0 is a rest. Drums: k = kick, s = snare, h = hat.
export const SONGS: Record<string, Song> = {
  desert: {
    bpm: 132, leadType: "square",
    lead: [74, _, 77, _, 79, _, 81, 79, 77, _, 74, _, 72, _, 74, _, 74, _, 77, _, 79, _, 82, 81, 79, _, 77, _, 74, _, _, _],
    bass: [50, _, 50, 62, 50, _, 50, 62, 48, _, 48, 60, 48, _, 48, 60, 46, _, 46, 58, 46, _, 46, 58, 45, _, 45, 57, 45, _, 57, _],
    drums: "k.h.s.h.k.hkshh.k.h.s.h.k.hks.ss",
  },
  sunny: {
    bpm: 120, leadType: "triangle",
    lead: [72, _, 76, _, 79, _, 76, _, 77, _, 81, _, 79, _, _, _, 76, _, 79, _, 84, _, 83, _, 81, _, 79, _, 76, _, _, _],
    bass: [48, _, 55, _, 48, _, 55, _, 53, _, 60, _, 53, _, 60, _, 52, _, 59, _, 52, _, 59, _, 55, _, 62, _, 55, _, 62, _],
    drums: "k.h.s.h.k.h.s.h.k.h.s.h.k.hks.sh",
  },
  sky: {
    bpm: 112, leadType: "square",
    lead: [79, _, _, 76, _, 74, _, 72, _, _, 74, _, 76, _, _, _, 77, _, _, 76, _, 74, _, 72, _, _, 71, _, 72, _, _, _],
    bass: [48, _, _, _, 55, _, _, _, 45, _, _, _, 52, _, _, _, 41, _, _, _, 48, _, _, _, 43, _, _, _, 50, _, _, _],
    drums: "k...h...s...h...k...h...s...h.hh",
  },
  arena: {
    bpm: 140, leadType: "sawtooth",
    lead: [69, _, 72, 69, 76, _, 74, 72, 69, _, 72, 69, 79, _, 76, _, 69, _, 72, 69, 76, _, 74, 72, 71, _, 72, 74, 76, _, _, _],
    bass: [45, 45, _, 45, 45, _, 45, _, 41, 41, _, 41, 41, _, 41, _, 43, 43, _, 43, 43, _, 43, _, 40, 40, _, 40, 44, _, 44, _],
    drums: "k.hsk.hsk.hsk.hsk.hsk.hsk.hskss",
  },
};

const hz = (n: number) => 440 * 2 ** ((n - 69) / 12);
let timer: ReturnType<typeof setInterval> | null = null;
let musicBus: GainNode | null = null;

export const music = {
  play(name: keyof typeof SONGS) {
    music.stop();
    const a = ac();
    if (!a) return;
    const song = SONGS[name];
    const bus = a.createGain();
    bus.gain.value = 0.55;
    bus.connect(a.destination);
    musicBus = bus;
    const step = 60 / song.bpm / 4;
    let next = a.currentTime + 0.08, i = 0;
    const schedule = () => {
      while (next < a.currentTime + 0.2) {
        const n = i % 32, ln = song.lead[n], bn = song.bass[n], dr = song.drums[n];
        if (ln) tone(hz(ln), step * 1.6, { type: song.leadType, vol: 0.035, abs: next, out: bus });
        if (bn) tone(hz(bn), step * 1.8, { type: "triangle", vol: 0.09, abs: next, out: bus });
        if (dr === "k") tone(150, 0.16, { vol: 0.22, slide: -110, abs: next, out: bus });
        if (dr === "s") noise(0.12, { vol: 0.07, hp: 1500, abs: next, out: bus });
        if (dr === "h") noise(0.03, { vol: 0.03, hp: 7000, abs: next, out: bus });
        next += step;
        i++;
      }
    };
    schedule();
    timer = setInterval(schedule, 40);
  },
  stop() {
    if (timer) clearInterval(timer);
    timer = null;
    if (musicBus && ctx) {
      const g = musicBus;
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      setTimeout(() => g.disconnect(), 400);
    }
    musicBus = null;
  },
};

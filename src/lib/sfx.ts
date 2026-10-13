"use client";
// Small game sounds made with Web Audio (no files). Quiet by design; off in the sales-page demo phone.

let enabled = true;
let ctx: AudioContext | null = null;
export const setSfx = (on: boolean) => (enabled = on);

function ac(): AudioContext | null {
  if (!enabled || typeof window === "undefined") return null;
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

function tone(freq: number, len: number, { type = "sine", vol = 0.12, at = 0, slide = 0 }: { type?: OscillatorType; vol?: number; at?: number; slide?: number } = {}) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + len);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + len + 0.05);
}

function noise(len: number, { vol = 0.08, at = 0, hp = 1200 }: { vol?: number; at?: number; hp?: number } = {}) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + at;
  const b = a.createBuffer(1, Math.ceil(a.sampleRate * len), a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b;
  f.type = "highpass";
  f.frequency.value = hp;
  g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination);
  s.start(t);
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
};

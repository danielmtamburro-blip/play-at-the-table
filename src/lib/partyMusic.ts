"use client";
// Party music made on the phone with Web Audio: a piano arrangement of Happy Birthday (the tune is public domain)
// with bass, chords, a light beat and a little room echo. No audio files, nothing to license.

const F: Record<string, number> = {};
["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].forEach((n, i) => {
  for (let o = 1; o <= 6; o++) F[`${n}${o}`] = 440 * 2 ** ((o - 4) + (i - 9) / 12);
});

type Ctx = { ac: AudioContext; out: GainNode };

function makeCtx(): Ctx | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ac = new AC();
  const out = ac.createGain();
  out.gain.value = 0.9;
  // Short, soft reverb from a decaying noise impulse.
  const len = ac.sampleRate * 1.6, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  const verb = ac.createConvolver();
  verb.buffer = ir;
  const wet = ac.createGain();
  wet.gain.value = 0.22;
  out.connect(ac.destination);
  out.connect(verb).connect(wet).connect(ac.destination);
  return { ac, out };
}

/** A soft piano-like note. */
function piano({ ac, out }: Ctx, freq: number, t: number, len: number, vol: number) {
  const g = ac.createGain();
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2400 + freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0008, t + Math.max(0.6, len) + 0.9);
  g.connect(lp).connect(out);
  [
    [1, 1],
    [2, 0.32],
    [3, 0.12],
    [4, 0.05],
  ].forEach(([h, a]) => {
    const o = ac.createOscillator();
    o.type = h === 1 ? "triangle" : "sine";
    o.frequency.value = freq * h;
    o.detune.value = (Math.random() - 0.5) * 6;
    const og = ac.createGain();
    og.gain.value = a;
    o.connect(og).connect(g);
    o.start(t);
    o.stop(t + len + 1.6);
  });
}

function kick({ ac, out }: Ctx, t: number) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.3);
}

function shaker({ ac, out }: Ctx, t: number, vol = 0.06) {
  const len = 0.06 * ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ac.createBufferSource(), hp = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = b;
  hp.type = "highpass";
  hp.frequency.value = 6500;
  g.gain.value = vol;
  s.connect(hp).connect(g).connect(out);
  s.start(t);
}

const CHORDS: Record<string, string[]> = {
  C: ["C3", "E4", "G4", "C5"],
  F: ["F2", "F4", "A4", "C5"],
  G: ["G2", "D4", "G4", "B4"],
  G7: ["G2", "D4", "F4", "B4"],
};

/** One syllable of the song: note, length in beats, words to show. */
export type Syllable = { n: string; b: number; w: string; line: number };

export function birthdaySong(name: string): Syllable[] {
  const who = name.trim() || "you";
  const L = (line: number, notes: [string, number, string][]) => notes.map(([n, b, w]) => ({ n, b, w, line }));
  return [
    ...L(0, [["G4", 0.75, "Hap-"], ["G4", 0.25, "py"], ["A4", 1, "birth-"], ["G4", 1, "day"], ["C5", 1, "to"], ["B4", 2, "you,"]]),
    ...L(1, [["G4", 0.75, "Hap-"], ["G4", 0.25, "py"], ["A4", 1, "birth-"], ["G4", 1, "day"], ["D5", 1, "to"], ["C5", 2, "you,"]]),
    ...L(2, [["G4", 0.75, "Hap-"], ["G4", 0.25, "py"], ["G5", 1, "birth-"], ["E5", 1, "day"], ["C5", 1, "dear"], ["B4", 1, who], ["A4", 1, ""]]),
    ...L(3, [["F5", 0.75, "Hap-"], ["F5", 0.25, "py"], ["E5", 1, "birth-"], ["C5", 1, "day"], ["D5", 1, "to"], ["C5", 3, "you! 🎉"]]),
  ];
}

// Waltz harmony per bar (3 beats each), starting after the one-beat pickup.
const BARS = ["C", "G", "G", "C", "C", "F", "C|G7", "C"];

/**
 * Play Happy Birthday. Calls onWord(i) as each syllable starts and onEnd() at the end.
 * Returns a stop function.
 */
export function playBirthday(name: string, onWord: (i: number) => void, onEnd: () => void, bpm = 104): () => void {
  const ctx = makeCtx();
  if (!ctx) return () => {};
  const beat = 60 / bpm;
  const t0 = ctx.ac.currentTime + 0.15;
  const song = birthdaySong(name);
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Melody
  let t = t0;
  song.forEach((s, i) => {
    piano(ctx, F[s.n], t, s.b * beat, 0.3);
    timers.push(setTimeout(() => onWord(i), (t - ctx.ac.currentTime) * 1000));
    t += s.b * beat;
  });
  // Accompaniment: bass on 1, chord on 2 and 3, kick and shaker for a gentle beat.
  BARS.forEach((bar, i) => {
    const start = t0 + beat * (1 + i * 3);
    const parts = bar.split("|");
    for (let k = 0; k < 3; k++) {
      const ch = CHORDS[parts.length > 1 && k === 2 ? parts[1] : parts[0]];
      const at = start + k * beat;
      if (k === 0) (piano(ctx, F[ch[0]], at, beat * 1.5, 0.22), kick(ctx, at));
      else ch.slice(1).forEach((n) => piano(ctx, F[n], at, beat * 0.8, 0.07));
      shaker(ctx, at);
      shaker(ctx, at + beat / 2, 0.035);
    }
  });
  // Final chord
  const end = t0 + beat * (1 + BARS.length * 3);
  CHORDS.C.forEach((n) => piano(ctx, F[n], end - beat * 3, beat * 3, 0.1));
  timers.push(setTimeout(onEnd, (end - ctx.ac.currentTime + 1.2) * 1000));

  return () => {
    timers.forEach(clearTimeout);
    ctx.ac.close().catch(() => {});
  };
}

/** A short, bright celebration flourish for other occasions. */
export function playFanfare(onEnd: () => void): () => void {
  const ctx = makeCtx();
  if (!ctx) return () => {};
  const t0 = ctx.ac.currentTime + 0.1, b = 0.16;
  const notes: [string, number][] = [["C5", 0], ["E5", 1], ["G5", 2], ["C6", 3], ["G5", 5], ["C6", 6]];
  notes.forEach(([n, at]) => piano(ctx, F[n], t0 + at * b, at === 6 ? 1.6 : 0.3, 0.28));
  ["C3", "E4", "G4", "C5"].forEach((n) => piano(ctx, F[n], t0 + 6 * b, 1.8, 0.1));
  [0, 2, 4, 6].forEach((k) => (kick(ctx, t0 + k * b), shaker(ctx, t0 + k * b)));
  const t = setTimeout(onEnd, 2600);
  return () => {
    clearTimeout(t);
    ctx.ac.close().catch(() => {});
  };
}

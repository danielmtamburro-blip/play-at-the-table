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

/* ---------- Kids' groove and lullaby (original arrangements; Brahms' lullaby is public domain) ---------- */

function synth({ ac, out }: Ctx, freq: number, t: number, len: number, vol: number, type: OscillatorType = "square", cutoff = 2200) {
  const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
  o.type = type;
  o2.type = type;
  o.frequency.value = freq;
  o2.frequency.value = freq * 1.005; // slight detune makes it fuller
  f.type = "lowpass";
  f.frequency.setValueAtTime(cutoff, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(300, cutoff * 0.35), t + len);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0008, t + len + 0.08);
  o.connect(f);
  o2.connect(f);
  f.connect(g).connect(out);
  o.start(t);
  o2.start(t);
  o.stop(t + len + 0.1);
  o2.stop(t + len + 0.1);
}

function clap({ ac, out }: Ctx, t: number, vol = 0.12) {
  const len = 0.12 * ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const s = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = b;
  bp.type = "bandpass";
  bp.frequency.value = 1500;
  g.gain.value = vol;
  s.connect(bp).connect(g).connect(out);
  s.start(t);
}

/** Calls schedule(barStart, barIndex) one bar ahead, forever, until stopped. */
function loopBars(ctx: Ctx, barLen: number, schedule: (t: number, bar: number) => void) {
  let bar = 0, next = ctx.ac.currentTime + 0.12, alive = true, timer: ReturnType<typeof setTimeout>;
  const tick = () => {
    if (!alive) return;
    while (next < ctx.ac.currentTime + barLen * 1.5) (schedule(next, bar), (next += barLen), bar++);
    timer = setTimeout(tick, (barLen * 1000) / 2);
  };
  tick();
  return () => {
    alive = false;
    clearTimeout(timer);
    ctx.ac.close().catch(() => {});
  };
}

/** Marimba-like lead: a warm wooden tone with a quick, round decay. Friendly for little ears. */
function marimba({ ac, out }: Ctx, freq: number, t: number, len: number, vol: number) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0008, t + Math.min(0.9, len * 2.2) + 0.15);
  g.connect(out);
  [[1, 1, "sine"], [4, 0.18, "sine"], [2, 0.12, "triangle"]].forEach(([h, a, type]) => {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = type as OscillatorType;
    o.frequency.value = freq * (h as number);
    og.gain.setValueAtTime(a as number, t);
    if (h === 4) og.gain.exponentialRampToValueAtTime(0.0005, t + 0.12); // bright "tok" at the start only
    o.connect(og).connect(g);
    o.start(t);
    o.stop(t + 1.2);
  });
}

/** Glassy bell for the counter-melody and sparkles. */
function bell({ ac, out }: Ctx, freq: number, t: number, vol: number) {
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0006, t + 1.4);
  g.connect(out);
  [[1, 1], [2.76, 0.35], [5.4, 0.12]].forEach(([h, a]) => {
    const o = ac.createOscillator(), og = ac.createGain();
    o.type = "sine";
    o.frequency.value = freq * h;
    og.gain.value = a;
    o.connect(og).connect(g);
    o.start(t);
    o.stop(t + 1.5);
  });
}

/** Soft sustained pad that fills out the chorus. */
function pad({ ac, out }: Ctx, freqs: number[], t: number, len: number, vol: number) {
  const g = ac.createGain(), f = ac.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1400;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.25);
  g.gain.setValueAtTime(vol, t + len - 0.2);
  g.gain.linearRampToValueAtTime(0.0001, t + len + 0.3);
  f.connect(g).connect(out);
  freqs.forEach((fr) =>
    [-7, 7].forEach((det) => {
      const o = ac.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = fr;
      o.detune.value = det;
      o.connect(f);
      o.start(t);
      o.stop(t + len + 0.4);
    }),
  );
}

/** Round, warm bass note. */
function bass({ ac, out }: Ctx, freq: number, t: number, len: number, vol: number) {
  const o = ac.createOscillator(), s = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
  o.type = "sine";
  s.type = "sawtooth";
  o.frequency.value = freq;
  s.frequency.value = freq;
  f.type = "lowpass";
  f.frequency.setValueAtTime(700, t);
  f.frequency.exponentialRampToValueAtTime(220, t + len);
  const sg = ac.createGain();
  sg.gain.value = 0.35;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + len + 0.05);
  o.connect(g);
  s.connect(sg).connect(f).connect(g);
  g.connect(out);
  [o, s].forEach((x) => (x.start(t), x.stop(t + len + 0.1)));
}

function snare(ctx: Ctx, t: number, vol = 0.16) {
  clap(ctx, t, vol);
  const { ac, out } = ctx, o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(240, t);
  o.frequency.exponentialRampToValueAtTime(140, t + 0.08);
  g.gain.setValueAtTime(vol * 0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.15);
}

// "Fruit Party": an original song. Chords per bar, then an 8th-note melody per bar ("" = rest, "~" = hold).
const C = ["C3", "E4", "G4", "C5"], Am = ["A2", "C4", "E4", "A4"], Fm = ["F2", "C4", "F4", "A4"], G = ["G2", "D4", "G4", "B4"], Em = ["E2", "B3", "E4", "G4"];
type Bar = { ch: string[]; mel: string[]; part: "intro" | "verse" | "chorus" | "break" };
const bars = (part: Bar["part"], chords: string[][], mels: string[][]): Bar[] => chords.map((ch, i) => ({ ch, mel: mels[i] ?? [], part }));
const VERSE = bars("verse", [C, Am, Fm, G, C, Am, Fm, G], [
  ["C5", "", "E5", "G5", "~", "E5", "D5", ""],
  ["C5", "", "E5", "A5", "~", "G5", "E5", ""],
  ["F5", "", "E5", "D5", "~", "C5", "A4", ""],
  ["B4", "", "D5", "G5", "~", "F5", "D5", "B4"],
  ["C5", "", "E5", "G5", "~", "E5", "D5", ""],
  ["C5", "", "E5", "A5", "~", "B5", "C6", ""],
  ["A5", "", "G5", "F5", "~", "E5", "D5", ""],
  ["D5", "E5", "F5", "G5", "~", "~", "", ""],
]);
const CHORUS = bars("chorus", [Fm, G, Em, Am, Fm, G, C, C], [
  ["C6", "", "A5", "C6", "~", "A5", "G5", ""],
  ["B5", "", "G5", "B5", "~", "G5", "F5", ""],
  ["E5", "", "G5", "B5", "~", "G5", "E5", ""],
  ["A5", "~", "", "G5", "A5", "", "C6", ""],
  ["C6", "", "A5", "C6", "~", "A5", "G5", ""],
  ["B5", "", "G5", "B5", "~", "D6", "C6", "B5"],
  ["C6", "", "G5", "E5", "~", "G5", "C6", ""],
  ["C6", "~", "~", "~", "", "", "", ""],
]);
const INTRO = bars("intro", [C, Am, Fm, G], []);
const BREAK = bars("break", [Fm, G, Em, G], [[], [], [], ["G5", "", "G5", "", "G5", "G5", "G5", "G5"]]);
// Intro once, then verse, chorus, verse, chorus, clap-along break, chorus, and round again from the verse.
const SONG: Bar[] = [...INTRO, ...VERSE, ...CHORUS, ...VERSE, ...CHORUS, ...BREAK, ...CHORUS];
const LOOP_FROM = INTRO.length;

/** "Fruit Party", the dancing fruit's song. onBeat(n) fires on every beat so the characters dance in time. */
export function playGroove(onBeat: (beat: number) => void, bpm = 120): () => void {
  const ctx = makeCtx();
  if (!ctx) return () => {};
  const beat = 60 / bpm, eighth = beat / 2;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const stop = loopBars(ctx, beat * 4, (t, n) => {
    const i = n < SONG.length ? n : LOOP_FROM + ((n - LOOP_FROM) % (SONG.length - LOOP_FROM));
    const { ch, mel, part } = SONG[i];
    const nextPart = SONG[i + 1]?.part ?? "verse";
    const fill = nextPart !== part; // last bar of a section gets a drum fill
    for (let b = 0; b < 4; b++) {
      const at = t + b * beat;
      // Drums: soft hats in the intro, full beat after, claps only in the break.
      if (part === "break") clap(ctx, at, b % 2 ? 0.2 : 0.12);
      else if (part !== "intro") {
        kick(ctx, at);
        if (b % 2) snare(ctx, at, part === "chorus" ? 0.18 : 0.14);
      }
      shaker(ctx, at + eighth, part === "chorus" ? 0.07 : 0.05);
      if (part !== "break") shaker(ctx, at, 0.025);
      // Bass bounces root and octave; the intro just plays the chords on bells.
      if (part === "intro") bell(ctx, F[ch[1 + (b % 3)]] * 2, at, 0.05);
      else {
        bass(ctx, F[ch[0]], at, eighth * 0.9, 0.2);
        bass(ctx, F[ch[0]] * 2, at + eighth, eighth * 0.7, 0.1);
        if (part !== "break") ch.slice(1).forEach((x) => piano(ctx, F[x], at + eighth, eighth * 0.8, 0.028));
      }
      const ms = (at - ctx.ac.currentTime) * 1000;
      timers.push(setTimeout(() => onBeat(n * 4 + b), Math.max(0, ms)));
    }
    if (fill && part !== "intro") [3, 3.25, 3.5, 3.75].forEach((x, k) => snare(ctx, t + x * beat, 0.07 + k * 0.03));
    if (part === "chorus") pad(ctx, ch.slice(1).map((x) => F[x]), t, beat * 4, 0.018);
    // Melody on marimba; held notes ("~") just let the previous note ring.
    mel.forEach((x, k) => {
      if (!x || x === "~") return;
      let held = 1;
      while (mel[k + held] === "~") held++;
      marimba(ctx, F[x], t + k * eighth, held * eighth, part === "chorus" ? 0.2 : 0.17);
      if (part === "chorus" && k % 4 === 0) bell(ctx, F[x] * 2, t + k * eighth, 0.035); // sparkle doubles the hook
    });
  });
  return () => (timers.forEach(clearTimeout), stop());
}

const BRAHMS: [string, number][] = [
  ["E4", 1], ["E4", 1], ["G4", 3], ["E4", 1], ["E4", 1], ["G4", 3],
  ["E4", 1], ["G4", 1], ["C5", 2], ["B4", 2], ["A4", 2], ["A4", 1], ["G4", 3],
  ["D4", 1], ["E4", 1], ["F4", 2], ["D4", 2], ["D4", 1], ["E4", 1], ["F4", 3],
  ["D4", 1], ["F4", 1], ["B4", 1], ["A4", 1], ["G4", 2], ["B4", 2], ["C5", 6],
];
const LULLABY_BASS = ["C3", "C3", "C3", "G2", "G2", "G2", "G2", "C3"];

/** Soft piano lullaby with gentle chords, on repeat. */
export function playLullaby(bpm = 72): () => void {
  const ctx = makeCtx();
  if (!ctx) return () => {};
  ctx.out.gain.value = 0.7;
  const beat = 60 / bpm, total = BRAHMS.reduce((a, [, b]) => a + b, 0);
  return loopBars(ctx, total * beat, (t) => {
    let at = t;
    for (const [n, b] of BRAHMS) (piano(ctx, F[n], at, b * beat, 0.16), (at += b * beat));
    LULLABY_BASS.forEach((n, i) => {
      const bt = t + i * (total / 8) * beat;
      piano(ctx, F[n], bt, (total / 8) * beat, 0.08);
      piano(ctx, F[n] * 2.5, bt + beat, beat * 2, 0.03);
    });
  });
}

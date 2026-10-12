"use client";
// For babies and toddlers: huge buttons, spoken prompts, gentle music. Nothing is recorded or sent.
import { useEffect, useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import type { Lang } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { GameHead } from "./Engines";

/* ---------- Speech and music helpers ---------- */

function say(text: string, lang: Lang) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-SA" : "en-GB";
    u.rate = 0.85;
    u.pitch = 1.25;
    s.speak(u);
  } catch {}
}

const NOTE: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
};
// Public-domain tunes: [note, beats]
const TWINKLE: [string, number][] = [
  ["C4", 1], ["C4", 1], ["G4", 1], ["G4", 1], ["A4", 1], ["A4", 1], ["G4", 2],
  ["F4", 1], ["F4", 1], ["E4", 1], ["E4", 1], ["D4", 1], ["D4", 1], ["C4", 2],
  ["G4", 1], ["G4", 1], ["F4", 1], ["F4", 1], ["E4", 1], ["E4", 1], ["D4", 2],
  ["G4", 1], ["G4", 1], ["F4", 1], ["F4", 1], ["E4", 1], ["E4", 1], ["D4", 2],
];
const LULLABY: [string, number][] = [
  ["E4", 1], ["E4", 1], ["G4", 3], ["E4", 1], ["E4", 1], ["G4", 3],
  ["E4", 1], ["G4", 1], ["C5", 2], ["B4", 2], ["A4", 2], ["A4", 1], ["G4", 3],
  ["D4", 1], ["E4", 1], ["F4", 2], ["D4", 2], ["D4", 1], ["E4", 1], ["F4", 3],
  ["D4", 1], ["F4", 1], ["B4", 1], ["A4", 1], ["G4", 2], ["B4", 2], ["C5", 4],
];

/** Loops a soft music-box tune until stopped. */
function useMusicBox(tune: [string, number][], bpm: number) {
  const ctx = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [on, setOn] = useState(false);

  const stop = () => {
    clearTimeout(timer.current);
    ctx.current?.close().catch(() => {});
    ctx.current = null;
    setOn(false);
  };
  const start = () => {
    stop();
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    ctx.current = ac;
    const beat = 60 / bpm;
    const total = tune.reduce((a, [, b]) => a + b, 0) * beat;
    const play = () => {
      if (ctx.current !== ac) return;
      let t = ac.currentTime + 0.05;
      for (const [n, b] of tune) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = "triangle";
        o.frequency.value = NOTE[n] * 2;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + b * beat * 0.95 + 0.4);
        o.connect(g).connect(ac.destination);
        o.start(t);
        o.stop(t + b * beat + 0.5);
        t += b * beat;
      }
      timer.current = setTimeout(play, total * 1000 + 400);
    };
    play();
    setOn(true);
  };
  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { on, toggle: () => (on ? stop() : start()) };
}

/** A short cheerful "boing" when a fruit is tapped. */
function boing() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC(), o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(300, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.18);
    g.gain.setValueAtTime(0.2, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.32);
    setTimeout(() => ac.close().catch(() => {}), 500);
  } catch {}
}

const UI: Record<Lang, Record<string, string>> = {
  en: {
    who: "Who says", again: "Hear it again", yes: "Yes!", says: "says", tryAgain: "Try again!", music: "Music", stop: "Stop",
    tapFruit: "Tap a fruit to make it jump!", calmTip: "Turn the brightness down and hold the phone a little way from baby's eyes.", noise: "Shh sound",
  },
  ar: {
    who: "من يقول", again: "اسمعها مرة أخرى", yes: "أحسنت!", says: "تقول", tryAgain: "حاول مرة أخرى!", music: "موسيقى", stop: "إيقاف",
    tapFruit: "اضغط على فاكهة لتقفز!", calmTip: "خفّف سطوع الشاشة وأبعد الهاتف قليلاً عن عيني الطفل.", noise: "صوت هادئ",
  },
};

/* ---------- Animal sounds (ages 2+) ---------- */

const ANIMALS: { e: string; n: Record<Lang, string>; s: Record<Lang, string> }[] = [
  { e: "🐄", n: { en: "cow", ar: "البقرة" }, s: { en: "Moo", ar: "مووو" } },
  { e: "🐶", n: { en: "dog", ar: "الكلب" }, s: { en: "Woof woof", ar: "هاو هاو" } },
  { e: "🐱", n: { en: "cat", ar: "القطة" }, s: { en: "Meow", ar: "مياو" } },
  { e: "🦆", n: { en: "duck", ar: "البطة" }, s: { en: "Quack quack", ar: "كواك كواك" } },
  { e: "🐑", n: { en: "sheep", ar: "الخروف" }, s: { en: "Baa", ar: "ماااع" } },
  { e: "🐷", n: { en: "pig", ar: "الخنزير" }, s: { en: "Oink oink", ar: "أوينك أوينك" } },
  { e: "🦁", n: { en: "lion", ar: "الأسد" }, s: { en: "Roar", ar: "زئير" } },
  { e: "🐸", n: { en: "frog", ar: "الضفدع" }, s: { en: "Ribbit", ar: "نق نق" } },
  { e: "🐓", n: { en: "rooster", ar: "الديك" }, s: { en: "Cock a doodle doo", ar: "كوكوكوكو" } },
  { e: "🦉", n: { en: "owl", ar: "البومة" }, s: { en: "Hoo hoo", ar: "هوو هوو" } },
  { e: "🐴", n: { en: "horse", ar: "الحصان" }, s: { en: "Neigh", ar: "صهيل" } },
  { e: "🐘", n: { en: "elephant", ar: "الفيل" }, s: { en: "Toot toot", ar: "توت توت" } },
];

export function AnimalSounds({ k }: { k: string }) {
  const { lang } = useGuest();
  const ui = UI[lang];
  const make = () => {
    const four = shuffle(ANIMALS).slice(0, 4);
    return { four, target: four[Math.floor(Math.random() * 4)] };
  };
  const [r, setR] = useState(make);
  const [hit, setHit] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const ask = (t = r.target) => say(`${ui.who} ${t.s[lang]}?`, lang);
  useEffect(() => {
    if (!hit) ask();
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(a: (typeof ANIMALS)[number]) {
    if (hit) return;
    if (a === r.target) {
      setHit(a.e);
      setStars((s) => s + 1);
      buzz(HAPTIC.win);
      say(`${ui.yes} ${lang === "ar" ? a.n.ar : `The ${a.n.en}`} ${ui.says} ${a.s[lang]}!`, lang);
      setTimeout(() => (setHit(null), setR(make())), 2200);
    } else {
      setWrong(a.e);
      buzz(HAPTIC.tap);
      say(`${a.s[lang]}! ${ui.tryAgain}`, lang);
      setTimeout(() => setWrong(null), 600);
    }
  }

  return (
    <>
      <GameHead k={k} />
      <button className="tod-ask" onClick={() => ask()}>
        <span aria-hidden="true">🔊</span>
        <b>
          {ui.who} “{r.target.s[lang]}”?
        </b>
        <small>{ui.again}</small>
      </button>
      <div className="tod-grid">
        {r.four.map((a) => (
          <button
            key={a.e}
            className={`tod-animal${hit === a.e ? " hit" : ""}${wrong === a.e ? " wiggle" : ""}${hit && hit !== a.e ? " dim" : ""}`}
            onClick={() => pick(a)}
            aria-label={a.n[lang]}
          >
            {a.e}
          </button>
        ))}
      </div>
      <p className="tod-stars" aria-label={`${stars}`}>
        {"⭐".repeat(Math.min(stars, 10))}
      </p>
    </>
  );
}

/* ---------- Dancing fruit (babies and toddlers) ---------- */

const FRUIT = ["🍓", "🍌", "🍉", "🍍", "🥝", "🍊", "🍇"];

export function DancingFruit({ k }: { k: string }) {
  const { lang } = useGuest();
  const ui = UI[lang];
  const music = useMusicBox(TWINKLE, 108);
  const [jump, setJump] = useState<Record<number, number>>({});
  return (
    <>
      <GameHead k={k} />
      <div className={`fruit-stage${music.on ? " playing" : ""}`}>
        <span className="fruit-sparkles" aria-hidden="true" />
        {FRUIT.map((f, i) => (
          <button
            key={`${i}-${jump[i] ?? 0}`}
            className={`fruit${jump[i] ? " jump" : ""}`}
            style={{ animationDelay: `${(i * 0.17).toFixed(2)}s` }}
            onClick={() => (boing(), buzz(HAPTIC.tap), setJump((j) => ({ ...j, [i]: (j[i] ?? 0) + 1 })))}
            aria-label={f}
          >
            <span className="fruit-body">{f}</span>
            <span className="fruit-face" aria-hidden="true">
              <i />
              <i />
              <em />
            </span>
          </button>
        ))}
      </div>
      <p className="g-sub" style={{ textAlign: "center" }}>
        {ui.tapFruit}
      </p>
      <button className="g-btn" onClick={music.toggle}>
        {music.on ? `⏸ ${ui.stop}` : `🎵 ${ui.music}`}
      </button>
    </>
  );
}

/* ---------- Sleepy lights (newborns) ---------- */

export function SleepyLights({ k }: { k: string }) {
  const { lang } = useGuest();
  const ui = UI[lang];
  const music = useMusicBox(LULLABY, 66);
  const noise = useRef<{ ac: AudioContext } | null>(null);
  const [shh, setShh] = useState(false);

  function toggleNoise() {
    if (noise.current) {
      noise.current.ac.close().catch(() => {});
      noise.current = null;
      return setShh(false);
    }
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AC();
      // Soft brown noise, like a gentle "shhh".
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < d.length; i++) (last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02), (d[i] = last * 3.5);
      const src = ac.createBufferSource(), g = ac.createGain();
      src.buffer = buf;
      src.loop = true;
      g.gain.value = 0.35;
      src.connect(g).connect(ac.destination);
      src.start();
      noise.current = { ac };
      setShh(true);
    } catch {}
  }
  useEffect(() => () => void noise.current?.ac.close().catch(() => {}), []);

  return (
    <>
      <GameHead k={k} />
      <div className="calm-stage" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`calm-orb o${i}`} />
        ))}
        <span className="calm-moon">🌙</span>
      </div>
      <div className="g-row">
        <button className="g-btn" onClick={music.toggle}>
          {music.on ? `⏸ ${ui.stop}` : `🎵 ${ui.music}`}
        </button>
        <button className="g-btn alt" onClick={toggleNoise}>
          {shh ? `⏸ ${ui.stop}` : `🌊 ${ui.noise}`}
        </button>
      </div>
      <p className="g-note">{ui.calmTip}</p>
    </>
  );
}

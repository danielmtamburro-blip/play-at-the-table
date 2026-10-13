"use client";
// For babies and toddlers: huge buttons, spoken prompts, gentle music. Nothing is recorded or sent.
import { useEffect, useRef, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import type { Lang } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { GameHead } from "./Engines";
import { playGroove, playLullaby } from "@/lib/partyMusic";

/* ---------- Speech and music helpers ---------- */

// Phones ship several voices; the "enhanced"/"natural" ones sound like a real person. Novelty voices are skipped.
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;
function bestVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const all = window.speechSynthesis?.getVoices() ?? [];
  const want = lang === "ar" ? /^ar/i : /^en[-_](GB|US|AU|IE)/i;
  const ok = all.filter((v) => want.test(v.lang) && !NOVELTY.test(v.name));
  const score = (v: SpeechSynthesisVoice) =>
    (/premium|enhanced|natural|neural/i.test(v.name) ? 4 : 0) + (/google|samantha|serena|daniel|kate|karen|moira|siri/i.test(v.name) ? 2 : 0) + (/en[-_]GB/i.test(v.lang) ? 1 : 0);
  return ok.sort((a, b) => score(b) - score(a))[0];
}

function say(text: string, lang: Lang) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = bestVoice(lang);
    if (v) u.voice = v;
    u.lang = v?.lang ?? (lang === "ar" ? "ar-SA" : "en-GB");
    // A normal speaking voice: natural pitch, just a touch slower for little ones.
    u.rate = 0.95;
    u.pitch = 1;
    s.speak(u);
  } catch {}
}

const NOTE: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25,
  F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5,
};
/** Loops a soft music-box tune until stopped. */
export function useMusicBox(tune: [string, number][], bpm: number, loop = true) {
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
      if (loop) timer.current = setTimeout(play, total * 1000 + 400);
      else timer.current = setTimeout(() => setOn(false), total * 1000 + 400);
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

/** A rising swoosh of air as a fruit takes off. */
function whoosh() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC(), t = ac.currentTime, len = 0.7;
    const b = ac.createBuffer(1, len * ac.sampleRate, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = b;
    f.type = "bandpass";
    f.Q.value = 3;
    f.frequency.setValueAtTime(400, t);
    f.frequency.exponentialRampToValueAtTime(2600, t + 0.35);
    f.frequency.exponentialRampToValueAtTime(900, t + len);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    s.connect(f).connect(g).connect(ac.destination);
    s.start(t);
    setTimeout(() => ac.close().catch(() => {}), 900);
  } catch {}
}

const UI: Record<Lang, Record<string, string>> = {
  en: {
    who: "Who says", again: "Hear it again", yes: "Yes!", says: "says", tryAgain: "Try again!", music: "Music", stop: "Stop",
    tapFruit: "Tap a fruit to send it flying!", tapMe: "Tap me!", calmTip: "Turn the brightness down and hold the phone a little way from baby's eyes.", noise: "Shh sound",
  },
  ar: {
    who: "من يقول", again: "اسمعها مرة أخرى", yes: "أحسنت!", says: "تقول", tryAgain: "حاول مرة أخرى!", music: "موسيقى", stop: "إيقاف",
    tapFruit: "اضغط على فاكهة لتطير!", tapMe: "اضغط عليّ!", calmTip: "خفّف سطوع الشاشة وأبعد الهاتف قليلاً عن عيني الطفل.", noise: "صوت هادئ",
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
  const { lang, demo } = useGuest();
  const ui = UI[lang];
  const make = () => {
    const four = shuffle(ANIMALS).slice(0, 4);
    return { four, target: four[Math.floor(Math.random() * 4)] };
  };
  const [r, setR] = useState(make);
  const [hit, setHit] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  // No talking in the sales-page demo phone.
  const speak = (text: string) => !demo && say(text, lang);
  const ask = (t = r.target) => speak(`${ui.who} ${t.s[lang]}?`);
  // Some browsers load their voice list late; asking for it early means the first question uses the nice voice.
  useEffect(() => void window.speechSynthesis?.getVoices(), []);
  useEffect(() => {
    if (!hit) ask();
  }, [r]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(a: (typeof ANIMALS)[number]) {
    if (hit) return;
    if (a === r.target) {
      setHit(a.e);
      setStars((s) => s + 1);
      buzz(HAPTIC.win);
      speak(`${ui.yes} ${lang === "ar" ? a.n.ar : `The ${a.n.en}`} ${ui.says} ${a.s[lang]}!`);
      setTimeout(() => (setHit(null), setR(make())), 2200);
    } else {
      setWrong(a.e);
      buzz(HAPTIC.tap);
      speak(`${a.s[lang]}! ${ui.tryAgain}`);
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
            data-right={demo && a === r.target ? "" : undefined}
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

type FruitKind = "strawberry" | "banana" | "orange" | "melon" | "pineapple";

/** The body of each fruit character, drawn on a 100×100 grid (face and limbs are shared). */
function FruitBody({ kind, id }: { kind: FruitKind; id: string }) {
  switch (kind) {
    case "strawberry":
      return (
        <>
          <defs>
            <radialGradient id={`${id}g`} cx=".35" cy=".3" r=".8">
              <stop offset="0" stopColor="#FF7A85" />
              <stop offset="1" stopColor="#D7193A" />
            </radialGradient>
          </defs>
          <path d="M50 96C24 82 12 56 18 38c6-16 22-18 32-12 10-6 26-4 32 12 6 18-6 44-32 58z" fill={`url(#${id}g)`} />
          {[[34, 46], [52, 40], [66, 50], [42, 62], [60, 66], [50, 80], [30, 58], [70, 36]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="1.6" ry="2.6" fill="#FFE27A" />
          ))}
          <path d="M50 28c-8-10-20-8-24-4 8 0 12 4 14 8-6-2-14 0-16 4 10-2 18 0 26-2 8 2 16 0 26 2-2-4-10-6-16-4 2-4 6-8 14-8-4-4-16-6-24 4z" fill="#2FA552" />
        </>
      );
    case "banana":
      return (
        <>
          <defs>
            <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFF08A" />
              <stop offset="1" stopColor="#F5C400" />
            </linearGradient>
          </defs>
          <path d="M26 14c-6 30 0 60 22 76 14 10 30 8 34 4-22-6-40-30-42-78z" fill={`url(#${id}g)`} />
          <path d="M26 14l-2-8 6 2z" fill="#7A5A1E" />
          <path d="M82 94l6 2-4-6z" fill="#7A5A1E" />
        </>
      );
    case "orange":
      return (
        <>
          <defs>
            <radialGradient id={`${id}g`} cx=".35" cy=".3" r=".8">
              <stop offset="0" stopColor="#FFC56E" />
              <stop offset="1" stopColor="#F07A12" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="56" r="38" fill={`url(#${id}g)`} />
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx={30 + ((i * 17) % 42)} cy={34 + ((i * 23) % 46)} r="1.1" fill="#E06A0A" opacity=".6" />
          ))}
          <path d="M50 18c6-8 16-8 20-4-6 4-12 6-20 4z" fill="#2FA552" />
          <path d="M50 18v-6" stroke="#6B4A2A" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "melon":
      return (
        <>
          <path d="M8 34h84a42 42 0 0 1-84 0z" fill="#2E9E55" />
          <path d="M14 34h72a36 36 0 0 1-72 0z" fill="#FFFFFF" opacity=".9" />
          <path d="M18 34h64a32 32 0 0 1-64 0z" fill="#FF5A78" />
          {[[34, 44], [50, 48], [66, 44], [42, 56], [58, 56]].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2" ry="3.2" fill="#2B1B1B" />
          ))}
        </>
      );
    case "pineapple":
      return (
        <>
          <defs>
            <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFD84D" />
              <stop offset="1" stopColor="#E89A1A" />
            </linearGradient>
          </defs>
          <path d="M50 0l6 16 10-12-2 18 14-6-10 14H32L22 16l14 6-2-18 10 12z" fill="#2FA552" />
          <ellipse cx="50" cy="60" rx="30" ry="36" fill={`url(#${id}g)`} />
          <path d="M28 40l44 44M24 56l34 34M36 30l40 40M72 40L28 84M76 56L42 90M64 30L24 70" stroke="#C47A12" strokeWidth="1.6" opacity=".55" />
        </>
      );
  }
}

const FRUITS: { kind: FruitKind; face: [number, number] }[] = [
  { kind: "strawberry", face: [50, 56] },
  { kind: "banana", face: [44, 54] },
  { kind: "orange", face: [50, 58] },
  { kind: "melon", face: [50, 42] },
  { kind: "pineapple", face: [50, 62] },
];
const MOVES = ["bounce", "wave", "twist", "jump"] as const;

function FruitCharacter({ kind, face, move, idx, onTap }: { kind: FruitKind; face: [number, number]; move: string; idx: number; onTap: () => void }) {
  const id = `fr${idx}`;
  const [fx, fy] = face;
  return (
    <button className={`fc fc-${move}`} style={{ animationDelay: `${idx * 0.06}s` }} onClick={onTap} aria-label={kind}>
      <svg viewBox="0 -6 100 130" aria-hidden="true">
        {/* legs and shoes */}
        <g className="fc-legs">
          <path className="fc-leg l" d="M40 88v22" />
          <path className="fc-leg r" d="M60 88v22" />
          <ellipse cx="37" cy="112" rx="7" ry="4" fill="#3B2F7A" />
          <ellipse cx="63" cy="112" rx="7" ry="4" fill="#3B2F7A" />
        </g>
        {/* arms */}
        <path className="fc-arm l" d="M22 58q-12 4-16-8" />
        <path className="fc-arm r" d="M78 58q12 4 16-8" />
        <g className="fc-body">
          <FruitBody kind={kind} id={id} />
          {/* face */}
          <g className="fc-eyes">
            <ellipse cx={fx - 9} cy={fy - 6} rx="6" ry="7" fill="#fff" />
            <ellipse cx={fx + 9} cy={fy - 6} rx="6" ry="7" fill="#fff" />
            <circle className="fc-pupil" cx={fx - 8} cy={fy - 5} r="3.4" fill="#1B1740" />
            <circle className="fc-pupil" cx={fx + 10} cy={fy - 5} r="3.4" fill="#1B1740" />
            <circle cx={fx - 7} cy={fy - 7} r="1.2" fill="#fff" />
            <circle cx={fx + 11} cy={fy - 7} r="1.2" fill="#fff" />
          </g>
          <ellipse cx={fx - 16} cy={fy + 4} rx="4" ry="2.5" fill="#FF8FB1" opacity=".7" />
          <ellipse cx={fx + 16} cy={fy + 4} rx="4" ry="2.5" fill="#FF8FB1" opacity=".7" />
          <path className="fc-mouth" d={`M${fx - 8} ${fy + 4}q8 9 16 0`} fill="#7A1F2B" />
        </g>
      </svg>
    </button>
  );
}

/** A random loop through the air for a tapped fruit: three waypoints, then home. */
function flightPath(): Record<string, string> {
  const r = (a: number, b: number) => `${Math.round(a + Math.random() * (b - a))}px`;
  return { "--x1": r(-100, 100), "--y1": r(-150, -90), "--x2": r(-110, 110), "--y2": r(-110, -40), "--x3": r(-80, 80), "--y3": r(-160, -100) };
}

export function DancingFruit({ k }: { k: string }) {
  const { lang } = useGuest();
  const ui = UI[lang];
  const [beat, setBeat] = useState(-1);
  const [fly, setFly] = useState<Record<number, Record<string, string> | null>>({});
  const [taps, setTaps] = useState(0);
  const [hint, setHint] = useState(1);
  const stopRef = useRef<() => void>(() => {});
  useEffect(() => () => stopRef.current(), []);
  // The "Tap me!" bubble hops to a different fruit every few seconds until they've tapped a few.
  useEffect(() => {
    if (taps >= 3) return;
    const t = setInterval(() => setHint((h) => (h + 2) % FRUITS.length), 3200);
    return () => clearInterval(t);
  }, [taps]);
  const playing = beat >= 0;
  const toggle = () => {
    if (playing) return stopRef.current(), setBeat(-1);
    setBeat(0);
    stopRef.current = playGroove(setBeat);
  };
  function tap(i: number) {
    if (fly[i]) return;
    whoosh();
    buzz(HAPTIC.tap);
    setTaps((n) => n + 1);
    setFly((s) => ({ ...s, [i]: flightPath() }));
    setTimeout(() => (boing(), setFly((s) => ({ ...s, [i]: null }))), 1500);
  }
  // Change dance move every two beats; everyone dances together, with a small ripple.
  const move = playing ? MOVES[Math.floor(beat / 2) % MOVES.length] : "idle";
  return (
    <>
      <GameHead k={k} />
      <div className={`fruit-party${playing ? " on" : ""}`} data-beat={beat % 2}>
        <span className="fp-lights" aria-hidden="true" />
        <span className="fp-stars" aria-hidden="true" />
        <div className="fp-row">
          {FRUITS.map((f, i) => (
            <div key={i} className={`fp-slot${fly[i] ? " flying" : ""}`} style={{ ["--d" as string]: `${i * 0.05}s`, ...(fly[i] ?? {}) }}>
              {taps < 3 && hint === i && !fly[i] && (
                <span className="fp-tap" aria-hidden="true">
                  {ui.tapMe}
                </span>
              )}
              <FruitCharacter kind={f.kind} face={f.face} idx={i} move={fly[i] ? "spin" : move} onTap={() => tap(i)} />
              <span className="fp-floor" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
      <p className="g-sub" style={{ textAlign: "center" }}>
        {ui.tapFruit}
      </p>
      <button className="g-btn" onClick={toggle}>
        {playing ? `⏸ ${ui.stop}` : `🎵 ${ui.music}`}
      </button>
    </>
  );
}

/* ---------- Sleepy lights (newborns) ---------- */

export function SleepyLights({ k }: { k: string }) {
  const { lang } = useGuest();
  const ui = UI[lang];
  const [lull, setLull] = useState(false);
  const lullStop = useRef<() => void>(() => {});
  useEffect(() => () => lullStop.current(), []);
  const music = { on: lull, toggle: () => (lull ? (lullStop.current(), setLull(false)) : ((lullStop.current = playLullaby()), setLull(true))) };
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

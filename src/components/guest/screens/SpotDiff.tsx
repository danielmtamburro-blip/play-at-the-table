"use client";
// Spot the difference: a fresh picture every round. Kids get 5 bigger differences, adults 7 sneaky ones.
import { useEffect, useMemo, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import type { Lang } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { GameHead } from "./Engines";
import { ArtBackdrop, ArtObject, makeArtPuzzle, type ArtItem } from "./spotArt";

const UI: Record<Lang, Record<string, string>> = {
  en: { found: "Found", tap: "Tap the differences on either picture", hint: "Hint", all: "You found them all! 🎉", again: "New picture", time: "Time", misses: "Misses" },
  ar: { found: "وجدت", tap: "اضغط على الفروق في أي من الصورتين", hint: "تلميح", all: "وجدتها كلها! 🎉", again: "صورة جديدة", time: "الوقت", misses: "أخطاء" },
};

type Level = "kids" | "adults";
type Item = { e: string; x: number; y: number; s: number; flip?: boolean; rot?: number };
type Diff = { i: number; x: number; y: number; kind: "swap" | "gone" | "size" | "flip" | "rot" | "shift" };

const W = 300, H = 190;
const SCENES: Record<Level, { bg: [string, string]; ground: string; items: string[] }[]> = {
  kids: [
    { bg: ["#BDE7FF", "#E8F7FF"], ground: "#9BE07A", items: ["🌳", "🌸", "🐶", "🐱", "🦋", "🐞", "⚽", "🎈", "🍎", "🐦", "🌼", "🍄", "🐸", "🚲", "🪁", "🐰"] },
    { bg: ["#FFE7B8", "#FFF6E2"], ground: "#F5C77E", items: ["🏖️", "🐚", "🦀", "🐠", "⛱️", "🍦", "🪣", "🐬", "🌴", "🦩", "⭐", "🐢", "🏐", "🛟", "🍉", "🐙"] },
    { bg: ["#2B2470", "#5A4FCF"], ground: "#3B2F8F", items: ["🚀", "🪐", "⭐", "🌙", "👽", "🛸", "☄️", "🌍", "🛰️", "🔭", "🌟", "👩‍🚀", "🌕", "✨", "🌎", "🪨"] },
  ],
  // Adults use the illustrated scenes in spotArt.tsx; these emoji sets are a fallback.
  adults: [
    { bg: ["#F7EBDD", "#FFF8F0"], ground: "#E3CFB4", items: ["☕", "🥐", "🍰", "🍓", "🍋", "🌿", "📖", "🕯️", "🍷", "🧁", "🍪", "🥂", "🌹", "🧂", "🍯", "🫖", "🥖", "🍇", "🧀", "🍴", "🥄", "🍒", "🫒", "🥨", "🍩", "🌷"] },
    { bg: ["#D9F2EC", "#F2FBF8"], ground: "#B8E3D6", items: ["🌵", "🪴", "🌿", "🍃", "🌻", "🌷", "🌼", "🍀", "🐝", "🐌", "🦋", "🐞", "🪨", "🍄", "🌱", "🪺", "🐛", "🌾", "🍂", "🐜", "🌺", "💐", "🥀", "🌳", "🐿️", "🦔"] },
  ],
};
// Swaps that are hard to notice, for the adult level.
const SIMILAR: Record<string, string> = {
  "☕": "🍵", "🍓": "🍒", "🍒": "🍓", "🍋": "🍊", "🌹": "🌷", "🌷": "🌹", "🥐": "🥯", "🍷": "🍸", "🧁": "🍩", "🍩": "🥯", "🍪": "🥮", "🥂": "🍾",
  "🌻": "🌼", "🌼": "🌻", "🐝": "🪲", "🐞": "🪲", "🍀": "☘️", "🍃": "🌿", "🌿": "🍃", "🌱": "🌿", "🍂": "🍁", "🌺": "🌸", "🐜": "🐞", "🐿️": "🦫",
};

function makePuzzle(level: Level) {
  const scene = shuffle(SCENES[level])[0];
  const [cols, rows] = level === "kids" ? [5, 3] : [7, 4];
  const cw = W / cols, ch = (H - 18) / rows;
  const cells = shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, level === "kids" ? 14 : 26);
  const pool = shuffle(scene.items);
  const items: Item[] = cells.map((c, n) => ({
    e: pool[n % pool.length],
    x: (c % cols) * cw + cw / 2 + (Math.random() - 0.5) * cw * 0.35,
    y: Math.floor(c / cols) * ch + ch / 2 + 6 + (Math.random() - 0.5) * ch * 0.3,
    s: level === "kids" ? 28 + Math.random() * 6 : 17 + Math.random() * 5,
  }));
  const kinds: Diff["kind"][] = level === "kids" ? ["swap", "gone", "size", "swap", "gone"] : ["swap", "swap", "gone", "size", "flip", "rot", "shift"];
  const picks = shuffle(items.map((_, i) => i)).slice(0, kinds.length);
  const changed = items.map((it) => ({ ...it }));
  // Emojis not in the picture yet, used once each for swaps.
  const spare = [...pool.filter((e) => !items.some((x) => x.e === e)), "⭐", "🌙", "❤️", "🎁", "🔔"];
  const diffs: Diff[] = picks.map((i, n) => {
    const kind = kinds[n], it = changed[i];
    if (kind === "swap") it.e = level === "adults" && SIMILAR[it.e] ? SIMILAR[it.e] : spare.shift() ?? "⭐";
    if (kind === "gone") it.e = "";
    if (kind === "size") it.s = level === "kids" ? it.s * 1.55 : it.s * 0.72;
    if (kind === "flip") it.flip = true;
    if (kind === "rot") it.rot = 35;
    if (kind === "shift") it.x += 9;
    return { i, x: items[i].x, y: items[i].y, kind };
  });
  // Flipping a symmetric emoji shows nothing, so swap those instead.
  diffs.forEach((d) => {
    if (d.kind === "flip" && ["🍩", "🧁", "🍪", "🌼", "⭐", "🍀", "🪨", "🍯"].includes(items[d.i].e)) {
      changed[d.i].flip = false;
      changed[d.i].e = SIMILAR[items[d.i].e] ?? "🍋";
    }
  });
  return { scene, items, changed, diffs, radius: Math.max(cw, ch) * 0.55 };
}

type Spot = { i: number; x: number; y: number };
type Puzzle = { diffs: Spot[]; radius: number; draw: (which: "A" | "B") => React.ReactNode };

/** Emoji picture for kids. */
function emojiPuzzle(level: Level): Puzzle {
  const p = makePuzzle(level);
  const draw = (which: "A" | "B") => (
    <>
      <defs>
        <linearGradient id={`sky-${which}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.scene.bg[0]} />
          <stop offset="1" stopColor={p.scene.bg[1]} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${which})`} />
      <path d={`M0 ${H - 26} Q ${W / 2} ${H - 44} ${W} ${H - 26} V${H} H0z`} fill={p.scene.ground} />
      {(which === "A" ? p.items : p.changed).map((it, i) =>
        it.e ? (
          <text
            key={i}
            x={it.x}
            y={it.y}
            fontSize={it.s}
            textAnchor="middle"
            dominantBaseline="central"
            transform={it.flip ? `translate(${2 * it.x} 0) scale(-1 1)` : it.rot ? `rotate(${it.rot} ${it.x} ${it.y})` : undefined}
          >
            {it.e}
          </text>
        ) : null,
      )}
    </>
  );
  return { diffs: p.diffs, radius: p.radius, draw };
}

/** Illustrated café scene for adults. */
function artPuzzle(): Puzzle {
  const p = makeArtPuzzle(W, H);
  const draw = (which: "A" | "B") => (
    <>
      <ArtBackdrop W={W} H={H} />
      {(which === "A" ? p.items : p.changed).map((it: ArtItem, i) => (
        <ArtObject key={i} it={it} />
      ))}
    </>
  );
  return { diffs: p.diffs, radius: p.radius, draw };
}

function Panel({ p, which, found, misses, onTap, flash }: {
  p: Puzzle; which: "A" | "B"; found: Spot[]; misses: { x: number; y: number; id: number }[]; onTap: (x: number, y: number) => void; flash: Spot | null;
}) {
  return (
    <svg
      className="spot-panel"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={which}
      onPointerDown={(e) => {
        const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        onTap(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H);
      }}
    >
      {p.draw(which)}
      {found.map((d) => (
        <circle key={`f${d.i}`} className="spot-ring" cx={d.x} cy={d.y} r="17" />
      ))}
      {flash && <circle className="spot-hint" cx={flash.x} cy={flash.y} r="22" />}
      {misses.map((m) => (
        <text key={m.id} className="spot-miss" x={m.x} y={m.y} textAnchor="middle" dominantBaseline="central">
          ✕
        </text>
      ))}
    </svg>
  );
}

export function SpotDiff({ k, level }: { k: string; level: Level }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [seed, setSeed] = useState(0);
  const p = useMemo(() => (level === "adults" ? artPuzzle() : emojiPuzzle(level)), [level, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [found, setFound] = useState<Spot[]>([]);
  const [misses, setMisses] = useState<{ x: number; y: number; id: number }[]>([]);
  const [missCount, setMissCount] = useState(0);
  const [flash, setFlash] = useState<Spot | null>(null);
  const [secs, setSecs] = useState(0);
  const done = found.length === p.diffs.length;

  useEffect(() => {
    setFound([]);
    setMisses([]);
    setMissCount(0);
    setSecs(0);
  }, [p]);
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [done, p]);
  useEffect(() => {
    if (done) (log("game_finish", { item: k, value: secs }), buzz(HAPTIC.win));
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  function tap(x: number, y: number) {
    if (done) return;
    const hit = p.diffs.find((d) => !found.includes(d) && Math.hypot(d.x - x, d.y - y) < p.radius);
    if (hit) return setFound((f) => [...f, hit]), buzz();
    const id = Date.now();
    setMisses((m) => [...m, { x, y, id }]);
    setMissCount((n) => n + 1);
    buzz(HAPTIC.tap);
    setTimeout(() => setMisses((m) => m.filter((z) => z.id !== id)), 600);
  }

  const hint = () => {
    const d = p.diffs.find((x) => !found.includes(x));
    if (!d) return;
    setFlash(d);
    setTimeout(() => setFlash(null), 1200);
  };

  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>
          {ui.found}: {found.length}/{p.diffs.length}
        </span>
        <span>
          ⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
          {level === "adults" && ` · ${ui.misses} ${missCount}`}
        </span>
      </div>
      <div className="spot-wrap">
        <Panel p={p} which="A" found={found} misses={misses} onTap={tap} flash={flash} />
        <Panel p={p} which="B" found={found} misses={misses} onTap={tap} flash={flash} />
      </div>
      {done ? (
        <div className="prompt kids">
          <p>{ui.all}</p>
          <div>
            <button className="g-btn" style={{ background: "#fff", color: "#1B1740" }} onClick={() => setSeed((s) => s + 1)}>
              {ui.again}
            </button>
          </div>
        </div>
      ) : (
        <div className="g-row">
          <p className="g-sub" style={{ flex: 1 }}>
            {ui.tap}
          </p>
          <button className="g-btn alt" onClick={hint}>
            💡 {ui.hint}
          </button>
        </div>
      )}
    </>
  );
}

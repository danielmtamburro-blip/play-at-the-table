"use client";
// Solo-friendly puzzles. Each game is generated fresh on the phone.
import { useEffect, useMemo, useRef, useState } from "react";
import { CROSSWORD_BANK, WORDGUESS_ANSWERS, WORDSEARCH_THEMES } from "@/lib/gameContent";
import type { Lang } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { GameHead } from "./Engines";
import { useScores } from "../Leaderboard";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    easy: "Easy", medium: "Medium", hard: "Hard", newGame: "New game", erase: "Erase", solved: "Solved!", time: "Time",
    check: "Check", reveal: "Reveal", across: "Across", down: "Down", englishOnly: "English puzzle",
    found: "Found", allFound: "You found them all!", tapStartEnd: "Tap the first letter, then the last letter of a word.",
    enter: "Enter", notEnough: "Not enough letters", won: "Brilliant! You got it.", lost: "The word was",
    tapCell: "Tap a square to start typing.",
  },
  ar: {
    easy: "سهل", medium: "متوسط", hard: "صعب", newGame: "لعبة جديدة", erase: "مسح", solved: "تم الحل!", time: "الوقت",
    check: "تحقق", reveal: "اكشف", across: "أفقي", down: "عمودي", englishOnly: "لغز باللغة الإنجليزية",
    found: "وجدت", allFound: "وجدت كل الكلمات!", tapStartEnd: "اضغط على أول حرف ثم آخر حرف في الكلمة.",
    enter: "إدخال", notEnough: "الحروف غير كافية", won: "رائع! عرفتها.", lost: "الكلمة كانت",
    tapCell: "اضغط على مربع لتبدأ الكتابة.",
  },
};
const useUi = () => UI[useGuest().lang];

function useStopwatch(running: boolean, resetKey: unknown) {
  const [s, setS] = useState(0);
  useEffect(() => setS(0), [resetKey]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setS((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  return Object.assign(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`, { secs: s });
}

/* ================= Sudoku ================= */

function solvedGrid(): number[] {
  const g = Array(81).fill(0);
  const ok = (i: number, n: number) => {
    const r = Math.floor(i / 9), c = i % 9, br = r - (r % 3), bc = c - (c % 3);
    for (let j = 0; j < 9; j++) if (g[r * 9 + j] === n || g[j * 9 + c] === n || g[(br + Math.floor(j / 3)) * 9 + bc + (j % 3)] === n) return false;
    return true;
  };
  const fill = (i: number): boolean => {
    if (i === 81) return true;
    for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (ok(i, n)) {
        g[i] = n;
        if (fill(i + 1)) return true;
        g[i] = 0;
      }
    }
    return false;
  };
  fill(0);
  return g;
}

const GIVENS = { easy: 40, medium: 32, hard: 27 } as const;
type Level = keyof typeof GIVENS;

function makeSudoku(level: Level) {
  const sol = solvedGrid();
  const keep = new Set(shuffle(Array.from({ length: 81 }, (_, i) => i)).slice(0, GIVENS[level]));
  return { sol, given: sol.map((n, i) => (keep.has(i) ? n : 0)) };
}

/** Cells that clash with another cell in the same row, column or box. */
function conflicts(g: number[]): Set<number> {
  const bad = new Set<number>();
  for (let i = 0; i < 81; i++) {
    if (!g[i]) continue;
    const r = Math.floor(i / 9), c = i % 9;
    for (let j = i + 1; j < 81; j++) {
      if (g[j] !== g[i]) continue;
      const r2 = Math.floor(j / 9), c2 = j % 9;
      if (r === r2 || c === c2 || (Math.floor(r / 3) === Math.floor(r2 / 3) && Math.floor(c / 3) === Math.floor(c2 / 3))) (bad.add(i), bad.add(j));
    }
  }
  return bad;
}

export function Sudoku({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [level, setLevel] = useState<Level>("easy");
  const [game, setGame] = useState(() => makeSudoku("easy"));
  const [cells, setCells] = useState<number[]>(() => game.given.slice());
  const [sel, setSel] = useState<number | null>(null);
  const bad = useMemo(() => conflicts(cells), [cells]);
  const done = cells.every(Boolean) && bad.size === 0;
  const time = useStopwatch(!done, game);
  const { report } = useScores();
  useEffect(() => {
    if (done) (log("game_finish", { item: k }), report(k, Math.max(30, time.secs)));
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (l: Level) => {
    const g = makeSudoku(l);
    setLevel(l);
    setGame(g);
    setCells(g.given.slice());
    setSel(null);
  };
  const put = (n: number) => {
    if (sel == null || game.given[sel]) return;
    setCells((c) => c.map((v, i) => (i === sel ? n : v)));
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) put(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") put(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const sr = sel != null ? Math.floor(sel / 9) : -1, sc = sel != null ? sel % 9 : -1;
  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div className="cd-seg">
          {(Object.keys(GIVENS) as Level[]).map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => start(l)}>
              {ui[l]}
            </button>
          ))}
        </div>
        <b>
          ⏱ {time}
        </b>
      </div>
      <div className="sudoku" dir="ltr">
        {cells.map((v, i) => {
          const r = Math.floor(i / 9), c = i % 9;
          const peer = sel != null && (r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3)));
          const same = sel != null && v && cells[sel] === v;
          const cls = [game.given[i] ? "given" : "", i === sel ? "sel" : peer ? "peer" : "", same ? "same" : "", bad.has(i) && !game.given[i] ? "bad" : "", c % 3 === 2 && c < 8 ? "br" : "", r % 3 === 2 && r < 8 ? "bb" : ""].join(" ");
          return (
            <button key={i} className={cls} onClick={() => setSel(i)} aria-label={`Row ${r + 1} column ${c + 1}: ${v || "empty"}`}>
              {v || ""}
            </button>
          );
        })}
      </div>
      {done ? (
        <div className="prompt group">
          <p>
            🎉 {ui.solved} {time}
          </p>
          <div>
            <button className="g-btn" style={{ background: "#fff", color: "#1B1740" }} onClick={() => start(level)}>
              {ui.newGame}
            </button>
          </div>
        </div>
      ) : (
        <div className="numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => put(n)}>
              {n}
            </button>
          ))}
          <button className="erase" onClick={() => put(0)}>
            {ui.erase}
          </button>
        </div>
      )}
    </>
  );
}

/* ================= Mini crossword ================= */

type Entry = { num: number; dir: "a" | "d"; x: number; y: number; w: string; c: string };

/** Build a small criss-cross from the word bank: each word crosses an earlier one. */
function buildCrossword(target = 7): { entries: Entry[]; w: number; h: number; cells: Map<string, string> } {
  for (let attempt = 0; attempt < 30; attempt++) {
    const pool = shuffle(CROSSWORD_BANK).filter((e) => e.w.length <= 7);
    const cells = new Map<string, string>();
    const placed: Omit<Entry, "num">[] = [];
    const at = (x: number, y: number) => cells.get(`${x},${y}`);
    const fits = (w: string, x: number, y: number, dir: "a" | "d") => {
      const dx = dir === "a" ? 1 : 0, dy = dir === "d" ? 1 : 0;
      if (at(x - dx, y - dy) || at(x + dx * w.length, y + dy * w.length)) return false;
      let crosses = 0;
      for (let i = 0; i < w.length; i++) {
        const cx = x + dx * i, cy = y + dy * i, v = at(cx, cy);
        if (v) {
          if (v !== w[i]) return false;
          crosses++;
        } else if (at(cx + dy, cy + dx) || at(cx - dy, cy - dx)) return false; // no side-by-side letters
      }
      return crosses > 0 && crosses < w.length;
    };
    const put = (e: { w: string; c: string }, x: number, y: number, dir: "a" | "d") => {
      for (let i = 0; i < e.w.length; i++) cells.set(`${x + (dir === "a" ? i : 0)},${y + (dir === "d" ? i : 0)}`, e.w[i]);
      placed.push({ dir, x, y, w: e.w, c: e.c });
    };
    put(pool[0], 0, 0, "a");
    for (const e of pool.slice(1)) {
      if (placed.length >= target) break;
      let done = false;
      for (const p of shuffle(placed)) {
        for (let i = 0; i < p.w.length && !done; i++)
          for (let j = 0; j < e.w.length && !done; j++) {
            if (p.w[i] !== e.w[j]) continue;
            const dir = p.dir === "a" ? "d" : "a";
            const x = p.dir === "a" ? p.x + i : p.x - j, y = p.dir === "a" ? p.y - j : p.y + i;
            if (fits(e.w, x, y, dir)) (put(e, x, y, dir), (done = true));
          }
        if (done) break;
      }
    }
    if (placed.length < 5) continue;
    const xs = [...cells.keys()].map((k) => Number(k.split(",")[0])), ys = [...cells.keys()].map((k) => Number(k.split(",")[1]));
    const minX = Math.min(...xs), minY = Math.min(...ys), w = Math.max(...xs) - minX + 1, h = Math.max(...ys) - minY + 1;
    if (w > 11 || h > 11) continue;
    const norm = new Map<string, string>();
    cells.forEach((v, k) => {
      const [x, y] = k.split(",").map(Number);
      norm.set(`${x - minX},${y - minY}`, v);
    });
    // Number entries in reading order, sharing numbers where across and down start together.
    const starts = placed.map((p) => ({ ...p, x: p.x - minX, y: p.y - minY })).sort((a, b) => a.y - b.y || a.x - b.x);
    const nums = new Map<string, number>();
    const entries = starts.map((p) => {
      const key = `${p.x},${p.y}`;
      if (!nums.has(key)) nums.set(key, nums.size + 1);
      return { ...p, num: nums.get(key)! };
    });
    return { entries, w, h, cells: norm };
  }
  return buildCrossword(5);
}

export function Crossword({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = useUi();
  const [puz, setPuz] = useState(buildCrossword);
  const [fill, setFill] = useState<Record<string, string>>({});
  const [cur, setCur] = useState<{ e: number; i: number } | null>(null);
  const [checked, setChecked] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const entry = cur ? puz.entries[cur.e] : null;
  const keyOf = (e: Entry, i: number) => `${e.x + (e.dir === "a" ? i : 0)},${e.y + (e.dir === "d" ? i : 0)}`;
  const solved = [...puz.cells.entries()].every(([k2, v]) => fill[k2] === v);
  useEffect(() => {
    if (solved) log("game_finish", { item: k });
  }, [solved]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (key: string) => {
    const hits = puz.entries.map((e, n) => ({ e, n, i: Array.from({ length: e.w.length }, (_, i) => keyOf(e, i)).indexOf(key) })).filter((h) => h.i >= 0);
    if (!hits.length) return;
    // Tapping the current square again flips between across and down; otherwise stay in the current direction.
    const curKey = entry && cur ? keyOf(entry, cur.i) : null;
    const pick = curKey === key && hits.length > 1 ? hits.find((h) => h.n !== cur!.e)! : hits.find((h) => h.n === cur?.e) ?? hits.find((h) => h.e.dir === entry?.dir) ?? hits[0];
    setCur({ e: pick.n, i: pick.i });
    input.current?.focus({ preventScroll: true });
  };
  const type = (ch: string) => {
    if (!cur || !entry) return;
    const key = keyOf(entry, cur.i);
    setChecked(false);
    if (ch === "") {
      if (fill[key]) setFill({ ...fill, [key]: "" });
      else if (cur.i > 0) {
        const prev = keyOf(entry, cur.i - 1);
        setFill({ ...fill, [prev]: "" });
        setCur({ ...cur, i: cur.i - 1 });
      }
      return;
    }
    setFill({ ...fill, [key]: ch });
    if (cur.i < entry.w.length - 1) setCur({ ...cur, i: cur.i + 1 });
  };

  const activeKeys = new Set(entry ? Array.from({ length: entry.w.length }, (_, i) => keyOf(entry, i)) : []);
  const startNum = new Map(puz.entries.map((e) => [`${e.x},${e.y}`, e.num]));

  return (
    <>
      <GameHead k={k} />
      {lang === "ar" && <span className="badge" style={{ alignSelf: "flex-start" }}>{ui.englishOnly}</span>}
      <div className="cw-clue">{entry ? `${entry.num} ${entry.dir === "a" ? ui.across : ui.down}: ${entry.c}` : ui.tapCell}</div>
      <div className="cw" dir="ltr" style={{ gridTemplateColumns: `repeat(${puz.w}, 1fr)` }}>
        {Array.from({ length: puz.w * puz.h }, (_, n) => {
          const key = `${n % puz.w},${Math.floor(n / puz.w)}`;
          const sol = puz.cells.get(key);
          if (!sol) return <span key={key} className="cw-x" />;
          const isCur = entry && cur && keyOf(entry, cur.i) === key;
          const wrong = checked && fill[key] && fill[key] !== sol;
          return (
            <button key={key} className={`cw-c${activeKeys.has(key) ? " on" : ""}${isCur ? " cur" : ""}${wrong ? " bad" : ""}`} onClick={() => select(key)}>
              {startNum.has(key) && <small>{startNum.get(key)}</small>}
              {fill[key] ?? ""}
            </button>
          );
        })}
      </div>
      <input
        ref={input}
        className="cw-input"
        aria-label="Crossword letter"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        value=""
        onChange={(e) => {
          const ch = e.target.value.slice(-1).toUpperCase();
          if (/[A-Z]/.test(ch)) type(ch);
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace") (e.preventDefault(), type(""));
        }}
      />
      {solved ? (
        <div className="prompt group">
          <p>🎉 {ui.solved}</p>
          <div>
            <button className="g-btn" style={{ background: "#fff", color: "#1B1740" }} onClick={() => (setPuz(buildCrossword()), setFill({}), setCur(null))}>
              {ui.newGame}
            </button>
          </div>
        </div>
      ) : (
        <div className="g-row">
          <button className="g-btn alt" onClick={() => setChecked(true)}>
            {ui.check}
          </button>
          <button className="g-btn alt" onClick={() => setFill(Object.fromEntries(puz.cells))}>
            {ui.reveal}
          </button>
          <button className="g-btn alt" onClick={() => (setPuz(buildCrossword()), setFill({}), setCur(null), setChecked(false))}>
            {ui.newGame}
          </button>
        </div>
      )}
      <div className="cw-clues">
        {(["a", "d"] as const).map((d) => (
          <div key={d}>
            <b>{d === "a" ? ui.across : ui.down}</b>
            {puz.entries
              .map((e, n) => ({ e, n }))
              .filter(({ e }) => e.dir === d)
              .sort((a, b) => a.e.num - b.e.num)
              .map(({ e, n }) => (
                <button key={n} className={cur?.e === n ? "on" : ""} onClick={() => (setCur({ e: n, i: 0 }), input.current?.focus({ preventScroll: true }))}>
                  <b>{e.num}</b> {e.c}
                </button>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= Word search ================= */

const AR_LETTERS = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي";
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]];

function buildSearch(words: string[], lang: Lang, size = 10) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const g: (string | null)[] = Array(size * size).fill(null);
    const placed: { w: string; cells: number[] }[] = [];
    for (const w of shuffle(words)) {
      const letters = Array.from(w);
      let ok = false;
      for (let t = 0; t < 120 && !ok; t++) {
        const [dx, dy] = DIRS[Math.floor(Math.random() * DIRS.length)];
        const x0 = Math.floor(Math.random() * size), y0 = Math.floor(Math.random() * size);
        const cells: number[] = [];
        for (let i = 0; i < letters.length; i++) {
          const x = x0 + dx * i, y = y0 + dy * i;
          if (x < 0 || y < 0 || x >= size || y >= size) break;
          const v = g[y * size + x];
          if (v && v !== letters[i]) break;
          cells.push(y * size + x);
        }
        if (cells.length === letters.length) {
          cells.forEach((c, i) => (g[c] = letters[i]));
          placed.push({ w, cells });
          ok = true;
        }
      }
    }
    if (placed.length === words.length) {
      const pool = lang === "ar" ? AR_LETTERS : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      return { grid: g.map((v) => v ?? pool[Math.floor(Math.random() * pool.length)]), placed, size };
    }
  }
  return buildSearch(words.slice(0, words.length - 1), lang, size);
}

const FOUND_COLOURS = ["#FFB51F", "#12A594", "#6E4BFF", "#F0457F", "#4CC9F0", "#FF5A4E", "#7ED957", "#FF9F1C"];

export function WordSearch({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = useUi();
  const themes = WORDSEARCH_THEMES[lang];
  const [ti, setTi] = useState(() => Math.floor(Math.random() * themes.length));
  const theme = themes[ti % themes.length];
  const puz = useMemo(() => buildSearch(theme.w, lang), [theme, lang]);
  const [found, setFound] = useState<string[]>([]);
  const [start, setStart] = useState<number | null>(null);
  const [miss, setMiss] = useState(false);
  useEffect(() => setFound([]), [puz]);
  const all = found.length === puz.placed.length;
  useEffect(() => {
    if (all) log("game_finish", { item: k });
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (i: number) => {
    if (start == null) return setStart(i);
    const hit = puz.placed.find((p) => !found.includes(p.w) && ((p.cells[0] === start && p.cells.at(-1) === i) || (p.cells[0] === i && p.cells.at(-1) === start)));
    if (hit) setFound([...found, hit.w]);
    else (setMiss(true), setTimeout(() => setMiss(false), 400));
    setStart(null);
  };
  const colourOf = new Map<number, string>();
  found.forEach((w, n) => puz.placed.find((p) => p.w === w)!.cells.forEach((c) => colourOf.set(c, FOUND_COLOURS[n % FOUND_COLOURS.length])));

  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>🏷️ {theme.t}</span>
        <span>
          {ui.found}: {found.length}/{puz.placed.length}
        </span>
      </div>
      <div className={`ws${miss ? " shake" : ""}`} dir="ltr" style={{ gridTemplateColumns: `repeat(${puz.size}, 1fr)` }}>
        {puz.grid.map((ch, i) => (
          <button key={i} className={i === start ? "start" : ""} style={colourOf.has(i) ? { background: colourOf.get(i), color: "#fff" } : undefined} onClick={() => tap(i)}>
            {ch}
          </button>
        ))}
      </div>
      <p className="g-sub" style={{ textAlign: "center" }}>
        {all ? `🎉 ${ui.allFound}` : ui.tapStartEnd}
      </p>
      <div className="ws-words">
        {puz.placed.map((p) => (
          <span key={p.w} className={found.includes(p.w) ? "done" : ""}>
            {p.w}
          </span>
        ))}
      </div>
      <button className="g-btn alt" onClick={() => setTi(ti + 1)}>
        {ui.newGame}
      </button>
    </>
  );
}

/* ================= Word guess ================= */

const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
type Mark = "hit" | "near" | "miss";

function score(guess: string, answer: string): Mark[] {
  const res: Mark[] = Array(5).fill("miss");
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) res[i] = "hit";
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) if (res[i] !== "hit" && left[guess[i]]) (res[i] = "near"), left[guess[i]]--;
  return res;
}

export function WordGuess({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const { report } = useScores();
  const ui = useUi();
  const [answer, setAnswer] = useState(() => WORDGUESS_ANSWERS[Math.floor(Math.random() * WORDGUESS_ANSWERS.length)]);
  const [rows, setRows] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");
  const won = rows.at(-1) === answer;
  const over = won || rows.length >= 6;

  const press = (key: string) => {
    if (over) return;
    setNote("");
    if (key === "⌫") return setDraft((d) => d.slice(0, -1));
    if (key === "ENTER") {
      if (draft.length < 5) return setNote(ui.notEnough);
      const next = [...rows, draft];
      setRows(next);
      setDraft("");
      if (draft === answer || next.length >= 6) log("game_finish", { item: k, value: draft === answer ? next.length : 0 });
      if (draft === answer) report(k, next.length);
      return;
    }
    if (draft.length < 5) setDraft((d) => d + key);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") press("ENTER");
      else if (e.key === "Backspace") press("⌫");
      else if (/^[a-z]$/i.test(e.key)) press(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const keyMark: Record<string, Mark> = {};
  rows.forEach((r) => score(r, answer).forEach((m, i) => {
    const c = r[i], prev = keyMark[c];
    if (m === "hit" || (m === "near" && prev !== "hit") || (!prev && m === "miss")) keyMark[c] = m;
  }));

  return (
    <>
      <GameHead k={k} />
      {lang === "ar" && <span className="badge" style={{ alignSelf: "flex-start" }}>{ui.englishOnly}</span>}
      <div className="wg" dir="ltr">
        {Array.from({ length: 6 }, (_, r) => {
          const word = r < rows.length ? rows[r] : r === rows.length ? draft : "";
          const marks = r < rows.length ? score(rows[r], answer) : null;
          return (
            <div key={r} className="wg-row">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`wg-cell${marks ? ` ${marks[i]}` : word[i] ? " typed" : ""}`}>
                  {word[i] ?? ""}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      {note && <p className="g-service-msg bad" style={{ textAlign: "center" }}>{note}</p>}
      {over ? (
        <div className="prompt group">
          <p>{won ? `🎉 ${ui.won}` : `${ui.lost} ${answer}`}</p>
          <div>
            <button
              className="g-btn"
              style={{ background: "#fff", color: "#1B1740" }}
              onClick={() => (setAnswer(WORDGUESS_ANSWERS[Math.floor(Math.random() * WORDGUESS_ANSWERS.length)]), setRows([]), setDraft(""))}
            >
              {ui.newGame}
            </button>
          </div>
        </div>
      ) : (
        <div className="kb" dir="ltr">
          {KEYS.map((row, n) => (
            <div key={row} className="kb-row">
              {n === 2 && (
                <button className="wide" onClick={() => press("ENTER")}>
                  {ui.enter}
                </button>
              )}
              {Array.from(row).map((c) => (
                <button key={c} className={keyMark[c] ?? ""} onClick={() => press(c)}>
                  {c}
                </button>
              ))}
              {n === 2 && (
                <button className="wide" onClick={() => press("⌫")} aria-label="Delete">
                  ⌫
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

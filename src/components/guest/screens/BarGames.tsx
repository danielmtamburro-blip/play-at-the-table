"use client";
// Scorers for the venue's dartboard and pool table. Everything stays on this phone.
import { useMemo, useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { GameHead } from "./Engines";
import { GAMES, gameOn } from "@/lib/games";
import { Glyph } from "../glyphs";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    players: "Players", add: "Add player", start: "Start", game: "Game", doubleOut: "Finish on a double", left: "left", visit: "Score this visit",
    enter: "Enter", undo: "Undo", bust: "Bust! Score stays the same.", invalid: "That score isn't possible with 3 darts.", checkout: "Checkout",
    noCheckout: "No 3-dart checkout yet", wins: "wins the leg! 🎯", nextLeg: "Next leg", newGame: "New game", legs: "Legs", avg: "Avg",
    raceTo: "Race to", frames: "frames", won: "won the frame", breaks: "breaks", match: "wins the match! 🏆", killer: "Killer", race: "Race (8 or 9-ball)",
    lives: "lives", out: "out", loseLife: "Missed: lose a life", potted: "Potted", turn: "Shooting", mode: "Mode", spots: "Spots", stripes: "Stripes", name: "Name",
  },
  ar: {
    players: "اللاعبون", add: "أضف لاعباً", start: "ابدأ", game: "اللعبة", doubleOut: "الإنهاء بمضاعف", left: "متبقٍ", visit: "نقاط هذه الجولة",
    enter: "إدخال", undo: "تراجع", bust: "تجاوز! تبقى النقاط كما هي.", invalid: "لا يمكن تسجيل هذه النقاط بثلاثة أسهم.", checkout: "الإنهاء",
    noCheckout: "لا يوجد إنهاء بثلاثة أسهم بعد", wins: "فاز بالجولة! 🎯", nextLeg: "الجولة التالية", newGame: "لعبة جديدة", legs: "الجولات", avg: "المعدل",
    raceTo: "السباق إلى", frames: "أشواط", won: "فاز بالشوط", breaks: "يكسر", match: "فاز بالمباراة! 🏆", killer: "القاتل", race: "سباق (8 أو 9 كرات)",
    lives: "أرواح", out: "خرج", loseLife: "أخطأ: يخسر روحاً", potted: "أدخل الكرة", turn: "يلعب", mode: "النمط", spots: "المصمتة", stripes: "المخططة", name: "الاسم",
  },
};
const useUi = () => UI[useGuest().lang];

/* ---------- Shared: editable player list ---------- */

function PlayerList({ names, setNames, min, max }: { names: string[]; setNames: (n: string[]) => void; min: number; max: number }) {
  const ui = useUi();
  return (
    <div className="bar-players">
      {names.map((n, i) => (
        <div key={i} className="bar-player-row">
          <input value={n} maxLength={14} aria-label={`${ui.name} ${i + 1}`} onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} />
          {names.length > min && (
            <button type="button" aria-label="Remove" onClick={() => setNames(names.filter((_, j) => j !== i))}>
              ×
            </button>
          )}
        </div>
      ))}
      {names.length < max && (
        <button type="button" className="g-btn alt" onClick={() => setNames([...names, `Player ${names.length + 1}`])}>
          + {ui.add}
        </button>
      )}
    </div>
  );
}

/* ---------- Darts: checkouts ---------- */

type Dart = { label: string; v: number; double: boolean };
const SINGLES: Dart[] = [...Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1}`, v: i + 1, double: false })), { label: "25", v: 25, double: false }];
const DOUBLES: Dart[] = [...Array.from({ length: 20 }, (_, i) => ({ label: `D${i + 1}`, v: (i + 1) * 2, double: true })), { label: "Bull", v: 50, double: true }];
const TREBLES: Dart[] = Array.from({ length: 20 }, (_, i) => ({ label: `T${i + 1}`, v: (i + 1) * 3, double: false }));
const ANY = [...TREBLES, ...SINGLES, ...DOUBLES];
// Doubles players like to finish on, best first.
const DOUBLE_PREF = ["D20", "D16", "D18", "D12", "D10", "D8", "Bull", "D14", "D6", "D4", "D19", "D17", "D15", "D13", "D11", "D9", "D7", "D5", "D3", "D2", "D1"];
const setupPref = (d: Dart) => (d.label === "T20" ? 0 : d.label === "T19" ? 1 : d.label.startsWith("T") ? 2 + (20 - d.v / 3) * 0.1 : d.label === "25" ? 4 : d.double ? 6 : 3 + (20 - d.v) * 0.05);

/** The usual way to check out from a score, e.g. 170 → T20 T20 Bull. Null if 3 darts can't do it. */
export function checkout(n: number): string[] | null {
  if (n < 2 || n > 170) return null;
  type C = { darts: Dart[]; cost: number };
  let best: C | null = null;
  const consider = (darts: Dart[]) => {
    const last = darts[darts.length - 1];
    const cost = darts.length * 100 + DOUBLE_PREF.indexOf(last.label) * 2 + darts.slice(0, -1).reduce((a, d) => a + setupPref(d), 0);
    if (!best || cost < best.cost) best = { darts, cost };
  };
  for (const d of DOUBLES) if (d.v === n) consider([d]);
  if (best) return (best as C).darts.map((d) => d.label);
  for (const a of ANY) for (const d of DOUBLES) if (a.v + d.v === n) consider([a, d]);
  if (best) return (best as C).darts.map((d) => d.label);
  for (const a of ANY) for (const b of ANY) for (const d of DOUBLES) if (a.v + b.v + d.v === n) consider([a, b, d]);
  if (!best) return null;
  // Throw the bigger setup dart first (T20 T19 Bull, not T19 T20 Bull).
  const ds = (best as C).darts, last = ds[ds.length - 1];
  return [...ds.slice(0, -1).sort((x, y) => y.v - x.v), last].map((d) => d.label);
}
const IMPOSSIBLE = new Set([163, 166, 169, 172, 173, 175, 176, 178, 179]);

/* ---------- Darts scorer ---------- */

type DartsState = { start: number; names: string[]; scores: number[]; legs: number[]; turn: number; history: { p: number; v: number; bust: boolean }[]; winner: number | null; thrown: number[]; darts: number[] };

export function Darts({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [start, setStart] = useState(501);
  const [dOut, setDOut] = useState(true);
  const [names, setNames] = useState(["Player 1", "Player 2"]);
  const [g, setG] = useState<DartsState | null>(null);
  const [entry, setEntry] = useState("");
  const [msg, setMsg] = useState("");

  const begin = (keepLegs?: number[]) => {
    const n = names.map((x, i) => x.trim() || `Player ${i + 1}`);
    setG({ start, names: n, scores: n.map(() => start), legs: keepLegs ?? n.map(() => 0), turn: 0, history: [], winner: null, thrown: n.map(() => 0), darts: n.map(() => 0) });
    setEntry("");
    setMsg("");
    log("game_start", { item: k });
  };

  function submit() {
    if (!g || g.winner != null) return;
    const v = Number(entry || "0");
    setEntry("");
    if (v > 180 || IMPOSSIBLE.has(v)) return (setMsg(ui.invalid), buzz(HAPTIC.bad));
    const p = g.turn, left = g.scores[p] - v;
    const bust = left < 0 || (dOut && left === 1);
    const scores = g.scores.slice(), thrown = g.thrown.slice(), darts = g.darts.slice();
    darts[p] += 3;
    if (!bust) (scores[p] = left), (thrown[p] += v);
    setMsg(bust ? ui.bust : "");
    buzz(bust ? HAPTIC.bad : v >= 100 ? HAPTIC.win : HAPTIC.tap);
    const won = !bust && left === 0;
    const legs = g.legs.slice();
    if (won) (legs[p] += 1), log("game_finish", { item: k });
    setG({ ...g, scores, thrown, darts, legs, history: [...g.history, { p, v, bust }], winner: won ? p : null, turn: won ? p : (p + 1) % g.names.length });
  }

  function undo() {
    if (!g || !g.history.length) return;
    const h = g.history[g.history.length - 1];
    const scores = g.scores.slice(), thrown = g.thrown.slice(), darts = g.darts.slice(), legs = g.legs.slice();
    if (!h.bust) (scores[h.p] += h.v), (thrown[h.p] -= h.v);
    darts[h.p] -= 3;
    if (g.winner != null) legs[h.p] -= 1;
    setG({ ...g, scores, thrown, darts, legs, history: g.history.slice(0, -1), turn: h.p, winner: null });
    setMsg("");
  }

  const cur = g ? g.scores[g.turn] : 0;
  const co = useMemo(() => (g && dOut ? checkout(cur) : null), [g, cur, dOut]);

  if (!g)
    return (
      <>
        <GameHead k={k} />
        <div className="bar-card">
          <span className="split-label">{ui.game}</span>
          <div className="g-seg">
            {[301, 501].map((n) => (
              <button key={n} type="button" aria-pressed={start === n} onClick={() => setStart(n)}>
                {n}
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={dOut} onChange={(e) => setDOut(e.target.checked)} /> {ui.doubleOut}
          </label>
          <span className="split-label">{ui.players}</span>
          <PlayerList names={names} setNames={setNames} min={1} max={6} />
        </div>
        <button className="g-btn" data-act="darts-start" onClick={() => begin()}>
          🎯 {ui.start}
        </button>
      </>
    );

  return (
    <>
      <GameHead k={k} />
      <div className="darts-board">
        {g.names.map((n, i) => (
          <div key={i} className={`darts-p${i === g.turn ? " on" : ""}${g.winner === i ? " win" : ""}`}>
            <span className="darts-name">{n}</span>
            <b>{g.scores[i]}</b>
            <small>
              {ui.legs} {g.legs[i]} · {ui.avg} {g.darts[i] ? ((g.thrown[i] / g.darts[i]) * 3).toFixed(1) : "–"}
            </small>
          </div>
        ))}
      </div>

      {g.winner != null ? (
        <div className="prompt group">
          <p>
            {g.names[g.winner]} {ui.wins}
          </p>
          <div className="g-row">
            <button className="g-btn" style={{ background: "#fff", color: "#1B1740" }} onClick={() => begin(g.legs)}>
              {ui.nextLeg}
            </button>
            <button className="g-btn alt" onClick={() => setG(null)}>
              {ui.newGame}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`darts-co${co ? " on" : ""}`} aria-live="polite">
            {dOut && cur <= 170 ? (
              co ? (
                <>
                  <small>
                    {ui.checkout} {cur}
                  </small>
                  <span>
                    {co.map((d, i) => (
                      <em key={i}>{d}</em>
                    ))}
                  </span>
                </>
              ) : (
                <small>{ui.noCheckout}</small>
              )
            ) : (
              <small>
                {g.names[g.turn]} · {cur} {ui.left}
              </small>
            )}
          </div>
          <div className="darts-entry">
            <span className="split-label">
              {g.names[g.turn]}: {ui.visit}
            </span>
            <b>{entry || "0"}</b>
          </div>
          {msg && <p className="g-service-msg bad">{msg}</p>}
          <div className="darts-quick">
            {[26, 41, 45, 60, 81, 85, 100, 140, 180].map((n) => (
              <button key={n} data-score={n} onClick={() => setEntry(String(n))}>
                {n}
              </button>
            ))}
          </div>
          <div className="darts-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} onClick={() => setEntry((e) => (e + n).replace(/^0+/, "").slice(0, 3))}>
                {n}
              </button>
            ))}
            <button className="alt" onClick={() => setEntry((e) => e.slice(0, -1))} aria-label="Delete">
              ⌫
            </button>
            <button onClick={() => setEntry((e) => (e ? (e + "0").slice(0, 3) : ""))}>0</button>
            <button className="ok" data-act="darts-enter" onClick={submit}>
              {ui.enter}
            </button>
          </div>
          <button className="g-btn alt" onClick={undo} disabled={!g.history.length}>
            ↶ {ui.undo}
          </button>
        </>
      )}
    </>
  );
}

/* ---------- Pool scorer ---------- */

export function Pool({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [mode, setMode] = useState<"race" | "killer">("race");
  const [names, setNames] = useState(["Player 1", "Player 2"]);
  const [raceTo, setRaceTo] = useState(3);
  const [lives, setLives] = useState(3);
  const [game, setGame] = useState<null | { names: string[]; frames: number[]; breaker: number; history: number[]; suits: (null | "spots" | "stripes")[] }>(null);
  const [killer, setKiller] = useState<null | { names: string[]; lives: number[]; turn: number; history: { p: number }[] }>(null);

  const clean = () => names.map((x, i) => x.trim() || `Player ${i + 1}`);
  const start = () => {
    log("game_start", { item: k });
    if (mode === "race") setGame({ names: clean().slice(0, 2), frames: [0, 0], breaker: 0, history: [], suits: [null, null] });
    else setKiller({ names: clean(), lives: clean().map(() => lives), turn: 0, history: [] });
  };

  if (game) {
    const champ = game.frames.findIndex((f) => f >= raceTo);
    const win = (p: number) => {
      if (champ >= 0) return;
      const frames = game.frames.slice();
      frames[p] += 1;
      buzz(frames[p] >= raceTo ? HAPTIC.win : HAPTIC.good);
      if (frames[p] >= raceTo) log("game_finish", { item: k });
      // Players take turns to break.
      setGame({ ...game, frames, breaker: 1 - game.breaker, history: [...game.history, p], suits: [null, null] });
    };
    const undo = () => {
      const p = game.history[game.history.length - 1];
      if (p == null) return;
      const frames = game.frames.slice();
      frames[p] -= 1;
      setGame({ ...game, frames, breaker: 1 - game.breaker, history: game.history.slice(0, -1) });
    };
    const suit = (p: number, s: "spots" | "stripes") => setGame({ ...game, suits: p === 0 ? [s, s === "spots" ? "stripes" : "spots"] : [s === "spots" ? "stripes" : "spots", s] });
    return (
      <>
        <GameHead k={k} />
        <p className="g-sub" style={{ textAlign: "center" }}>
          {ui.raceTo} {raceTo} {ui.frames}
        </p>
        <div className="pool-board">
          {game.names.map((n, i) => (
            <div key={i} className={`pool-p${champ === i ? " win" : ""}`}>
              <span className="darts-name">
                {n} {game.breaker === i && champ < 0 && <em className="pool-break">● {ui.breaks}</em>}
              </span>
              <b>{game.frames[i]}</b>
              {champ < 0 && (
                <>
                  <div className="pool-suits">
                    <button aria-pressed={game.suits[i] === "spots"} onClick={() => suit(i, "spots")}>
                      🔴 {ui.spots}
                    </button>
                    <button aria-pressed={game.suits[i] === "stripes"} onClick={() => suit(i, "stripes")}>
                      🟡 {ui.stripes}
                    </button>
                  </div>
                  <button className="g-btn" data-act="pool-won" onClick={() => win(i)}>
                    🏆 {ui.won}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        {champ >= 0 && (
          <div className="prompt group">
            <p>
              {game.names[champ]} {ui.match}
            </p>
          </div>
        )}
        <div className="g-row">
          <button className="g-btn alt" onClick={undo} disabled={!game.history.length}>
            ↶ {ui.undo}
          </button>
          <button className="g-btn alt" onClick={() => setGame(null)}>
            {ui.newGame}
          </button>
        </div>
      </>
    );
  }

  if (killer) {
    const alive = killer.lives.map((l, i) => (l > 0 ? i : -1)).filter((i) => i >= 0);
    const champ = alive.length === 1 ? alive[0] : -1;
    const nextAlive = (from: number, lv: number[]) => {
      for (let s = 1; s <= lv.length; s++) {
        const i = (from + s) % lv.length;
        if (lv[i] > 0) return i;
      }
      return from;
    };
    const lose = () => {
      const lv = killer.lives.slice();
      lv[killer.turn] = Math.max(0, lv[killer.turn] - 1);
      buzz(HAPTIC.bad);
      if (lv.filter((x) => x > 0).length === 1) log("game_finish", { item: k });
      setKiller({ ...killer, lives: lv, turn: nextAlive(killer.turn, lv), history: [...killer.history, { p: killer.turn }] });
    };
    const pass = () => setKiller({ ...killer, turn: nextAlive(killer.turn, killer.lives), history: [...killer.history, { p: -1 - killer.turn }] });
    const undo = () => {
      const h = killer.history[killer.history.length - 1];
      if (!h) return;
      const lv = killer.lives.slice();
      if (h.p >= 0) lv[h.p] += 1;
      setKiller({ ...killer, lives: lv, turn: h.p >= 0 ? h.p : -1 - h.p, history: killer.history.slice(0, -1) });
    };
    return (
      <>
        <GameHead k={k} />
        <div className="killer-list">
          {killer.names.map((n, i) => (
            <div key={i} className={`killer-p${i === killer.turn && champ < 0 ? " on" : ""}${killer.lives[i] === 0 ? " out" : ""}${champ === i ? " win" : ""}`}>
              <span>{n}</span>
              <span className="killer-lives">{killer.lives[i] > 0 ? "❤️".repeat(killer.lives[i]) : ui.out}</span>
            </div>
          ))}
        </div>
        {champ >= 0 ? (
          <div className="prompt group">
            <p>
              {killer.names[champ]} {ui.match}
            </p>
          </div>
        ) : (
          <>
            <p className="g-sub" style={{ textAlign: "center" }}>
              {ui.turn}: <b>{killer.names[killer.turn]}</b>
            </p>
            <div className="g-row">
              <button className="g-btn alt" onClick={lose}>
                💔 {ui.loseLife}
              </button>
              <button className="g-btn" onClick={pass}>
                ✅ {ui.potted}
              </button>
            </div>
          </>
        )}
        <div className="g-row">
          <button className="g-btn alt" onClick={undo} disabled={!killer.history.length}>
            ↶ {ui.undo}
          </button>
          <button className="g-btn alt" onClick={() => setKiller(null)}>
            {ui.newGame}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <GameHead k={k} />
      <div className="bar-card">
        <span className="split-label">{ui.mode}</span>
        <div className="g-seg">
          <button type="button" aria-pressed={mode === "race"} onClick={() => (setMode("race"), setNames(names.slice(0, 2)))}>
            {ui.race}
          </button>
          <button type="button" aria-pressed={mode === "killer"} onClick={() => setMode("killer")}>
            {ui.killer}
          </button>
        </div>
        {mode === "race" ? (
          <>
            <span className="split-label">{ui.raceTo}</span>
            <div className="g-seg">
              {[1, 3, 5, 7].map((n) => (
                <button key={n} type="button" aria-pressed={raceTo === n} onClick={() => setRaceTo(n)}>
                  {n}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <span className="split-label">{ui.lives}</span>
            <div className="g-seg">
              {[2, 3, 5].map((n) => (
                <button key={n} type="button" aria-pressed={lives === n} onClick={() => setLives(n)}>
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
        <span className="split-label">{ui.players}</span>
        <PlayerList names={names} setNames={setNames} min={2} max={mode === "race" ? 2 : 10} />
      </div>
      <button className="g-btn" data-act="pool-start" onClick={start}>
        🎱 {ui.start}
      </button>
    </>
  );
}

/* ---------- Darts & pool section ---------- */

const BAR_UI: Record<Lang, { title: string; sub: string; dartsS: string; poolS: string }> = {
  en: { title: "Darts & pool", sub: "Scorers for the board and the table. Pass the phone, we'll do the maths.", dartsS: "301 or 501 · checkout tips · averages", poolS: "Race to frames · break and suits · killer pool" },
  ar: { title: "السهام والبلياردو", sub: "حاسبات للوحة السهام وطاولة البلياردو. مرّر الهاتف ونحن نحسب.", dartsS: "301 أو 501 · اقتراحات الإنهاء · المعدلات", poolS: "سباق الأشواط · الكسر والألوان · بلياردو القاتل" },
};

export function BarHub() {
  const { venue, lang, L, go } = useGuest();
  const u = BAR_UI[lang];
  const on = (k: string) => gameOn(venue.games as Record<string, boolean>, k);
  const cards = [
    ["darts", "target", u.dartsS, "bar-darts"],
    ["pool", "ball", u.poolS, "bar-pool"],
  ].filter(([k]) => on(k));
  return (
    <>
      <div>
        <h2 className="g-h">{u.title}</h2>
        <p className="g-sub">{u.sub}</p>
      </div>
      <div className="bar-hub">
        {cards.map(([k, ic, sub, cls]) => {
          const g = GAMES.find((x) => x.key === k)!;
          return (
            <button key={k} className={`bar-tile ${cls}`} data-game={k} onClick={() => go(k)}>
              <span className="glass-ico lg" aria-hidden="true">
                <Glyph k={ic} />
              </span>
              <b>{L(g.title)}</b>
              <small>{sub}</small>
            </button>
          );
        })}
      </div>
    </>
  );
}

"use client";
import { buzz, HAPTIC } from "@/lib/haptics";
// "Who pays the bill?" / Sip wheel, plus card and dice drinking games. Names never leave the phone.
import { useEffect, useRef, useState } from "react";
import { CARD_RULES, DICE_RULES } from "@/lib/gameContent";
import type { Lang } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { GameHead } from "./Engines";
import { useScores } from "../Leaderboard";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    names: "Who's at the table?", add: "Add", placeholder: "Type a name", spin: "Spin the wheel", spinning: "Spinning…",
    pays: "pays the bill! 💸", sips: "takes a sip! 🥂", needTwo: "Add at least two names to spin.", again: "Spin again",
    higher: "Higher ⬆", lower: "Lower ⬇", streak: "Streak", left: "cards left", right: "Correct! Keep going.",
    wrong: "Wrong! Take a sip.", same: "Same card! Free pass.", draw: "Draw a card", newDeck: "New deck", roll: "Roll the dice",
    lastKing: "That's the last King: game over! Shuffle to play again.", kings: "Kings", tapCard: "Tap to draw",
  },
  ar: {
    names: "من على الطاولة؟", add: "أضف", placeholder: "اكتب اسماً", spin: "لف العجلة", spinning: "تدور…",
    pays: "سيدفع الحساب! 💸", sips: "يأخذ رشفة! 🥂", needTwo: "أضف اسمين على الأقل للف العجلة.", again: "لف مرة أخرى",
    higher: "أعلى ⬆", lower: "أقل ⬇", streak: "السلسلة", left: "بطاقة متبقية", right: "صحيح! استمر.",
    wrong: "خطأ! خذ رشفة.", same: "نفس البطاقة! تمريرة مجانية.", draw: "اسحب بطاقة", newDeck: "رزمة جديدة", roll: "ارمِ النرد",
    lastKing: "هذا آخر ملك: انتهت اللعبة! اخلط للعب مجدداً.", kings: "الملوك", tapCard: "اضغط للسحب",
  },
};
const useUi = () => UI[useGuest().lang];

const SLICE = ["#FF5A4E", "#FFB51F", "#12A594", "#6E4BFF", "#F0457F", "#4CC9F0", "#7ED957", "#FF9F1C"];

/** Point on a circle, angle in degrees clockwise from 12 o'clock. */
const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [100 + r * Math.sin(a), 100 - r * Math.cos(a)] as const;
};

export function SpinWheel({ k, mode }: { k: string; mode: "bill" | "sip" }) {
  const { log } = useGuest();
  const ui = useUi();
  const [names, setNames] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("patt-names") || "[]");
    } catch {
      return [];
    }
  });
  const [draft, setDraft] = useState("");
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const target = useRef(0);

  useEffect(() => {
    try {
      sessionStorage.setItem("patt-names", JSON.stringify(names));
    } catch {}
  }, [names]);

  const add = () => {
    const n = draft.trim().slice(0, 18);
    if (n && names.length < 12) setNames([...names, n]);
    setDraft("");
    setWinner(null);
  };

  function spin() {
    if (names.length < 2 || spinning) return;
    const i = Math.floor(Math.random() * names.length);
    const seg = 360 / names.length;
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    // Land the pointer (top) on the middle of slice i, after 5–7 full turns.
    const base = rot - (rot % 360) + 360 * (5 + Math.floor(Math.random() * 3));
    const next = base + (360 - (i + 0.5) * seg + jitter);
    target.current = i;
    setWinner(null);
    setSpinning(true);
    setRot(next);
    log("game_start", { item: k });
  }

  const seg = names.length ? 360 / names.length : 360;

  return (
    <>
      <GameHead k={k} />
      <div className="wheel-wrap">
        <span className="wheel-pointer" aria-hidden="true">
          ▼
        </span>
        <svg
          className="wheel"
          viewBox="0 0 200 200"
          style={{ transform: `rotate(${rot}deg)`, transition: spinning ? "transform 4.2s cubic-bezier(.12,.68,.18,1)" : "none" }}
          onTransitionEnd={() => {
            if (!spinning) return;
            setSpinning(false);
            setWinner(names[target.current]);
            log("game_finish", { item: k });
            buzz(80);
          }}
          role="img"
          aria-label="Wheel"
        >
          {names.length < 2 ? (
            <circle cx="100" cy="100" r="96" fill="var(--surface-2)" />
          ) : (
            names.map((n, i) => {
              const [x0, y0] = pt(96, i * seg), [x1, y1] = pt(96, (i + 1) * seg);
              const [tx, ty] = pt(60, (i + 0.5) * seg);
              return (
                <g key={i}>
                  <path d={`M100 100 L${x0} ${y0} A96 96 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`} fill={SLICE[i % SLICE.length]} stroke="#fff" strokeWidth="1.5" />
                  <text
                    x={tx}
                    y={ty}
                    fill="#fff"
                    fontSize={names.length > 8 ? 9 : 11}
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${(i + 0.5) * seg - 90} ${tx} ${ty})`}
                  >
                    {n.length > 10 ? n.slice(0, 9) + "…" : n}
                  </text>
                </g>
              );
            })
          )}
          <circle cx="100" cy="100" r="14" fill="#fff" stroke="#1B1740" strokeWidth="3" />
        </svg>
      </div>

      {winner && (
        <div className="prompt date wheel-result">
          <p>
            {winner} {mode === "bill" ? ui.pays : ui.sips}
          </p>
        </div>
      )}

      <button className="g-btn" data-act="spin" onClick={spin} disabled={spinning || names.length < 2}>
        {spinning ? ui.spinning : winner ? ui.again : ui.spin}
      </button>

      <div className="g-card">
        <b>{ui.names}</b>
        <form
          className="name-add"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input value={draft} maxLength={18} placeholder={ui.placeholder} onChange={(e) => setDraft(e.target.value)} enterKeyHint="done" />
          <button className="g-btn" type="submit" disabled={!draft.trim()}>
            {ui.add}
          </button>
        </form>
        <div className="name-chips">
          {names.map((n, i) => (
            <button key={`${n}-${i}`} className="name-chip" onClick={() => (setNames(names.filter((_, j) => j !== i)), setWinner(null))} aria-label={`Remove ${n}`}>
              <span style={{ background: SLICE[i % SLICE.length] }} />
              {n} ×
            </button>
          ))}
        </div>
        {names.length < 2 && <span className="g-sub">{ui.needTwo}</span>}
      </div>
    </>
  );
}

/* ---------- Cards ---------- */

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♠", "♥", "♦", "♣"];
type Card = { r: string; s: string };
const newDeck = (): Card[] => shuffle(RANKS.flatMap((r) => SUITS.map((s) => ({ r, s }))));
const value = (c: Card) => (c.r === "A" ? 14 : c.r === "J" ? 11 : c.r === "Q" ? 12 : c.r === "K" ? 13 : Number(c.r));

function PlayingCard({ c, flip }: { c: Card | null; flip?: boolean }) {
  if (!c) return <div className="pcard back" />;
  const red = c.s === "♥" || c.s === "♦";
  return (
    <div key={`${c.r}${c.s}`} className={`pcard${red ? " red" : ""}${flip ? " flip" : ""}`}>
      <span className="pc-corner">
        {c.r}
        <br />
        {c.s}
      </span>
      <span className="pc-mid">{c.s}</span>
      <span className="pc-corner pc-br">
        {c.r}
        <br />
        {c.s}
      </span>
    </div>
  );
}

export function HigherLower({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [deck, setDeck] = useState(newDeck);
  const [cur, setCur] = useState<Card>(() => deck[0]);
  const [pos, setPos] = useState(1);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState<{ t: string; tone: "ok" | "bad" | "" } | null>(null);
  const { report } = useScores();

  function guess(higher: boolean) {
    let d = deck, p = pos;
    if (p >= d.length) {
      d = newDeck();
      p = 0;
      setDeck(d);
    }
    const next = d[p];
    const diff = value(next) - value(cur);
    if (diff === 0) setMsg({ t: ui.same, tone: "" });
    else if (diff > 0 === higher) {
      setStreak((s) => s + 1);
      setMsg({ t: ui.right, tone: "ok" });
      buzz();
    } else {
      if (streak >= 3) log("game_finish", { item: k, value: streak });
      if (streak >= 1) report(k, streak);
      setStreak(0);
      setMsg({ t: ui.wrong, tone: "bad" });
      buzz(HAPTIC.bad);
    }
    setCur(next);
    setPos(p + 1);
  }

  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>
          {ui.streak}: {streak} 🔥
        </span>
        <span>
          {Math.max(0, deck.length - pos)} {ui.left}
        </span>
      </div>
      <div className="card-table">
        <PlayingCard c={cur} flip />
      </div>
      <p className={`g-service-msg${msg?.tone === "bad" ? " bad" : ""}`} style={{ visibility: msg ? "visible" : "hidden", textAlign: "center" }}>
        {msg?.t ?? "."}
      </p>
      <div className="g-row">
        <button className="g-btn" data-act="higher" onClick={() => guess(true)}>
          {ui.higher}
        </button>
        <button className="g-btn alt" data-act="lower" onClick={() => guess(false)}>
          {ui.lower}
        </button>
      </div>
    </>
  );
}

export function CardRules({ k }: { k: string }) {
  const { L, log } = useGuest();
  const ui = useUi();
  const [deck, setDeck] = useState(newDeck);
  const [pos, setPos] = useState(0);
  const card = pos > 0 ? deck[pos - 1] : null;
  const kingsDrawn = deck.slice(0, pos).filter((c) => c.r === "K").length;
  const over = kingsDrawn >= 4 || pos >= deck.length;
  useEffect(() => {
    if (over && pos > 0) log("game_finish", { item: k, value: pos });
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>
          {ui.kings}: {kingsDrawn}/4 👑
        </span>
        <span>
          {deck.length - pos} {ui.left}
        </span>
      </div>
      <button className="card-table" onClick={() => !over && setPos(pos + 1)} aria-label={ui.draw}>
        <PlayingCard c={card} flip={Boolean(card)} />
        {!card && <span className="card-hint">{ui.tapCard}</span>}
      </button>
      {card && (
        <div className="prompt date">
          <p style={{ fontSize: "1.3rem" }}>{over && kingsDrawn >= 4 ? ui.lastKing : L(CARD_RULES[card.r])}</p>
        </div>
      )}
      <button
        className="g-btn"
        onClick={() => {
          if (over) {
            setDeck(newDeck());
            setPos(0);
            log("game_start", { item: k });
          } else setPos(pos + 1);
        }}
      >
        {over ? ui.newDeck : ui.draw}
      </button>
    </>
  );
}

/* ---------- Dice ---------- */

const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function Die({ n, rolling }: { n: number; rolling: boolean }) {
  return (
    <div className={`die${rolling ? " rolling" : ""}`} aria-label={String(n)}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={PIPS[n].includes(i) ? "pip" : ""} />
      ))}
    </div>
  );
}

export function DrinkDice({ k }: { k: string }) {
  const { L, log } = useGuest();
  const ui = useUi();
  const [d, setD] = useState<[number, number]>([3, 4]);
  const [rolling, setRolling] = useState(false);
  const [rule, setRule] = useState<string | null>(null);
  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setRule(null);
    let n = 0;
    const t = setInterval(() => {
      setD([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]);
      if (++n >= 10) {
        clearInterval(t);
        const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6);
        setD([a, b]);
        setRolling(false);
        setRule(L(DICE_RULES.find((r) => r.test(a, b))!.t));
        log("game_finish", { item: k });
      }
    }, 70);
  };
  return (
    <>
      <GameHead k={k} />
      <button className="dice-table" onClick={roll} aria-label={ui.roll}>
        <Die n={d[0]} rolling={rolling} />
        <Die n={d[1]} rolling={rolling} />
      </button>
      <div className="prompt date" style={{ minHeight: 120, visibility: rule ? "visible" : "hidden" }}>
        <p style={{ fontSize: "1.3rem" }}>{rule ?? "."}</p>
      </div>
      <button className="g-btn" onClick={roll} disabled={rolling}>
        🎲 {ui.roll}
      </button>
    </>
  );
}

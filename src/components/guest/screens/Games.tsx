"use client";
import { useEffect, useRef, useState } from "react";
import { DATE_DECKS, GROUP_Q, PICKER_TASKS, THIS_THAT, type TKey } from "@/lib/content";
import { gameOn } from "@/lib/games";
import type { Loc } from "@/lib/types";
import { shuffle, useGuest } from "../context";

/* ---------- Play together ---------- */

export function GroupHub() {
  const { tr, go, venue } = useGuest();
  const pick = (k: TKey) => gameOn(venue.games, k) && (
    <button className="g-pick bg-group" onClick={() => go(k)}>
      <b>{tr(k)}</b>
      <span>{tr(`${k}S` as TKey)}</span>
    </button>
  );
  return (
    <>
      <div>
        <h2 className="g-h">{tr("groupTitle")}</h2>
        <p className="g-sub">{tr("groupSub")}</p>
      </div>
      <div className="g-list">
        {pick("quick")}
        {pick("tot")}
        {pick("picker")}
      </div>
    </>
  );
}

export function Quick() {
  const { tr, L } = useGuest();
  const [order] = useState(() => shuffle(GROUP_Q));
  const [i, setI] = useState(0);
  const n = i % order.length;
  return (
    <>
      <div>
        <h2 className="g-h">{tr("quick")}</h2>
        <p className="g-sub">{tr("quickS")}</p>
      </div>
      <div className="prompt group">
        <span className="count">
          {n + 1} / {order.length}
        </span>
        <p>{L(order[n])}</p>
      </div>
      <div className="g-row">
        <button className="g-btn alt" onClick={() => setI(i + 1)}>
          {tr("skip")}
        </button>
        <button className="g-btn" onClick={() => setI(i + 1)}>
          {tr("next")}
        </button>
      </div>
    </>
  );
}

export function ThisOrThat() {
  const { tr, L } = useGuest();
  const [order] = useState(() => shuffle(THIS_THAT));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const pair = order[i % order.length];
  return (
    <>
      <div>
        <h2 className="g-h">{tr("tot")}</h2>
        <p className="g-sub">{tr("totS")}</p>
      </div>
      <div className="tot">
        {pair.map((o, n) => (
          <button key={n} aria-pressed={pick === n} onClick={() => setPick(n)}>
            {L(o)}
          </button>
        ))}
      </div>
      <button
        className="g-btn"
        onClick={() => {
          setI(i + 1);
          setPick(null);
        }}
      >
        {tr("next")}
      </button>
    </>
  );
}

export function Picker() {
  const { tr, L } = useGuest();
  const [players, setPlayers] = useState(4);
  const [num, setNum] = useState<number | null>(null);
  const [task, setTask] = useState<Loc | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  const spin = () => {
    clearInterval(timer.current);
    setTask(null);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let f = 0;
    timer.current = setInterval(() => {
      f++;
      const n = 1 + Math.floor(Math.random() * players);
      setNum(n);
      if (f >= (reduce ? 1 : 14)) {
        clearInterval(timer.current);
        setTask(PICKER_TASKS[Math.floor(Math.random() * PICKER_TASKS.length)]);
      }
    }, 70);
  };
  const step = (d: number) => {
    clearInterval(timer.current);
    setPlayers((p) => Math.min(12, Math.max(2, p + d)));
    setNum(null);
    setTask(null);
  };

  return (
    <>
      <div>
        <h2 className="g-h">{tr("picker")}</h2>
        <p className="g-sub">{tr("pickerS")}</p>
      </div>
      <div className="stepper">
        <button aria-label="−" onClick={() => step(-1)}>
          −
        </button>
        <output>
          {tr("players")}: {players}
        </output>
        <button aria-label="+" onClick={() => step(1)}>
          +
        </button>
      </div>
      <div className="prompt group">
        <span className="count">{tr("player")}</span>
        <div className="picker-num">{num ?? "?"}</div>
        {task && (
          <>
            <p style={{ fontSize: "1.2rem" }}>{tr("goes")}</p>
            <span className="count" style={{ marginTop: 6 }}>
              {tr("task")}
            </span>
            <p style={{ fontSize: "1.25rem" }}>{L(task)}</p>
          </>
        )}
      </div>
      <button className="g-btn" onClick={spin}>
        {tr("pick")}
      </button>
      <p className="g-note" style={{ textAlign: "center" }}>
        {tr("pass")}
      </p>
    </>
  );
}

/* ---------- Date night ---------- */

export function DateHub() {
  const { tr, L, go, venue } = useGuest();
  return (
    <>
      <div>
        <h2 className="g-h">{tr("dateTitle")}</h2>
        <p className="g-sub">{tr("dateSub")}</p>
      </div>
      <div className="g-list">
        {DATE_DECKS.filter((d) => gameOn(venue.games, `deck:${d.id}`)).map((d) => (
          <button key={d.id} className="g-pick bg-date" onClick={() => go(`deck:${d.id}`)}>
            <b>{L(d.t)}</b>
            <span>
              {L(d.s)} · {d.cards.length}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/** One deck. Answers are spoken aloud; nothing is stored. */
export function Deck({ id, onExit }: { id: string; onExit: () => void }) {
  const { tr, L, log } = useGuest();
  const deck = DATE_DECKS.find((d) => d.id === id) ?? DATE_DECKS[0];
  const [order] = useState(() => shuffle(deck.cards));
  const [i, setI] = useState(0);
  const done = i >= order.length;
  useEffect(() => {
    if (done) log("game_finish", { item: `deck:${deck.id}` });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (i >= order.length)
    return (
      <>
        <div>
          <h2 className="g-h">{L(deck.t)}</h2>
        </div>
        <div className="prompt date">
          <p>{tr("deckDone")}</p>
        </div>
        <button className="g-btn" onClick={onExit}>
          {tr("dateTitle")}
        </button>
      </>
    );

  return (
    <>
      <div>
        <h2 className="g-h">{L(deck.t)}</h2>
        <p className="g-sub">{L(deck.s)}</p>
      </div>
      <div className="prompt date">
        <span className="count">
          {tr("card")} {i + 1} / {order.length}
        </span>
        <p>{L(order[i])}</p>
      </div>
      <div className="g-row">
        <button className="g-btn alt" onClick={() => setI(i + 1)}>
          {tr("skip")}
        </button>
        <button className="g-btn" onClick={() => setI(i + 1)}>
          {tr("reveal")}
        </button>
      </div>
      <button className="g-btn alt" onClick={onExit}>
        {tr("finish")}
      </button>
    </>
  );
}

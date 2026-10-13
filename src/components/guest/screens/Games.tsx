"use client";
import { CardStage } from "./CardStage";
import { sfx } from "@/lib/sfx";
import { useEffect, useRef, useState } from "react";
import { PICKER_TASKS } from "@/lib/content";
import { ALL_DATE_DECKS } from "@/lib/games";
import type { Loc } from "@/lib/types";
import { shuffle, useGuest } from "../context";

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

/** One deck. Answers are spoken aloud; nothing is stored. */
export function Deck({ id, onExit }: { id: string; onExit: () => void }) {
  const { tr, L, log } = useGuest();
  const deck = ALL_DATE_DECKS.find((d) => d.id === id) ?? ALL_DATE_DECKS[0];
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

  const next = () => (sfx.tap(), setI(i + 1));
  return (
    <>
      <div>
        <h2 className="g-h">{L(deck.t)}</h2>
        <p className="g-sub">{L(deck.s)}</p>
      </div>
      <CardStage tone="date" index={i} total={order.length} label={tr("card")} onNext={next}>
        <p className="cs-text">{L(order[i])}</p>
      </CardStage>
      <div className="g-row">
        <button className="g-btn alt" onClick={next}>
          {tr("skip")}
        </button>
        <button className="g-btn" data-act="next" onClick={next}>
          {tr("next")} →
        </button>
      </div>
      <button className="g-btn alt" onClick={onExit}>
        {tr("finish")}
      </button>
    </>
  );
}

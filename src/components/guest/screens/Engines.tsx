"use client";
import { buzz, HAPTIC } from "@/lib/haptics";
// Reusable game engines + the newer one-off games. Nothing a guest does here is saved.
import { useEffect, useRef, useState } from "react";
import { COUNT_ITEMS, ODD_SETS } from "@/lib/gameContent";
import { CATS, GAMES, gameOn, KIDS_BANDS, type GameCat, type GameGroup, type GameInfo } from "@/lib/games";
import type { Lang, Loc } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { ParentBar } from "../KidsLock";
import { useScores } from "../Leaderboard";

type Tone = "kids" | "group" | "date";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    showAnswer: "Show answer", start: "Start", gotIt: "Got it!", timeUp: "Time's up!", score: "Score", round: "Round",
    newRound: "New round", nextCat: "Next category", seconds: "s", turn: "Turn", wins: "wins!", draw: "It's a draw!",
    tapOdd: "Tap the one that's different", howMany: "How many can you see?", great: "Great job!", tryAgain: "Try again!",
    yourScore: "You scored", actIt: "Act this out for your team", passPhone: "Pass the phone to the actor",
    nameFive: "Name five", ready: "Ready?",
  },
  ar: {
    showAnswer: "اكشف الإجابة", start: "ابدأ", gotIt: "صح!", timeUp: "انتهى الوقت!", score: "النتيجة", round: "الجولة",
    newRound: "جولة جديدة", nextCat: "الفئة التالية", seconds: "ث", turn: "الدور", wins: "فاز!", draw: "تعادل!",
    tapOdd: "اضغط على الشكل المختلف", howMany: "كم واحدة ترى؟", great: "أحسنت!", tryAgain: "حاول مجدداً!",
    yourScore: "نتيجتك", actIt: "مثّل هذا لفريقك", passPhone: "أعطِ الهاتف للممثل",
    nameFive: "اذكر خمسة", ready: "مستعد؟",
  },
};
const useUi = () => UI[useGuest().lang];

export function GameHead({ k }: { k: string }) {
  const { L } = useGuest();
  const g = GAMES.find((x) => x.key === k);
  if (!g) return null;
  return (
    <div>
      <h2 className="g-h">{L(g.title)}</h2>
      <p className="g-sub">{L(g.sub)}</p>
    </div>
  );
}

/** List of the venue's switched-on games for one section. */
export function GameHub({ group, title, sub, note }: { group: GameGroup; title: string; sub: string; note?: string }) {
  const { venue, go, L, tr } = useGuest();
  const cls = group === "kids" ? "bg-kids" : group === "group" ? "bg-group" : "bg-date";
  const list = GAMES.filter((g) => g.group === group && g.cat !== "featured" && gameOn(venue.games as Record<string, boolean>, g.key));
  const card = (g: GameInfo) => (
    <button key={g.key} className={`g-pick ${cls}`} data-game={g.key} onClick={() => go(g.key)}>
      {g.icon && (
        <span className="g-pick-ico" aria-hidden="true">
          {g.icon}
        </span>
      )}
      <b>{L(g.title)}</b>
      <span>{L(g.sub)}</span>
      {g.ages && (
        <span className="age">
          {tr("ages")} {g.ages}
        </span>
      )}
    </button>
  );
  return (
    <>
      <div>
        <h2 className="g-h">{title}</h2>
        <p className="g-sub">{sub}</p>
      </div>
      {group === "kids" && <ParentBar />}
      {group === "kids" ? (
        KIDS_BANDS.map(({ band, label }) => {
          const inBand = list.filter((g) => g.band === band);
          if (!inBand.length) return null;
          return (
            <section key={band} className="g-band">
              <h3 className="g-band-h">{L(label)}</h3>
              <div className="g-list g-list-2">{inBand.map(card)}</div>
            </section>
          );
        })
      ) : group === "group" || group === "drink" ? (
        <>
          {group === "group" && gameOn(venue.games as Record<string, boolean>, "split") && <FeatureBanner k="split" />}
          {gameOn(venue.games as Record<string, boolean>, "bill") && <FeatureBanner k="bill" />}
          {(Object.keys(CATS) as GameCat[])
            .filter((c) => c !== "featured")
            .map((c) => {
              const inCat = list.filter((g) => g.cat === c);
              if (!inCat.length) return null;
              return (
                <section key={c} className="g-band">
                  <h3 className="g-band-h">{L(CATS[c])}</h3>
                  <div className="g-list g-list-2">{inCat.map(card)}</div>
                </section>
              );
            })}
        </>
      ) : (
        <div className="g-list">{list.map(card)}</div>
      )}
      {note && <p className="g-note">{note}</p>}
    </>
  );
}

/** Featured banners ("Who pays the bill?", "Split the bill") at the top of the adult and drinking hubs. */
function FeatureBanner({ k }: { k: string }) {
  const { go, L } = useGuest();
  const g = GAMES.find((x) => x.key === k)!;
  return (
    <button className="g-feature" data-game={k} onClick={() => go(k)}>
      <span className="g-feature-ico" aria-hidden="true">
        {g.icon}
      </span>
      <span>
        <b>{L(g.title)}</b>
        <span>{L(g.sub)}</span>
      </span>
      <span aria-hidden="true">›</span>
    </button>
  );
}

/* ---------- Prompt cards (Quick questions, Most likely to, Never have I ever) ---------- */

export function PromptCards({ k, items, tone, note }: { k: string; items: Loc[]; tone: Tone; note?: string }) {
  const { tr, L } = useGuest();
  const [order] = useState(() => shuffle(items));
  const [i, setI] = useState(0);
  const n = i % order.length;
  return (
    <>
      <GameHead k={k} />
      <div className={`prompt ${tone}`}>
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
      {note && <p className="g-note">{note}</p>}
    </>
  );
}

/* ---------- Pairs (This or that, Would you rather) ---------- */

export function Pairs({ k, pairs }: { k: string; pairs: [Loc, Loc][] }) {
  const { tr, L } = useGuest();
  const [order] = useState(() => shuffle(pairs));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const pair = order[i % order.length];
  return (
    <>
      <GameHead k={k} />
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

/* ---------- Multiple-choice quiz ---------- */

type Q = { q: Loc; o: Loc[]; a: number };

export function QuizGame({ k, questions, tone, rounds = 5 }: { k: string; questions: Q[]; tone: Tone; rounds?: number }) {
  const { tr, L, log, demo } = useGuest();
  const fresh = () => ({ order: shuffle(questions).slice(0, rounds), i: 0, score: 0, ans: null as number | null });
  const [z, setZ] = useState(fresh);
  const over = z.i >= z.order.length;
  useEffect(() => {
    if (over) log("game_finish", { item: k, value: z.score });
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (over)
    return (
      <>
        <GameHead k={k} />
        <div className={`prompt ${tone}`}>
          <p>
            {tr("score")} {z.score} {tr("of")} {z.order.length}!
          </p>
        </div>
        <button
          className="g-btn"
          onClick={() => {
            setZ(fresh());
            log("game_start", { item: k });
          }}
        >
          {tr("playAgain")}
        </button>
      </>
    );

  const q = z.order[z.i];
  return (
    <>
      <GameHead k={k} />
      <div className={`prompt ${tone}`}>
        <span className="count">
          {z.i + 1} / {z.order.length}
        </span>
        <p>{L(q.q)}</p>
      </div>
      <div className="quiz-opts">
        {q.o.map((o, i) => {
          const cls = z.ans == null ? "" : i === q.a ? "right" : i === z.ans ? "wrong" : "";
          return (
            <button
              key={i}
              className={cls}
              disabled={z.ans != null}
              data-right={demo && i === q.a ? "" : undefined}
              onClick={() => (buzz(i === q.a ? HAPTIC.good : HAPTIC.bad), setZ({ ...z, ans: i, score: z.score + (i === q.a ? 1 : 0) }))}
            >
              {L(o)}
            </button>
          );
        })}
      </div>
      <p className="feedback" aria-live="polite">
        {z.ans == null ? "" : z.ans === q.a ? tr("correct") : `${tr("notQuite")} ${L(q.o[q.a])}.`}
      </p>
      {z.ans != null && (
        <button className="g-btn" data-act="next" onClick={() => setZ({ ...z, i: z.i + 1, ans: null })}>
          {tr("next")}
        </button>
      )}
    </>
  );
}

/* ---------- Reveal the answer (Riddles, Emoji films) ---------- */

export function Reveal({ k, items, tone, big }: { k: string; items: { q: Loc; a: Loc }[]; tone: Tone; big?: boolean }) {
  const { tr, L } = useGuest();
  const ui = useUi();
  const [order] = useState(() => shuffle(items));
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const it = order[i % order.length];
  return (
    <>
      <GameHead k={k} />
      <div className={`prompt ${tone}`}>
        <span className="count">
          {(i % order.length) + 1} / {order.length}
        </span>
        <p style={big ? { fontSize: "3rem", lineHeight: 1.1 } : undefined}>{L(it.q)}</p>
        {shown && <p className="reveal-answer">{L(it.a)}</p>}
      </div>
      <div className="g-row">
        {!shown ? (
          <button className="g-btn" onClick={() => setShown(true)}>
            {ui.showAnswer}
          </button>
        ) : (
          <button
            className="g-btn"
            onClick={() => {
              setI(i + 1);
              setShown(false);
            }}
          >
            {tr("next")}
          </button>
        )}
      </div>
    </>
  );
}

/* ---------- Countdown helper ---------- */

function useCountdown(onEnd: () => void) {
  const [left, setLeft] = useState<number | null>(null);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => {
    if (left == null) return;
    if (left <= 0) {
      end.current();
      return;
    }
    const t = setTimeout(() => setLeft((s) => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return [left, setLeft] as const;
}

/* ---------- Charades: 60-second rounds ---------- */

export function Charades({ k, words }: { k: string; words: Loc[] }) {
  const { tr, L, log } = useGuest();
  const ui = useUi();
  const [order, setOrder] = useState(() => shuffle(words));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [left, setLeft] = useCountdown(() => {
    setDone(true);
    log("game_finish", { item: k, value: score });
  });
  const running = left != null && left > 0 && !done;

  return (
    <>
      <GameHead k={k} />
      <div className="prompt group">
        {!running && !done && (
          <>
            <span className="count">{ui.passPhone}</span>
            <p>{ui.ready}</p>
          </>
        )}
        {running && (
          <>
            <span className="count">
              {ui.actIt} · {left}
              {ui.seconds}
            </span>
            <p>{L(order[i % order.length])}</p>
          </>
        )}
        {done && (
          <>
            <span className="count">{ui.timeUp}</span>
            <p>
              {ui.score}: {score}
            </p>
          </>
        )}
      </div>
      {running ? (
        <div className="g-row">
          <button className="g-btn alt" onClick={() => setI(i + 1)}>
            {tr("skip")}
          </button>
          <button
            className="g-btn"
            onClick={() => {
              setScore(score + 1);
              setI(i + 1);
            }}
          >
            {ui.gotIt}
          </button>
        </div>
      ) : (
        <button
          className="g-btn"
          onClick={() => {
            setOrder(shuffle(words));
            setI(0);
            setScore(0);
            setDone(false);
            setLeft(60);
          }}
        >
          {done ? ui.newRound : ui.start} (60{ui.seconds})
        </button>
      )}
    </>
  );
}

/* ---------- Name five: 30 seconds per category ---------- */

export function NameFive({ k, cats }: { k: string; cats: Loc[] }) {
  const { L } = useGuest();
  const ui = useUi();
  const [order] = useState(() => shuffle(cats));
  const [i, setI] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [left, setLeft] = useCountdown(() => setTimeUp(true));
  return (
    <>
      <GameHead k={k} />
      <div className="prompt group">
        <span className="count">
          {ui.nameFive} · {left == null ? "30" : left}
          {ui.seconds}
        </span>
        <p>{L(order[i % order.length])}</p>
        {timeUp && <p style={{ fontSize: "1.1rem" }}>{ui.timeUp}</p>}
      </div>
      <div className="g-row">
        <button
          className="g-btn alt"
          onClick={() => {
            setI(i + 1);
            setTimeUp(false);
            setLeft(null);
          }}
        >
          {ui.nextCat}
        </button>
        <button
          className="g-btn"
          onClick={() => {
            setTimeUp(false);
            setLeft(30);
          }}
        >
          {ui.start}
        </button>
      </div>
    </>
  );
}

/* ---------- Odd one out ---------- */

const ODD_ROUNDS = 8;

export function OddOneOut({ k }: { k: string }) {
  const { tr, log } = useGuest();
  const ui = useUi();
  const make = () => {
    const set = ODD_SETS[Math.floor(Math.random() * ODD_SETS.length)];
    return { set, odd: Math.floor(Math.random() * 16) };
  };
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [r, setR] = useState(make);
  const [wrong, setWrong] = useState<number | null>(null);
  const over = round > ODD_ROUNDS;
  const { report } = useScores();
  useEffect(() => {
    if (over) (log("game_finish", { item: k, value: score }), report(k, score));
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (over)
    return (
      <>
        <GameHead k={k} />
        <div className="prompt kids">
          <p>
            {ui.yourScore} {score} / {ODD_ROUNDS}! {ui.great}
          </p>
        </div>
        <button className="g-btn" onClick={() => (setRound(1), setScore(0), setR(make()), log("game_start", { item: k }))}>
          {tr("playAgain")}
        </button>
      </>
    );

  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>
          {ui.round} {round} / {ODD_ROUNDS}
        </span>
        <span>
          {ui.score}: {score}
        </span>
      </div>
      <p className="g-sub" style={{ textAlign: "center" }}>
        {ui.tapOdd}
      </p>
      <div className="emoji-grid">
        {Array.from({ length: 16 }, (_, i) => (
          <button
            key={`${round}-${i}`}
            className={wrong === i ? "shake" : ""}
            onClick={() => {
              if (i === r.odd) {
                buzz();
                setScore(score + (wrong == null ? 1 : 0));
                setRound(round + 1);
                setR(make());
                setWrong(null);
              } else setWrong(i);
            }}
          >
            {i === r.odd ? r.set.odd : r.set.same}
          </button>
        ))}
      </div>
      <p className="feedback" aria-live="polite">
        {wrong != null ? ui.tryAgain : ""}
      </p>
    </>
  );
}

/* ---------- Count it ---------- */

const COUNT_ROUNDS = 6;

export function CountIt({ k }: { k: string }) {
  const { tr, log } = useGuest();
  const ui = useUi();
  const make = () => {
    const n = 3 + Math.floor(Math.random() * 10);
    const opts = shuffle([...new Set([n, Math.max(1, n - 1 - Math.floor(Math.random() * 2)), n + 1 + Math.floor(Math.random() * 2)])]);
    // Spread items out on a 5x4 grid so none overlap.
    const spots = shuffle(Array.from({ length: 20 }, (_, i) => i)).slice(0, n);
    return { n, opts, spots, item: COUNT_ITEMS[Math.floor(Math.random() * COUNT_ITEMS.length)] };
  };
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [r, setR] = useState(make);
  const [picked, setPicked] = useState<number | null>(null);
  const over = round > COUNT_ROUNDS;
  const { report } = useScores();
  useEffect(() => {
    if (over) (log("game_finish", { item: k, value: score }), report(k, score));
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  if (over)
    return (
      <>
        <GameHead k={k} />
        <div className="prompt kids">
          <p>
            {ui.yourScore} {score} / {COUNT_ROUNDS}! {ui.great}
          </p>
        </div>
        <button className="g-btn" onClick={() => (setRound(1), setScore(0), setR(make()), log("game_start", { item: k }))}>
          {tr("playAgain")}
        </button>
      </>
    );

  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>
          {ui.round} {round} / {COUNT_ROUNDS}
        </span>
        <span>
          {ui.score}: {score}
        </span>
      </div>
      <div className="count-box" aria-label={ui.howMany}>
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i}>{r.spots.includes(i) ? r.item : ""}</span>
        ))}
      </div>
      <p className="g-sub" style={{ textAlign: "center" }}>
        {ui.howMany}
      </p>
      <div className="quiz-opts" style={{ flexDirection: "row" }}>
        {r.opts.map((o) => (
          <button
            key={o}
            style={{ flex: 1, textAlign: "center", fontSize: "1.4rem", fontWeight: 700 }}
            className={picked == null ? "" : o === r.n ? "right" : o === picked ? "wrong" : ""}
            disabled={picked != null}
            onClick={() => {
              setPicked(o);
              if (o === r.n) setScore(score + 1);
              buzz(o === r.n ? HAPTIC.good : HAPTIC.bad);
            }}
          >
            {o}
          </button>
        ))}
      </div>
      {picked != null && (
        <button className="g-btn" onClick={() => (setRound(round + 1), setR(make()), setPicked(null))}>
          {tr("next")}
        </button>
      )}
    </>
  );
}

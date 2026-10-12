"use client";
// Action games for kids and teens. Everything runs on the phone; nothing is saved or sent except anonymous start/finish counts.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SCRAMBLE_WORDS } from "@/lib/gameContent";
import type { Lang } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { GameHead } from "./Engines";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    start: "Start", again: "Play again", score: "Score", best: "Best", time: "Time", go: "Go!", shoot: "Shoot!",
    goal: "GOAL! ⚽", saved: "Saved! 🧤", missed: "Wide! 😬", shots: "Shots", tapBubbles: "Tap the bubbles before they float away",
    left: "◀ Left", right: "Right ▶", crashed: "Crash! 💥", distance: "Distance", kicks: "Kicks", dropped: "Dropped it!",
    tapBall: "Tap the ball to kick it up", waitGreen: "Wait for green…", tapNow: "TAP NOW!", tooSoon: "Too soon! Wait for green.",
    avg: "Average", ms: "ms", tapToStart: "Tap to start", correct: "Correct!", hint: "Hint", skip: "Skip", solved: "Solved",
    clear: "Clear", vsPhone: "Play the phone", vsFriend: "Play a friend", youWin: "You win! 🎉", phoneWins: "The phone wins!",
    draw: "It's a draw!", yourTurn: "Your turn ❌", thinking: "Phone is thinking…", turn: "Turn", wins: "wins!",
  },
  ar: {
    start: "ابدأ", again: "العب مرة أخرى", score: "النتيجة", best: "الأفضل", time: "الوقت", go: "انطلق!", shoot: "سدّد!",
    goal: "هدف! ⚽", saved: "تصدّى الحارس! 🧤", missed: "خارج المرمى! 😬", shots: "التسديدات", tapBubbles: "افقع الفقاعات قبل أن تطير",
    left: "◀ يسار", right: "يمين ▶", crashed: "اصطدام! 💥", distance: "المسافة", kicks: "الركلات", dropped: "سقطت الكرة!",
    tapBall: "اضغط على الكرة لتركلها للأعلى", waitGreen: "انتظر اللون الأخضر…", tapNow: "اضغط الآن!", tooSoon: "مبكر جداً! انتظر الأخضر.",
    avg: "المتوسط", ms: "م.ث", tapToStart: "اضغط للبدء", correct: "صحيح!", hint: "تلميح", skip: "تخطَّ", solved: "تم الحل",
    clear: "مسح", vsPhone: "العب ضد الهاتف", vsFriend: "العب مع صديق", youWin: "فزت! 🎉", phoneWins: "الهاتف فاز!",
    draw: "تعادل!", yourTurn: "دورك ❌", thinking: "الهاتف يفكر…", turn: "الدور", wins: "فاز!",
  },
};
const useUi = () => UI[useGuest().lang];

/** Personal best kept on this phone only (never sent anywhere). */
function useBest(key: string, higherIsBetter = true) {
  const [best, setBest] = useState<number | null>(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem(`patt-best-${key}`);
      if (v) setBest(Number(v));
    } catch {}
  }, [key]);
  const submit = useCallback(
    (v: number) => {
      setBest((b) => {
        const better = b == null || (higherIsBetter ? v > b : v < b);
        if (!better) return b;
        try {
          localStorage.setItem(`patt-best-${key}`, String(v));
        } catch {}
        return v;
      });
    },
    [key, higherIsBetter],
  );
  return [best, submit] as const;
}

/** requestAnimationFrame loop that runs while `on` is true. */
function useLoop(on: boolean, step: (dt: number) => void) {
  const fn = useRef(step);
  fn.current = step;
  useEffect(() => {
    if (!on) return;
    let raf = 0, last = performance.now();
    const tick = (t: number) => {
      fn.current(Math.min(0.05, (t - last) / 1000));
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
}

function ScoreRow({ items }: { items: [string, string | number][] }) {
  return (
    <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
      {items.map(([k, v]) => (
        <span key={k}>
          {k}: {v}
        </span>
      ))}
    </div>
  );
}

/* ================= Bubble pop (3+) ================= */

type Bubble = { id: number; x: number; y: number; r: number; c: string; vy: number; popped?: boolean };
const BUBBLE_COLOURS = ["#FF5A4E", "#FFB51F", "#12A594", "#6E4BFF", "#F0457F", "#4CC9F0"];

export function BubblePop({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [state, setState] = useState<"ready" | "play" | "done">("ready");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(30);
  const [best, submit] = useBest(k);
  const nextId = useRef(0), spawnT = useRef(0), clock = useRef(30);

  useLoop(state === "play", (dt) => {
    clock.current -= dt;
    setLeft(Math.max(0, Math.ceil(clock.current)));
    spawnT.current -= dt;
    setBubbles((bs) => {
      const n = bs.map((b) => ({ ...b, y: b.y - b.vy * dt })).filter((b) => b.y + b.r > 0);
      if (spawnT.current <= 0) {
        spawnT.current = 0.55;
        const r = 9 + Math.random() * 7;
        n.push({ id: nextId.current++, x: r + Math.random() * (100 - 2 * r), y: 140, r, c: BUBBLE_COLOURS[Math.floor(Math.random() * 6)], vy: 14 + Math.random() * 10 });
      }
      return n;
    });
    if (clock.current <= 0) {
      setState("done");
      log("game_finish", { item: k, value: score });
      submit(score);
    }
  });

  const start = () => {
    clock.current = 30;
    spawnT.current = 0;
    setScore(0);
    setBubbles([]);
    setState("play");
  };

  return (
    <>
      <GameHead k={k} />
      <ScoreRow items={[[ui.score, score], [ui.time, `${left}s`], [ui.best, best ?? "–"]]} />
      <div className="arena bubbles-arena" onPointerDown={() => state === "ready" && start()}>
        {bubbles.map((b) => (
          <button
            key={b.id}
            className={`bubble${b.popped ? " popped" : ""}`}
            aria-label="bubble"
            style={{ left: `${b.x - b.r}%`, top: `${(b.y - b.r) * (100 / 140)}%`, width: `${b.r * 2}%`, background: b.c }}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (state !== "play" || b.popped) return;
              setScore((s) => s + 1);
              setBubbles((bs) => bs.map((x) => (x.id === b.id ? { ...x, popped: true } : x)));
              setTimeout(() => setBubbles((bs) => bs.filter((x) => x.id !== b.id)), 180);
            }}
          />
        ))}
        {state !== "play" && (
          <div className="arena-overlay">
            {state === "done" && <p className="arena-big">🫧 {score}</p>}
            <p>{ui.tapBubbles}</p>
            <button className="g-btn" onClick={start}>
              {state === "done" ? ui.again : ui.start}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ================= Penalty shootout (6+) ================= */

export function Penalty({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const SHOTS = 5;
  const [aim, setAim] = useState(50); // 0..100 across the goal
  const [phase, setPhase] = useState<"aim" | "fly" | "result" | "done">("aim");
  const [keeper, setKeeper] = useState(50);
  const [result, setResult] = useState<"goal" | "saved" | "missed" | null>(null);
  const [shot, setShot] = useState(0);
  const [goals, setGoals] = useState(0);
  const [best, submit] = useBest(k);
  const dir = useRef(1), speed = useRef(70);

  useLoop(phase === "aim", (dt) => {
    setAim((a) => {
      let n = a + dir.current * speed.current * dt;
      if (n > 100 || n < 0) {
        dir.current *= -1;
        n = Math.max(0, Math.min(100, n));
      }
      return n;
    });
  });

  function shoot() {
    if (phase !== "aim") return;
    // The keeper guesses a third of the goal; corners are hard to reach but easy to miss.
    const guess = [18, 50, 82][Math.floor(Math.random() * 3)];
    setKeeper(guess);
    setPhase("fly");
    setTimeout(() => {
      const r: "goal" | "saved" | "missed" = aim < 6 || aim > 94 ? "missed" : Math.abs(aim - guess) < 17 ? "saved" : "goal";
      setResult(r);
      const g = goals + (r === "goal" ? 1 : 0);
      setGoals(g);
      setPhase("result");
      setTimeout(() => {
        const s = shot + 1;
        setShot(s);
        setResult(null);
        setKeeper(50);
        if (s >= SHOTS) {
          setPhase("done");
          log("game_finish", { item: k, value: g });
          submit(g);
        } else {
          speed.current += 12; // a little faster each kick
          setPhase("aim");
        }
      }, 1100);
    }, 450);
  }

  const reset = () => {
    setShot(0);
    setGoals(0);
    speed.current = 70;
    setPhase("aim");
    log("game_start", { item: k });
  };

  return (
    <>
      <GameHead k={k} />
      <ScoreRow items={[[ui.shots, `${Math.min(shot + (phase === "done" ? 0 : 1), SHOTS)}/${SHOTS}`], ["⚽", goals], [ui.best, best ?? "–"]]} />
      <div className="arena pitch" onPointerDown={shoot}>
        <div className="goal">
          <span className="keeper" style={{ left: `${keeper}%` }}>
            🧤
          </span>
          {phase === "aim" && <span className="aim" style={{ left: `${aim}%` }} />}
        </div>
        <span
          className={`ball${phase === "fly" || phase === "result" ? " flying" : ""}`}
          style={phase === "fly" || phase === "result" ? { left: `${10 + aim * 0.8}%`, top: result === "missed" ? "4%" : "16%" } : undefined}
        >
          ⚽
        </span>
        {result && <p className={`arena-banner ${result}`}>{result === "goal" ? ui.goal : result === "saved" ? ui.saved : ui.missed}</p>}
        {phase === "done" && (
          <div className="arena-overlay">
            <p className="arena-big">
              {goals} / {SHOTS}
            </p>
            <button className="g-btn" onClick={(e) => (e.stopPropagation(), reset())}>
              {ui.again}
            </button>
          </div>
        )}
      </div>
      {phase === "aim" && (
        <button className="g-btn" data-act="shoot" onClick={shoot}>
          {ui.shoot}
        </button>
      )}
    </>
  );
}

/* ================= Car racer (6+) ================= */

type Obstacle = { id: number; lane: number; y: number; e: string };
const TRAFFIC = ["🚙", "🚕", "🚌", "🚚", "🛻"];

export function Racer({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [state, setState] = useState<"ready" | "play" | "done">("ready");
  const [lane, setLane] = useState(1);
  const [obs, setObs] = useState<Obstacle[]>([]);
  const [dist, setDist] = useState(0);
  const [best, submit] = useBest(k);
  const laneRef = useRef(1), speed = useRef(40), spawn = useRef(0), id = useRef(0), d = useRef(0);

  const move = (dir: number) => {
    if (state !== "play") return;
    laneRef.current = Math.max(0, Math.min(2, laneRef.current + dir));
    setLane(laneRef.current);
  };

  useLoop(state === "play", (dt) => {
    speed.current = Math.min(110, speed.current + dt * 3);
    d.current += speed.current * dt;
    setDist(Math.floor(d.current));
    spawn.current -= dt;
    setObs((os) => {
      let n = os.map((o) => ({ ...o, y: o.y + speed.current * dt })).filter((o) => o.y < 115);
      if (spawn.current <= 0) {
        spawn.current = Math.max(0.45, 1.2 - speed.current / 140);
        const free = [0, 1, 2].filter((l) => !n.some((o) => o.lane === l && o.y < 20));
        if (free.length > 1) n.push({ id: id.current++, lane: free[Math.floor(Math.random() * free.length)], y: -12, e: TRAFFIC[Math.floor(Math.random() * TRAFFIC.length)] });
      }
      if (n.some((o) => o.lane === laneRef.current && o.y > 72 && o.y < 92)) {
        setState("done");
        log("game_finish", { item: k, value: Math.floor(d.current) });
        submit(Math.floor(d.current));
      }
      return n;
    });
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => (e.key === "ArrowLeft" ? move(-1) : e.key === "ArrowRight" ? move(1) : null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const start = () => {
    laneRef.current = 1;
    setLane(1);
    speed.current = 40;
    d.current = 0;
    spawn.current = 0.6;
    setObs([]);
    setState("play");
    if (state === "done") log("game_start", { item: k });
  };

  return (
    <>
      <GameHead k={k} />
      <ScoreRow items={[[ui.distance, `${dist} m`], [ui.best, best != null ? `${best} m` : "–"]]} />
      <div
        className="arena road"
        onPointerDown={(e) => {
          if (state !== "play") return;
          const r = e.currentTarget.getBoundingClientRect();
          move(e.clientX - r.left < r.width / 2 ? -1 : 1);
        }}
      >
        <div className="road-lines" style={{ animationDuration: `${Math.max(0.25, 1.4 - speed.current / 100)}s` }} />
        {obs.map((o) => (
          <span key={o.id} className="car traffic" style={{ left: `${o.lane * 33.3 + 16.6}%`, top: `${o.y}%` }}>
            {o.e}
          </span>
        ))}
        <span className="car player" style={{ left: `${lane * 33.3 + 16.6}%` }}>
          🏎️
        </span>
        {state !== "play" && (
          <div className="arena-overlay">
            {state === "done" && (
              <p className="arena-big">
                {ui.crashed} {dist} m
              </p>
            )}
            <button className="g-btn" onClick={start}>
              {state === "done" ? ui.again : ui.start}
            </button>
          </div>
        )}
      </div>
      <div className="g-row">
        <button className="g-btn alt" onPointerDown={() => move(-1)}>
          {ui.left}
        </button>
        <button className="g-btn alt" onPointerDown={() => move(1)}>
          {ui.right}
        </button>
      </div>
    </>
  );
}

/* ================= Keepy-uppy (teens) ================= */

export function KeepyUppy({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [state, setState] = useState<"ready" | "play" | "done">("ready");
  const [ball, setBall] = useState({ x: 50, y: 30, rot: 0 });
  const [kicks, setKicks] = useState(0);
  const [best, submit] = useBest(k);
  const p = useRef({ x: 50, y: 30, vx: 0, vy: 0, rot: 0 }), kicksRef = useRef(0);

  useLoop(state === "play", (dt) => {
    const b = p.current;
    const g = 120 + kicksRef.current * 4; // gets harder
    b.vy += g * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.rot += b.vx * dt * 6;
    if (b.x < 8 || b.x > 92) {
      b.vx *= -0.8;
      b.x = Math.max(8, Math.min(92, b.x));
    }
    if (b.y < 6) {
      b.y = 6;
      b.vy = Math.abs(b.vy) * 0.3;
    }
    setBall({ x: b.x, y: b.y, rot: b.rot });
    if (b.y > 96) {
      setState("done");
      log("game_finish", { item: k, value: kicksRef.current });
      submit(kicksRef.current);
    }
  });

  function kick(e: React.PointerEvent<HTMLDivElement>) {
    if (state !== "play") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100, py = ((e.clientY - r.top) / r.height) * 100;
    const b = p.current;
    if (Math.hypot(px - b.x, (py - b.y) * (r.height / r.width)) < 13) {
      b.vy = -95 - Math.random() * 15;
      b.vx = (b.x - px) * 6 + (Math.random() - 0.5) * 20;
      kicksRef.current += 1;
      setKicks(kicksRef.current);
    }
  }

  const start = () => {
    p.current = { x: 50, y: 25, vx: 0, vy: -40, rot: 0 };
    kicksRef.current = 0;
    setKicks(0);
    setState("play");
    if (state === "done") log("game_start", { item: k });
  };

  return (
    <>
      <GameHead k={k} />
      <ScoreRow items={[[ui.kicks, kicks], [ui.best, best ?? "–"]]} />
      <div className="arena keepy" onPointerDown={kick}>
        <span className="keepy-ball" style={{ left: `${ball.x}%`, top: `${ball.y}%`, transform: `translate(-50%,-50%) rotate(${ball.rot}deg)` }}>
          ⚽
        </span>
        {state !== "play" && (
          <div className="arena-overlay">
            {state === "done" && (
              <p className="arena-big">
                {ui.dropped} {kicks}
              </p>
            )}
            <p>{ui.tapBall}</p>
            <button className="g-btn" onClick={start}>
              {state === "done" ? ui.again : ui.start}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ================= Reaction test (teens) ================= */

export function Reaction({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const ROUNDS = 5;
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "early" | "done">("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [best, submit] = useBest(k, false);
  const t0 = useRef(0), timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const arm = () => {
    setPhase("wait");
    timer.current = setTimeout(() => {
      t0.current = performance.now();
      setPhase("go");
    }, 1200 + Math.random() * 2600);
  };

  function tap() {
    if (phase === "idle" || phase === "early") return arm();
    if (phase === "wait") {
      clearTimeout(timer.current);
      return setPhase("early");
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - t0.current);
      const all = [...times, ms];
      setTimes(all);
      if (all.length >= ROUNDS) {
        const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
        setPhase("done");
        log("game_finish", { item: k, value: avg });
        submit(avg);
      } else arm();
    }
    if (phase === "done") {
      setTimes([]);
      log("game_start", { item: k });
      arm();
    }
  }

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;
  const cls = phase === "go" ? "go" : phase === "wait" ? "wait" : phase === "early" ? "early" : "";
  return (
    <>
      <GameHead k={k} />
      <ScoreRow items={[["#", `${Math.min(times.length + (phase === "done" ? 0 : 1), ROUNDS)}/${ROUNDS}`], [ui.best, best != null ? `${best} ${ui.ms}` : "–"]]} />
      <button className={`reaction ${cls}`} onPointerDown={tap}>
        {phase === "idle" && ui.tapToStart}
        {phase === "wait" && ui.waitGreen}
        {phase === "go" && ui.tapNow}
        {phase === "early" && ui.tooSoon}
        {phase === "done" && (
          <>
            {ui.avg}: {avg} {ui.ms}
            <small>{ui.again}</small>
          </>
        )}
      </button>
      {times.length > 0 && (
        <p className="g-sub" style={{ textAlign: "center" }}>
          {times.map((t) => `${t} ${ui.ms}`).join(" · ")}
        </p>
      )}
    </>
  );
}

/* ================= Maths sprint (teens) ================= */

function makeSum(level: number) {
  const ops = level < 4 ? ["+", "−"] : level < 8 ? ["+", "−", "×"] : ["+", "−", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const big = 10 + level * 4;
  let a = 1 + Math.floor(Math.random() * big), b = 1 + Math.floor(Math.random() * big), ans = 0;
  if (op === "+") ans = a + b;
  if (op === "−") {
    if (b > a) [a, b] = [b, a];
    ans = a - b;
  }
  if (op === "×") {
    a = 2 + Math.floor(Math.random() * Math.min(12, 3 + level));
    b = 2 + Math.floor(Math.random() * 12);
    ans = a * b;
  }
  if (op === "÷") {
    b = 2 + Math.floor(Math.random() * 11);
    ans = 2 + Math.floor(Math.random() * 12);
    a = b * ans;
  }
  const opts = new Set([ans]);
  while (opts.size < 4) opts.add(Math.max(0, ans + Math.floor(Math.random() * 11) - 5) || ans + opts.size);
  return { q: `${a} ${op} ${b}`, ans, opts: shuffle([...opts]) };
}

export function MathSprint({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [state, setState] = useState<"ready" | "play" | "done">("ready");
  const [left, setLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [sum, setSum] = useState(() => makeSum(0));
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [best, submit] = useBest(k);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (state !== "play") return;
    if (left <= 0) {
      setState("done");
      log("game_finish", { item: k, value: scoreRef.current });
      submit(scoreRef.current);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [state, left]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setLeft(60);
    setSum(makeSum(0));
    setState("play");
    if (state === "done") log("game_start", { item: k });
  };

  return (
    <>
      <GameHead k={k} />
      <ScoreRow items={[[ui.score, score], [ui.time, `${left}s`], [ui.best, best ?? "–"]]} />
      {state === "play" ? (
        <>
          <div className={`prompt kids sum${flash ? ` ${flash}` : ""}`}>
            <p style={{ fontSize: "2.6rem", direction: "ltr" }}>{sum.q} = ?</p>
          </div>
          <div className="sum-opts">
            {sum.opts.map((o) => (
              <button
                key={o}
                onClick={() => {
                  const ok = o === sum.ans;
                  if (ok) scoreRef.current += 1;
                  setScore(scoreRef.current);
                  setFlash(ok ? "ok" : "bad");
                  setTimeout(() => setFlash(null), 250);
                  setSum(makeSum(scoreRef.current));
                }}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="prompt kids">
          {state === "done" && <p className="arena-big">🧮 {score}</p>}
          <div>
            <button className="g-btn" onClick={start}>
              {state === "done" ? ui.again : ui.start}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= Word scramble (teens) ================= */

export function Scramble({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = useUi();
  const words = SCRAMBLE_WORDS[lang];
  const [order, setOrder] = useState(() => shuffle(words));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [solved, setSolved] = useState(0);
  const [hint, setHint] = useState(false);
  const word = order[i % order.length];
  const letters = Array.from(word);
  // Shuffled tile order for this word; never the solved order.
  const mix = useMemo(() => {
    let s = shuffle(letters.map((_, n) => n));
    if (s.every((v, n) => v === n) && letters.length > 1) s = [...s.slice(1), s[0]];
    return s;
  }, [word]); // eslint-disable-line react-hooks/exhaustive-deps
  const guess = picked.map((n) => letters[n]).join("");
  const done = guess.length === letters.length;
  const right = done && guess === word;

  useEffect(() => {
    setOrder(shuffle(SCRAMBLE_WORDS[lang]));
    setI(0);
    setPicked([]);
  }, [lang]);
  useEffect(() => {
    if (!right) return;
    setSolved((s) => s + 1);
    if ((solved + 1) % 5 === 0) log("game_finish", { item: k, value: solved + 1 });
    const t = setTimeout(() => (setI((x) => x + 1), setPicked([]), setHint(false)), 900);
    return () => clearTimeout(t);
  }, [right]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <GameHead k={k} />
      <ScoreRow items={[[ui.solved, solved]]} />
      <div className={`prompt kids${right ? " ok" : done ? " bad" : ""}`}>
        <div className="scr-answer" dir={lang === "ar" ? "rtl" : "ltr"}>
          {letters.map((_, n) => (
            <span key={n} className={picked[n] != null ? "on" : hint && n === 0 ? "hint" : ""}>
              {picked[n] != null ? letters[picked[n]] : hint && n === 0 ? letters[0] : ""}
            </span>
          ))}
        </div>
        {right && <p>{ui.correct}</p>}
      </div>
      <div className="scr-tiles" dir={lang === "ar" ? "rtl" : "ltr"}>
        {mix.map((n) => (
          <button key={n} disabled={picked.includes(n) || done} onClick={() => setPicked([...picked, n])}>
            {letters[n]}
          </button>
        ))}
      </div>
      <div className="g-row">
        <button className="g-btn alt" onClick={() => setPicked([])}>
          {ui.clear}
        </button>
        <button className="g-btn alt" onClick={() => setHint(true)}>
          {ui.hint}
        </button>
        <button className="g-btn alt" onClick={() => (setI(i + 1), setPicked([]), setHint(false))}>
          {ui.skip}
        </button>
      </div>
    </>
  );
}

/* ================= Noughts & crosses with an optional phone opponent (6+) ================= */

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
type Cell = "X" | "O" | null;
const winnerOf = (c: Cell[]) => {
  const l = LINES.find(([a, b, d]) => c[a] && c[a] === c[b] && c[a] === c[d]);
  return l ? { who: c[l[0]] as "X" | "O", line: l } : null;
};

/** Plays to win, then blocks, then takes centre/corners, with a little randomness so kids can win. */
function phoneMove(c: Cell[]): number {
  const free = c.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const tryFor = (who: "X" | "O") => free.find((i) => winnerOf(c.map((v, j) => (j === i ? who : v)))?.who === who);
  const win = tryFor("O");
  if (win != null) return win;
  const block = tryFor("X");
  if (block != null && Math.random() < 0.85) return block;
  if (free.includes(4) && Math.random() < 0.7) return 4;
  const corners = [0, 2, 6, 8].filter((i) => free.includes(i));
  if (corners.length && Math.random() < 0.6) return corners[Math.floor(Math.random() * corners.length)];
  return free[Math.floor(Math.random() * free.length)];
}

export function TicTacToe({ k }: { k: string }) {
  const { log } = useGuest();
  const ui = useUi();
  const [vsPhone, setVsPhone] = useState(true);
  const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [tally, setTally] = useState({ X: 0, O: 0 });
  const w = winnerOf(cells);
  const full = cells.every(Boolean);
  const over = Boolean(w) || full;

  const place = (i: number, who: "X" | "O") => {
    const next = cells.slice();
    next[i] = who;
    setCells(next);
    const r = winnerOf(next);
    if (r) setTally((t) => ({ ...t, [r.who]: t[r.who] + 1 }));
    if (r || next.every(Boolean)) log("game_finish", { item: k });
    setTurn(who === "X" ? "O" : "X");
    return next;
  };

  useEffect(() => {
    if (!vsPhone || turn !== "O" || over) return;
    const t = setTimeout(() => place(phoneMove(cells), "O"), 550);
    return () => clearTimeout(t);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = (phone = vsPhone) => {
    setVsPhone(phone);
    setCells(Array(9).fill(null));
    setTurn("X");
  };

  const status = w
    ? vsPhone
      ? w.who === "X" ? ui.youWin : ui.phoneWins
      : `${w.who === "X" ? "❌" : "⭕"} ${ui.wins}`
    : full ? ui.draw : vsPhone ? (turn === "X" ? ui.yourTurn : ui.thinking) : `${ui.turn}: ${turn === "X" ? "❌" : "⭕"}`;

  return (
    <>
      <GameHead k={k} />
      <div className="cd-seg" style={{ alignSelf: "center" }}>
        <button type="button" aria-pressed={vsPhone} onClick={() => (reset(true), setTally({ X: 0, O: 0 }))}>
          {ui.vsPhone}
        </button>
        <button type="button" aria-pressed={!vsPhone} onClick={() => (reset(false), setTally({ X: 0, O: 0 }))}>
          {ui.vsFriend}
        </button>
      </div>
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>❌ {tally.X}</span>
        <span>{status}</span>
        <span>
          {vsPhone ? "📱" : "⭕"} {tally.O}
        </span>
      </div>
      <div className="ttt">
        {cells.map((c, i) => (
          <button
            key={i}
            onClick={() => !c && !over && (!vsPhone || turn === "X") && place(i, turn)}
            className={w?.line.includes(i) ? "win" : ""}
            aria-label={c ?? String(i + 1)}
          >
            {c === "X" ? "❌" : c === "O" ? "⭕" : ""}
          </button>
        ))}
      </div>
      {over && (
        <button className="g-btn" onClick={() => (reset(), log("game_start", { item: k }))}>
          {ui.again}
        </button>
      )}
    </>
  );
}

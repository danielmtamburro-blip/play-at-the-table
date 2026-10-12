"use client";
// "Pour it right": hold to pour, let go on the line. Each good pour makes the next one harder.
// Pass the phone round the table; a spill or a short pour means a sip.
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { GameHead } from "./Engines";
import { useBest } from "./Arcade";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    hold: "Hold to pour", release: "Let go on the line!", perfect: "Perfect pour! 🍺", good: "Nice pour!",
    spill: "Spilt it! Take a sip and pass the phone.", short: "Too short! Take a sip and pass the phone.",
    again: "Next player", pours: "Pours", best: "Best", round: "Round",
  },
  ar: {
    hold: "اضغط مطولاً للصب", release: "اترك عند الخط!", perfect: "صبّة مثالية! 🍺", good: "صبّة جيدة!",
    spill: "انسكب! خذ رشفة ومرّر الهاتف.", short: "قليل جداً! خذ رشفة ومرّر الهاتف.",
    again: "اللاعب التالي", pours: "الصبّات", best: "الأفضل", round: "الجولة",
  },
};

type Phase = "ready" | "pouring" | "settle" | "ok" | "over";

/** Target band for a round: narrower and higher as you go. */
const band = (round: number) => {
  const width = Math.max(5, 16 - round * 1.5);
  const top = 92 - Math.random() * Math.min(20, 6 + round * 2);
  return { lo: top - width, hi: top };
};

export function Pour({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [best, submit] = useBest(k);
  const [phase, setPhase] = useState<Phase>("ready");
  const [fill, setFill] = useState(0); // 0–100+, beer level
  const [foam, setFoam] = useState(0); // head on top, settles after release
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(() => band(0));
  const [msg, setMsg] = useState("");
  const fillRef = useRef(0), foamRef = useRef(0), raf = useRef(0), last = useRef(0);
  const speed = 26 + score * 6; // % per second

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const loop = (t: number) => {
    const dt = Math.min(0.05, (t - (last.current || t)) / 1000);
    last.current = t;
    fillRef.current += speed * dt;
    foamRef.current = Math.min(14, foamRef.current + 18 * dt);
    setFill(fillRef.current);
    setFoam(foamRef.current);
    if (fillRef.current + foamRef.current * 0.5 >= 100) return end("spill");
    raf.current = requestAnimationFrame(loop);
  };

  function end(why: "spill" | "short") {
    cancelAnimationFrame(raf.current);
    setPhase("over");
    setMsg(why === "spill" ? ui.spill : ui.short);
    navigator.vibrate?.(80);
    log("game_finish", { item: k, value: score });
    if (score > 0) submit(score); // also offers a leaderboard spot
  }

  function down(e: React.PointerEvent) {
    e.preventDefault();
    if (phase === "over") return;
    if (phase === "ok") next();
    if (phase !== "ready" && phase !== "ok") return;
    setPhase("pouring");
    setMsg("");
    last.current = 0;
    raf.current = requestAnimationFrame(loop);
  }

  function up() {
    if (phase !== "pouring") return;
    cancelAnimationFrame(raf.current);
    setPhase("settle");
    // The head settles: about half the foam turns into beer.
    setTimeout(() => {
      const level = fillRef.current + foamRef.current * 0.35;
      fillRef.current = level;
      foamRef.current = foamRef.current * 0.45;
      setFill(level);
      setFoam(foamRef.current);
      if (level > target.hi + 1.5) return end("spill");
      if (level < target.lo) return end("short");
      const mid = (target.lo + target.hi) / 2;
      setMsg(Math.abs(level - mid) < (target.hi - target.lo) / 4 ? ui.perfect : ui.good);
      setScore((s) => s + 1);
      setPhase("ok");
    }, 450);
  }

  function next() {
    fillRef.current = 0;
    foamRef.current = 0;
    setFill(0);
    setFoam(0);
    setTarget(band(score));
  }

  function restart() {
    setScore(0);
    fillRef.current = 0;
    foamRef.current = 0;
    setFill(0);
    setFoam(0);
    setTarget(band(0));
    setMsg("");
    setPhase("ready");
    log("game_start", { item: k });
  }

  const beer = Math.min(100, fill);
  const head = Math.min(100 - beer, foam);
  return (
    <>
      <GameHead k={k} />
      <div className="g-row" style={{ justifyContent: "space-between", fontWeight: 600 }}>
        <span>
          {ui.pours}: {score} 🍺
        </span>
        <span>
          {ui.best}: {best ?? "–"}
        </span>
      </div>
      <div
        className={`pour-stage${phase === "pouring" ? " on" : ""}`}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        aria-label={ui.hold}
        data-act="pour"
      >
        <span className={`pour-tap${phase === "pouring" ? " on" : ""}`} aria-hidden="true" />
        <div className="pour-glass">
          <span className="pour-band" style={{ bottom: `${target.lo}%`, height: `${target.hi - target.lo}%` }} />
          <span className="pour-beer" style={{ height: `${beer}%` }} />
          <span className="pour-foam" style={{ bottom: `${beer}%`, height: `${head}%` }} />
          {fill + foam * 0.5 >= 100 && <span className="pour-spill" />}
        </div>
      </div>
      <p className={`g-service-msg${phase === "over" ? " bad" : ""}`} role="status" style={{ textAlign: "center" }}>
        {msg || (phase === "pouring" ? ui.release : ui.hold)}
      </p>
      {phase === "over" && (
        <button className="g-btn" onClick={restart}>
          {ui.again}
        </button>
      )}
    </>
  );
}

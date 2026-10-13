"use client";
// "How well do you know me?": take turns guessing each other's answers, then see your match score.
import { useState } from "react";
import { buzz, HAPTIC } from "@/lib/haptics";
import { sfx } from "@/lib/sfx";
import type { Lang, Loc } from "@/lib/types";
import { shuffle, useGuest } from "../context";
import { CardStage } from "./CardStage";
import { GameHead } from "./Engines";

const L = (en: string, ar: string): Loc => ({ en, ar });
const QS: Loc[] = [
  L("What's {n}'s favourite food?", "ما الطعام المفضل لدى {n}؟"),
  L("Where would {n} go on a dream holiday?", "أين يذهب {n} في عطلة أحلامه؟"),
  L("What's {n}'s biggest pet peeve?", "ما أكثر شيء يزعج {n}؟"),
  L("What would {n} order here without looking at the menu?", "ماذا سيطلب {n} هنا دون النظر إلى القائمة؟"),
  L("What's {n}'s favourite film?", "ما الفيلم المفضل لدى {n}؟"),
  L("Morning person or night owl: which is {n}?", "هل {n} شخص صباحي أم يحب السهر؟"),
  L("What's {n}'s go-to song in the car?", "ما الأغنية المفضلة لدى {n} في السيارة؟"),
  L("What's {n} most scared of?", "ما أكثر شيء يخاف منه {n}؟"),
  L("What's {n}'s dream job?", "ما وظيفة أحلام {n}؟"),
  L("Which dessert can {n} never say no to?", "أي حلوى لا يستطيع {n} رفضها أبداً؟"),
  L("What's {n}'s hidden talent?", "ما الموهبة الخفية لدى {n}؟"),
  L("What's {n}'s favourite way to relax?", "ما الطريقة المفضلة لدى {n} للاسترخاء؟"),
  L("Which app does {n} open first in the morning?", "ما أول تطبيق يفتحه {n} في الصباح؟"),
  L("What's {n}'s favourite season?", "ما الفصل المفضل لدى {n}؟"),
  L("Coffee or tea: what does {n} choose?", "قهوة أم شاي: ماذا يختار {n}؟"),
  L("What's the best gift {n} has ever received?", "ما أفضل هدية تلقاها {n}؟"),
  L("What's {n}'s comfort film or series?", "ما الفيلم أو المسلسل المريح لدى {n}؟"),
  L("Which city would {n} love to live in?", "في أي مدينة يحب {n} أن يعيش؟"),
  L("What's {n}'s favourite thing about weekends?", "ما أكثر ما يحبه {n} في عطلة نهاية الأسبوع؟"),
  L("What would {n} do with a surprise day off?", "ماذا سيفعل {n} بيوم إجازة مفاجئ؟"),
  L("Who is {n}'s celebrity crush?", "من المشهور الذي يعجب به {n}؟"),
  L("What's {n}'s most-used emoji?", "ما الإيموجي الأكثر استخداماً لدى {n}؟"),
];

const UI: Record<Lang, Record<string, string>> = {
  en: {
    names: "Your names", p1: "Player 1", p2: "Player 2", start: "Let's play", guesses: "{g} guesses…", got: "Got it right", miss: "Not quite",
    how: "{g} guesses out loud, then {n} says if it's right.", result: "Match score", rounds: "10 questions, taking turns",
    perfect: "Soulmates! 💞", great: "You really know each other!", good: "Not bad at all!", low: "Time for more dates! 😄", again: "Play again",
  },
  ar: {
    names: "أسماؤكما", p1: "اللاعب 1", p2: "اللاعب 2", start: "لنلعب", guesses: "{g} يخمّن…", got: "إجابة صحيحة", miss: "ليس تماماً",
    how: "{g} يخمّن بصوت عالٍ، ثم يقول {n} إن كانت صحيحة.", result: "نسبة التوافق",
    rounds: "10 أسئلة بالتناوب", perfect: "توأم روح! 💞", great: "تعرفان بعضكما جيداً!", good: "ليس سيئاً أبداً!", low: "حان وقت المزيد من المواعيد! 😄", again: "العب مرة أخرى",
  },
};

export function KnowMe({ k }: { k: string }) {
  const { lang, log } = useGuest();
  const ui = UI[lang];
  const [names, setNames] = useState(["", ""]);
  const [game, setGame] = useState<null | { qs: Loc[]; i: number; pts: [number, number] }>(null);
  const n = (i: number) => names[i].trim() || (i === 0 ? ui.p1 : ui.p2);

  if (!game)
    return (
      <>
        <GameHead k={k} />
        <div className="km-start">
          <span className="km-hearts" aria-hidden="true">
            💞
          </span>
          <span className="split-label">{ui.names}</span>
          {[0, 1].map((i) => (
            <input key={i} className="cel-input" maxLength={16} placeholder={i === 0 ? ui.p1 : ui.p2} value={names[i]} onChange={(e) => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
          <small>{ui.rounds}</small>
        </div>
        <button className="g-btn" onClick={() => (sfx.tap(), setGame({ qs: shuffle(QS).slice(0, 10), i: 0, pts: [0, 0] }), log("game_start", { item: k }))}>
          {ui.start} →
        </button>
      </>
    );

  if (game.i >= game.qs.length) {
    const pct = Math.round(((game.pts[0] + game.pts[1]) / game.qs.length) * 100);
    return (
      <>
        <GameHead k={k} />
        <div className="km-result">
          <span className="km-meter" style={{ ["--p" as string]: `${pct}%` }}>
            <b>{pct}%</b>
            <small>{ui.result}</small>
          </span>
          <p>{pct >= 90 ? ui.perfect : pct >= 70 ? ui.great : pct >= 40 ? ui.good : ui.low}</p>
          <span className="km-split">
            {n(1)} → {n(0)}: {game.pts[1]} · {n(0)} → {n(1)}: {game.pts[0]}
          </span>
        </div>
        <button className="g-btn" onClick={() => setGame(null)}>
          {ui.again}
        </button>
      </>
    );
  }

  // Even rounds: player 2 guesses about player 1; odd rounds: the other way round.
  const about = game.i % 2, guesser = 1 - about;
  const q = game.qs[game.i][lang].split("{n}").join(n(about));
  const mark = (ok: boolean) => {
    ok ? (sfx.correct(), buzz(HAPTIC.good)) : sfx.wrong();
    const pts = [...game.pts] as [number, number];
    if (ok) pts[about] += 1;
    if (game.i + 1 >= game.qs.length) (sfx.win(), log("game_finish", { item: k }));
    setGame({ ...game, i: game.i + 1, pts });
  };
  return (
    <>
      <GameHead k={k} />
      <p className="km-turn">{ui.guesses.replace("{g}", n(guesser))}</p>
      <CardStage tone="date" index={game.i} total={game.qs.length}>
        <p className="cs-text">{q}</p>
      </CardStage>
      <p className="g-sub" style={{ textAlign: "center" }}>
        {ui.how.replace("{g}", n(guesser)).replace("{n}", n(about))}
      </p>
      <div className="g-row">
        <button className="g-btn alt" onClick={() => mark(false)}>
          ✗ {ui.miss}
        </button>
        <button className="g-btn" onClick={() => mark(true)}>
          ✓ {ui.got}
        </button>
      </div>
    </>
  );
}

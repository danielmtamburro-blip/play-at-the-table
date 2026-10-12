"use client";
// The Play tab: every switched-on game, filtered by who's playing, with today's leaderboard on top.
import { useState } from "react";
import { drinkAge, GAMES, gameOn, type GameGroup, type GameInfo } from "@/lib/games";
import type { Venue } from "@/lib/types";
import { EXTRA, useGuest } from "../context";
import { LeaderboardTeaser } from "../Leaderboard";

const KID_ICON: Record<string, string> = {
  colour: "🎨", bubbles: "🫧", oddone: "🔎", count: "🔢", penalty: "⚽", racer: "🏎️",
  memory: "🐪", tictactoe: "❌", keepy: "🦶", reaction: "⚡", maths: "➗", scramble: "🔤",
};
export const gameIcon = (g: GameInfo) => g.icon ?? KID_ICON[g.key] ?? (g.group === "date" ? "💞" : "🎲");

/** Rough order of what tables play most; anything not listed follows. */
const POPULAR = ["penalty", "racer", "keepy", "pour", "bill", "trivia", "wordguess", "hilo", "memory", "bubbles", "charades", "sudoku", "wyr", "reaction", "maths", "sports", "emoji", "likely"];

const groupOn = (v: Venue, g: GameGroup) => v.modules[g === "drink" ? "drink" : g];

/** Games this venue offers, most popular first. */
export function venueGames(v: Venue): GameInfo[] {
  const list = GAMES.filter((g) => groupOn(v, g.group) && gameOn(v.games as Record<string, boolean>, g.key));
  const rank = (k: string) => (POPULAR.includes(k) ? POPULAR.indexOf(k) : 100);
  return list.sort((a, b) => rank(a.key) - rank(b.key));
}

/** A colourful square game card: big emoji, title and a small tag. */
export function GameCard({ g, wide }: { g: GameInfo; wide?: boolean }) {
  const { venue, lang, L, go } = useGuest();
  const x = EXTRA[lang];
  const tag =
    g.group === "kids" ? `${x.kidsTag}${g.ages ? ` ${g.ages}` : ""}` : g.group === "group" ? x.adultsTag : g.group === "date" ? x.dateTag : `${x.drinkTag} ${drinkAge(venue.games)}+`;
  return (
    <button className={`g-gcard gc-${g.group}${wide ? " wide" : ""}`} data-card={g.key} onClick={() => go(g.key)}>
      <span className="g-gcard-ico" aria-hidden="true">
        {gameIcon(g)}
      </span>
      <b>{L(g.title)}</b>
      <small>{tag}</small>
    </button>
  );
}

export function ChallengeBanner() {
  const { lang, go } = useGuest();
  const x = EXTRA[lang];
  return (
    <button className="g-challenge" data-tile="versus" onClick={() => go("versus")}>
      <span className="g-challenge-ico" aria-hidden="true">
        ⚔️
      </span>
      <span className="g-challenge-txt">
        <b>{x.versus}</b>
        <span>{x.versusS}</span>
      </span>
      <span className="g-challenge-go">{x.challengeGo} ›</span>
    </button>
  );
}

type Chip = "all" | GameGroup;

export function PlayTab() {
  const { venue, lang } = useGuest();
  const x = EXTRA[lang];
  const all = venueGames(venue);
  const chips: [Chip, string][] = (
    [
      ["all", x.all],
      ["kids", x.kidsTag],
      ["group", x.adultsTag],
      ["date", x.dateTag],
      ["drink", x.drinkTag],
    ] as [Chip, string][]
  ).filter(([c]) => c === "all" || all.some((g) => g.group === c));
  const [chip, setChip] = useState<Chip>("all");
  const shown = chip === "all" ? all.filter((g) => g.group !== "drink") : all.filter((g) => g.group === chip);

  return (
    <>
      <div>
        <h2 className="g-h">{x.tabPlay}</h2>
        <p className="g-sub">{x.playSub}</p>
      </div>
      <div className="g-tabs g-chipbar" role="group">
        {chips.map(([c, label]) => (
          <button key={c} aria-pressed={chip === c} data-chip={c} onClick={() => setChip(c)}>
            {label}
          </button>
        ))}
      </div>
      <LeaderboardTeaser />
      {venue.modules.versus && chip === "all" && <ChallengeBanner />}
      <h3 className="g-sec">{x.popular}</h3>
      <div className="g-ggrid">
        {shown.map((g) => (
          <GameCard key={g.key} g={g} />
        ))}
      </div>
    </>
  );
}

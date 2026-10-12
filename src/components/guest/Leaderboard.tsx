"use client";
import { Glyph } from "./glyphs";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { GAMES } from "@/lib/games";
import { fetchBoard, fetchHot, qualifies, SCORED, submitScore, type Board } from "@/lib/leaderboard";
import type { Lang } from "@/lib/types";
import { SHOWCASE_SCORES } from "@/lib/showcase";
import { useGuest } from "./context";

/** Sales-page demo: example scores instead of a real board. */
const demoBoard = (game: string): Board => {
  const rows = SHOWCASE_SCORES[game] ?? [];
  return { lower_better: SCORED[game]?.lowerBetter ?? false, today: rows, all_time: rows };
};
const loadBoard = (venueId: string, game: string) => (venueId === "sample" ? Promise.resolve(demoBoard(game)) : fetchBoard(venueId, game));

const LUI: Record<Lang, Record<string, string>> = {
  en: {
    newHigh: "New high score!", madeToday: "You made today's top 10.", madeAll: "You made the all-time top 10!",
    nick: "Your nickname", nickHint: "Use a nickname, not your full name. Shown on this venue's leaderboard.",
    save: "Add me to the leaderboard", skip: "No thanks", saving: "Saving…", rank: "You're #{r} today", rankAll: "and #{r} all-time!",
    see: "See the leaderboard", close: "Close", bad: "Please choose a different nickname.", fail: "Couldn't save just now. Try again.",
    title: "Leaderboards", today: "Today", allTime: "All-time", empty: "No scores yet. Be the first!", play: "Play now",
    resets: "Today's board resets at midnight.", teaser: "Today's leaderboard", seeAll: "See all", noneYet: "Play a game to get on today's board!",
  },
  ar: {
    newHigh: "نتيجة قياسية جديدة!", madeToday: "دخلت قائمة أفضل 10 اليوم.", madeAll: "دخلت قائمة أفضل 10 على الإطلاق!",
    nick: "اسمك المستعار", nickHint: "استخدم اسماً مستعاراً وليس اسمك الكامل. يظهر في لوحة هذا المكان.",
    save: "أضفني إلى اللوحة", skip: "لا شكراً", saving: "جارٍ الحفظ…", rank: "أنت رقم {r} اليوم", rankAll: "ورقم {r} على الإطلاق!",
    see: "عرض لوحة المتصدرين", close: "إغلاق", bad: "يرجى اختيار اسم مستعار آخر.", fail: "تعذر الحفظ الآن. حاول مجدداً.",
    title: "لوحات المتصدرين", today: "اليوم", allTime: "على الإطلاق", empty: "لا توجد نتائج بعد. كن الأول!", play: "العب الآن",
    resets: "تُصفّر لوحة اليوم عند منتصف الليل.", teaser: "متصدرو اليوم", seeAll: "عرض الكل", noneYet: "العب لعبة لتظهر في لوحة اليوم!",
  },
};

type Pending = { game: string; score: number; today: boolean; allTime: boolean } | null;
type Ctx = { report: (game: string, score: number) => void };
const LeaderboardContext = createContext<Ctx>({ report: () => {} });
export const useScores = () => useContext(LeaderboardContext);

/** Wraps the guest app. Games call report(); if the score makes a board, the guest is asked for a nickname. */
export function LeaderboardProvider({ children }: { children: React.ReactNode }) {
  const { venue, demo } = useGuest();
  const [pending, setPending] = useState<Pending>(null);
  const report = useCallback(
    (game: string, score: number) => {
      if (demo || !(game in SCORED) || !Number.isFinite(score) || score <= 0) return;
      qualifies(venue.id, game, score).then((q) => (q.today || q.allTime) && setPending({ game, score, ...q }), () => {});
    },
    [demo, venue.id],
  );
  return (
    <LeaderboardContext.Provider value={{ report }}>
      {children}
      {pending && <HighScoreSheet p={pending} onClose={() => setPending(null)} />}
    </LeaderboardContext.Provider>
  );
}

function HighScoreSheet({ p, onClose }: { p: NonNullable<Pending>; onClose: () => void }) {
  const { venue, table, lang, L, go } = useGuest();
  const u = LUI[lang];
  const [nick, setNick] = useState(() => {
    try {
      return localStorage.getItem("patt-nick") ?? "";
    } catch {
      return "";
    }
  });
  const [state, setState] = useState<"form" | "saving" | "done">("form");
  const [err, setErr] = useState("");
  const [rank, setRank] = useState<{ today_rank: number; all_rank: number } | null>(null);
  const game = GAMES.find((g) => g.key === p.game);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const n = nick.trim();
    if (n.length < 2) return setErr(u.bad);
    setState("saving");
    setErr("");
    try {
      setRank(await submitScore(venue.id, p.game, n, p.score, table));
      try {
        localStorage.setItem("patt-nick", n);
      } catch {}
      setState("done");
    } catch (e2) {
      setErr(String((e2 as Error).message).includes("nickname") ? u.bad : u.fail);
      setState("form");
    }
  }

  return (
    <div className="lb-sheet" role="dialog" aria-modal="true">
      <span className="lb-trophy" aria-hidden="true">
        🏆
      </span>
      <h3>{u.newHigh}</h3>
      <p>
        {game ? L(game.title) : ""} · <b>{SCORED[p.game].unit[lang](p.score)}</b>
      </p>
      {state !== "done" ? (
        <form onSubmit={save}>
          <p className="small">{p.allTime ? u.madeAll : u.madeToday}</p>
          <label htmlFor="lb-nick" className="small">
            {u.nick}
          </label>
          <input id="lb-nick" maxLength={16} value={nick} onChange={(e) => setNick(e.target.value)} autoComplete="nickname" autoFocus />
          <span className="lb-hint">{u.nickHint}</span>
          {err && <span className="lb-err">{err}</span>}
          <div className="g-row">
            <button type="button" className="g-btn alt" onClick={onClose}>
              {u.skip}
            </button>
            <button className="g-btn" disabled={state === "saving"}>
              {state === "saving" ? u.saving : u.save}
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>
            {u.rank.replace("{r}", String(rank?.today_rank ?? 1))} {rank && rank.all_rank <= 10 ? u.rankAll.replace("{r}", String(rank.all_rank)) : ""}
          </p>
          <div className="g-row">
            <button className="g-btn alt" onClick={onClose}>
              {u.close}
            </button>
            <button className="g-btn" onClick={() => (onClose(), go(`leaderboard:${p.game}`))}>
              {u.see}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const MEDAL = ["🥇", "🥈", "🥉"];

function BoardList({ rows, game }: { rows: Board["today"]; game: string }) {
  const { lang } = useGuest();
  if (!rows.length) return <p className="g-note">{LUI[lang].empty}</p>;
  return (
    <ol className="lb-list">
      {rows.map((r, i) => (
        <li key={i} className={i < 3 ? "top" : ""}>
          <span className="lb-pos">{MEDAL[i] ?? i + 1}</span>
          <span className="lb-name">
            {r.nickname}
            {r.table_label && <small> · {lang === "ar" ? "طاولة" : "Table"} {r.table_label}</small>}
          </span>
          <b>{SCORED[game].unit[lang](r.score)}</b>
        </li>
      ))}
    </ol>
  );
}

/** Games that keep a board and are switched on for this venue. */
function useBoardGames() {
  const { venue } = useGuest();
  return GAMES.filter((g) => g.key in SCORED && venue.games?.[g.key] !== false && (g.group !== "drink" || venue.modules.drink));
}

export function LeaderboardScreen({ initial }: { initial?: string }) {
  const { venue, lang, L, go } = useGuest();
  const u = LUI[lang];
  // Drinking-game boards only show to guests who came from that (age-checked) game.
  const games = useBoardGames().filter((g) => g.group !== "drink" || g.key === initial);
  const [game, setGame] = useState(initial && initial in SCORED ? initial : games[0]?.key ?? "penalty");
  const [when, setWhen] = useState<"today" | "all">("today");
  const [board, setBoard] = useState<Board | null>(null);
  useEffect(() => {
    setBoard(null);
    loadBoard(venue.id, game).then(setBoard);
  }, [venue.id, game]);
  const info = GAMES.find((g) => g.key === game);
  // Keep the chosen game's chip in view (sideways only, so the page doesn't jump).
  const chips = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = chips.current, b = box?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (box && b) box.scrollTo({ left: b.offsetLeft - box.offsetLeft - 16, behavior: "smooth" });
  }, [game]);

  return (
    <>
      <div>
        <h2 className="g-h">{u.title}</h2>
        <p className="g-sub">{u.resets}</p>
      </div>
      <div className="g-tabs" role="group" ref={chips}>
        {games.map((g) => (
          <button key={g.key} aria-pressed={g.key === game} onClick={() => setGame(g.key)}>
            {g.icon ? `${g.icon} ` : ""}
            {L(g.title)}
          </button>
        ))}
      </div>
      <div className="g-seg" role="group">
        <button type="button" aria-pressed={when === "today"} onClick={() => setWhen("today")}>
          {u.today}
        </button>
        <button type="button" aria-pressed={when === "all"} onClick={() => setWhen("all")}>
          {u.allTime}
        </button>
      </div>
      <div className="lb-card">{board ? <BoardList rows={when === "today" ? board.today : board.all_time} game={game} /> : <p className="g-note">…</p>}</div>
      {info && (
        <button className="g-btn" onClick={() => go(game)}>
          {u.play}: {L(info.title)}
        </button>
      )}
    </>
  );
}

/** Dark "Today's leaderboard" card on the Play tab: the busiest game's top 3. */
export function LeaderboardTeaser() {
  const { venue, lang, L, go } = useGuest();
  const u = LUI[lang];
  const [game, setGame] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  useEffect(() => {
    let live = true;
    (venue.id === "sample" ? Promise.resolve("penalty") : fetchHot(venue.id)).then(async (g) => {
      const key = g && GAMES.find((x) => x.key === g)?.group !== "drink" ? g : "penalty";
      if (!live) return;
      setGame(key);
      setBoard(await loadBoard(venue.id, key));
    });
    return () => {
      live = false;
    };
  }, [venue.id]);
  const info = GAMES.find((g) => g.key === game);
  const rows = board?.today.slice(0, 3) ?? [];
  return (
    <button className="lb-teaser" onClick={() => go(game ? `leaderboard:${game}` : "leaderboard")}>
      <span className="lb-teaser-head">
        <span className="lb-teaser-title"><Glyph k="trophy" /> {u.teaser}</span>
        <span>{info ? L(info.title) : ""}</span>
      </span>
      {rows.length ? (
        rows.map((r, i) => (
          <span key={i} className="lb-teaser-row">
            <span>
              <b>{i + 1}</b> {r.nickname}
            </span>
            <span>{game ? SCORED[game].unit[lang](r.score) : r.score}</span>
          </span>
        ))
      ) : (
        <span className="lb-teaser-row">{u.noneYet}</span>
      )}
      <span className="lb-teaser-foot">{u.seeAll} ›</span>
    </button>
  );
}

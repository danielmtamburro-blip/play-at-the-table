"use client";
// "Challenge another table": live head-to-head rounds between two tables at the same venue.
// Uses Supabase Realtime broadcast only: nothing is written to the database and no personal data is sent.
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ADULT_TRIVIA, SPORTS_TRIVIA, TABLE_TASKS } from "@/lib/gameContent";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Lang, Loc } from "@/lib/types";
import { shuffle, useGuest } from "../context";

/* ---------- strings ---------- */

const VUI: Record<Lang, Record<string, string>> = {
  en: {
    title: "Challenge another table", sub: "Five live rounds against another table. Winner takes the bragging rights!",
    yourTable: "You're at table", theirTable: "Which table do you want to challenge?", tableNo: "Table number", team: "Team name (optional)",
    teamPh: "e.g. The Burger Kings", send: "Send challenge ⚔️", waiting: "Waiting for table {t} to accept…", cancel: "Cancel",
    declined: "Table {t} said no this time.", timeout: "Table {t} didn't answer. Try again or pick another table.",
    self: "That's your own table! Pick another one.", noTable: "Scan the QR code on your table to challenge another table.",
    how: "How it works", rounds: "Trivia race · Tap battle · Reaction duel · Maths race · Table task",
    incoming: "{name} challenges your table!", accept: "Accept ⚔️", decline: "No thanks",
    joining: "Joining the game…", round: "Round {n} of {of}", getReady: "Get ready…", go: "GO!",
    tapFast: "TAP! TAP! TAP!", taps: "taps", wait: "Wait for green…", tapNow: "TAP NOW!", tooSoon: "Too soon!",
    done: "We're done! ✅", waitingThem: "Waiting for {name}…", winsRound: "{name} wins the round! 🏆", tie: "It's a tie!",
    final: "{name} wins {a}–{b}! 🏆", finalTie: "It's a draw, {a}–{b}!", rematch: "Rematch", home: "Back to home",
    left: "{name} left the game.", timeUp: "Time's up!",
    kTrivia: "🧠 Trivia race: fastest correct answer wins", kTaps: "👆 Tap battle: most taps in 10 seconds",
    kReaction: "⚡ Reaction duel: quickest tap on green", kMaths: "🧮 Maths race: fastest correct answer", kTask: "🎉 Table task: first to finish taps Done",
    you: "You", them: "Them",
  },
  ar: {
    title: "تحدَّ طاولة أخرى", sub: "خمس جولات مباشرة ضد طاولة أخرى. الفائز يحصل على حق التفاخر!",
    yourTable: "أنتم على الطاولة", theirTable: "أي طاولة تريدون تحديها؟", tableNo: "رقم الطاولة", team: "اسم الفريق (اختياري)",
    teamPh: "مثال: أبطال البرجر", send: "أرسل التحدي ⚔️", waiting: "بانتظار موافقة الطاولة {t}…", cancel: "إلغاء",
    declined: "الطاولة {t} رفضت هذه المرة.", timeout: "لم ترد الطاولة {t}. حاولوا مجدداً أو اختاروا طاولة أخرى.",
    self: "هذه طاولتكم! اختاروا طاولة أخرى.", noTable: "امسحوا رمز QR على طاولتكم لتحدي طاولة أخرى.",
    how: "كيف تعمل", rounds: "سباق أسئلة · معركة النقر · مبارزة رد الفعل · سباق الحساب · مهمة الطاولة",
    incoming: "{name} تتحدى طاولتكم!", accept: "اقبل التحدي ⚔️", decline: "لا شكراً",
    joining: "جارٍ الانضمام…", round: "الجولة {n} من {of}", getReady: "استعدوا…", go: "انطلق!",
    tapFast: "انقر! انقر! انقر!", taps: "نقرة", wait: "انتظر الأخضر…", tapNow: "اضغط الآن!", tooSoon: "مبكر جداً!",
    done: "انتهينا! ✅", waitingThem: "بانتظار {name}…", winsRound: "{name} تفوز بالجولة! 🏆", tie: "تعادل!",
    final: "{name} تفوز {a}–{b}! 🏆", finalTie: "تعادل {a}–{b}!", rematch: "مباراة أخرى", home: "العودة للرئيسية",
    left: "{name} غادرت اللعبة.", timeUp: "انتهى الوقت!",
    kTrivia: "🧠 سباق أسئلة: أسرع إجابة صحيحة تفوز", kTaps: "👆 معركة النقر: أكثر نقرات في 10 ثوانٍ",
    kReaction: "⚡ مبارزة رد الفعل: أسرع ضغطة على الأخضر", kMaths: "🧮 سباق الحساب: أسرع إجابة صحيحة", kTask: "🎉 مهمة الطاولة: أول من ينتهي يضغط انتهينا",
    you: "أنتم", them: "هم",
  },
};
const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ""));

/* ---------- rounds ---------- */

type Kind = "trivia" | "taps" | "reaction" | "maths" | "task";
type Round = { kind: Kind; q?: Loc; o?: Loc[]; a?: number; sum?: { q: string; ans: number; opts: number[] }; delay?: number; task?: Loc };
const ROUNDS = 5;
const DURATION: Record<Kind, number> = { trivia: 15, taps: 10, reaction: 8, maths: 15, task: 60 };
const KIND_LABEL: Record<Kind, string> = { trivia: "kTrivia", taps: "kTaps", reaction: "kReaction", maths: "kMaths", task: "kTask" };

function makeSum() {
  const a = 6 + Math.floor(Math.random() * 25), b = 3 + Math.floor(Math.random() * 12);
  const [q, ans] = Math.random() < 0.5 ? [`${a} + ${b}`, a + b] : [`${a} × ${Math.min(b, 9)}`, a * Math.min(b, 9)];
  const opts = new Set([ans]);
  while (opts.size < 4) opts.add(ans + Math.floor(Math.random() * 13) - 6 || ans + 7);
  return { q, ans, opts: shuffle([...opts]) };
}
function makeRounds(): Round[] {
  const qs = shuffle([...ADULT_TRIVIA, ...SPORTS_TRIVIA]);
  return shuffle<Kind>(["trivia", "taps", "reaction", "maths", "task"]).map((kind, i) => {
    if (kind === "trivia") return { kind, q: qs[i].q, o: qs[i].o, a: qs[i].a };
    if (kind === "maths") return { kind, sum: makeSum() };
    if (kind === "reaction") return { kind, delay: 1500 + Math.floor(Math.random() * 2500) };
    if (kind === "task") return { kind, task: TABLE_TASKS[Math.floor(Math.random() * TABLE_TASKS.length)] };
    return { kind };
  });
}
/** -1 means no valid answer. Taps: more is better; everything else: fewer ms is better. */
function decide(kind: Kind, mine: number, theirs: number): "me" | "them" | "tie" {
  if (mine < 0 && theirs < 0) return "tie";
  if (theirs < 0) return "me";
  if (mine < 0) return "them";
  if (mine === theirs) return "tie";
  return kind === "taps" ? (mine > theirs ? "me" : "them") : mine < theirs ? "me" : "them";
}

/* ---------- lobby state shared across the guest app ---------- */

export type Match = { id: string; me: string; them: string; myName: string; theirName: string; host: boolean };
type Lobby =
  | { phase: "idle" }
  | { phase: "sending"; id: string; to: string; team: string }
  | { phase: "declined" | "timeout"; to: string }
  | { phase: "match"; match: Match };
type Incoming = { id: string; from: string; name: string } | null;

type VersusCtx = {
  enabled: boolean;
  lobby: Lobby;
  incoming: Incoming;
  invite: (to: string, team: string) => void;
  cancel: () => void;
  accept: () => void;
  decline: () => void;
  reset: () => void;
};
const VersusContext = createContext<VersusCtx | null>(null);
export const useVersus = () => useContext(VersusContext);

export function VersusProvider({ children }: { children: React.ReactNode }) {
  const { venue, table, demo, go, log, screen } = useGuest();
  const screenRef = useRef(screen);
  screenRef.current = screen;
  const show = useCallback(() => screenRef.current !== "versus" && go("versus"), [go]);
  const enabled = Boolean(venue.modules.versus && table && !demo && venue.id !== "sample");
  const [lobby, setLobby] = useState<Lobby>({ phase: "idle" });
  const [incoming, setIncoming] = useState<Incoming>(null);
  const [myTeam, setMyTeam] = useState("");
  const ch = useRef<RealtimeChannel | null>(null);
  const lobbyRef = useRef(lobby), incomingRef = useRef(incoming);
  lobbyRef.current = lobby;
  incomingRef.current = incoming;

  useEffect(() => {
    if (!enabled) return;
    const sb = getBrowserClient()!;
    const c = sb.channel(`vs-${venue.id}`, { config: { broadcast: { self: false } } });
    c.on("broadcast", { event: "invite" }, ({ payload: p }) => {
      if (p.to === table && p.from !== table) setIncoming({ id: p.id, from: p.from, name: p.name });
    })
      .on("broadcast", { event: "cancel" }, ({ payload: p }) => {
        if (incomingRef.current?.id === p.id) setIncoming(null);
      })
      .on("broadcast", { event: "accept" }, ({ payload: p }) => {
        const l = lobbyRef.current;
        if (l.phase === "sending" && l.id === p.id) {
          setLobby({ phase: "match", match: { id: p.id, me: table!, them: p.from, myName: l.team || `Table ${table}`, theirName: p.name, host: true } });
          show();
        }
        if (p.from === table && incomingRef.current?.id === p.id) setIncoming(null); // another phone at our table accepted
      })
      .on("broadcast", { event: "decline" }, ({ payload: p }) => {
        const l = lobbyRef.current;
        if (l.phase === "sending" && l.id === p.id) setLobby({ phase: "declined", to: l.to });
        if (p.from === table && incomingRef.current?.id === p.id) setIncoming(null);
      })
      .subscribe();
    ch.current = c;
    return () => {
      sb.removeChannel(c);
      ch.current = null;
    };
  }, [enabled, venue.id, table, show]);

  // Invites expire after a minute.
  useEffect(() => {
    if (lobby.phase !== "sending") return;
    const t = setTimeout(() => setLobby((l) => (l.phase === "sending" ? { phase: "timeout", to: l.to } : l)), 60_000);
    return () => clearTimeout(t);
  }, [lobby]);
  useEffect(() => {
    if (!incoming) return;
    const t = setTimeout(() => setIncoming(null), 60_000);
    return () => clearTimeout(t);
  }, [incoming]);

  const send = (event: string, payload: object) => ch.current?.send({ type: "broadcast", event, payload });

  const value: VersusCtx = {
    enabled,
    lobby,
    incoming,
    invite: (to, team) => {
      const id = crypto.randomUUID();
      setMyTeam(team);
      setLobby({ phase: "sending", id, to, team });
      send("invite", { id, from: table, to, name: team || `Table ${table}` });
      log("view", { module: "versus_invite" });
    },
    cancel: () => {
      if (lobby.phase === "sending") send("cancel", { id: lobby.id });
      setLobby({ phase: "idle" });
    },
    accept: () => {
      if (!incoming) return;
      const name = myTeam || `Table ${table}`;
      send("accept", { id: incoming.id, from: table, name });
      setLobby({ phase: "match", match: { id: incoming.id, me: table!, them: incoming.from, myName: name, theirName: incoming.name, host: false } });
      setIncoming(null);
      show();
    },
    decline: () => {
      if (incoming) send("decline", { id: incoming.id, from: table });
      setIncoming(null);
    },
    reset: () => setLobby({ phase: "idle" }),
  };

  return (
    <VersusContext.Provider value={value}>
      {children}
      <IncomingSheet />
    </VersusContext.Provider>
  );
}

function IncomingSheet() {
  const v = useVersus();
  const { lang } = useGuest();
  if (!v?.incoming) return null;
  const u = VUI[lang];
  return (
    <div className="vs-incoming" role="alertdialog" aria-live="assertive">
      <span className="vs-swords" aria-hidden="true">
        ⚔️
      </span>
      <h3>{fmt(u.incoming, { name: v.incoming.name })}</h3>
      <p>{u.sub}</p>
      <div className="g-row">
        <button className="g-btn alt" onClick={v.decline}>
          {u.decline}
        </button>
        <button className="g-btn" onClick={v.accept} autoFocus>
          {u.accept}
        </button>
      </div>
    </div>
  );
}

/* ---------- screen ---------- */

export function VersusScreen() {
  const v = useVersus();
  const { table, lang } = useGuest();
  const u = VUI[lang];
  if (!v) return null;
  if (v.lobby.phase === "match") return <MatchRunner key={v.lobby.match.id} match={v.lobby.match} />;
  if (!table) return <p className="g-note">{u.noTable}</p>;
  return <LobbyForm />;
}

function LobbyForm() {
  const v = useVersus()!;
  const { table, lang } = useGuest();
  const u = VUI[lang];
  const [to, setTo] = useState("");
  const [team, setTeam] = useState("");
  const [err, setErr] = useState("");
  const l = v.lobby;

  return (
    <>
      <div className="vs-hero">
        <span aria-hidden="true">⚔️</span>
        <h2 className="g-h">{u.title}</h2>
        <p className="g-sub">{u.sub}</p>
      </div>
      {l.phase === "sending" ? (
        <div className="prompt group vs-wait">
          <span className="vs-pulse" aria-hidden="true" />
          <p>{fmt(u.waiting, { t: l.to })}</p>
          <div>
            <button className="g-btn" style={{ background: "#fff", color: "#1B1740" }} onClick={v.cancel}>
              {u.cancel}
            </button>
          </div>
        </div>
      ) : (
        <form
          className="g-card vs-form"
          onSubmit={(e) => {
            e.preventDefault();
            const n = String(Number(to));
            if (!/^\d{1,3}$/.test(to) || n === "0") return setErr(u.tableNo);
            if (n === table) return setErr(u.self);
            setErr("");
            v.invite(n, team.trim().slice(0, 24));
          }}
        >
          <span className="badge" style={{ alignSelf: "flex-start" }}>
            {u.yourTable} {table}
          </span>
          <label htmlFor="vs-to">
            <b>{u.theirTable}</b>
          </label>
          <input id="vs-to" className="vs-num" inputMode="numeric" pattern="\d*" maxLength={3} placeholder={u.tableNo} value={to} onChange={(e) => setTo(e.target.value.replace(/\D/g, ""))} />
          <label htmlFor="vs-team" className="g-sub">
            {u.team}
          </label>
          <input id="vs-team" className="vs-text" maxLength={24} placeholder={u.teamPh} value={team} onChange={(e) => setTeam(e.target.value)} />
          {(err || l.phase === "declined" || l.phase === "timeout") && (
            <p className="g-service-msg bad">{err || fmt(l.phase === "declined" ? u.declined : u.timeout, { t: (l as { to: string }).to })}</p>
          )}
          <button className="g-btn vs-send" type="submit">
            {u.send}
          </button>
        </form>
      )}
      <div className="g-card">
        <b>{u.how}</b>
        {(["kTrivia", "kTaps", "kReaction", "kMaths", "kTask"] as const).map((k) => (
          <span key={k} className="g-sub">
            {u[k]}
          </span>
        ))}
      </div>
    </>
  );
}

type Phase = "joining" | "countdown" | "play" | "sent" | "result" | "final" | "left";

function MatchRunner({ match }: { match: Match }) {
  const v = useVersus()!;
  const { L, lang, home, log } = useGuest();
  const u = VUI[lang];
  const [phase, setPhase] = useState<Phase>("joining");
  const [n, setN] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [count, setCount] = useState(3);
  const [scores, setScores] = useState<Record<string, number>>({ [match.me]: 0, [match.them]: 0 });
  const [roundWinner, setRoundWinner] = useState<string | null | undefined>(undefined);
  const [left, setLeft] = useState(0);
  const [taps, setTaps] = useState(0);
  const [green, setGreen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const ch = useRef<RealtimeChannel | null>(null);
  const t0 = useRef(0), tapsRef = useRef(0), sentRef = useRef(false);
  const answers = useRef<Record<number, Record<string, number>>>({});
  const roundsRef = useRef<Round[]>([]);
  const started = useRef(false), decided = useRef<Set<number>>(new Set());
  const scoresRef = useRef(scores);
  scoresRef.current = scores;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const name = (t: string | null | undefined) => (t === match.me ? match.myName : t === match.them ? match.theirName : "");

  /* ----- host referee ----- */
  const settle = useCallback(
    (rn: number) => {
      if (!match.host || decided.current.has(rn)) return;
      decided.current.add(rn);
      const r = roundsRef.current[rn];
      const a = answers.current[rn] ?? {};
      const w = decide(r.kind, a[match.me] ?? -1, a[match.them] ?? -1);
      const winner = w === "me" ? match.me : w === "them" ? match.them : null;
      const next = { ...scoresRef.current };
      if (winner) next[winner] = (next[winner] ?? 0) + 1;
      const payload = { n: rn, winner, scores: next };
      ch.current?.send({ type: "broadcast", event: "result", payload });
      onResult(payload);
      later(() => (rn + 1 < ROUNDS ? startRound(rn + 1) : finish(next)), 3500);
    },
    [match], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const startRound = (rn: number) => {
    const payload = { n: rn, round: roundsRef.current[rn] };
    ch.current?.send({ type: "broadcast", event: "round", payload });
    onRound(payload);
    later(() => settle(rn), (DURATION[payload.round.kind] + 3 + 3) * 1000 + (payload.round.delay ?? 0));
  };
  const finish = (s: Record<string, number>) => {
    ch.current?.send({ type: "broadcast", event: "final", payload: { scores: s } });
    onFinal({ scores: s });
  };
  const record = (rn: number, tbl: string, value: number) => {
    if (!match.host) return;
    answers.current[rn] = { ...(answers.current[rn] ?? {}), [tbl]: value };
    if (Object.keys(answers.current[rn]).length >= 2) settle(rn);
  };

  /* ----- both sides ----- */
  const onRound = ({ n: rn, round: r }: { n: number; round: Round }) => {
    setN(rn);
    setRound(r);
    setRoundWinner(undefined);
    setTaps(0);
    tapsRef.current = 0;
    setGreen(false);
    setPicked(null);
    sentRef.current = false;
    setPhase("countdown");
    setCount(3);
    [1, 2].forEach((i) => later(() => setCount(3 - i), i * 800));
    later(() => {
      t0.current = performance.now();
      setPhase("play");
      setLeft(DURATION[r.kind]);
      if (r.kind === "reaction") later(() => ((t0.current = performance.now()), setGreen(true)), r.delay ?? 2000);
    }, 2400);
  };
  const onResult = (p: { n: number; winner: string | null; scores: Record<string, number> }) => {
    setScores(p.scores);
    setRoundWinner(p.winner);
    setPhase("result");
  };
  const onFinal = (p: { scores: Record<string, number> }) => {
    setScores(p.scores);
    setPhase("final");
    log("game_finish", { item: "versus" });
  };

  const submit = useCallback(
    (value: number) => {
      if (sentRef.current) return;
      sentRef.current = true;
      setPhase("sent");
      ch.current?.send({ type: "broadcast", event: "answer", payload: { n, table: match.me, value } });
      record(n, match.me, value);
    },
    [n, match.me], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Round clock: auto-submit when time runs out.
  useEffect(() => {
    if (phase !== "play" || !round) return;
    if (left <= 0) {
      submit(round.kind === "taps" ? tapsRef.current : -1);
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left, round, submit]);

  useEffect(() => {
    const sb = getBrowserClient()!;
    const c = sb.channel(`vsm-${match.id}`, { config: { broadcast: { self: false }, presence: { key: match.me } } });
    c.on("broadcast", { event: "round" }, ({ payload }) => !match.host && onRound(payload))
      .on("broadcast", { event: "answer" }, ({ payload: p }) => record(p.n, p.table, p.value))
      .on("broadcast", { event: "result" }, ({ payload }) => !match.host && onResult(payload))
      .on("broadcast", { event: "final" }, ({ payload }) => !match.host && onFinal(payload))
      .on("broadcast", { event: "bye" }, ({ payload: p }) => p.table === match.them && setPhase((ph) => (ph === "final" ? ph : "left")))
      .on("presence", { event: "sync" }, () => {
        const here = Object.keys(c.presenceState());
        if (match.host && !started.current && here.includes(match.them)) {
          started.current = true;
          roundsRef.current = makeRounds();
          log("game_start", { item: "versus" });
          later(() => startRound(0), 1200);
        }
      })
      .subscribe((s) => s === "SUBSCRIBED" && c.track({ at: Date.now() }));
    ch.current = c;
    return () => {
      c.send({ type: "broadcast", event: "bye", payload: { table: match.me } });
      timers.current.forEach(clearTimeout);
      sb.removeChannel(c);
    };
  }, [match]); // eslint-disable-line react-hooks/exhaustive-deps

  const ms = () => Math.round(performance.now() - t0.current);
  const board = (
    <div className="vs-board">
      <div className="me">
        <span>{match.myName}</span>
        <b>{scores[match.me] ?? 0}</b>
      </div>
      <span className="vs-vs">VS</span>
      <div className="them">
        <span>{match.theirName}</span>
        <b>{scores[match.them] ?? 0}</b>
      </div>
    </div>
  );

  if (phase === "left")
    return (
      <>
        {board}
        <div className="prompt group">
          <p>{fmt(u.left, { name: match.theirName })}</p>
        </div>
        <button className="g-btn" onClick={() => (v.reset(), home())}>
          {u.home}
        </button>
      </>
    );

  if (phase === "final") {
    const a = scores[match.me] ?? 0, b = scores[match.them] ?? 0;
    const won = a > b;
    return (
      <>
        {board}
        <div className={`prompt ${won ? "group" : "date"} vs-final`}>
          <p style={{ fontSize: "3rem" }}>{a === b ? "🤝" : won ? "🏆" : "👏"}</p>
          <p>{a === b ? fmt(u.finalTie, { a, b }) : fmt(u.final, { name: won ? match.myName : match.theirName, a: Math.max(a, b), b: Math.min(a, b) })}</p>
        </div>
        <div className="g-row">
          <button className="g-btn alt" onClick={() => (v.reset(), home())}>
            {u.home}
          </button>
          <button className="g-btn" onClick={() => (v.reset(), v.invite(match.them, match.myName.startsWith("Table ") ? "" : match.myName))}>
            {u.rematch}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {board}
      {phase === "joining" && (
        <div className="prompt group vs-wait">
          <span className="vs-pulse" aria-hidden="true" />
          <p>{u.joining}</p>
        </div>
      )}
      {round && phase !== "joining" && (
        <>
          <div className="vs-round">
            <span>{fmt(u.round, { n: n + 1, of: ROUNDS })}</span>
            <b>{u[KIND_LABEL[round.kind]]}</b>
            {phase === "play" && round.kind !== "reaction" && <span className="vs-clock">{left}s</span>}
          </div>

          {phase === "countdown" && <div className="vs-count">{count > 0 ? count : u.go}</div>}

          {phase === "play" && round.kind === "trivia" && round.q && (
            <>
              <div className="prompt group">
                <p>{L(round.q)}</p>
              </div>
              <div className="quiz-opts">
                {round.o!.map((o, i) => (
                  <button key={i} onClick={() => (setPicked(i), submit(i === round.a ? ms() : -1))}>
                    {L(o)}
                  </button>
                ))}
              </div>
            </>
          )}
          {phase === "play" && round.kind === "maths" && round.sum && (
            <>
              <div className="prompt kids">
                <p style={{ fontSize: "2.4rem", direction: "ltr" }}>{round.sum.q} = ?</p>
              </div>
              <div className="sum-opts">
                {round.sum.opts.map((o) => (
                  <button key={o} onClick={() => (setPicked(o), submit(o === round.sum!.ans ? ms() : -1))}>
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
          {phase === "play" && round.kind === "taps" && (
            <button
              className="vs-tap"
              onPointerDown={() => {
                tapsRef.current += 1;
                setTaps(tapsRef.current);
              }}
            >
              <b>{taps}</b>
              <span>{u.tapFast}</span>
            </button>
          )}
          {phase === "play" && round.kind === "reaction" && (
            <button className={`reaction ${green ? "go" : "wait"}`} onPointerDown={() => submit(green ? ms() : -1)}>
              {green ? u.tapNow : u.wait}
            </button>
          )}
          {phase === "play" && round.kind === "task" && round.task && (
            <>
              <div className="prompt date">
                <p>{L(round.task)}</p>
              </div>
              <button className="g-btn vs-done" onClick={() => submit(ms())}>
                {u.done}
              </button>
            </>
          )}

          {phase === "sent" && (
            <div className="prompt group vs-wait">
              {round.kind === "taps" && (
                <p style={{ fontSize: "2.4rem" }}>
                  {taps} {u.taps}
                </p>
              )}
              {round.kind === "reaction" && sentRef.current && !green && <p>{u.tooSoon}</p>}
              {(round.kind === "trivia" || round.kind === "maths") && picked != null && (
                <p>{(round.kind === "trivia" ? picked === round.a : picked === round.sum?.ans) ? "✅" : "❌"}</p>
              )}
              <span className="vs-pulse" aria-hidden="true" />
              <p style={{ fontSize: "1.1rem" }}>{fmt(u.waitingThem, { name: match.theirName })}</p>
            </div>
          )}

          {phase === "result" && (
            <div className={`prompt ${roundWinner === match.me ? "group" : roundWinner ? "date" : "kids"} vs-result`}>
              <p>{roundWinner ? fmt(u.winsRound, { name: name(roundWinner) }) : u.tie}</p>
            </div>
          )}
        </>
      )}
    </>
  );
}

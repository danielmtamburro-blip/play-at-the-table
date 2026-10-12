"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { T, type TKey } from "@/lib/content";
import { GAMES } from "@/lib/games";
import { track, trackTimeOnPage, type TrackEvent, type TrackOpts } from "@/lib/track";
import type { Lang, Loc, Offer, Venue } from "@/lib/types";
import { EXTRA, GuestContext, useGuest, type GuestCtx } from "./context";
import DemoTour from "./DemoTour";
import { BackIcon } from "./icons";
import { GROUP_Q, THIS_THAT } from "@/lib/content";
import { ADULT_TRIVIA, ADULT_WYR, CATEGORIES, CHARADES, DRINK_LIKELY, DRINK_NEVER, EMOJI_PUZZLES, MOST_LIKELY, NEVER_HAVE_I, SIP_OR_SHARE, SPORTS_TRIVIA, TABLE_RULES } from "@/lib/gameContent";
import { drinkAge } from "@/lib/games";
import { BubblePop, KeepyUppy, MathSprint, Penalty, Racer, Reaction, Scramble, TicTacToe } from "./screens/Arcade";
import { Crossword, Sudoku, WordGuess, WordSearch } from "./screens/Puzzles";
import { CardRules, DrinkDice, HigherLower, SpinWheel } from "./screens/Wheel";
import { Charades, CountIt, GameHub, NameFive, OddOneOut, Pairs, PromptCards, QuizGame, Reveal } from "./screens/Engines";
import { Deck, Picker } from "./screens/Games";
import { Colour, Memory } from "./screens/Kids";
import { AgeGate, Feedback } from "./screens/Service";
import { VersusProvider, VersusScreen } from "./screens/Versus";
import { Events, Home, Menu, Offers } from "./screens/Venue";

type Props = {
  venue: Venue;
  table?: string | null;
  /** Running inside the phone mock-up on the sales page (no analytics, inner scrolling). */
  embedded?: boolean;
  /** Play a self-running tour (sales page phone). */
  autoplay?: boolean;
  onCaption?: (text: string) => void;
};

function Redeem({ offer, onClose }: { offer: Offer; onClose: () => void }) {
  const { venue, table, tr, L, locale } = useGuest();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="redeem" role="dialog" aria-modal="true" style={{ background: `var(--${offer.color})` }}>
      <span className="eyebrow" style={{ color: "#fff", opacity: 0.9 }}>
        {L(venue.name)}
        {table && ` · ${tr("table")} ${table}`}
      </span>
      <h3>{L(offer.title)}</h3>
      <p style={{ maxWidth: "32ch" }}>{tr("showThis")}</p>
      <div className="clock">{now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
      {L(offer.terms) && <p style={{ fontSize: ".8rem", opacity: 0.9, maxWidth: "34ch" }}>{L(offer.terms)}</p>}
      <button className="g-btn" onClick={onClose} autoFocus>
        {tr("done")}
      </button>
    </div>
  );
}

export default function GuestApp({ venue, table = null, embedded = false, autoplay = false, onCaption }: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const [stack, setStack] = useState<string[]>(["home"]);
  const [redeemOffer, setRedeemOffer] = useState<Offer | null>(null);
  const [privacy, setPrivacy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Language: saved choice, else the phone's language.
  useEffect(() => {
    try {
      const s = localStorage.getItem("patt-lang");
      if (s === "ar" || s === "en") setLang(s);
      else if ((navigator.language || "").startsWith("ar")) setLang("ar");
    } catch {}
  }, []);

  const langRef = useRef(lang);
  langRef.current = lang;
  const log = useCallback(
    (event: TrackEvent, opts: TrackOpts = {}) => {
      if (!embedded) track(venue.id, event, { table, lang: langRef.current, ...opts });
    },
    [embedded, venue.id, table],
  );

  useEffect(() => {
    if (embedded) return;
    // Wait a tick so the saved language is applied before the first event.
    const t = setTimeout(() => log("scan"), 300);
    const stop = trackTimeOnPage(venue.id, () => ({ table, lang: langRef.current }));
    return () => {
      clearTimeout(t);
      stop();
    };
  }, [embedded, venue.id, table, log]);

  const go = useCallback(
    (k: string) => {
      setStack((s) => [...s, k]);
      log("view", { module: k.split(":")[0], item: k.startsWith("deck:") ? k.slice(5) : undefined });
      if (GAMES.some((g) => g.key === k)) log("game_start", { item: k });
    },
    [log],
  );

  const cur = stack[stack.length - 1];
  useEffect(() => {
    if (embedded) bodyRef.current?.scrollTo({ top: 0 });
    else window.scrollTo(0, 0);
  }, [cur, stack.length, embedded]);

  const ctx: GuestCtx = useMemo(() => {
    const tr = (k: TKey) => T[lang][k] ?? T.en[k];
    const L = (o: Loc | string | undefined | null) => (o == null ? "" : typeof o === "string" ? o : o[lang] || o.en);
    return {
      venue,
      table,
      lang,
      locale: lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB",
      tr,
      L,
      go,
      redeem: (o: Offer) => {
        setRedeemOffer(o);
        log("redeem", { module: "offers", item: o.title.en });
      },
      log,
      demo: embedded,
      home: () => setStack(["home"]),
      screen: cur,
    };
  }, [lang, venue, table, go, log, embedded, cur]);

  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const { tr, L } = ctx;
  const x = EXTRA[lang];
  const age = drinkAge(venue.games);

  const screen = (() => {
    if (cur.startsWith("deck:")) return <Deck key={cur} id={cur.slice(5)} onExit={back} />;
    switch (cur) {
      case "menu": return <Menu kind="food" />;
      case "drinks": return <Menu kind="drinks" />;
      case "events": return <Events />;
      case "offers": return <Offers />;
      case "feedback": return <Feedback demo={embedded} onDone={back} />;
      case "versus": return <VersusScreen />;
      // Section hubs
      case "kids": return <GameHub group="kids" title={tr("kidsTitle")} sub={x.kidsSub} note={tr("playTogether")} />;
      case "group": return <GameHub group="group" title={x.adults} sub={tr("groupSub")} />;
      case "date": return <GameHub group="date" title={tr("dateTitle")} sub={tr("dateSub")} />;
      case "drink":
        return (
          <AgeGate age={age} onNo={back}>
            <GameHub group="drink" title={x.drink} sub={x.drinkS.replace("{age}", String(age))} note={x.drinkNote} />
          </AgeGate>
        );
      // Kids: 3+
      case "colour": return <Colour />;
      case "bubbles": return <BubblePop k="bubbles" />;
      case "oddone": return <OddOneOut k="oddone" />;
      case "count": return <CountIt k="count" />;
      // Kids: 6+
      case "penalty": return <Penalty k="penalty" />;
      case "racer": return <Racer k="racer" />;
      case "memory": return <Memory />;
      case "tictactoe": return <TicTacToe k="tictactoe" />;
      // Teens
      case "keepy": return <KeepyUppy k="keepy" />;
      case "reaction": return <Reaction k="reaction" />;
      case "maths": return <MathSprint k="maths" />;
      case "scramble": return <Scramble k="scramble" />;
      // Drinking games (age-gated)
      case "dnever": return <AgeGate age={age} onNo={back}><PromptCards k="dnever" items={DRINK_NEVER} tone="date" note={x.drinkNote} /></AgeGate>;
      case "dlikely": return <AgeGate age={age} onNo={back}><PromptCards k="dlikely" items={DRINK_LIKELY} tone="date" note={x.drinkNote} /></AgeGate>;
      case "sipshare": return <AgeGate age={age} onNo={back}><PromptCards k="sipshare" items={SIP_OR_SHARE} tone="date" note={x.drinkNote} /></AgeGate>;
      case "rules": return <AgeGate age={age} onNo={back}><PromptCards k="rules" items={TABLE_RULES} tone="date" note={x.drinkNote} /></AgeGate>;
      case "hilo": return <AgeGate age={age} onNo={back}><HigherLower k="hilo" /></AgeGate>;
      case "kings": return <AgeGate age={age} onNo={back}><CardRules k="kings" /></AgeGate>;
      case "dice": return <AgeGate age={age} onNo={back}><DrinkDice k="dice" /></AgeGate>;
      case "sipwheel": return <AgeGate age={age} onNo={back}><SpinWheel k="sipwheel" mode="sip" /></AgeGate>;
      // Groups (10)
      case "quick": return <PromptCards k="quick" items={GROUP_Q} tone="group" />;
      case "tot": return <Pairs k="tot" pairs={THIS_THAT} />;
      case "wyr": return <Pairs k="wyr" pairs={ADULT_WYR} />;
      case "likely": return <PromptCards k="likely" items={MOST_LIKELY} tone="group" />;
      case "never": return <PromptCards k="never" items={NEVER_HAVE_I} tone="group" />;
      case "charades": return <Charades k="charades" words={CHARADES} />;
      case "categories": return <NameFive k="categories" cats={CATEGORIES} />;
      case "emoji": return <Reveal k="emoji" items={EMOJI_PUZZLES} tone="group" big />;
      case "trivia": return <QuizGame k="trivia" questions={ADULT_TRIVIA} tone="group" />;
      case "sports": return <QuizGame k="sports" questions={SPORTS_TRIVIA} tone="group" />;
      case "bill": return <SpinWheel k="bill" mode="bill" />;
      case "sudoku": return <Sudoku k="sudoku" />;
      case "crossword": return <Crossword k="crossword" />;
      case "wordsearch": return <WordSearch k="wordsearch" />;
      case "wordguess": return <WordGuess k="wordguess" />;
      case "picker": return <Picker />;
      default: return <Home />;
    }
  })();

  return (
    <GuestContext.Provider value={ctx}>
      <VersusProvider>
      <div ref={rootRef} className="g" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        <div className="g-top">
          {stack.length > 1 ? (
            <button className="g-back" onClick={back} aria-label={tr("back")}>
              <BackIcon />
            </button>
          ) : (
            <span className="g-top-mark" aria-hidden="true">
              <LogoMark size={36} />
            </span>
          )}
          <div className="g-venue">
            <strong>{L(venue.name)}</strong>
            <span>
              {table ? `${tr("table")} ${table} · ` : ""}
              {L(venue.area)}
            </span>
          </div>
          <button
            className="g-lang"
            lang={lang === "en" ? "ar" : "en"}
            onClick={() => {
              const n = lang === "en" ? "ar" : "en";
              setLang(n);
              log("lang", { item: n });
              try {
                localStorage.setItem("patt-lang", n);
              } catch {}
            }}
          >
            {tr("lang")}
          </button>
        </div>
        <div className="g-body" ref={bodyRef} key={cur + stack.length}>
          {screen}
        </div>
        <div className="g-foot">
          {tr("powered")} · <button onClick={() => setPrivacy(true)}>{tr("privacy")}</button>
        </div>

        {privacy && (
          <div className="sheet" role="dialog" aria-label={tr("privacyTitle")}>
            <h3>{tr("privacyTitle")}</h3>
            <p>{tr("privacyText")}</p>
            <button className="g-btn" onClick={() => setPrivacy(false)} autoFocus>
              {tr("close")}
            </button>
          </div>
        )}
        {redeemOffer && <Redeem offer={redeemOffer} onClose={() => setRedeemOffer(null)} />}
        {autoplay && <DemoTour root={rootRef} body={bodyRef} onCaption={onCaption} />}
      </div>
      </VersusProvider>
    </GuestContext.Provider>
  );
}

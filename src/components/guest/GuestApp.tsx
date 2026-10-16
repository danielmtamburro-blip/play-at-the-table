"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { T, type TKey } from "@/lib/content";
import { GAMES } from "@/lib/games";
import { track, trackTimeOnPage, type TrackEvent, type TrackOpts } from "@/lib/track";
import type { Lang, Loc, Venue } from "@/lib/types";
import { EXTRA, GuestContext, useCalmFocus, useGuest, type GuestCtx } from "./context";
import { themeStyle } from "@/lib/theme";
import DemoTour from "./DemoTour";
import { setHaptics } from "@/lib/haptics";
import { setSfx } from "@/lib/sfx";
import { BackIcon, ICON } from "./icons";
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
import { Pour } from "./screens/Pour";
import { SplitBill } from "./screens/SplitBill";
import { KnowMe } from "./screens/KnowMe";
import { Runner } from "./arcade/Runner";
import { DirtBike } from "./arcade/DirtBike";
import { FreeKick } from "./arcade/FreeKick";
import { FruitSlash } from "./arcade/FruitSlash";
import { SkyTower } from "./arcade/SkyTower";
import { FalconFlight } from "./arcade/FalconFlight";
import { HoopShot } from "./arcade/HoopShot";
import { AnimalSounds, DancingFruit, SleepyLights } from "./screens/Toddler";
import { KidsLockProvider, KidsPill } from "./KidsLock";
import { VersusProvider, VersusScreen } from "./screens/Versus";
import { Events, Home, Menu, Nearby, Offers } from "./screens/Venue";
import { Celebrate } from "./screens/Celebrate";
import { SpotDiff } from "./screens/SpotDiff";
import { BarHub, Darts, Pool } from "./screens/BarGames";
import { PlayTab } from "./screens/Play";
import { LeaderboardProvider, LeaderboardScreen } from "./Leaderboard";

type Props = {
  venue: Venue;
  table?: string | null;
  /** Running inside the phone mock-up on the sales page (no analytics, inner scrolling). */
  embedded?: boolean;
  /** Play a self-running tour (sales page phone). */
  autoplay?: boolean;
  onCaption?: (text: string) => void;
};

export default function GuestApp({ venue, table = null, embedded = false, autoplay = false, onCaption }: Props) {
  const [lang, setLang] = useState<Lang>("en");
  const [stack, setStack] = useState<string[]>(["home"]);
  const [privacy, setPrivacy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  setHaptics(!embedded);
  setSfx(!embedded);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useCalmFocus<HTMLButtonElement>(embedded || !privacy);

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

  // How far down each screen in the stack was scrolled, so Back returns to the same spot.
  const scrolls = useRef<number[]>([]);
  const restore = useRef<number | null>(null);
  const scrollNow = useCallback(() => (embedded ? (bodyRef.current?.scrollTop ?? 0) : window.scrollY), [embedded]);

  const go = useCallback(
    (k: string) => {
      const y = scrollNow();
      setStack((s) => {
        scrolls.current[s.length - 1] = y;
        return [...s, k];
      });
      log("view", { module: k.split(":")[0], item: k.startsWith("deck:") ? k.slice(5) : undefined });
      if (GAMES.some((g) => g.key === k)) log("game_start", { item: k });
    },
    [log, scrollNow],
  );

  const cur = stack[stack.length - 1];
  useEffect(() => {
    // A new screen opens at the top; going back returns to where you were.
    const y = restore.current ?? 0;
    restore.current = null;
    const to = () => (embedded ? bodyRef.current?.scrollTo({ top: y }) : window.scrollTo(0, y));
    to();
    if (y) requestAnimationFrame(to); // again once images and cards have laid out
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
      log,
      demo: embedded,
      home: () => setStack(["home"]),
      screen: cur,
      toggleLang: () => {
        const n = lang === "en" ? "ar" : "en";
        setLang(n);
        log("lang", { item: n });
        try {
          localStorage.setItem("patt-lang", n);
        } catch {}
      },
    };
  }, [lang, venue, table, go, log, embedded, cur]);

  const back = () =>
    setStack((s) => {
      if (s.length < 2) return s;
      restore.current = scrolls.current[s.length - 2] ?? 0;
      return s.slice(0, -1);
    });
  const { tr, L } = ctx;
  const x = EXTRA[lang];
  const age = drinkAge(venue.games);
  const m = venue.modules;
  const offersTab = m.events ? "events" : "offers";
  const tabs: [string, string, React.ReactNode][] = [["home", x.tabHome, ICON.home]];
  if (m.menu || m.drinks) tabs.push([m.menu ? "menu" : "drinks", x.tabMenu, ICON.menu]);
  if (m.kids || m.group || m.date || m.drink || m.versus) tabs.push(["play", x.tabPlay, ICON.play]);
  if (m.offers || m.events) tabs.push([offersTab, x.tabOffers, ICON.offers]);
  if (m.feedback) tabs.push(["feedback", x.feedback, ICON.feedback]);
  /** Which tab a screen belongs to (the root of the current stack). */
  const tabOf = (st: string[]) => (st[0] === "drinks" && m.menu ? "menu" : st[0]);
  const openTab = (k: string) => {
    if (stack.length === 1 && stack[0] === k) return bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setStack([k]);
    log("view", { module: k });
  };

  const screen = (() => {
    if (cur.startsWith("deck:")) return <Deck key={cur} id={cur.slice(5)} onExit={back} />;
    if (cur === "leaderboard" || cur.startsWith("leaderboard:")) return <LeaderboardScreen key={cur} initial={cur.split(":")[1]} />;
    switch (cur) {
      case "menu": return <Menu kind="food" />;
      case "drinks": return <Menu kind="drinks" />;
      case "events": return <Events />;
      case "offers": return <Offers />;
      case "feedback": return <Feedback demo={embedded} onDone={() => (stack.length > 1 ? back() : setStack(["home"]))} />;
      case "play": return <PlayTab />;
      case "celebrate": return <Celebrate />;
      case "nearby": return <Nearby />;
      case "spotkids": return <SpotDiff k="spotkids" level="kids" />;
      case "spot": return <SpotDiff k="spot" level="adults" />;
      case "bar": return <BarHub />;
      case "darts": return <Darts k="darts" />;
      case "pool": return <Pool k="pool" />;
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
      // Babies and toddlers
      case "animals": return <AnimalSounds k="animals" />;
      case "fruit": return <DancingFruit k="fruit" />;
      case "calm": return <SleepyLights k="calm" />;
      case "split": return <SplitBill k="split" />;
      case "knowme": return <KnowMe k="knowme" />;
      case "runner": return <Runner k="runner" />;
      case "bike": return <DirtBike k="bike" />;
      case "freekick": return <FreeKick k="freekick" />;
      case "slice": return <FruitSlash k="slice" />;
      case "stack": return <SkyTower k="stack" />;
      case "falcon": return <FalconFlight k="falcon" />;
      case "hoops": return <HoopShot k="hoops" />;
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
      case "pour": return <AgeGate age={age} onNo={back}><Pour k="pour" /></AgeGate>;
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
      <LeaderboardProvider>
      <div
        ref={rootRef}
        className={`g${venue.theme ? " themed" : ""}${venue.theme?.tiles === "brand" ? " tiles-brand" : ""}`}
        style={themeStyle(venue.theme)}
        dir={lang === "ar" ? "rtl" : "ltr"}
        lang={lang}
      >
        <KidsLockProvider>
        {cur !== "home" && (
          <div className="g-top">
            {stack.length > 1 ? (
              <button className="g-back" onClick={back} aria-label={tr("back")}>
                <BackIcon />
              </button>
            ) : (
              <span className="g-top-mark" aria-hidden="true">
                {venue.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={venue.logoUrl} alt="" />
                ) : (
                  <LogoMark size={36} />
                )}
              </span>
            )}
            <div className="g-venue">
              <strong>{L(venue.name)}</strong>
              <span>
                {table ? `${tr("table")} ${table} · ` : ""}
                {L(venue.area)}
              </span>
            </div>
            <button className="g-lang" lang={lang === "en" ? "ar" : "en"} onClick={ctx.toggleLang}>
              {tr("lang")}
            </button>
          </div>
        )}
        <div className={`g-body${cur === "home" ? " is-home" : ""}`} ref={bodyRef} key={cur + stack.length}>
          {screen}
          <p className="g-foot">
            {tr("powered")} · <button onClick={() => setPrivacy(true)}>{tr("privacy")}</button>
          </p>
        </div>
        {tabs.length > 1 && (
          <nav className="g-tabbar" aria-label={x.explore}>
            {tabs.map(([k, label, icon]) => (
              <button key={k} aria-current={tabOf(stack) === k ? "page" : undefined} data-tab={k} onClick={() => openTab(k)}>
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}

        {privacy && (
          <div className="sheet" role="dialog" aria-label={tr("privacyTitle")}>
            <h3>{tr("privacyTitle")}</h3>
            <p>{tr("privacyText")}</p>
            <button className="g-btn" onClick={() => setPrivacy(false)} ref={closeRef}>
              {tr("close")}
            </button>
          </div>
        )}
        {GAMES.some((g) => g.key === cur && g.group === "kids") && <KidsPill />}
        {autoplay && <DemoTour root={rootRef} body={bodyRef} onCaption={onCaption} />}
        </KidsLockProvider>
      </div>
      </LeaderboardProvider>
      </VersusProvider>
    </GuestContext.Provider>
  );
}

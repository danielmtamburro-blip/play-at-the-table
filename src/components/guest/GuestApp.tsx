"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { T, type TKey } from "@/lib/content";
import { GAMES } from "@/lib/games";
import { track, trackTimeOnPage, type TrackEvent, type TrackOpts } from "@/lib/track";
import type { Lang, Loc, Offer, Venue } from "@/lib/types";
import { GuestContext, useGuest, type GuestCtx } from "./context";
import { BackIcon } from "./icons";
import { GROUP_Q, KIDS_QUIZ, THIS_THAT } from "@/lib/content";
import { ADULT_TRIVIA, ADULT_WYR, ANIMAL_QUIZ, CATEGORIES, CHARADES, EMOJI_PUZZLES, KIDS_RIDDLES, KIDS_WYR, MOST_LIKELY, NEVER_HAVE_I } from "@/lib/gameContent";
import { CountIt, GameHub, Charades, NameFive, OddOneOut, Pairs, PromptCards, QuizGame, Reveal, TicTacToe } from "./screens/Engines";
import { Deck, Picker } from "./screens/Games";
import { Challenge, Colour, Memory } from "./screens/Kids";
import { Feedback } from "./screens/Service";
import { Events, Home, Menu, Offers } from "./screens/Venue";

type Props = {
  venue: Venue;
  table?: string | null;
  /** Running inside the phone mock-up on the sales page (no analytics, inner scrolling). */
  embedded?: boolean;
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

export default function GuestApp({ venue, table = null, embedded = false }: Props) {
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
    };
  }, [lang, venue, table, go, log, embedded]);

  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const { tr, L } = ctx;

  const screen = (() => {
    if (cur.startsWith("deck:")) return <Deck key={cur} id={cur.slice(5)} onExit={back} />;
    switch (cur) {
      case "menu": return <Menu kind="food" />;
      case "drinks": return <Menu kind="drinks" />;
      case "events": return <Events />;
      case "offers": return <Offers />;
      case "feedback": return <Feedback demo={embedded} onDone={back} />;
      // Section hubs
      case "kids": return <GameHub group="kids" title={tr("kidsTitle")} sub={tr("kidsSub")} note={tr("playTogether")} />;
      case "group": return <GameHub group="group" title={tr("groupTitle")} sub={tr("groupSub")} />;
      case "date": return <GameHub group="date" title={tr("dateTitle")} sub={tr("dateSub")} />;
      // Kids (10)
      case "colour": return <Colour />;
      case "memory": return <Memory />;
      case "oddone": return <OddOneOut k="oddone" />;
      case "count": return <CountIt k="count" />;
      case "tictactoe": return <TicTacToe k="tictactoe" />;
      case "quiz": return <QuizGame k="quiz" questions={KIDS_QUIZ} tone="kids" />;
      case "animals": return <QuizGame k="animals" questions={ANIMAL_QUIZ} tone="kids" />;
      case "riddles": return <Reveal k="riddles" items={KIDS_RIDDLES} tone="kids" />;
      case "kwyr": return <Pairs k="kwyr" pairs={KIDS_WYR} />;
      case "challenge": return <Challenge />;
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
      case "picker": return <Picker />;
      default: return <Home />;
    }
  })();

  return (
    <GuestContext.Provider value={ctx}>
      <div ref={rootRef} className="g" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        <div className="g-top">
          {stack.length > 1 ? (
            <button className="g-back" onClick={back} aria-label={tr("back")}>
              <BackIcon />
            </button>
          ) : venue.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={venue.logoUrl} alt="" width={40} height={40} style={{ width: 40, height: 40, objectFit: "contain", flex: "none", borderRadius: 10 }} />
          ) : (
            <LogoMark size={40} />
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
      </div>
    </GuestContext.Provider>
  );
}

"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { T, type TKey } from "@/lib/content";
import { track } from "@/lib/track";
import type { Lang, Loc, Offer, Venue } from "@/lib/types";
import { GuestContext, useGuest, type GuestCtx } from "./context";
import { BackIcon } from "./icons";
import { DateHub, Deck, GroupHub, Picker, Quick, ThisOrThat } from "./screens/Games";
import { Challenge, Colour, KidsHub, Memory, Quiz } from "./screens/Kids";
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

  useEffect(() => {
    if (!embedded) track(venue.id, "scan", { table: table ?? undefined });
  }, [embedded, venue.id, table]);

  const go = useCallback(
    (k: string) => {
      setStack((s) => [...s, k]);
      if (!embedded) track(venue.id, "view", { module: k.split(":")[0], table: table ?? undefined });
    },
    [embedded, venue.id, table],
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
        if (!embedded) track(venue.id, "redeem", { module: "offers", table: table ?? undefined });
      },
    };
  }, [lang, venue, table, go, embedded]);

  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const { tr, L } = ctx;

  const screen = (() => {
    if (cur.startsWith("deck:")) return <Deck key={cur} id={cur.slice(5)} onExit={back} />;
    switch (cur) {
      case "menu": return <Menu kind="food" />;
      case "drinks": return <Menu kind="drinks" />;
      case "events": return <Events />;
      case "offers": return <Offers />;
      case "kids": return <KidsHub />;
      case "colour": return <Colour />;
      case "memory": return <Memory />;
      case "quiz": return <Quiz />;
      case "challenge": return <Challenge />;
      case "group": return <GroupHub />;
      case "quick": return <Quick />;
      case "tot": return <ThisOrThat />;
      case "picker": return <Picker />;
      case "date": return <DateHub />;
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

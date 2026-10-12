"use client";
import { useState } from "react";
import { ALLERGEN, DAYS, DIET } from "@/lib/content";
import { anyGameOn, drinkAge } from "@/lib/games";
import type { Offer, VenueEvent } from "@/lib/types";
import { EXTRA, useGuest } from "../context";
import { useService } from "./Service";
import { ChallengeBanner, GameCard, venueGames } from "./Play";
import { ICON } from "../icons";

/* ---------- Home ---------- */

function CopyButton({ text }: { text: string }) {
  const { tr, log } = useGuest();
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="g-copy"
      onClick={() => {
        log("wifi_copy");
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          },
          () => {},
        );
      }}
    >
      {copied ? tr("copied") : tr("copy")}
    </button>
  );
}

/** Slim Wi-Fi strip: network, password and a copy button. */
function WifiStrip() {
  const { venue, lang } = useGuest();
  const x = EXTRA[lang];
  if (!venue.wifi.ssid && !venue.wifi.pass) return null;
  return (
    <div className="g-wifi" aria-label={x.wifi}>
      <span className="g-wifi-txt">
        {venue.wifi.ssid && (
          <span>
            {x.wifiName}: <b dir="ltr">{venue.wifi.ssid}</b>
          </span>
        )}
        {venue.wifi.pass && (
          <span>
            {x.pass}: <b dir="ltr">{venue.wifi.pass}</b>
          </span>
        )}
      </span>
      {venue.wifi.pass && <CopyButton text={venue.wifi.pass} />}
    </div>
  );
}

/** Swipeable row of cards. */
function Scroller({ title, more, children }: { title: string; more?: () => void; children: React.ReactNode }) {
  const { lang } = useGuest();
  return (
    <section className="g-scroll-sec">
      <div className="g-sec-head">
        <h3 className="g-sec">{title}</h3>
        {more && (
          <button className="g-more" onClick={more}>
            {EXTRA[lang].seeAll} ›
          </button>
        )}
      </div>
      <div className="g-scroller">{children}</div>
    </section>
  );
}

/** Cover photo (or brand colour) with the table and language on it, and the logo card overlapping. */
function Cover() {
  const { venue, table, tr, L, lang, toggleLang } = useGuest();
  const name = L(venue.name);
  const accent = venue.theme?.accent ?? venue.brandColor ?? "#6E4BFF";
  const img = venue.theme?.bgImage;
  const initials = venue.name.en
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="g-cover-wrap">
      <div
        className="g-cover"
        style={{
          backgroundImage: img
            ? `linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.05) 45%, rgba(0,0,0,.25)), url("${img}")`
            : `radial-gradient(circle at 85% 15%, rgba(255,255,255,.28), transparent 40%), linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 55%, #000))`,
        }}
      >
        <div className="g-cover-bar">
          {table ? (
            <span className="g-cover-chip">
              🪑 {tr("table")} {table}
            </span>
          ) : (
            <span />
          )}
          <button className="g-cover-chip g-cover-lang" lang={lang === "en" ? "ar" : "en"} onClick={toggleLang}>
            {tr("lang")}
          </button>
        </div>
        {!img && (
          <span className="g-cover-art" aria-hidden="true">
            🎲 🍽️ 🎉
          </span>
        )}
      </div>
      <div className="g-id">
        {venue.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="g-id-logo" src={venue.logoUrl} alt={name} />
        ) : (
          <span className="g-id-logo mono" style={{ background: accent }} aria-hidden="true">
            {initials}
          </span>
        )}
        <div className="g-id-txt">
          <h2>{name}</h2>
          <p>{[L(venue.area), L(venue.hours)].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}

/** Four round shortcuts under the cover. */
function QuickActions() {
  const { venue, lang, go, demo } = useGuest();
  const x = EXTRA[lang];
  const m = venue.modules;
  const svc = useService(demo);
  const items: { k: string; label: string; icon: React.ReactNode; on: () => void; act?: string; off?: boolean }[] = [];
  if (m.menu) items.push({ k: "menu", label: x.qMenu, icon: ICON.menu, on: () => go("menu") });
  if (m.drinks) items.push({ k: "drinks", label: x.qDrinks, icon: ICON.drinks, on: () => go("drinks") });
  if (svc.on) {
    items.push({ k: "server", label: x.qServer, icon: <span className="g-q-emoji">🙋</span>, on: () => svc.call("server"), act: "call", off: svc.cool.server });
    items.push({ k: "bill", label: x.qBill, icon: <span className="g-q-emoji">🧾</span>, on: () => svc.call("bill"), off: svc.cool.bill });
  } else {
    if (m.offers || m.events) items.push({ k: "offers", label: x.qOffers, icon: ICON.offers, on: () => go(m.events ? "events" : "offers") });
    if (m.feedback) items.push({ k: "feedback", label: x.feedback, icon: ICON.feedback, on: () => go("feedback") });
  }
  if (!items.length) return null;
  return (
    <>
      <div className="g-quick">
        {items.slice(0, 4).map((it) => (
          <button key={it.k} className={`g-q q-${it.k}`} data-act={it.act} data-q={it.k} onClick={it.on} disabled={it.off}>
            <span className="g-q-ring">{it.icon}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
      {svc.msg && (
        <p className={`g-service-msg${svc.msg.ok ? "" : " bad"}`} role="status">
          {svc.msg.text}
        </p>
      )}
    </>
  );
}

/** Offers and today's events as swipeable cards. */
function Tonight() {
  const { venue, lang, L, go, log } = useGuest();
  const x = EXTRA[lang];
  const m = venue.modules;
  const offers = m.offers ? [...venue.offers].sort((a, b) => Number(b.featured) - Number(a.featured)) : [];
  const events = m.events ? venue.events.filter((ev) => nextOccurrence(ev)?.add === 0) : [];
  if (!offers.length && !events.length) return null;
  return (
    <Scroller title={x.tonight} more={() => go(m.events ? "events" : "offers")}>
      {events.map((ev) => (
        <button key={ev.id} className="g-tcard" style={{ background: "var(--violet)" }} onClick={() => go("events")}>
          <small>
            {x.eventToday} · {ev.start}–{ev.end}
          </small>
          <b>{L(ev.title)}</b>
          {L(ev.desc) && <span>{L(ev.desc)}</span>}
        </button>
      ))}
      {offers.map((o) => (
        <button
          key={o.id}
          className="g-tcard"
          style={{ background: `var(--${o.color})` }}
          onClick={() => {
            log("offer_open", { item: o.title.en });
            go("offers");
          }}
        >
          <small>{x.offerTag}</small>
          <b>{L(o.title)}</b>
          {L(o.desc) && <span>{L(o.desc)}</span>}
        </button>
      ))}
    </Scroller>
  );
}

export function Home() {
  const { venue, tr, lang, go } = useGuest();
  const x = EXTRA[lang];
  const m = venue.modules;
  const games = (k: "kids" | "group" | "date" | "drink") => anyGameOn(venue.games as Record<string, boolean>, k);
  const top = venueGames(venue).filter((g) => g.group !== "drink").slice(0, 8);

  const explore: [string, string, string][] = [];
  if (m.kids && games("kids")) explore.push(["kids", x.kidsGames, tr("kidsS")]);
  if (m.group && games("group")) explore.push(["group", x.adults, x.adultsS]);
  if (m.date && games("date")) explore.push(["date", tr("dateTitle"), tr("dateS")]);
  if (m.drink && games("drink")) explore.push(["drink", x.drink, x.drinkS.replace("{age}", String(drinkAge(venue.games)))]);

  return (
    <>
      <Cover />
      <QuickActions />
      <WifiStrip />
      <Tonight />
      {top.length > 0 && (
        <Scroller title={x.playNow} more={() => go("play")}>
          {top.map((g) => (
            <GameCard key={g.key} g={g} />
          ))}
        </Scroller>
      )}
      {m.versus && <ChallengeBanner />}
      {explore.length > 0 && (
        <section className="g-scroll-sec">
          <h3 className="g-sec">{x.explore}</h3>
          <div className="g-explore">
            {explore.map(([k, t, sub]) => (
              <button key={k} className={`g-ex t-${k}`} data-tile={k} onClick={() => go(k)}>
                {ICON[k]}
                <span>
                  <b>{t}</b>
                  <small>{sub}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ---------- Menu & drinks ---------- */

const fmtPrice = (p: number) => (Number.isInteger(p) ? String(p) : p.toFixed(2));

function PdfMenu({ kind, url }: { kind: "food" | "drinks"; url: string }) {
  const { tr, lang, log } = useGuest();
  return (
    <>
      <div>
        <h2 className="g-h">{tr(kind === "food" ? "menu" : "drinks")}</h2>
      </div>
      <a
        className="g-btn"
        style={{ textAlign: "center", textDecoration: "none" }}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => log("pdf_open", { item: kind })}
      >
        {EXTRA[lang].openPdf}
      </a>
      <p className="g-sub" style={{ textAlign: "center" }}>
        {EXTRA[lang].pdfHint}
      </p>
      <iframe className="pdf-frame" src={`${url}#view=FitH`} title={EXTRA[lang].pdfMenu} loading="lazy" />
    </>
  );
}

/** Menu tab: food and drinks with a toggle between them. */
export function Menu({ kind: start }: { kind: "food" | "drinks" }) {
  const { venue, lang, log } = useGuest();
  const x = EXTRA[lang];
  const both = venue.modules.menu && venue.modules.drinks;
  const [kind, setKind] = useState<"food" | "drinks">(venue.modules.menu ? start : "drinks");
  const pdf = venue.menuMode === "pdf" ? (kind === "food" ? venue.menuPdf : venue.drinksPdf || venue.menuPdf) : "";
  return (
    <>
      {both && (
        <div className="g-seg" role="group">
          {(["food", "drinks"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => {
                setKind(k);
                log("view", { module: k === "food" ? "menu" : "drinks" });
              }}
            >
              {k === "food" ? x.food : x.qDrinks}
            </button>
          ))}
        </div>
      )}
      {pdf ? <PdfMenu key={kind} kind={kind} url={pdf} /> : <ItemMenu key={kind} kind={kind} />}
    </>
  );
}

function ItemMenu({ kind }: { kind: "food" | "drinks" }) {
  const { venue, tr, L, lang, log } = useGuest();
  const cats = venue.menu.filter((c) => c.kind === kind && c.items.length > 0);
  const [i, setI] = useState(0);
  const c = cats[Math.min(i, cats.length - 1)];
  const note = L(venue.allergyNote) || tr("allergyNote");

  return (
    <>
      <div>
        <h2 className="g-h">{tr(kind === "food" ? "menu" : "drinks")}</h2>
      </div>
      {!c ? (
        <p className="g-note">{EXTRA[lang].empty}</p>
      ) : (
        <>
          <div className="g-tabs" role="group">
            {cats.map((x, n) => (
              <button
                key={x.id}
                aria-pressed={x.id === c.id}
                onClick={() => {
                  setI(n);
                  log("menu_cat", { module: kind, item: x.name.en });
                }}
              >
                {L(x.name)}
              </button>
            ))}
          </div>
          <div className="g-items">
            {c.items.map((it) => (
              <article key={it.id} className={`g-item${it.soldOut ? " off" : ""}`}>
                <div className="g-item-top">
                  <b>{L(it.name)}</b>
                  <span className="g-price">
                    {tr("aed")} {fmtPrice(it.price)}
                  </span>
                </div>
                {L(it.desc) && <p>{L(it.desc)}</p>}
                <div className="g-chips">
                  {it.soldOut && <span className="chip out">{tr("sold")}</span>}
                  {it.diet.map((x) => (
                    <span key={x} className="chip diet">
                      {L(DIET[x]) || x}
                    </span>
                  ))}
                  {it.allergens.map((x) => (
                    <span key={x} className="chip">
                      {L(ALLERGEN[x]) || x}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <p className="g-note">{note}</p>
    </>
  );
}

/* ---------- Events & offers ---------- */

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Next date an event happens (weekly or one-off), or null if it's over. */
function nextOccurrence(ev: VenueEvent): { date: Date; add: number } | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let add: number;
  if (ev.weekday != null) {
    add = (ev.weekday - now.getDay() + 7) % 7;
    if (add === 0 && nowMin > toMin(ev.end)) add = 7;
  } else if (ev.date) {
    const [y, mo, d] = ev.date.split("-").map(Number);
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    add = Math.round((new Date(y, mo - 1, d).getTime() - start.getTime()) / 86400000);
    if (add < 0 || (add === 0 && nowMin > toMin(ev.end))) return null;
  } else return null;
  const date = new Date(now);
  date.setDate(now.getDate() + add);
  return { date, add };
}

const ymd = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

export function OfferCards() {
  const { venue, tr, L, locale, redeem } = useGuest();
  return (
    <>
      {venue.offers.map((o: Offer) => (
        <article key={o.id} className="g-card" style={{ borderTop: `6px solid var(--${o.color})` }}>
          <span className="g-when" style={{ color: `var(--${o.color})` }}>
            {tr("offers")}
          </span>
          <h3>{L(o.title)}</h3>
          {L(o.desc) && <p>{L(o.desc)}</p>}
          <p className="terms">
            {L(o.terms) && (
              <>
                <b>{tr("terms")}:</b> {L(o.terms)}{" "}
              </>
            )}
            {o.endsOn &&
              `${tr("validUntil")} ${new Date(o.endsOn + "T12:00:00").toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}.`}
          </p>
          <button className="g-btn" onClick={() => redeem(o)}>
            {tr("showServer")}
          </button>
        </article>
      ))}
    </>
  );
}

export function Events() {
  const { venue, tr, L, lang, locale, log } = useGuest();
  const list = venue.events
    .map((ev) => ({ ev, occ: nextOccurrence(ev) }))
    .filter((x): x is { ev: VenueEvent; occ: { date: Date; add: number } } => x.occ !== null)
    .sort((a, b) => a.occ.add - b.occ.add || toMin(a.ev.start) - toMin(b.ev.start));

  const calLink = (ev: VenueEvent, d: Date) => {
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: `${L(ev.title)} · ${L(venue.name)}`,
      dates: `${ymd(d)}T${ev.start.replace(":", "")}00/${ymd(d)}T${ev.end.replace(":", "")}00`,
      ctz: "Asia/Dubai",
      details: L(ev.desc),
      location: L(venue.area),
    });
    return `https://calendar.google.com/calendar/render?${p}`;
  };

  return (
    <>
      <div>
        <h2 className="g-h">{tr("events")}</h2>
        <p className="g-sub">{tr("eventsS")}</p>
      </div>
      <div className="g-list">
        {list.length === 0 && <p className="g-note">{EXTRA[lang].empty}</p>}
        {list.map(({ ev, occ: { date, add } }) => (
          <article key={ev.id} className="g-card">
            <span className="g-when">
              {add === 0 ? `${tr("today")} · ` : add === 1 ? `${tr("tomorrow")} · ` : ""}
              {date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })} · {ev.start}–{ev.end}
            </span>
            <h3>{L(ev.title)}</h3>
            {L(ev.desc) && <p>{L(ev.desc)}</p>}
            {ev.weekday != null && (
              <span className="g-sub" style={{ fontSize: ".78rem" }}>
                {tr("every")} {DAYS[lang][ev.weekday]}
              </span>
            )}
            <a
              className="g-link"
              href={calLink(ev, date)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => log("calendar", { item: ev.title.en })}
            >
              + {tr("addCal")}
            </a>
          </article>
        ))}
      </div>
      {venue.modules.offers && (
        <div className="g-list">
          <OfferCards />
        </div>
      )}
    </>
  );
}

export function Offers() {
  const { tr, venue, lang } = useGuest();
  return (
    <>
      <div>
        <h2 className="g-h">{tr("offers")}</h2>
      </div>
      <div className="g-list">
        {venue.offers.length === 0 ? <p className="g-note">{EXTRA[lang].empty}</p> : <OfferCards />}
      </div>
    </>
  );
}

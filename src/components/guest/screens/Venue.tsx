"use client";
import { useEffect, useState } from "react";
import { ALLERGEN, DAYS, DIET, type TKey } from "@/lib/content";
import { anyGameOn, drinkAge } from "@/lib/games";
import type { Offer, VenueEvent } from "@/lib/types";
import { EXTRA, useGuest } from "../context";
import { ServiceBar } from "./Service";
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
      <span className="g-wifi-ico" aria-hidden="true">
        📶
      </span>
      <span className="g-wifi-txt">
        <b>{venue.wifi.ssid}</b>
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

/** Today's offers, fading from one to the next every few seconds. */
function OfferCarousel({ offers }: { offers: Offer[] }) {
  const { tr, L, go, log } = useGuest();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (offers.length < 2 || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % offers.length), 4500);
    return () => clearInterval(t);
  }, [offers.length, paused]);
  const o = offers[i % offers.length];
  return (
    <div className="g-carousel" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <button
        key={o.id}
        className="g-banner fade-in"
        style={{ background: `var(--${o.color})` }}
        onClick={() => {
          log("offer_open", { item: o.title.en });
          go("offers");
        }}
      >
        <small>{tr("offerNow")}</small>
        <b>{L(o.title)}</b>
        {L(o.desc) && <span style={{ fontSize: ".85rem", opacity: 0.95 }}>{L(o.desc)}</span>}
      </button>
      {offers.length > 1 && (
        <div className="g-dots" role="tablist" aria-label={tr("offers")}>
          {offers.map((x, n) => (
            <button key={x.id} role="tab" aria-selected={n === i % offers.length} aria-label={L(x.title)} onClick={() => setI(n)} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Big venue logo (or a monogram) above the welcome line. */
function VenueHero() {
  const { venue, L, lang } = useGuest();
  const x = EXTRA[lang];
  const name = L(venue.name);
  const initials = venue.name.en
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="g-hero">
      {venue.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="g-hero-logo" src={venue.logoUrl} alt={name} />
      ) : (
        <span className="g-hero-mono" style={{ background: venue.brandColor }} aria-hidden="true">
          {initials}
        </span>
      )}
      <h2>{x.welcomeTo.replace("{name}", name)}</h2>
      <p>{x.whatToDo}</p>
    </div>
  );
}

export function Home() {
  const { venue, tr, lang, go, demo } = useGuest();
  const x = EXTRA[lang];
  const m = venue.modules;
  const games = (k: "kids" | "group" | "date" | "drink") => anyGameOn(venue.games as Record<string, boolean>, k);
  const offers = m.offers ? [...venue.offers].sort((a, b) => Number(b.featured) - Number(a.featured)) : [];

  // Feedback always sits last (bottom right when the grid is full).
  const tiles: [string, string][] = [];
  if (m.menu) tiles.push(["menu", "t-menu"]);
  if (m.drinks) tiles.push(["drinks", "t-drinks"]);
  if (m.kids && games("kids")) tiles.push(["kids", "t-kids"]);
  if (m.group && games("group")) tiles.push(["group", "t-group"]);
  if (m.date && games("date")) tiles.push(["date", "t-date"]);
  if (m.events) tiles.push(["events", "t-events"]);
  else if (m.offers) tiles.push(["offers", "t-events"]);
  if (m.drink && games("drink")) tiles.push(["drink", "t-drink"]);
  if (m.feedback) tiles.push(["feedback", "t-feedback"]);

  const label = (k: string): [string, string] => {
    if (k === "group") return [x.adults, x.adultsS];
    if (k === "drink") return [x.drink, x.drinkS.replace("{age}", String(drinkAge(venue.games)))];
    if (k === "feedback") return [x.feedback, x.feedbackS];
    if (k === "offers") return [tr("offers"), x.offersS];
    return [tr(k as TKey), tr(`${k}S` as TKey)];
  };

  return (
    <>
      <VenueHero />
      <WifiStrip />
      {offers.length > 0 && <OfferCarousel offers={offers} />}
      <ServiceBar demo={demo} />
      <div className="g-grid">
        {tiles.map(([k, cls]) => {
          const [t, sub] = label(k);
          return (
            <button key={k} className={`g-tile ${cls}`} onClick={() => go(k)}>
              {ICON[k]}
              <div>
                <b>{t}</b>
                <br />
                <span>{sub}</span>
              </div>
            </button>
          );
        })}
      </div>
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

export function Menu({ kind }: { kind: "food" | "drinks" }) {
  const { venue } = useGuest();
  const pdf = venue.menuMode === "pdf" ? (kind === "food" ? venue.menuPdf : venue.drinksPdf || venue.menuPdf) : "";
  return pdf ? <PdfMenu kind={kind} url={pdf} /> : <ItemMenu kind={kind} />;
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

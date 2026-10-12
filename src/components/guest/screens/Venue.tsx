"use client";
import { useState } from "react";
import { ALLERGEN, DAYS, DIET, type TKey } from "@/lib/content";
import { anyGameOn } from "@/lib/games";
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

export function Home() {
  const { venue, tr, L, lang, go, log, demo } = useGuest();
  const m = venue.modules;
  const shown = (k: keyof typeof m) =>
    m[k] && (k === "kids" || k === "group" || k === "date" ? anyGameOn(venue.games, k) : true);
  const featured = m.offers ? venue.offers.find((o) => o.featured) ?? venue.offers[0] : undefined;
  const tiles: [string, string][] = (
    [
      ["menu", "t-menu"],
      ["drinks", "t-drinks"],
      ["kids", "t-kids"],
      ["group", "t-group"],
      ["date", "t-date"],
      ["events", "t-events"],
    ] as [keyof typeof m, string][]
  ).filter(([k]) => shown(k));
  if (m.offers && !m.events) tiles.push(["offers", "t-events"]);
  if (m.feedback) tiles.push(["feedback", "t-feedback"]);

  return (
    <>
      <div className="g-hello">
        <h2>{tr("hello")}</h2>
        <p>{tr("helloSub")}</p>
      </div>
      {featured && (
        <button
          className="g-banner"
          onClick={() => {
            log("offer_open", { item: featured.title.en });
            go("offers");
          }} style={{ background: `var(--${featured.color})` }}>
          <small>{tr("offerNow")}</small>
          <b>{L(featured.title)}</b>
          <span style={{ fontSize: ".85rem", opacity: 0.95 }}>{L(featured.desc)}</span>
        </button>
      )}
      <ServiceBar demo={demo} />
      <div className="g-grid">
        {tiles.map(([k, cls]) => (
          <button key={k} className={`g-tile ${cls}`} onClick={() => go(k)}>
            {ICON[k]}
            <div>
              <b>{k === "feedback" ? EXTRA[lang].feedback : tr(k as TKey)}</b>
              <br />
              <span>{k === "offers" ? EXTRA[lang].offersS : k === "feedback" ? EXTRA[lang].feedbackS : tr(`${k}S` as TKey)}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="g-info" aria-label={tr("info")}>
        {venue.wifi.ssid && (
          <div className="g-info-row">
            <span>{tr("wifi")}</span>
            <b>{venue.wifi.ssid}</b>
          </div>
        )}
        {venue.wifi.pass && (
          <div className="g-info-row">
            <span>{tr("password")}</span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <b style={{ fontVariantNumeric: "tabular-nums" }}>{venue.wifi.pass}</b>
              <CopyButton text={venue.wifi.pass} />
            </span>
          </div>
        )}
        {L(venue.hours) && (
          <div className="g-info-row">
            <span>{tr("hours")}</span>
            <b>{L(venue.hours)}</b>
          </div>
        )}
        {venue.mapsUrl && (
          <div className="g-info-row">
            <span>{tr("directions")}</span>
            <a className="g-link" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => log("directions")}>
              {tr("openMaps")}
            </a>
          </div>
        )}
        {L(venue.access) && (
          <div className="g-info-row" style={{ alignItems: "flex-start" }}>
            <span>{tr("access")}</span>
            <span style={{ textAlign: "end", maxWidth: "65%" }}>{L(venue.access)}</span>
          </div>
        )}
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

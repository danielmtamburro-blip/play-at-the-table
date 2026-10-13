"use client";
import { Glyph, gameGlyph } from "../glyphs";
import BrandCover from "../BrandCover";
import { useEffect, useState } from "react";
import { ALLERGEN, DAYS, DIET } from "@/lib/content";
import { anyGameOn, drinkAge, gameOn } from "@/lib/games";
import type { Lang, MenuItem, Offer, VenueEvent } from "@/lib/types";
import { EXTRA, useGuest } from "../context";
import { useService } from "./Service";
import { venueGames } from "./Play";
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

const HELLO: Record<Lang, { morning: string; afternoon: string; evening: string; sub: string }> = {
  en: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", sub: "Menus, offers and games" },
  ar: { morning: "صباح الخير", afternoon: "مساء الخير", evening: "مساء الخير", sub: "القوائم والعروض والألعاب" },
};

/** A time-of-day greeting in the empty left side of the cover, balancing the logo on the right. */
function CoverHello() {
  const { lang } = useGuest();
  // Worked out on the phone after loading, so the guest's own clock decides (and the server render stays the same).
  const [part, setPart] = useState<"morning" | "afternoon" | "evening" | null>(null);
  useEffect(() => {
    const h = new Date().getHours();
    setPart(h >= 5 && h < 12 ? "morning" : h >= 12 && h < 17 ? "afternoon" : "evening");
  }, []);
  const t = HELLO[lang];
  return (
    <div className={`g-cover-hello${part ? " on" : ""}`}>
      <b>{t[part ?? "evening"]}</b>
      <span>{t.sub}</span>
    </div>
  );
}

/** Cover with the table and language on it, and the logo card overlapping. Our ring artwork in the venue's colours. */
function Cover() {
  const { venue, table, tr, L, lang, toggleLang } = useGuest();
  const name = L(venue.name);
  const accent = venue.theme?.accent ?? venue.brandColor ?? "#6E4BFF";
  // Only the showroom venue has a custom cover picture; every venue gets the Play at Your Table cover.
  const img = venue.coverUrl;
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
        style={img ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.3), rgba(0,0,0,0) 40%, rgba(0,0,0,.15)), url("${img}")` } : undefined}
      >
        {!img && <BrandCover accent={venue.theme ? accent : undefined} mode={venue.theme ? venue.theme.cover : "brand"} />}
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
        {!img && <CoverHello />}
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
  // The menus are why most guests scan, so they get big cards of their own.
  const menus: { k: string; e: string; t: string; s: string }[] = [];
  if (m.menu) menus.push({ k: "menu", e: "cutlery", t: x.foodMenu, s: x.foodMenuS });
  if (m.drinks) menus.push({ k: "drinks", e: "glass", t: x.drinksMenu, s: x.drinksMenuS });
  const items: { k: string; label: string; icon: React.ReactNode; on: () => void; act?: string; off?: boolean }[] = [];
  if (svc.on) {
    items.push({ k: "server", label: x.callServer, icon: <Glyph k="bell" />, on: () => svc.call("server"), act: "call", off: svc.cool.server });
    items.push({ k: "bill", label: x.billPlease, icon: <Glyph k="receipt" />, on: () => svc.call("bill"), off: svc.cool.bill });
  }
  if (m.offers || m.events) items.push({ k: "offers", label: x.qOffers, icon: <Glyph k="tag" />, on: () => go(m.events ? "events" : "offers") });
  if (m.feedback && items.length < 4) items.push({ k: "feedback", label: x.feedback, icon: <Glyph k="chat" />, on: () => go("feedback") });
  return (
    <>
      {menus.length > 0 && (
        <div className={`g-menus${menus.length === 1 ? " one" : ""}`}>
          {menus.map((mn) => (
            <button key={mn.k} className={`g-menu-card mc-${mn.k}`} data-q={mn.k} onClick={() => go(mn.k)}>
              <span className="glass-ico lg" aria-hidden="true">
                <Glyph k={mn.e} />
              </span>
              <span className="g-menu-txt">
                <b>{mn.t}</b>
                <small>{mn.s}</small>
              </span>
              <span className="g-menu-go" aria-hidden="true">
                ›
              </span>
            </button>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <div className="g-quick">
          {items.slice(0, 4).map((it) => (
            <button key={it.k} className={`g-q q-${it.k}`} data-act={it.act} data-q={it.k} onClick={it.on} disabled={it.off}>
              <span className="glass-ico" aria-hidden="true">
                {it.icon}
              </span>
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      )}
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
        <button key={ev.id} data-tcard="event" className="g-tcard" style={{ background: "linear-gradient(135deg, #7A3D8C, #3B2360)" }} onClick={() => go("events")}>
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
          data-tcard="offer"
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
  const mix = useMix();

  const explore: [string, string, string][] = [];
  if (m.kids && games("kids")) explore.push(["kids", x.kidsGames, tr("kidsS")]);
  if (m.group && games("group")) explore.push(["group", x.adults, x.adultsS]);
  if (m.date && games("date")) explore.push(["date", tr("dateTitle"), tr("dateS")]);
  if (m.celebrate) explore.push(["celebrate", x.celebrate, x.celebrateS]);
  if (gameOn(venue.games as Record<string, boolean>, "darts") || gameOn(venue.games as Record<string, boolean>, "pool"))
    explore.push(["bar", x.barGames, x.barGamesS]);
  if (m.drink && games("drink")) explore.push(["drink", x.drink, x.drinkS.replace("{age}", String(drinkAge(venue.games)))]);
  if (m.feedback) explore.push(["feedback", x.feedback, x.feedbackS]);
  if (m.events) explore.push(["events", tr("events"), tr("eventsS")]);
  if (m.offers) explore.push(["offers", tr("offers"), x.offersS]);
  if (m.nearby && venue.nearby.length) explore.push(["nearby", x.nearby, x.nearbyS]);
  // Challenge another table always sits last, as the wide tile.
  if (m.versus) explore.push(["versus", x.versus, x.versusS]);
  const others = explore.filter(([k]) => k !== "versus").length;

  return (
    <>
      <Cover />
      <QuickActions />
      <WifiStrip />
      <Tonight />
      {explore.length > 0 && (
        <section className="g-scroll-sec">
          <h3 className="g-sec">{x.explore}</h3>
          <div className="g-explore">
            {explore.map(([k, t, sub], n) => (
              <button
                key={k}
                // Challenge spans the bottom row; another tile spans too if it would sit alone.
                className={`g-ex t-${k}${k === "versus" || (n === others - 1 && others % 2) ? " span" : ""}`}
                data-tile={k}
                onClick={() => go(k)}
              >
                <span className="glass-ico" aria-hidden="true">
                  {ICON[k]}
                </span>
                <span>
                  <b>{t}</b>
                  <small>{sub}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {mix.length > 0 && (
        <Scroller title={x.forEveryone} more={() => go("play")}>
          {mix.map((c) =>
            c.href ? (
              <a key={c.k} className={`g-gcard mx-card mx-${c.tone}`} href={c.href} target="_blank" rel="noopener noreferrer" data-card={c.k}>
                <MixIcon c={c} />
                <b>{c.title}</b>
                <small>{c.tag}</small>
              </a>
            ) : (
              <button key={c.k} className={`g-gcard mx-card mx-${c.tone}`} onClick={() => go(c.k)} data-card={c.k}>
                <MixIcon c={c} />
                <b>{c.title}</b>
                <small>{c.tag}</small>
              </button>
            ),
          )}
        </Scroller>
      )}
      <ContactCard />
    </>
  );
}

type MixCard = { k: string; title: string; tag: string; tone: string; emoji?: string; glyph?: string; href?: string };

function MixIcon({ c }: { c: MixCard }) {
  return c.emoji ? (
    <span className="g-gcard-ico" aria-hidden="true">
      {c.emoji}
    </span>
  ) : (
    <span className={`glass-ico mxi-${c.tone}`} aria-hidden="true">
      <Glyph k={c.glyph ?? "star"} />
    </span>
  );
}

/** One thing from each part of the app, so guests see everything on offer. */
function useMix(): MixCard[] {
  const { venue, lang, L } = useGuest();
  const x = EXTRA[lang];
  const m = venue.modules;
  const all = venueGames(venue);
  const on = (k: string) => all.some((g) => g.key === k);
  const first = (group: string, prefer: string[]) => prefer.map((k) => all.find((g) => g.key === k)).find(Boolean) ?? all.find((g) => g.group === group);
  const out: MixCard[] = [];
  const kid = first("kids", ["penalty", "racer", "keepy"]);
  if (kid) out.push({ k: kid.key, title: L(kid.title), tag: x.kidsTag, tone: "kids", glyph: gameGlyph(kid) });
  const adult = first("group", ["trivia", "wordguess", "charades"]);
  if (adult) out.push({ k: adult.key, title: L(adult.title), tag: x.adultsTag, tone: "group", glyph: gameGlyph(adult) });
  if (m.celebrate) out.push({ k: "celebrate", title: x.mixCelebrate, tag: x.celebrate, tone: "celebrate", glyph: "party" });
  const date = first("date", ["deck:first"]);
  if (date) out.push({ k: date.key, title: L(date.title), tag: x.dateTag, tone: "date", glyph: "heart" });
  if (on("darts")) out.push({ k: "darts", title: x.mixDarts, tag: x.barGames, tone: "bar", glyph: "target" });
  if (on("split")) out.push({ k: "split", title: x.mixSplit, tag: x.mixBill, tone: "bill", glyph: "calc" });
  if (m.drink && on("pour")) out.push({ k: "pour", title: x.mixPour, tag: x.drinkTag, tone: "drink", glyph: "glass" });
  if (m.nearby && venue.nearby.length) out.push({ k: "nearby", title: x.nearby, tag: x.mixLocal, tone: "nearby", glyph: "pin" });
  if (venue.reviewUrl) out.push({ k: "review", title: x.mixReview, tag: x.feedback, tone: "review", glyph: "star", href: venue.reviewUrl });
  return out;
}

/** Contact us: address, hours, call, WhatsApp, email, Instagram and a review link. */
function ContactCard() {
  const { venue, lang, L, log } = useGuest();
  const x = EXTRA[lang];
  const demo = venue.id === "sample";
  const [note, setNote] = useState("");
  const address = L(venue.address) || L(venue.area);
  const maps = venue.mapsUrl || (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name.en} ${address}`)}` : "");
  const actions: { k: string; label: string; href: string; glyph: string }[] = [];
  if (venue.phone) actions.push({ k: "call", label: x.call, href: `tel:${venue.phone.replace(/[^\d+]/g, "")}`, glyph: "phone" });
  if (venue.whatsapp) actions.push({ k: "wa", label: "WhatsApp", href: `https://wa.me/${venue.whatsapp}`, glyph: "chat" });
  if (venue.email) actions.push({ k: "email", label: x.email, href: `mailto:${venue.email}`, glyph: "receipt" });
  if (maps) actions.push({ k: "map", label: x.directions, href: maps, glyph: "pin" });
  if (!address && !actions.length && !venue.reviewUrl) return null;
  // The showroom venue isn't real: its buttons explain instead of dialling.
  const open = (k: string) => (e: React.MouseEvent) => {
    log("view", { module: "contact", item: k });
    if (demo) (e.preventDefault(), setNote(x.demoContact));
  };
  return (
    <section className="ct" aria-labelledby="ct-h">
      <h3 className="g-sec" id="ct-h">
        {x.contact}
      </h3>
      <div className="ct-card">
        <div className="ct-row">
          <span className="glass-ico sm ct-ico" aria-hidden="true">
            <Glyph k="pin" />
          </span>
          <div>
            <b>{L(venue.name)}</b>
            {address && <span>{address}</span>}
          </div>
        </div>
        {L(venue.hours) && (
          <div className="ct-row">
            <span className="glass-ico sm ct-ico" aria-hidden="true">
              <Glyph k="clock" />
            </span>
            <div>
              <b>{x.hours}</b>
              <span>{L(venue.hours)}</span>
            </div>
          </div>
        )}
        {actions.length > 0 && (
          <div className="ct-actions">
            {actions.map((a) => (
              <a key={a.k} className={`ct-btn ct-${a.k}`} href={a.href} target={a.k === "map" || a.k === "wa" ? "_blank" : undefined} rel="noopener noreferrer" onClick={open(a.k)}>
                <Glyph k={a.glyph} />
                {a.label}
              </a>
            ))}
          </div>
        )}
        {venue.instagram && (
          <a className="ct-insta" href={`https://instagram.com/${venue.instagram}`} target="_blank" rel="noopener noreferrer" onClick={open("instagram")}>
            @{venue.instagram}
          </a>
        )}
        {venue.reviewUrl && (
          <a className="ct-review" href={venue.reviewUrl} target="_blank" rel="noopener noreferrer" onClick={open("review")}>
            <span aria-hidden="true">★★★★★</span>
            {x.review}
          </a>
        )}
        {note && (
          <p className="g-service-msg" role="status">
            {note}
          </p>
        )}
      </div>
    </section>
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
              data-act={`menu-${k}`}
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

/** Dietary filters. Free-from filters use the venue's allergen labels, so guests should still check with staff. */
const DIET_FILTERS: { k: string; e: string; en: string; ar: string; ok: (it: MenuItem) => boolean }[] = [
  { k: "v", e: "🥦", en: "Vegetarian", ar: "نباتي", ok: (it) => it.diet.includes("V") || it.diet.includes("VG") },
  { k: "vg", e: "🌱", en: "Vegan", ar: "نباتي صرف", ok: (it) => it.diet.includes("VG") },
  { k: "gf", e: "🌾", en: "Gluten-free", ar: "بدون غلوتين", ok: (it) => it.diet.includes("GF") || !it.allergens.includes("gluten") },
  { k: "df", e: "🥛", en: "Dairy-free", ar: "بدون ألبان", ok: (it) => !it.allergens.includes("dairy") },
  { k: "nf", e: "🥜", en: "Nut-free", ar: "بدون مكسرات", ok: (it) => !it.allergens.includes("nuts") },
  { k: "ef", e: "🥚", en: "Egg-free", ar: "بدون بيض", ok: (it) => !it.allergens.includes("egg") },
  { k: "sf", e: "🦐", en: "No seafood", ar: "بدون مأكولات بحرية", ok: (it) => !it.allergens.includes("fish") && !it.allergens.includes("shellfish") },
  { k: "ses", e: "⚪", en: "Sesame-free", ar: "بدون سمسم", ok: (it) => !it.allergens.includes("sesame") },
];
const DF_UI = {
  en: { btn: "Dietary needs", clear: "Clear", match: "{n} dishes match", one: "1 dish matches", none: "Nothing matches all of these. Ask your server: the kitchen may be able to help.", note: "Based on the venue's allergen information. Always tell your server about allergies." },
  ar: { btn: "احتياجات غذائية", clear: "مسح", match: "{n} أطباق مطابقة", one: "طبق واحد مطابق", none: "لا شيء يطابق كل هذه الخيارات. اسأل النادل: قد يستطيع المطبخ المساعدة.", note: "بناءً على معلومات مسببات الحساسية من المطعم. أخبر النادل دائماً عن الحساسية." },
};

function ItemCard({ it }: { it: MenuItem }) {
  const { tr, L } = useGuest();
  return (
    <article className={`g-item${it.soldOut ? " off" : ""}`}>
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
  );
}

function ItemMenu({ kind }: { kind: "food" | "drinks" }) {
  const { venue, tr, L, lang, log } = useGuest();
  const cats = venue.menu.filter((c) => c.kind === kind && c.items.length > 0);
  const [i, setI] = useState(0);
  const c = cats[Math.min(i, cats.length - 1)];
  const note = L(venue.allergyNote) || tr("allergyNote");
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const du = DF_UI[lang];
  const filters = DIET_FILTERS.filter((f) => picked.includes(f.k));
  const matches = filters.length
    ? cats.map((cat) => ({ cat, items: cat.items.filter((it) => filters.every((f) => f.ok(it))) })).filter((g) => g.items.length)
    : [];
  const count = matches.reduce((a, g) => a + g.items.length, 0);

  return (
    <>
      <div>
        <h2 className="g-h">{tr(kind === "food" ? "menu" : "drinks")}</h2>
      </div>
      {c && (
        <div className="df">
          <button className={`df-toggle${open || picked.length ? " on" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} data-act="diet">
            <span className="glass-ico sm" aria-hidden="true">
              <Glyph k="diet" />
            </span>
            {du.btn}
            {picked.length > 0 && <em>{picked.length}</em>}
            <span aria-hidden="true">{open ? "▴" : "▾"}</span>
          </button>
          {open && (
            <div className="df-chips" role="group" aria-label={du.btn}>
              {DIET_FILTERS.map((f) => (
                <button
                  key={f.k}
                  aria-pressed={picked.includes(f.k)}
                  data-diet={f.k}
                  onClick={() => {
                    setPicked((p) => (p.includes(f.k) ? p.filter((x) => x !== f.k) : [...p, f.k]));
                    log("menu_cat", { module: "diet", item: f.en });
                  }}
                >
                  {lang === "ar" ? f.ar : f.en}
                </button>
              ))}
              {picked.length > 0 && (
                <button className="df-clear" onClick={() => setPicked([])}>
                  {du.clear}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {!c ? (
        <p className="g-note">{EXTRA[lang].empty}</p>
      ) : filters.length ? (
        <>
          <p className="df-count">{count === 1 ? du.one : count ? du.match.replace("{n}", String(count)) : du.none}</p>
          {matches.map(({ cat, items }) => (
            <section key={cat.id} className="g-band">
              <h3 className="g-band-h">{L(cat.name)}</h3>
              <div className="g-items">
                {items.map((it) => (
                  <ItemCard key={it.id} it={it} />
                ))}
              </div>
            </section>
          ))}
          <p className="g-note">{du.note}</p>
        </>
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
              <ItemCard key={it.id} it={it} />
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
  const { venue, tr, L, locale } = useGuest();
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

/* ---------- Things to do nearby ---------- */

const NEARBY_GLYPH: Record<string, string> = {
  sight: "landmark", beach: "wave", park: "tree", family: "ferris", shopping: "bag", culture: "mask", food: "cup", nightlife: "moon", sport: "flag",
};
const NEARBY_LABEL: Record<string, Record<"en" | "ar", string>> = {
  sight: { en: "Sights", ar: "معالم" }, beach: { en: "Beaches", ar: "شواطئ" }, park: { en: "Parks", ar: "حدائق" }, family: { en: "Family", ar: "للعائلة" },
  shopping: { en: "Shopping", ar: "تسوّق" }, culture: { en: "Culture", ar: "ثقافة" }, food: { en: "Treats", ar: "حلويات ومقاهٍ" },
  nightlife: { en: "Nightlife", ar: "سهر" }, sport: { en: "Sport", ar: "رياضة" },
};

export function Nearby() {
  const { venue, lang, L, log } = useGuest();
  const x = EXTRA[lang];
  const [cat, setCat] = useState<string>("all");
  const cats = [...new Set(venue.nearby.map((n) => n.category))];
  const list = venue.nearby.filter((n) => cat === "all" || n.category === cat);
  const maps = (n: (typeof venue.nearby)[number]) =>
    n.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${n.name.en} ${venue.area.en}`)}`;
  return (
    <>
      <div>
        <h2 className="g-h">{x.nearby}</h2>
        <p className="g-sub">{x.nearbySub}</p>
      </div>
      {cats.length > 1 && (
        <div className="g-tabs g-chipbar" role="group">
          <button aria-pressed={cat === "all"} onClick={() => setCat("all")}>
            {x.all}
          </button>
          {cats.map((c) => (
            <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>
              {NEARBY_LABEL[c]?.[lang] ?? c}
            </button>
          ))}
        </div>
      )}
      <div className="g-list">
        {list.length === 0 && <p className="g-note">{x.empty}</p>}
        {list.map((n) => (
          <article key={n.id} className="nb-card">
            <span className={`glass-ico lg nb-${n.category}`} aria-hidden="true">
              <Glyph k={NEARBY_GLYPH[n.category] ?? "pin"} />
            </span>
            <div className="nb-body">
              <div className="nb-top">
                <h3>{L(n.name)}</h3>
                {n.distance && <span className="nb-dist">{n.distance}</span>}
              </div>
              {L(n.desc) && <p>{L(n.desc)}</p>}
              <a className="g-link" href={maps(n)} target="_blank" rel="noopener noreferrer" onClick={() => log("view", { module: "nearby", item: n.name.en })}>
                {x.directions} ›
              </a>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

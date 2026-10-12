import { normaliseTheme } from "./theme";
import { MODULE_KEYS, moduleOn, type Modules, type Venue } from "./types";

/** Today's date in Dubai as YYYY-MM-DD. */
export function dubaiToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
}

type Row = Record<string, any>;
const loc = (r: Row, k: string) => ({ en: r[`${k}_en`] ?? "", ar: r[`${k}_ar`] ?? "" });
const bySort = (a: Row, b: Row) => (a.sort_order ?? 0) - (b.sort_order ?? 0);
const hhmm = (t: string) => String(t).slice(0, 5);

export function normaliseModules(raw: unknown): Modules {
  const m = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return Object.fromEntries(MODULE_KEYS.map((k) => [k, moduleOn(m, k)])) as Modules;
}

/** Turn a venues row (with menu_categories, events, offers) into what the guest page needs. */
export function rowToVenue(v: Row): Venue {
  const today = dubaiToday();
  return {
    id: v.id,
    slug: v.slug,
    name: loc(v, "name"),
    area: loc(v, "area"),
    hours: loc(v, "hours"),
    access: loc(v, "access"),
    phone: v.phone,
    mapsUrl: v.maps_url,
    wifi: { ssid: v.wifi_ssid, pass: v.wifi_pass },
    allergyNote: loc(v, "allergy_note"),
    brandColor: v.brand_color,
    theme: normaliseTheme(v.theme),
    logoUrl: v.logo_url ?? "",
    games: v.games && typeof v.games === "object" ? v.games : {},
    menuMode: v.menu_mode === "pdf" ? "pdf" : "items",
    menuPdf: v.menu_pdf_url ?? "",
    drinksPdf: v.drinks_pdf_url ?? "",
    modules: normaliseModules(v.modules),
    menu: (v.menu_categories as Row[]).sort(bySort).map((c) => ({
      id: c.id,
      kind: c.kind,
      name: loc(c, "name"),
      items: (c.menu_items as Row[])
        .filter((i) => !i.hidden)
        .sort(bySort)
        .map((i) => ({
          id: i.id,
          name: loc(i, "name"),
          desc: loc(i, "desc"),
          price: Number(i.price),
          diet: i.diet ?? [],
          allergens: i.allergens ?? [],
          soldOut: i.sold_out,
        })),
    })),
    events: (v.events as Row[])
      .filter((e) => e.published && (e.weekday != null || (e.event_date && e.event_date >= today)))
      .sort(bySort)
      .map((e) => ({
        id: e.id,
        title: loc(e, "title"),
        desc: loc(e, "desc"),
        weekday: e.weekday,
        date: e.event_date,
        start: hhmm(e.start_time),
        end: hhmm(e.end_time),
      })),
    offers: (v.offers as Row[])
      .filter((o) => o.published && (!o.starts_on || o.starts_on <= today) && (!o.ends_on || o.ends_on >= today))
      .sort(bySort)
      .map((o) => ({
        id: o.id,
        title: loc(o, "title"),
        desc: loc(o, "desc"),
        terms: loc(o, "terms"),
        color: o.color,
        endsOn: o.ends_on,
        featured: o.featured,
      })),
  };
}

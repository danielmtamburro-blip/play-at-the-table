export type Lang = "en" | "ar";
export type Loc = { en: string; ar: string };

export const MODULE_KEYS = ["menu", "drinks", "kids", "group", "date", "celebrate", "events", "offers", "nearby", "drink", "versus", "feedback", "service"] as const;
/** Sections that stay off until a venue switches them on. */
export const OFF_BY_DEFAULT: readonly string[] = ["service", "drink", "nearby"];
export const moduleOn = (raw: Record<string, unknown> | null | undefined, k: string) =>
  OFF_BY_DEFAULT.includes(k) ? raw?.[k] === true : raw?.[k] !== false;
export type ModuleKey = (typeof MODULE_KEYS)[number];
export type Modules = Record<ModuleKey, boolean>;

export const OFFER_COLORS = ["coral", "teal", "rose", "sun", "violet"] as const;
export type OfferColor = (typeof OFFER_COLORS)[number];

export type MenuItem = {
  id: string;
  name: Loc;
  desc: Loc;
  price: number;
  diet: string[];
  allergens: string[];
  soldOut: boolean;
};

export type MenuCategory = {
  id: string;
  kind: "food" | "drinks";
  name: Loc;
  items: MenuItem[];
};

export type VenueEvent = {
  id: string;
  title: Loc;
  desc: Loc;
  /** Weekly repeat, 0 = Sunday. */
  weekday: number | null;
  /** One-off date, YYYY-MM-DD. */
  date: string | null;
  start: string;
  end: string;
};

export type Offer = {
  id: string;
  title: Loc;
  desc: Loc;
  terms: Loc;
  color: string;
  /** YYYY-MM-DD or null for no end date. */
  endsOn: string | null;
  featured: boolean;
};

export const NEARBY_CATS = ["sight", "beach", "park", "family", "shopping", "culture", "food", "nightlife", "sport"] as const;
export type NearbyCat = (typeof NEARBY_CATS)[number];

/** A place to visit near the venue, suggested by the venue. */
export type NearbyPlace = { id: string; name: Loc; desc: Loc; category: NearbyCat; distance: string; mapsUrl: string };

/** Everything the guest page needs, already filtered to what is live today. */
export type Venue = {
  id: string;
  slug: string;
  name: Loc;
  area: Loc;
  hours: Loc;
  access: Loc;
  phone: string;
  mapsUrl: string;
  wifi: { ssid: string; pass: string };
  allergyNote: Loc;
  brandColor: string;
  logoUrl: string;
  /** Optional cover picture for the top of the guest home page. */
  coverUrl?: string;
  /** Venue branding for the guest page (null = default look). */
  theme: import("./theme").GuestTheme | null;
  modules: Modules;
  /** Hidden games are stored as { key: false }. */
  games: Record<string, boolean | number>;
  /** "items" = built-in menu, "pdf" = the venue's own PDF menus. */
  menuMode: "items" | "pdf";
  menuPdf: string;
  drinksPdf: string;
  menu: MenuCategory[];
  events: VenueEvent[];
  offers: Offer[];
  nearby: NearbyPlace[];
};

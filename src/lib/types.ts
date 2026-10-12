export type Lang = "en" | "ar";
export type Loc = { en: string; ar: string };

export const MODULE_KEYS = ["menu", "drinks", "kids", "group", "date", "events", "offers"] as const;
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
  modules: Modules;
  menu: MenuCategory[];
  events: VenueEvent[];
  offers: Offer[];
};

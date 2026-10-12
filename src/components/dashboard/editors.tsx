"use client";
import { ALLERGEN, DAYS, DIET } from "@/lib/content";
import { NEARBY_CATS, OFFER_COLORS } from "@/lib/types";
import CrudList, { type Field, type Row } from "./CrudList";

const WEEKDAYS: [string, string][] = DAYS.en.map((d, i) => [String(i), d]);
const today = () => new Date().toISOString().slice(0, 10);

/* ---------- Menu ---------- */

const CATEGORY_FIELDS: Field[] = [
  { key: "kind", label: "Menu", type: "select", required: true, options: [["food", "Food"], ["drinks", "Drinks"]] },
  { key: "sort_order", label: "Order (lower shows first)", type: "number" },
  { key: "name_en", label: "Name (English)", type: "text", required: true },
  { key: "name_ar", label: "Name (Arabic)", type: "text", dir: "rtl" },
];

const ITEM_FIELDS: Field[] = [
  { key: "name_en", label: "Name (English)", type: "text", required: true },
  { key: "name_ar", label: "Name (Arabic)", type: "text", dir: "rtl" },
  { key: "desc_en", label: "Description (English)", type: "text" },
  { key: "desc_ar", label: "Description (Arabic)", type: "text", dir: "rtl" },
  { key: "price", label: "Price (AED, incl. VAT)", type: "number", required: true },
  { key: "sort_order", label: "Order", type: "number" },
  { key: "diet", label: "Dietary labels", type: "multi", options: Object.entries(DIET).map(([k, v]) => [k, v.en]) },
  { key: "allergens", label: "Allergens", type: "multi", options: Object.entries(ALLERGEN).map(([k, v]) => [k, v.en]) },
  { key: "sold_out", label: "Sold out today", type: "checkbox" },
  { key: "hidden", label: "Hide from guests", type: "checkbox" },
];

export function MenuEditor({ venueId, categories }: { venueId: string; categories: Row[] }) {
  const sorted = [...categories].sort((a, b) => (a.kind === b.kind ? a.sort_order - b.sort_order : a.kind === "food" ? -1 : 1));
  return (
    <>
      <section className="panel">
        <h2>Categories</h2>
        <p className="muted small">Group your menu into tabs such as Starters, Mains or Hot drinks.</p>
        <CrudList
          table="menu_categories"
          rows={sorted}
          fields={CATEGORY_FIELDS}
          defaults={{ venue_id: venueId, kind: "food", sort_order: categories.length }}
          title={(r) => r.name_en}
          badges={(r) => [{ text: r.kind === "food" ? "Food" : "Drinks" }, { text: `${(r.menu_items ?? []).length} items` }]}
          addLabel="Add category"
        />
      </section>
      {sorted.map((c) => {
        const items = [...(c.menu_items ?? [])].sort((a: Row, b: Row) => a.sort_order - b.sort_order);
        return (
          <section key={c.id} className="panel">
            <h2>
              {c.name_en} <span className="muted small">· {c.kind === "food" ? "Food" : "Drinks"}</span>
            </h2>
            <CrudList
              table="menu_items"
              rows={items}
              fields={ITEM_FIELDS}
              defaults={{ venue_id: venueId, category_id: c.id, price: "", sort_order: items.length }}
              title={(r) => `${r.name_en} · AED ${r.price}`}
              badges={(r) => [
                ...(r.sold_out ? [{ text: "Sold out", tone: "off" as const }] : []),
                ...(r.hidden ? [{ text: "Hidden", tone: "off" as const }] : []),
              ]}
              warn={(r) =>
                r.price === "" || r.price == null
                  ? "Add a price."
                  : (r.allergens ?? []).length === 0
                    ? "No allergens ticked. Check this is correct."
                    : null
              }
              addLabel="Add item"
              emptyText="No items in this category yet."
            />
          </section>
        );
      })}
    </>
  );
}

/* ---------- Events ---------- */

const EVENT_FIELDS: Field[] = [
  { key: "title_en", label: "Title (English)", type: "text", required: true },
  { key: "title_ar", label: "Title (Arabic)", type: "text", dir: "rtl" },
  { key: "desc_en", label: "Description (English)", type: "textarea" },
  { key: "desc_ar", label: "Description (Arabic)", type: "textarea", dir: "rtl" },
  { key: "weekday", label: "Repeats every", type: "select", options: WEEKDAYS, hint: "Choose a day for weekly events…" },
  { key: "event_date", label: "…or a single date", type: "date" },
  { key: "start_time", label: "Starts", type: "time", required: true },
  { key: "end_time", label: "Ends", type: "time", required: true },
  { key: "sort_order", label: "Order", type: "number" },
  { key: "published", label: "Show to guests", type: "checkbox" },
];

export function EventsEditor({ venueId, events }: { venueId: string; events: Row[] }) {
  return (
    <section className="panel">
      <h2>What&apos;s on</h2>
      <p className="muted small">Weekly events always show their next date. One-off events disappear after they finish.</p>
      <CrudList
        table="events"
        rows={[...events].sort((a, b) => a.sort_order - b.sort_order).map((e) => ({ ...e, weekday: e.weekday == null ? "" : String(e.weekday) }))}
        fields={EVENT_FIELDS}
        defaults={{ venue_id: venueId, published: true, sort_order: events.length }}
        title={(r) => r.title_en}
        badges={(r) => [
          { text: r.weekday !== "" && r.weekday != null ? `Every ${DAYS.en[Number(r.weekday)]}` : r.event_date || "No date" },
          ...(r.published ? [] : [{ text: "Hidden", tone: "off" as const }]),
          ...(r.event_date && r.event_date < today() ? [{ text: "Finished", tone: "off" as const }] : []),
        ]}
        warn={(r) =>
          (r.weekday === "" || r.weekday == null) && !r.event_date
            ? "Pick a weekday or a date."
            : !r.end_time
              ? "Add an end time."
              : null
        }
        addLabel="Add event"
        emptyText="No events yet."
      />
    </section>
  );
}

/* ---------- Offers ---------- */

const OFFER_FIELDS: Field[] = [
  { key: "title_en", label: "Title (English)", type: "text", required: true },
  { key: "title_ar", label: "Title (Arabic)", type: "text", dir: "rtl" },
  { key: "desc_en", label: "Short description (English)", type: "text" },
  { key: "desc_ar", label: "Short description (Arabic)", type: "text", dir: "rtl" },
  { key: "terms_en", label: "Terms (English)", type: "textarea", hint: "Who can use it, when, limits and how to redeem." },
  { key: "terms_ar", label: "Terms (Arabic)", type: "textarea", dir: "rtl" },
  { key: "starts_on", label: "Starts", type: "date" },
  { key: "ends_on", label: "Ends", type: "date" },
  { key: "color", label: "Colour", type: "select", required: true, options: OFFER_COLORS.map((c) => [c, c[0].toUpperCase() + c.slice(1)]) },
  { key: "sort_order", label: "Order", type: "number" },
  { key: "featured", label: "Show as today's offer on the home screen", type: "checkbox" },
  { key: "published", label: "Show to guests", type: "checkbox" },
];

export function OffersEditor({ venueId, offers }: { venueId: string; offers: Row[] }) {
  return (
    <section className="panel">
      <h2>Offers</h2>
      <p className="muted small">Guests see the terms and expiry before they tap “Show to your server”. Expired offers hide themselves.</p>
      <CrudList
        table="offers"
        rows={[...offers].sort((a, b) => a.sort_order - b.sort_order)}
        fields={OFFER_FIELDS}
        defaults={{ venue_id: venueId, color: "coral", published: true, sort_order: offers.length }}
        title={(r) => r.title_en}
        badges={(r) => [
          ...(r.featured ? [{ text: "Today's offer", tone: "on" as const }] : []),
          ...(r.published ? [] : [{ text: "Hidden", tone: "off" as const }]),
          ...(r.ends_on && r.ends_on < today() ? [{ text: "Expired", tone: "off" as const }] : []),
          ...(r.ends_on ? [{ text: `Until ${r.ends_on}` }] : []),
        ]}
        warn={(r) => (!String(r.terms_en ?? "").trim() ? "Add terms so guests know the rules." : !r.ends_on ? "Consider adding an end date." : null)}
        addLabel="Add offer"
        emptyText="No offers yet."
      />
    </section>
  );
}

/* ---------- Things to do nearby ---------- */

const NEARBY_NAMES: Record<string, string> = {
  sight: "🏛️ Sight or landmark", beach: "🏖️ Beach", park: "🌳 Park", family: "🎡 Family fun", shopping: "🛍️ Shopping",
  culture: "🎭 Culture & museums", food: "🍦 Treats & cafés", nightlife: "🌃 Nightlife", sport: "⛳ Sport & activities",
};
const NEARBY_FIELDS: Field[] = [
  { key: "name_en", label: "Place (English)", type: "text", required: true },
  { key: "name_ar", label: "Place (Arabic)", type: "text", dir: "rtl" },
  { key: "desc_en", label: "Why go? (English)", type: "textarea", hint: "One or two lines, e.g. \"Sunset walk along the water, 5 minutes away.\"" },
  { key: "desc_ar", label: "Why go? (Arabic)", type: "textarea", dir: "rtl" },
  { key: "category", label: "Type", type: "select", required: true, options: NEARBY_CATS.map((c) => [c, NEARBY_NAMES[c]]) },
  { key: "distance", label: "How far", type: "text", hint: "e.g. 5 min walk, 2 km, 10 min by taxi" },
  { key: "maps_url", label: "Google Maps link (optional)", type: "text", full: true, hint: "Paste a link from Google Maps. Leave empty and we'll search for the place." },
  { key: "sort_order", label: "Order", type: "number" },
  { key: "published", label: "Show to guests", type: "checkbox" },
];

export function NearbyEditor({ venueId, places, enabled }: { venueId: string; places: Row[]; enabled: boolean }) {
  return (
    <section className="panel">
      <h2>Things to do nearby</h2>
      <p className="muted small">
        Recommend local spots: beaches, sights, family fun and places for an evening stroll. Great for tourists and hotel guests.
      </p>
      {!enabled && (
        <p className="status bad">
          This section is switched off, so guests can&apos;t see it yet. Turn on &ldquo;Things to do nearby&rdquo; under <a href="?tab=details">Details → Sections guests can see</a>.
        </p>
      )}
      <CrudList
        table="nearby"
        rows={[...places].sort((a, b) => a.sort_order - b.sort_order)}
        fields={NEARBY_FIELDS}
        defaults={{ venue_id: venueId, category: "sight", published: true, sort_order: places.length }}
        title={(r) => r.name_en}
        badges={(r) => [{ text: NEARBY_NAMES[r.category] ?? r.category }, ...(r.distance ? [{ text: r.distance }] : []), ...(r.published ? [] : [{ text: "Hidden", tone: "off" as const }])]}
        warn={(r) => (r.maps_url && !/^https:\/\//.test(r.maps_url) ? "The map link must start with https://" : null)}
        addLabel="Add a place"
        emptyText="No places yet. Add a few favourites guests can visit after their meal."
      />
    </section>
  );
}

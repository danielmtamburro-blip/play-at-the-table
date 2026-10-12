# Play at the Table

A QR coaster for restaurant and café tables in Dubai. Guests scan it with their phone camera and get the venue's menu, offers, events and games for kids, friends and couples, in English and Arabic. There's no app to download and no sign-up.

Built with **Next.js 15** (App Router, TypeScript), **Supabase** (database + venue logins) and hosted on **Netlify**.

## Pages

| URL | What it is |
| --- | --- |
| `/` | Sales page for venues, with the live guest demo inside a phone. The pilot form saves to Supabase. |
| `/v/<venue>` | Guest page for a venue. This is what the venue QR opens. |
| `/v/<venue>/<table>` | Guest page for one table, e.g. `/v/ember-date-kitchen/12`. Any number 1–999. |
| `/demo` | Shortcut to the demo venue. Old `/#demo` and `/#t12` links also redirect. |
| `/login` | Venue owner sign in / sign up. |
| `/dashboard` | Venue dashboard: edit details, menu, events and offers; download table QR codes; see totals. |

The demo venue "Ember & Date Kitchen" is fictional. It lives in the database (seeded by `supabase/seed.sql`), and `src/lib/sample.ts` holds a copy used if Supabase can't be reached.

## Project layout

| Path | What it is |
| --- | --- |
| `src/app/` | Pages and routes |
| `src/components/guest/` | The guest experience (home, menu, events, offers, kids' games, group games, date decks) |
| `src/components/dashboard/` | Venue dashboard editors |
| `src/lib/content.ts` | Platform-owned content: all UI strings (EN/AR) and game decks. Edit questions here. |
| `src/lib/venue.ts` | Loads a published venue from Supabase and hides expired offers/events |
| `supabase/migrations/` | Database schema with row-level security |
| `supabase/seed.sql` | Demo venue data |
| `coaster/` | QR coaster generator and print-ready designs (100 mm PDFs) |
| `docs/product-spec.md` | The original MVP product specification |

## Database (Supabase project `play-at-the-table`)

| Table | Purpose | Who can read / write |
| --- | --- | --- |
| `venues` | Venue profile, Wi-Fi, hours, sections switched on, live/draft | Public reads live venues; members edit |
| `venue_members` | Which logins manage which venue (owner/editor) | Members only; created by `create_venue()` |
| `menu_categories`, `menu_items` | Food and drinks menus with prices, dietary and allergen tags | Public reads live venues; members edit |
| `events` | Weekly or one-off "What's on" events | Same |
| `offers` | Offers with terms, dates and colour | Same |
| `pilot_requests` | Sales-page sign-ups | Anyone can insert; nobody can read through the API (view them in the Supabase dashboard) |
| `analytics_events` | Anonymous totals: scans, section opens, offers shown | Guests insert; venue members read via `venue_stats()` |

No guest names, contacts, game answers or drawings are ever stored.

## Running locally

```bash
cp .env.example .env.local   # Supabase URL + publishable key
npm install
npm run dev
```

Open http://localhost:3000.

## Deploying

Netlify builds from GitHub on every push to `main` (`npm run build`, Next.js runtime detected automatically). The site needs two environment variables in Netlify: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (values in `.env.example`).

In Supabase → Authentication → URL Configuration, set the **Site URL** to the live address (e.g. `https://playatthetable.netlify.app`) and add `https://playatthetable.netlify.app/auth/callback` to **Redirect URLs**, so sign-up confirmation emails link back to the site.

### Giving yourself access to the demo venue

Sign up at `/login`, then run this in the Supabase SQL editor (replace the email):

```sql
insert into venue_members (venue_id, user_id, role)
select v.id, u.id, 'owner' from venues v, auth.users u
where v.slug = 'ember-date-kitchen' and u.email = 'you@example.com';
```

## Making coasters

You need Python 3, `reportlab` and `playwright` (with Chromium) installed. The dashboard's **QR codes** tab also downloads a plain QR per table.

```bash
cd coaster
# arguments: link the QR opens, output file, "sample" or "template", rim colour
python3 make_coaster.py "https://playatthetable.netlify.app/v/YOUR-VENUE/1" table1.svg template "#D9B262"
python3 render.py table1.svg table1.png table1.pdf
```

- `template` leaves a space for the venue's logo. `sample` shows the example venue.
- Always test-scan a printed coaster before ordering in bulk.

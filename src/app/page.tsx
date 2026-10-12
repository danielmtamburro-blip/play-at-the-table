import GuestApp from "@/components/guest/GuestApp";
import HashRedirect from "@/components/HashRedirect";
import { Logo } from "@/components/Logo";
import PilotForm from "@/components/PilotForm";
import { CONTACT_EMAIL } from "@/lib/content";
import { DEMO_SLUG, SAMPLE_VENUE } from "@/lib/sample";
import { getVenue } from "@/lib/venue";

export const revalidate = 60;

const MODULES = [
  ["m-menu", "Menu & offers", "Food, drinks and deals", "Prices in AED, allergen labels, sold-out items, and offers with clear terms that guests show to their server."],
  ["m-kids", "Kids", "Calm, happy little ones", "Colouring, memory match, a kids' quiz and table challenges. No accounts, ads or links out, and nothing is uploaded."],
  ["m-group", "Friends", "Games for the group", "Quick questions, This or That and a Party Picker that chooses who goes next. Pass one phone around."],
  ["m-date", "Date night", "Conversation starters", "Question decks for first dates, couples and memory lane. Skip any card, and no answers are ever saved."],
  ["m-events", "What's on", "Events that sell themselves", "Brunch, quiz night, live music, match screenings. Past events disappear on their own, and guests can add them to their calendar."],
  ["m-info", "Venue info", "The questions staff hear most", "Wi-Fi password, opening hours, directions, parking and accessibility notes, all in one place."],
];

const BENEFITS = [
  ["Change it tonight", "Update a price, a special or an event from your dashboard. The printed QR stays the same."],
  ["Your brand, your sections", "Add your logo and colours, then choose which sections appear: family lunch mode or late-night mode."],
  ["Bilingual by default", "English and Arabic side by side, with a proper right-to-left layout."],
  ["Know what works", "See scans, menu views, game plays and offer views. Totals only, never individual guests."],
  ["Safe for families", "No chat, no child accounts, no public leaderboards, and every game has a skip button."],
  ["Honest promotions", "Every offer shows its terms, expiry and how to redeem before a guest commits."],
];

const FAQ = [
  ["Do guests need to download anything?", "No. The QR opens a web page in the phone's camera browser. There's no app and no sign-up."],
  ["Can guests order or pay through it?", "Not yet. Guests still order with your staff, so nothing changes with your POS. Ordering may come later."],
  ["Who keeps the menu and allergens up to date?", "You do, from a simple dashboard, or we can do it for you on the Plus plan. Every menu reminds guests to confirm serious allergies with staff."],
  ["Is it safe for children?", "Yes, by design. There's no chat, no accounts, no ads, no camera, no uploads and no links out of the kids' area."],
  ["What data do you collect?", "Only totals, such as how many scans or game plays. We never collect names, game answers, contacts or precise location."],
];

export default async function Landing() {
  const venue = (await getVenue(DEMO_SLUG)) ?? SAMPLE_VENUE;

  return (
    <div id="landing">
      <HashRedirect />
      <header className="nav">
        <div className="wrap">
          <Logo href="#top" />
          <nav className="nav-links" aria-label="Sections">
            <a href="#guests">For guests</a>
            <a href="#venues">For venues</a>
            <a href="#how">How it works</a>
            <a href="#pricing">Pricing</a>
            <a href="/dashboard">Venue login</a>
          </nav>
          <a className="btn btn-primary" href="#pilot">
            Join the pilot
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy">
              <span className="eyebrow">Table QR experiences · Dubai</span>
              <h1>
                Waiting for food? <span className="hl hl-1">Play</span> at the <span className="hl hl-2">table.</span>
              </h1>
              <p className="lede">
                One QR on every table opens your menu, tonight&apos;s offers and events, plus games for kids, friends and couples. Guests
                don&apos;t download an app or sign up, and it works in English and Arabic.
              </p>
              <div className="hero-ctas">
                <a className="btn btn-primary" href="#pilot">
                  Book a free pilot
                </a>
                <a className="btn btn-ghost" href={`/v/${DEMO_SLUG}`}>
                  Open the guest demo
                </a>
              </div>
              <div className="hero-meta">
                <span>No app download</span>
                <span>English &amp; العربية</span>
                <span>Update without reprinting</span>
              </div>
            </div>
            <div className="phone-stage">
              <div className="phone">
                <div className="phone-screen">
                  <GuestApp venue={venue} table="12" embedded />
                </div>
              </div>
              <p className="phone-note">This is the live guest experience. Tap around: it&apos;s what diners see when they scan.</p>
            </div>
          </div>
        </section>
        <div className="confetti" role="presentation" />

        <section className="block" id="guests">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">What guests get</span>
              <h2>Something for everyone at the table</h2>
              <p>Guests open the sections your venue switches on. The menu is never more than one tap away.</p>
            </div>
            <div className="modules">
              {MODULES.map(([cls, tag, h, p]) => (
                <article key={cls} className={`module ${cls}`}>
                  <span className="tag">{tag}</span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="block venue-band" id="venues">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow" style={{ color: "inherit", opacity: 0.7 }}>
                For restaurants, cafés and bars
              </span>
              <h2>Keep tables happy while the kitchen does its thing</h2>
              <p>Families stay longer and calmer, groups order another round, and couples come back. You stay in control of every word on the page.</p>
            </div>
            <div className="benefits">
              {BENEFITS.map(([h, p]) => (
                <div key={h} className="benefit">
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="block" id="how">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">How it works</span>
              <h2>Live on your tables in a week</h2>
            </div>
            <div className="steps">
              <div className="step">
                <h3>We build your page</h3>
                <p>Send us your menu, offers and logo. We set everything up in English and Arabic for you to approve.</p>
              </div>
              <div className="step">
                <h3>Coasters go on tables</h3>
                <p>We supply our round, glazed QR coasters. Each one can carry its own table number.</p>
              </div>
              <div className="step">
                <h3>You keep it fresh</h3>
                <p>Edit specials and events whenever you like, and see each week what guests used most.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="block" id="pricing" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Pricing</span>
              <h2>Simple monthly plans</h2>
              <p>Prices are per venue, in AED, excluding VAT. You can cancel any month.</p>
            </div>
            <div className="pricing">
              <div className="plan">
                <h3>Starter</h3>
                <div className="price">
                  249 <small>AED / month</small>
                </div>
                <ul>
                  <li>Menu, drinks, offers and events</li>
                  <li>Kids, group and date games</li>
                  <li>English and Arabic</li>
                  <li>One venue QR and 20 coasters</li>
                </ul>
              </div>
              <div className="plan featured">
                <span className="pill">Most popular</span>
                <h3>Plus</h3>
                <div className="price">
                  449 <small>AED / month</small>
                </div>
                <ul>
                  <li>Everything in Starter</li>
                  <li>A numbered QR for every table</li>
                  <li>Monthly engagement report</li>
                  <li>Seasonal themes and custom game decks</li>
                  <li>Up to 60 coasters</li>
                </ul>
              </div>
              <div className="plan">
                <h3>Group</h3>
                <div className="price">Custom</div>
                <ul>
                  <li>Several locations from one dashboard</li>
                  <li>Branded games and mascot colouring sheets</li>
                  <li>Reward campaigns, with terms reviewed by you</li>
                  <li>Dedicated account manager</li>
                </ul>
              </div>
            </div>
            <div className="pilot-note">
              <strong>Founding venues:</strong>
              <span>The first 10 Dubai venues get an 8-week pilot free, coasters included.</span>
            </div>
          </div>
        </section>

        <section className="block" id="pilot" style={{ paddingTop: 0 }}>
          <div className="wrap pilot">
            <div className="section-head">
              <span className="eyebrow">Free pilot</span>
              <h2>Bring Play at the Table to your venue</h2>
              <p>Tell us a little about your place. We&apos;ll build a sample page with your real menu before you commit to anything.</p>
              <p>
                Prefer to talk? Email <strong>{CONTACT_EMAIL}</strong>
              </p>
            </div>
            <PilotForm />
          </div>
        </section>

        <section className="block" id="faq" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Questions</span>
              <h2>Good to know</h2>
            </div>
            <div className="faq">
              {FAQ.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <div className="confetti" role="presentation" />
      <footer className="site">
        <div className="wrap">
          <span>© 2026 Play at the Table · Dubai, UAE</span>
          <span>Guests are never asked for personal details.</span>
          <a href="/dashboard">Venue login</a>
        </div>
      </footer>
    </div>
  );
}

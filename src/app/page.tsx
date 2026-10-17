import HashRedirect from "@/components/HashRedirect";
import HeroPhone from "@/components/HeroPhone";
import { Logo } from "@/components/Logo";
import PilotForm from "@/components/PilotForm";
import { CONTACT_EMAIL } from "@/lib/content";
import { SHOWCASE_VENUE, showcaseToday } from "@/lib/showcase";
import TryOnPhone from "@/components/landing/TryOnPhone";
import VenueGets from "@/components/landing/VenueGets";
import { WhatsAppButton, WhatsAppFloat, whatsappLink } from "@/components/landing/WhatsApp";
import YourVenue from "@/components/landing/YourVenue";

export const revalidate = 60;

const MODULES = [
  ["m-menu", "Menu & offers", "Food, drinks and deals", "Prices in AED, allergen labels, sold-out items, and offers with clear terms that guests show to their server."],
  ["m-kids", "Kids", "Calm, happy little ones", "Colouring, memory match, a kids' quiz and table challenges. No accounts, ads or links out, and nothing is uploaded."],
  ["m-group", "Friends", "Games for the group", "Quick questions, This or That and a Party Picker that chooses who goes next. Pass one phone around."],
  ["m-date", "Date night", "Conversation starters", "Question decks for first dates, couples and memory lane. Skip any card, and no answers are ever saved."],
  ["m-events", "What's on", "Events that sell themselves", "Brunch, quiz night, live music, match screenings. Past events disappear on their own, and guests can add them to their calendar."],
  ["m-info", "Venue info", "The questions staff hear most", "Wi-Fi password, opening hours, directions, parking and accessibility notes, all in one place."],
  ["m-kids", "Celebrations", "Make birthdays unforgettable", "Guests turn their phone into a party card with confetti and a song, and can quietly let your team know so you can bring a candle."],
  ["m-group", "Pub games & local guide", "Darts, pool and things to do", "Darts and pool scorers for your board and table, plus your favourite spots nearby for tourists and hotel guests."],
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


/** Pricing: one plan with every feature, priced by how long the venue commits. */
const PLANS = [
  { name: "Monthly", total: "AED 649", unit: "/ month", per: "Rolling. Cancel any month.", save: "", badge: "", best: false },
  { name: "3 months", total: "AED 1,800", unit: "for 3 months", per: "That's AED 600 a month", save: "Save AED 147", badge: "", best: false },
  { name: "6 months", total: "AED 3,300", unit: "for 6 months", per: "That's AED 550 a month", save: "Save AED 594", badge: "", best: false },
  { name: "12 months", total: "AED 5,400", unit: "for 12 months", per: "That's AED 450 a month", save: "Save AED 2,388", badge: "Best value", best: true },
];

export default async function Landing() {

  return (
    <div id="landing">
      <HashRedirect />
      <WhatsAppFloat />
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
          <a className="btn btn-ghost nav-login" href="/dashboard" aria-label="Venue login">
            Log in
          </a>
          <a className="btn btn-primary" href="#pilot">
            Join the pilot
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <span className="blob b1" />
            <span className="blob b2" />
            <span className="blob b3" />
            <span className="blob b4" />
            {["🎲", "⚽", "🃏", "🏎️", "🍔", "🧩", "🎨", "🥤", "🏆", "🎉", "☕", "❤️"].map((e, i) => (
              <span key={i} className={`float f${i}`}>
                {e}
              </span>
            ))}
          </div>
          <div className="wrap">
            <div className="hero-copy">
              <span className="eyebrow">Table QR experiences · Dubai</span>
              <h1>
                Waiting for food? <span className="hl hl-1">Play</span> at your <span className="hl hl-2">table.</span>
              </h1>
              <p className="lede">
                One QR on every table opens your menu, tonight&apos;s offers and events, plus games for kids, friends and couples. Guests
                don&apos;t download an app or sign up, and it works in English and Arabic.
              </p>
              <div className="hero-ctas">
                <a className="btn btn-primary" href="#pilot">
                  Book a free pilot
                </a>
                <a className="btn btn-ghost" href="/v/saffron-terrace/12">
                  Open the guest demo
                </a>
              </div>
              <TryOnPhone />
              <div className="hero-meta">
                <span>No app download</span>
                <span>English &amp; العربية</span>
                <span>Update without reprinting</span>
              </div>
            </div>
            <HeroPhone venue={SHOWCASE_VENUE} />
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
            <p className="swipe-hint" aria-hidden="true">Swipe to see all 8 →</p>
            <div className="modules">
              {MODULES.map(([cls, tag, h, p]) => (
                <article key={h} className={`module ${cls}`}>
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
            <p className="swipe-hint" aria-hidden="true">Swipe for more →</p>
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

        <section className="block" id="your-venue">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">See it with your venue</span>
              <h2>Picture it in your place</h2>
              <p>Type your venue&apos;s name, pick your colour and add your logo. The phone shows your guest page straight away.</p>
            </div>
            <YourVenue base={showcaseToday()} />
          </div>
        </section>

        <section className="block vg-band" id="what-you-get">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">What venues get</span>
              <h2>Everything you need, ready on day one</h2>
              <p>Branded coasters and stickers for every table, a dashboard that shows what&apos;s working, and a staff screen so no request gets missed.</p>
            </div>
            <VenueGets />
          </div>
        </section>

        <section className="block" id="how">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">How it works</span>
              <h2>Live on your tables in a week</h2>
            </div>
            <p className="swipe-hint" aria-hidden="true">Swipe through the 3 steps →</p>
            <div className="steps">
              <div className="step">
                <h3>You build your page</h3>
                <p>Sign up and use our simple portal to add your logo, colours, menu, offers and events, exactly how you want it, in English and Arabic.</p>
              </div>
              <div className="step">
                <h3>Coasters go on tables</h3>
                <p>We supply your QR coasters in acrylic, round or square, plus small stickers for table corners and menus. Each one carries its own table number.</p>
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
              <h2>Simple plans, all features included</h2>
              <p>One price per venue, in AED excluding VAT, with every feature included. Go monthly, or save with a longer plan. Got several venues? Ask us for a group quote.</p>
            </div>
            <p className="swipe-hint" aria-hidden="true">Swipe to compare plans →</p>
            <div className="pricing">
              {PLANS.map((pl) => (
                <div key={pl.name} className={`plan${pl.best ? " featured" : ""}`}>
                  {pl.badge && <span className="pill">{pl.badge}</span>}
                  <h3>{pl.name}</h3>
                  <div className="price">
                    {pl.total} <small>{pl.unit}</small>
                  </div>
                  <p className="plan-per">{pl.per}</p>
                  {pl.save && <span className="plan-save">{pl.save}</span>}
                  <a className={`btn ${pl.best ? "btn-primary" : "btn-ghost"} btn-sm plan-go`} href="#pilot">
                    Start free pilot
                  </a>
                </div>
              ))}
              <div className="plan plan-multi">
                <div className="plan-multi-head">
                  <h3>Multi-venue</h3>
                  <div className="price">
                    Price on quote <small>for 2+ venues</small>
                  </div>
                </div>
                <ul>
                  <li>All venues, one login</li>
                  <li>Stats per venue and group</li>
                  <li>Dedicated account manager</li>
                </ul>
                <div className="plan-cta">
                  <a className="btn btn-primary btn-sm" href="#pilot">
                    Request a quote
                  </a>
                  <a className="btn btn-wa btn-sm" href={whatsappLink("Hi! I have more than one venue and would like a quote for Play at Your Table.")} target="_blank" rel="noopener noreferrer">
                    WhatsApp us
                  </a>
                </div>
              </div>
            </div>
            <div className="plan-all">
              <h3>Every plan includes</h3>
              <ul>
                <li>Your own branded guest page: logo, colours and menu</li>
                <li>Food and drinks menu with allergens and dietary filters</li>
                <li>Offers, events and what&apos;s on, updated any time</li>
                <li>Games for kids, adults, couples and groups</li>
                <li>A numbered QR for every table</li>
                <li>Call server and bill alerts on a live staff screen</li>
                <li>Stats, leaderboards and a monthly report</li>
                <li>Darts and pool scorers, challenges and celebrations</li>
                <li>English and Arabic</li>
                <li>Coasters, posters and table cards designed in your portal</li>
              </ul>
            </div>
            <div className="pilot-note">
              <strong>Founding venues:</strong>
              <span>The first 3 Dubai venues get a four-week pilot free, coasters included.</span>
            </div>
          </div>
        </section>

        <section className="block" id="pilot" style={{ paddingTop: 0 }}>
          <div className="wrap pilot">
            <div className="section-head">
              <span className="eyebrow">Free pilot</span>
              <h2>Bring Play at Your Table to your venue</h2>
              <p>Tell us a little about your place. We&apos;ll set up your page with your menu, games and offers, and you try it free for four weeks before you commit to anything.</p>
              <div className="pilot-wa">
                <p>Prefer to talk? Message us and we&apos;ll set up a demo at your venue.</p>
                <WhatsAppButton />
                <p className="small">
                  Or email <strong>{CONTACT_EMAIL}</strong>
                </p>
              </div>
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
          <span>© 2026 Play at Your Table · Dubai, UAE</span>
          <span>Guests are never asked for personal details.</span>
          <a href="/dashboard">Venue login</a>
        </div>
      </footer>
    </div>
  );
}

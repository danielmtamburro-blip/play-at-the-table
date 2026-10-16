// "What venues get": printed coasters (3D table scene), the stats dashboard and the live staff screen.
// Everything here is an illustration with example numbers.
import { coasterSvg, DEFAULT_DESIGN, inkOn } from "@/lib/coaster";

const URL = "https://playatyourtable.com/v/saffron-terrace/12";

type Example = { base: string; icons: [string, string][]; iconColour: string; words: string; table: string; logo?: string; venueName?: string };
const ICON_SPOTS: [number, number][] = [[210, 380], [790, 380], [225, 575], [775, 575]];

/** One example venue's coaster: the fixed colourful rim, with their own colour, logo, icons and words. */
const coaster = (ex: Example, idPrefix: string) => {
  const d = {
    ...DEFAULT_DESIGN,
    base: ex.base,
    taglineColor: inkOn(ex.base),
    tagline: ex.words,
    taglineSize: 34,
    icons: ex.icons.map(([k], i) => ({ k, x: ICON_SPOTS[i][0], y: ICON_SPOTS[i][1], s: 78, c: ex.iconColour })),
  };
  // Each inline SVG needs its own ids for the curved text, clip path and shadow.
  return coasterSvg(d, { url: URL, table: ex.table, logo: ex.logo, venueName: ex.venueName }).replace(/(arcTop|arcBottom|disc|qrShadow)/g, `${idPrefix}-$1`);
};

const EXAMPLES: Example[] = [
  { base: "#1A1410", icons: [["cocktail", ""], ["music", ""], ["moon", ""], ["sparkle", ""]], iconColour: "#E3A94B", words: "Welcome to the terrace", table: "12", logo: "/showcase/saffron-logo.svg" },
  { base: "#0E4D3A", icons: [["coffee", ""], ["food", ""], ["kids", ""], ["heart", ""]], iconColour: "#F7F1E3", words: "Family brunch every Friday", table: "4", venueName: "The Olive Tree" },
  { base: "#F7F1E3", icons: [["palm", ""], ["icecream", ""], ["football", ""], ["smile", ""]], iconColour: "#12A594", words: "Sun, sea and good food", table: "9", venueName: "Beach Shack" },
];

const DAYS = [["Mon", 142], ["Tue", 168], ["Wed", 155], ["Thu", 214], ["Fri", 296], ["Sat", 318], ["Sun", 241]] as const;
const TOP_GAMES = [["⚽ Penalty shootout", 412], ["🏎️ Car racer", 356], ["🧠 Table trivia", 298], ["🍺 Pour it right", 241], ["🔢 Sudoku", 187]] as const;

export default function VenueGets() {
  const maxDay = Math.max(...DAYS.map(([, v]) => v));
  const maxGame = TOP_GAMES[0][1];
  return (
    <div className="vg">
      {/* Coasters on a table */}
      <article className="vg-card vg-coasters">
        <div className="vg-head">
          <span className="vg-tag">Coasters &amp; stickers</span>
          <h3>Your brand on every table</h3>
          <p>
            Fully editable in your brand colours, with your logo, icons and your own text. Choose round or square acrylic coasters, or stickers in four
            sizes. Every one keeps the colourful Play at Your Table rim so guests know there&apos;s fun to be had, and each table gets its own QR code.
          </p>
        </div>
        <div className="vg-table" aria-hidden="true">
          <div className="vg-scene">
            {EXAMPLES.map((ex, i) => (
              <div key={i} className={`vg-coaster c${i + 1}`} dangerouslySetInnerHTML={{ __html: coaster(ex, `c${i + 1}`) }} />
            ))}
            <span className="vg-glass" />
            <span className="vg-cup">☕</span>
          </div>
        </div>
      </article>

      {/* Stats dashboard */}
      <article className="vg-card vg-stats">
        <div className="vg-head">
          <span className="vg-tag">Live stats</span>
          <h3>See what your guests love</h3>
          <p>Scans, games played, time on the page and ratings, by day and by table. Only totals: no names or personal data.</p>
        </div>
        <div className="vg-window" aria-label="Example stats dashboard">
          <div className="vg-bar">
            <span />
            <span />
            <span />
            <b>Saffron Terrace · Last 7 days</b>
          </div>
          <div className="vg-kpis">
            <div>
              <small>Table scans</small>
              <b>1,534</b>
              <em className="up">▲ 18%</em>
            </div>
            <div>
              <small>Games played</small>
              <b>3,902</b>
              <em className="up">▲ 26%</em>
            </div>
            <div>
              <small>Avg. time on page</small>
              <b>14m 20s</b>
              <em className="up">▲ 3m</em>
            </div>
            <div>
              <small>Guest rating</small>
              <b>4.8 ★</b>
              <em>212 ratings</em>
            </div>
          </div>
          <div className="vg-charts">
            <div className="vg-chart">
              <small>Scans per day</small>
              <div className="vg-cols">
                {DAYS.map(([d, v]) => (
                  <span key={d} className={d === "Sat" ? "peak" : ""}>
                    <i style={{ height: `${(v / maxDay) * 100}%` }} title={`${d}: ${v} scans`} />
                    <em>{d}</em>
                  </span>
                ))}
              </div>
            </div>
            <div className="vg-chart">
              <small>Top games</small>
              <ul className="vg-rows">
                {TOP_GAMES.map(([g, v]) => (
                  <li key={g}>
                    <span>{g}</span>
                    <i style={{ width: `${(v / maxGame) * 100}%` }} />
                    <b>{v}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </article>

      {/* Staff screen */}
      <article className="vg-card vg-staff">
        <div className="vg-head">
          <span className="vg-tag">Staff screen</span>
          <h3>Never miss a table</h3>
          <p>&ldquo;Call server&rdquo; and &ldquo;Bill please&rdquo; pop up live on any tablet or phone behind the bar, with a gentle chime.</p>
        </div>
        <ul className="vg-requests" aria-label="Example staff requests">
          <li className="new">
            <b>Table 7</b>
            <span>🙋 Call server</span>
            <em>just now</em>
            <button tabIndex={-1}>Done</button>
          </li>
          <li>
            <b>Table 12</b>
            <span>🧾 Bill please</span>
            <em>1 min</em>
            <button tabIndex={-1}>Done</button>
          </li>
          <li>
            <b>Table 3</b>
            <span>🙋 Call server</span>
            <em>3 min</em>
            <button tabIndex={-1}>Done</button>
          </li>
        </ul>
      </article>
    </div>
  );
}

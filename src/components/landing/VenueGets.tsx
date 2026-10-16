// "What venues get": printed coasters (3D table scene), the stats dashboard and the live staff screen.
// Everything here is an illustration with example numbers.
import { coasterSvg, DEFAULT_DESIGN, inkOn, type CoasterShape } from "@/lib/coaster";

const URL = "https://playatyourtable.com/v/saffron-terrace/12";

type Example = { base: string; icons: [string, string][]; iconColour: string; words: string; table: string; logo?: string; venueName?: string };
const ICON_SPOTS: [number, number][] = [[210, 380], [790, 380], [225, 575], [775, 575]];

/** One example venue's coaster: the fixed colourful rim, with their own colour, logo, icons and words. */
const coaster = (ex: Example, idPrefix: string, shape: CoasterShape = "round100") => {
  const d = {
    ...DEFAULT_DESIGN,
    shape,
    base: ex.base,
    taglineColor: inkOn(ex.base),
    tagline: ex.words,
    taglineSize: 34,
    icons: ex.icons.map(([k], i) => ({ k, x: ICON_SPOTS[i][0], y: ICON_SPOTS[i][1], s: 78, c: ex.iconColour })),
  };
  // Each inline SVG needs its own ids for the curved text, clip path and shadow.
  return coasterSvg(d, { url: URL, table: ex.table, logo: ex.logo, venueName: ex.venueName }).replace(/(arcTop|arcBottom|disc|qrShadow)/g, `${idPrefix}-$1`);
};

const SAFFRON: Example = { base: "#1A1410", icons: [["cocktail", ""], ["music", ""], ["moon", ""], ["sparkle", ""]], iconColour: "#E3A94B", words: "Welcome to the terrace", table: "12", logo: "/showcase/saffron-logo.svg" };
const OLIVE: Example = { base: "#0E4D3A", icons: [["coffee", ""], ["food", ""], ["kids", ""], ["heart", ""]], iconColour: "#F7F1E3", words: "Family brunch every Friday", table: "4", venueName: "The Olive Tree" };
const BEACH: Example = { base: "#F7F1E3", icons: [["palm", ""], ["icecream", ""], ["football", ""], ["smile", ""]], iconColour: "#12A594", words: "Sun, sea and good food", table: "9", venueName: "Beach Shack" };

/** What lies on the table, drawn to scale (size in mm), in two rows: coasters, then stickers. */
type Piece = { ex: Example; shape: CoasterShape; mm: number; label: string; size: string };
const COASTERS: Piece[] = [
  { ex: OLIVE, shape: "round100", mm: 100, label: "Round acrylic coaster", size: "100 mm" },
  { ex: BEACH, shape: "square", mm: 95, label: "Square acrylic coaster", size: "95 × 95 mm" },
];
const STICKERS: Piece[] = [
  { ex: SAFFRON, shape: "sticker", mm: 60, label: "Round sticker", size: "60 mm" },
  { ex: BEACH, shape: "squaresticker", mm: 60, label: "Square sticker", size: "60 × 60 mm" },
  { ex: OLIVE, shape: "minicircle", mm: 40, label: "Mini circle sticker", size: "40 mm" },
  { ex: SAFFRON, shape: "minisquare", mm: 40, label: "Mini square sticker", size: "40 × 40 mm" },
  { ex: SAFFRON, shape: "corner", mm: 50, label: "Corner sticker", size: "50 × 50 mm" },
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
            Fully editable in your brand colours, with your logo, icons and your own text. Choose round or square acrylic coasters, or stickers in five
            shapes and sizes, including one that fits the corner of a table. Every one keeps the colourful Play at Your Table rim so guests know there&apos;s fun to be had, and each table gets its own QR code.
          </p>
        </div>
        <div className="vg-table vg-flat">
          {[COASTERS, STICKERS].map((row, r) => (
            <div key={r} className={`vg-row${r ? " stickers" : ""}`}>
              {row.map((p, i) => (
                <figure key={p.shape} className="vg-item">
                  {p.shape === "corner" ? (
                    // Shown where it goes: tucked into the corner of a table top.
                    <span className="vg-corner" style={{ ["--mm" as string]: p.mm }}>
                      <span className="vg-piece p-corner" dangerouslySetInnerHTML={{ __html: coaster(p.ex, `s${r}${i}`, p.shape) }} />
                    </span>
                  ) : (
                    <span
                      className={`vg-piece${p.shape === "square" || p.shape === "squaresticker" || p.shape === "minisquare" ? " sq" : ""}${r ? " flat" : ""}`}
                      style={{ ["--mm" as string]: p.mm }}
                      dangerouslySetInnerHTML={{ __html: coaster(p.ex, `s${r}${i}`, p.shape) }}
                    />
                  )}
                  <figcaption>
                    <b>{p.label}</b>
                    <span>{p.size}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
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

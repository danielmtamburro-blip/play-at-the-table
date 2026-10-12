// "What venues get": printed coasters (3D table scene), the stats dashboard and the live staff screen.
// Everything here is an illustration with example numbers.
import { applyPreset, coasterSvg, DEFAULT_DESIGN, PRESETS } from "@/lib/coaster";

const URL = "https://playatthetable.netlify.app/v/saffron-terrace/12";

const coaster = (preset: string | null, opts: { table: string; logo?: string; venueName?: string }, idPrefix: string) => {
  const p = PRESETS.find((x) => x.name === preset);
  const d = p ? applyPreset(DEFAULT_DESIGN, p) : DEFAULT_DESIGN;
  // Each inline SVG needs its own ids for the curved text and clip path.
  return coasterSvg(d, { url: URL, ...opts }).replace(/(arcTop|arcBottom|disc)/g, `${idPrefix}-$1`);
};

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
          <span className="vg-tag">Printed coasters</span>
          <h3>Your brand on every table</h3>
          <p>Design them in the dashboard: move anything, pick your colours, add your logo. Every coaster opens your page for that table.</p>
        </div>
        <div className="vg-table" aria-hidden="true">
          <div className="vg-scene">
            <div className="vg-coaster c1" dangerouslySetInnerHTML={{ __html: coaster(null, { table: "12", logo: "/showcase/saffron-logo.svg" }, "c1") }} />
            <div className="vg-coaster c2" dangerouslySetInnerHTML={{ __html: coaster("Emerald", { table: "4", venueName: "The Olive Tree" }, "c2") }} />
            <div className="vg-coaster c3" dangerouslySetInnerHTML={{ __html: coaster("Coral pop", { table: "9", venueName: "Beach Shack" }, "c3") }} />
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

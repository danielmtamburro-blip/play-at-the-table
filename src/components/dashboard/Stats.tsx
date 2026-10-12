"use client";
import { useEffect, useState } from "react";
import { GAMES } from "@/lib/games";
import { getBrowserClient } from "@/lib/supabase/client";

type Report = {
  scans: number; visits: number; section_opens: number; redeems: number; offer_opens: number;
  games_started: number; games_finished: number; wifi_copies: number; directions: number; calendar_adds: number;
  pdf_opens: number; total_seconds: number; avg_seconds: number; timed_visits: number; arabic_visits: number;
  sections: { module: string; opens: number; visits: number }[];
  games: { game: string; started: number; finished: number }[];
  menu_categories: { category: string; opens: number }[];
  offers: { offer: string; opens: number; redeems: number }[];
  tables: { table: string; scans: number }[];
  by_day: { day: string; scans: number; games: number }[];
  by_hour: { hour: number; scans: number }[];
};

const SECTION_NAMES: Record<string, string> = {
  menu: "Food menu", drinks: "Drinks", events: "What's on", offers: "Offers", kids: "Kids' corner",
  group: "Play together", date: "Date night", deck: "Date-night deck",
  feedback: "Feedback", service_call: "Call server taps", service_bill: "Bill please taps",
  ...Object.fromEntries(GAMES.map((g) => [g.key, g.title.en])),
};
const gameName = (k: string) => GAMES.find((g) => g.key === k)?.title.en ?? k;

const RANGES = [
  { key: "today", label: "Today" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
] as const;

/** Start of today in Dubai (UTC+4, no DST), as a Date. */
function dubaiMidnight(daysAgo = 0) {
  const now = new Date();
  const dubai = new Date(now.getTime() + 4 * 3600_000);
  dubai.setUTCHours(0, 0, 0, 0);
  return new Date(dubai.getTime() - 4 * 3600_000 - daysAgo * 86400_000);
}

const fmtDuration = (s: number) => {
  if (!s) return "0s";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${sec}s` : `${sec}s`;
};
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

function Tile({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="stat">
      <b>{value}</b>
      <span>{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

/** Horizontal bars with the exact value beside each one (single series, one hue). */
function BarList({ rows, empty }: { rows: { label: string; value: number; note?: string }[]; empty: string }) {
  if (rows.length === 0) return <p className="muted small">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="barlist">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="barlist-label">{r.label}</span>
          <span className="barlist-track">
            <span className="barlist-bar" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="barlist-value">
            {r.value}
            {r.note && <span className="muted"> · {r.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Vertical columns with a hover/focus tooltip. */
function Columns({ cols, empty, unit }: { cols: { key: string; label: string; value: number; tip: string }[]; empty: string; unit: string }) {
  if (cols.every((c) => c.value === 0)) return <p className="muted small">{empty}</p>;
  const max = Math.max(...cols.map((c) => c.value), 1);
  return (
    <div className="cols" role="list" aria-label={unit}>
      {cols.map((c) => (
        <div key={c.key} className="col" role="listitem" tabIndex={0} aria-label={c.tip}>
          <span className="col-tip">{c.tip}</span>
          <span className="col-bar" style={{ height: `${Math.max((c.value / max) * 100, c.value ? 3 : 0)}%` }} />
          <span className="col-label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Stats({ venueId }: { venueId: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("7");
  const [r, setR] = useState<Report | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setR(null);
    setErr("");
    const from = range === "today" ? dubaiMidnight(0) : dubaiMidnight(Number(range) - 1);
    getBrowserClient()!
      .rpc("venue_report", { p_venue: venueId, p_from: from.toISOString(), p_to: new Date(Date.now() + 60_000).toISOString() })
      .then(({ data, error }) => (error ? setErr(error.message) : setR(data as Report)));
  }, [venueId, range]);

  const days = (() => {
    if (!r) return [];
    const n = range === "today" ? 1 : Number(range);
    const map = new Map(r.by_day.map((d) => [d.day, d]));
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(dubaiMidnight(n - 1 - i).getTime() + 4 * 3600_000).toISOString().slice(0, 10);
      const row = map.get(d);
      const label = new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return { key: d, label: n > 14 ? (i % 7 === 0 ? label : "") : label, value: row?.scans ?? 0, tip: `${label}: ${row?.scans ?? 0} scans, ${row?.games ?? 0} games` };
    });
  })();
  const hours = r
    ? Array.from({ length: 24 }, (_, h) => {
        const v = r.by_hour.find((x) => x.hour === h)?.scans ?? 0;
        const lab = `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
        return { key: String(h), label: h % 3 === 0 ? lab : "", value: v, tip: `${lab}: ${v} scans` };
      })
    : [];

  const gameOpens = r ? r.sections.filter((s) => GAMES.some((g) => g.key === s.module || s.module === "deck")).reduce((a, s) => a + s.opens, 0) : 0;
  const sectionOpen = (m: string) => r?.sections.find((s) => s.module === m)?.opens ?? 0;

  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h2>How guests use your page</h2>
        <div className="tabs" role="group" aria-label="Date range">
          {RANGES.map((x) => (
            <a key={x.key} href="#" aria-current={range === x.key ? "page" : undefined} onClick={(e) => (e.preventDefault(), setRange(x.key))}>
              {x.label}
            </a>
          ))}
        </div>
      </div>
      {err && <p className="status bad">{err}</p>}
      {!r && !err && <p className="muted">Loading…</p>}
      {r && (
        <>
          <h3>Visits</h3>
          <div className="stats">
            <Tile value={r.scans} label="QR scans" />
            <Tile value={r.visits} label="Visits (approx.)" sub="one per phone browser tab" />
            <Tile value={fmtDuration(r.avg_seconds)} label="Average time per visit" />
            <Tile value={fmtDuration(r.total_seconds)} label="Total time on your page" />
            <Tile value={pct(r.arabic_visits, r.visits)} label="Visits in Arabic" />
          </div>

          <h3>Clicks</h3>
          <div className="stats">
            <Tile value={sectionOpen("menu") + sectionOpen("drinks")} label="Menu & drinks opens" sub={r.pdf_opens ? `${r.pdf_opens} PDF menu opens` : undefined} />
            <Tile value={gameOpens} label="Game opens" />
            <Tile value={sectionOpen("offers")} label="Offer clicks" sub={r.offer_opens ? `${r.offer_opens} from the home banner` : undefined} />
            <Tile value={r.redeems} label="Offers shown to staff" />
            <Tile value={sectionOpen("events")} label="What's on opens" sub={r.calendar_adds ? `${r.calendar_adds} added to calendar` : undefined} />
            <Tile value={r.wifi_copies} label="Wi-Fi password copies" />
            <Tile value={r.directions} label="Directions taps" />
          </div>

          <h3>Games</h3>
          <div className="stats">
            <Tile value={r.games_started} label="Games played" />
            <Tile value={r.games_finished} label="Games finished" sub={`${pct(r.games_finished, r.games_started)} of those with an ending`} />
          </div>
          <BarList
            rows={r.games.map((g) => ({ label: gameName(g.game ?? ""), value: g.started, note: g.finished ? `${g.finished} finished` : undefined }))}
            empty="No games played in this period yet."
          />

          <div className="stats-split">
            <div>
              <h3>Most-opened sections</h3>
              <BarList
                rows={r.sections.map((s) => ({ label: SECTION_NAMES[s.module] ?? s.module, value: s.opens }))}
                empty="No sections opened yet."
              />
            </div>
            <div>
              <h3>Menu categories browsed</h3>
              <BarList rows={r.menu_categories.map((c) => ({ label: c.category ?? "–", value: c.opens }))} empty="No category taps yet." />
            </div>
            <div>
              <h3>Offers</h3>
              <BarList
                rows={r.offers.map((o) => ({ label: o.offer ?? "–", value: o.opens + o.redeems, note: `${o.redeems} shown to staff` }))}
                empty="No offer clicks yet."
              />
            </div>
            <div>
              <h3>Busiest tables</h3>
              <BarList rows={r.tables.map((t) => ({ label: `Table ${t.table}`, value: t.scans }))} empty="No table scans yet." />
            </div>
          </div>

          {days.length > 1 && (
            <>
              <h3>Scans per day</h3>
              <Columns cols={days} empty="No scans in this period yet." unit="Scans per day" />
            </>
          )}
          <h3>Busiest times of day (Dubai time)</h3>
          <Columns cols={hours} empty="No scans in this period yet." unit="Scans by hour" />

          <p className="muted small">
            Totals only. We never record who a guest is, what they answer in games or what they draw. Visits are counted per browser tab and are
            estimates, not unique people. Time is counted only while the page is on screen. Your own preview on the sales page isn&apos;t counted.
          </p>
        </>
      )}
    </section>
  );
}

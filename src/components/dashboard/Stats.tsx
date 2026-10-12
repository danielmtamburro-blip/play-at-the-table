"use client";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type StatRow = { event: string; module: string; total: number; sessions: number };

const MODULE_NAMES: Record<string, string> = {
  menu: "Food menu", drinks: "Drinks", events: "What's on", offers: "Offers", kids: "Kids' corner",
  colour: "Colouring", memory: "Memory match", quiz: "Kids' quiz", challenge: "Table challenge",
  group: "Play together", quick: "Quick questions", tot: "This or that", picker: "Party picker",
  date: "Date night", deck: "Date-night decks",
};

export default function Stats({ venueId }: { venueId: string }) {
  const [days, setDays] = useState(7);
  const [rows, setRows] = useState<StatRow[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setRows(null);
    getBrowserClient()!
      .rpc("venue_stats", { p_venue: venueId, p_days: days })
      .then(({ data, error }) => {
        if (error) setErr(error.message);
        else setRows((data ?? []).map((r: any) => ({ ...r, total: Number(r.total), sessions: Number(r.sessions) })));
      });
  }, [venueId, days]);

  const sum = (ev: string, field: "total" | "sessions") => (rows ?? []).filter((r) => r.event === ev).reduce((a, r) => a + r[field], 0);
  const views = (rows ?? []).filter((r) => r.event === "view").sort((a, b) => b.total - a.total);

  return (
    <section className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <h2>How guests use your page</h2>
        <div className="tabs" role="group">
          {[7, 30, 90].map((d) => (
            <a
              key={d}
              href="#"
              aria-current={days === d ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                setDays(d);
              }}
            >
              {d} days
            </a>
          ))}
        </div>
      </div>
      {err && <p className="status bad">{err}</p>}
      {!rows && !err && <p className="muted">Loading…</p>}
      {rows && (
        <>
          <div className="stats">
            <div className="stat"><b>{sum("scan", "total")}</b><span>QR scans</span></div>
            <div className="stat"><b>{sum("view", "total")}</b><span>Section opens</span></div>
            <div className="stat"><b>{sum("redeem", "total")}</b><span>Offers shown to staff</span></div>
          </div>
          {views.length > 0 ? (
            <table className="simple">
              <thead>
                <tr><th>Section</th><th className="num">Opens</th><th className="num">Visits (approx.)</th></tr>
              </thead>
              <tbody>
                {views.map((r) => (
                  <tr key={r.module}>
                    <td>{MODULE_NAMES[r.module] ?? r.module}</td>
                    <td className="num">{r.total}</td>
                    <td className="num">{r.sessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted small">No guest activity in this period yet.</p>
          )}
          <p className="muted small">Totals only. Visits are counted per browser tab and are estimates, not unique people. Your own preview on the sales page isn&apos;t counted.</p>
        </>
      )}
    </section>
  );
}

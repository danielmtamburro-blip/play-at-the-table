"use client";
import { useEffect, useState } from "react";
import { GAMES } from "@/lib/games";
import { SCORED } from "@/lib/leaderboard";
import { getBrowserClient } from "@/lib/supabase/client";

type Row = { id: string; game: string; nickname: string; score: number; table_label: string | null; created_at: string };

export default function ScoresTab({ venueId }: { venueId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    getBrowserClient()!
      .from("scores")
      .select("id, game, nickname, score, table_label, created_at")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => (error ? setErr(error.message) : setRows(data as Row[])));
  }, [venueId, reload]);

  async function remove(r: Row) {
    if (!confirm(`Remove "${r.nickname}" from the leaderboards? This can't be undone.`)) return;
    const { error } = await getBrowserClient()!.from("scores").delete().eq("id", r.id);
    if (error) setErr(error.message);
    else setReload((n) => n + 1);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Leaderboards</h2>
          <p className="muted small">
            Guests who make today&apos;s or the all-time top 10 can add a nickname. Rude names are blocked automatically; if one slips through, remove it here.
            Today&apos;s boards reset at midnight (Dubai time).
          </p>
        </div>
      </div>
      {err && <p className="status bad">{err}</p>}
      {!rows && !err && <p className="muted">Loading…</p>}
      {rows && rows.length === 0 && <p className="muted small">No scores yet. They&apos;ll appear here as guests play.</p>}
      {rows && rows.length > 0 && (
        <div className="row-list">
          {rows.map((r) => (
            <div key={r.id} className="comment">
              <div style={{ flex: 1, minWidth: 0 }}>
                <p>
                  <b>{r.nickname}</b> · {SCORED[r.game]?.unit.en(r.score) ?? r.score}
                </p>
                <span className="small muted">
                  {GAMES.find((g) => g.key === r.game)?.title.en ?? r.game}
                  {r.table_label ? ` · Table ${r.table_label}` : ""} ·{" "}
                  {new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" })}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(r)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

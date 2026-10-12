"use client";
import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type Report = {
  count: number;
  average: number | null;
  by_rating: Record<string, number>;
  recent: { id: string; rating: number; comment: string; table_label: string | null; created_at: string }[];
};

const FACES = ["😞", "🙁", "😐", "🙂", "😍"];
const LABELS = ["Bad", "Not great", "OK", "Good", "Loved it"];
const RANGES = [7, 30, 90, 365] as const;

export default function FeedbackTab({ venueId, enabled }: { venueId: string; enabled: boolean }) {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [r, setR] = useState<Report | null>(null);
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    setR(null);
    getBrowserClient()!
      .rpc("venue_feedback", {
        p_venue: venueId,
        p_from: new Date(Date.now() - days * 86400_000).toISOString(),
        p_to: new Date(Date.now() + 60_000).toISOString(),
      })
      .then(({ data, error }) => (error ? setErr(error.message) : setR(data as Report)));
  }, [venueId, days, reload]);

  async function remove(id: string) {
    if (!confirm("Delete this comment? This can't be undone.")) return;
    const { error } = await getBrowserClient()!.from("feedback").delete().eq("id", id);
    if (error) setErr(error.message);
    else setReload((n) => n + 1);
  }

  const max = r ? Math.max(1, ...Object.values(r.by_rating)) : 1;
  const avgFace = r?.average ? FACES[Math.min(4, Math.max(0, Math.round(r.average) - 1))] : "–";

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Guest feedback</h2>
          <p className="muted small">Guests tap an emoji and can add a comment. It&apos;s anonymous: you see what they said, never who said it.</p>
        </div>
        <div className="tabs" role="group" aria-label="Date range">
          {RANGES.map((d) => (
            <a key={d} href="#" aria-current={days === d ? "page" : undefined} onClick={(e) => (e.preventDefault(), setDays(d))}>
              {d === 365 ? "1 year" : `${d} days`}
            </a>
          ))}
        </div>
      </div>
      {!enabled && (
        <p className="status bad">
          Feedback is switched off, so guests can&apos;t see the Feedback button. Turn it on under <a href="?tab=details">Details → Sections guests can see</a>.
        </p>
      )}
      {err && <p className="status bad">{err}</p>}
      {!r && !err && <p className="muted">Loading…</p>}
      {r && (
        <>
          <div className="stats">
            <div className="stat">
              <b>
                {avgFace} {r.average ?? "–"}
              </b>
              <span>Average score (out of 5)</span>
            </div>
            <div className="stat">
              <b>{r.count}</b>
              <span>Ratings</span>
            </div>
            <div className="stat">
              <b>{r.recent.length}</b>
              <span>Comments</span>
            </div>
          </div>

          <ul className="barlist">
            {[5, 4, 3, 2, 1].map((n) => {
              const v = r.by_rating[String(n)] ?? 0;
              return (
                <li key={n}>
                  <span className="barlist-label">
                    {FACES[n - 1]} {LABELS[n - 1]}
                  </span>
                  <span className="barlist-track">
                    <span className="barlist-bar" style={{ width: `${(v / max) * 100}%` }} />
                  </span>
                  <span className="barlist-value">{v}</span>
                </li>
              );
            })}
          </ul>

          <h3>What guests said</h3>
          {r.recent.length === 0 ? (
            <p className="muted small">No comments in this period yet.</p>
          ) : (
            <div className="row-list">
              {r.recent.map((c) => (
                <div key={c.id} className="comment">
                  <span className="comment-face" aria-label={LABELS[c.rating - 1]}>
                    {FACES[c.rating - 1]}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p>{c.comment}</p>
                    <span className="small muted">
                      {c.table_label ? `Table ${c.table_label} · ` : ""}
                      {new Date(c.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" })}
                    </span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => remove(c.id)} aria-label="Delete comment">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

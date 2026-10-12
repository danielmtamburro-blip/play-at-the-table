"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

type Req = { id: string; table_label: string; kind: "server" | "bill"; status: "open" | "done"; created_at: string; done_at: string | null };

const ago = (iso: string, now: number) => {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.floor(s / 60)} min ago` : `${Math.floor(s / 3600)} h ago`;
};

/** A short two-tone chime (no audio file needed). */
function chime() {
  try {
    const ctx = new AudioContext();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.32);
    });
  } catch {}
}

/** Live staff screen: open "Call server" and "Bill please" requests, updated in real time. */
export default function StaffRequests({ venueId, enabled }: { venueId: string; enabled: boolean }) {
  const [rows, setRows] = useState<Req[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [sound, setSound] = useState(true);
  const [live, setLive] = useState(false);
  const seen = useRef<Set<string> | null>(null);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const boxRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 12 * 3600_000).toISOString();
    const { data } = await getBrowserClient()!
      .from("service_requests")
      .select("*")
      .eq("venue_id", venueId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(100);
    const list = (data ?? []) as Req[];
    const openIds = list.filter((r) => r.status === "open").map((r) => r.id);
    if (seen.current && soundRef.current && openIds.some((id) => !seen.current!.has(id))) chime();
    seen.current = new Set(openIds);
    setRows(list);
  }, [venueId]);

  useEffect(() => {
    load();
    const sb = getBrowserClient()!;
    const ch = sb
      .channel(`service-${venueId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests", filter: `venue_id=eq.${venueId}` }, () => load())
      .subscribe((s) => setLive(s === "SUBSCRIBED"));
    const poll = setInterval(load, 15_000); // safety net if the live connection drops
    const tick = setInterval(() => setNow(Date.now()), 5_000);
    return () => {
      sb.removeChannel(ch);
      clearInterval(poll);
      clearInterval(tick);
    };
  }, [venueId, load]);

  async function done(id: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: "done", done_at: new Date().toISOString() } : r)));
    await getBrowserClient()!.from("service_requests").update({ status: "done", done_at: new Date().toISOString() }).eq("id", id);
    load();
  }

  const open = rows.filter((r) => r.status === "open").sort((a, b) => a.created_at.localeCompare(b.created_at));
  const finished = rows.filter((r) => r.status === "done").slice(0, 10);

  return (
    <section className="panel staff" ref={boxRef}>
      <div className="panel-head">
        <div>
          <h2>Live requests</h2>
          <p className="muted small">
            Keep this open on a tablet or phone at the bar. New requests appear instantly{sound ? " with a chime" : ""}.{" "}
            <span className={`live-dot${live ? " on" : ""}`}>{live ? "Live" : "Connecting…"}</span>
          </p>
        </div>
        <div className="g-row">
          <button className="btn btn-ghost btn-sm" onClick={() => (setSound(!sound), !sound && chime())}>
            {sound ? "🔔 Sound on" : "🔕 Sound off"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => boxRef.current?.requestFullscreen?.()}>
            ⛶ Full screen
          </button>
        </div>
      </div>
      {!enabled && (
        <p className="status bad">
          The Call server and Bill please buttons are switched off, so guests can&apos;t see them. Turn them on under{" "}
          <a href="?tab=details">Details → Sections guests can see</a>.
        </p>
      )}

      {open.length === 0 ? (
        <div className="staff-empty">
          <span aria-hidden="true">✓</span>
          <p>No tables waiting right now.</p>
        </div>
      ) : (
        <div className="staff-grid">
          {open.map((r) => (
            <div key={r.id} className={`staff-card ${r.kind}`}>
              <span className="staff-kind">{r.kind === "bill" ? "🧾 Bill please" : "🙋 Call server"}</span>
              <b className="staff-table">Table {r.table_label}</b>
              <span className="small">{ago(r.created_at, now)}</span>
              <button className="btn btn-primary" onClick={() => done(r.id)}>
                Done
              </button>
            </div>
          ))}
        </div>
      )}

      {finished.length > 0 && (
        <>
          <h3>Recently done</h3>
          <table className="simple">
            <tbody>
              {finished.map((r) => (
                <tr key={r.id}>
                  <td>Table {r.table_label}</td>
                  <td>{r.kind === "bill" ? "Bill" : "Server"}</td>
                  <td className="num muted">{ago(r.created_at, now)}</td>
                  <td className="num muted">
                    {r.done_at ? `answered in ${Math.max(1, Math.round((new Date(r.done_at).getTime() - new Date(r.created_at).getTime()) / 60000))} min` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

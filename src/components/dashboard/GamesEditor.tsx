"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GAMES, GROUP_LABEL, gameOn, type GameGroup } from "@/lib/games";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Row } from "./CrudList";

export default function GamesEditor({ venue }: { venue: Row }) {
  const router = useRouter();
  const [games, setGames] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GAMES.map((g) => [g.key, gameOn(venue.games, g.key)])),
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const groups: GameGroup[] = ["kids", "group", "date"];
  const setGroup = (grp: GameGroup, on: boolean) =>
    setGames((s) => ({ ...s, ...Object.fromEntries(GAMES.filter((g) => g.group === grp).map((g) => [g.key, on])) }));

  async function save() {
    setBusy(true);
    // Store only the hidden ones, so new games we add later appear switched on.
    // _saved marks the setup step as done even when every game is left on.
    const hidden = Object.fromEntries(Object.entries(games).filter(([, on]) => !on).map(([k]) => [k, false]));
    const { error } = await getBrowserClient()!.from("venues").update({ games: { ...hidden, _saved: true } }).eq("id", venue.id);
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Saved. Guests will see your choice within a minute." });
    if (!error) router.refresh();
  }

  return (
    <section className="panel">
      <h2>Games</h2>
      <p className="muted small">
        Tick the games guests can play. Untick any you don&apos;t want; they&apos;re hidden, not deleted, so you can bring them back any time. If you
        untick every game in a section, that section disappears from your guest page.
      </p>
      {groups.map((grp) => {
        const list = GAMES.filter((g) => g.group === grp);
        const onCount = list.filter((g) => games[g.key]).length;
        return (
          <div key={grp} className="game-group">
            <div className="game-group-head">
              <h3>
                {GROUP_LABEL[grp]} <span className="muted small">· {onCount} of {list.length} on</span>
              </h3>
              <div className="g-row">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGroup(grp, true)}>
                  All on
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGroup(grp, false)}>
                  All off
                </button>
              </div>
            </div>
            <div className="game-list">
              {list.map((g) => (
                <label key={g.key} className={`game-card${games[g.key] ? " on" : ""}`}>
                  <input type="checkbox" checked={games[g.key]} onChange={(e) => setGames({ ...games, [g.key]: e.target.checked })} />
                  <span>
                    <b>{g.name}</b>
                    {g.ages && <span className="badge" style={{ marginInlineStart: 8 }}>Ages {g.ages}</span>}
                    <br />
                    <span className="small muted">{g.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <p className="small muted">
        To hide a whole section, such as Date night for a family lunch spot, you can also untick it under Details → Sections guests can see.
      </p>
      <div className="g-row" style={{ alignItems: "center" }}>
        <button className="btn btn-primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save games"}
        </button>
        {msg && <span className={`status ${msg.ok ? "ok" : "bad"}`}>{msg.text}</span>}
      </div>
    </section>
  );
}

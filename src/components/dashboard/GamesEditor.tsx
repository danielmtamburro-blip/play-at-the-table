"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATS, drinkAge, GAMES, GROUP_LABEL, gameOn, KIDS_BANDS, type GameCat, type GameGroup, type GameInfo } from "@/lib/games";
import { getBrowserClient } from "@/lib/supabase/client";
import { moduleOn } from "@/lib/types";
import type { Row } from "./CrudList";

export default function GamesEditor({ venue }: { venue: Row }) {
  const router = useRouter();
  const [games, setGames] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GAMES.map((g) => [g.key, gameOn(venue.games, g.key)])),
  );
  const [drinkOn, setDrinkOn] = useState(() => moduleOn(venue.modules, "drink"));
  const [age, setAge] = useState<18 | 21>(() => drinkAge(venue.games));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const groups: GameGroup[] = ["kids", "group", "date", "drink"];
  const setGroup = (grp: GameGroup, on: boolean) =>
    setGames((s) => ({ ...s, ...Object.fromEntries(GAMES.filter((g) => g.group === grp).map((g) => [g.key, on])) }));

  async function save() {
    setBusy(true);
    // Store only the hidden ones, so new games we add later appear switched on.
    // _saved marks the setup step as done even when every game is left on.
    const hidden = Object.fromEntries(Object.entries(games).filter(([, on]) => !on).map(([k]) => [k, false]));
    const { error } = await getBrowserClient()!
      .from("venues")
      .update({ games: { ...hidden, _saved: true, _drinkAge: age }, modules: { ...(venue.modules ?? {}), drink: drinkOn } })
      .eq("id", venue.id);
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Saved. Guests will see your choice within a minute." });
    if (!error) router.refresh();
  }

  const card = (g: GameInfo) => (
    <label key={g.key} className={`game-card${games[g.key] ? " on" : ""}`}>
      <input type="checkbox" checked={games[g.key]} onChange={(e) => setGames({ ...games, [g.key]: e.target.checked })} />
      <span>
        <b>
          {g.icon ? `${g.icon} ` : ""}
          {g.title.en}
        </b>
        {g.ages && <span className="badge" style={{ marginInlineStart: 8 }}>Ages {g.ages}</span>}
        <br />
        <span className="small muted">{g.sub.en}</span>
      </span>
    </label>
  );

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
            {grp === "drink" && (
              <div className="drink-settings">
                <label className="cd-toggle">
                  <input type="checkbox" checked={drinkOn} onChange={(e) => setDrinkOn(e.target.checked)} />
                  <span className="cd-toggle-ui" aria-hidden="true" />
                  <span>
                    <b>Show drinking games to guests</b>
                    <span className="small muted">Off by default. Guests must confirm their age before playing.</span>
                  </span>
                </label>
                <div className="field" style={{ maxWidth: 260 }}>
                  <label htmlFor="drink-age">Minimum age</label>
                  <select id="drink-age" value={age} onChange={(e) => setAge(Number(e.target.value) === 18 ? 18 : 21)}>
                    <option value={21}>21+ (UAE)</option>
                    <option value={18}>18+ (UK)</option>
                  </select>
                </div>
                <p className="small muted">
                  Every card is sip-based (no downing or racing), and reminds guests that a mocktail or water counts. Check this suits your licence
                  and local rules before switching it on.
                </p>
              </div>
            )}
            {grp === "kids" ? (
              KIDS_BANDS.map(({ band, label }) => (
                <div key={band} className="game-band">
                  <h4>{label.en}</h4>
                  <div className="game-list">{list.filter((g) => g.band === band).map(card)}</div>
                </div>
              ))
            ) : grp === "group" || grp === "drink" ? (
              (Object.keys(CATS) as GameCat[]).map((c) => {
                const inCat = list.filter((g) => g.cat === c);
                if (!inCat.length) return null;
                return (
                  <div key={c} className="game-band" style={grp === "drink" && !drinkOn ? { opacity: 0.55 } : undefined}>
                    <h4>{CATS[c].en}</h4>
                    <div className="game-list">{inCat.map(card)}</div>
                  </div>
                );
              })
            ) : (
              <div className="game-list">{list.map(card)}</div>
            )}
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

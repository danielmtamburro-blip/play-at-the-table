"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { MODULE_KEYS, type ModuleKey } from "@/lib/types";
import type { Row } from "./CrudList";

const MODULE_LABELS: Record<ModuleKey, string> = {
  menu: "Food menu",
  drinks: "Drinks",
  kids: "Kids' corner",
  group: "Play together",
  date: "Date night",
  events: "What's on",
  offers: "Offers",
};

const TEXT_FIELDS: [key: string, label: string, rtl?: boolean][] = [
  ["name_en", "Venue name (English)"],
  ["name_ar", "Venue name (Arabic)", true],
  ["area_en", "Area (English)"],
  ["area_ar", "Area (Arabic)", true],
  ["hours_en", "Opening hours (English)"],
  ["hours_ar", "Opening hours (Arabic)", true],
  ["access_en", "Accessibility & parking (English)"],
  ["access_ar", "Accessibility & parking (Arabic)", true],
  ["wifi_ssid", "Wi-Fi network"],
  ["wifi_pass", "Wi-Fi password"],
  ["phone", "Phone"],
  ["maps_url", "Google Maps link"],
  ["allergy_note_en", "Allergy note (English, optional)"],
  ["allergy_note_ar", "Allergy note (Arabic, optional)", true],
];

export default function ProfileForm({ venue }: { venue: Row }) {
  const router = useRouter();
  const [v, setV] = useState<Row>(venue);
  const [modules, setModules] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MODULE_KEYS.map((k) => [k, venue.modules?.[k] !== false])),
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const patch: Row = Object.fromEntries(TEXT_FIELDS.map(([k]) => [k, String(v[k] ?? "").trim()]));
    patch.brand_color = v.brand_color;
    patch.published = Boolean(v.published);
    patch.modules = modules;
    const { error } = await getBrowserClient()!.from("venues").update(patch).eq("id", venue.id);
    setBusy(false);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Saved. Live on the guest page within a minute." });
    if (!error) router.refresh();
  }

  return (
    <form className="panel" onSubmit={save}>
      <h2>Venue details</h2>
      <label className="check" style={{ fontWeight: 600 }}>
        <input type="checkbox" checked={Boolean(v.published)} onChange={(e) => setV({ ...v, published: e.target.checked })} />
        Page is live (guests can open it)
      </label>
      <div className="grid2">
        {TEXT_FIELDS.map(([k, label, rtl]) => (
          <div key={k} className="field">
            <label htmlFor={`vf-${k}`}>{label}</label>
            <input
              id={`vf-${k}`}
              dir={rtl ? "rtl" : undefined}
              required={k === "name_en"}
              value={v[k] ?? ""}
              onChange={(e) => setV({ ...v, [k]: e.target.value })}
            />
          </div>
        ))}
        <div className="field">
          <label htmlFor="vf-color">Brand colour</label>
          <input id="vf-color" type="color" value={v.brand_color ?? "#FF5A4E"} onChange={(e) => setV({ ...v, brand_color: e.target.value.toUpperCase() })} />
        </div>
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, marginBottom: 8 }}>Sections guests can see</legend>
        <div className="checks">
          {MODULE_KEYS.map((k) => (
            <label key={k} className="check">
              <input type="checkbox" checked={modules[k]} onChange={(e) => setModules({ ...modules, [k]: e.target.checked })} />
              {MODULE_LABELS[k]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="g-row" style={{ alignItems: "center" }}>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save details"}
        </button>
        {msg && <span className={`status ${msg.ok ? "ok" : "bad"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

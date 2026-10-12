"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { arabicPairs, useAutoArabic } from "@/lib/autoArabic";
import { getBrowserClient } from "@/lib/supabase/client";
import ArabicLabel from "./ArabicLabel";
import LogoUploader from "./LogoUploader";
import { MODULE_KEYS, moduleOn, type ModuleKey } from "@/lib/types";
import type { Row } from "./CrudList";

const MODULE_LABELS: Record<ModuleKey, string> = {
  menu: "Food menu",
  drinks: "Drinks",
  kids: "Kids' corner",
  group: "Adult games",
  date: "Date night",
  celebrate: "Celebrations (birthdays, anniversaries…)",
  events: "What's on",
  offers: "Offers",
  nearby: "Things to do nearby",
  drink: "Drinking games (age-checked)",
  versus: "Challenge another table",
  feedback: "Guest feedback",
  service: "Call server / Bill please buttons",
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
    Object.fromEntries(MODULE_KEYS.map((k) => [k, moduleOn(venue.modules, k)])),
  );
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const ar = useAutoArabic(v, (k, val) => setV((p) => ({ ...p, [k]: val })), arabicPairs(TEXT_FIELDS.map(([k]) => k)));

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
      <LogoUploader venueId={venue.id} logoUrl={venue.logo_url ?? ""} />
      <p className="small muted">✨ Type in English and the Arabic fills itself in. You can edit the Arabic any time.</p>
      <div className="grid2">
        {TEXT_FIELDS.map(([k, label, rtl]) => {
          const base = k.replace(/_(en|ar)$/, "");
          return (
            <div key={k} className="field">
              {rtl ? (
                <ArabicLabel htmlFor={`vf-${k}`} label={label} busy={ar.busy.has(base)} onTranslate={() => ar.now(base)} />
              ) : (
                <label htmlFor={`vf-${k}`}>{label}</label>
              )}
              <input
                id={`vf-${k}`}
                dir={rtl ? "rtl" : undefined}
                required={k === "name_en"}
                value={v[k] ?? ""}
                onChange={(e) => {
                  if (rtl) ar.manual(k);
                  setV({ ...v, [k]: e.target.value });
                }}
              />
            </div>
          );
        })}
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

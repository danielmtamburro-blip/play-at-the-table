"use client";
// "See it with your venue": type a name, pick a colour and add a logo; the phone updates live.
// The logo stays in the visitor's browser. Nothing is uploaded or saved.
import { useMemo, useState } from "react";
import GuestApp from "@/components/guest/GuestApp";
import type { GuestTheme } from "@/lib/theme";
import type { Venue } from "@/lib/types";

const COLOURS = ["#E3A94B", "#FF5A4E", "#12A594", "#6E4BFF", "#F0457F", "#0A84B5", "#2E7D4F", "#1B1740"];

export default function YourVenue({ base }: { base: Venue }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [colour, setColour] = useState("#FF5A4E");
  const [dark, setDark] = useState(false);
  const [logo, setLogo] = useState("");
  // On phones the form shows one step at a time, right under the phone, so both fit on screen.
  const [step, setStep] = useState<"name" | "colour" | "look" | "logo">("name");
  const on = (k: typeof step) => (step === k ? " on" : "");

  const venue: Venue = useMemo(() => {
    const theme: GuestTheme = dark
      ? { bg: "#14110F", card: "#221C18", text: "#F7F1EA", accent: colour, bgImage: "", dim: 55, tiles: "colourful", cover: "venue" }
      : { bg: "#F7F5F2", card: "#FFFFFF", text: "#1E1A16", accent: colour, bgImage: "", dim: 55, tiles: "colourful", cover: "venue" };
    const n = name.trim() || "Your Venue";
    return {
      ...base,
      name: { en: n, ar: n },
      area: { en: area.trim() || "Dubai", ar: area.trim() || "دبي" },
      brandColor: colour,
      logoUrl: logo,
      coverUrl: "",
      theme,
    };
  }, [base, name, area, colour, dark, logo]);

  function onLogo(f: File | undefined) {
    if (!f || !f.type.startsWith("image/") || f.size > 5_000_000) return;
    const r = new FileReader();
    r.onload = () => setLogo(String(r.result));
    r.readAsDataURL(f);
  }

  return (
    <div className="yv">
      <form className="yv-form" onSubmit={(e) => e.preventDefault()}>
        <div className="yv-steps" role="tablist" aria-label="Customise">
          {(
            [
              ["name", "1. Name"],
              ["colour", "2. Colour"],
              ["look", "3. Look"],
              ["logo", "4. Logo"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={step === k} onClick={() => setStep(k)}>
              {label}
            </button>
          ))}
        </div>
        <label className={`yv-field${on("name")}`}>
          <span>Venue name</span>
          <input value={name} maxLength={32} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Olive Tree" />
        </label>
        <label className={`yv-field${on("name")}`}>
          <span>Area</span>
          <input value={area} maxLength={32} onChange={(e) => setArea(e.target.value)} placeholder="e.g. JLT · Dubai" />
        </label>
        <fieldset className={`yv-field${on("colour")}`}>
          <legend>Brand colour</legend>
          <div className="yv-swatches">
            {COLOURS.map((c) => (
              <button key={c} type="button" aria-label={c} aria-pressed={colour === c} style={{ background: c }} onClick={() => setColour(c)} />
            ))}
            <label className="yv-custom" title="Pick any colour">
              <input type="color" value={colour} onChange={(e) => setColour(e.target.value)} aria-label="Custom colour" />
              <span aria-hidden="true">+</span>
            </label>
          </div>
        </fieldset>
        <fieldset className={`yv-field${on("look")}`}>
          <legend>Look</legend>
          <div className="yv-seg">
            <button type="button" aria-pressed={!dark} onClick={() => setDark(false)}>
              ☀️ Light
            </button>
            <button type="button" aria-pressed={dark} onClick={() => setDark(true)}>
              🌙 Dark
            </button>
          </div>
        </fieldset>
        <label className={`yv-field yv-logo${on("logo")}`}>
          <span>Your logo (optional)</span>
          <input type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} />
          <small>It stays on your device. Nothing is uploaded.</small>
        </label>
        {logo && (
          <button type="button" className={`yv-clear${on("logo")}`} onClick={() => setLogo("")}>
            Remove logo
          </button>
        )}
      </form>
      <div className="phone-stage">
        <div className="phone">
          <div className="phone-screen">
            <GuestApp venue={venue} table="7" embedded />
          </div>
        </div>
        <p className="phone-note">Tap around: it&apos;s the real guest page with your name and colours.</p>
      </div>
    </div>
  );
}

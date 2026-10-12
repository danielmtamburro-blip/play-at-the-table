// How the guest page looks for a venue. Empty theme = Play at Your Table's own colours.
import type { CSSProperties } from "react";
import { contrast } from "./coaster";

export type GuestTheme = {
  bg: string; // page background
  card: string; // header, cards and panels
  text: string; // main text
  accent: string; // buttons and highlights
  bgImage: string; // optional background picture (public URL)
  dim: number; // 0–90: how strongly the background colour sits over the picture
  tiles: "colourful" | "brand"; // home tiles: our colourful pastels, or tints of the accent colour
};

export const THEME_PRESETS: { name: string; theme: Partial<GuestTheme> | null }[] = [
  { name: "Play at Your Table", theme: null },
  { name: "Midnight", theme: { bg: "#14122B", card: "#221F45", text: "#F3F0FF", accent: "#FFB51F" } },
  { name: "Sand & gold", theme: { bg: "#F6EFE4", card: "#FFFDF8", text: "#2B2118", accent: "#B8862B" } },
  { name: "Ocean", theme: { bg: "#EAF6FB", card: "#FFFFFF", text: "#0B2E40", accent: "#0A84B5" } },
  { name: "Forest", theme: { bg: "#EEF4EE", card: "#FFFFFF", text: "#17301F", accent: "#2E7D4F" } },
  { name: "Blush", theme: { bg: "#FFF1F4", card: "#FFFFFF", text: "#3A1822", accent: "#D6336C" } },
  { name: "Charcoal & coral", theme: { bg: "#1E1E22", card: "#2A2A30", text: "#F5F5F7", accent: "#FF5A4E" } },
  { name: "Black & gold", theme: { bg: "#0E0E0E", card: "#1A1A1A", text: "#F7F1E3", accent: "#D9B262" } },
];

export const BASE_THEME: GuestTheme = { bg: "#F6F4FF", card: "#FFFFFF", text: "#1B1740", accent: "#1B1740", bgImage: "", dim: 55, tiles: "colourful" };

const hex = (v: unknown, f: string) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : f);

/** null when the venue uses the default look. */
export function normaliseTheme(raw: unknown): GuestTheme | null {
  if (!raw || typeof raw !== "object" || !Object.keys(raw).length) return null;
  const r = raw as Record<string, unknown>;
  return {
    bg: hex(r.bg, BASE_THEME.bg),
    card: hex(r.card, BASE_THEME.card),
    text: hex(r.text, BASE_THEME.text),
    accent: hex(r.accent, BASE_THEME.accent),
    bgImage: typeof r.bgImage === "string" && /^https:\/\//.test(r.bgImage) ? r.bgImage : "",
    dim: typeof r.dim === "number" ? Math.min(90, Math.max(0, Math.round(r.dim))) : BASE_THEME.dim,
    tiles: r.tiles === "brand" ? "brand" : "colourful",
  };
}

/** Readable text colour on top of a colour. */
export const onColour = (c: string) => (contrast(c, "#FFFFFF") >= contrast(c, "#14122B") ? "#FFFFFF" : "#14122B");

/** CSS custom properties for the guest app root. Overrides the app's light/dark palette. */
export function themeStyle(t: GuestTheme | null): CSSProperties | undefined {
  if (!t) return undefined;
  const mix = (a: string, b: string, p: number) => `color-mix(in srgb, ${a} ${p}%, ${b})`;
  const style: Record<string, string> = {
    "--bg": t.bg,
    "--surface": t.card,
    "--surface-2": mix(t.text, t.card, 7),
    "--line": mix(t.text, t.card, 15),
    "--ink": t.text,
    "--muted": mix(t.text, t.card, 62),
    "--violet": t.accent,
    "--g-accent": t.accent,
    "--g-on-accent": onColour(t.accent),
    "--g-tile-b": mix(t.accent, t.card, 72),
    colorScheme: onColour(t.bg) === "#FFFFFF" ? "dark" : "light",
  };
  if (t.bgImage) {
    style.backgroundImage = `linear-gradient(${mix(t.bg, "transparent", t.dim)}, ${mix(t.bg, "transparent", t.dim)}), url("${t.bgImage}")`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
    style.backgroundAttachment = "fixed";
  }
  return style as CSSProperties;
}

/** Warnings for the dashboard if a combination would be hard to read. */
export function themeWarnings(t: GuestTheme): string[] {
  const w: string[] = [];
  if (contrast(t.text, t.bg) < 4.5) w.push("The text colour is hard to read on the background colour.");
  if (contrast(t.text, t.card) < 4.5) w.push("The text colour is hard to read on the card colour.");
  if (t.bgImage && t.dim < 35) w.push("With a busy picture, a stronger overlay keeps text readable.");
  return w;
}

"use client";
import { useId } from "react";
// The Play at Your Table cover: our ring logo artwork, in our five colours or recoloured to the venue's brand.
const BRAND = ["#FFB51F", "#12A594", "#6E4BFF", "#F0457F", "#FF5A4E"];

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
/** Mix colour a with b; t = share of b (0–1). */
const mix = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const valid = (c?: string) => (c && /^#[0-9a-fA-F]{6}$/.test(c) ? c : "#6E4BFF");

/** Ring segment path (degrees, 0 = right, clockwise). */
function seg(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${(cx + r * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(cy + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
  return `M${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r2, a1)}A${r2} ${r2} 0 0 0 ${p(r2, a0)}z`;
}

function Ring({ cx, cy, r, colours, opacity = 1, play = true }: { cx: number; cy: number; r: number; colours: string[]; opacity?: number; play?: boolean }) {
  const inner = r * 0.6;
  return (
    <g opacity={opacity}>
      {colours.map((c, i) => (
        <path key={i} d={seg(cx, cy, r, inner, -90 + i * 72, -18 + i * 72)} fill={c} />
      ))}
      <circle cx={cx} cy={cy} r={inner} fill="#FFFFFF" fillOpacity="0.14" />
      {play && <path d={`M${cx - inner * 0.28} ${cy - inner * 0.42}v${inner * 0.84}l${inner * 0.72} -${inner * 0.42}z`} fill="#FFFFFF" fillOpacity="0.85" />}
    </g>
  );
}

export default function BrandCover({ accent, mode }: { accent?: string; mode: "venue" | "brand" }) {
  const a = valid(accent);
  const colours = mode === "brand" ? BRAND : [mix(a, "#FFFFFF", 0.45), mix(a, "#FFFFFF", 0.2), a, mix(a, "#000000", 0.25), mix(a, "#FFFFFF", 0.65)];
  const [bg1, bg2] = mode === "brand" ? ["#2D2566", "#14102F"] : [mix(a, "#000000", 0.35), mix(a, "#000000", 0.7)];
  const id = useId().replace(/:/g, "");
  return (
    <svg className="brand-cover" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`bc-bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg1} />
          <stop offset="1" stopColor={bg2} />
        </linearGradient>
        <radialGradient id={`bc-glow-${id}`} cx="0.78" cy="0.45" r="0.6">
          <stop offset="0" stopColor={colours[2]} stopOpacity="0.45" />
          <stop offset="1" stopColor={colours[2]} stopOpacity="0" />
        </radialGradient>
        <pattern id={`bc-dots-${id}`} width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="#FFFFFF" fillOpacity="0.09" />
        </pattern>
      </defs>
      <rect width="1200" height="600" fill={`url(#bc-bg-${id})`} />
      <rect width="1200" height="600" fill={`url(#bc-dots-${id})`} />
      <rect width="1200" height="600" fill={`url(#bc-glow-${id})`} />
      <Ring cx={930} cy={300} r={300} colours={colours} />
      <Ring cx={150} cy={140} r={78} colours={colours} opacity={0.35} play={false} />
      <Ring cx={420} cy={500} r={52} colours={colours} opacity={0.28} play={false} />
      <Ring cx={600} cy={110} r={34} colours={colours} opacity={0.4} play={false} />
      <circle cx="300" cy="300" r="7" fill={colours[0]} fillOpacity="0.7" />
      <circle cx="520" cy="260" r="5" fill={colours[4]} fillOpacity="0.7" />
      <circle cx="80" cy="460" r="6" fill={colours[1]} fillOpacity="0.6" />
    </svg>
  );
}

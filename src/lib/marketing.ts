// Marketing kit: posters, table cards, a window sticker and a social post, drawn as SVG in the venue's own colours.
// Print pieces are laid out in tenths of a millimetre (1 unit = 0.1 mm).
import { contrast, ICONS, mark, qrPath } from "./coaster";

export type KitStyle = "bold" | "light" | "dark";
export type KitPoint = { icon: string; text: string };
export type Kit = { headline: string; sub: string; points: KitPoint[]; cta: string; footer: string; style: KitStyle; accent: string; showLogo: boolean };
export type Piece = "poster" | "card" | "sticker" | "social";

export const PIECES: { k: Piece; title: string; size: string; note: string; w: number; h: number; mm: boolean }[] = [
  { k: "poster", title: "Poster", size: "A4 · 210 × 297 mm", note: "Entrance, toilets, the bar, the kids' corner", w: 2100, h: 2970, mm: true },
  { k: "card", title: "Table card", size: "A6 · 105 × 148 mm", note: "One per table in a stand, each with its own QR", w: 1050, h: 1480, mm: true },
  { k: "sticker", title: "Window sticker", size: "Round · 150 mm", note: "Front window or the door", w: 1500, h: 1500, mm: true },
  { k: "social", title: "Instagram post", size: "1080 × 1350 px", note: "Tell your followers they can play", w: 1080, h: 1350, mm: false },
];

export const KIT_ICONS = ["game", "food", "smile", "kids", "heart", "cocktail", "music", "sparkle", "coffee", "football", "cake", "balloon"];
const RIM = ["#FF5A4E", "#FFB51F", "#12A594", "#6E4BFF", "#F0457F"];
const FONT = "'Arial Rounded MT Bold','Helvetica Neue',Arial,sans-serif";
const BODY = "'Helvetica Neue',Arial,sans-serif";

export function defaultKit(venueName: string, accent: string): Kit {
  return {
    headline: "Play at your table",
    sub: `Games, our menu and tonight's offers at ${venueName}`,
    points: [
      { icon: "game", text: "Games for kids & grown-ups" },
      { icon: "food", text: "Menu & today's offers" },
      { icon: "smile", text: "Call your server or ask for the bill" },
    ],
    cta: "Scan with your phone camera",
    footer: "No app · No sign-up · Free",
    style: "bold",
    accent,
    showLogo: true,
  };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const ink = (c: string) => (contrast(c, "#FFFFFF") >= contrast(c, "#14122B") ? "#FFFFFF" : "#14122B");
const mixHex = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("").toUpperCase();
};

/** Colours for a style: background, main text, soft text, highlight, and the panel colour. */
export function palette(k: Kit) {
  const a = k.accent;
  if (k.style === "bold") {
    const fg = ink(a);
    return { bg: a, bg2: mixHex(a, "#000000", 0.28), fg, soft: fg === "#FFFFFF" ? "rgba(255,255,255,.82)" : "rgba(20,18,43,.75)", hi: fg === "#FFFFFF" ? "#FFE27A" : "#14122B", chip: fg === "#FFFFFF" ? "rgba(255,255,255,.16)" : "rgba(20,18,43,.08)" };
  }
  if (k.style === "dark") return { bg: "#14122B", bg2: mixHex(a, "#14122B", 0.72), fg: "#FFFFFF", soft: "rgba(255,255,255,.78)", hi: contrast(a, "#14122B") >= 3 ? a : mixHex(a, "#FFFFFF", 0.5), chip: "rgba(255,255,255,.08)" };
  return { bg: "#FFFFFF", bg2: mixHex(a, "#FFFFFF", 0.86), fg: "#14122B", soft: "rgba(20,18,43,.7)", hi: contrast(a, "#FFFFFF") >= 3 ? a : mixHex(a, "#000000", 0.4), chip: mixHex(a, "#FFFFFF", 0.9) };
}

/** Rough word wrap for bold sans-serif text: widths are estimated, so keep a margin. */
function wrap(text: string, maxW: number, size: number, maxLines = 3): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const per = Math.max(4, Math.floor(maxW / (size * 0.56)));
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= per) cur += " " + w;
    else (lines.push(cur), (cur = w));
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const keep = lines.slice(0, maxLines);
    keep[maxLines - 1] = keep[maxLines - 1].replace(/\s*\S*$/, "") + "…";
    return keep;
  }
  return lines;
}
/** Shrink the font until the text fits in the given number of lines. */
function fit(text: string, maxW: number, size: number, maxLines: number, min: number): { lines: string[]; size: number } {
  let s = size;
  while (s > min && wrap(text, maxW, s, 99).length > maxLines) s -= 4;
  return { lines: wrap(text, maxW, s, maxLines), size: s };
}
const textBlock = (lines: string[], x: number, y: number, size: number, fill: string, opts: { weight?: number; font?: string; lh?: number; anchor?: string; spacing?: number } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${opts.anchor ?? "middle"}" font-family="${opts.font ?? FONT}" font-weight="${opts.weight ?? 800}" font-size="${size}" fill="${fill}"${opts.spacing ? ` letter-spacing="${opts.spacing}"` : ""}>${lines.map((l, i) => `<tspan x="${x}" dy="${i ? size * (opts.lh ?? 1.08) : 0}">${esc(l)}</tspan>`).join("")}</text>`;

const icon = (k: string, cx: number, cy: number, s: number, colour: string) => {
  const d = ICONS[k]?.d ?? ICONS.sparkle.d;
  return `<g transform="translate(${cx - s / 2} ${cy - s / 2}) scale(${(s / 24).toFixed(3)})"><path d="${d}" fill="none" stroke="${colour}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g>`;
};
/** White QR panel with the Play at Your Table badge in the middle. */
const qrPanel = (url: string, cx: number, cy: number, s: number) => {
  const pad = Math.round(s * 0.07), x = cx - s / 2, y = cy - s / 2;
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${Math.round(s * 0.08)}" fill="#FFFFFF" filter="url(#sh)"/>
  <path transform="translate(${x + pad} ${y + pad})" d="${qrPath(url, s - 2 * pad)}" fill="#14122B"/>
  ${mark(cx, cy, Math.round(s * 0.1), "colour", "#14122B")}`;
};
const stripe = (x: number, y: number, w: number, h: number) => RIM.map((c, i) => `<rect x="${x + (i * w) / 5}" y="${y}" width="${w / 5 + 0.5}" height="${h}" fill="${c}"/>`).join("");
const defs = (p: ReturnType<typeof palette>, w: number, h: number) => `<defs>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="${Math.round(w * 0.006)}" stdDeviation="${Math.round(w * 0.012)}" flood-opacity=".25"/></filter>
  <radialGradient id="glow" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.bg2}"/></radialGradient>
  <pattern id="dots" width="${Math.round(w / 24)}" height="${Math.round(w / 24)}" patternUnits="userSpaceOnUse"><circle cx="${Math.round(w / 48)}" cy="${Math.round(w / 48)}" r="${(w / 400).toFixed(1)}" fill="${p.fg}" fill-opacity=".07"/></pattern>
</defs>`;

/** The venue's logo (a data: URL) fitted in a box, or its name in big letters. */
function logo(src: string | null, name: string, cx: number, cy: number, w: number, h: number, fill: string, plate: boolean) {
  if (src)
    return `${plate ? `<rect x="${cx - w / 2 - h * 0.12}" y="${cy - h / 2 - h * 0.12}" width="${w + h * 0.24}" height="${h * 1.24}" rx="${h * 0.2}" fill="#FFFFFF" fill-opacity=".96"/>` : ""}<image href="${src}" x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
  const f = fit(name, w * 1.3, h * 0.55, 1, h * 0.25);
  return textBlock(f.lines, cx, cy + f.size * 0.35, f.size, fill, { spacing: 2 });
}

export type KitInput = { kit: Kit; venueName: string; logo: string | null; url: string; table?: string | null };

/** Several designs share one page in the editor, so each gets its own ids. */
const scope = (svg: string, piece: Piece) => svg.replace(/id="(\w+)"/g, `id="$1-${piece}"`).replace(/url\(#(\w+)\)/g, `url(#$1-${piece})`).replace(/href="#(\w+)"/g, `href="#$1-${piece}"`);

export function pieceSvg(piece: Piece, inp: KitInput): string {
  return scope(drawPiece(piece, inp), piece);
}

function drawPiece(piece: Piece, inp: KitInput): string {
  const { kit: k } = inp;
  const p = palette(k);
  const spec = PIECES.find((x) => x.k === piece)!;
  const W = spec.w, H = spec.h;
  const plate = k.style !== "light"; // logos usually need a white plate on colour
  const open = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs(p, W, H)}`;
  const bgRect = `<rect width="${W}" height="${H}" fill="url(#glow)"/><rect width="${W}" height="${H}" fill="url(#dots)"/>`;
  const points = k.points.filter((x) => x.text.trim());

  /** First baseline that centres a block of lines inside a slot. */
  const centreIn = (top: number, bottom: number, lines: number, size: number, lh: number) => top + (bottom - top - size * (1 + (lines - 1) * lh)) / 2 + size * 0.8;

  if (piece === "poster") {
    const m = 150;
    let out = open + bgRect + stripe(0, 0, W, 42);
    const head = fit(k.headline || " ", W - 2 * m, 230, 2, 120);
    const sub = wrap(k.sub, W - 2 * m - 100, 72, 2);
    const top = k.showLogo ? 520 : 200;
    if (k.showLogo) out += logo(inp.logo, inp.venueName, W / 2, 300, 760, 260, p.fg, plate);
    out += textBlock(head.lines, W / 2, centreIn(top, top + 480, head.lines.length, head.size, 1.02), head.size, p.fg, { lh: 1.02 });
    out += textBlock(sub, W / 2, centreIn(top + 480, top + 700, sub.length, 72, 1.3), 72, p.soft, { weight: 600, font: BODY, lh: 1.3 });
    const qs = k.showLogo ? 880 : 960, qcy = top + 740 + qs / 2;
    out += qrPanel(inp.url, W / 2, qcy, qs);
    for (const sx of [-1, 1]) {
      const x0 = W / 2 + sx * (qs / 2 + 190), x1 = W / 2 + sx * (qs / 2 + 60);
      out += `<path d="M${x0} ${qcy - 120} Q${x0} ${qcy} ${x1} ${qcy}" fill="none" stroke="${p.hi}" stroke-width="16" stroke-linecap="round"/><path d="M${x1 + sx * 50} ${qcy - 45} L${x1} ${qcy} L${x1 + sx * 50} ${qcy + 45}" fill="none" stroke="${p.hi}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    const cy = qcy + qs / 2 + 130;
    out += `<rect x="${W / 2 - 580}" y="${cy - 70}" width="1160" height="120" rx="60" fill="${p.hi}"/>` + textBlock([k.cta], W / 2, cy + 10, 56, ink(p.hi), { weight: 800 });
    const iy = cy + 230, n = Math.max(1, points.length), colW = (W - 2 * m) / n;
    points.forEach((pt, i) => {
      const cx = m + colW * (i + 0.5);
      out += `<circle cx="${cx}" cy="${iy}" r="80" fill="${p.chip}"/>` + icon(pt.icon, cx, iy, 88, p.hi);
      out += textBlock(wrap(pt.text, colW - 60, 48, 2), cx, iy + 150, 48, p.fg, { weight: 700, font: BODY, lh: 1.2 });
    });
    out += textBlock([k.footer], W / 2, H - 140, 50, p.soft, { weight: 700, font: BODY, spacing: 3 });
    out += textBlock(["Powered by Play at Your Table · playatyourtable.com"], W / 2, H - 76, 32, p.soft, { weight: 600, font: BODY });
    out += stripe(0, H - 26, W, 26);
    return out + "</svg>";
  }

  if (piece === "card") {
    const m = 80;
    let out = open + bgRect + stripe(0, 0, W, 26);
    const top = k.showLogo ? 250 : 80;
    if (k.showLogo) out += logo(inp.logo, inp.venueName, W / 2, 130, 400, 130, p.fg, plate);
    const head = fit(k.headline || " ", W - 2 * m, 112, 2, 60);
    out += textBlock(head.lines, W / 2, centreIn(top, top + 230, head.lines.length, head.size, 1.02), head.size, p.fg, { lh: 1.02 });
    const qs = 540, qcy = top + 250 + qs / 2;
    out += qrPanel(inp.url, W / 2, qcy, qs);
    const py = qcy + qs / 2 + 75;
    if (inp.table) out += `<rect x="${W / 2 - 170}" y="${py - 50}" width="340" height="74" rx="37" fill="${p.hi}"/>` + textBlock([`TABLE ${inp.table}`], W / 2, py + 1, 40, ink(p.hi), { spacing: 5 });
    else out += textBlock([k.cta], W / 2, py, 36, p.fg, { weight: 700, font: BODY });
    const ly = py + 100, list = points.slice(0, 3);
    const room = H - 110 - ly, step = Math.min(64, room / Math.max(1, list.length));
    list.forEach((pt, i) => {
      const yy = ly + i * step;
      out += icon(pt.icon, m + 60, yy - 11, 38, p.hi) + textBlock(wrap(pt.text, W - 2 * m - 110, 31, 1), m + 100, yy, 31, p.fg, { weight: 700, font: BODY, anchor: "start" });
    });
    out += textBlock([k.footer], W / 2, H - 52, 26, p.soft, { weight: 700, font: BODY, spacing: 2 });
    out += stripe(0, H - 20, W, 20);
    return out + "</svg>";
  }

  if (piece === "sticker") {
    const c = W / 2, R = W / 2;
    const seg = (r1: number, r2: number, a0: number, a1: number, col: string) => {
      const pt = (r: number, a: number) => `${(c + r * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(c + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
      return `<path d="M${pt(r1, a0)}A${r1} ${r1} 0 0 1 ${pt(r1, a1)}L${pt(r2, a1)}A${r2} ${r2} 0 0 0 ${pt(r2, a0)}z" fill="${col}"/>`;
    };
    let out = open + `<defs><path id="arcT" d="M ${c - R + 75} ${c} A ${R - 75} ${R - 75} 0 0 1 ${c + R - 75} ${c}"/><path id="arcB" d="M ${c - R + 75} ${c} A ${R - 75} ${R - 75} 0 0 0 ${c + R - 75} ${c}"/></defs>`;
    out += RIM.map((col, i) => seg(R, R - 150, -90 + i * 72, -18 + i * 72, col)).join("");
    out += `<circle cx="${c}" cy="${c}" r="${R - 150}" fill="url(#glow)"/>`;
    out += `<text font-family="${FONT}" font-weight="800" font-size="70" letter-spacing="8" fill="#FFFFFF" dominant-baseline="middle"><textPath href="#arcT" startOffset="50%" text-anchor="middle">PLAY AT YOUR TABLE</textPath></text>`;
    out += `<text font-family="${FONT}" font-weight="800" font-size="58" letter-spacing="10" fill="#FFFFFF" dominant-baseline="middle"><textPath href="#arcB" startOffset="50%" text-anchor="middle">${esc(k.footer.toUpperCase().slice(0, 30))}</textPath></text>`;
    const head = fit(k.headline || " ", 900, 110, 2, 60);
    let y = 300 + head.size * 0.8;
    if (k.showLogo) (out += logo(inp.logo, inp.venueName, c, 290, 380, 120, p.fg, plate)), (y = 420 + head.size * 0.8);
    out += textBlock(head.lines, c, y, head.size, p.fg, { lh: 1.02 });
    const qcy = 900;
    out += qrPanel(inp.url, c, qcy, 440);
    out += textBlock([k.cta], c, qcy + 300, 40, p.fg, { weight: 700, font: BODY });
    return out + "</svg>";
  }

  // Social post: no QR (it's seen on a phone), points to the coaster on the table instead.
  const m = 90;
  let out = open + bgRect + stripe(0, 0, W, 18);
  let y = 120;
  if (k.showLogo) ((out += logo(inp.logo, inp.venueName, W / 2, y + 50, 360, 120, p.fg, plate)), (y += 190));
  out += `<rect x="${W / 2 - 200}" y="${y}" width="400" height="64" rx="32" fill="${p.hi}"/>` + textBlock(["NEW AT OUR TABLES"], W / 2, y + 44, 30, ink(p.hi), { spacing: 4 });
  y += 140;
  const head = fit(k.headline || " ", W - 2 * m, 140, 2, 80);
  out += textBlock(head.lines, W / 2, y + head.size * 0.75, head.size, p.fg, { lh: 1.02 });
  y += head.size * 0.75 + (head.lines.length - 1) * head.size * 1.02 + 70;
  const sub = wrap(k.sub, W - 2 * m - 40, 40, 2);
  out += textBlock(sub, W / 2, y, 40, p.soft, { weight: 600, font: BODY, lh: 1.3 });
  y += (sub.length - 1) * 52 + 70;
  points.slice(0, 3).forEach((pt, i) => {
    const yy = y + i * 112;
    out += `<rect x="${m}" y="${yy}" width="${W - 2 * m}" height="92" rx="46" fill="${p.chip}"/>` + icon(pt.icon, m + 62, yy + 46, 44, p.hi) + textBlock(wrap(pt.text, W - 2 * m - 150, 36, 1), m + 115, yy + 59, 36, p.fg, { weight: 700, font: BODY, anchor: "start" });
  });
  out += textBlock(["Scan the QR on your table to play"], W / 2, H - 80, 34, p.fg, { weight: 700, font: BODY });
  out += stripe(0, H - 18, W, 18);
  return out + "</svg>";
}

/** Rasterise an SVG at any size (browser only). */
export async function svgToPngSized(svg: string, w: number, h: number): Promise<string> {
  const img = new Image();
  await new Promise<void>((ok, fail) => {
    img.onload = () => ok();
    img.onerror = () => fail(new Error("Could not draw the design"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  cv.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return cv.toDataURL("image/png");
}

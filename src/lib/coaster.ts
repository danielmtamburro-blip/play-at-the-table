import QRCode from "qrcode";

/** An element placed on the coaster: centre point and size, in a 1000×1000 canvas. */
export type Placed = { x: number; y: number; s: number };
export type PlacedIcon = Placed & { k: string; c: string };

/** A venue's coaster design, stored in venues.coaster. Every element can be moved and recoloured. */
export type CoasterDesign = {
  base: string; // coaster background
  rim: string; // outer ring
  titleColor: string; // "PLAY AT YOUR TABLE"
  titleSize: number;
  taglineColor: string; // bottom line
  taglineSize: number;
  tagline: string;
  plate: string; // panel behind the QR
  qr: string; // QR modules
  mark: "colour" | "mono"; // centre badge inside the QR
  qrBox: Placed; // QR panel position/size
  logoBox: Placed; // logo (or venue name) position/width
  tableBox: Placed; // "TABLE 12" badge position/size
  showTable: boolean;
  icons: PlacedIcon[];
};

export const QR_MIN = 300; // smaller than this gets hard to scan from a table
export const QR_MAX = 470;
export const MAX_ICONS = 10;

// Default slots around the QR, clear of the arc lettering and logo area.
const SLOTS: [number, number][] = [
  [175, 420], [825, 420], [175, 590], [825, 590], [255, 745], [745, 745], [300, 250], [700, 250], [500, 900], [130, 505],
];

export const DEFAULT_DESIGN: CoasterDesign = {
  base: "#1B1740",
  rim: "#FFB51F",
  titleColor: "#FFFFFF",
  titleSize: 62,
  taglineColor: "#FFFFFF",
  taglineSize: 40,
  tagline: "Scan here to have fun",
  plate: "#FFFFFF",
  qr: "#1B1740",
  mark: "colour",
  qrBox: { x: 500, y: 500, s: 390 },
  logoBox: { x: 500, y: 776, s: 340 },
  tableBox: { x: 500, y: 261, s: 200 },
  showTable: true,
  icons: ["cocktail", "music", "heart", "kids"].map((k, i) => ({ k, x: SLOTS[i][0], y: SLOTS[i][1], s: 84, c: "#FFB51F" })),
};

export const PRESETS: { name: string; design: Partial<CoasterDesign>; icon: string }[] = [
  { name: "Midnight gold", icon: "#FFB51F", design: { base: "#1B1740", rim: "#FFB51F", titleColor: "#FFFFFF", taglineColor: "#FFFFFF", qr: "#1B1740", plate: "#FFFFFF" } },
  { name: "Party purple", icon: "#FF5A4E", design: { base: "#3B1A6E", rim: "#12A594", titleColor: "#FFFFFF", taglineColor: "#FFB51F", qr: "#3B1A6E", plate: "#FFFFFF" } },
  { name: "Emerald", icon: "#D9B262", design: { base: "#0E4D3A", rim: "#D9B262", titleColor: "#F7F1E3", taglineColor: "#D9B262", qr: "#0E4D3A", plate: "#F7F1E3" } },
  { name: "Coral pop", icon: "#FFFFFF", design: { base: "#FF5A4E", rim: "#1B1740", titleColor: "#FFFFFF", taglineColor: "#1B1740", qr: "#1B1740", plate: "#FFFFFF" } },
  { name: "Clean white", icon: "#12A594", design: { base: "#FFFFFF", rim: "#12A594", titleColor: "#1B1740", taglineColor: "#12A594", qr: "#1B1740", plate: "#F1F5F4" } },
  { name: "Sky", icon: "#FFFFFF", design: { base: "#4CC9F0", rim: "#1B1740", titleColor: "#1B1740", taglineColor: "#1B1740", qr: "#1B1740", plate: "#FFFFFF" } },
  { name: "Rose", icon: "#FFFFFF", design: { base: "#F0457F", rim: "#FFD6E5", titleColor: "#FFFFFF", taglineColor: "#FFFFFF", qr: "#5A1030", plate: "#FFFFFF" } },
  { name: "Black & gold", icon: "#D9B262", design: { base: "#111111", rim: "#D9B262", titleColor: "#D9B262", taglineColor: "#F7F1E3", qr: "#111111", plate: "#F7F1E3" } },
];

/** Apply a preset, recolouring every icon too. */
export const applyPreset = (d: CoasterDesign, p: (typeof PRESETS)[number]): CoasterDesign => ({
  ...d,
  ...p.design,
  icons: d.icons.map((i) => ({ ...i, c: p.icon })),
});

/** 24×24 stroke icons. */
export const ICONS: Record<string, { label: string; d: string }> = {
  cocktail: { label: "Cocktail", d: "M4 4h16l-8 9zM12 13v7M8 20h8M15 4l3-3" },
  music: { label: "Music", d: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
  heart: { label: "Heart", d: "M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" },
  kids: { label: "Star", d: "M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" },
  dice: { label: "Dice", d: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" },
  coffee: { label: "Coffee", d: "M3 9h14v6a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM17 11h1.5a2.5 2.5 0 0 1 0 5H17M7 2v3M11 2v3" },
  food: { label: "Food", d: "M7 2v8a2 2 0 0 0 2 2v10M11 2v8a2 2 0 0 1-2 2M9 2v6M18 22V2c-2.5 1.5-3.5 4.5-3.5 9H18" },
  mic: { label: "Microphone", d: "M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" },
  balloon: { label: "Balloon", d: "M12 2a6 6 0 0 1 6 6c0 4-3.5 7.5-6 8-2.5-.5-6-4-6-8a6 6 0 0 1 6-6zM12 16l-1 2h2zM12 18c0 2-2 2.5-2 4" },
  icecream: { label: "Ice cream", d: "M7 10a5 5 0 0 1 10 0zM7 10l5 12 5-12" },
  game: { label: "Game", d: "M6 8h12a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6h-6A4 4 0 0 1 2 13v-1a4 4 0 0 1 4-4zM7 10v4M5 12h4M16 11h.01M18 13h.01" },
  sparkle: { label: "Sparkle", d: "M12 2l2 6.5L20.5 11 14 13.5 12 20l-2-6.5L3.5 11 10 8.5zM19 2v4M17 4h4" },
  football: { label: "Football", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5l3.8 2.8-1.5 4.4H9.7l-1.5-4.4zM12 3v4.5M20.6 9.3l-4.8 1M18 19.5l-3.7-4.8M6 19.5l3.7-4.8M3.4 9.3l4.8 1" },
  palm: { label: "Palm", d: "M12 22c0-6 1-10 1-13M13 9c-2-3-6-4-9-2 3 0 6 1 9 2zM13 9c2-3 6-4 8-1.5-3-.5-6 .5-8 1.5zM13 9c-1-3-4-6-7-6 2 1 5 3 7 6zM13 9c1-3 3-6 6-6.5-2 1.5-4 4-6 6.5z" },
  pizza: { label: "Pizza", d: "M12 2C7 2 3.5 4 2 5.5L12 22 22 5.5C20.5 4 17 2 12 2zM3.5 7.5C6 6 9 5.5 12 5.5s6 .5 8.5 2M9 10h.01M14 13h.01M11 16h.01" },
  burger: { label: "Burger", d: "M4 11a8 6 0 0 1 16 0zM3 14h18M4 17h16a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM8 8h.01M12 7h.01M16 8h.01" },
  cake: { label: "Cake", d: "M4 21h16v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zM4 16c2 1 4 1 4 0s2-1 4 0 4 1 4 0 2-1 4 0M12 11V7M12 4.5a1.2 1.2 0 1 1 0 .01" },
  moon: { label: "Moon", d: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" },
  smile: { label: "Smile", d: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 14c1 1.5 2.4 2.2 4 2.2s3-.7 4-2.2M9 9.5h.01M15 9.5h.01" },
  camel: { label: "Camel", d: "M3 20v-6c0-2 1-3 3-3 1-3 3-4 4-1 1-3 3-3 4 0 2 0 3-2 4-3l2 1-1 2v2c0 2-1 3-2 3v5M8 20v-5M14 20v-5" },
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const FONT = "'Arial Rounded MT Bold','Baloo Bhaijaan 2','Helvetica Neue',Arial,sans-serif";

/** WCAG relative luminance, for warning about QR codes phones can't read. */
export function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// QR patterns are cached (drawn at 0,0) so dragging on the canvas stays smooth.
const qrCache = new Map<string, string>();
function qrPath(url: string, size: number): string {
  const key = `${url}|${size}`;
  const hit = qrCache.get(key);
  if (hit) return hit;
  if (qrCache.size > 200) qrCache.clear();
  const x0 = 0, y0 = 0;
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const m = size / n;
  let d = "";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (qr.modules.get(r, c)) d += `M${(x0 + c * m).toFixed(2)} ${(y0 + r * m).toFixed(2)}h${m.toFixed(2)}v${m.toFixed(2)}h-${m.toFixed(2)}z`;
  qrCache.set(key, d);
  return d;
}

/** The Play at Your Table mark for the QR centre (H error correction leaves room for it). */
function mark(cx: number, cy: number, r: number, style: "colour" | "mono", mono: string) {
  const [a, b, c, dd, e] = style === "mono" ? [mono, mono, mono, mono, mono] : ["#FF5A4E", "#FFB51F", "#12A594", "#6E4BFF", "#F0457F"];
  return `<g transform="translate(${cx - r} ${cy - r}) scale(${(2 * r) / 40})">
    <circle cx="20" cy="20" r="20" fill="#fff"/>
    <circle cx="20" cy="20" r="17" fill="${a}"/>
    <path d="M20 3a17 17 0 0 1 16.17 11.75L20 20z" fill="${b}"/>
    <path d="M36.17 14.75A17 17 0 0 1 30 33.75L20 20z" fill="${c}"/>
    <path d="M30 33.75a17 17 0 0 1-20 0L20 20z" fill="${dd}"/>
    <path d="M10 33.75A17 17 0 0 1 3.83 14.75L20 20z" fill="${e}"/>
    <circle cx="20" cy="20" r="10" fill="#fff"/>
    <path d="M17.3 15.3v9.4l7.7-4.7z" fill="${style === "mono" ? mono : "#1B1740"}"/>
  </g>`;
}

/** Logo box height is a fixed share of its width. */
export const logoHeight = (w: number) => Math.round(w * 0.38);
/** "TABLE 12" badge height is a fixed share of its width. */
export const tableHeight = (w: number) => Math.round(w * 0.25);

/**
 * Full coaster as an SVG string. `logo` must be a data: URL so it survives export to PNG/PDF.
 * Movable parts carry data-el="…" so the editor can pick them up.
 */
export function coasterSvg(d: CoasterDesign, opts: { url: string; table?: string | null; logo?: string | null; venueName?: string }): string {
  const q = d.qrBox;
  const pad = Math.round(q.s * 0.067);
  const qx = q.x - q.s / 2, qy = q.y - q.s / 2;

  const icons = d.icons
    .map((ic, i) => {
      const def = ICONS[ic.k];
      if (!def) return "";
      const sc = ic.s / 24;
      return `<g data-el="icon-${i}" transform="translate(${ic.x - ic.s / 2} ${ic.y - ic.s / 2}) scale(${sc.toFixed(3)})"><rect width="24" height="24" fill="transparent"/><path d="${def.d}" fill="none" stroke="${ic.c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    })
    .join("");

  const L = d.logoBox, lh = logoHeight(L.s);
  const logoBlock = opts.logo
    ? `<g data-el="logo"><rect x="${L.x - L.s / 2}" y="${L.y - lh / 2}" width="${L.s}" height="${lh}" fill="transparent"/><image href="${opts.logo}" x="${L.x - L.s / 2}" y="${L.y - lh / 2}" width="${L.s}" height="${lh}" preserveAspectRatio="xMidYMid meet"/></g>`
    : opts.venueName
      ? `<g data-el="logo"><rect x="${L.x - L.s / 2}" y="${L.y - lh / 2}" width="${L.s}" height="${lh}" fill="transparent"/><text x="${L.x}" y="${L.y + L.s * 0.04}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${Math.round(L.s * 0.135)}" fill="${d.taglineColor}">${esc(opts.venueName.slice(0, 28))}</text></g>`
      : "";

  const T = d.tableBox, th = tableHeight(T.s);
  const table = d.showTable && opts.table
    ? `<g data-el="table"><rect x="${T.x - T.s / 2}" y="${T.y - th / 2}" width="${T.s}" height="${th}" rx="${th / 2}" fill="${d.plate}"/><text x="${T.x}" y="${T.y + th * 0.22}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${Math.round(th * 0.56)}" letter-spacing="3" fill="${d.qr}">TABLE ${esc(opts.table)}</text></g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <path id="arcTop" d="M 140 500 A 360 360 0 0 1 860 500"/>
    <path id="arcBottom" d="M 95 500 A 405 405 0 0 0 905 500"/>
    <clipPath id="disc"><circle cx="500" cy="500" r="500"/></clipPath>
  </defs>
  <g clip-path="url(#disc)">
    <circle cx="500" cy="500" r="500" fill="${d.rim}"/>
    <circle cx="500" cy="500" r="466" fill="${d.base}"/>
    <text font-family="${FONT}" font-weight="800" font-size="${d.titleSize}" letter-spacing="5" fill="${d.titleColor}"><textPath href="#arcTop" startOffset="50%" text-anchor="middle">PLAY AT YOUR TABLE</textPath></text>
    <text font-family="${FONT}" font-weight="700" font-size="${d.taglineSize}" letter-spacing="2" fill="${d.taglineColor}"><textPath href="#arcBottom" startOffset="50%" text-anchor="middle">${esc(d.tagline.slice(0, 40))}</textPath></text>
    ${icons}
    ${logoBlock}
    ${table}
    <g data-el="qr">
      <rect x="${qx}" y="${qy}" width="${q.s}" height="${q.s}" rx="${Math.round(q.s * 0.087)}" fill="${d.plate}"/>
      <path transform="translate(${qx + pad} ${qy + pad})" d="${qrPath(opts.url, q.s - 2 * pad)}" fill="${d.qr}"/>
      ${mark(q.x, q.y, Math.round(q.s * 0.1), d.mark, d.qr)}
    </g>
  </g>
</svg>`;
}

export const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Rasterise an SVG string (browser only). */
export async function svgToPng(svg: string, px = 1200): Promise<string> {
  const img = new Image();
  img.decoding = "async";
  await new Promise<void>((ok, fail) => {
    img.onload = () => ok();
    img.onerror = () => fail(new Error("Could not draw the coaster"));
    img.src = svgDataUrl(svg);
  });
  const cv = document.createElement("canvas");
  cv.width = cv.height = px;
  const ctx = cv.getContext("2d")!;
  ctx.drawImage(img, 0, 0, px, px);
  return cv.toDataURL("image/png");
}

/** Fetch an image URL as a data: URL so it can be embedded in the SVG. */
export async function toDataUrl(url: string): Promise<string> {
  const blob = await (await fetch(url)).blob();
  return await new Promise((ok, fail) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => fail(r.error);
    r.readAsDataURL(blob);
  });
}

/** Free default spot for a newly added icon. */
export function nextIconSpot(icons: PlacedIcon[]): [number, number] {
  const free = SLOTS.find(([x, y]) => !icons.some((i) => Math.hypot(i.x - x, i.y - y) < 60));
  return free ?? [500, 160];
}

const clampNum = (v: unknown, lo: number, hi: number, f: number) => (typeof v === "number" && isFinite(v) ? Math.min(hi, Math.max(lo, v)) : f);
const place = (v: unknown, f: Placed, sLo: number, sHi: number): Placed => {
  const p = (v && typeof v === "object" ? v : {}) as Partial<Placed>;
  return { x: clampNum(p.x, 0, 1000, f.x), y: clampNum(p.y, 0, 1000, f.y), s: clampNum(p.s, sLo, sHi, f.s) };
};

/** Read a stored design, upgrading designs saved by the first version (fixed icon slots, one text colour). */
export function normaliseDesign(raw: unknown): CoasterDesign {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const D = DEFAULT_DESIGN;
  const hex = (v: unknown, f: string) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : f);
  const legacyText = hex(r.text, D.titleColor);
  const legacyIcon = hex(r.icon, D.icons[0].c);
  const icons: PlacedIcon[] = Array.isArray(r.icons)
    ? r.icons
        .map((ic: any, i: number) =>
          typeof ic === "string"
            ? ICONS[ic] && { k: ic, x: SLOTS[i % SLOTS.length][0], y: SLOTS[i % SLOTS.length][1], s: 84, c: legacyIcon }
            : ic && ICONS[ic.k] && { k: ic.k, ...place(ic, { x: 500, y: 500, s: 84 }, 30, 220), c: hex(ic.c, legacyIcon) },
        )
        .filter(Boolean)
        .slice(0, MAX_ICONS)
    : D.icons;
  return {
    base: hex(r.base, D.base),
    rim: hex(r.rim, D.rim),
    titleColor: hex(r.titleColor, legacyText),
    titleSize: clampNum(r.titleSize, 44, 76, D.titleSize),
    taglineColor: hex(r.taglineColor, legacyText),
    taglineSize: clampNum(r.taglineSize, 28, 54, D.taglineSize),
    tagline: typeof r.tagline === "string" ? r.tagline.slice(0, 40) : D.tagline,
    plate: hex(r.plate, D.plate),
    qr: hex(r.qr, D.qr),
    mark: r.mark === "mono" ? "mono" : "colour",
    qrBox: place(r.qrBox, D.qrBox, QR_MIN, QR_MAX),
    logoBox: place(r.logoBox, D.logoBox, 120, 600),
    tableBox: place(r.tableBox, D.tableBox, 120, 320),
    showTable: typeof r.showTable === "boolean" ? r.showTable : true,
    icons,
  };
}

import QRCode from "qrcode";

/** A venue's coaster design, stored in venues.coaster. */
export type CoasterDesign = {
  base: string; // coaster background
  rim: string; // outer ring
  text: string; // "PLAY AT THE TABLE" + tagline
  plate: string; // square behind the QR
  qr: string; // QR modules
  icon: string; // icon colour
  icons: string[]; // up to 6 icon keys, placed around the QR
  tagline: string; // bottom arc text
  showTable: boolean; // print "TABLE 12" above the QR
};

export const DEFAULT_DESIGN: CoasterDesign = {
  base: "#1B1740",
  rim: "#FFB51F",
  text: "#FFFFFF",
  plate: "#FFFFFF",
  qr: "#1B1740",
  icon: "#FFB51F",
  icons: ["cocktail", "music", "heart", "kids"],
  tagline: "Scan here to have fun",
  showTable: true,
};

export const PRESETS: { name: string; design: Partial<CoasterDesign> }[] = [
  { name: "Midnight gold", design: { base: "#1B1740", rim: "#FFB51F", text: "#FFFFFF", icon: "#FFB51F", qr: "#1B1740" } },
  { name: "Party purple", design: { base: "#3B1A6E", rim: "#12A594", text: "#FFFFFF", icon: "#FF5A4E", qr: "#3B1A6E" } },
  { name: "Emerald", design: { base: "#0E4D3A", rim: "#D9B262", text: "#F7F1E3", icon: "#D9B262", qr: "#0E4D3A" } },
  { name: "Coral pop", design: { base: "#FF5A4E", rim: "#1B1740", text: "#FFFFFF", icon: "#FFFFFF", qr: "#1B1740" } },
  { name: "Clean white", design: { base: "#FFFFFF", rim: "#12A594", text: "#1B1740", icon: "#12A594", qr: "#1B1740" } },
  { name: "Sky", design: { base: "#4CC9F0", rim: "#1B1740", text: "#1B1740", icon: "#FFFFFF", qr: "#1B1740" } },
];

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
};

// Six slots around the QR plate (viewBox 0..1000), clear of the arc lettering and logo box.
const SLOTS: [number, number][] = [
  [175, 420], [825, 420], [175, 590], [825, 590], [255, 745], [745, 745],
];

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

function qrPath(url: string, x0: number, y0: number, size: number): string {
  const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const m = size / n;
  let d = "";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (qr.modules.get(r, c)) d += `M${(x0 + c * m).toFixed(2)} ${(y0 + r * m).toFixed(2)}h${m.toFixed(2)}v${m.toFixed(2)}h-${m.toFixed(2)}z`;
  return d;
}

/** The Play at the Table mark for the QR centre (H error correction leaves room for it). */
const mark = (cx: number, cy: number, r: number) => `
  <g transform="translate(${cx - r} ${cy - r}) scale(${(2 * r) / 40})">
    <circle cx="20" cy="20" r="20" fill="#fff"/>
    <circle cx="20" cy="20" r="17" fill="#FF5A4E"/>
    <path d="M20 3a17 17 0 0 1 16.17 11.75L20 20z" fill="#FFB51F"/>
    <path d="M36.17 14.75A17 17 0 0 1 30 33.75L20 20z" fill="#12A594"/>
    <path d="M30 33.75a17 17 0 0 1-20 0L20 20z" fill="#6E4BFF"/>
    <path d="M10 33.75A17 17 0 0 1 3.83 14.75L20 20z" fill="#F0457F"/>
    <circle cx="20" cy="20" r="10" fill="#fff"/>
    <path d="M17.3 15.3v9.4l7.7-4.7z" fill="#1B1740"/>
  </g>`;

/** Full coaster as an SVG string. `logo` must be a data: URL so it survives export to PNG/PDF. */
export function coasterSvg(d: CoasterDesign, opts: { url: string; table?: string | null; logo?: string | null; venueName?: string }): string {
  const plate = { x: 305, y: 305, s: 390 };
  const pad = 26;
  const icons = d.icons
    .slice(0, SLOTS.length)
    .map((k, i) => {
      const ic = ICONS[k];
      if (!ic) return "";
      const [x, y] = SLOTS[i];
      return `<g transform="translate(${x - 42} ${y - 42}) scale(3.5)"><path d="${ic.d}" fill="none" stroke="${d.icon}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    })
    .join("");

  const logoBlock = opts.logo
    ? `<image href="${opts.logo}" x="330" y="712" width="340" height="128" preserveAspectRatio="xMidYMid meet"/>`
    : opts.venueName
      ? `<text x="500" y="790" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="46" fill="${d.text}">${esc(opts.venueName.slice(0, 28))}</text>`
      : "";

  const table = d.showTable && opts.table
    ? `<rect x="400" y="236" width="200" height="50" rx="25" fill="${d.plate}"/><text x="500" y="272" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="28" letter-spacing="3" fill="${d.qr}">TABLE ${esc(opts.table)}</text>`
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
    <text font-family="${FONT}" font-weight="800" font-size="66" letter-spacing="5" fill="${d.text}"><textPath href="#arcTop" startOffset="50%" text-anchor="middle">PLAY AT THE TABLE</textPath></text>
    <text font-family="${FONT}" font-weight="700" font-size="40" letter-spacing="2" fill="${d.text}"><textPath href="#arcBottom" startOffset="50%" text-anchor="middle">${esc(d.tagline.slice(0, 40))}</textPath></text>
    ${icons}
    ${table}
    <rect x="${plate.x}" y="${plate.y}" width="${plate.s}" height="${plate.s}" rx="34" fill="${d.plate}"/>
    <path d="${qrPath(opts.url, plate.x + pad, plate.y + pad, plate.s - 2 * pad)}" fill="${d.qr}"/>
    ${mark(500, 500, 40)}
    ${logoBlock}
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

export function normaliseDesign(raw: unknown): CoasterDesign {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<CoasterDesign>;
  const hex = (v: unknown, f: string) => (typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : f);
  return {
    base: hex(r.base, DEFAULT_DESIGN.base),
    rim: hex(r.rim, DEFAULT_DESIGN.rim),
    text: hex(r.text, DEFAULT_DESIGN.text),
    plate: hex(r.plate, DEFAULT_DESIGN.plate),
    qr: hex(r.qr, DEFAULT_DESIGN.qr),
    icon: hex(r.icon, DEFAULT_DESIGN.icon),
    icons: Array.isArray(r.icons) ? r.icons.filter((k) => typeof k === "string" && ICONS[k]).slice(0, 6) : DEFAULT_DESIGN.icons,
    tagline: typeof r.tagline === "string" ? r.tagline.slice(0, 40) : DEFAULT_DESIGN.tagline,
    showTable: typeof r.showTable === "boolean" ? r.showTable : true,
  };
}

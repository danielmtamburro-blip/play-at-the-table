"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyPreset,
  coasterSvg,
  contrast,
  DEFAULT_DESIGN,
  ICONS,
  logoHeight,
  MAX_ICONS,
  nextIconSpot,
  normaliseDesign,
  PRESETS,
  QR_MAX,
  QR_MIN,
  svgDataUrl,
  svgToPng,
  tableHeight,
  toDataUrl,
  type CoasterDesign,
  type Placed,
} from "@/lib/coaster";
import { getBrowserClient } from "@/lib/supabase/client";
import { pdfToPng, removeVenueFile, uploadVenueFile } from "@/lib/upload";
import type { Row } from "./CrudList";

type ColourKey = "base" | "rim" | "titleColor" | "taglineColor" | "plate" | "qr";
const COLOURS: [ColourKey, string][] = [
  ["base", "Background"],
  ["rim", "Outer ring"],
  ["titleColor", "“Play at Your Table”"],
  ["taglineColor", "Bottom line & name"],
  ["plate", "QR panel"],
  ["qr", "QR code"],
];

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((ok, fail) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => fail(r.error);
    r.readAsDataURL(b);
  });

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="cd-step">
      <header>
        <span className="cd-num">{n}</span>
        <div>
          <h3>{title}</h3>
          {hint && <p className="small muted">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Swatch({ value, onChange, label, sub }: { value: string; onChange: (v: string) => void; label: string; sub?: string }) {
  return (
    <label className="cd-colour">
      <span className="cd-swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />
      </span>
      <span>
        <b>{label}</b>
        <span className="small muted">{sub ?? value}</span>
      </span>
    </label>
  );
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Box (in coaster units) around a movable element, for the selection outline. */
function boxOf(d: CoasterDesign, id: string): { x: number; y: number; w: number; h: number } | null {
  if (id === "qr") return { x: d.qrBox.x, y: d.qrBox.y, w: d.qrBox.s, h: d.qrBox.s };
  if (id === "logo") return { x: d.logoBox.x, y: d.logoBox.y, w: d.logoBox.s, h: logoHeight(d.logoBox.s) };
  if (id === "table") return { x: d.tableBox.x, y: d.tableBox.y, w: d.tableBox.s, h: tableHeight(d.tableBox.s) };
  const ic = d.icons[Number(id.split("-")[1])];
  return ic ? { x: ic.x, y: ic.y, w: ic.s, h: ic.s } : null;
}

export default function CoasterDesigner({ venue }: { venue: Row }) {
  const router = useRouter();
  const saved = useMemo(() => normaliseDesign(venue.coaster), [venue.coaster]);
  const [d, setD] = useState<CoasterDesign>(saved);
  const [logoUrl, setLogoUrl] = useState<string>(venue.logo_url ?? "");
  const [logoData, setLogoData] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://playatthetable.netlify.app");
  const [tables, setTables] = useState(12);
  const [preview, setPreview] = useState<string | null>("1"); // table shown in the preview; null = whole venue
  const [withVenue, setWithVenue] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; px: number; py: number; ox: number; oy: number; pointer: number } | null>(null);

  const set = <K extends keyof CoasterDesign>(k: K, v: CoasterDesign[K]) => setD((x) => ({ ...x, [k]: v }));
  const dirty = JSON.stringify(d) !== JSON.stringify(saved) || logoUrl !== (venue.logo_url ?? "");

  useEffect(() => setOrigin(location.origin), []);
  useEffect(() => {
    if (venue.logo_url) toDataUrl(venue.logo_url).then(setLogoData, () => setLogoData(null));
  }, [venue.logo_url]);

  const svgFor = (design: CoasterDesign, table: string | null) =>
    coasterSvg(design, {
      url: table ? `${origin}/v/${venue.slug}/${table}` : `${origin}/v/${venue.slug}`,
      table,
      logo: logoData,
      venueName: venue.name_en,
    });
  const mainSvg = useMemo(() => svgFor(d, preview), [d, logoData, origin, preview]); // eslint-disable-line react-hooks/exhaustive-deps
  const presetThumbs = useMemo(
    () => PRESETS.map((p) => svgDataUrl(svgFor(applyPreset({ ...d, showTable: false }, p), null))),
    [logoData, origin, d.icons.length, d.tagline, d.qrBox, d.logoBox], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const scanOk = contrast(d.qr, d.plate) >= 4.5;
  const activePreset = PRESETS.findIndex((p) => Object.entries(p.design).every(([k, v]) => d[k as keyof CoasterDesign] === v));

  /* ----- moving things on the canvas ----- */

  const posOf = (id: string): Placed | null =>
    id === "qr" ? d.qrBox : id === "logo" ? d.logoBox : id === "table" ? d.tableBox : d.icons[Number(id.split("-")[1])] ?? null;

  const update = (id: string, patch: Partial<Placed> & { c?: string }) =>
    setD((x) => {
      const fix = (p: Placed, lo: number, hi: number): Placed => {
        const n = { ...p, ...patch };
        return { x: clamp(n.x, 40, 960), y: clamp(n.y, 40, 960), s: clamp(n.s, lo, hi) };
      };
      if (id === "qr") return { ...x, qrBox: fix(x.qrBox, QR_MIN, QR_MAX) };
      if (id === "logo") return { ...x, logoBox: fix(x.logoBox, 120, 600) };
      if (id === "table") return { ...x, tableBox: fix(x.tableBox, 120, 320) };
      const i = Number(id.split("-")[1]);
      return { ...x, icons: x.icons.map((ic, j) => (j === i ? { ...ic, ...fix(ic, 30, 220), c: patch.c ?? ic.c } : ic)) };
    });

  const units = () => 1000 / (canvasRef.current?.getBoundingClientRect().width || 1000);

  function onDown(e: React.PointerEvent) {
    const el = (e.target as Element).closest("[data-el]");
    if (!el) return setSel(null);
    const id = el.getAttribute("data-el")!;
    const p = posOf(id);
    if (!p) return;
    setSel(id);
    canvasRef.current?.setPointerCapture(e.pointerId);
    dragRef.current = { id, px: e.clientX, py: e.clientY, ox: p.x, oy: p.y, pointer: e.pointerId };
    e.preventDefault();
  }
  function onMove(e: React.PointerEvent) {
    const g = dragRef.current;
    if (!g || g.pointer !== e.pointerId) return;
    const u = units();
    update(g.id, { x: Math.round(g.ox + (e.clientX - g.px) * u), y: Math.round(g.oy + (e.clientY - g.py) * u) });
  }
  function onUp(e: React.PointerEvent) {
    if (dragRef.current?.pointer === e.pointerId) dragRef.current = null;
  }
  function onKey(e: React.KeyboardEvent) {
    if (!sel) return;
    const p = posOf(sel);
    if (!p) return;
    const step = e.shiftKey ? 20 : 5;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      update(sel, { x: p.x + moves[e.key][0], y: p.y + moves[e.key][1] });
    } else if ((e.key === "Delete" || e.key === "Backspace") && sel.startsWith("icon-")) {
      e.preventDefault();
      removeIcon(Number(sel.split("-")[1]));
    } else if (e.key === "Escape") setSel(null);
  }

  function addIcon(k: string) {
    if (d.icons.length >= MAX_ICONS) return;
    const [x, y] = nextIconSpot(d.icons);
    const c = d.icons[d.icons.length - 1]?.c ?? DEFAULT_DESIGN.icons[0].c;
    setD((v) => ({ ...v, icons: [...v.icons, { k, x, y, s: 84, c }] }));
    setSel(`icon-${d.icons.length}`);
  }
  function removeIcon(i: number) {
    setD((v) => ({ ...v, icons: v.icons.filter((_, j) => j !== i) }));
    setSel(null);
  }

  /* ----- files, saving, printing ----- */

  async function onLogo(file: File) {
    setMsg(null);
    setBusy("logo");
    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf && !/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Please upload a PDF, PNG, JPG or WEBP file.");
      const blob = isPdf ? await pdfToPng(file) : file;
      const ext = isPdf ? "png" : file.type.split("/")[1].replace("jpeg", "jpg");
      const url = await uploadVenueFile(venue.id, blob, "logo", ext);
      setLogoUrl(url);
      setLogoData(await blobToDataUrl(blob));
      setSel("logo");
      setMsg({ ok: true, text: "Logo added. Drag it where you want it, then press Save." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    const old = venue.logo_url as string;
    const { error } = await getBrowserClient()!.from("venues").update({ coaster: d, logo_url: logoUrl }).eq("id", venue.id);
    setBusy(null);
    if (error) return setMsg({ ok: false, text: error.message });
    if (old && old !== logoUrl) removeVenueFile(old).catch(() => {});
    setMsg({ ok: true, text: "Saved. Your logo also shows at the top of your guest page." });
    router.refresh();
  }

  async function downloadPdf() {
    setBusy("pdf");
    setMsg(null);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: [100, 100] });
      const pages = [...(withVenue ? [null] : []), ...Array.from({ length: tables }, (_, i) => String(i + 1))];
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage([100, 100]);
        pdf.addImage(await svgToPng(svgFor(d, pages[i]), 1200), "PNG", 0, 0, 100, 100, undefined, "FAST");
      }
      pdf.save(`${venue.slug}-coasters-100mm.pdf`);
      setMsg({ ok: true, text: `Downloaded ${pages.length} coasters (100 mm, ~300 dpi). Order 5 test prints first.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not make the PDF." });
    } finally {
      setBusy(null);
    }
  }

  async function downloadPng() {
    const a = document.createElement("a");
    a.href = await svgToPng(svgFor(d, preview), 2000);
    a.download = `${venue.slug}-coaster-${preview ? `table-${preview}` : "venue"}.png`;
    a.click();
  }

  const pickFile = (accept: string, cb: (f: File) => void) => {
    const i = document.createElement("input");
    i.type = "file";
    i.accept = accept;
    i.onchange = () => i.files?.[0] && cb(i.files[0]);
    i.click();
  };

  const tableNum = preview ? Number(preview) : 0;
  const box = sel ? boxOf(d, sel) : null;
  const selPos = sel ? posOf(sel) : null;
  const selIcon = sel?.startsWith("icon-") ? d.icons[Number(sel.split("-")[1])] : null;
  const selName =
    sel === "qr" ? "QR code" : sel === "logo" ? (logoData ? "Your logo" : "Venue name") : sel === "table" ? "Table number" : selIcon ? ICONS[selIcon.k]?.label : "";
  const sizeRange: [number, number] = sel === "qr" ? [QR_MIN, QR_MAX] : sel === "logo" ? [120, 600] : sel === "table" ? [120, 320] : [30, 220];

  return (
    <div className="cd">
      <header className="cd-top">
        <div>
          <span className="eyebrow">Coaster studio</span>
          <h2>Design your QR coaster</h2>
          <p className="muted small">Tap anything on the coaster to select it, then drag it where you want. Everything is yours to change.</p>
        </div>
        <div className="cd-actions">
          {dirty && <span className="badge off">Unsaved changes</span>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => (setD({ ...DEFAULT_DESIGN }), setSel(null))}>
            Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy !== null || !dirty}>
            {busy === "save" ? "Saving…" : dirty ? "Save design" : "Saved ✓"}
          </button>
        </div>
      </header>
      {msg && (
        <p className={`status ${msg.ok ? "ok" : "bad"}`} role="status">
          {msg.text}
        </p>
      )}

      <div className="cd-layout">
        <aside className="cd-stage">
          <div className="cd-stage-inner">
            <div
              ref={canvasRef}
              className="cd-canvas"
              tabIndex={0}
              role="application"
              aria-label="Coaster editor. Select an element, then drag it or use the arrow keys."
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={onKey}
            >
              <div className="cd-svg" dangerouslySetInnerHTML={{ __html: mainSvg }} />
              {box && (
                <svg className="cd-overlay" viewBox="0 0 1000 1000" aria-hidden="true">
                  <rect x={box.x - box.w / 2 - 10} y={box.y - box.h / 2 - 10} width={box.w + 20} height={box.h + 20} rx="14" />
                </svg>
              )}
            </div>
          </div>

          {sel && selPos ? (
            <div className="cd-inspector">
              <div className="cd-inspector-head">
                <b>{selName}</b>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSel(null)}>
                  Done
                </button>
              </div>
              <label className="cd-range">
                <span>Size</span>
                <input type="range" min={sizeRange[0]} max={sizeRange[1]} value={selPos.s} onChange={(e) => update(sel, { s: Number(e.target.value) })} />
              </label>
              <div className="g-row" style={{ alignItems: "center" }}>
                {selIcon && <Swatch value={selIcon.c} onChange={(c) => update(sel, { c })} label="Colour" />}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => update(sel, { x: 500 })}>
                  ↔ Centre
                </button>
                {selIcon && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeIcon(Number(sel.split("-")[1]))}>
                    Delete icon
                  </button>
                )}
              </div>
              {sel === "qr" && <p className="small muted">The QR can&apos;t be made smaller than this, so it always scans.</p>}
            </div>
          ) : (
            <p className="cd-hint">👆 Tap the logo, an icon, the QR or the table number to move it.</p>
          )}

          <div className="cd-switch" role="group" aria-label="Preview table">
            <button type="button" onClick={() => setPreview(tableNum <= 1 ? null : String(tableNum - 1))} disabled={preview === null} aria-label="Previous">
              ‹
            </button>
            <span>{preview ? `Table ${preview}` : "Whole venue (no number)"}</span>
            <button type="button" onClick={() => setPreview(String(Math.min(tables, tableNum + 1)))} disabled={tableNum >= tables} aria-label="Next">
              ›
            </button>
          </div>
          <div className={`cd-check${scanOk ? " ok" : ""}`}>{scanOk ? "✓ Easy to scan" : "⚠ Hard to scan: make the QR darker or its panel lighter"}</div>
        </aside>

        <div className="cd-steps">
          <Step n={1} title="Pick a style" hint="A quick starting point. You can change every colour after.">
            <div className="cd-presets">
              {PRESETS.map((p, i) => (
                <button key={p.name} type="button" className="cd-preset" aria-pressed={activePreset === i} onClick={() => setD((x) => applyPreset(x, p))}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={presetThumbs[i]} alt="" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </Step>

          <Step n={2} title="Colours" hint="Tap a swatch to pick any colour.">
            <div className="cd-colours">
              {COLOURS.map(([k, label]) => (
                <Swatch key={k} value={d[k]} onChange={(v) => set(k, v)} label={label} />
              ))}
              <Swatch
                value={d.icons[0]?.c ?? DEFAULT_DESIGN.icons[0].c}
                onChange={(c) => setD((x) => ({ ...x, icons: x.icons.map((i) => ({ ...i, c })) }))}
                label="All icons"
                sub="Or select one icon to colour it alone"
              />
              <label className="cd-colour">
                <span className="cd-swatch cd-mark" data-mono={d.mark === "mono"} />
                <span>
                  <b>Centre badge</b>
                  <span className="cd-seg">
                    <button type="button" aria-pressed={d.mark === "colour"} onClick={() => set("mark", "colour")}>
                      Colourful
                    </button>
                    <button type="button" aria-pressed={d.mark === "mono"} onClick={() => set("mark", "mono")}>
                      Match QR
                    </button>
                  </span>
                </span>
              </label>
            </div>
          </Step>

          <Step n={3} title="Your logo" hint="PDF, PNG, JPG or WEBP up to 10 MB. Then drag it anywhere on the coaster.">
            <div
              className={`cd-drop${drag ? " over" : ""}${logoData ? " has" : ""}`}
              onDragOver={(e) => (e.preventDefault(), setDrag(true))}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files?.[0];
                if (f) onLogo(f);
              }}
            >
              {logoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoData} alt="Your logo" />
              ) : (
                <span className="cd-drop-icon" aria-hidden="true">
                  ⬆
                </span>
              )}
              <div>
                <b>{busy === "logo" ? "Uploading…" : logoData ? "Looking good!" : "Drop your logo here"}</b>
                <p className="small muted">{logoData ? "Tap it on the coaster to move or resize it." : "Without a logo, your venue name is printed instead."}</p>
                <div className="g-row" style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={busy !== null} onClick={() => pickFile("application/pdf,image/png,image/jpeg,image/webp", onLogo)}>
                    {logoData ? "Replace" : "Choose file"}
                  </button>
                  {logoData && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => (setLogoUrl(""), setLogoData(null))}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Step>

          <Step n={4} title={`Icons (${d.icons.length}/${MAX_ICONS})`} hint="Tap to add. Then drag them where you like, or select one to resize, recolour or delete it.">
            <div className="icon-grid">
              {Object.entries(ICONS).map(([k, ic]) => {
                const count = d.icons.filter((i) => i.k === k).length;
                return (
                  <button
                    key={k}
                    type="button"
                    className="icon-pick"
                    aria-pressed={count > 0}
                    title={`Add ${ic.label}`}
                    disabled={d.icons.length >= MAX_ICONS}
                    onClick={() => addIcon(k)}
                  >
                    {count > 0 && <span className="icon-count">{count}</span>}
                    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                      <path d={ic.d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{ic.label}</span>
                  </button>
                );
              })}
            </div>
            {d.icons.length > 0 && (
              <div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => (set("icons", []), setSel(null))}>
                  Remove all icons
                </button>
              </div>
            )}
          </Step>

          <Step n={5} title="Words">
            <div className="grid2">
              <div className="field">
                <label htmlFor="cd-tag">Bottom line</label>
                <input id="cd-tag" maxLength={40} value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
                <span className="small muted">{40 - d.tagline.length} characters left</span>
              </div>
              <label className="cd-toggle">
                <input type="checkbox" checked={d.showTable} onChange={(e) => set("showTable", e.target.checked)} />
                <span className="cd-toggle-ui" aria-hidden="true" />
                <span>
                  <b>Print table numbers</b>
                  <span className="small muted">Shows &ldquo;TABLE 12&rdquo;. Drag it to move it.</span>
                </span>
              </label>
              <label className="cd-range">
                <span>“Play at Your Table” size</span>
                <input type="range" min={44} max={76} value={d.titleSize} onChange={(e) => set("titleSize", Number(e.target.value))} />
              </label>
              <label className="cd-range">
                <span>Bottom line size</span>
                <input type="range" min={28} max={54} value={d.taglineSize} onChange={(e) => set("taglineSize", Number(e.target.value))} />
              </label>
            </div>
          </Step>

          <Step n={6} title="Print" hint="One page per coaster, 100 mm round, about 300 dpi. Each table gets its own QR.">
            <div className="cd-print">
              <div className="field" style={{ maxWidth: 160 }}>
                <label htmlFor="cd-n">Tables</label>
                <input id="cd-n" type="number" min={1} max={200} value={tables} onChange={(e) => setTables(Math.min(200, Math.max(1, Number(e.target.value) || 1)))} />
              </div>
              <label className="cd-toggle">
                <input type="checkbox" checked={withVenue} onChange={(e) => setWithVenue(e.target.checked)} />
                <span className="cd-toggle-ui" aria-hidden="true" />
                <span>
                  <b>Add a spare</b>
                  <span className="small muted">One coaster without a table number</span>
                </span>
              </label>
            </div>
            <div className="g-row" style={{ alignItems: "center" }}>
              <button type="button" className="btn btn-primary" onClick={downloadPdf} disabled={busy !== null}>
                {busy === "pdf" ? "Making PDF…" : `⬇ Download print PDF (${tables + (withVenue ? 1 : 0)})`}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={downloadPng} disabled={busy !== null}>
                PNG of this preview
              </button>
            </div>
            <p className="small muted">Tip: ask your printer for a satin or matte finish. Gloss causes glare that stops phones scanning.</p>
          </Step>
        </div>
      </div>
    </div>
  );
}

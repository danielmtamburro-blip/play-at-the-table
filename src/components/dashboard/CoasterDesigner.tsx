"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  coasterSvg,
  contrast,
  DEFAULT_DESIGN,
  ICONS,
  normaliseDesign,
  PRESETS,
  svgDataUrl,
  svgToPng,
  toDataUrl,
  type CoasterDesign,
} from "@/lib/coaster";
import { getBrowserClient } from "@/lib/supabase/client";
import { pdfToPng, removeVenueFile, uploadVenueFile } from "@/lib/upload";
import type { Row } from "./CrudList";

const COLOURS: [keyof CoasterDesign, string][] = [
  ["base", "Coaster background"],
  ["rim", "Outer ring"],
  ["text", "Lettering"],
  ["icon", "Icons"],
  ["plate", "Behind the QR"],
  ["qr", "QR code"],
];

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((ok, fail) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => fail(r.error);
    r.readAsDataURL(b);
  });

export default function CoasterDesigner({ venue }: { venue: Row }) {
  const router = useRouter();
  const [d, setD] = useState<CoasterDesign>(() => normaliseDesign(venue.coaster));
  const [logoUrl, setLogoUrl] = useState<string>(venue.logo_url ?? "");
  const [logoData, setLogoData] = useState<string | null>(null);
  const [origin, setOrigin] = useState("https://playatthetable.netlify.app");
  const [tables, setTables] = useState(12);
  const [withVenue, setWithVenue] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof CoasterDesign>(k: K, v: CoasterDesign[K]) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => setOrigin(location.origin), []);
  useEffect(() => {
    if (venue.logo_url) toDataUrl(venue.logo_url).then(setLogoData, () => setLogoData(null));
  }, [venue.logo_url]);

  const svgFor = (table: string | null) =>
    coasterSvg(d, {
      url: table ? `${origin}/v/${venue.slug}/${table}` : `${origin}/v/${venue.slug}`,
      table,
      logo: logoData,
      venueName: venue.name_en,
    });
  const preview = useMemo(() => svgDataUrl(svgFor("1")), [d, logoData, origin]); // eslint-disable-line react-hooks/exhaustive-deps
  const qrContrast = contrast(d.qr, d.plate);

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
      setMsg({ ok: true, text: "Logo added. Press Save design to keep it." });
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
    setMsg({ ok: true, text: "Design saved. Your logo also shows at the top of your guest page." });
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
        pdf.addImage(await svgToPng(svgFor(pages[i]), 1200), "PNG", 0, 0, 100, 100, undefined, "FAST");
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
    a.href = await svgToPng(svgFor("1"), 2000);
    a.download = `${venue.slug}-coaster-table-1.png`;
    a.click();
  }

  return (
    <section className="panel">
      <h2>Coaster design</h2>
      <p className="muted small">
        Make the coaster your own. &ldquo;Play at the Table&rdquo; sits at the top and the QR in the middle; everything else is up to you.
      </p>
      <div className="designer">
        <div className="designer-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Coaster preview for table 1" />
          <span className="small muted">Preview: table 1. Scan it with your phone to test.</span>
        </div>

        <div className="designer-controls">
          <div>
            <h3>Start from a style</h3>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p.name} type="button" className="preset" onClick={() => setD((x) => ({ ...x, ...p.design }))} title={p.name}>
                  <span style={{ background: p.design.base, boxShadow: `0 0 0 5px ${p.design.rim} inset` }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3>Colours</h3>
            <div className="colour-grid">
              {COLOURS.map(([k, label]) => (
                <label key={k} className="colour-field">
                  <input type="color" value={d[k] as string} onChange={(e) => set(k, e.target.value.toUpperCase() as never)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {qrContrast < 4.5 && (
              <p className="status bad">⚠ The QR colour is too close to the colour behind it, so phones may not scan it. Use a darker QR or a lighter background.</p>
            )}
          </div>

          <div>
            <h3>Your logo</h3>
            <p className="small muted">PDF, PNG, JPG or WEBP, up to 10 MB. Transparent backgrounds look best.</p>
            <div className="g-row" style={{ alignItems: "center" }}>
              <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
                {busy === "logo" ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp"
                  hidden
                  disabled={busy !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) onLogo(f);
                  }}
                />
              </label>
              {logoUrl && (
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setLogoUrl("");
                    setLogoData(null);
                  }}
                >
                  Remove logo
                </button>
              )}
              {!logoUrl && <span className="small muted">Without a logo, your venue name is printed instead.</span>}
            </div>
          </div>

          <div>
            <h3>Icons ({d.icons.length}/6)</h3>
            <div className="icon-grid">
              {Object.entries(ICONS).map(([k, ic]) => {
                const on = d.icons.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    className="icon-pick"
                    aria-pressed={on}
                    title={ic.label}
                    disabled={!on && d.icons.length >= 6}
                    onClick={() => set("icons", on ? d.icons.filter((x) => x !== k) : [...d.icons, k])}
                  >
                    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                      <path d={ic.d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid2">
            <div className="field">
              <label htmlFor="cd-tag">Bottom line</label>
              <input id="cd-tag" maxLength={40} value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </div>
            <label className="check" style={{ alignSelf: "end", minHeight: 46 }}>
              <input type="checkbox" checked={d.showTable} onChange={(e) => set("showTable", e.target.checked)} /> Print the table number
            </label>
          </div>

          <div className="g-row" style={{ alignItems: "center" }}>
            <button type="button" className="btn btn-primary" onClick={save} disabled={busy !== null}>
              {busy === "save" ? "Saving…" : "Save design"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setD({ ...DEFAULT_DESIGN })}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="panel" style={{ background: "var(--bg)" }}>
        <h3>Download for printing</h3>
        <p className="small muted">One page per coaster, 100 mm round. Each table gets its own QR, so you can see which tables use it most.</p>
        <div className="inline-form">
          <div className="field" style={{ maxWidth: 180 }}>
            <label htmlFor="cd-n">Number of tables</label>
            <input id="cd-n" type="number" min={1} max={200} value={tables} onChange={(e) => setTables(Math.min(200, Math.max(1, Number(e.target.value) || 1)))} />
          </div>
          <label className="check" style={{ minHeight: 46 }}>
            <input type="checkbox" checked={withVenue} onChange={(e) => setWithVenue(e.target.checked)} /> Add one without a table number
          </label>
        </div>
        <div className="g-row" style={{ alignItems: "center" }}>
          <button type="button" className="btn btn-primary" onClick={downloadPdf} disabled={busy !== null}>
            {busy === "pdf" ? "Making PDF…" : `Download print PDF (${tables + (withVenue ? 1 : 0)} coasters)`}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={downloadPng} disabled={busy !== null}>
            Download PNG (table 1)
          </button>
        </div>
      </div>
      {msg && <p className={`status ${msg.ok ? "ok" : "bad"}`} role="status">{msg.text}</p>}
    </section>
  );
}

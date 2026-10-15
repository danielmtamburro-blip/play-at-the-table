"use client";
// Marketing kit: ready-to-print posters, table cards, a window sticker and an Instagram post in the venue's colours.
import { useEffect, useMemo, useState } from "react";
import { ICONS, toDataUrl } from "@/lib/coaster";
import { defaultKit, KIT_ICONS, PIECES, pieceSvg, svgToPngSized, type Kit, type KitStyle, type Piece } from "@/lib/marketing";
import { qrOrigin, SITE_URL } from "@/lib/site";
import { normaliseTheme } from "@/lib/theme";
import type { Row } from "./CrudList";

const STYLES: { k: KitStyle; label: string }[] = [
  { k: "bold", label: "Bold colour" },
  { k: "light", label: "Light" },
  { k: "dark", label: "Dark" },
];
const SWATCHES = ["#6E4BFF", "#FF5A4E", "#12A594", "#F0457F", "#FFB51F", "#0A84B5", "#2E7D4F", "#B8862B", "#1B1740"];

export default function MarketingKit({ venue }: { venue: Row }) {
  const theme = normaliseTheme(venue.theme);
  const brand = theme && theme.accent !== "#1B1740" ? theme.accent : "#6E4BFF";
  const storeKey = `patt-kit-${venue.id}`;
  const [kit, setKit] = useState<Kit>(() => defaultKit(venue.name_en, brand));
  const [piece, setPiece] = useState<Piece>("poster");
  const [logo, setLogo] = useState<string | null>(null);
  const [origin, setOrigin] = useState(SITE_URL);
  const [tables, setTables] = useState(12);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Edits are remembered on this computer, per venue.
  useEffect(() => {
    setOrigin(qrOrigin());
    try {
      const saved = localStorage.getItem(storeKey);
      if (saved) setKit((k) => ({ ...k, ...JSON.parse(saved) }));
    } catch {}
  }, [storeKey]);
  useEffect(() => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(kit));
    } catch {}
  }, [kit, storeKey]);
  useEffect(() => {
    if (venue.logo_url) toDataUrl(venue.logo_url).then(setLogo, () => setLogo(null));
  }, [venue.logo_url]);

  const set = <K extends keyof Kit>(k: K, v: Kit[K]) => setKit((x) => ({ ...x, [k]: v }));
  const setPoint = (i: number, patch: Partial<Kit["points"][number]>) => setKit((x) => ({ ...x, points: x.points.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));
  const spec = PIECES.find((p) => p.k === piece)!;
  const url = (t?: string | null) => `${origin}/v/${venue.slug}${t ? `/${t}` : ""}`;
  const svgFor = (p: Piece, t?: string | null) => pieceSvg(p, { kit, venueName: venue.name_en, logo, url: url(t), table: t });
  const preview = useMemo(() => svgFor(piece, piece === "card" ? "1" : null), [kit, logo, origin, piece]); // eslint-disable-line react-hooks/exhaustive-deps
  const thumbs = useMemo(() => Object.fromEntries(PIECES.map((p) => [p.k, svgFor(p.k, p.k === "card" ? "1" : null)])), [kit, logo, origin]); // eslint-disable-line react-hooks/exhaustive-deps

  async function downloadPdf() {
    setBusy(true);
    setMsg(null);
    try {
      const { jsPDF } = await import("jspdf");
      const wmm = spec.w / 10, hmm = spec.h / 10;
      const px = (mm: number) => Math.round((mm / 25.4) * 300); // 300 dpi
      const pages = piece === "card" ? Array.from({ length: tables }, (_, i) => String(i + 1)) : [null];
      const pdf = new jsPDF({ unit: "mm", format: [wmm, hmm], orientation: wmm > hmm ? "landscape" : "portrait" });
      for (let i = 0; i < pages.length; i++) {
        if (i) pdf.addPage([wmm, hmm], wmm > hmm ? "landscape" : "portrait");
        pdf.addImage(await svgToPngSized(svgFor(piece, pages[i]), px(wmm), px(hmm)), "PNG", 0, 0, wmm, hmm, undefined, "FAST");
      }
      pdf.save(`${venue.slug}-${piece}${piece === "card" ? `s-${tables}` : ""}.pdf`);
      setMsg({ ok: true, text: piece === "card" ? `Downloaded ${tables} table cards (A6, 300 dpi). Each one opens its own table.` : `Downloaded your ${spec.title.toLowerCase()} (${spec.size}, 300 dpi). Print at 100% / actual size.` });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not make the PDF." });
    } finally {
      setBusy(false);
    }
  }
  async function downloadPng() {
    setBusy(true);
    try {
      // Print pieces at 300 dpi, the Instagram post at its exact size.
      const k = spec.mm ? 300 / 254 : 1;
      const a = document.createElement("a");
      a.href = await svgToPngSized(preview, Math.round(spec.w * k), Math.round(spec.h * k));
      a.download = `${venue.slug}-${piece}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cd mk">
      <header className="cd-top">
        <div>
          <span className="eyebrow">Marketing kit</span>
          <h2>Posters, table cards &amp; more</h2>
          <p className="muted small">
            Ready to print, in your colours with your logo and QR code. Change the words, pick a style, then download. Every QR opens your live page, so you
            never need to reprint when your menu or games change.
          </p>
        </div>
        <div className="cd-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setKit(defaultKit(venue.name_en, brand))}>
            Reset words
          </button>
        </div>
      </header>

      <div className="mk-pieces" role="group" aria-label="Choose what to make">
        {PIECES.map((p) => (
          <button key={p.k} type="button" className="mk-piece" aria-pressed={piece === p.k} onClick={() => setPiece(p.k)}>
            <span className={`mk-thumb mk-thumb-${p.k}`} dangerouslySetInnerHTML={{ __html: thumbs[p.k] }} />
            <b>{p.title}</b>
            <span className="small muted">{p.size}</span>
          </button>
        ))}
      </div>

      <div className="cd-layout mk-layout">
        <aside className="cd-stage">
          <div className="cd-stage-inner mk-stage">
            <div className={`mk-preview mk-preview-${piece}`} dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
          <p className="cd-hint">
            {spec.note}
            {piece === "card" && " · preview shows table 1"}
          </p>
          {piece === "card" && (
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="mk-n">Number of tables</label>
              <input id="mk-n" type="number" min={1} max={200} value={tables} onChange={(e) => setTables(Math.min(200, Math.max(1, Number(e.target.value) || 1)))} />
            </div>
          )}
          {msg && (
            <p className={`status ${msg.ok ? "ok" : "bad"}`} role="status">
              {msg.text}
            </p>
          )}
          <div className="mk-dl">
            {spec.mm ? (
              <>
                <button type="button" className="btn btn-primary" onClick={downloadPdf} disabled={busy}>
                  {busy ? "Making PDF…" : piece === "card" ? `⬇ Download ${tables} table cards (PDF)` : "⬇ Download print PDF"}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={downloadPng} disabled={busy}>
                  PNG
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={downloadPng} disabled={busy}>
                {busy ? "Making image…" : "⬇ Download image for Instagram"}
              </button>
            )}
          </div>
        </aside>

        <div className="cd-steps">
          <section className="cd-step">
            <header>
              <span className="cd-num">1</span>
              <div>
                <h3>Style &amp; colour</h3>
                <p className="small muted">Starts with your brand colour from Guest page look.</p>
              </div>
            </header>
            <div className="cd-seg" role="group" aria-label="Style">
              {STYLES.map((s) => (
                <button key={s.k} type="button" aria-pressed={kit.style === s.k} onClick={() => set("style", s.k)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mk-swatches">
              {[brand, ...SWATCHES.filter((c) => c !== brand)].map((c) => (
                <button key={c} type="button" style={{ background: c }} aria-label={c} aria-pressed={kit.accent === c} onClick={() => set("accent", c)} />
              ))}
              <label className="mk-own" title="Pick any colour">
                <span style={{ background: kit.accent }} />
                <input type="color" value={kit.accent} onChange={(e) => set("accent", e.target.value.toUpperCase())} />
                Your own
              </label>
            </div>
            <label className="mk-check">
              <input type="checkbox" checked={kit.showLogo} onChange={(e) => set("showLogo", e.target.checked)} />
              Show {logo ? "my logo" : "my venue name"}
              {!logo && <span className="small muted"> (add a logo in Coaster studio or Details)</span>}
            </label>
          </section>

          <section className="cd-step">
            <header>
              <span className="cd-num">2</span>
              <div>
                <h3>Your words</h3>
                <p className="small muted">Short and clear works best from across the room.</p>
              </div>
            </header>
            <div className="field">
              <label htmlFor="mk-h">Headline</label>
              <input id="mk-h" maxLength={40} value={kit.headline} onChange={(e) => set("headline", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="mk-s">Line underneath (poster &amp; Instagram)</label>
              <input id="mk-s" maxLength={90} value={kit.sub} onChange={(e) => set("sub", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="mk-c">Button text</label>
              <input id="mk-c" maxLength={34} value={kit.cta} onChange={(e) => set("cta", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="mk-f">Small print</label>
              <input id="mk-f" maxLength={36} value={kit.footer} onChange={(e) => set("footer", e.target.value)} />
            </div>
          </section>

          <section className="cd-step">
            <header>
              <span className="cd-num">3</span>
              <div>
                <h3>What guests can do</h3>
                <p className="small muted">Three short lines, each with an icon. Leave one empty to hide it.</p>
              </div>
            </header>
            {kit.points.map((p, i) => (
              <div key={i} className="mk-point">
                <select aria-label={`Icon ${i + 1}`} value={p.icon} onChange={(e) => setPoint(i, { icon: e.target.value })}>
                  {KIT_ICONS.map((k) => (
                    <option key={k} value={k}>
                      {ICONS[k]?.label ?? k}
                    </option>
                  ))}
                </select>
                <input aria-label={`Line ${i + 1}`} maxLength={40} value={p.text} onChange={(e) => setPoint(i, { text: e.target.value })} />
              </div>
            ))}
          </section>

          <p className="small muted">
            Printing tips: ask for matte or satin paper (gloss glare stops phones scanning), print at 100% / actual size, and test-scan one copy before
            printing lots.
          </p>
        </div>
      </div>
    </div>
  );
}

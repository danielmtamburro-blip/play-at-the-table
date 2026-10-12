"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { removeVenueFile, uploadVenueFile } from "@/lib/upload";
import type { Row } from "./CrudList";

type Kind = "menu_pdf_url" | "drinks_pdf_url";

/** Choose between the built-in item-by-item menu and the venue's own PDF menus. */
export default function MenuSource({ venue }: { venue: Row }) {
  const router = useRouter();
  const [mode, setMode] = useState<"items" | "pdf">(venue.menu_mode === "pdf" ? "pdf" : "items");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const sb = () => getBrowserClient()!;

  async function saveMode(m: "items" | "pdf") {
    setMode(m);
    const { error } = await sb().from("venues").update({ menu_mode: m }).eq("id", venue.id);
    setMsg(error ? { ok: false, text: error.message } : { ok: true, text: m === "pdf" ? "Guests now see your PDF menus." : "Guests now see your item-by-item menu." });
    if (!error) router.refresh();
  }

  async function upload(kind: Kind, file: File) {
    setMsg(null);
    if (file.type !== "application/pdf") return setMsg({ ok: false, text: "Please choose a PDF file." });
    setBusy(kind);
    try {
      const url = await uploadVenueFile(venue.id, file, kind === "menu_pdf_url" ? "menu" : "drinks", "pdf");
      const { error } = await sb().from("venues").update({ [kind]: url }).eq("id", venue.id);
      if (error) throw new Error(error.message);
      if (venue[kind]) removeVenueFile(venue[kind]).catch(() => {});
      setMsg({ ok: true, text: "PDF uploaded." });
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  }

  async function remove(kind: Kind) {
    if (!confirm("Remove this PDF?")) return;
    const { error } = await sb().from("venues").update({ [kind]: "" }).eq("id", venue.id);
    if (error) return setMsg({ ok: false, text: error.message });
    removeVenueFile(venue[kind]).catch(() => {});
    router.refresh();
  }

  const slot = (kind: Kind, label: string, hint: string) => (
    <div className="pdf-slot">
      <div>
        <b>{label}</b>
        <br />
        {venue[kind] ? (
          <a href={venue[kind]} target="_blank" rel="noopener noreferrer" className="small">
            View current PDF ↗
          </a>
        ) : (
          <span className="small muted">{hint}</span>
        )}
      </div>
      <div className="g-row">
        <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
          {busy === kind ? "Uploading…" : venue[kind] ? "Replace" : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            hidden
            disabled={busy !== null}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) upload(kind, f);
            }}
          />
        </label>
        {venue[kind] && (
          <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(kind)}>
            Remove
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section className="panel">
      <h2>How guests see your menu</h2>
      <div className="choice-row" role="radiogroup" aria-label="Menu type">
        <label className={`choice${mode === "items" ? " on" : ""}`}>
          <input type="radio" name="menu-mode" checked={mode === "items"} onChange={() => saveMode("items")} />
          <span>
            <b>Item by item</b>
            <br />
            <span className="small muted">Add dishes below with prices, allergens and &ldquo;sold out&rdquo;. Best on phones, in English and Arabic.</span>
          </span>
        </label>
        <label className={`choice${mode === "pdf" ? " on" : ""}`}>
          <input type="radio" name="menu-mode" checked={mode === "pdf"} onChange={() => saveMode("pdf")} />
          <span>
            <b>Upload my own PDF</b>
            <br />
            <span className="small muted">Use the menu you already have. Guests open it from the Menu and Drinks buttons.</span>
          </span>
        </label>
      </div>
      {mode === "pdf" && (
        <div className="row-list">
          {slot("menu_pdf_url", "Food menu PDF", "Shown when guests tap Menu.")}
          {slot("drinks_pdf_url", "Drinks menu PDF (optional)", "If you skip this, the Drinks button shows your food PDF.")}
          {!venue.menu_pdf_url && <p className="status bad">⚠ Upload a food menu PDF. Until then, guests see your item-by-item menu.</p>}
        </div>
      )}
      {msg && <p className={`status ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
    </section>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { pdfToPng, removeVenueFile, uploadVenueFile } from "@/lib/upload";

/** Upload the venue logo shown at the top of the guest page (and on coasters). Saves straight away. */
export default function LogoUploader({ venueId, logoUrl }: { venueId: string; logoUrl: string }) {
  const router = useRouter();
  const [url, setUrl] = useState(logoUrl);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(next: string) {
    const { error } = await getBrowserClient()!.from("venues").update({ logo_url: next }).eq("id", venueId);
    if (error) throw new Error(error.message);
    if (url && url !== next) removeVenueFile(url).catch(() => {});
    setUrl(next);
    router.refresh();
  }

  async function onFile(file: File) {
    setMsg(null);
    setBusy(true);
    try {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf && !/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Please upload a PDF, PNG, JPG or WEBP file.");
      const blob = isPdf ? await pdfToPng(file) : file;
      const ext = isPdf ? "png" : file.type.split("/")[1].replace("jpeg", "jpg");
      await save(await uploadVenueFile(venueId, blob, "logo", ext));
      setMsg({ ok: true, text: "Logo saved. Guests see it at the top of your page." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="logo-up">
      <div className="logo-up-preview">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Your logo" />
        ) : (
          <span aria-hidden="true">🏷️</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <b>Your logo</b>
        <p className="small muted">Shown big at the top of your guest page and on your coasters. PDF, PNG, JPG or WEBP; a transparent background looks best.</p>
        <div className="g-row" style={{ marginTop: 8 }}>
          <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
            {busy ? "Uploading…" : url ? "Replace logo" : "Upload logo"}
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) onFile(f);
              }}
            />
          </label>
          {url && (
            <button type="button" className="btn btn-danger btn-sm" disabled={busy} onClick={() => save("").then(() => setMsg({ ok: true, text: "Logo removed." }))}>
              Remove
            </button>
          )}
        </div>
        {msg && <p className={`status ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
      </div>
    </div>
  );
}

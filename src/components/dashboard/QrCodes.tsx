"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** Venue + per-table QR codes. High error correction leaves room for a centre logo on coasters. */
export default function QrCodes({ slug, name }: { slug: string; name: string }) {
  const [tables, setTables] = useState(12);
  const [origin, setOrigin] = useState("");
  const [codes, setCodes] = useState<{ label: string; url: string; img: string }[]>([]);

  useEffect(() => setOrigin(location.origin), []);

  useEffect(() => {
    if (!origin) return;
    const targets = [
      { label: "Whole venue", url: `${origin}/v/${slug}` },
      ...Array.from({ length: tables }, (_, i) => ({ label: `Table ${i + 1}`, url: `${origin}/v/${slug}/${i + 1}` })),
    ];
    let live = true;
    Promise.all(
      targets.map(async (t) => ({
        ...t,
        img: await QRCode.toDataURL(t.url, { errorCorrectionLevel: "H", margin: 2, width: 600, color: { dark: "#1B1740", light: "#FFFFFF" } }),
      })),
    ).then((c) => live && setCodes(c));
    return () => {
      live = false;
    };
  }, [origin, slug, tables]);

  return (
    <section className="panel">
      <h2>QR codes</h2>
      <p className="muted small">
        Each code opens your live page, so you can change content without reprinting. Always test-scan a printed coaster before ordering in bulk.
      </p>
      <div className="inline-form">
        <div className="field" style={{ maxWidth: 200 }}>
          <label htmlFor="qr-n">Number of tables</label>
          <input id="qr-n" type="number" min={1} max={200} value={tables} onChange={(e) => setTables(Math.min(200, Math.max(1, Number(e.target.value) || 1)))} />
        </div>
      </div>
      <div className="qr-grid">
        {codes.map((c) => (
          <div key={c.url} className="qr-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt={`QR code for ${c.label}`} />
            <b>{c.label}</b>
            <a href={c.img} download={`${slug}-${c.label.toLowerCase().replace(/\s+/g, "-")}.png`}>
              Download PNG
            </a>
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="small" style={{ wordBreak: "break-all" }}>
              {c.url.replace(/^https?:\/\//, "")}
            </a>
          </div>
        ))}
      </div>
      <p className="muted small">QR codes for {name} point at {origin || "this site"}. If you move to a custom domain, download them again.</p>
    </section>
  );
}

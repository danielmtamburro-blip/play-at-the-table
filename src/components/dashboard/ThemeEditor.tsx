"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import GuestApp from "@/components/guest/GuestApp";
import { getBrowserClient } from "@/lib/supabase/client";
import { BASE_THEME, normaliseTheme, THEME_PRESETS, themeWarnings, type GuestTheme } from "@/lib/theme";
import type { Venue } from "@/lib/types";
import { removeVenueFile, uploadVenueFile } from "@/lib/upload";
import LogoUploader from "./LogoUploader";
import BrandCover from "@/components/guest/BrandCover";

const COLOURS: [keyof GuestTheme, string, string][] = [
  ["accent", "Brand colour", "Buttons and highlights"],
  ["bg", "Background", "Behind everything"],
  ["card", "Cards and header", "Panels guests read"],
  ["text", "Text", "Headings and words"],
];

function Swatch({ value, onChange, label, sub }: { value: string; onChange: (v: string) => void; label: string; sub: string }) {
  return (
    <label className="cd-colour">
      <span className="cd-swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />
      </span>
      <span>
        <b>{label}</b>
        <span className="small muted">
          {sub} · {value}
        </span>
      </span>
    </label>
  );
}

/** Venue branding for the guest page, with a live phone preview. */
export default function ThemeEditor({ venueId, saved, preview, logoUrl }: { venueId: string; saved: unknown; preview: Venue; logoUrl: string }) {
  const router = useRouter();
  const initial = normaliseTheme(saved);
  const [theme, setTheme] = useState<GuestTheme | null>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const t = theme ?? BASE_THEME;
  const set = <K extends keyof GuestTheme>(k: K, v: GuestTheme[K]) => setTheme({ ...t, [k]: v });
  const dirty = JSON.stringify(theme) !== JSON.stringify(initial);
  const warnings = theme ? themeWarnings(theme) : [];
  const active = THEME_PRESETS.findIndex((p) =>
    p.theme === null ? theme === null : theme !== null && Object.entries(p.theme).every(([k, v]) => theme[k as keyof GuestTheme] === v),
  );

  async function uploadBg(file: File) {
    setMsg(null);
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return setMsg({ ok: false, text: "Please choose a PNG, JPG or WEBP picture." });
    setBusy("upload");
    try {
      const url = await uploadVenueFile(venueId, file, "background", file.type.split("/")[1].replace("jpeg", "jpg"));
      setTheme({ ...t, bgImage: url });
      setMsg({ ok: true, text: "Picture added. Press Save to show it to guests." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    const { error } = await getBrowserClient()!.from("venues").update({ theme: theme ?? {} }).eq("id", venueId);
    setBusy(null);
    if (error) return setMsg({ ok: false, text: error.message });
    const old = initial?.bgImage;
    if (old && old !== theme?.bgImage) removeVenueFile(old).catch(() => {});
    setMsg({ ok: true, text: "Saved. Guests will see your new look within a minute." });
    router.refresh();
  }

  return (
    <div className="cd">
      <header className="cd-top">
        <div>
          <span className="eyebrow">Guest page look</span>
          <h2>Make the guest page yours</h2>
          <p className="muted small">Choose your colours and add a background picture. The phone shows exactly what guests see when they scan.</p>
        </div>
        <div className="cd-actions">
          {dirty && <span className="badge off">Unsaved changes</span>}
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy !== null || !dirty}>
            {busy === "save" ? "Saving…" : dirty ? "Save look" : "Saved ✓"}
          </button>
        </div>
      </header>
      {msg && <p className={`status ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}

      <div className="cd-layout">
        <aside className="cd-stage">
          <div className="phone theme-phone">
            <div className="phone-screen">
              <GuestApp key={previewKey} venue={{ ...preview, theme }} table="12" embedded />
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreviewKey((k) => k + 1)}>
            ↺ Back to the home screen
          </button>
        </aside>

        <div className="cd-steps">
          <section className="cd-step">
            <header>
              <span className="cd-num">1</span>
              <div>
                <h3>Start from a style</h3>
                <p className="small muted">Pick the closest, then fine-tune the colours.</p>
              </div>
            </header>
            <div className="theme-presets">
              {THEME_PRESETS.map((p, i) => {
                const pt = p.theme ? { ...BASE_THEME, ...p.theme } : BASE_THEME;
                return (
                  <button
                    key={p.name}
                    type="button"
                    className="theme-preset"
                    aria-pressed={active === i}
                    onClick={() => setTheme(p.theme ? { ...t, ...p.theme } : null)}
                  >
                    <span className="tp-swatch" style={{ background: pt.bg }}>
                      <span style={{ background: pt.card, color: pt.text }}>Aa</span>
                      <i style={{ background: p.theme ? pt.accent : "linear-gradient(90deg,#FF5A4E,#FFB51F,#12A594,#6E4BFF)" }} />
                    </span>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="cd-step">
            <header>
              <span className="cd-num">2</span>
              <div>
                <h3>Your colours</h3>
                <p className="small muted">Tap a swatch to pick any colour, or match your brand exactly.</p>
              </div>
            </header>
            <div className="cd-colours">
              {COLOURS.map(([k, label, sub]) => (
                <Swatch key={k} value={t[k] as string} onChange={(v) => set(k, v as never)} label={label} sub={sub} />
              ))}
            </div>
            <div>
              <b className="small">Home screen tiles</b>
              <div className="cd-seg" style={{ marginTop: 6 }}>
                <button type="button" aria-pressed={t.tiles === "colourful"} onClick={() => set("tiles", "colourful")}>
                  Colourful
                </button>
                <button type="button" aria-pressed={t.tiles === "brand"} onClick={() => set("tiles", "brand")}>
                  My brand colour
                </button>
              </div>
            </div>
            {warnings.map((w) => (
              <p key={w} className="status bad">
                ⚠ {w}
              </p>
            ))}
          </section>

          <section className="cd-step">
            <header>
              <span className="cd-num">3</span>
              <div>
                <h3>Cover</h3>
                <p className="small muted">The top of your page uses the Play at Your Table artwork. Show it in your brand colour or in our five colours.</p>
              </div>
            </header>
            <div className="cover-picks">
              {(
                [
                  ["venue", "My brand colour"],
                  ["brand", "Play at Your Table colours"],
                ] as const
              ).map(([mode, label]) => (
                <button key={mode} type="button" className="cover-pick" aria-pressed={t.cover === mode} onClick={() => setTheme({ ...t, cover: mode })}>
                  <span className="cover-pick-art">
                    <BrandCover accent={t.accent} mode={mode} />
                  </span>
                  {label}
                </button>
              ))}
            </div>
            <p className="small muted">Your brand colour is the one you picked in step 2.</p>
          </section>

          <section className="cd-step">
            <header>
              <span className="cd-num">4</span>
              <div>
                <h3>Background picture (optional)</h3>
                <p className="small muted">A photo or pattern behind your page (not the cover). PNG, JPG or WEBP up to 10 MB.</p>
              </div>
            </header>
            <div className="cd-drop has">
              {t.bgImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.bgImage} alt="Background" style={{ objectFit: "cover" }} />
              ) : (
                <span className="cd-drop-icon" aria-hidden="true">
                  🖼️
                </span>
              )}
              <div style={{ flex: 1 }}>
                <div className="g-row">
                  <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
                    {busy === "upload" ? "Uploading…" : t.bgImage ? "Replace picture" : "Upload picture"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      hidden
                      disabled={busy !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) uploadBg(f);
                      }}
                    />
                  </label>
                  {t.bgImage && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => set("bgImage", "")}>
                      Remove
                    </button>
                  )}
                </div>
                {t.bgImage && (
                  <label className="cd-range" style={{ marginTop: 10 }}>
                    <span>Colour overlay ({t.dim}%) · stronger keeps text easy to read</span>
                    <input type="range" min={0} max={90} value={t.dim} onChange={(e) => set("dim", Number(e.target.value))} />
                  </label>
                )}
              </div>
            </div>
          </section>

          <section className="cd-step">
            <header>
              <span className="cd-num">5</span>
              <div>
                <h3>Your logo</h3>
                <p className="small muted">Sits big at the top of the guest page, above &ldquo;Welcome to…&rdquo;.</p>
              </div>
            </header>
            <LogoUploader venueId={venueId} logoUrl={logoUrl} />
          </section>
        </div>
      </div>
    </div>
  );
}

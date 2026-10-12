"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

export default function CreateVenue() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const finalSlug = touched ? slug : slugify(name);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(finalSlug)) return setErr("The web address can use lowercase letters, numbers and dashes.");
    setBusy(true);
    const { data, error } = await getBrowserClient()!.rpc("create_venue", { p_slug: finalSlug, p_name: name });
    setBusy(false);
    if (error) return setErr(error.message.includes("duplicate") ? "That web address is taken. Try another." : error.message);
    location.assign(`/dashboard/${data}`);
  }

  return (
    <form className="panel" onSubmit={create}>
      <h2>Add a venue</h2>
      <div className="grid2">
        <div className="field">
          <label htmlFor="cv-name">Venue name</label>
          <input id="cv-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="cv-slug">Web address</label>
          <input
            id="cv-slug"
            value={finalSlug}
            onChange={(e) => {
              setTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
          />
          <span className="small muted">Guests will open /v/{finalSlug || "your-venue"}. This can&apos;t be changed later.</span>
        </div>
      </div>
      {err && <p className="status bad">{err}</p>}
      <div>
        <button className="btn btn-primary" disabled={busy || !name}>
          {busy ? "Creating…" : "Create venue"}
        </button>
      </div>
    </form>
  );
}

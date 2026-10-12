"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function PasswordForm() {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="panel"
      style={{ maxWidth: 480 }}
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await getBrowserClient()!.auth.updateUser({ password: pw });
        setMsg(error ? { ok: false, text: error.message } : { ok: true, text: "Password updated." });
        if (!error) setPw("");
      }}
    >
      <h2>Change password</h2>
      <div className="field">
        <label htmlFor="npw">New password</label>
        <input id="npw" type="password" minLength={8} required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      {msg && <p className={`status ${msg.ok ? "ok" : "bad"}`}>{msg.text}</p>}
      <div>
        <button className="btn btn-primary">Save password</button>
      </div>
    </form>
  );
}

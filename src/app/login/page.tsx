"use client";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { getBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("error"))
      setMsg({ ok: false, text: "That link has expired or was already used. Please sign in or request a new one." });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getBrowserClient();
    if (!sb) return setMsg({ ok: false, text: "Supabase isn't configured for this site." });
    setBusy(true);
    setMsg(null);
    const redirect = `${location.origin}/auth/callback?next=/dashboard`;
    try {
      if (mode === "in") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.assign("/dashboard");
        return;
      }
      if (mode === "up") {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: redirect } });
        if (error) throw error;
        if (data.session) return location.assign("/dashboard");
        setMsg({ ok: true, text: "Check your email for a confirmation link, then come back and sign in." });
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/dashboard/account` });
        if (error) throw error;
        setMsg({ ok: true, text: "If that email has an account, a reset link is on its way." });
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash">
      <header className="dash-top">
        <div className="wrap">
          <Logo />
        </div>
      </header>
      <main className="wrap">
        <div className="auth-box panel">
          <h1 style={{ fontSize: "1.8rem" }}>{mode === "up" ? "Create your venue account" : mode === "reset" ? "Reset your password" : "Venue login"}</h1>
          <p className="muted small">Edit your menu, offers and events, download table QR codes and see how guests use your page.</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="field">
              <label htmlFor="em">Email</label>
              <input id="em" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode !== "reset" && (
              <div className="field">
                <label htmlFor="pw">Password</label>
                <input
                  id="pw"
                  type="password"
                  minLength={8}
                  autoComplete={mode === "up" ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Please wait…" : mode === "up" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
            </button>
            {msg && (
              <p className={`status ${msg.ok ? "ok" : "bad"}`} role="status">
                {msg.text}
              </p>
            )}
          </form>
          <div className="small muted" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {mode !== "in" && (
              <button onClick={() => setMode("in")} style={linkStyle}>
                I have an account
              </button>
            )}
            {mode !== "up" && (
              <button onClick={() => setMode("up")} style={linkStyle}>
                Create an account
              </button>
            )}
            {mode !== "reset" && (
              <button onClick={() => setMode("reset")} style={linkStyle}>
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const linkStyle: React.CSSProperties = { border: 0, background: "none", padding: 0, textDecoration: "underline", color: "inherit" };

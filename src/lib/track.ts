"use client";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "./supabase/client";

/**
 * Aggregate, anonymous usage events. The session id is random per browser tab
 * and never linked to a person. Game answers and drawings are never sent.
 */
export type TrackEvent =
  | "scan" | "view" | "redeem" | "game_start" | "game_finish" | "time"
  | "menu_cat" | "offer_open" | "wifi_copy" | "directions" | "calendar" | "lang" | "pdf_open";

export type TrackOpts = { module?: string; table?: string | null; item?: string; value?: number; lang?: string };

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("patt-sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("patt-sid", id);
    }
    return id;
  } catch {
    return "nostorage";
  }
}

/** Plain REST insert with keepalive, so it still sends while the page is closing. */
export function track(venueId: string, event: TrackEvent, opts: TrackOpts = {}) {
  if (venueId === "sample" || !supabaseConfigured) return;
  const row = {
    venue_id: venueId,
    event,
    module: opts.module ?? null,
    table_label: opts.table ?? null,
    item: opts.item ? opts.item.slice(0, 80) : null,
    value: opts.value ?? null,
    lang: opts.lang ?? null,
    session_id: sessionId(),
  };
  fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
    method: "POST",
    keepalive: true,
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  }).catch(() => {});
}

/**
 * Counts seconds the page is actually visible and reports them whenever the guest
 * leaves or switches away (summed per visit on the server). Returns a cleanup function.
 */
export function trackTimeOnPage(venueId: string, opts: () => TrackOpts): () => void {
  let since = document.visibilityState === "visible" ? Date.now() : 0;
  const flush = () => {
    if (!since) return;
    const secs = Math.round((Date.now() - since) / 1000);
    since = 0;
    if (secs >= 2) track(venueId, "time", { ...opts(), value: Math.min(secs, 4 * 3600) });
  };
  const onVis = () => {
    if (document.visibilityState === "hidden") flush();
    else since = Date.now();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pagehide", flush);
  return () => {
    flush();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("pagehide", flush);
  };
}

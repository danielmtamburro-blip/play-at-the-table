"use client";
import { getBrowserClient } from "./supabase/client";

/**
 * Aggregate, anonymous usage events. The session id is random per browser tab
 * and never linked to a person. Game answers and drawings are never sent.
 */
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

export function track(venueId: string, event: "scan" | "view" | "redeem", opts: { module?: string; table?: string } = {}) {
  if (venueId === "sample") return;
  const sb = getBrowserClient();
  if (!sb) return;
  sb.from("analytics_events")
    .insert({ venue_id: venueId, event, module: opts.module ?? null, table_label: opts.table ?? null, session_id: sessionId() })
    .then(({ error }) => {
      if (error) console.warn("track", error.message);
    });
}

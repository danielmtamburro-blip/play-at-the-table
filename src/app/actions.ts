"use server";
import { getPublicClient } from "@/lib/supabase/server";

export type PilotState = { ok: boolean; error?: string; summary?: string } | null;

const clip = (v: FormDataEntryValue | null, n: number) => String(v ?? "").trim().slice(0, n);

export async function submitPilot(_prev: PilotState, form: FormData): Promise<PilotState> {
  // Honeypot: real people never fill this hidden field.
  if (clip(form.get("website"), 200)) return { ok: true };

  const row = {
    venue_name: clip(form.get("venue"), 200),
    area: clip(form.get("area"), 200),
    venue_type: clip(form.get("type"), 100),
    tables: clip(form.get("tables"), 20),
    contact_name: clip(form.get("name"), 200),
    contact: clip(form.get("contact"), 200),
    notes: clip(form.get("notes"), 2000),
  };
  if (!row.venue_name || !row.contact_name || row.contact.length < 3) {
    return { ok: false, error: "Please fill in your venue name, your name and a phone number or email." };
  }

  const summary = [
    "Pilot request: Play at Your Table",
    `Venue: ${row.venue_name}`,
    `Area: ${row.area || "-"}`,
    `Type: ${row.venue_type}`,
    `Tables: ${row.tables || "-"}`,
    `Contact: ${row.contact_name}, ${row.contact}`,
    `Notes: ${row.notes || "-"}`,
  ].join("\n");

  const sb = getPublicClient();
  if (!sb) return { ok: false, error: "We couldn't save your request just now. Please email us instead.", summary };
  const { error } = await sb.from("pilot_requests").insert(row);
  if (error) {
    console.error("pilot_requests insert", error.message);
    return { ok: false, error: "We couldn't save your request just now. Please email us instead.", summary };
  }
  return { ok: true, summary };
}

"use server";
import { esc, sendEmail, shell, TEAM_INBOX } from "@/lib/email";
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
  await notifyPilot(row);
  return { ok: true, summary };
}

/** Emails the team about a new pilot request, and thanks the venue if they left an email address. */
async function notifyPilot(row: { venue_name: string; area: string; venue_type: string; tables: string; contact_name: string; contact: string; notes: string }) {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.contact) ? row.contact : "";
  // UAE numbers like 055 123 4567 become 971551234567 for a WhatsApp link.
  const digits = row.contact.replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/^00/, "").replace(/^0(?=5)/, "971");
  const phone = !email && digits.length >= 9 ? digits : "";
  const lines: [string, string][] = [
    ["Venue", row.venue_name], ["Area", row.area || "-"], ["Type", row.venue_type || "-"], ["Tables", row.tables || "-"],
    ["Name", row.contact_name], ["Phone or email", row.contact], ["Notes", row.notes || "-"],
  ];
  const table = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:6px 0 16px">${lines
    .map(([k, v]) => `<tr><td style="padding:7px 0;border-bottom:1px solid #EEE9FF;color:#7A7399;width:130px;vertical-align:top">${k}</td><td style="padding:7px 0;border-bottom:1px solid #EEE9FF;color:#1B1740;font-weight:600">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
  const button = (href: string, label: string, bg: string) =>
    `<a href="${href}" style="display:inline-block;background:${bg};color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:999px;margin:0 8px 8px 0">${label}</a>`;
  const actions = [
    email ? button(`mailto:${email}`, `Email ${esc(row.contact_name)}`, "#6E4BFF") : "",
    phone ? button(`https://wa.me/${phone}`, "WhatsApp them", "#25D366") : "",
    phone ? button(`tel:+${phone}`, "Call", "#1B1740") : "",
  ].join("");

  await sendEmail({
    to: TEAM_INBOX,
    replyTo: email || undefined,
    subject: `New pilot request: ${row.venue_name}${row.area ? ` (${row.area})` : ""}`,
    html: shell("New pilot request 🎉", `<p style="margin:0 0 6px">Someone just asked for a free pilot on playatyourtable.com.</p>${table}${actions}`),
    text: `New pilot request\n\n${lines.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
  });

  if (email)
    await sendEmail({
      to: email,
      replyTo: TEAM_INBOX,
      subject: "Thanks! Your Play at Your Table pilot request is in",
      html: shell(`Thanks, ${row.contact_name.split(" ")[0]}!`, `<p style="margin:0 0 12px">We've got your request for a free pilot at <b>${esc(row.venue_name)}</b>. We'll be in touch within two working days to set it up.</p>
        <p style="margin:0 0 12px">While you wait, have a play with our live demo: it's exactly what your guests will see when they scan the QR on their table.</p>
        <p style="margin:0 0 16px"><a href="https://playatyourtable.com/v/saffron-terrace/12" style="display:inline-block;background:#FFB51F;color:#1B1740;text-decoration:none;font-weight:800;padding:12px 20px;border-radius:999px">Open the live demo</a></p>
        <p style="margin:0">Any questions, just reply to this email or WhatsApp us on +971 55 662 7796.</p>`),
      text: `Thanks, ${row.contact_name}!\n\nWe've got your request for a free pilot at ${row.venue_name}. We'll be in touch within two working days.\n\nTry the live demo: https://playatyourtable.com/v/saffron-terrace/12\n\nAny questions, just reply or WhatsApp +971 55 662 7796.\n\nPlay at Your Table`,
    });
}

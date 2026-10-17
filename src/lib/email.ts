import "server-only";
// Sends email through Resend (resend.com). Needs RESEND_API_KEY; without it, sending is skipped quietly.

export const FROM = "Play at Your Table <hello@playatyourtable.com>";
export const TEAM_INBOX = "hello@playatyourtable.com";

type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

export async function sendEmail(m: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not set: email not sent:", m.subject);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("Resend request failed", e);
    return false;
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Branded email shell: colour stripe, logo line, content, footer. */
export function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#F4F1FF;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1B1740">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1FF;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="height:8px;background:linear-gradient(90deg,#FF5A4E 0 20%,#FFB51F 20% 40%,#12A594 40% 60%,#6E4BFF 60% 80%,#F0457F 80%);background-color:#6E4BFF"></td></tr>
<tr><td style="padding:22px 26px 6px"><img src="https://playatyourtable.com/brand/email-logo.png" alt="Play at Your Table" height="34" style="display:block;height:34px"></td></tr>
<tr><td style="padding:6px 26px 4px"><h1 style="margin:0;font-size:22px;line-height:1.25">${esc(title)}</h1></td></tr>
<tr><td style="padding:8px 26px 24px;font-size:15px;line-height:1.55;color:#3D3766">${body}</td></tr>
<tr><td style="padding:14px 26px;background:#1B1740;color:#CFC8F2;font-size:12px">Play at Your Table · Dubai · <a href="https://playatyourtable.com" style="color:#FFD27A">playatyourtable.com</a> · @playatyourtable</td></tr>
</table></td></tr></table></body></html>`;
}

export { esc };

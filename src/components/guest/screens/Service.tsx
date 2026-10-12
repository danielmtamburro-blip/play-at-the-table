"use client";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { EXTRA, useGuest, type ExtraKey } from "../context";

/* ---------- Call server / Bill please (home screen) ---------- */

export function ServiceBar({ demo }: { demo: boolean }) {
  const { venue, table, lang, log } = useGuest();
  const x = EXTRA[lang];
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cool, setCool] = useState<Record<string, boolean>>({});
  if (!venue.modules.service) return null;

  async function call(kind: "server" | "bill") {
    if (!table) return setMsg({ ok: false, text: x.noTable });
    setCool((c) => ({ ...c, [kind]: true }));
    setTimeout(() => setCool((c) => ({ ...c, [kind]: false })), 60_000);
    const done: ExtraKey = kind === "bill" ? "billCalled" : "called";
    if (demo || venue.id === "sample") return setMsg({ ok: true, text: x[done] });
    const { error } = await getBrowserClient()!.from("service_requests").insert({ venue_id: venue.id, table_label: table, kind });
    if (!error) {
      log("view", { module: kind === "bill" ? "service_bill" : "service_call" });
      return setMsg({ ok: true, text: x[done] });
    }
    setMsg(error.code === "23505" ? { ok: true, text: x.already } : { ok: false, text: x.tryLater });
  }

  return (
    <div className="g-service">
      <div className="g-row">
        <button className="g-btn service" onClick={() => call("server")} disabled={cool.server}>
          🙋 {x.callServer}
        </button>
        <button className="g-btn service alt" onClick={() => call("bill")} disabled={cool.bill}>
          🧾 {x.billPlease}
        </button>
      </div>
      {msg && (
        <p className={`g-service-msg${msg.ok ? "" : " bad"}`} role="status">
          {msg.text}
        </p>
      )}
    </div>
  );
}

/* ---------- Feedback ---------- */

const FACES = ["😞", "🙁", "😐", "🙂", "😍"];

export function Feedback({ demo, onDone }: { demo: boolean; onDone: () => void }) {
  const { venue, table, lang } = useGuest();
  const x = EXTRA[lang];
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"form" | "sending" | "sent" | "error">("form");

  async function send() {
    if (!rating) return;
    setState("sending");
    if (demo || venue.id === "sample") return setState("sent");
    const { error } = await getBrowserClient()!
      .from("feedback")
      .insert({ venue_id: venue.id, table_label: table, rating, comment: comment.trim().slice(0, 500), lang });
    setState(error ? "error" : "sent");
  }

  if (state === "sent")
    return (
      <div className="prompt group" style={{ minHeight: 260 }}>
        <p style={{ fontSize: "3rem" }}>{rating ? FACES[rating - 1] : "🙏"}</p>
        <p>{x.fbThanks}</p>
        <span style={{ fontSize: ".95rem" }}>{x.fbThanksSub}</span>
        <div>
          <button className="g-btn" style={{ background: "#fff", color: "#1B1740" }} onClick={onDone}>
            {x.fbDone}
          </button>
        </div>
      </div>
    );

  return (
    <>
      <div>
        <h2 className="g-h">{x.fbTitle}</h2>
        <p className="g-sub">{x.fbSub}</p>
      </div>
      <div className="faces" role="radiogroup" aria-label={x.fbTitle}>
        {FACES.map((f, i) => (
          <button key={f} role="radio" aria-checked={rating === i + 1} onClick={() => setRating(i + 1)}>
            <span aria-hidden="true">{f}</span>
            <small>{x[`fb${i + 1}` as ExtraKey]}</small>
          </button>
        ))}
      </div>
      <label className="g-sub" htmlFor="fb-comment">
        {x.fbComment}
      </label>
      <textarea id="fb-comment" className="g-textarea" maxLength={500} rows={4} value={comment} onChange={(e) => setComment(e.target.value)} />
      {state === "error" && <p className="g-service-msg bad">{x.tryLater}</p>}
      <button className="g-btn" disabled={!rating || state === "sending"} onClick={send}>
        {state === "sending" ? "…" : x.fbSend}
      </button>
    </>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { arabicPairs, useAutoArabic } from "@/lib/autoArabic";
import { getBrowserClient } from "@/lib/supabase/client";
import ArabicLabel from "./ArabicLabel";

export type Row = Record<string, any>;

export type Field = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "multi" | "time" | "date";
  options?: [value: string, label: string][];
  required?: boolean;
  full?: boolean;
  dir?: "rtl";
  hint?: string;
};

type Props = {
  table: "menu_categories" | "menu_items" | "events" | "offers";
  rows: Row[];
  fields: Field[];
  /** Values every new row starts with (venue_id, category_id, …). */
  defaults: Row;
  title: (r: Row) => string;
  badges?: (r: Row) => { text: string; tone?: "on" | "off" }[];
  /** Spec-required admin warnings, e.g. an offer without terms. */
  warn?: (r: Row) => string | null;
  addLabel: string;
  emptyText?: string;
};

function toDb(fields: Field[], draft: Row): Row {
  const out: Row = {};
  for (const f of fields) {
    let v = draft[f.key];
    if (f.type === "number") v = v === "" || v == null ? (f.required ? 0 : null) : Number(v);
    else if ((f.type === "date" || f.type === "time" || f.type === "select") && v === "") v = null;
    else if (f.type === "checkbox") v = Boolean(v);
    else if (f.type === "multi") v = Array.isArray(v) ? v : [];
    else if (typeof v === "string") v = v.trim();
    out[f.key] = v;
  }
  return out;
}

function Editor({ row, props, onDone }: { row: Row; props: Props; onDone: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Row>(row);
  const [state, setState] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  const ar = useAutoArabic(draft, (k, v) => set(k, v), arabicPairs(props.fields.map((f) => f.key)));
  const isNew = !row.id;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const sb = getBrowserClient()!;
    setBusy(true);
    const values = toDb(props.fields, draft);
    const { error } = isNew
      ? await sb.from(props.table).insert({ ...props.defaults, ...values })
      : await sb.from(props.table).update(values).eq("id", row.id);
    setBusy(false);
    if (error) return setState({ ok: false, text: error.message });
    setState({ ok: true, text: "Saved. Live on the guest page within a minute." });
    router.refresh();
    if (isNew) onDone();
  }

  async function remove() {
    if (!confirm(`Delete "${props.title(row) || "this item"}"? This can't be undone.`)) return;
    const { error } = await getBrowserClient()!.from(props.table).delete().eq("id", row.id);
    if (error) return setState({ ok: false, text: error.message });
    router.refresh();
  }

  const warning = props.warn?.(draft);

  return (
    <form className="row-body" onSubmit={save}>
      <div className="grid2">
        {props.fields.map((f) => {
          const id = `${props.table}-${row.id ?? "new"}-${f.key}`;
          const v = draft[f.key];
          if (f.type === "checkbox")
            return (
              <label key={f.key} className="check">
                <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}
              </label>
            );
          if (f.type === "multi")
            return (
              <fieldset key={f.key} className="field full" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="small" style={{ fontWeight: 500, marginBottom: 6 }}>
                  {f.label}
                </legend>
                <div className="checks">
                  {f.options!.map(([val, lab]) => {
                    const list: string[] = Array.isArray(v) ? v : [];
                    return (
                      <label key={val} className="check">
                        <input
                          type="checkbox"
                          checked={list.includes(val)}
                          onChange={(e) => set(f.key, e.target.checked ? [...list, val] : list.filter((x) => x !== val))}
                        />
                        {lab}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          return (
            <div key={f.key} className={`field${f.full || f.type === "textarea" ? " full" : ""}`}>
              {f.dir === "rtl" && f.key.endsWith("_ar") ? (
                <ArabicLabel htmlFor={id} label={f.label} busy={ar.busy.has(f.key.slice(0, -3))} onTranslate={() => ar.now(f.key.slice(0, -3))} />
              ) : (
                <label htmlFor={id}>{f.label}</label>
              )}
              {f.type === "textarea" ? (
                <textarea id={id} dir={f.dir} value={v ?? ""} onChange={(e) => (f.dir === "rtl" && ar.manual(f.key), set(f.key, e.target.value))} />
              ) : f.type === "select" ? (
                <select id={id} value={v ?? ""} required={f.required} onChange={(e) => set(f.key, e.target.value)}>
                  {!f.required && <option value="">—</option>}
                  {f.options!.map(([val, lab]) => (
                    <option key={val} value={val}>
                      {lab}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  dir={f.dir}
                  type={f.type}
                  step={f.type === "number" ? "0.01" : undefined}
                  min={f.type === "number" ? 0 : undefined}
                  required={f.required}
                  value={v == null ? "" : f.type === "time" ? String(v).slice(0, 5) : v}
                  onChange={(e) => (f.dir === "rtl" && ar.manual(f.key), set(f.key, e.target.value))}
                />
              )}
              {f.hint && <span className="small muted">{f.hint}</span>}
            </div>
          );
        })}
      </div>
      {warning && <p className="status bad">⚠ {warning}</p>}
      <div className="g-row" style={{ alignItems: "center" }}>
        <button className="btn btn-primary btn-sm" disabled={busy}>
          {busy ? "Saving…" : isNew ? "Add" : "Save changes"}
        </button>
        {isNew ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>
            Cancel
          </button>
        ) : (
          <button type="button" className="btn btn-danger btn-sm" onClick={remove}>
            Delete
          </button>
        )}
        {state && <span className={`status ${state.ok ? "ok" : "bad"}`}>{state.text}</span>}
      </div>
    </form>
  );
}

export default function CrudList(props: Props) {
  const [adding, setAdding] = useState(false);
  const blank = Object.fromEntries(props.fields.map((f) => [f.key, f.type === "multi" ? [] : f.type === "checkbox" ? false : ""]));

  return (
    <div className="row-list">
      {props.rows.length === 0 && !adding && props.emptyText && <p className="muted small">{props.emptyText}</p>}
      {props.rows.map((r) => {
        const w = props.warn?.(r);
        return (
          <details key={r.id} className="row-card">
            <summary>
              <b>{props.title(r) || "(untitled)"}</b>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {w && <span className="badge off">Needs attention</span>}
                {props.badges?.(r).map((b) => (
                  <span key={b.text} className={`badge ${b.tone ?? ""}`}>
                    {b.text}
                  </span>
                ))}
              </span>
            </summary>
            <Editor row={r} props={props} onDone={() => {}} />
          </details>
        );
      })}
      {adding ? (
        <div className="row-card">
          <Editor row={{ ...blank, ...props.defaults, id: undefined }} props={props} onDone={() => setAdding(false)} />
        </div>
      ) : (
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
            + {props.addLabel}
          </button>
        </div>
      )}
    </div>
  );
}

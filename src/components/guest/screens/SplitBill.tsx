"use client";
// Split the bill: type the total and how many people, with an optional tip.
import { useState } from "react";
import type { Lang } from "@/lib/types";
import { useGuest } from "../context";
import { GameHead } from "./Engines";

const UI: Record<Lang, Record<string, string>> = {
  en: {
    total: "Bill total", people: "How many people?", tip: "Add a tip?", none: "No tip", each: "each", withTip: "Total with tip",
    rounded: "Rounded up", fewer: "One less person", more: "One more person", typeTotal: "Type the bill total to see everyone's share.",
  },
  ar: {
    total: "إجمالي الحساب", people: "كم شخصاً؟", tip: "إضافة إكرامية؟", none: "بدون", each: "لكل شخص", withTip: "الإجمالي مع الإكرامية",
    rounded: "مقرّب للأعلى", fewer: "شخص أقل", more: "شخص إضافي", typeTotal: "اكتب إجمالي الحساب لترى نصيب كل شخص.",
  },
};

const TIPS = [0, 5, 10, 15];
const money = (n: number, locale: string) => n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function SplitBill({ k }: { k: string }) {
  const { lang, locale, tr } = useGuest();
  const ui = UI[lang];
  const [raw, setRaw] = useState("");
  const [people, setPeople] = useState(2);
  const [tip, setTip] = useState(0);
  const bill = Number(raw.replace(/[^\d.]/g, "")) || 0;
  const total = bill * (1 + tip / 100);
  const each = people > 0 ? total / people : 0;

  return (
    <>
      <GameHead k={k} />
      <div className="split-card">
        <label htmlFor="split-total" className="split-label">
          {ui.total}
        </label>
        <div className="split-amount">
          <span>{tr("aed")}</span>
          <input
            id="split-total"
            inputMode="decimal"
            placeholder="0.00"
            value={raw}
            onChange={(e) => setRaw(e.target.value.replace(/[^\d.]/g, "").slice(0, 9))}
            autoComplete="off"
          />
        </div>

        <span className="split-label">{ui.people}</span>
        <div className="split-people">
          <button onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label={ui.fewer}>
            −
          </button>
          <b aria-live="polite">
            {people} <span aria-hidden="true">{"🧑".repeat(Math.min(people, 6))}</span>
          </b>
          <button onClick={() => setPeople((p) => Math.min(50, p + 1))} aria-label={ui.more}>
            +
          </button>
        </div>

        <span className="split-label">{ui.tip}</span>
        <div className="g-seg">
          {TIPS.map((t) => (
            <button key={t} type="button" aria-pressed={tip === t} onClick={() => setTip(t)}>
              {t === 0 ? ui.none : `${t}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="split-result" aria-live="polite">
        {bill > 0 ? (
          <>
            <small>{ui.each}</small>
            <b>
              {tr("aed")} {money(each, locale)}
            </b>
            <span>
              {tip > 0 && `${ui.withTip}: ${tr("aed")} ${money(total, locale)} · `}
              {ui.rounded}: {tr("aed")} {Math.ceil(each)}
            </span>
          </>
        ) : (
          <span>{ui.typeTotal}</span>
        )}
      </div>
    </>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";

type Values = Record<string, unknown>;

export async function translateToArabic(texts: Record<string, string>): Promise<Record<string, string>> {
  const r = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts }),
  });
  const j = (await r.json().catch(() => ({}))) as { translations?: Record<string, string>; error?: string };
  if (!r.ok) throw new Error(j.error ?? "Translation failed.");
  return j.translations ?? {};
}

/**
 * Fills each "<x>_ar" field from its "<x>_en" partner a moment after the venue stops typing,
 * as long as the Arabic is empty or was filled in automatically. Typing in an Arabic box
 * yourself switches automatic translation off for that box.
 */
export function useAutoArabic(values: Values, setValue: (key: string, v: string) => void, pairs: string[]) {
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const auto = useRef<Set<string>>(new Set()); // Arabic keys we filled ourselves
  const lastEn = useRef<Record<string, string>>({});
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Remember the starting English so opening a form doesn't trigger translations.
  useEffect(() => {
    for (const base of pairs) lastEn.current[base] = String(values[`${base}_en`] ?? "");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enKey = pairs.map((b) => String(values[`${b}_en`] ?? "")).join("\u0001");
  useEffect(() => {
    const t = setTimeout(async () => {
      const todo: Record<string, string> = {};
      for (const base of pairs) {
        const en = String(valuesRef.current[`${base}_en`] ?? "").trim();
        const ar = String(valuesRef.current[`${base}_ar`] ?? "").trim();
        if (!en || en === lastEn.current[base]) continue;
        if (ar && !auto.current.has(`${base}_ar`)) continue; // venue wrote their own Arabic
        todo[base] = en;
      }
      if (!Object.keys(todo).length) return;
      Object.entries(todo).forEach(([b, en]) => (lastEn.current[b] = en));
      setBusy(new Set(Object.keys(todo)));
      try {
        const out = await translateToArabic(todo);
        for (const [base, ar] of Object.entries(out)) {
          if (!ar) continue;
          auto.current.add(`${base}_ar`);
          setValue(`${base}_ar`, ar);
        }
      } catch {
        // Quietly skip: the venue can press Translate or type the Arabic.
      } finally {
        setBusy(new Set());
      }
    }, 1100);
    return () => clearTimeout(t);
  }, [enKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Call when the venue edits an Arabic box by hand. */
  const manual = (arKey: string) => auto.current.delete(arKey);

  /** Translate one field now (the "Translate" button). */
  const now = async (base: string) => {
    const en = String(valuesRef.current[`${base}_en`] ?? "").trim();
    if (!en) return;
    setBusy(new Set([base]));
    try {
      const out = await translateToArabic({ [base]: en });
      if (out[base]) {
        auto.current.add(`${base}_ar`);
        lastEn.current[base] = en;
        setValue(`${base}_ar`, out[base]);
      }
    } finally {
      setBusy(new Set());
    }
  };

  return { busy, manual, now };
}

/** "name_en" + "name_ar" in a list of keys → ["name"]. */
export const arabicPairs = (keys: string[]) => keys.filter((k) => k.endsWith("_en") && keys.includes(k.replace(/_en$/, "_ar"))).map((k) => k.slice(0, -3));

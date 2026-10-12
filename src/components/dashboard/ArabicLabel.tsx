"use client";

/** Label for an Arabic box, with a Translate button and a "translating…" hint. */
export default function ArabicLabel({ htmlFor, label, busy, onTranslate }: { htmlFor: string; label: string; busy: boolean; onTranslate: () => void }) {
  return (
    <span className="ar-label">
      <label htmlFor={htmlFor}>{label}</label>
      {busy ? (
        <span className="ar-busy">Translating…</span>
      ) : (
        <button type="button" className="ar-btn" onClick={onTranslate} title="Translate from the English box">
          ✨ Translate
        </button>
      )}
    </span>
  );
}

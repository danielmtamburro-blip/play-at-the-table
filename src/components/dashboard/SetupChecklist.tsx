import type { Row } from "./CrudList";

/** Getting-started steps for a new venue. Disappears once everything is done. */
export default function SetupChecklist({ venue }: { venue: Row }) {
  const hasItems = (venue.menu_categories ?? []).some((c: Row) => (c.menu_items ?? []).length > 0);
  const steps = [
    { tab: "details", label: "Add your venue details (area, hours, Wi-Fi)", done: Boolean(venue.area_en && venue.hours_en) },
    { tab: "menu", label: "Add your menu, or upload your PDF menu", done: venue.menu_mode === "pdf" ? Boolean(venue.menu_pdf_url) : hasItems },
    { tab: "games", label: "Choose which games guests can play", done: Boolean(venue.games?._saved) },
    { tab: "coaster", label: "Design your coaster and add your logo", done: Object.keys(venue.coaster ?? {}).length > 0 },
    { tab: "details", label: "Switch your page live", done: Boolean(venue.published) },
  ];
  const left = steps.filter((s) => !s.done).length;
  if (left === 0) return null;

  return (
    <details className="panel checklist" open={left >= 3}>
      <summary>
        <b>Get your venue ready</b> <span className="muted small">· {steps.length - left} of {steps.length} done</span>
      </summary>
      <ol>
        {steps.map((s) => (
          <li key={s.label} className={s.done ? "done" : ""}>
            <span aria-hidden="true">{s.done ? "✓" : "○"}</span>
            {s.done ? <span>{s.label}</span> : <a href={`?tab=${s.tab}`}>{s.label}</a>}
          </li>
        ))}
      </ol>
    </details>
  );
}

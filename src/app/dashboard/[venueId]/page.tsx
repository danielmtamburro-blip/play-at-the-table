import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashHeader from "@/components/dashboard/DashHeader";
import { EventsEditor, MenuEditor, OffersEditor } from "@/components/dashboard/editors";
import ProfileForm from "@/components/dashboard/ProfileForm";
import QrCodes from "@/components/dashboard/QrCodes";
import Stats from "@/components/dashboard/Stats";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit venue · Play at the Table", robots: { index: false } };
export const dynamic = "force-dynamic";

const TABS = [
  ["details", "Details"],
  ["menu", "Menu"],
  ["events", "What's on"],
  ["offers", "Offers"],
  ["qr", "QR codes"],
  ["stats", "Stats"],
] as const;

export default async function VenueDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ venueId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ venueId }, { tab: rawTab }] = await Promise.all([params, searchParams]);
  const tab = TABS.some(([k]) => k === rawTab) ? rawTab! : "details";
  const { sb, user } = await requireUser();

  // Published venues are readable by anyone, so check membership explicitly.
  const { data: member } = await sb.from("venue_members").select("role").eq("venue_id", venueId).eq("user_id", user.id).maybeSingle();
  if (!member) notFound();

  const { data: venue } = await sb
    .from("venues")
    .select("*, menu_categories(*, menu_items(*)), events(*), offers(*)")
    .eq("id", venueId)
    .maybeSingle();
  if (!venue) notFound();

  return (
    <div className="dash">
      <DashHeader email={user.email ?? ""} />
      <main className="wrap dash-main">
        <a href="/dashboard" className="small muted">
          ← All venues
        </a>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h1>{venue.name_en}</h1>
            <p className="muted small">
              {venue.published ? "Live" : "Draft (only you can see it)"} · /v/{venue.slug}
            </p>
          </div>
          <a className="btn btn-ghost btn-sm" href={`/v/${venue.slug}`} target="_blank" rel="noopener noreferrer">
            Open guest page ↗
          </a>
        </div>
        <nav className="tabs" aria-label="Venue sections">
          {TABS.map(([k, label]) => (
            <a key={k} href={`?tab=${k}`} aria-current={tab === k ? "page" : undefined}>
              {label}
            </a>
          ))}
        </nav>

        {tab === "details" && <ProfileForm venue={venue} />}
        {tab === "menu" && <MenuEditor venueId={venue.id} categories={venue.menu_categories ?? []} />}
        {tab === "events" && <EventsEditor venueId={venue.id} events={venue.events ?? []} />}
        {tab === "offers" && <OffersEditor venueId={venue.id} offers={venue.offers ?? []} />}
        {tab === "qr" && <QrCodes slug={venue.slug} name={venue.name_en} />}
        {tab === "stats" && <Stats venueId={venue.id} />}
      </main>
    </div>
  );
}

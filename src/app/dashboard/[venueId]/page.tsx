import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DashHeader from "@/components/dashboard/DashHeader";
import CoasterDesigner from "@/components/dashboard/CoasterDesigner";
import { EventsEditor, MenuEditor, NearbyEditor, OffersEditor } from "@/components/dashboard/editors";
import FeedbackTab from "@/components/dashboard/FeedbackTab";
import ScoresTab from "@/components/dashboard/ScoresTab";
import GamesEditor from "@/components/dashboard/GamesEditor";
import MenuSource from "@/components/dashboard/MenuSource";
import SetupChecklist from "@/components/dashboard/SetupChecklist";
import ProfileForm from "@/components/dashboard/ProfileForm";
import QrCodes from "@/components/dashboard/QrCodes";
import StaffRequests from "@/components/dashboard/StaffRequests";
import Stats from "@/components/dashboard/Stats";
import ThemeEditor from "@/components/dashboard/ThemeEditor";
import { requireUser } from "@/lib/auth";
import { moduleOn } from "@/lib/types";
import { rowToVenue } from "@/lib/venueMap";

export const metadata: Metadata = { title: "Edit venue · Play at Your Table", robots: { index: false } };
export const dynamic = "force-dynamic";

const TABS = [
  ["details", "Details", "🏠"],
  ["menu", "Menu", "🍽️"],
  ["games", "Games", "🎲"],
  ["events", "What's on", "🎵"],
  ["offers", "Offers", "🏷️"],
  ["nearby", "Nearby", "📍"],
  ["look", "Guest page look", "🖌️"],
  ["coaster", "Coaster studio", "🎨"],
  ["requests", "Live requests", "🙋"],
  ["feedback", "Feedback", "💬"],
  ["scores", "Leaderboards", "🏆"],
  ["stats", "Stats", "📊"],
  ["qr", "Plain QR codes", "🔳"],
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
    .select("*, menu_categories(*, menu_items(*)), events(*), offers(*), nearby(*)")
    .eq("id", venueId)
    .maybeSingle();
  if (!venue) notFound();
  const { count: waiting } = await sb
    .from("service_requests")
    .select("id", { count: "exact", head: true })
    .eq("venue_id", venue.id)
    .eq("status", "open");

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
        <SetupChecklist venue={venue} />
        <nav className="dash-nav" aria-label="Venue sections">
          {TABS.map(([k, label, ico]) => (
            <a key={k} href={`?tab=${k}`} aria-current={tab === k ? "page" : undefined}>
              <span className="nav-ico" aria-hidden="true">
                {ico}
              </span>
              {label}
              {k === "requests" && (waiting ?? 0) > 0 && <span className="nav-dot" aria-label={`${waiting} waiting`} />}
            </a>
          ))}
        </nav>

        {tab === "details" && <ProfileForm venue={venue} />}
        {tab === "menu" && (
          <>
            <MenuSource venue={venue} />
            {venue.menu_mode !== "pdf" && <MenuEditor venueId={venue.id} categories={venue.menu_categories ?? []} />}
          </>
        )}
        {tab === "games" && <GamesEditor venue={venue} />}
        {tab === "coaster" && <CoasterDesigner venue={venue} />}
        {tab === "look" && <ThemeEditor venueId={venue.id} saved={venue.theme} preview={rowToVenue(venue)} logoUrl={venue.logo_url ?? ""} />}
        {tab === "events" && <EventsEditor venueId={venue.id} events={venue.events ?? []} />}
        {tab === "offers" && <OffersEditor venueId={venue.id} offers={venue.offers ?? []} />}
        {tab === "nearby" && <NearbyEditor venueId={venue.id} places={venue.nearby ?? []} enabled={moduleOn(venue.modules, "nearby")} />}
        {tab === "qr" && <QrCodes slug={venue.slug} name={venue.name_en} />}
        {tab === "requests" && <StaffRequests venueId={venue.id} enabled={moduleOn(venue.modules, "service")} />}
        {tab === "feedback" && <FeedbackTab venueId={venue.id} enabled={moduleOn(venue.modules, "feedback")} />}
        {tab === "scores" && <ScoresTab venueId={venue.id} />}
        {tab === "stats" && <Stats venueId={venue.id} />}
      </main>
    </div>
  );
}

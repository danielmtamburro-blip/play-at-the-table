import type { Metadata } from "next";
import CreateVenue from "@/components/dashboard/CreateVenue";
import DashHeader from "@/components/dashboard/DashHeader";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard · Play at the Table", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { sb, user } = await requireUser();
  const { data: rows } = await sb
    .from("venue_members")
    .select("role, venues(id, slug, name_en, area_en, published, updated_at)")
    .eq("user_id", user.id);

  const venues = (rows ?? [])
    .map((r: any) => ({ role: r.role as string, ...(Array.isArray(r.venues) ? r.venues[0] : r.venues) }))
    .filter((v) => v.id);

  return (
    <div className="dash">
      <DashHeader email={user.email ?? ""} />
      <main className="wrap dash-main">
        <h1>Your venues</h1>
        {venues.length === 0 && <p className="muted">You don&apos;t have a venue yet. Create one below to start building its guest page.</p>}
        <div className="row-list">
          {venues.map((v) => (
            <a key={v.id} href={`/dashboard/${v.id}`} className="panel" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <h2>{v.name_en}</h2>
                  <p className="muted small">
                    {v.area_en || "No area set"} · /v/{v.slug}
                  </p>
                </div>
                <span className={`badge ${v.published ? "on" : "off"}`}>{v.published ? "Live" : "Draft"}</span>
              </div>
            </a>
          ))}
        </div>
        <CreateVenue />
      </main>
    </div>
  );
}

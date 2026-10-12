import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuestApp from "@/components/guest/GuestApp";
import { getVenue } from "@/lib/venue";

// Venue edits show up within a minute without reprinting any QR codes.
export const revalidate = 60;

type Params = Promise<{ slug: string; table?: string[] }>;

/** /v/<slug> for the venue QR, /v/<slug>/<n> for a table QR (1–999). */
function parseTable(parts?: string[]): string | null | undefined {
  if (!parts || parts.length === 0) return null;
  if (parts.length === 1 && /^\d{1,3}$/.test(parts[0]) && Number(parts[0]) > 0) return String(Number(parts[0]));
  return undefined; // invalid
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVenue(slug);
  return v ? { title: `${v.name.en} · Play at the Table`, robots: { index: false } } : { title: "Play at the Table" };
}

export default async function GuestPage({ params }: { params: Params }) {
  const { slug, table: parts } = await params;
  const table = parseTable(parts);
  if (table === undefined) notFound();
  const venue = await getVenue(slug);
  if (!venue) notFound();
  return (
    <div className="guest-shell">
      <GuestApp venue={venue} table={table} />
    </div>
  );
}

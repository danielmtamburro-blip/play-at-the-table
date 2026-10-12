import "server-only";
import { getPublicClient } from "./supabase/server";
import { DEMO_SLUG, SAMPLE_VENUE } from "./sample";
import type { Venue } from "./types";
import { rowToVenue } from "./venueMap";

/**
 * Load a published venue with its live menu, events and offers.
 * Falls back to the built-in sample for the demo venue if Supabase is unavailable.
 */
export async function getVenue(slug: string): Promise<Venue | null> {
  const sb = getPublicClient();
  if (!sb) return slug === DEMO_SLUG ? SAMPLE_VENUE : null;

  const { data: v, error } = await sb
    .from("venues")
    .select("*, menu_categories(*, menu_items(*)), events(*), offers(*)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getVenue", error.message);
    return slug === DEMO_SLUG ? SAMPLE_VENUE : null;
  }
  if (!v) return null;

  return rowToVenue(v);
}

"use client";
import { createContext, useContext } from "react";
import type { TKey } from "@/lib/content";
import type { TrackEvent, TrackOpts } from "@/lib/track";
import type { Lang, Loc, Offer, Venue } from "@/lib/types";

export type GuestCtx = {
  venue: Venue;
  table: string | null;
  lang: Lang;
  locale: string;
  tr: (k: TKey) => string;
  L: (o: Loc | string | undefined | null) => string;
  go: (screen: string) => void;
  redeem: (o: Offer) => void;
  /** Anonymous usage event (no-op inside the sales-page phone demo). */
  log: (event: TrackEvent, opts?: TrackOpts) => void;
};

export const GuestContext = createContext<GuestCtx | null>(null);

export function useGuest(): GuestCtx {
  const c = useContext(GuestContext);
  if (!c) throw new Error("useGuest outside GuestApp");
  return c;
}

/** Strings added for the Next.js version that aren't in the original string table. */
export const EXTRA: Record<Lang, Record<"empty" | "offersS" | "pdfMenu" | "openPdf" | "pdfHint", string>> = {
  en: {
    empty: "Nothing here yet. Ask your server.",
    offersS: "Deals and terms",
    pdfMenu: "Our menu",
    openPdf: "Open the menu",
    pdfHint: "Opens the venue's menu as a PDF. Pinch to zoom.",
  },
  ar: {
    empty: "لا يوجد شيء هنا بعد. اسأل النادل.",
    offersS: "العروض والشروط",
    pdfMenu: "قائمتنا",
    openPdf: "افتح القائمة",
    pdfHint: "تفتح قائمة المطعم كملف PDF. يمكنك التكبير بإصبعين.",
  },
};

export function shuffle<T>(a: readonly T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

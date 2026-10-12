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
  /** True inside the sales-page phone demo: nothing is sent. */
  demo: boolean;
};

export const GuestContext = createContext<GuestCtx | null>(null);

export function useGuest(): GuestCtx {
  const c = useContext(GuestContext);
  if (!c) throw new Error("useGuest outside GuestApp");
  return c;
}

/** Strings added for the Next.js version that aren't in the original string table. */
export type ExtraKey =
  | "empty" | "offersS" | "pdfMenu" | "openPdf" | "pdfHint"
  | "callServer" | "billPlease" | "called" | "billCalled" | "already" | "noTable" | "tryLater"
  | "feedback" | "feedbackS" | "fbTitle" | "fbSub" | "fbComment" | "fbSend" | "fbThanks" | "fbThanksSub" | "fbDone"
  | "fb1" | "fb2" | "fb3" | "fb4" | "fb5";

/** Strings added for the Next.js version that aren't in the original string table. */
export const EXTRA: Record<Lang, Record<ExtraKey, string>> = {
  en: {
    empty: "Nothing here yet. Ask your server.",
    offersS: "Deals and terms",
    pdfMenu: "Our menu",
    openPdf: "Open the menu",
    pdfHint: "Opens the venue's menu as a PDF. Pinch to zoom.",
    callServer: "Call server",
    billPlease: "Bill please",
    called: "Your server is on the way.",
    billCalled: "Your bill is on its way.",
    already: "Already sent. Someone will be with you shortly.",
    noTable: "Scan the QR on your table to call a server.",
    tryLater: "That didn't send. Please wave to a member of staff.",
    feedback: "Feedback",
    feedbackS: "Tell us how we did",
    fbTitle: "How was your visit?",
    fbSub: "Your feedback goes straight to the venue. It's anonymous.",
    fbComment: "Anything you'd like to tell us? (optional)",
    fbSend: "Send feedback",
    fbThanks: "Thank you!",
    fbThanksSub: "We really appreciate you taking a moment to tell us.",
    fbDone: "Back to home",
    fb1: "Bad", fb2: "Not great", fb3: "OK", fb4: "Good", fb5: "Loved it",
  },
  ar: {
    empty: "لا يوجد شيء هنا بعد. اسأل النادل.",
    offersS: "العروض والشروط",
    pdfMenu: "قائمتنا",
    openPdf: "افتح القائمة",
    pdfHint: "تفتح قائمة المطعم كملف PDF. يمكنك التكبير بإصبعين.",
    callServer: "نادِ النادل",
    billPlease: "الحساب من فضلك",
    called: "النادل في الطريق إليك.",
    billCalled: "الحساب في الطريق إليك.",
    already: "تم الإرسال. سيأتي أحدهم قريباً.",
    noTable: "امسح رمز QR الموجود على طاولتك لمناداة النادل.",
    tryLater: "لم يتم الإرسال. يرجى الإشارة لأحد الموظفين.",
    feedback: "رأيك",
    feedbackS: "أخبرنا عن تجربتك",
    fbTitle: "كيف كانت زيارتك؟",
    fbSub: "يصل رأيك مباشرة إلى المطعم دون ذكر اسمك.",
    fbComment: "هل تود إخبارنا بشيء؟ (اختياري)",
    fbSend: "أرسل رأيك",
    fbThanks: "شكراً لك!",
    fbThanksSub: "نقدّر حقاً أنك خصصت لحظة لإخبارنا.",
    fbDone: "العودة للرئيسية",
    fb1: "سيئة", fb2: "ليست جيدة", fb3: "مقبولة", fb4: "جيدة", fb5: "رائعة",
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

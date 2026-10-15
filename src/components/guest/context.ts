"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import type { TKey } from "@/lib/content";
import type { TrackEvent, TrackOpts } from "@/lib/track";
import type { Lang, Loc, Venue } from "@/lib/types";

export type GuestCtx = {
  venue: Venue;
  table: string | null;
  lang: Lang;
  locale: string;
  tr: (k: TKey) => string;
  L: (o: Loc | string | undefined | null) => string;
  go: (screen: string) => void;
  /** Jump straight back to the home screen. */
  home: () => void;
  /** The screen currently showing. */
  screen: string;
  /** Anonymous usage event (no-op inside the sales-page phone demo). */
  log: (event: TrackEvent, opts?: TrackOpts) => void;
  /** True inside the sales-page phone demo: nothing is sent. */
  demo: boolean;
  /** Switch English ⇄ Arabic (remembered on this phone). */
  toggleLang: () => void;
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
  | "fb1" | "fb2" | "fb3" | "fb4" | "fb5"
  | "welcomeTo" | "whatToDo" | "adults" | "adultsS" | "drink" | "drinkS" | "ageQ" | "ageYes" | "ageNo" | "ageBlocked" | "drinkNote"
  | "wifi" | "pass" | "kidsSub" | "wifiName" | "kidsGames" | "versus" | "versusS"
  | "tonight" | "playNow" | "seeAll" | "explore" | "qMenu" | "qDrinks" | "qServer" | "qBill" | "qOffers" | "qWifi"
  | "tabHome" | "tabMenu" | "tabPlay" | "tabOffers" | "food" | "all" | "popular" | "challengeGo" | "eventToday" | "offerTag"
  | "playSub" | "kidsTag" | "adultsTag" | "dateTag" | "drinkTag"
  | "foodMenu" | "foodMenuS" | "drinksMenu" | "drinksMenuS" | "celebrate" | "celebrateS" | "nearby" | "nearbyS" | "nearbySub" | "directions" | "barGames" | "barGamesS" | "contact" | "call" | "email" | "hours" | "access" | "review" | "demoContact" | "forEveryone" | "mixCelebrate" | "mixDarts" | "mixSplit" | "mixBill" | "mixPour" | "mixLocal" | "mixReview";

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
    welcomeTo: "Welcome to {name}!",
    whatToDo: "What would you like to do?",
    adults: "Adult games",
    adultsS: "Games for the group",
    drink: "Drinking games",
    drinkS: "Sip-based fun · {age}+",
    ageQ: "Are you {age} or over?",
    ageYes: "Yes, I'm {age}+",
    ageNo: "No",
    ageBlocked: "These games are for adults only. There are lots of other games to try!",
    drinkNote: "A sip of anything counts: a mocktail, water or your own drink. Please drink responsibly and never drink and drive.",
    wifi: "Wi-Fi",
    pass: "Password",
    wifiName: "Wi-Fi name",
    kidsGames: "Kids games",
    versus: "Challenge another table",
    versusS: "Live head-to-head games for points",
    kidsSub: "Games for every age, from colouring to football. No sign-up, no links, nothing is uploaded.",
    tonight: "Tonight", playNow: "Play now", seeAll: "See all", explore: "Explore",
    qMenu: "Menu", qDrinks: "Drinks", qServer: "Server", qBill: "Bill", qOffers: "Offers", qWifi: "Wi-Fi",
    tabHome: "Home", tabMenu: "Menu", tabPlay: "Play", tabOffers: "Offers", food: "Food", all: "All",
    popular: "Popular right now", challengeGo: "Challenge", eventToday: "Today", offerTag: "Offer",
    playSub: "Games for everyone at the table", kidsTag: "Kids", adultsTag: "Adults", dateTag: "Date night", drinkTag: "Drinking",
    foodMenu: "Food menu", foodMenuS: "Prices, allergens and dietary filters", drinksMenu: "Drinks menu", drinksMenuS: "Cocktails, mocktails, coffee and more",
    celebrate: "Celebrations", celebrateS: "Birthdays, anniversaries and more", nearby: "Things to do nearby", nearbyS: "Our favourite local spots",
    nearbySub: "Places we love around the area, hand-picked by the team.", directions: "Directions",
    barGames: "Darts & pool", barGamesS: "Scorers for the board and table",
    contact: "Contact us", call: "Call", email: "Email", hours: "Opening hours", access: "Accessibility & parking",
    forEveryone: "Something for everyone", mixCelebrate: "Birthday party mode", mixDarts: "Darts scorer", mixSplit: "Split the bill",
    mixBill: "Bill time", mixPour: "Pour it right", mixLocal: "Local guide", mixReview: "Leave a review",
    review: "Enjoyed your visit? Leave us a review", demoContact: "This is a demo venue, so these buttons don't contact anyone.",
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
    welcomeTo: "أهلاً بك في {name}!",
    whatToDo: "ماذا تحب أن تفعل؟",
    adults: "ألعاب الكبار",
    adultsS: "ألعاب للمجموعة",
    drink: "ألعاب المشروبات",
    drinkS: "مرح بالرشفات · {age}+",
    ageQ: "هل عمرك {age} عاماً أو أكثر؟",
    ageYes: "نعم، عمري {age}+",
    ageNo: "لا",
    ageBlocked: "هذه الألعاب للبالغين فقط. هناك الكثير من الألعاب الأخرى لتجربتها!",
    drinkNote: "أي رشفة تُحتسب: موكتيل أو ماء أو مشروبك. يرجى الشرب بمسؤولية وعدم القيادة بعد الشرب.",
    wifi: "واي فاي",
    pass: "كلمة المرور",
    wifiName: "اسم الواي فاي",
    kidsGames: "ألعاب الأطفال",
    versus: "تحدَّ طاولة أخرى",
    versusS: "ألعاب مباشرة وجهاً لوجه لجمع النقاط",
    kidsSub: "ألعاب لكل الأعمار، من التلوين إلى كرة القدم. بدون تسجيل أو روابط، ولا يتم رفع أي شيء.",
    tonight: "الليلة", playNow: "العب الآن", seeAll: "عرض الكل", explore: "استكشف",
    qMenu: "القائمة", qDrinks: "المشروبات", qServer: "النادل", qBill: "الحساب", qOffers: "العروض", qWifi: "واي فاي",
    tabHome: "الرئيسية", tabMenu: "القائمة", tabPlay: "العب", tabOffers: "العروض", food: "الطعام", all: "الكل",
    popular: "الأكثر لعباً الآن", challengeGo: "تحدَّ", eventToday: "اليوم", offerTag: "عرض",
    playSub: "ألعاب لكل من على الطاولة", kidsTag: "أطفال", adultsTag: "كبار", dateTag: "سهرة لشخصين", drinkTag: "مشروبات",
    foodMenu: "قائمة الطعام", foodMenuS: "الأسعار ومسببات الحساسية والفلاتر الغذائية", drinksMenu: "قائمة المشروبات", drinksMenuS: "كوكتيلات وموكتيلات وقهوة والمزيد",
    celebrate: "احتفالات", celebrateS: "أعياد الميلاد والذكريات والمزيد", nearby: "أماكن قريبة", nearbyS: "أماكننا المفضلة في المنطقة",
    nearbySub: "أماكن نحبها في المنطقة، اختارها فريقنا.", directions: "الاتجاهات",
    barGames: "السهام والبلياردو", barGamesS: "حاسبات للوحة والطاولة",
    contact: "تواصل معنا", call: "اتصال", email: "البريد", hours: "ساعات العمل", access: "إمكانية الوصول والمواقف",
    forEveryone: "شيء للجميع", mixCelebrate: "وضع حفلة عيد الميلاد", mixDarts: "حاسبة السهام", mixSplit: "قسّم الحساب",
    mixBill: "وقت الحساب", mixPour: "صبّها صح", mixLocal: "دليل المنطقة", mixReview: "اترك تقييماً",
    review: "استمتعت بزيارتك؟ اترك لنا تقييماً", demoContact: "هذا مكان تجريبي، لذلك لا تتصل هذه الأزرار بأحد.",
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

/**
 * Focus an element when it appears, without scrolling the page to it.
 * Skipped in the sales-page demo, where grabbing focus made phones jump back to the top of the website.
 */
export function useCalmFocus<T extends HTMLElement>(skip: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!skip) ref.current?.focus({ preventScroll: true });
  }, [skip]);
  return ref;
}

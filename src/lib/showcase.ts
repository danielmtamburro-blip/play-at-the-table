// Fictional venue shown in the phone on the sales page. Nothing it does is saved or sent (id "sample").
import { SAMPLE_VENUE } from "./sample";
import type { Venue } from "./types";

const L = (en: string, ar: string) => ({ en, ar });

export const SHOWCASE_VENUE: Venue = {
  ...SAMPLE_VENUE,
  slug: "saffron-terrace",
  name: L("Saffron Terrace", "سافرون تيراس"),
  area: L("Rooftop · Dubai Marina", "على السطح · دبي مارينا"),
  hours: L("Daily 12:00 – 01:00", "يومياً 12:00 – 01:00"),
  wifi: { ssid: "Saffron_Guest", pass: "sunset2026" },
  // The sample menu plus a few dishes for every diet, so the dietary filter has plenty to show.
  menu: [
    {
      id: "sc-c-bowls",
      kind: "food",
      name: L("Bowls & salads", "أطباق وسلطات"),
      items: [
        { id: "sc-i1", name: L("Saffron quinoa bowl", "وعاء الكينوا بالزعفران"), desc: L("Quinoa, roast squash, pomegranate, tahini dressing.", "كينوا وقرع مشوي ورمان وصلصة الطحينة."), price: 52, diet: ["V", "VG", "GF"], allergens: ["sesame"], soldOut: false },
        { id: "sc-i2", name: L("Halloumi & watermelon salad", "سلطة الحلوم والبطيخ"), desc: L("Grilled halloumi, watermelon, mint, lime.", "حلوم مشوي وبطيخ ونعناع وليمون."), price: 48, diet: ["V", "GF"], allergens: ["dairy"], soldOut: false },
        { id: "sc-i3", name: L("Fattoush", "فتوش"), desc: L("Crunchy salad, sumac, crispy pitta.", "سلطة مقرمشة بالسماق وخبز محمص."), price: 38, diet: ["V", "VG"], allergens: ["gluten"], soldOut: false },
        { id: "sc-i4", name: L("Grilled chicken & tabbouleh", "دجاج مشوي وتبولة"), desc: L("Chargrilled chicken, herb salad, garlic toum.", "دجاج مشوي وسلطة أعشاب وثومية."), price: 64, diet: ["GF"], allergens: ["egg"], soldOut: false },
      ],
    },
    ...SAMPLE_VENUE.menu,
  ],
  brandColor: "#E3A94B",
  logoUrl: "/showcase/saffron-logo.svg",
  coverUrl: "/showcase/saffron-cover.webp",
  theme: { bg: "#15100C", card: "#211912", text: "#F7EEE2", accent: "#E3A94B", bgImage: "", dim: 55, tiles: "colourful" },
  games: { _drinkAge: 21, darts: true, pool: true },
  modules: { ...SAMPLE_VENUE.modules, drink: true, service: true, celebrate: true, nearby: true },
  nearby: [
    { id: "sc-n1", name: L("Dubai Marina Walk", "ممشى دبي مارينا"), desc: L("A 7 km waterfront promenade lined with yachts, cafés and sunset views.", "ممشى بطول 7 كم على الواجهة البحرية مع اليخوت والمقاهي ومناظر الغروب."), category: "sight", distance: "2 min walk", mapsUrl: "" },
    { id: "sc-n2", name: L("JBR Beach", "شاطئ جي بي آر"), desc: L("Soft sand, calm water and a splash park for little ones.", "رمال ناعمة ومياه هادئة وحديقة مائية للصغار."), category: "beach", distance: "8 min walk", mapsUrl: "" },
    { id: "sc-n3", name: L("Ain Dubai", "عين دبي"), desc: L("The world's largest observation wheel, on Bluewaters Island.", "أكبر عجلة مراقبة في العالم على جزيرة بلوواترز."), category: "family", distance: "10 min by taxi", mapsUrl: "" },
    { id: "sc-n4", name: L("Dhow dinner cruise", "رحلة عشاء في المركب"), desc: L("Traditional wooden boat cruise around the marina lights.", "رحلة بمركب خشبي تقليدي حول أضواء المارينا."), category: "culture", distance: "5 min walk", mapsUrl: "" },
    { id: "sc-n5", name: L("The Beach at JBR", "ذا بيتش في جي بي آر"), desc: L("Open-air shops, an outdoor cinema and dessert spots.", "متاجر في الهواء الطلق وسينما خارجية ومحلات حلويات."), category: "shopping", distance: "8 min walk", mapsUrl: "" },
    { id: "sc-n6", name: L("Skydive Dubai", "سكاي دايف دبي"), desc: L("Watch the skydivers land over the Palm, or book a jump!", "شاهد المظليين يهبطون فوق النخلة أو احجز قفزتك!"), category: "sport", distance: "5 min by taxi", mapsUrl: "" },
  ],
  events: [
    {
      id: "sc-e1",
      title: L("Sunset session · live oud", "جلسة الغروب · عود حي"),
      desc: L("Live music on the terrace as the sun goes down.", "موسيقى حية على التراس مع غروب الشمس."),
      // Shown as "today" whatever day the visitor comes (set in HeroPhone).
      weekday: 0,
      date: null,
      start: "18:30",
      end: "23:30",
    },
    {
      id: "sc-e2",
      title: L("Rooftop quiz night", "ليلة المسابقات على السطح"),
      desc: L("Teams of up to 6. The winning table gets a dessert platter.", "فرق حتى 6 أشخاص. الطاولة الفائزة تحصل على طبق حلويات."),
      weekday: 0,
      date: null,
      start: "20:30",
      end: "23:00",
    },
  ],
  offers: [
    {
      id: "sc-o1",
      title: L("Golden hour: 2-for-1 mocktails", "الساعة الذهبية: موكتيل 2 بسعر 1"),
      desc: L("Every day 5–8pm on the terrace.", "يومياً من 5 إلى 8 مساءً على التراس."),
      terms: L("Same drink, ordered together. Dine-in only.", "نفس المشروب، يُطلب معاً. داخل المطعم فقط."),
      color: "coral",
      endsOn: null,
      featured: true,
    },
    {
      id: "sc-o2",
      title: L("Beat the leaderboard, win dessert", "تصدّر اللوحة واربح الحلوى"),
      desc: L("Top of tonight's Penalty board at 11pm? Dessert's on us.", "في صدارة لوحة ركلات الترجيح الساعة 11 مساءً؟ الحلوى علينا."),
      terms: L("One per table. Show your server the leaderboard.", "واحدة لكل طاولة. أرِ النادل لوحة المتصدرين."),
      color: "teal",
      endsOn: null,
      featured: false,
    },
    {
      id: "sc-o3",
      title: L("Kids eat free on Fridays", "وجبة الأطفال مجاناً يوم الجمعة"),
      desc: L("One free kids' meal with every adult main.", "وجبة أطفال مجانية مع كل طبق رئيسي لشخص بالغ."),
      terms: L("Children under 12. Dine-in only.", "للأطفال دون 12 عاماً. داخل المطعم فقط."),
      color: "violet",
      endsOn: null,
      featured: false,
    },
  ],
};

/** Example scores so the demo leaderboard isn't empty. */
export const SHOWCASE_SCORES: Record<string, { nickname: string; score: number; table_label: string | null }[]> = {
  penalty: [
    { nickname: "Marina Mo", score: 5, table_label: "4" },
    { nickname: "Goal Machine", score: 5, table_label: "9" },
    { nickname: "Layla_10", score: 4, table_label: "12" },
    { nickname: "Table 7 Legends", score: 4, table_label: "7" },
    { nickname: "Sami", score: 3, table_label: "2" },
  ],
  keepy: [
    { nickname: "Kick King", score: 87, table_label: "6" },
    { nickname: "Noor", score: 64, table_label: "12" },
    { nickname: "Dad Skills", score: 41, table_label: "3" },
  ],
  sudoku: [
    { nickname: "Puzzle Queen", score: 312, table_label: "8" },
    { nickname: "Omar_99", score: 405, table_label: "1" },
  ],
};

/** The showcase with its events moved to today (Dubai time), so "Tonight" always has something on. */
export function showcaseToday(): Venue {
  const day = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" })).getDay();
  return { ...SHOWCASE_VENUE, events: SHOWCASE_VENUE.events.map((e) => ({ ...e, weekday: day })) };
}

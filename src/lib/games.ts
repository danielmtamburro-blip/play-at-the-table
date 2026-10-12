// Every game a venue can switch on or off: 10 for kids, 10 for groups, 10 for date night.
// Keys are stored in venues.games ({ key: false } = hidden). Date-night games are question decks ("deck:<id>").
import { DATE_DECKS } from "./content";
import { EXTRA_DATE_DECKS } from "./gameContent";
import type { Loc } from "./types";

export type GameGroup = "kids" | "group" | "date";

export type GameInfo = { key: string; group: GameGroup; title: Loc; sub: Loc; ages?: string };

const L = (en: string, ar: string): Loc => ({ en, ar });

export const ALL_DATE_DECKS = [...DATE_DECKS, ...EXTRA_DATE_DECKS];

export const GAMES: GameInfo[] = [
  // Kids
  { key: "colour", group: "kids", title: L("Colouring", "التلوين"), sub: L("Tap a colour, then tap a shape", "اختر لوناً ثم اضغط على شكل"), ages: "3+" },
  { key: "memory", group: "kids", title: L("Memory match", "لعبة الذاكرة"), sub: L("Find the matching pairs", "ابحث عن الأزواج المتطابقة"), ages: "4+" },
  { key: "oddone", group: "kids", title: L("Odd one out", "الشكل المختلف"), sub: L("Spot the picture that's different", "اعثر على الصورة المختلفة"), ages: "3+" },
  { key: "count", group: "kids", title: L("Count it!", "عُدّها!"), sub: L("How many can you count?", "كم واحدة تستطيع أن تعد؟"), ages: "3+" },
  { key: "tictactoe", group: "kids", title: L("Noughts & crosses", "إكس-أو"), sub: L("Play a grown-up or a friend", "العب مع أحد الكبار أو صديق"), ages: "5+" },
  { key: "quiz", group: "kids", title: L("Kids' quiz", "مسابقة الأطفال"), sub: L("Fun questions with instant answers", "أسئلة ممتعة بإجابات فورية"), ages: "6+" },
  { key: "animals", group: "kids", title: L("Animal quiz", "مسابقة الحيوانات"), sub: L("How well do you know animals?", "كم تعرف عن الحيوانات؟"), ages: "5+" },
  { key: "riddles", group: "kids", title: L("Riddles", "ألغاز"), sub: L("Guess the answer, then reveal it", "خمّن الإجابة ثم اكشفها"), ages: "6+" },
  { key: "kwyr", group: "kids", title: L("Would you rather?", "ماذا تفضل؟"), sub: L("Silly choices for little ones", "اختيارات مضحكة للصغار"), ages: "4+" },
  { key: "challenge", group: "kids", title: L("Table challenge", "تحدي الطاولة"), sub: L("Find-it missions at your table", "مهام بحث على طاولتك"), ages: "4+" },
  // Groups
  { key: "quick", group: "group", title: L("Quick questions", "أسئلة سريعة"), sub: L("Everyone answers out loud", "الجميع يجيب بصوت عالٍ") },
  { key: "tot", group: "group", title: L("This or that", "هذا أم ذاك"), sub: L("Pick a side, then explain yourself", "اختر جانباً ثم اشرح السبب") },
  { key: "wyr", group: "group", title: L("Would you rather", "ماذا تفضل"), sub: L("Tough choices, big debates", "اختيارات صعبة ونقاشات كبيرة") },
  { key: "likely", group: "group", title: L("Most likely to", "من الأكثر احتمالاً"), sub: L("Everyone points on three!", "الجميع يشير عند العد إلى ثلاثة!") },
  { key: "never", group: "group", title: L("Never have I ever", "لم يسبق لي أبداً"), sub: L("Family-friendly confessions", "اعترافات مناسبة للعائلة") },
  { key: "charades", group: "group", title: L("Charades", "التمثيل الصامت"), sub: L("Act it out, no talking!", "مثّلها بدون كلام!") },
  { key: "categories", group: "group", title: L("Name five", "اذكر خمسة"), sub: L("Five answers before the timer ends", "خمس إجابات قبل انتهاء الوقت") },
  { key: "emoji", group: "group", title: L("Emoji films", "أفلام بالإيموجي"), sub: L("Guess the film from the emojis", "خمّن الفيلم من الإيموجي") },
  { key: "trivia", group: "group", title: L("Table trivia", "مسابقة الطاولة"), sub: L("General knowledge for the table", "معلومات عامة للطاولة") },
  { key: "picker", group: "group", title: L("Party picker", "مختار الحفلة"), sub: L("The phone chooses who goes next", "الهاتف يختار من التالي") },
  // Date night (one deck each)
  ...ALL_DATE_DECKS.map((d) => ({ key: `deck:${d.id}`, group: "date" as const, title: d.t, sub: d.s })),
];

export const GROUP_LABEL: Record<GameGroup, string> = { kids: "Kids' corner", group: "Play together (friends & groups)", date: "Date night" };

export const gameOn = (games: Record<string, boolean> | undefined, key: string) => games?.[key] !== false;

export const anyGameOn = (games: Record<string, boolean> | undefined, group: GameGroup) =>
  GAMES.some((g) => g.group === group && gameOn(games, g.key));

// Every game a venue can switch on or off: 10 for kids, 10 for groups, 10 for date night.
// Keys are stored in venues.games ({ key: false } = hidden). Date-night games are question decks ("deck:<id>").
import { DATE_DECKS } from "./content";
import { EXTRA_DATE_DECKS } from "./gameContent";
import type { Loc } from "./types";

export type GameGroup = "kids" | "group" | "date" | "drink";
export type AgeBand = "2" | "3" | "6" | "12";

export type GameCat = "featured" | "puzzles" | "trivia" | "party" | "cards" | "talk";
export type GameInfo = { key: string; group: GameGroup; title: Loc; sub: Loc; ages?: string; band?: AgeBand; cat?: GameCat; icon?: string };

const L = (en: string, ar: string): Loc => ({ en, ar });

export const ALL_DATE_DECKS = [...DATE_DECKS, ...EXTRA_DATE_DECKS];

export const GAMES: GameInfo[] = [
  // Kids: babies and toddlers, then 4 for ages 3+, 4 for 6+, 4 for teens
  { key: "animals", group: "kids", band: "2", title: L("Animal sounds", "أصوات الحيوانات"), sub: L("Who says moo? Huge buttons for little hands", "من يقول مووو؟ أزرار كبيرة للأيدي الصغيرة"), ages: "2+" },
  { key: "fruit", group: "kids", band: "2", title: L("Dancing fruit", "الفواكه الراقصة"), sub: L("Happy fruit dancing to music", "فواكه سعيدة ترقص على الموسيقى"), ages: "0+" },
  { key: "calm", group: "kids", band: "2", title: L("Sleepy lights", "أضواء النوم"), sub: L("Soft lights and a lullaby for babies", "أضواء هادئة وتهويدة للرضّع"), ages: "0+" },
  { key: "colour", group: "kids", band: "3", title: L("Colouring", "التلوين"), sub: L("Tap a colour, then tap a shape", "اختر لوناً ثم اضغط على شكل"), ages: "3+" },
  { key: "bubbles", group: "kids", band: "3", title: L("Bubble pop", "فقاعات"), sub: L("Pop as many bubbles as you can!", "افقع أكبر عدد من الفقاعات!"), ages: "3+" },
  { key: "oddone", group: "kids", band: "3", title: L("Odd one out", "الشكل المختلف"), sub: L("Spot the picture that's different", "اعثر على الصورة المختلفة"), ages: "3+" },
  { key: "count", group: "kids", band: "3", title: L("Count it!", "عُدّها!"), sub: L("How many can you count?", "كم واحدة تستطيع أن تعد؟"), ages: "3+" },
  { key: "penalty", group: "kids", band: "6", title: L("Penalty shootout", "ركلات الترجيح"), sub: L("Time your shot and beat the keeper", "اختر التوقيت المناسب وتغلب على الحارس"), ages: "6+" },
  { key: "racer", group: "kids", band: "6", title: L("Car racer", "سباق السيارات"), sub: L("Dodge the traffic and go faster", "تفادَ السيارات وزِد سرعتك"), ages: "6+" },
  { key: "memory", group: "kids", band: "6", title: L("Memory match", "لعبة الذاكرة"), sub: L("Find all 8 pairs in as few moves as you can", "اعثر على 8 أزواج بأقل عدد من المحاولات"), ages: "6+" },
  { key: "tictactoe", group: "kids", band: "6", title: L("Noughts & crosses", "إكس-أو"), sub: L("Beat the phone or a friend", "تغلب على الهاتف أو على صديق"), ages: "6+" },
  { key: "keepy", group: "kids", band: "12", title: L("Keepy-uppy", "تنطيط الكرة"), sub: L("Tap the ball. Don't let it drop!", "اضغط على الكرة ولا تدعها تسقط!"), ages: "12+" },
  { key: "reaction", group: "kids", band: "12", title: L("Reaction test", "اختبار رد الفعل"), sub: L("How fast are your reflexes?", "ما مدى سرعة رد فعلك؟"), ages: "12+" },
  { key: "maths", group: "kids", band: "12", title: L("Maths sprint", "سباق الحساب"), sub: L("Solve as many as you can in 60 seconds", "حل أكبر عدد ممكن في 60 ثانية"), ages: "12+" },
  { key: "scramble", group: "kids", band: "12", title: L("Word scramble", "ترتيب الحروف"), sub: L("Unjumble the letters to find the word", "رتّب الحروف لتجد الكلمة"), ages: "12+" },
  // Adult games
  { key: "split", group: "group", cat: "featured", icon: "🧮", title: L("Split the bill", "قسّم الحساب"), sub: L("Type the total and how many people", "اكتب الإجمالي وعدد الأشخاص") },
  { key: "bill", group: "group", cat: "featured", icon: "🎡", title: L("Who pays the bill?", "من يدفع الحساب؟"), sub: L("Add everyone's names and spin the wheel", "أضف أسماء الجميع ولف العجلة") },
  { key: "sudoku", group: "group", cat: "puzzles", icon: "🔢", title: L("Sudoku", "سودوكو"), sub: L("Fill the grid with 1 to 9", "املأ الشبكة بالأرقام من 1 إلى 9") },
  { key: "crossword", group: "group", cat: "puzzles", icon: "✏️", title: L("Mini crossword", "كلمات متقاطعة"), sub: L("A fresh crossword every time", "كلمات متقاطعة جديدة في كل مرة") },
  { key: "wordsearch", group: "group", cat: "puzzles", icon: "🔍", title: L("Word search", "البحث عن الكلمات"), sub: L("Find all the hidden words", "اعثر على كل الكلمات المخفية") },
  { key: "wordguess", group: "group", cat: "puzzles", icon: "🟩", title: L("Word guess", "خمّن الكلمة"), sub: L("Guess the 5-letter word in 6 tries", "خمّن الكلمة من 5 أحرف في 6 محاولات") },
  { key: "trivia", group: "group", cat: "trivia", icon: "🧠", title: L("Table trivia", "مسابقة الطاولة"), sub: L("General knowledge for the table", "معلومات عامة للطاولة") },
  { key: "sports", group: "group", cat: "trivia", icon: "🏆", title: L("Sports trivia", "مسابقة رياضية"), sub: L("Football, tennis, F1 and more", "كرة القدم والتنس والفورمولا 1 وغيرها") },
  { key: "emoji", group: "group", cat: "trivia", icon: "🎬", title: L("Emoji films", "أفلام بالإيموجي"), sub: L("Guess the film from the emojis", "خمّن الفيلم من الإيموجي") },
  { key: "quick", group: "group", cat: "party", icon: "💬", title: L("Quick questions", "أسئلة سريعة"), sub: L("Everyone answers out loud", "الجميع يجيب بصوت عالٍ") },
  { key: "tot", group: "group", cat: "party", icon: "⚖️", title: L("This or that", "هذا أم ذاك"), sub: L("Pick a side, then explain yourself", "اختر جانباً ثم اشرح السبب") },
  { key: "wyr", group: "group", cat: "party", icon: "🤔", title: L("Would you rather", "ماذا تفضل"), sub: L("Tough choices, big debates", "اختيارات صعبة ونقاشات كبيرة") },
  { key: "likely", group: "group", cat: "party", icon: "👉", title: L("Most likely to", "من الأكثر احتمالاً"), sub: L("Everyone points on three!", "الجميع يشير عند العد إلى ثلاثة!") },
  { key: "never", group: "group", cat: "party", icon: "🙊", title: L("Never have I ever", "لم يسبق لي أبداً"), sub: L("Confessions for the table", "اعترافات للطاولة") },
  { key: "charades", group: "group", cat: "party", icon: "🎭", title: L("Charades", "التمثيل الصامت"), sub: L("Act it out, no talking!", "مثّلها بدون كلام!") },
  { key: "categories", group: "group", cat: "party", icon: "⏱️", title: L("Name five", "اذكر خمسة"), sub: L("Five answers before the timer ends", "خمس إجابات قبل انتهاء الوقت") },
  { key: "picker", group: "group", cat: "party", icon: "🎯", title: L("Party picker", "مختار الحفلة"), sub: L("The phone chooses who goes next", "الهاتف يختار من التالي") },
  // Date night (one deck each)
  ...ALL_DATE_DECKS.map((d) => ({ key: `deck:${d.id}`, group: "date" as const, title: d.t, sub: d.s })),
  // Drinking games: only if the venue switches them on; guests confirm their age first.
  { key: "hilo", group: "drink", cat: "cards", icon: "🃏", title: L("Higher or lower", "أعلى أم أقل"), sub: L("Guess the next card. Wrong? Take a sip", "خمّن البطاقة التالية. أخطأت؟ خذ رشفة") },
  { key: "kings", group: "drink", cat: "cards", icon: "👑", title: L("Card rules", "قواعد البطاقات"), sub: L("Draw a card, every card has a rule", "اسحب بطاقة، لكل بطاقة قاعدة") },
  { key: "dice", group: "drink", cat: "cards", icon: "🎲", title: L("Drink dice", "نرد المشروبات"), sub: L("Roll two dice and follow the rule", "ارمِ نردين واتبع القاعدة") },
  { key: "pour", group: "drink", cat: "cards", icon: "🍺", title: L("Pour it right", "صبّها صح"), sub: L("Hold to pour, stop on the line. Spill it? Sip", "اضغط للصب وتوقف عند الخط. انسكب؟ رشفة") },
  { key: "sipwheel", group: "drink", cat: "cards", icon: "🎡", title: L("Sip wheel", "عجلة الرشفات"), sub: L("Spin to see who sips next", "لف العجلة لترى من يرتشف") },
  { key: "dnever", group: "drink", cat: "talk", icon: "🙊", title: L("Never have I ever: sip edition", "لم يسبق لي أبداً: نسخة الرشفات"), sub: L("If you have, take a sip", "إذا فعلتها، خذ رشفة") },
  { key: "dlikely", group: "drink", cat: "talk", icon: "👉", title: L("Most likely to: sip edition", "من الأكثر احتمالاً: نسخة الرشفات"), sub: L("Point on three. Most votes sips", "أشيروا عند العد لثلاثة. صاحب أكثر الأصوات يرتشف") },
  { key: "sipshare", group: "drink", cat: "talk", icon: "🤫", title: L("Sip or share", "رشفة أو اعتراف"), sub: L("Answer honestly, or take a sip", "أجب بصدق أو خذ رشفة") },
  { key: "rules", group: "drink", cat: "talk", icon: "📜", title: L("Table rules", "قواعد الطاولة"), sub: L("Draw a card, follow the rule", "اسحب بطاقة واتبع القاعدة") },
];

/** Section headings inside the adult and drinking hubs. */
export const CATS: Record<GameCat, Loc> = {
  featured: L("Featured", "مميز"),
  puzzles: L("🧩 Puzzles · great on your own", "🧩 ألغاز · رائعة بمفردك"),
  trivia: L("🧠 Trivia", "🧠 مسابقات"),
  party: L("🎉 Party games · for the group", "🎉 ألعاب جماعية · للمجموعة"),
  cards: L("🃏 Cards, dice and wheels", "🃏 بطاقات ونرد وعجلات"),
  talk: L("💬 Talking games", "💬 ألعاب الحديث"),
};

export const KIDS_BANDS: { band: AgeBand; label: Loc }[] = [
  { band: "2", label: L("Babies & toddlers · 0–4", "للرضّع والصغار · 0–4") },
  { band: "3", label: L("Little ones · ages 3+", "للصغار · من 3 سنوات") },
  { band: "6", label: L("Big kids · ages 6+", "للأطفال · من 6 سنوات") },
  { band: "12", label: L("Teens · ages 12+", "لليافعين · من 12 سنة") },
];

export const GROUP_LABEL: Record<GameGroup, string> = { kids: "Kids' corner", group: "Adult games", date: "Date night", drink: "Drinking games" };

/** Drinking-games age limit set by the venue (stored in venues.games._drinkAge). Defaults to 21 (UAE). */
export const drinkAge = (games: Record<string, unknown> | undefined) => (games?._drinkAge === 18 ? 18 : 21);

export const gameOn = (games: Record<string, boolean> | undefined, key: string) => games?.[key] !== false;

export const anyGameOn = (games: Record<string, boolean> | undefined, group: GameGroup) =>
  GAMES.some((g) => g.group === group && gameOn(games, g.key));

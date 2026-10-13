// Extra quiz questions so every quiz has at least 20, with easy (1), medium (2) and hard (3) questions.
import type { Loc } from "./types";

const L = (en: string, ar: string): Loc => ({ en, ar });
export type Q = { q: Loc; o: Loc[]; a: number; lvl?: 1 | 2 | 3 };

export const MORE_ADULT_TRIVIA: Q[] = [
  // Easy
  { lvl: 1, q: L("How many continents are there?", "كم عدد القارات؟"), o: [L("5", "5"), L("7", "7"), L("9", "9")], a: 1 },
  { lvl: 1, q: L("What is the capital of the UAE?", "ما عاصمة دولة الإمارات؟"), o: [L("Dubai", "دبي"), L("Abu Dhabi", "أبوظبي"), L("Sharjah", "الشارقة")], a: 1 },
  { lvl: 1, q: L("Which ocean is the largest?", "أي محيط هو الأكبر؟"), o: [L("Atlantic", "الأطلسي"), L("Indian", "الهندي"), L("Pacific", "الهادئ")], a: 2 },
  { lvl: 1, q: L("How many minutes are in a day?", "كم دقيقة في اليوم؟"), o: [L("1,440", "1,440"), L("1,200", "1,200"), L("2,400", "2,400")], a: 0 },
  { lvl: 1, q: L("What colour do you get mixing blue and yellow?", "ما اللون الناتج عن خلط الأزرق والأصفر؟"), o: [L("Purple", "البنفسجي"), L("Green", "الأخضر"), L("Orange", "البرتقالي")], a: 1 },
  { lvl: 1, q: L("Which fruit is dried to make raisins?", "أي فاكهة تُجفف لصنع الزبيب؟"), o: [L("Grapes", "العنب"), L("Plums", "البرقوق"), L("Dates", "التمر")], a: 0 },
  // Medium
  { lvl: 2, q: L("In which year did the UAE become a country?", "في أي عام تأسست دولة الإمارات؟"), o: [L("1965", "1965"), L("1971", "1971"), L("1980", "1980")], a: 1 },
  { lvl: 2, q: L("What is the chemical symbol for gold?", "ما الرمز الكيميائي للذهب؟"), o: [L("Go", "Go"), L("Gd", "Gd"), L("Au", "Au")], a: 2 },
  { lvl: 2, q: L("Who painted the Mona Lisa?", "من رسم الموناليزا؟"), o: [L("Michelangelo", "مايكل أنجلو"), L("Leonardo da Vinci", "ليوناردو دا فينشي"), L("Picasso", "بيكاسو")], a: 1 },
  { lvl: 2, q: L("Which country is home to Machu Picchu?", "في أي دولة تقع ماتشو بيتشو؟"), o: [L("Mexico", "المكسيك"), L("Chile", "تشيلي"), L("Peru", "البيرو")], a: 2 },
  { lvl: 2, q: L("How many bones are in the adult human body?", "كم عدد العظام في جسم الإنسان البالغ؟"), o: [L("206", "206"), L("186", "186"), L("256", "256")], a: 0 },
  { lvl: 2, q: L("What is the smallest country in the world?", "ما أصغر دولة في العالم؟"), o: [L("Monaco", "موناكو"), L("Vatican City", "الفاتيكان"), L("San Marino", "سان مارينو")], a: 1 },
  // Hard
  { lvl: 3, q: L("Which planet has the most moons?", "أي كوكب لديه أكبر عدد من الأقمار؟"), o: [L("Jupiter", "المشتري"), L("Saturn", "زحل"), L("Neptune", "نبتون")], a: 1 },
  { lvl: 3, q: L("What is the hardest natural substance?", "ما أصلب مادة طبيعية؟"), o: [L("Diamond", "الألماس"), L("Quartz", "الكوارتز"), L("Titanium", "التيتانيوم")], a: 0 },
  { lvl: 3, q: L("The Louvre Abu Dhabi shares its name with a museum in which city?", "يحمل متحف اللوفر أبوظبي اسم متحف في أي مدينة؟"), o: [L("Rome", "روما"), L("Paris", "باريس"), L("London", "لندن")], a: 1 },
  { lvl: 3, q: L("What is the longest river in Africa?", "ما أطول نهر في أفريقيا؟"), o: [L("Congo", "الكونغو"), L("Niger", "النيجر"), L("Nile", "النيل")], a: 2 },
  { lvl: 3, q: L("How many hearts does an octopus have?", "كم قلباً للأخطبوط؟"), o: [L("1", "1"), L("2", "2"), L("3", "3")], a: 2 },
  { lvl: 3, q: L("Which element has the atomic number 1?", "أي عنصر عدده الذري 1؟"), o: [L("Helium", "الهيليوم"), L("Hydrogen", "الهيدروجين"), L("Oxygen", "الأكسجين")], a: 1 },
  { lvl: 3, q: L("Who wrote the novel '1984'?", "من كتب رواية '1984'؟"), o: [L("George Orwell", "جورج أورويل"), L("Aldous Huxley", "ألدوس هكسلي"), L("Ray Bradbury", "راي برادبري")], a: 0 },
  { lvl: 3, q: L("What is the currency of Japan?", "ما عملة اليابان؟"), o: [L("Won", "الوون"), L("Yuan", "اليوان"), L("Yen", "الين")], a: 2 },
];

export const MORE_SPORTS_TRIVIA: Q[] = [
  { lvl: 1, q: L("How many players are on a football team on the pitch?", "كم عدد لاعبي فريق كرة القدم في الملعب؟"), o: [L("10", "10"), L("11", "11"), L("12", "12")], a: 1 },
  { lvl: 1, q: L("Which sport uses a shuttlecock?", "أي رياضة تستخدم الريشة؟"), o: [L("Badminton", "الريشة الطائرة"), L("Squash", "الاسكواش"), L("Tennis", "التنس")], a: 0 },
  { lvl: 1, q: L("How many rings are on the Olympic flag?", "كم حلقة على العلم الأولمبي؟"), o: [L("4", "4"), L("5", "5"), L("6", "6")], a: 1 },
  { lvl: 1, q: L("In which sport would you score a 'try'?", "في أي رياضة تسجل 'محاولة'؟"), o: [L("Cricket", "الكريكيت"), L("Rugby", "الرغبي"), L("Golf", "الغولف")], a: 1 },
  { lvl: 1, q: L("What colour is the middle of an archery target?", "ما لون منتصف هدف الرماية؟"), o: [L("Red", "الأحمر"), L("Gold", "الذهبي"), L("Blue", "الأزرق")], a: 1 },
  { lvl: 1, q: L("How many holes are on a standard golf course?", "كم حفرة في ملعب الغولف القياسي؟"), o: [L("9", "9"), L("18", "18"), L("21", "21")], a: 1 },
  { lvl: 2, q: L("Which country hosted the 2022 FIFA World Cup?", "أي دولة استضافت كأس العالم 2022؟"), o: [L("Qatar", "قطر"), L("Russia", "روسيا"), L("Brazil", "البرازيل")], a: 0 },
  { lvl: 2, q: L("How many points is a basketball shot from behind the arc?", "كم نقطة للتسديدة من خلف القوس في كرة السلة؟"), o: [L("2", "2"), L("3", "3"), L("4", "4")], a: 1 },
  { lvl: 2, q: L("Which F1 track hosts a night race in Abu Dhabi?", "أي حلبة فورمولا 1 تستضيف سباقاً ليلياً في أبوظبي؟"), o: [L("Yas Marina", "ياس مارينا"), L("Losail", "لوسيل"), L("Sakhir", "الصخير")], a: 0 },
  { lvl: 2, q: L("In cricket, how many balls are in an over?", "في الكريكيت، كم كرة في الأوفر الواحد؟"), o: [L("5", "5"), L("6", "6"), L("8", "8")], a: 1 },
  { lvl: 2, q: L("Which tennis Grand Slam is played on clay?", "أي بطولة كبرى في التنس تُلعب على الملاعب الترابية؟"), o: [L("Wimbledon", "ويمبلدون"), L("US Open", "أمريكا المفتوحة"), L("French Open", "فرنسا المفتوحة")], a: 2 },
  { lvl: 2, q: L("How long is an Olympic swimming pool?", "كم طول المسبح الأولمبي؟"), o: [L("25 m", "25 م"), L("50 m", "50 م"), L("100 m", "100 م")], a: 1 },
  { lvl: 3, q: L("Who has won the most Ballon d'Or awards?", "من فاز بأكبر عدد من جوائز الكرة الذهبية؟"), o: [L("Cristiano Ronaldo", "كريستيانو رونالدو"), L("Lionel Messi", "ليونيل ميسي"), L("Michel Platini", "ميشيل بلاتيني")], a: 1 },
  { lvl: 3, q: L("In which year were the first modern Olympic Games held?", "في أي عام أقيمت أول ألعاب أولمبية حديثة؟"), o: [L("1896", "1896"), L("1900", "1900"), L("1924", "1924")], a: 0 },
  { lvl: 3, q: L("What is the maximum break in snooker?", "ما أعلى رصيد ممكن في السنوكر؟"), o: [L("147", "147"), L("155", "155"), L("180", "180")], a: 0 },
  { lvl: 3, q: L("Which club has won the most Champions League titles?", "أي نادٍ فاز بأكبر عدد من ألقاب دوري الأبطال؟"), o: [L("AC Milan", "ميلان"), L("Real Madrid", "ريال مدريد"), L("Bayern Munich", "بايرن ميونخ")], a: 1 },
  { lvl: 3, q: L("What is the highest score possible with three darts?", "ما أعلى نتيجة ممكنة بثلاثة أسهم؟"), o: [L("150", "150"), L("170", "170"), L("180", "180")], a: 2 },
  { lvl: 3, q: L("How many players are on a volleyball team on court?", "كم لاعباً في فريق الكرة الطائرة داخل الملعب؟"), o: [L("5", "5"), L("6", "6"), L("7", "7")], a: 1 },
];

export const MORE_EMOJI_PUZZLES: { q: Loc; a: Loc }[] = [
  { q: L("🧙‍♂️💍🌋", "🧙‍♂️💍🌋"), a: L("The Lord of the Rings", "سيد الخواتم") },
  { q: L("🦖🏝️", "🦖🏝️"), a: L("Jurassic Park", "الحديقة الجوراسية") },
  { q: L("🚢🧊💔", "🚢🧊💔"), a: L("Titanic", "تايتانيك") },
  { q: L("🐠🔍", "🐠🔍"), a: L("Finding Nemo", "البحث عن نيمو") },
  { q: L("🧞‍♂️🪔🐒", "🧞‍♂️🪔🐒"), a: L("Aladdin", "علاء الدين") },
  { q: L("🦇🧔‍♂️🌃", "🦇🧔‍♂️🌃"), a: L("Batman", "باتمان") },
  { q: L("👻👻📞", "👻👻📞"), a: L("Ghostbusters", "صائدو الأشباح") },
  { q: L("🏠🎈👴", "🏠🎈👴"), a: L("Up", "فوق (أب)") },
  { q: L("🐀👨‍🍳🇫🇷", "🐀👨‍🍳🇫🇷"), a: L("Ratatouille", "راتاتوي") },
  { q: L("🧸🤠🚀", "🧸🤠🚀"), a: L("Toy Story", "حكاية لعبة") },
  { q: L("🕶️💊🐇", "🕶️💊🐇"), a: L("The Matrix", "الماتريكس") },
  { q: L("🐼🥋", "🐼🥋"), a: L("Kung Fu Panda", "كونغ فو باندا") },
];

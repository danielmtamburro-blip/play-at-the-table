// Content for the extra games (English + Arabic). Family-friendly by default; nothing is saved.
import type { Loc } from "./types";

const L = (en: string, ar: string): Loc => ({ en, ar });

/* ------------------------------ Kids ------------------------------ */

export const KIDS_RIDDLES: { q: Loc; a: Loc }[] = [
  { q: L("What has hands but can't clap?", "ما الشيء الذي له يدان لكنه لا يصفق؟"), a: L("A clock", "الساعة") },
  { q: L("What gets wetter the more it dries?", "ما الشيء الذي يزداد بللاً كلما جفّف؟"), a: L("A towel", "المنشفة") },
  { q: L("What has a face and two hands but no arms or legs?", "ما الذي له وجه وعقربان وليس له ذراعان ولا رجلان؟"), a: L("A clock", "الساعة") },
  { q: L("What can you catch but not throw?", "ما الشيء الذي يمكنك أن تلتقطه ولا يمكنك رميه؟"), a: L("A cold", "الزكام") },
  { q: L("What has lots of keys but can't open a door?", "ما الذي فيه مفاتيح كثيرة لكنه لا يفتح باباً؟"), a: L("A piano", "البيانو") },
  { q: L("What goes up but never comes down?", "ما الشيء الذي يصعد ولا ينزل أبداً؟"), a: L("Your age", "عمرك") },
  { q: L("I'm full of holes but I can still hold water. What am I?", "أنا مليء بالثقوب لكني أحمل الماء. من أنا؟"), a: L("A sponge", "الإسفنجة") },
  { q: L("What has a neck but no head?", "ما الذي له رقبة وليس له رأس؟"), a: L("A bottle", "الزجاجة") },
  { q: L("What runs but never walks?", "ما الذي يجري ولا يمشي أبداً؟"), a: L("Water", "الماء") },
  { q: L("What is yellow, long and loved by monkeys?", "ما الشيء الأصفر الطويل الذي تحبه القرود؟"), a: L("A banana", "الموزة") },
  { q: L("What has one eye but can't see?", "ما الذي له عين واحدة ولا يرى؟"), a: L("A needle", "الإبرة") },
  { q: L("What comes down but never goes up?", "ما الذي ينزل ولا يصعد أبداً؟"), a: L("Rain", "المطر") },
];

export const KIDS_WYR: [Loc, Loc][] = [
  [L("Fly like a bird", "تطير مثل الطائر"), L("Swim like a fish", "تسبح مثل السمكة")],
  [L("Ice cream for breakfast", "آيس كريم على الفطور"), L("Pancakes for dinner", "فطائر على العشاء")],
  [L("Be a superhero", "تكون بطلاً خارقاً"), L("Be a wizard", "تكون ساحراً")],
  [L("Have a pet dinosaur", "يكون عندك ديناصور أليف"), L("Have a pet dragon", "يكون عندك تنين أليف")],
  [L("Live in a treehouse", "تعيش في بيت على شجرة"), L("Live in a sandcastle", "تعيش في قلعة رملية")],
  [L("Talk to animals", "تتكلم مع الحيوانات"), L("Be invisible", "تصبح غير مرئي")],
  [L("Go to space", "تذهب إلى الفضاء"), L("Go under the sea", "تذهب تحت البحر")],
  [L("Be super fast", "تكون سريعاً جداً"), L("Be super strong", "تكون قوياً جداً")],
  [L("Only eat pizza", "تأكل البيتزا فقط"), L("Only eat burgers", "تأكل البرجر فقط")],
  [L("Have a robot friend", "يكون عندك صديق روبوت"), L("Have a unicorn friend", "يكون عندك صديق وحيد قرن")],
  [L("Snow day", "يوم ثلج"), L("Beach day", "يوم على الشاطئ")],
  [L("Be the teacher for a day", "تكون المعلم ليوم"), L("Be the chef for a day", "تكون الطاهي ليوم")],
];

export const ANIMAL_QUIZ: { q: Loc; o: Loc[]; a: number }[] = [
  { q: L("Which animal is the tallest in the world?", "ما أطول حيوان في العالم؟"), o: [L("Elephant", "الفيل"), L("Giraffe", "الزرافة"), L("Camel", "الجمل")], a: 1 },
  { q: L("Which bird can't fly but runs very fast?", "أي طائر لا يطير لكنه يجري بسرعة كبيرة؟"), o: [L("Ostrich", "النعامة"), L("Falcon", "الصقر"), L("Parrot", "الببغاء")], a: 0 },
  { q: L("What is a baby cat called?", "ماذا يسمى صغير القطة؟"), o: [L("Puppy", "جرو"), L("Kitten", "هريرة"), L("Cub", "شبل")], a: 1 },
  { q: L("Which animal is the UAE's national bird?", "ما هو الطائر الوطني لدولة الإمارات؟"), o: [L("Flamingo", "الفلامنغو"), L("Falcon", "الصقر"), L("Eagle", "النسر")], a: 1 },
  { q: L("How many legs does an octopus have?", "كم ذراعاً للأخطبوط؟"), o: [L("6", "6"), L("8", "8"), L("10", "10")], a: 1 },
  { q: L("Which animal sleeps hanging upside down?", "أي حيوان ينام معلقاً بالمقلوب؟"), o: [L("Bat", "الخفاش"), L("Owl", "البومة"), L("Monkey", "القرد")], a: 0 },
  { q: L("What do pandas mostly eat?", "ماذا تأكل الباندا في الغالب؟"), o: [L("Fish", "السمك"), L("Bamboo", "الخيزران"), L("Bananas", "الموز")], a: 1 },
  { q: L("Which is the biggest animal in the sea?", "ما أكبر حيوان في البحر؟"), o: [L("Shark", "القرش"), L("Blue whale", "الحوت الأزرق"), L("Dolphin", "الدلفين")], a: 1 },
  { q: L("Which animal has black and white stripes?", "أي حيوان له خطوط سوداء وبيضاء؟"), o: [L("Zebra", "الحمار الوحشي"), L("Tiger", "النمر"), L("Leopard", "الفهد")], a: 0 },
  { q: L("What does a caterpillar turn into?", "إلى ماذا تتحول اليرقة؟"), o: [L("A bee", "نحلة"), L("A butterfly", "فراشة"), L("A spider", "عنكبوت")], a: 1 },
];

/** Odd one out: 15 of `same` and one clearly different `odd`. */
export const ODD_SETS: { same: string; odd: string }[] = [
  { same: "🍌", odd: "🍎" }, { same: "🐶", odd: "🐱" }, { same: "⭐", odd: "🌙" }, { same: "🚗", odd: "🚲" },
  { same: "🐟", odd: "🐙" }, { same: "🌸", odd: "🌵" }, { same: "⚽", odd: "🏀" }, { same: "🐥", odd: "🐸" },
  { same: "🍩", odd: "🥕" }, { same: "🐪", odd: "🐘" }, { same: "☀️", odd: "☁️" }, { same: "🧁", odd: "🍕" },
  { same: "🦁", odd: "🐯" }, { same: "🍓", odd: "🍋" }, { same: "🎈", odd: "🎁" }, { same: "🐞", odd: "🦋" },
];
export const COUNT_ITEMS = ["🍓", "🐞", "⭐", "🎈", "🐠", "🍊", "🦋", "🌵"];

/* ------------------------------ Group ------------------------------ */

export const ADULT_WYR: [Loc, Loc][] = [
  [L("Always be 10 minutes late", "تتأخر دائماً 10 دقائق"), L("Always be 20 minutes early", "تصل دائماً قبل 20 دقيقة")],
  [L("Give up dessert forever", "تتخلى عن الحلويات للأبد"), L("Give up coffee forever", "تتخلى عن القهوة للأبد")],
  [L("Travel back in time", "تسافر إلى الماضي"), L("Travel to the future", "تسافر إلى المستقبل")],
  [L("Be famous", "تكون مشهوراً"), L("Be rich but unknown", "تكون غنياً ومجهولاً")],
  [L("Live without music", "تعيش بلا موسيقى"), L("Live without films", "تعيش بلا أفلام")],
  [L("Win a free holiday", "تربح عطلة مجانية"), L("Win a free dinner every week for a year", "تربح عشاء مجانياً كل أسبوع لمدة عام")],
  [L("Know every language", "تعرف كل اللغات"), L("Play every instrument", "تعزف على كل الآلات")],
  [L("Always have to sing", "تضطر للغناء دائماً"), L("Always have to dance", "تضطر للرقص دائماً")],
  [L("A month without your phone", "شهر بلا هاتفك"), L("A month without your car", "شهر بلا سيارتك")],
  [L("Be the funniest person here", "تكون أطرف شخص هنا"), L("Be the smartest person here", "تكون أذكى شخص هنا")],
  [L("Desert safari", "رحلة سفاري في الصحراء"), L("Yacht day", "يوم على اليخت")],
  [L("Cook every night", "تطبخ كل ليلة"), L("Wash up every night", "تغسل الصحون كل ليلة")],
];

export const MOST_LIKELY: Loc[] = [
  L("Who's most likely to become famous?", "من الأكثر احتمالاً أن يصبح مشهوراً؟"),
  L("Who's most likely to be late to their own party?", "من الأكثر احتمالاً أن يتأخر عن حفلته؟"),
  L("Who's most likely to order the same thing every time?", "من الأكثر احتمالاً أن يطلب نفس الطبق في كل مرة؟"),
  L("Who's most likely to win a cooking show?", "من الأكثر احتمالاً أن يفوز ببرنامج طبخ؟"),
  L("Who's most likely to get lost with a map?", "من الأكثر احتمالاً أن يضيع رغم وجود خريطة؟"),
  L("Who's most likely to laugh at the wrong moment?", "من الأكثر احتمالاً أن يضحك في الوقت الخطأ؟"),
  L("Who's most likely to plan the next trip?", "من الأكثر احتمالاً أن يخطط للرحلة القادمة؟"),
  L("Who's most likely to adopt five cats?", "من الأكثر احتمالاً أن يتبنى خمس قطط؟"),
  L("Who's most likely to start dancing first?", "من الأكثر احتمالاً أن يبدأ الرقص أولاً؟"),
  L("Who's most likely to remember everyone's birthday?", "من الأكثر احتمالاً أن يتذكر أعياد ميلاد الجميع؟"),
  L("Who's most likely to fall asleep in a film?", "من الأكثر احتمالاً أن ينام أثناء فيلم؟"),
  L("Who's most likely to talk to strangers?", "من الأكثر احتمالاً أن يتحدث مع الغرباء؟"),
];

export const NEVER_HAVE_I: Loc[] = [
  L("Never have I ever… sung karaoke.", "لم يسبق لي أبداً… أن غنيت كاريوكي."),
  L("Never have I ever… been on a desert safari.", "لم يسبق لي أبداً… أن ذهبت في سفاري صحراوية."),
  L("Never have I ever… cooked a meal that went wrong.", "لم يسبق لي أبداً… أن طبخت وجبة فشلت."),
  L("Never have I ever… missed a flight.", "لم يسبق لي أبداً… أن فاتتني رحلة طيران."),
  L("Never have I ever… sent a message to the wrong person.", "لم يسبق لي أبداً… أن أرسلت رسالة للشخص الخطأ."),
  L("Never have I ever… stayed up to watch the sunrise.", "لم يسبق لي أبداً… أن سهرت حتى شروق الشمس."),
  L("Never have I ever… been on TV.", "لم يسبق لي أبداً… أن ظهرت على التلفاز."),
  L("Never have I ever… eaten something really spicy by mistake.", "لم يسبق لي أبداً… أن أكلت شيئاً حاراً جداً بالخطأ."),
  L("Never have I ever… forgotten someone's name straight after meeting them.", "لم يسبق لي أبداً… أن نسيت اسم شخص فور تعرفي عليه."),
  L("Never have I ever… tried skydiving.", "لم يسبق لي أبداً… أن جربت القفز المظلي."),
  L("Never have I ever… laughed so hard I cried.", "لم يسبق لي أبداً… أن ضحكت حتى بكيت."),
  L("Never have I ever… lost my phone in my hand.", "لم يسبق لي أبداً… أن بحثت عن هاتفي وهو في يدي."),
];

export const CHARADES: Loc[] = [
  L("Brushing your teeth", "تنظيف الأسنان"), L("Riding a camel", "ركوب الجمل"), L("Taking a selfie", "التقاط صورة سيلفي"),
  L("Playing football", "لعب كرة القدم"), L("A sleeping cat", "قطة نائمة"), L("Making a pizza", "صنع البيتزا"),
  L("Swimming", "السباحة"), L("A superhero", "بطل خارق"), L("Driving in traffic", "القيادة في الزحام"),
  L("Building a sandcastle", "بناء قلعة رملية"), L("Flying a kite", "تطيير طائرة ورقية"), L("A robot", "روبوت"),
  L("Playing the guitar", "العزف على الغيتار"), L("Eating spaghetti", "أكل السباغيتي"), L("A lion", "أسد"),
  L("Skiing", "التزلج"), L("Opening a present", "فتح هدية"), L("Taking a photo", "التقاط صورة"),
  L("Washing a car", "غسل سيارة"), L("A penguin", "بطريق"), L("Painting a picture", "رسم لوحة"),
  L("Riding a bike", "ركوب الدراجة"), L("Blowing up a balloon", "نفخ بالون"), L("A chef", "طاهٍ"),
  L("Climbing a mountain", "تسلق جبل"), L("Playing tennis", "لعب التنس"), L("A monkey", "قرد"),
  L("Watching a scary film", "مشاهدة فيلم مرعب"), L("Making tea", "تحضير الشاي"), L("A ballerina", "راقصة باليه"),
];

export const CATEGORIES: Loc[] = [
  L("Fruits", "فواكه"), L("Animals", "حيوانات"), L("Countries", "دول"), L("Football teams", "فرق كرة قدم"),
  L("Ice cream flavours", "نكهات آيس كريم"), L("Things in a kitchen", "أشياء في المطبخ"), L("Famous singers", "مطربون مشهورون"),
  L("Cities in the world", "مدن في العالم"), L("Things that are red", "أشياء حمراء"), L("Sports", "رياضات"),
  L("Desserts", "حلويات"), L("Car brands", "ماركات سيارات"), L("Things at the beach", "أشياء على الشاطئ"),
  L("Films", "أفلام"), L("Jobs", "مهن"), L("Vegetables", "خضروات"), L("Things that fly", "أشياء تطير"),
  L("Board games", "ألعاب لوحية"), L("Breakfast foods", "أطعمة الفطور"), L("Superheroes", "أبطال خارقون"),
];

export const EMOJI_PUZZLES: { q: Loc; a: Loc }[] = [
  { q: L("🦁👑", "🦁👑"), a: L("The Lion King", "الأسد الملك") },
  { q: L("❄️👸", "❄️👸"), a: L("Frozen", "ملكة الثلج (فروزن)") },
  { q: L("🕷️🧑", "🕷️🧑"), a: L("Spider-Man", "الرجل العنكبوت") },
  { q: L("🚢🧊💔", "🚢🧊💔"), a: L("Titanic", "تايتانك") },
  { q: L("🧞🪔", "🧞🪔"), a: L("Aladdin", "علاء الدين") },
  { q: L("🐠🔍", "🐠🔍"), a: L("Finding Nemo", "البحث عن نيمو") },
  { q: L("🦖🏝️", "🦖🏝️"), a: L("Jurassic Park", "الحديقة الجوراسية") },
  { q: L("🧙‍♂️⚡👓", "🧙‍♂️⚡👓"), a: L("Harry Potter", "هاري بوتر") },
  { q: L("🤖❤️🌱", "🤖❤️🌱"), a: L("WALL-E", "وول-إي") },
  { q: L("🐀👨‍🍳", "🐀👨‍🍳"), a: L("Ratatouille", "راتاتوي") },
  { q: L("🦸‍♂️🛡️🇺🇸", "🦸‍♂️🛡️🇺🇸"), a: L("Captain America", "كابتن أمريكا") },
  { q: L("👻🚫", "👻🚫"), a: L("Ghostbusters", "صائدو الأشباح") },
];

export const ADULT_TRIVIA: { q: Loc; o: Loc[]; a: number; lvl?: 1 | 2 | 3 }[] = [
  { q: L("What is the tallest building in the world?", "ما هو أطول مبنى في العالم؟"), o: [L("Shanghai Tower", "برج شنغهاي"), L("Burj Khalifa", "برج خليفة"), L("One World Trade Center", "مركز التجارة العالمي")], a: 1 },
  { q: L("Which planet is known as the Red Planet?", "أي كوكب يعرف بالكوكب الأحمر؟"), o: [L("Mars", "المريخ"), L("Venus", "الزهرة"), L("Jupiter", "المشتري")], a: 0 },
  { q: L("How many emirates make up the UAE?", "كم عدد الإمارات في دولة الإمارات؟"), o: [L("5", "5"), L("7", "7"), L("9", "9")], a: 1 },
  { q: L("What is the capital of the United Kingdom?", "ما هي عاصمة المملكة المتحدة؟"), o: [L("Manchester", "مانشستر"), L("Edinburgh", "إدنبرة"), L("London", "لندن")], a: 2 },
  { q: L("Which ocean is the largest?", "ما أكبر محيط؟"), o: [L("Atlantic", "الأطلسي"), L("Pacific", "الهادئ"), L("Indian", "الهندي")], a: 1 },
  { q: L("Who painted the Mona Lisa?", "من رسم الموناليزا؟"), o: [L("Picasso", "بيكاسو"), L("Leonardo da Vinci", "ليوناردو دا فينشي"), L("Van Gogh", "فان غوخ")], a: 1 },
  { q: L("What is the main ingredient in hummus?", "ما المكون الرئيسي في الحمص؟"), o: [L("Lentils", "العدس"), L("Chickpeas", "الحمص"), L("Beans", "الفول")], a: 1 },
  { q: L("How many players are on a football team on the pitch?", "كم عدد لاعبي فريق كرة القدم في الملعب؟"), o: [L("9", "9"), L("10", "10"), L("11", "11")], a: 2 },
  { q: L("Which country is famous for the pyramids of Giza?", "أي دولة تشتهر بأهرامات الجيزة؟"), o: [L("Egypt", "مصر"), L("Jordan", "الأردن"), L("Mexico", "المكسيك")], a: 0 },
  { q: L("What is the hardest natural substance?", "ما أقسى مادة طبيعية؟"), o: [L("Gold", "الذهب"), L("Iron", "الحديد"), L("Diamond", "الألماس")], a: 2 },
  { q: L("In which year did the UAE become a country?", "في أي عام تأسست دولة الإمارات؟"), o: [L("1961", "1961"), L("1971", "1971"), L("1981", "1981")], a: 1 },
  { q: L("Which fruit is dried to make a raisin?", "ما الفاكهة التي يُصنع منها الزبيب؟"), o: [L("Grape", "العنب"), L("Plum", "البرقوق"), L("Date", "التمر")], a: 0 },
];

/* ------------------------------ Date night ------------------------------ */

export const EXTRA_DATE_DECKS: { id: string; t: Loc; s: Loc; cards: Loc[] }[] = [
  {
    id: "deep", t: L("Deeper questions", "أسئلة أعمق"), s: L("For when you want a real conversation", "عندما تريدان حديثاً حقيقياً"), cards: [
      L("What's something you're proud of that most people don't know?", "ما الشيء الذي تفخر به ولا يعرفه أغلب الناس؟"),
      L("What does a perfect day look like for you?", "كيف يبدو يومك المثالي؟"),
      L("Who has shaped you the most?", "من الشخص الذي أثّر فيك أكثر من غيره؟"),
      L("What's a dream you haven't told many people?", "ما الحلم الذي لم تخبر به كثيرين؟"),
      L("When do you feel most yourself?", "متى تشعر بأنك على طبيعتك أكثر؟"),
      L("What's the best lesson a mistake taught you?", "ما أفضل درس تعلمته من خطأ؟"),
      L("What makes you feel really looked after?", "ما الذي يشعرك بالاهتمام حقاً؟"),
      L("What would you do if you knew you couldn't fail?", "ماذا كنت ستفعل لو عرفت أنك لن تفشل؟"),
    ]},
  {
    id: "dreams", t: L("Dream big", "أحلام كبيرة"), s: L("Plans, wishes and someday ideas", "خطط وأمنيات وأفكار ليوم ما"), cards: [
      L("If money didn't matter, how would you spend a year?", "لو لم يكن المال مهماً، كيف ستقضي عاماً كاملاً؟"),
      L("Where would you love to live one day?", "أين تحب أن تعيش يوماً ما؟"),
      L("What's one skill you want to learn this year?", "ما المهارة التي تريد تعلمها هذا العام؟"),
      L("Describe your dream home in three words.", "صف بيت أحلامك في ثلاث كلمات."),
      L("What adventure should we have before we're 60?", "ما المغامرة التي يجب أن نعيشها قبل سن الستين؟"),
      L("If you could start any business, what would it be?", "لو استطعت بدء أي مشروع، ماذا سيكون؟"),
      L("What's a small dream we could make happen this month?", "ما الحلم الصغير الذي يمكننا تحقيقه هذا الشهر؟"),
      L("What do you want to be remembered for?", "بماذا تحب أن يتذكرك الناس؟"),
    ]},
  {
    id: "foodie", t: L("Foodie questions", "أسئلة للذواقة"), s: L("Perfect while you wait for the food", "مثالية أثناء انتظار الطعام"), cards: [
      L("What's your all-time favourite meal?", "ما وجبتك المفضلة على الإطلاق؟"),
      L("What food reminds you of home?", "ما الطعام الذي يذكّرك بالبيت؟"),
      L("Sweet or savoury breakfast, and why?", "فطور حلو أم مالح، ولماذا؟"),
      L("What's the strangest thing you've ever eaten?", "ما أغرب شيء أكلته في حياتك؟"),
      L("If you could only eat one cuisine forever, which one?", "لو كان عليك أكل مطبخ واحد للأبد، أيهما تختار؟"),
      L("What dish would you cook to impress me?", "ما الطبق الذي ستطبخه لتبهرني؟"),
      L("Best restaurant you've ever been to?", "ما أفضل مطعم زرته؟"),
      L("What's your guilty-pleasure snack?", "ما الوجبة الخفيفة التي تحبها سراً؟"),
    ]},
  {
    id: "playful", t: L("Playful & flirty", "مرح وغزل خفيف"), s: L("Light-hearted and a little cheeky", "خفيفة الظل وفيها شقاوة بسيطة"), cards: [
      L("What was your first impression of me?", "ما كان انطباعك الأول عني؟"),
      L("What's my most charming habit?", "ما أكثر عادة جذابة عندي؟"),
      L("Describe our relationship as a film title.", "صف علاقتنا كعنوان فيلم."),
      L("What song would play when I walk into a room?", "ما الأغنية التي تُعزف عندما أدخل الغرفة؟"),
      L("What's the cutest thing I've ever done?", "ما ألطف شيء فعلته؟"),
      L("If we had a theme tune, what would it be?", "لو كان لنا لحن خاص، ماذا سيكون؟"),
      L("What outfit of mine do you love most?", "أي ملابس لي تحبها أكثر؟"),
      L("Rate our first date out of 10. Be honest!", "قيّم موعدنا الأول من 10. كن صادقاً!"),
    ]},
  {
    id: "rapid", t: L("Rapid fire", "أسئلة سريعة"), s: L("Answer fast, no thinking!", "أجب بسرعة بدون تفكير!"), cards: [
      L("Beach or mountains?", "شاطئ أم جبال؟"), L("Morning or night?", "صباح أم ليل؟"), L("Cats or dogs?", "قطط أم كلاب؟"),
      L("Text or call?", "رسالة أم مكالمة؟"), L("Sunrise or sunset?", "شروق أم غروب؟"), L("Film night or night out?", "سهرة أفلام أم خروج؟"),
      L("Tea or coffee?", "شاي أم قهوة؟"), L("Plan ahead or go with the flow?", "تخطيط مسبق أم عفوية؟"),
    ]},
  {
    id: "appreciate", t: L("Appreciation", "امتنان"), s: L("Say the nice things out loud", "قولوا الأشياء الجميلة بصوت عالٍ"), cards: [
      L("What's one thing I do that makes your day better?", "ما الشيء الذي أفعله ويجعل يومك أفضل؟"),
      L("When did I last make you laugh?", "متى آخر مرة أضحكتك؟"),
      L("What's a quality of mine you admire?", "ما الصفة فيّ التي تعجبك؟"),
      L("What memory of us do you replay the most?", "ما الذكرى عنا التي تتذكرها كثيراً؟"),
      L("How have I helped you grow?", "كيف ساعدتك على أن تتطور؟"),
      L("What's something small I do that you notice?", "ما الشيء الصغير الذي أفعله وتلاحظه؟"),
      L("Finish this: I feel lucky because…", "أكمل الجملة: أشعر بأنني محظوظ لأن…"),
      L("What are you most grateful for this year?", "ما أكثر شيء تشعر بالامتنان له هذا العام؟"),
    ]},
  {
    id: "travel", t: L("Travel together", "نسافر معاً"), s: L("Trips, memories and bucket lists", "رحلات وذكريات وقوائم أحلام"), cards: [
      L("Where should our next trip be?", "أين يجب أن تكون رحلتنا القادمة؟"),
      L("Window seat or aisle seat?", "مقعد النافذة أم الممر؟"),
      L("What's the best place you've ever visited?", "ما أفضل مكان زرته؟"),
      L("Road trip or flight?", "رحلة بالسيارة أم بالطائرة؟"),
      L("City break or beach resort?", "رحلة إلى مدينة أم منتجع شاطئي؟"),
      L("What's one country on your bucket list?", "ما الدولة الموجودة في قائمة أحلامك؟"),
      L("What's your best travel disaster story?", "ما أطرف قصة كارثة سفر حصلت لك؟"),
      L("Plan our dream weekend away in one minute.", "خطط لعطلة نهاية أسبوع مثالية لنا في دقيقة."),
    ]},
];

/* ------------------------------ Teens ------------------------------ */

/** Word scramble lists per language (letters are shuffled in the game). */
export const SCRAMBLE_WORDS: { en: string[]; ar: string[] } = {
  en: ["PIZZA", "FALCON", "DESERT", "ROCKET", "BURGER", "PLANET", "GUITAR", "CAMERA", "DOLPHIN", "FOOTBALL", "TABLE", "MANGO", "TIGER", "CASTLE", "WIZARD"],
  ar: ["قمر", "بحر", "صقر", "جمل", "كتاب", "مدرسة", "شمس", "نخلة", "سيارة", "قلم", "برتقال", "طائرة", "حديقة", "ملعب", "صحراء"],
};

/* ------------------------------ Drinking games (opt-in, age-gated) ------------------------------ */

export const DRINK_NEVER: Loc[] = [
  L("Never have I ever… sung in the shower like it was a concert.", "لم يسبق لي أبداً… أن غنيت تحت الدش وكأنها حفلة."),
  L("Never have I ever… stalked an ex online.", "لم يسبق لي أبداً… أن تتبعت حبيباً سابقاً على الإنترنت."),
  L("Never have I ever… pretended to know a song.", "لم يسبق لي أبداً… أن تظاهرت بأنني أعرف أغنية."),
  L("Never have I ever… fallen asleep at a party.", "لم يسبق لي أبداً… أن نمت في حفلة."),
  L("Never have I ever… sent a voice note longer than 3 minutes.", "لم يسبق لي أبداً… أن أرسلت رسالة صوتية أطول من 3 دقائق."),
  L("Never have I ever… cancelled plans to stay in.", "لم يسبق لي أبداً… أن ألغيت خططاً لأبقى في البيت."),
  L("Never have I ever… laughed at my own joke before finishing it.", "لم يسبق لي أبداً… أن ضحكت على نكتتي قبل أن أنهيها."),
  L("Never have I ever… gone on a blind date.", "لم يسبق لي أبداً… أن ذهبت إلى موعد أعمى."),
  L("Never have I ever… lied about my age.", "لم يسبق لي أبداً… أن كذبت بشأن عمري."),
  L("Never have I ever… danced on a table.", "لم يسبق لي أبداً… أن رقصت على طاولة."),
];

export const DRINK_LIKELY: Loc[] = [
  L("Most likely to start a dance-off. They take a sip!", "الأكثر احتمالاً أن يبدأ تحدي رقص. يأخذ رشفة!"),
  L("Most likely to text their ex tonight. They take a sip!", "الأكثر احتمالاً أن يراسل حبيبه السابق الليلة. يأخذ رشفة!"),
  L("Most likely to order one more round. They take a sip!", "الأكثر احتمالاً أن يطلب جولة إضافية. يأخذ رشفة!"),
  L("Most likely to make friends with the staff. They take a sip!", "الأكثر احتمالاً أن يصادق الموظفين. يأخذ رشفة!"),
  L("Most likely to forget where they parked. They take a sip!", "الأكثر احتمالاً أن ينسى مكان سيارته. يأخذ رشفة!"),
  L("Most likely to start singing first. They take a sip!", "الأكثر احتمالاً أن يبدأ الغناء أولاً. يأخذ رشفة!"),
  L("Most likely to tell an embarrassing story. They take a sip!", "الأكثر احتمالاً أن يحكي قصة محرجة. يأخذ رشفة!"),
  L("Most likely to be late tomorrow. They take a sip!", "الأكثر احتمالاً أن يتأخر غداً. يأخذ رشفة!"),
  L("Most likely to take 50 selfies tonight. They take a sip!", "الأكثر احتمالاً أن يلتقط 50 صورة سيلفي الليلة. يأخذ رشفة!"),
  L("Most likely to win a game show. They take a sip!", "الأكثر احتمالاً أن يفوز ببرنامج مسابقات. يأخذ رشفة!"),
];

export const SIP_OR_SHARE: Loc[] = [
  L("Show the last photo on your phone, or take a sip.", "أظهر آخر صورة في هاتفك، أو خذ رشفة."),
  L("Tell us your most awkward date story, or take a sip.", "احكِ لنا أكثر موعد محرج حصل لك، أو خذ رشفة."),
  L("Read out your last text message, or take a sip.", "اقرأ آخر رسالة نصية لديك، أو خذ رشفة."),
  L("Who here would you call in an emergency? Answer, or sip.", "من هنا ستتصل به في حالة طارئة؟ أجب، أو خذ رشفة."),
  L("What's your most-played song this month? Answer, or sip.", "ما أكثر أغنية سمعتها هذا الشهر؟ أجب، أو خذ رشفة."),
  L("Do your best impression of someone at the table, or take a sip.", "قلّد أحد الجالسين على الطاولة، أو خذ رشفة."),
  L("Reveal your screen time today, or take a sip.", "اكشف مدة استخدامك للهاتف اليوم، أو خذ رشفة."),
  L("What's the worst gift you've ever received? Answer, or sip.", "ما أسوأ هدية تلقيتها؟ أجب، أو خذ رشفة."),
  L("Tell us a secret talent, or take a sip.", "أخبرنا عن موهبة سرية، أو خذ رشفة."),
  L("Let the table post a story on your Instagram, or take two sips.", "دع الطاولة تنشر قصة على إنستغرامك، أو خذ رشفتين."),
];

export const TABLE_RULES: Loc[] = [
  L("New rule: no first names. Slip up? Take a sip.", "قاعدة جديدة: ممنوع ذكر الأسماء. أخطأت؟ خذ رشفة."),
  L("Everyone born in summer takes a sip.", "كل من ولد في الصيف يأخذ رشفة."),
  L("The person with the most recent birthday makes a toast.", "صاحب أقرب عيد ميلاد يلقي كلمة نخب."),
  L("Thumb master: the last to copy your thumb on the table sips.", "سيد الإبهام: آخر من يضع إبهامه على الطاولة يأخذ رشفة."),
  L("Category round: name cities. First to pause takes a sip.", "جولة الفئات: اذكروا مدناً. أول من يتوقف يأخذ رشفة."),
  L("Everyone wearing black takes a sip.", "كل من يرتدي الأسود يأخذ رشفة."),
  L("Rhyme time: say a word, go round rhyming. First to fail sips.", "وقت القافية: قل كلمة ويتبادلون القافية. أول من يفشل يأخذ رشفة."),
  L("Question master: anyone who answers your question sips.", "سيد الأسئلة: كل من يجيب على سؤالك يأخذ رشفة."),
  L("Phones down! The first to touch theirs takes a sip.", "ضعوا الهواتف! أول من يلمس هاتفه يأخذ رشفة."),
  L("The youngest at the table picks someone to sip.", "الأصغر على الطاولة يختار شخصاً ليأخذ رشفة."),
];

/* ------------------------------ Puzzles (adults) ------------------------------ */

/** Crossword word bank (English). A fresh mini crossword is built from these each game. */
export const CROSSWORD_BANK: { w: string; c: string }[] = [
  { w: "DUBAI", c: "City with the Burj Khalifa" }, { w: "FALCON", c: "The UAE's national bird" }, { w: "DESERT", c: "Sandy place for a safari" },
  { w: "CAMEL", c: "Ship of the desert" }, { w: "OASIS", c: "Green spot in the desert" }, { w: "DATES", c: "Sweet fruit from a palm" },
  { w: "KARAK", c: "Spiced milky tea" }, { w: "COFFEE", c: "Morning pick-me-up" }, { w: "MENU", c: "List of dishes" },
  { w: "WAITER", c: "Brings your food" }, { w: "TABLE", c: "You're sitting at one" }, { w: "PIZZA", c: "Italian dish with toppings" },
  { w: "BURGER", c: "Patty in a bun" }, { w: "SALAD", c: "Bowl of greens" }, { w: "DESSERT", c: "Sweet course" },
  { w: "LONDON", c: "Capital of the UK" }, { w: "PARIS", c: "City of the Eiffel Tower" }, { w: "OCEAN", c: "Very large sea" },
  { w: "BEACH", c: "Sandy shore" }, { w: "SUNSET", c: "End-of-day sky show" }, { w: "MUSIC", c: "Songs and melodies" },
  { w: "GUITAR", c: "Six-stringed instrument" }, { w: "PIANO", c: "Instrument with 88 keys" }, { w: "MOVIE", c: "Film at the cinema" },
  { w: "SOCCER", c: "Football, to Americans" }, { w: "TENNIS", c: "Wimbledon sport" }, { w: "GOLF", c: "Sport with tees and greens" },
  { w: "GOAL", c: "What strikers score" }, { w: "PLANET", c: "Mars or Venus" }, { w: "MOON", c: "Earth's night light" },
  { w: "STAR", c: "Twinkler in the sky" }, { w: "RIVER", c: "Flows to the sea" }, { w: "ISLAND", c: "Land surrounded by water" },
  { w: "SILVER", c: "Second-place medal" }, { w: "GOLD", c: "First-place medal" }, { w: "LEMON", c: "Sour yellow fruit" },
  { w: "MANGO", c: "Tropical stone fruit" }, { w: "HONEY", c: "Made by bees" }, { w: "BREAD", c: "Baked loaf" },
  { w: "CHEESE", c: "Say this for a photo" }, { w: "SPICE", c: "Saffron or cumin" }, { w: "ORANGE", c: "Colour and fruit" },
  { w: "GREEN", c: "Colour of grass" }, { w: "PURPLE", c: "Red plus blue" }, { w: "WINTER", c: "Coldest season" },
  { w: "SUMMER", c: "Hottest season" }, { w: "FRIDAY", c: "Brunch day in Dubai" }, { w: "PARTY", c: "Celebration" },
  { w: "DANCE", c: "Move to the music" }, { w: "SMILE", c: "Happy face" }, { w: "LAUGH", c: "Ha ha ha" },
  { w: "TRAIN", c: "Runs on rails" }, { w: "PLANE", c: "Flies to Heathrow" }, { w: "HOTEL", c: "Place to stay on holiday" },
  { w: "TAXI", c: "Yellow cab" }, { w: "METRO", c: "Underground railway" }, { w: "PHONE", c: "You're holding one" },
  { w: "CAMERA", c: "Takes photos" }, { w: "TIGER", c: "Striped big cat" }, { w: "LION", c: "King of the jungle" },
  { w: "SHARK", c: "Toothy fish" }, { w: "EAGLE", c: "Bird of prey" }, { w: "ZEBRA", c: "Striped horse" },
];

/** Word search themes per language. */
export const WORDSEARCH_THEMES: { en: { t: string; w: string[] }[]; ar: { t: string; w: string[] }[] } = {
  en: [
    { t: "Food", w: ["PIZZA", "PASTA", "BURGER", "SALAD", "CURRY", "SUSHI", "TACOS", "STEAK"] },
    { t: "Travel", w: ["FLIGHT", "HOTEL", "BEACH", "PASSPORT", "TICKET", "MAP", "TRAIN", "CRUISE"] },
    { t: "Sport", w: ["GOAL", "TENNIS", "GOLF", "RUGBY", "CRICKET", "PADEL", "BOXING", "RACING"] },
    { t: "Dubai", w: ["DESERT", "MARINA", "DATES", "FALCON", "SOUK", "CAMEL", "DHOW", "BURJ"] },
    { t: "Music", w: ["GUITAR", "DRUMS", "PIANO", "SINGER", "BAND", "CHORUS", "VIOLIN", "TEMPO"] },
    { t: "Drinks", w: ["COFFEE", "KARAK", "LATTE", "JUICE", "SODA", "MOJITO", "SHAKE", "WATER"] },
  ],
  ar: [
    { t: "طعام", w: ["خبز", "أرز", "حمص", "فلافل", "شاورما", "كبسة", "سلطة", "تمر"] },
    { t: "سفر", w: ["طائرة", "فندق", "شاطئ", "جواز", "تذكرة", "خريطة", "قطار", "رحلة"] },
    { t: "رياضة", w: ["كرة", "هدف", "ملعب", "سباق", "سباحة", "تنس", "فريق", "لاعب"] },
    { t: "طبيعة", w: ["بحر", "جبل", "نهر", "صحراء", "شجرة", "قمر", "شمس", "نجمة"] },
  ],
};

/** Word guess answers (5 letters, English). */
export const WORDGUESS_ANSWERS = [
  "TABLE", "PIZZA", "MANGO", "BEACH", "DANCE", "MUSIC", "SMILE", "LEMON", "HONEY", "PARTY", "TRAIN", "PLANE", "HOTEL",
  "TIGER", "EAGLE", "SHARK", "CAMEL", "OASIS", "DATES", "BREAD", "SALAD", "SPICE", "GREEN", "LAUGH", "PHONE", "MOVIE",
  "PIANO", "OCEAN", "RIVER", "STORM", "CLOUD", "SUGAR", "TOAST", "GRAPE", "PEACH", "CHAIR", "PLATE", "GLASS", "FEAST",
  "CHEER", "TOWER", "SOUND", "LIGHT", "NIGHT", "SUNNY", "BRAVE", "HAPPY", "QUIET", "ROYAL", "CROWN", "PEARL", "STONE",
];

export const SPORTS_TRIVIA: { q: Loc; o: Loc[]; a: number; lvl?: 1 | 2 | 3 }[] = [
  { q: L("How long is a football match (normal time)?", "كم مدة مباراة كرة القدم (الوقت الأصلي)؟"), o: [L("80 minutes", "80 دقيقة"), L("90 minutes", "90 دقيقة"), L("100 minutes", "100 دقيقة")], a: 1 },
  { q: L("Which country has won the most football World Cups?", "أي دولة فازت بأكبر عدد من كؤوس العالم؟"), o: [L("Germany", "ألمانيا"), L("Brazil", "البرازيل"), L("Argentina", "الأرجنتين")], a: 1 },
  { q: L("In tennis, what is a score of zero called?", "في التنس، ماذا تسمى النتيجة صفر؟"), o: [L("Love", "لاف"), L("Nil", "صفر"), L("Duck", "دك")], a: 0 },
  { q: L("How many players are on a basketball team on court?", "كم عدد لاعبي فريق كرة السلة في الملعب؟"), o: [L("5", "5"), L("6", "6"), L("7", "7")], a: 0 },
  { q: L("Which city hosts the Formula 1 Yas Marina race?", "أي مدينة تستضيف سباق فورمولا 1 في حلبة ياس مارينا؟"), o: [L("Dubai", "دبي"), L("Abu Dhabi", "أبوظبي"), L("Doha", "الدوحة")], a: 1 },
  { q: L("What sport is played at Wimbledon?", "ما الرياضة التي تُلعب في ويمبلدون؟"), o: [L("Golf", "الغولف"), L("Cricket", "الكريكيت"), L("Tennis", "التنس")], a: 2 },
  { q: L("How many holes are on a standard golf course?", "كم عدد الحفر في ملعب الغولف القياسي؟"), o: [L("9", "9"), L("18", "18"), L("21", "21")], a: 1 },
  { q: L("Which sport uses a shuttlecock?", "أي رياضة تستخدم الريشة؟"), o: [L("Badminton", "الريشة الطائرة"), L("Squash", "الاسكواش"), L("Padel", "البادل")], a: 0 },
  { q: L("How often are the Summer Olympics held?", "كل كم سنة تقام الألعاب الأولمبية الصيفية؟"), o: [L("Every 2 years", "كل سنتين"), L("Every 4 years", "كل 4 سنوات"), L("Every 5 years", "كل 5 سنوات")], a: 1 },
  { q: L("In cricket, how many balls are in an over?", "في الكريكيت، كم كرة في الأوفر الواحد؟"), o: [L("4", "4"), L("6", "6"), L("8", "8")], a: 1 },
  { q: L("Which club plays at Old Trafford?", "أي نادٍ يلعب في ملعب أولد ترافورد؟"), o: [L("Liverpool", "ليفربول"), L("Manchester United", "مانشستر يونايتد"), L("Arsenal", "آرسنال")], a: 1 },
  { q: L("What colour is the centre of an archery target?", "ما لون مركز هدف الرماية؟"), o: [L("Red", "أحمر"), L("Gold", "ذهبي"), L("Blue", "أزرق")], a: 1 },
];

/* ------------------------------ Drinking: cards and dice ------------------------------ */

/** Card rules by rank (A, 2–10, J, Q, K). Sips only. */
export const CARD_RULES: Record<string, Loc> = {
  A: L("Everyone takes a sip. Cheers!", "الجميع يأخذ رشفة. في صحتكم!"),
  "2": L("You: pick someone to take a sip.", "أنت: اختر شخصاً ليأخذ رشفة."),
  "3": L("You take a sip.", "أنت تأخذ رشفة."),
  "4": L("Floor! Last to touch the floor sips.", "الأرض! آخر من يلمس الأرض يرتشف."),
  "5": L("Thumb master: put your thumb on the table any time. Last to copy sips.", "سيد الإبهام: ضع إبهامك على الطاولة متى شئت. آخر من يقلدك يرتشف."),
  "6": L("Never have I ever: one round. If you have, sip.", "لم يسبق لي أبداً: جولة واحدة. إن فعلتها، ارتشف."),
  "7": L("Heaven: point up! Last one sips.", "السماء: أشيروا للأعلى! الأخير يرتشف."),
  "8": L("Mate: pick a buddy who sips whenever you do this round.", "رفيق: اختر رفيقاً يرتشف كلما ارتشفت في هذه الجولة."),
  "9": L("Rhyme: say a word, go round rhyming. First to fail sips.", "القافية: قل كلمة ويتبادلون القافية. أول من يفشل يرتشف."),
  "10": L("Categories: pick one, go round. First to pause sips.", "الفئات: اختر فئة ويتبادلون. أول من يتوقف يرتشف."),
  J: L("Make a rule everyone must follow until the next Jack.", "ضع قاعدة يتبعها الجميع حتى الولد التالي."),
  Q: L("Question master: anyone who answers your questions sips.", "سيد الأسئلة: كل من يجيب على أسئلتك يرتشف."),
  K: L("King: raise a toast to the table and everyone sips.", "الملك: ارفع نخباً للطاولة والجميع يرتشف."),
};

export const DICE_RULES: { test: (a: number, b: number) => boolean; t: Loc }[] = [
  { test: (a, b) => a + b === 7, t: L("Seven! Everyone sips.", "سبعة! الجميع يرتشف.") },
  { test: (a, b) => a + b === 11, t: L("Eleven! You choose who sips.", "أحد عشر! أنت تختار من يرتشف.") },
  { test: (a, b) => a === b, t: L("Doubles! Hand out that many sips.", "زوج متطابق! وزّع رشفات بعدد الرقم.") },
  { test: (a, b) => a === 1 || b === 1, t: L("A one! The person on your left sips.", "رقم واحد! الشخص على يسارك يرتشف.") },
  { test: (a, b) => a + b === 3, t: L("Three: you sip.", "ثلاثة: أنت ترتشف.") },
  { test: () => true, t: L("Safe! Pass the phone on.", "نجوت! مرّر الهاتف.") },
];

/* ------------------------------ Table vs table ------------------------------ */

/** Real-life tasks for "Challenge another table": first table to tap "Done!" wins the round. Seated and safe. */
export const TABLE_TASKS: Loc[] = [
  L("Build a tower of 5 sugar packets or napkins!", "ابنوا برجاً من 5 أكياس سكر أو مناديل!"),
  L("Everyone at your table makes a heart with their hands!", "كل من على طاولتكم يصنع قلباً بيديه!"),
  L("Find something red, something blue and something round on your table!", "اعثروا على شيء أحمر وشيء أزرق وشيء دائري على طاولتكم!"),
  L("Take a group selfie with everyone pulling a funny face!", "التقطوا صورة سيلفي جماعية بوجوه مضحكة!"),
  L("Everyone says their favourite dessert, one after another!", "كل شخص يقول حلواه المفضلة بالدور!"),
  L("Spell the venue's name out loud, one letter per person!", "تهجّوا اسم المكان بصوت عالٍ، حرف لكل شخص!"),
  L("Line up every phone on your table, screens down!", "صفّوا كل الهواتف على الطاولة ووجهها للأسفل!"),
  L("Everyone touches their nose and says 'Play at Your Table'!", "الجميع يلمس أنفه ويقول 'العب على طاولتك'!"),
  L("Name 5 countries beginning with 'S' as a table!", "اذكروا 5 دول تبدأ بحرف 'س' كفريق!"),
  L("Everyone hums the same song together for 5 seconds!", "دندنوا نفس الأغنية معاً لمدة 5 ثوانٍ!"),
  L("Make a paper-napkin crown and put it on someone!", "اصنعوا تاجاً من المناديل وضعوه على رأس أحدكم!"),
  L("Every person names a different animal, no repeats!", "كل شخص يذكر حيواناً مختلفاً بدون تكرار!"),
];

/* ---------- Extra questions and cards (every quiz and deck has at least 20) ---------- */
import { MORE_ADULT_TRIVIA, MORE_EMOJI_PUZZLES, MORE_SPORTS_TRIVIA } from "./moreTrivia";
import {
  MORE_ADULT_WYR, MORE_DATE_CARDS, MORE_DRINK_LIKELY, MORE_DRINK_NEVER, MORE_MOST_LIKELY, MORE_NEVER_HAVE_I, MORE_SIP_OR_SHARE, MORE_TABLE_RULES, MORE_TABLE_TASKS,
} from "./moreDecks";
ADULT_TRIVIA.push(...MORE_ADULT_TRIVIA);
SPORTS_TRIVIA.push(...MORE_SPORTS_TRIVIA);
EMOJI_PUZZLES.push(...MORE_EMOJI_PUZZLES);
ADULT_WYR.push(...MORE_ADULT_WYR);
MOST_LIKELY.push(...MORE_MOST_LIKELY);
NEVER_HAVE_I.push(...MORE_NEVER_HAVE_I);
DRINK_NEVER.push(...MORE_DRINK_NEVER);
DRINK_LIKELY.push(...MORE_DRINK_LIKELY);
SIP_OR_SHARE.push(...MORE_SIP_OR_SHARE);
TABLE_RULES.push(...MORE_TABLE_RULES);
TABLE_TASKS.push(...MORE_TABLE_TASKS);
for (const d of EXTRA_DATE_DECKS) d.cards.push(...(MORE_DATE_CARDS[d.id] ?? []));

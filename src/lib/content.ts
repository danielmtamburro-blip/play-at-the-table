// Platform-owned content: UI strings and game decks (English + Arabic).
// Venue-specific content (menus, offers, events) lives in Supabase.
import type { Loc } from "./types";

/** Sales WhatsApp, digits only with the country code. */
export const WHATSAPP_NUMBER = "971556627796";
export const CONTACT_EMAIL = "hello@playatyourtable.com";

export const DIET: Record<string, Loc> = {
  "V": {
    "en": "Vegetarian",
    "ar": "نباتي"
  },
  "VG": {
    "en": "Vegan",
    "ar": "نباتي صرف"
  },
  "GF": {
    "en": "Gluten-free",
    "ar": "خالٍ من الغلوتين"
  },
  "HOT": {
    "en": "Spicy",
    "ar": "حار"
  },
  "KID": {
    "en": "Kids",
    "ar": "للأطفال"
  }
};

export const ALLERGEN: Record<string, Loc> = {
  "gluten": {
    "en": "Gluten",
    "ar": "غلوتين"
  },
  "dairy": {
    "en": "Dairy",
    "ar": "ألبان"
  },
  "nuts": {
    "en": "Nuts",
    "ar": "مكسرات"
  },
  "sesame": {
    "en": "Sesame",
    "ar": "سمسم"
  },
  "fish": {
    "en": "Fish",
    "ar": "سمك"
  },
  "shellfish": {
    "en": "Shellfish",
    "ar": "قشريات"
  },
  "egg": {
    "en": "Egg",
    "ar": "بيض"
  }
};

export const KIDS_QUIZ: { q: Loc; o: Loc[]; a: number }[] = [
  {
    "q": {
      "en": "Which animal is called the 'ship of the desert'?",
      "ar": "أي حيوان يُسمى 'سفينة الصحراء'؟"
    },
    "o": [
      {
        "en": "Camel",
        "ar": "الجمل"
      },
      {
        "en": "Dolphin",
        "ar": "الدلفين"
      },
      {
        "en": "Lion",
        "ar": "الأسد"
      }
    ],
    "a": 0
  },
  {
    "q": {
      "en": "How many legs does a spider have?",
      "ar": "كم رجلاً للعنكبوت؟"
    },
    "o": [
      {
        "en": "6",
        "ar": "6"
      },
      {
        "en": "8",
        "ar": "8"
      },
      {
        "en": "10",
        "ar": "10"
      }
    ],
    "a": 1
  },
  {
    "q": {
      "en": "Mix blue and yellow paint. What colour do you get?",
      "ar": "اخلط اللون الأزرق والأصفر. ما اللون الناتج؟"
    },
    "o": [
      {
        "en": "Purple",
        "ar": "بنفسجي"
      },
      {
        "en": "Orange",
        "ar": "برتقالي"
      },
      {
        "en": "Green",
        "ar": "أخضر"
      }
    ],
    "a": 2
  },
  {
    "q": {
      "en": "Which fruit grows on palm trees in the UAE?",
      "ar": "أي فاكهة تنمو على النخيل في الإمارات؟"
    },
    "o": [
      {
        "en": "Dates",
        "ar": "التمر"
      },
      {
        "en": "Apples",
        "ar": "التفاح"
      },
      {
        "en": "Grapes",
        "ar": "العنب"
      }
    ],
    "a": 0
  },
  {
    "q": {
      "en": "What is the biggest planet?",
      "ar": "ما هو أكبر كوكب؟"
    },
    "o": [
      {
        "en": "Mars",
        "ar": "المريخ"
      },
      {
        "en": "Jupiter",
        "ar": "المشتري"
      },
      {
        "en": "Earth",
        "ar": "الأرض"
      }
    ],
    "a": 1
  },
  {
    "q": {
      "en": "How many days are in a week?",
      "ar": "كم يوماً في الأسبوع؟"
    },
    "o": [
      {
        "en": "5",
        "ar": "5"
      },
      {
        "en": "7",
        "ar": "7"
      },
      {
        "en": "10",
        "ar": "10"
      }
    ],
    "a": 1
  },
  {
    "q": {
      "en": "What do bees make?",
      "ar": "ماذا يصنع النحل؟"
    },
    "o": [
      {
        "en": "Milk",
        "ar": "الحليب"
      },
      {
        "en": "Honey",
        "ar": "العسل"
      },
      {
        "en": "Juice",
        "ar": "العصير"
      }
    ],
    "a": 1
  }
];

export const CHALLENGES: Loc[] = [
  {
    "en": "Find 3 things on the table that are round.",
    "ar": "ابحث عن 3 أشياء مستديرة على الطاولة."
  },
  {
    "en": "Spot something blue without standing up.",
    "ar": "اعثر على شيء أزرق دون أن تقف."
  },
  {
    "en": "Count all the chairs you can see.",
    "ar": "عُدّ كل الكراسي التي تراها."
  },
  {
    "en": "Make the biggest smile at the table. Grown-ups judge!",
    "ar": "اصنع أكبر ابتسامة على الطاولة. الكبار هم الحكام!"
  },
  {
    "en": "Name 5 foods that are yellow.",
    "ar": "اذكر 5 أطعمة لونها أصفر."
  },
  {
    "en": "Whisper a riddle to a grown-up.",
    "ar": "اهمس بلغز في أذن أحد الكبار."
  }
];

export const GROUP_Q: Loc[] = [
  {
    "en": "What's the best meal you've ever had?",
    "ar": "ما أفضل وجبة أكلتها في حياتك؟"
  },
  {
    "en": "If you could live in any city for a year, where would it be?",
    "ar": "لو استطعت العيش في أي مدينة لسنة، أين ستكون؟"
  },
  {
    "en": "What's a skill you'd learn instantly if you could?",
    "ar": "ما المهارة التي تتمنى تعلمها فوراً؟"
  },
  {
    "en": "What's the most Dubai thing you've ever done?",
    "ar": "ما أكثر شيء 'دبي' فعلته في حياتك؟"
  },
  {
    "en": "Which song always gets you dancing?",
    "ar": "أي أغنية تجعلك ترقص دائماً؟"
  },
  {
    "en": "What was your first job?",
    "ar": "ما كانت أول وظيفة لك؟"
  },
  {
    "en": "Best holiday memory? Go!",
    "ar": "أجمل ذكرى من الإجازات؟ هيا!"
  },
  {
    "en": "Which film could you watch again and again?",
    "ar": "أي فيلم يمكنك مشاهدته مراراً وتكراراً؟"
  },
  {
    "en": "What would your perfect weekend look like?",
    "ar": "كيف تبدو عطلة نهاية الأسبوع المثالية بالنسبة لك؟"
  },
  {
    "en": "What's something small that always makes your day better?",
    "ar": "ما الشيء البسيط الذي يحسن يومك دائماً؟"
  }
];

export const THIS_THAT: [Loc, Loc][] = [
  [
    {
      "en": "Beach day",
      "ar": "يوم على الشاطئ"
    },
    {
      "en": "Desert camp",
      "ar": "مخيم في الصحراء"
    }
  ],
  [
    {
      "en": "Shawarma",
      "ar": "شاورما"
    },
    {
      "en": "Pizza",
      "ar": "بيتزا"
    }
  ],
  [
    {
      "en": "Early bird",
      "ar": "أحب الصباح الباكر"
    },
    {
      "en": "Night owl",
      "ar": "أسهر الليل"
    }
  ],
  [
    {
      "en": "Karak",
      "ar": "كرك"
    },
    {
      "en": "Flat white",
      "ar": "فلات وايت"
    }
  ],
  [
    {
      "en": "Mountains",
      "ar": "الجبال"
    },
    {
      "en": "City break",
      "ar": "رحلة إلى مدينة"
    }
  ],
  [
    {
      "en": "Text",
      "ar": "رسالة نصية"
    },
    {
      "en": "Voice note",
      "ar": "رسالة صوتية"
    }
  ],
  [
    {
      "en": "Sweet",
      "ar": "حلو"
    },
    {
      "en": "Savoury",
      "ar": "مالح"
    }
  ],
  [
    {
      "en": "Plan everything",
      "ar": "أخطط لكل شيء"
    },
    {
      "en": "Go with the flow",
      "ar": "أترك الأمور تمشي"
    }
  ],
  [
    {
      "en": "Football",
      "ar": "كرة القدم"
    },
    {
      "en": "Padel",
      "ar": "بادل"
    }
  ],
  [
    {
      "en": "Summer",
      "ar": "الصيف"
    },
    {
      "en": "Winter",
      "ar": "الشتاء"
    }
  ]
];

export const PICKER_TASKS: Loc[] = [
  {
    "en": "Tell the table your most embarrassing (but kind) story.",
    "ar": "احكِ للطاولة أكثر موقف محرج (لطيف) حصل لك."
  },
  {
    "en": "Name 5 desserts in 10 seconds.",
    "ar": "اذكر 5 حلويات في 10 ثوانٍ."
  },
  {
    "en": "Do your best impression of someone famous.",
    "ar": "قلّد شخصية مشهورة بأفضل ما لديك."
  },
  {
    "en": "Pick the next song request.",
    "ar": "اختر الأغنية التالية."
  },
  {
    "en": "Give everyone at the table a nickname.",
    "ar": "أعطِ كل شخص على الطاولة لقباً."
  },
  {
    "en": "Two truths and a lie. The table guesses.",
    "ar": "حقيقتان وكذبة. والطاولة تخمّن."
  },
  {
    "en": "Hum a song. First to guess it picks next.",
    "ar": "دندن أغنية. من يخمنها أولاً يختار التالي."
  },
  {
    "en": "Say something nice about the person on your left.",
    "ar": "قل شيئاً لطيفاً عن الشخص على يسارك."
  }
];

export const DATE_DECKS: { id: string; t: Loc; s: Loc; cards: Loc[] }[] = [
  {
    "id": "first",
    "t": {
      "en": "First date",
      "ar": "الموعد الأول"
    },
    "s": {
      "en": "Light, easy openers",
      "ar": "أسئلة خفيفة وسهلة"
    },
    "cards": [
      {
        "en": "What did you want to be when you were little?",
        "ar": "ماذا كنت تريد أن تصبح عندما كنت صغيراً؟"
      },
      {
        "en": "What's your go-to order at a place like this?",
        "ar": "ما طلبك المعتاد في مكان كهذا؟"
      },
      {
        "en": "Best trip you've ever taken?",
        "ar": "ما أفضل رحلة قمت بها؟"
      },
      {
        "en": "What are you looking forward to this month?",
        "ar": "ما الذي تنتظره هذا الشهر؟"
      },
      {
        "en": "Are you more of a planner or a spontaneous person?",
        "ar": "هل أنت شخص يخطط أم عفوي أكثر؟"
      },
      {
        "en": "What's a hobby you'd love to try?",
        "ar": "ما الهواية التي تحب أن تجربها؟"
      },
      {
        "en": "Which song would be the soundtrack of your week?",
        "ar": "أي أغنية تمثل أسبوعك؟"
      },
      {
        "en": "What's the best advice anyone's given you?",
        "ar": "ما أفضل نصيحة تلقيتها؟"
      }
    ]
  },
  {
    "id": "couples",
    "t": {
      "en": "How well do you know me?",
      "ar": "كم تعرفني؟"
    },
    "s": {
      "en": "Guess each other's answers",
      "ar": "خمّن إجابات الآخر"
    },
    "cards": [
      {
        "en": "What's my comfort food?",
        "ar": "ما طعامي المفضل عندما أحتاج للراحة؟"
      },
      {
        "en": "Where would I go on a dream holiday?",
        "ar": "أين سأذهب في رحلة أحلامي؟"
      },
      {
        "en": "What's my biggest pet peeve?",
        "ar": "ما أكثر شيء يزعجني؟"
      },
      {
        "en": "Which film do I quote the most?",
        "ar": "أي فيلم أقتبس منه أكثر؟"
      },
      {
        "en": "What would I order here without looking at the menu?",
        "ar": "ماذا سأطلب هنا دون النظر إلى القائمة؟"
      },
      {
        "en": "Who's my favourite person to call?",
        "ar": "من الشخص الذي أحب الاتصال به أكثر؟"
      },
      {
        "en": "What's my hidden talent?",
        "ar": "ما موهبتي الخفية؟"
      },
      {
        "en": "Morning me or evening me: who's nicer?",
        "ar": "أنا في الصباح أم في المساء: من ألطف؟"
      }
    ]
  },
  {
    "id": "memory",
    "t": {
      "en": "Memory lane",
      "ar": "ذكرياتنا"
    },
    "s": {
      "en": "Shared moments and future plans",
      "ar": "لحظات مشتركة وخطط للمستقبل"
    },
    "cards": [
      {
        "en": "What do you remember about the day we met?",
        "ar": "ماذا تتذكر عن يوم لقائنا؟"
      },
      {
        "en": "Our funniest moment together?",
        "ar": "ما أطرف لحظة عشناها معاً؟"
      },
      {
        "en": "A trip we should take next year?",
        "ar": "رحلة يجب أن نقوم بها العام القادم؟"
      },
      {
        "en": "What's a small thing I do that you love?",
        "ar": "ما الشيء الصغير الذي أفعله وتحبه؟"
      },
      {
        "en": "Which meal together do you remember most?",
        "ar": "أي وجبة معاً تتذكرها أكثر؟"
      },
      {
        "en": "Something new we should try together this month?",
        "ar": "شيء جديد نجربه معاً هذا الشهر؟"
      },
      {
        "en": "What song reminds you of us?",
        "ar": "أي أغنية تذكرك بنا؟"
      },
      {
        "en": "Where do you see us in five years?",
        "ar": "أين ترانا بعد خمس سنوات؟"
      }
    ]
  }
];

export const DAYS: { en: string[]; ar: string[] } = {
  "en": [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ],
  "ar": [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت"
  ]
};

const T_EN = {
  "lang": "العربية",
  "table": "Table",
  "hello": "Welcome! What would you like to do?",
  "helloSub": "Tap anything to start. You can always come back here.",
  "offerNow": "Today's offer",
  "menu": "Menu",
  "menuS": "Food, prices & allergens",
  "drinks": "Drinks",
  "drinksS": "Mocktails, coffee & more",
  "kids": "Kids",
  "kidsS": "Colouring & games",
  "group": "Play together",
  "groupS": "Games for the group",
  "date": "Date night",
  "dateS": "Question cards for two",
  "events": "What's on",
  "eventsS": "Events this week",
  "offers": "Offers",
  "info": "Venue info",
  "wifi": "Wi-Fi",
  "password": "Password",
  "copy": "Copy",
  "copied": "Copied",
  "hours": "Hours",
  "directions": "Directions",
  "openMaps": "Open in Maps",
  "access": "Access",
  "sold": "Sold out today",
  "aed": "AED",
  "allergyNote": "Allergen information is provided by the venue. If you have a serious allergy, please tell your server before ordering. Prices include VAT.",
  "addCal": "Add to calendar",
  "today": "Today",
  "tomorrow": "Tomorrow",
  "every": "Every",
  "showServer": "Show to your server",
  "validUntil": "Valid until",
  "terms": "Terms",
  "showThis": "Show this screen to your server before ordering",
  "done": "Done",
  "kidsTitle": "Kids' corner",
  "kidsSub": "Short, calm games. No sign-up, no links, nothing is uploaded.",
  "colour": "Colouring",
  "colourS": "Tap a colour, then tap a shape",
  "memory": "Memory match",
  "memoryS": "Find the matching pairs",
  "quiz": "Kids' quiz",
  "quizS": "Fun questions with instant answers",
  "challenge": "Table challenge",
  "challengeS": "Find-it missions at your table",
  "ages": "Ages",
  "clear": "Start again",
  "fish": "Fish",
  "cupcake": "Cupcake",
  "pattern": "Pattern",
  "showGrownUp": "Finished? Show it to a grown-up!",
  "moves": "Moves",
  "pairs": "Pairs",
  "playAgain": "Play again",
  "wellDone": "Well done! You found them all.",
  "next": "Next",
  "correct": "Correct!",
  "notQuite": "Not quite. The answer is",
  "score": "You got",
  "of": "out of",
  "newChallenge": "New challenge",
  "playTogether": "Play together with a grown-up",
  "groupTitle": "Play together",
  "groupSub": "Pass one phone around. Anyone can skip, any time.",
  "quick": "Quick questions",
  "quickS": "Everyone answers out loud",
  "tot": "This or that",
  "totS": "Pick a side, then explain yourself",
  "picker": "Party picker",
  "pickerS": "The phone chooses who goes next",
  "skip": "Skip",
  "players": "Players",
  "pick": "Pick someone",
  "player": "Player",
  "goes": "goes next!",
  "task": "Their challenge",
  "pass": "Pass is always allowed.",
  "dateTitle": "Date night",
  "dateSub": "Pick a deck, then take turns. Skip anything. Answers are never saved.",
  "reveal": "Next card",
  "finish": "Finish",
  "card": "Card",
  "deckDone": "That's the deck! Pick another or enjoy your evening.",
  "privacy": "Privacy",
  "privacyTitle": "Your privacy",
  "privacyText": "This page doesn't ask for your name or contact details and doesn't save game answers or drawings. The venue only sees totals, like how many people opened the menu.",
  "close": "Close",
  "powered": "Powered by Play at Your Table",
  "back": "Back",
  "home": "Home"
};

export type TKey = keyof typeof T_EN;

export const T: Record<"en" | "ar", Record<TKey, string>> = {
  en: T_EN,
  ar: {
    "lang": "English",
    "table": "طاولة",
    "hello": "أهلاً بك! ماذا تحب أن تفعل؟",
    "helloSub": "اضغط على أي قسم للبدء. يمكنك العودة إلى هنا دائماً.",
    "offerNow": "عرض اليوم",
    "menu": "قائمة الطعام",
    "menuS": "الأطباق والأسعار ومسببات الحساسية",
    "drinks": "المشروبات",
    "drinksS": "موكتيل وقهوة والمزيد",
    "kids": "الأطفال",
    "kidsS": "تلوين وألعاب",
    "group": "العبوا معاً",
    "groupS": "ألعاب للمجموعة",
    "date": "سهرة لشخصين",
    "dateS": "بطاقات أسئلة لشخصين",
    "events": "الفعاليات",
    "eventsS": "فعاليات هذا الأسبوع",
    "offers": "العروض",
    "info": "معلومات المكان",
    "wifi": "واي فاي",
    "password": "كلمة المرور",
    "copy": "نسخ",
    "copied": "تم النسخ",
    "hours": "ساعات العمل",
    "directions": "الاتجاهات",
    "openMaps": "افتح في الخرائط",
    "access": "سهولة الوصول",
    "sold": "نفد اليوم",
    "aed": "د.إ",
    "allergyNote": "معلومات مسببات الحساسية مقدمة من المطعم. إذا كانت لديك حساسية شديدة، يرجى إبلاغ النادل قبل الطلب. الأسعار تشمل ضريبة القيمة المضافة.",
    "addCal": "أضف إلى التقويم",
    "today": "اليوم",
    "tomorrow": "غداً",
    "every": "كل",
    "showServer": "أظهره للنادل",
    "validUntil": "صالح حتى",
    "terms": "الشروط",
    "showThis": "أظهر هذه الشاشة للنادل قبل الطلب",
    "done": "تم",
    "kidsTitle": "ركن الأطفال",
    "kidsSub": "ألعاب قصيرة وهادئة. بدون تسجيل أو روابط، ولا يتم رفع أي شيء.",
    "colour": "التلوين",
    "colourS": "اختر لوناً ثم اضغط على شكل",
    "memory": "لعبة الذاكرة",
    "memoryS": "ابحث عن الأزواج المتطابقة",
    "quiz": "مسابقة الأطفال",
    "quizS": "أسئلة ممتعة بإجابات فورية",
    "challenge": "تحدي الطاولة",
    "challengeS": "مهام بحث على طاولتك",
    "ages": "الأعمار",
    "clear": "ابدأ من جديد",
    "fish": "سمكة",
    "cupcake": "كب كيك",
    "pattern": "زخرفة",
    "showGrownUp": "انتهيت؟ أرِها لأحد الكبار!",
    "moves": "المحاولات",
    "pairs": "الأزواج",
    "playAgain": "العب مرة أخرى",
    "wellDone": "أحسنت! وجدتها كلها.",
    "next": "التالي",
    "correct": "صحيح!",
    "notQuite": "ليس تماماً. الإجابة هي",
    "score": "حصلت على",
    "of": "من",
    "newChallenge": "تحدٍ جديد",
    "playTogether": "العب مع أحد الكبار",
    "groupTitle": "العبوا معاً",
    "groupSub": "مرروا هاتفاً واحداً. يمكن لأي شخص التخطي في أي وقت.",
    "quick": "أسئلة سريعة",
    "quickS": "الجميع يجيب بصوت عالٍ",
    "tot": "هذا أم ذاك",
    "totS": "اختر جانباً ثم اشرح السبب",
    "picker": "مختار الحفلة",
    "pickerS": "الهاتف يختار من التالي",
    "skip": "تخطَّ",
    "players": "اللاعبون",
    "pick": "اختر شخصاً",
    "player": "اللاعب",
    "goes": "دورك الآن!",
    "task": "التحدي",
    "pass": "التخطي مسموح دائماً.",
    "dateTitle": "سهرة لشخصين",
    "dateSub": "اختارا مجموعة ثم تبادلا الأدوار. يمكن تخطي أي سؤال. لا يتم حفظ الإجابات.",
    "reveal": "البطاقة التالية",
    "finish": "إنهاء",
    "card": "بطاقة",
    "deckDone": "انتهت المجموعة! اختارا مجموعة أخرى أو استمتعا بالسهرة.",
    "privacy": "الخصوصية",
    "privacyTitle": "خصوصيتك",
    "privacyText": "هذه الصفحة لا تطلب اسمك أو بيانات الاتصال ولا تحفظ إجابات الألعاب أو الرسومات. المطعم يرى الأرقام الإجمالية فقط، مثل عدد من فتحوا القائمة.",
    "close": "إغلاق",
    "powered": "بدعم من Play at Your Table",
    "back": "رجوع",
    "home": "الرئيسية"
  },
};

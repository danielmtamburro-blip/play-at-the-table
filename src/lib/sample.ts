// Fictional demo venue. Used when Supabase is not configured or unreachable.
// The same data is seeded into the database by supabase/seed.sql.
import type { Venue } from "./types";

export const DEMO_SLUG = "ember-date-kitchen";

export const SAMPLE_VENUE: Venue = {
  "id": "sample",
  "slug": "ember-date-kitchen",
  "name": {
    "en": "Ember & Date Kitchen",
    "ar": "مطبخ إمبر آند ديت"
  },
  "area": {
    "en": "The Walk, JBR · Dubai",
    "ar": "ذا ووك، جي بي آر · دبي"
  },
  "hours": {
    "en": "Daily 9:00 – 23:30",
    "ar": "يومياً 9:00 – 23:30"
  },
  "access": {
    "en": "Step-free entrance and accessible toilet. High chairs available.",
    "ar": "مدخل بدون درج ودورة مياه مجهزة لذوي الهمم. كراسي أطفال متوفرة."
  },
  "phone": "+971 4 000 0000",
  "mapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Walk+JBR+Dubai",
  "wifi": {
    "ssid": "EmberDate_Guest",
    "pass": "dates2026"
  },
  "allergyNote": {
    "en": "",
    "ar": ""
  },
  "brandColor": "#FF5A4E",
  "logoUrl": "",
  "games": {},
  "menuMode": "items",
  "menuPdf": "",
  "drinksPdf": "",
  "modules": {
    "menu": true,
    "drinks": true,
    "kids": true,
    "group": true,
    "date": true,
    "events": true,
    "offers": true
  },
  "menu": [
    {
      "id": "c-1",
      "kind": "food",
      "name": {
        "en": "Starters",
        "ar": "المقبلات"
      },
      "items": [
        {
          "id": "i-2",
          "name": {
            "en": "Hummus & warm bread",
            "ar": "حمص مع خبز دافئ"
          },
          "desc": {
            "en": "Silky chickpea purée, olive oil, sumac.",
            "ar": "حمص ناعم مع زيت الزيتون والسماق."
          },
          "price": 28,
          "diet": [
            "V"
          ],
          "allergens": [
            "sesame",
            "gluten"
          ],
          "soldOut": false
        },
        {
          "id": "i-3",
          "name": {
            "en": "Halloumi fries",
            "ar": "أصابع الحلوم"
          },
          "desc": {
            "en": "Crisp halloumi, za'atar, pomegranate molasses.",
            "ar": "حلوم مقرمش مع الزعتر ودبس الرمان."
          },
          "price": 36,
          "diet": [
            "V"
          ],
          "allergens": [
            "dairy",
            "gluten"
          ],
          "soldOut": false
        },
        {
          "id": "i-4",
          "name": {
            "en": "Lamb kofta sliders",
            "ar": "سلايدر كفتة لحم"
          },
          "desc": {
            "en": "Three mini buns, tahini slaw.",
            "ar": "ثلاث خبزات صغيرة مع سلطة الطحينة."
          },
          "price": 42,
          "diet": [],
          "allergens": [
            "gluten",
            "sesame",
            "egg"
          ],
          "soldOut": false
        },
        {
          "id": "i-5",
          "name": {
            "en": "Crispy calamari",
            "ar": "كاليماري مقرمش"
          },
          "desc": {
            "en": "Lemon, garlic aioli.",
            "ar": "ليمون وصلصة الثوم."
          },
          "price": 46,
          "diet": [],
          "allergens": [
            "shellfish",
            "gluten",
            "egg"
          ],
          "soldOut": true
        }
      ]
    },
    {
      "id": "c-6",
      "kind": "food",
      "name": {
        "en": "Mains",
        "ar": "الأطباق الرئيسية"
      },
      "items": [
        {
          "id": "i-7",
          "name": {
            "en": "Chicken shawarma bowl",
            "ar": "صحن شاورما دجاج"
          },
          "desc": {
            "en": "Saffron rice, pickles, garlic toum.",
            "ar": "أرز بالزعفران ومخللات وثومية."
          },
          "price": 58,
          "diet": [
            "GF"
          ],
          "allergens": [
            "egg"
          ],
          "soldOut": false
        },
        {
          "id": "i-8",
          "name": {
            "en": "Grilled sea bream",
            "ar": "سمك دنيس مشوي"
          },
          "desc": {
            "en": "Charred lemon, herb salad, tahini.",
            "ar": "ليمون مشوي وسلطة أعشاب وطحينة."
          },
          "price": 92,
          "diet": [
            "GF"
          ],
          "allergens": [
            "fish",
            "sesame"
          ],
          "soldOut": false
        },
        {
          "id": "i-9",
          "name": {
            "en": "Ember wagyu burger",
            "ar": "برجر واغيو إمبر"
          },
          "desc": {
            "en": "Smoked cheddar, date-onion jam, fries.",
            "ar": "شيدر مدخن ومربى البصل بالتمر وبطاطس."
          },
          "price": 78,
          "diet": [],
          "allergens": [
            "gluten",
            "dairy",
            "egg"
          ],
          "soldOut": false
        },
        {
          "id": "i-10",
          "name": {
            "en": "Falafel wrap",
            "ar": "لفافة فلافل"
          },
          "desc": {
            "en": "Herby falafel, pickled turnip, tahini.",
            "ar": "فلافل بالأعشاب ولفت مخلل وطحينة."
          },
          "price": 44,
          "diet": [
            "VG",
            "HOT"
          ],
          "allergens": [
            "sesame",
            "gluten"
          ],
          "soldOut": false
        }
      ]
    },
    {
      "id": "c-11",
      "kind": "food",
      "name": {
        "en": "Kids",
        "ar": "للأطفال"
      },
      "items": [
        {
          "id": "i-12",
          "name": {
            "en": "Mini pasta pomodoro",
            "ar": "باستا صغيرة بالطماطم"
          },
          "desc": {
            "en": "With a cup of fresh fruit.",
            "ar": "مع كوب فواكه طازجة."
          },
          "price": 32,
          "diet": [
            "V",
            "KID"
          ],
          "allergens": [
            "gluten",
            "dairy"
          ],
          "soldOut": false
        },
        {
          "id": "i-13",
          "name": {
            "en": "Chicken bites & chips",
            "ar": "قطع دجاج وبطاطس"
          },
          "desc": {
            "en": "Oven-baked, with ketchup.",
            "ar": "مخبوزة في الفرن مع الكاتشب."
          },
          "price": 34,
          "diet": [
            "KID"
          ],
          "allergens": [
            "gluten",
            "egg"
          ],
          "soldOut": false
        }
      ]
    },
    {
      "id": "c-14",
      "kind": "food",
      "name": {
        "en": "Desserts",
        "ar": "الحلويات"
      },
      "items": [
        {
          "id": "i-15",
          "name": {
            "en": "Luqaimat",
            "ar": "لقيمات"
          },
          "desc": {
            "en": "Golden dumplings, date syrup, sesame.",
            "ar": "لقيمات ذهبية مع دبس التمر والسمسم."
          },
          "price": 30,
          "diet": [
            "V"
          ],
          "allergens": [
            "gluten",
            "sesame",
            "dairy"
          ],
          "soldOut": false
        },
        {
          "id": "i-16",
          "name": {
            "en": "Pistachio kunafa",
            "ar": "كنافة بالفستق"
          },
          "desc": {
            "en": "Warm, with rose syrup.",
            "ar": "دافئة مع شراب الورد."
          },
          "price": 38,
          "diet": [
            "V"
          ],
          "allergens": [
            "nuts",
            "dairy",
            "gluten"
          ],
          "soldOut": false
        },
        {
          "id": "i-17",
          "name": {
            "en": "Chocolate lava cake",
            "ar": "كيكة الشوكولاتة الذائبة"
          },
          "desc": {
            "en": "Vanilla ice cream.",
            "ar": "مع آيس كريم الفانيليا."
          },
          "price": 34,
          "diet": [
            "V"
          ],
          "allergens": [
            "gluten",
            "dairy",
            "egg"
          ],
          "soldOut": false
        }
      ]
    },
    {
      "id": "c-18",
      "kind": "drinks",
      "name": {
        "en": "Mocktails",
        "ar": "موكتيلات"
      },
      "items": [
        {
          "id": "i-19",
          "name": {
            "en": "Mint lemonade",
            "ar": "ليمون بالنعناع"
          },
          "desc": {
            "en": "The Dubai classic, blended.",
            "ar": "الكلاسيكي الإماراتي المثلج."
          },
          "price": 22,
          "diet": [
            "VG"
          ],
          "allergens": [],
          "soldOut": false
        },
        {
          "id": "i-20",
          "name": {
            "en": "Passionfruit mojito",
            "ar": "موهيتو باشن فروت"
          },
          "desc": {
            "en": "Lime, mint, soda. Alcohol-free.",
            "ar": "ليم ونعناع وصودا. خالٍ من الكحول."
          },
          "price": 28,
          "diet": [
            "VG"
          ],
          "allergens": [],
          "soldOut": false
        },
        {
          "id": "i-21",
          "name": {
            "en": "Date & tahini shake",
            "ar": "ميلك شيك تمر وطحينة"
          },
          "desc": {
            "en": "Medjool dates, milk, a little cardamom.",
            "ar": "تمر مجدول وحليب ولمسة هيل."
          },
          "price": 30,
          "diet": [
            "V"
          ],
          "allergens": [
            "dairy",
            "sesame"
          ],
          "soldOut": false
        }
      ]
    },
    {
      "id": "c-22",
      "kind": "drinks",
      "name": {
        "en": "Hot drinks",
        "ar": "مشروبات ساخنة"
      },
      "items": [
        {
          "id": "i-23",
          "name": {
            "en": "Karak chai",
            "ar": "شاي كرك"
          },
          "desc": {
            "en": "Spiced, sweet, milky.",
            "ar": "بالبهارات والحليب."
          },
          "price": 12,
          "diet": [
            "V"
          ],
          "allergens": [
            "dairy"
          ],
          "soldOut": false
        },
        {
          "id": "i-24",
          "name": {
            "en": "Arabic coffee",
            "ar": "قهوة عربية"
          },
          "desc": {
            "en": "Cardamom and saffron, served with dates.",
            "ar": "بالهيل والزعفران، تقدم مع التمر."
          },
          "price": 15,
          "diet": [
            "VG"
          ],
          "allergens": [],
          "soldOut": false
        },
        {
          "id": "i-25",
          "name": {
            "en": "Flat white",
            "ar": "فلات وايت"
          },
          "desc": {
            "en": "Oat milk available.",
            "ar": "يتوفر حليب الشوفان."
          },
          "price": 22,
          "diet": [
            "V"
          ],
          "allergens": [
            "dairy"
          ],
          "soldOut": false
        }
      ]
    },
    {
      "id": "c-26",
      "kind": "drinks",
      "name": {
        "en": "Soft drinks",
        "ar": "مشروبات باردة"
      },
      "items": [
        {
          "id": "i-27",
          "name": {
            "en": "Fresh orange juice",
            "ar": "عصير برتقال طازج"
          },
          "desc": {
            "en": "Squeezed to order.",
            "ar": "يعصر عند الطلب."
          },
          "price": 20,
          "diet": [
            "VG"
          ],
          "allergens": [],
          "soldOut": false
        },
        {
          "id": "i-28",
          "name": {
            "en": "Laban",
            "ar": "لبن"
          },
          "desc": {
            "en": "Chilled, lightly salted.",
            "ar": "بارد ومملح قليلاً."
          },
          "price": 12,
          "diet": [
            "V"
          ],
          "allergens": [
            "dairy"
          ],
          "soldOut": false
        },
        {
          "id": "i-29",
          "name": {
            "en": "Still or sparkling water",
            "ar": "مياه عادية أو فوارة"
          },
          "desc": {
            "en": "750 ml.",
            "ar": "750 مل."
          },
          "price": 18,
          "diet": [
            "VG"
          ],
          "allergens": [],
          "soldOut": false
        }
      ]
    }
  ],
  "events": [
    {
      "id": "e-30",
      "title": {
        "en": "Friday Family Brunch",
        "ar": "برانش العائلة يوم الجمعة"
      },
      "desc": {
        "en": "Live cooking stations, a face painter from 1pm and the kids' corner open all afternoon.",
        "ar": "محطات طهي حية، ورسم على الوجوه من الساعة 1 ظهراً، وركن الأطفال مفتوح طوال فترة بعد الظهر."
      },
      "weekday": 5,
      "date": null,
      "start": "12:30",
      "end": "16:00"
    },
    {
      "id": "e-31",
      "title": {
        "en": "Tuesday Table Quiz",
        "ar": "مسابقة الثلاثاء"
      },
      "desc": {
        "en": "Teams of up to 6. Free to enter. Winning table gets a dessert platter.",
        "ar": "فرق حتى 6 أشخاص. المشاركة مجانية. الطاولة الفائزة تحصل على طبق حلويات."
      },
      "weekday": 2,
      "date": null,
      "start": "20:00",
      "end": "22:00"
    },
    {
      "id": "e-32",
      "title": {
        "en": "Live Oud & Acoustic",
        "ar": "عود وموسيقى أكوستيك حية"
      },
      "desc": {
        "en": "Laid-back live music on the terrace. Request a song with your server.",
        "ar": "موسيقى حية هادئة على التراس. اطلب أغنيتك من النادل."
      },
      "weekday": 4,
      "date": null,
      "start": "19:30",
      "end": "22:30"
    },
    {
      "id": "e-33",
      "title": {
        "en": "Big Match Saturdays",
        "ar": "سبت المباريات الكبيرة"
      },
      "desc": {
        "en": "Weekend football on the big screen, sharing platters for groups.",
        "ar": "مباريات كرة القدم على الشاشة الكبيرة مع أطباق مشاركة للمجموعات."
      },
      "weekday": 6,
      "date": null,
      "start": "18:00",
      "end": "23:00"
    }
  ],
  "offers": [
    {
      "id": "kef",
      "title": {
        "en": "Kids eat free on Fridays",
        "ar": "وجبة الأطفال مجاناً يوم الجمعة"
      },
      "desc": {
        "en": "One free kids' meal with every adult brunch.",
        "ar": "وجبة أطفال مجانية مع كل برانش لشخص بالغ."
      },
      "terms": {
        "en": "Children under 12. Dine-in only, Fridays 12:30–16:00. One kids' meal per paying adult. Not combinable with other offers.",
        "ar": "للأطفال دون 12 عاماً. داخل المطعم فقط، الجمعة 12:30–16:00. وجبة أطفال واحدة لكل بالغ. لا يُجمع مع عروض أخرى."
      },
      "color": "coral",
      "endsOn": null,
      "featured": true
    },
    {
      "id": "hh",
      "title": {
        "en": "2-for-1 mocktails, 4–7pm",
        "ar": "موكتيل 2 بسعر 1، 4–7 مساءً"
      },
      "desc": {
        "en": "Sunday to Thursday, any mocktail on the menu.",
        "ar": "من الأحد إلى الخميس، أي موكتيل من القائمة."
      },
      "terms": {
        "en": "Same drink, ordered together. Dine-in only. Cheaper drink is free.",
        "ar": "نفس المشروب ويطلبان معاً. داخل المطعم فقط. المشروب الأقل سعراً مجاني."
      },
      "color": "teal",
      "endsOn": null,
      "featured": false
    },
    {
      "id": "bday",
      "title": {
        "en": "Birthday dessert on us",
        "ar": "حلوى عيد الميلاد علينا"
      },
      "desc": {
        "en": "Celebrating? The birthday guest picks any dessert.",
        "ar": "تحتفل؟ صاحب عيد الميلاد يختار أي حلوى."
      },
      "terms": {
        "en": "Valid on the birthday or up to 3 days after. Show ID to your server. One per table.",
        "ar": "صالح يوم الميلاد أو حتى 3 أيام بعده. أظهر الهوية للنادل. واحدة لكل طاولة."
      },
      "color": "rose",
      "endsOn": null,
      "featured": false
    }
  ]
};

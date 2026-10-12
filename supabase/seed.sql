-- Seed: the fictional demo venue "Ember & Date Kitchen" (slug ember-date-kitchen).
-- Safe to re-run: it deletes and recreates the demo venue.
delete from public.venues where slug = 'ember-date-kitchen';
with v as (
  insert into public.venues (slug, name_en, name_ar, area_en, area_ar, hours_en, hours_ar, access_en, access_ar, phone, maps_url, wifi_ssid, wifi_pass, published)
  values ('ember-date-kitchen', 'Ember & Date Kitchen', 'مطبخ إمبر آند ديت', 'The Walk, JBR · Dubai', 'ذا ووك، جي بي آر · دبي', 'Daily 9:00 – 23:30', 'يومياً 9:00 – 23:30', 'Step-free entrance and accessible toilet. High chairs available.', 'مدخل بدون درج ودورة مياه مجهزة لذوي الهمم. كراسي أطفال متوفرة.', '+971 4 000 0000', 'https://www.google.com/maps/search/?api=1&query=The+Walk+JBR+Dubai', 'EmberDate_Guest', 'dates2026', true)
  returning id
)
select 1 from v;

with c as (insert into public.menu_categories (venue_id, kind, name_en, name_ar, sort_order) values ((select id from public.venues where slug = 'ember-date-kitchen'), 'food', 'Starters', 'المقبلات', 0) returning id, venue_id)
insert into public.menu_items (venue_id, category_id, name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order)
select c.venue_id, c.id, x.* from c, (values
  ('Hummus & warm bread', 'حمص مع خبز دافئ', 'Silky chickpea purée, olive oil, sumac.', 'حمص ناعم مع زيت الزيتون والسماق.', 28::numeric, array['V']::text[], array['sesame','gluten']::text[], false, 0),
  ('Halloumi fries', 'أصابع الحلوم', 'Crisp halloumi, za''atar, pomegranate molasses.', 'حلوم مقرمش مع الزعتر ودبس الرمان.', 36::numeric, array['V']::text[], array['dairy','gluten']::text[], false, 1),
  ('Lamb kofta sliders', 'سلايدر كفتة لحم', 'Three mini buns, tahini slaw.', 'ثلاث خبزات صغيرة مع سلطة الطحينة.', 42::numeric, array[]::text[], array['gluten','sesame','egg']::text[], false, 2),
  ('Crispy calamari', 'كاليماري مقرمش', 'Lemon, garlic aioli.', 'ليمون وصلصة الثوم.', 46::numeric, array[]::text[], array['shellfish','gluten','egg']::text[], true, 3)
) as x(name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order);

with c as (insert into public.menu_categories (venue_id, kind, name_en, name_ar, sort_order) values ((select id from public.venues where slug = 'ember-date-kitchen'), 'food', 'Mains', 'الأطباق الرئيسية', 1) returning id, venue_id)
insert into public.menu_items (venue_id, category_id, name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order)
select c.venue_id, c.id, x.* from c, (values
  ('Chicken shawarma bowl', 'صحن شاورما دجاج', 'Saffron rice, pickles, garlic toum.', 'أرز بالزعفران ومخللات وثومية.', 58::numeric, array['GF']::text[], array['egg']::text[], false, 0),
  ('Grilled sea bream', 'سمك دنيس مشوي', 'Charred lemon, herb salad, tahini.', 'ليمون مشوي وسلطة أعشاب وطحينة.', 92::numeric, array['GF']::text[], array['fish','sesame']::text[], false, 1),
  ('Ember wagyu burger', 'برجر واغيو إمبر', 'Smoked cheddar, date-onion jam, fries.', 'شيدر مدخن ومربى البصل بالتمر وبطاطس.', 78::numeric, array[]::text[], array['gluten','dairy','egg']::text[], false, 2),
  ('Falafel wrap', 'لفافة فلافل', 'Herby falafel, pickled turnip, tahini.', 'فلافل بالأعشاب ولفت مخلل وطحينة.', 44::numeric, array['VG','HOT']::text[], array['sesame','gluten']::text[], false, 3)
) as x(name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order);

with c as (insert into public.menu_categories (venue_id, kind, name_en, name_ar, sort_order) values ((select id from public.venues where slug = 'ember-date-kitchen'), 'food', 'Kids', 'للأطفال', 2) returning id, venue_id)
insert into public.menu_items (venue_id, category_id, name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order)
select c.venue_id, c.id, x.* from c, (values
  ('Mini pasta pomodoro', 'باستا صغيرة بالطماطم', 'With a cup of fresh fruit.', 'مع كوب فواكه طازجة.', 32::numeric, array['V','KID']::text[], array['gluten','dairy']::text[], false, 0),
  ('Chicken bites & chips', 'قطع دجاج وبطاطس', 'Oven-baked, with ketchup.', 'مخبوزة في الفرن مع الكاتشب.', 34::numeric, array['KID']::text[], array['gluten','egg']::text[], false, 1)
) as x(name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order);

with c as (insert into public.menu_categories (venue_id, kind, name_en, name_ar, sort_order) values ((select id from public.venues where slug = 'ember-date-kitchen'), 'food', 'Desserts', 'الحلويات', 3) returning id, venue_id)
insert into public.menu_items (venue_id, category_id, name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order)
select c.venue_id, c.id, x.* from c, (values
  ('Luqaimat', 'لقيمات', 'Golden dumplings, date syrup, sesame.', 'لقيمات ذهبية مع دبس التمر والسمسم.', 30::numeric, array['V']::text[], array['gluten','sesame','dairy']::text[], false, 0),
  ('Pistachio kunafa', 'كنافة بالفستق', 'Warm, with rose syrup.', 'دافئة مع شراب الورد.', 38::numeric, array['V']::text[], array['nuts','dairy','gluten']::text[], false, 1),
  ('Chocolate lava cake', 'كيكة الشوكولاتة الذائبة', 'Vanilla ice cream.', 'مع آيس كريم الفانيليا.', 34::numeric, array['V']::text[], array['gluten','dairy','egg']::text[], false, 2)
) as x(name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order);

with c as (insert into public.menu_categories (venue_id, kind, name_en, name_ar, sort_order) values ((select id from public.venues where slug = 'ember-date-kitchen'), 'drinks', 'Mocktails', 'موكتيلات', 0) returning id, venue_id)
insert into public.menu_items (venue_id, category_id, name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order)
select c.venue_id, c.id, x.* from c, (values
  ('Mint lemonade', 'ليمون بالنعناع', 'The Dubai classic, blended.', 'الكلاسيكي الإماراتي المثلج.', 22::numeric, array['VG']::text[], array[]::text[], false, 0),
  ('Passionfruit mojito', 'موهيتو باشن فروت', 'Lime, mint, soda. Alcohol-free.', 'ليم ونعناع وصودا. خالٍ من الكحول.', 28::numeric, array['VG']::text[], array[]::text[], false, 1),
  ('Date & tahini shake', 'ميلك شيك تمر وطحينة', 'Medjool dates, milk, a little cardamom.', 'تمر مجدول وحليب ولمسة هيل.', 30::numeric, array['V']::text[], array['dairy','sesame']::text[], false, 2)
) as x(name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order);

with c as (insert into public.menu_categories (venue_id, kind, name_en, name_ar, sort_order) values ((select id from public.venues where slug = 'ember-date-kitchen'), 'drinks', 'Hot drinks', 'مشروبات ساخنة', 1) returning id, venue_id)
insert into public.menu_items (venue_id, category_id, name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order)
select c.venue_id, c.id, x.* from c, (values
  ('Karak chai', 'شاي كرك', 'Spiced, sweet, milky.', 'بالبهارات والحليب.', 12::numeric, array['V']::text[], array['dairy']::text[], false, 0),
  ('Arabic coffee', 'قهوة عربية', 'Cardamom and saffron, served with dates.', 'بالهيل والزعفران، تقدم مع التمر.', 15::numeric, array['VG']::text[], array[]::text[], false, 1),
  ('Flat white', 'فلات وايت', 'Oat milk available.', 'يتوفر حليب الشوفان.', 22::numeric, array['V']::text[], array['dairy']::text[], false, 2)
) as x(name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order);

with c as (insert into public.menu_categories (venue_id, kind, name_en, name_ar, sort_order) values ((select id from public.venues where slug = 'ember-date-kitchen'), 'drinks', 'Soft drinks', 'مشروبات باردة', 2) returning id, venue_id)
insert into public.menu_items (venue_id, category_id, name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order)
select c.venue_id, c.id, x.* from c, (values
  ('Fresh orange juice', 'عصير برتقال طازج', 'Squeezed to order.', 'يعصر عند الطلب.', 20::numeric, array['VG']::text[], array[]::text[], false, 0),
  ('Laban', 'لبن', 'Chilled, lightly salted.', 'بارد ومملح قليلاً.', 12::numeric, array['V']::text[], array['dairy']::text[], false, 1),
  ('Still or sparkling water', 'مياه عادية أو فوارة', '750 ml.', '750 مل.', 18::numeric, array['VG']::text[], array[]::text[], false, 2)
) as x(name_en, name_ar, desc_en, desc_ar, price, diet, allergens, sold_out, sort_order);

insert into public.events (venue_id, title_en, title_ar, desc_en, desc_ar, weekday, start_time, end_time, sort_order) values
  ((select id from public.venues where slug = 'ember-date-kitchen'), 'Friday Family Brunch', 'برانش العائلة يوم الجمعة', 'Live cooking stations, a face painter from 1pm and the kids'' corner open all afternoon.', 'محطات طهي حية، ورسم على الوجوه من الساعة 1 ظهراً، وركن الأطفال مفتوح طوال فترة بعد الظهر.', 5, '12:30', '16:00', 0),
  ((select id from public.venues where slug = 'ember-date-kitchen'), 'Tuesday Table Quiz', 'مسابقة الثلاثاء', 'Teams of up to 6. Free to enter. Winning table gets a dessert platter.', 'فرق حتى 6 أشخاص. المشاركة مجانية. الطاولة الفائزة تحصل على طبق حلويات.', 2, '20:00', '22:00', 1),
  ((select id from public.venues where slug = 'ember-date-kitchen'), 'Live Oud & Acoustic', 'عود وموسيقى أكوستيك حية', 'Laid-back live music on the terrace. Request a song with your server.', 'موسيقى حية هادئة على التراس. اطلب أغنيتك من النادل.', 4, '19:30', '22:30', 2),
  ((select id from public.venues where slug = 'ember-date-kitchen'), 'Big Match Saturdays', 'سبت المباريات الكبيرة', 'Weekend football on the big screen, sharing platters for groups.', 'مباريات كرة القدم على الشاشة الكبيرة مع أطباق مشاركة للمجموعات.', 6, '18:00', '23:00', 3);

insert into public.offers (venue_id, title_en, title_ar, desc_en, desc_ar, terms_en, terms_ar, color, ends_on, featured, sort_order) values
  ((select id from public.venues where slug = 'ember-date-kitchen'), 'Kids eat free on Fridays', 'وجبة الأطفال مجاناً يوم الجمعة', 'One free kids'' meal with every adult brunch.', 'وجبة أطفال مجانية مع كل برانش لشخص بالغ.', 'Children under 12. Dine-in only, Fridays 12:30–16:00. One kids'' meal per paying adult. Not combinable with other offers.', 'للأطفال دون 12 عاماً. داخل المطعم فقط، الجمعة 12:30–16:00. وجبة أطفال واحدة لكل بالغ. لا يُجمع مع عروض أخرى.', 'coral', current_date + 45, true, 0),
  ((select id from public.venues where slug = 'ember-date-kitchen'), '2-for-1 mocktails, 4–7pm', 'موكتيل 2 بسعر 1، 4–7 مساءً', 'Sunday to Thursday, any mocktail on the menu.', 'من الأحد إلى الخميس، أي موكتيل من القائمة.', 'Same drink, ordered together. Dine-in only. Cheaper drink is free.', 'نفس المشروب ويطلبان معاً. داخل المطعم فقط. المشروب الأقل سعراً مجاني.', 'teal', current_date + 30, false, 1),
  ((select id from public.venues where slug = 'ember-date-kitchen'), 'Birthday dessert on us', 'حلوى عيد الميلاد علينا', 'Celebrating? The birthday guest picks any dessert.', 'تحتفل؟ صاحب عيد الميلاد يختار أي حلوى.', 'Valid on the birthday or up to 3 days after. Show ID to your server. One per table.', 'صالح يوم الميلاد أو حتى 3 أيام بعده. أظهر الهوية للنادل. واحدة لكل طاولة.', 'rose', current_date + 90, false, 2);

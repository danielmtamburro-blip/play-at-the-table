-- Contact us card on the guest page.
alter table public.venues
  add column if not exists address_en text not null default '' check (char_length(address_en) <= 160),
  add column if not exists address_ar text not null default '' check (char_length(address_ar) <= 160),
  add column if not exists email text not null default '' check (email = '' or email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column if not exists whatsapp text not null default '' check (whatsapp ~ '^[0-9]{0,15}$'),
  add column if not exists review_url text not null default '' check (review_url = '' or review_url ~ '^https://'),
  add column if not exists instagram text not null default '' check (instagram ~ '^[A-Za-z0-9._]{0,30}$');

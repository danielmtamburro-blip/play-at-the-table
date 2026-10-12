-- Celebrations: guests can tell staff about a birthday, anniversary etc. (a short note, staff-only).
alter table public.service_requests drop constraint service_requests_kind_check;
alter table public.service_requests add constraint service_requests_kind_check check (kind = any (array['server','bill','celebrate']));
alter table public.service_requests add column if not exists note text not null default '' check (char_length(note) <= 80);

-- Things to do nearby, curated by each venue.
create table public.nearby (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  name_en text not null check (char_length(name_en) between 1 and 80),
  name_ar text not null default '' check (char_length(name_ar) <= 80),
  desc_en text not null default '' check (char_length(desc_en) <= 300),
  desc_ar text not null default '' check (char_length(desc_ar) <= 300),
  category text not null default 'sight' check (category in ('sight','beach','park','family','shopping','culture','food','nightlife','sport')),
  distance text not null default '' check (char_length(distance) <= 30),
  maps_url text not null default '' check (maps_url = '' or maps_url ~ '^https://'),
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index nearby_venue_idx on public.nearby(venue_id, sort_order);
alter table public.nearby enable row level security;
create policy "public read nearby" on public.nearby for select to anon, authenticated
  using ((published and (select private.venue_is_public(venue_id))) or (select private.is_venue_member(venue_id)));
create policy "members insert nearby" on public.nearby for insert to authenticated with check ((select private.is_venue_member(venue_id)));
create policy "members update nearby" on public.nearby for update to authenticated using ((select private.is_venue_member(venue_id))) with check ((select private.is_venue_member(venue_id)));
create policy "members delete nearby" on public.nearby for delete to authenticated using ((select private.is_venue_member(venue_id)));
grant select on public.nearby to anon;
grant select, insert, update, delete on public.nearby to authenticated;
create trigger nearby_updated before update on public.nearby for each row execute function public.set_updated_at();

-- Play at the Table: core schema
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- Venues ------------------------------------------------------------------
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  name_en text not null check (char_length(name_en) between 1 and 120),
  name_ar text not null default '',
  area_en text not null default '',
  area_ar text not null default '',
  hours_en text not null default '',
  hours_ar text not null default '',
  access_en text not null default '',
  access_ar text not null default '',
  phone text not null default '',
  maps_url text not null default '',
  wifi_ssid text not null default '',
  wifi_pass text not null default '',
  allergy_note_en text not null default '',
  allergy_note_ar text not null default '',
  brand_color text not null default '#FF5A4E' check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  modules jsonb not null default '{"menu":true,"drinks":true,"kids":true,"group":true,"date":true,"events":true,"offers":true}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger venues_updated before update on public.venues for each row execute function public.set_updated_at();

create table public.venue_members (
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','editor')),
  created_at timestamptz not null default now(),
  primary key (venue_id, user_id)
);
create index venue_members_user_idx on public.venue_members(user_id);

create or replace function public.is_venue_member(vid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.venue_members m where m.venue_id = vid and m.user_id = (select auth.uid()))
$$;
create or replace function public.venue_is_public(vid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.venues v where v.id = vid and v.published)
$$;

-- Menus -------------------------------------------------------------------
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  kind text not null check (kind in ('food','drinks')),
  name_en text not null,
  name_ar text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, venue_id)
);
create index menu_categories_venue_idx on public.menu_categories(venue_id);
create trigger menu_categories_updated before update on public.menu_categories for each row execute function public.set_updated_at();

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  category_id uuid not null,
  name_en text not null,
  name_ar text not null default '',
  desc_en text not null default '',
  desc_ar text not null default '',
  price numeric(8,2) not null default 0 check (price >= 0),
  diet text[] not null default '{}',
  allergens text[] not null default '{}',
  sold_out boolean not null default false,
  hidden boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (category_id, venue_id) references public.menu_categories(id, venue_id) on delete cascade
);
create index menu_items_venue_idx on public.menu_items(venue_id);
create index menu_items_category_idx on public.menu_items(category_id, venue_id);
create trigger menu_items_updated before update on public.menu_items for each row execute function public.set_updated_at();

-- Events ("What's on") -----------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title_en text not null,
  title_ar text not null default '',
  desc_en text not null default '',
  desc_ar text not null default '',
  weekday smallint check (weekday between 0 and 6),   -- weekly repeat, 0 = Sunday
  event_date date,                                      -- or a one-off date
  start_time time not null,
  end_time time not null,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (weekday is not null or event_date is not null)
);
create index events_venue_idx on public.events(venue_id);
create trigger events_updated before update on public.events for each row execute function public.set_updated_at();

-- Offers ------------------------------------------------------------------
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  title_en text not null,
  title_ar text not null default '',
  desc_en text not null default '',
  desc_ar text not null default '',
  terms_en text not null default '',
  terms_ar text not null default '',
  color text not null default 'coral' check (color in ('coral','teal','rose','sun','violet')),
  starts_on date,
  ends_on date,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index offers_venue_idx on public.offers(venue_id);
create trigger offers_updated before update on public.offers for each row execute function public.set_updated_at();

-- Pilot requests from the sales page --------------------------------------
create table public.pilot_requests (
  id uuid primary key default gen_random_uuid(),
  venue_name text not null check (char_length(venue_name) between 1 and 200),
  area text not null default '' check (char_length(area) <= 200),
  venue_type text not null default '' check (char_length(venue_type) <= 100),
  tables text not null default '' check (char_length(tables) <= 20),
  contact_name text not null check (char_length(contact_name) between 1 and 200),
  contact text not null check (char_length(contact) between 3 and 200),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now()
);

-- Aggregate analytics (no personal data) ----------------------------------
create table public.analytics_events (
  id bigint generated always as identity primary key,
  venue_id uuid not null references public.venues(id) on delete cascade,
  table_label text check (char_length(table_label) <= 10),
  session_id text check (char_length(session_id) <= 64),
  event text not null check (event in ('scan','view','redeem')),
  module text check (char_length(module) <= 32),
  created_at timestamptz not null default now()
);
create index analytics_events_venue_time_idx on public.analytics_events(venue_id, created_at);

-- Row level security ------------------------------------------------------
alter table public.venues enable row level security;
alter table public.venue_members enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.events enable row level security;
alter table public.offers enable row level security;
alter table public.pilot_requests enable row level security;
alter table public.analytics_events enable row level security;

create policy "venues readable when published or by members" on public.venues
  for select to anon, authenticated using (published or (select public.is_venue_member(id)));
create policy "members update venue" on public.venues
  for update to authenticated using ((select public.is_venue_member(id))) with check ((select public.is_venue_member(id)));

create policy "see own memberships" on public.venue_members
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_venue_member(venue_id)));

create policy "public read categories" on public.menu_categories
  for select to anon, authenticated using ((select public.venue_is_public(venue_id)) or (select public.is_venue_member(venue_id)));
create policy "members insert categories" on public.menu_categories for insert to authenticated with check ((select public.is_venue_member(venue_id)));
create policy "members update categories" on public.menu_categories for update to authenticated using ((select public.is_venue_member(venue_id))) with check ((select public.is_venue_member(venue_id)));
create policy "members delete categories" on public.menu_categories for delete to authenticated using ((select public.is_venue_member(venue_id)));

create policy "public read items" on public.menu_items
  for select to anon, authenticated using ((not hidden and (select public.venue_is_public(venue_id))) or (select public.is_venue_member(venue_id)));
create policy "members insert items" on public.menu_items for insert to authenticated with check ((select public.is_venue_member(venue_id)));
create policy "members update items" on public.menu_items for update to authenticated using ((select public.is_venue_member(venue_id))) with check ((select public.is_venue_member(venue_id)));
create policy "members delete items" on public.menu_items for delete to authenticated using ((select public.is_venue_member(venue_id)));

create policy "public read events" on public.events
  for select to anon, authenticated using ((published and (select public.venue_is_public(venue_id))) or (select public.is_venue_member(venue_id)));
create policy "members insert events" on public.events for insert to authenticated with check ((select public.is_venue_member(venue_id)));
create policy "members update events" on public.events for update to authenticated using ((select public.is_venue_member(venue_id))) with check ((select public.is_venue_member(venue_id)));
create policy "members delete events" on public.events for delete to authenticated using ((select public.is_venue_member(venue_id)));

create policy "public read offers" on public.offers
  for select to anon, authenticated using ((published and (select public.venue_is_public(venue_id))) or (select public.is_venue_member(venue_id)));
create policy "members insert offers" on public.offers for insert to authenticated with check ((select public.is_venue_member(venue_id)));
create policy "members update offers" on public.offers for update to authenticated using ((select public.is_venue_member(venue_id))) with check ((select public.is_venue_member(venue_id)));
create policy "members delete offers" on public.offers for delete to authenticated using ((select public.is_venue_member(venue_id)));

create policy "anyone can send a pilot request" on public.pilot_requests
  for insert to anon, authenticated with check (true);

create policy "guests log events for published venues" on public.analytics_events
  for insert to anon, authenticated with check ((select public.venue_is_public(venue_id)));
create policy "members read their analytics" on public.analytics_events
  for select to authenticated using ((select public.is_venue_member(venue_id)));

-- Grants (explicit, in case default Data API grants are off) ---------------
grant select on public.venues, public.menu_categories, public.menu_items, public.events, public.offers to anon, authenticated;
grant update on public.venues to authenticated;
grant insert, update, delete on public.menu_categories, public.menu_items, public.events, public.offers to authenticated;
grant select on public.venue_members to authenticated;
grant insert on public.pilot_requests to anon, authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;

-- RPCs ---------------------------------------------------------------------
-- A signed-in user creates a venue and becomes its owner.
create or replace function public.create_venue(p_slug text, p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); vid uuid;
begin
  if uid is null then raise exception 'not signed in'; end if;
  insert into public.venues (slug, name_en) values (lower(trim(p_slug)), trim(p_name)) returning id into vid;
  insert into public.venue_members (venue_id, user_id, role) values (vid, uid, 'owner');
  return vid;
end $$;
revoke execute on function public.create_venue(text, text) from public, anon;
grant execute on function public.create_venue(text, text) to authenticated;

-- Aggregate totals for the dashboard (RLS limits rows to the caller's venues).
create or replace function public.venue_stats(p_venue uuid, p_days int default 7)
returns table (event text, module text, total bigint, sessions bigint)
language sql stable security invoker set search_path = '' as $$
  select e.event, coalesce(e.module, '') as module, count(*) as total, count(distinct e.session_id) as sessions
  from public.analytics_events e
  where e.venue_id = p_venue and e.created_at >= now() - make_interval(days => greatest(p_days, 1))
  group by e.event, coalesce(e.module, '')
  order by total desc
$$;
revoke execute on function public.venue_stats(uuid, int) from public, anon;
grant execute on function public.venue_stats(uuid, int) to authenticated;

revoke execute on function public.is_venue_member(uuid) from public;
revoke execute on function public.venue_is_public(uuid) from public;
grant execute on function public.is_venue_member(uuid) to anon, authenticated;
grant execute on function public.venue_is_public(uuid) to anon, authenticated;

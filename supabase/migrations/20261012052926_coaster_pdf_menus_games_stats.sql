-- Venue customisation: PDF menus, logo, game picker, coaster design
alter table public.venues
  add column menu_mode text not null default 'items' check (menu_mode in ('items','pdf')),
  add column menu_pdf_url text not null default '',
  add column drinks_pdf_url text not null default '',
  add column logo_url text not null default '',
  add column games jsonb not null default '{}'::jsonb,
  add column coaster jsonb not null default '{}'::jsonb;

-- Public bucket for logos and PDF menus, one folder per venue id. No SVG (scriptable).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('venue-assets', 'venue-assets', true, 10485760, array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

create or replace function private.can_edit_venue_path(p text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare f text := split_part(p, '/', 1);
begin
  if f !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  return private.is_venue_member(f::uuid);
end $$;
grant execute on function private.can_edit_venue_path(text) to authenticated;

create policy "venue members read their assets" on storage.objects for select to authenticated
  using (bucket_id = 'venue-assets' and (select private.can_edit_venue_path(name)));
create policy "venue members upload assets" on storage.objects for insert to authenticated
  with check (bucket_id = 'venue-assets' and (select private.can_edit_venue_path(name)));
create policy "venue members update assets" on storage.objects for update to authenticated
  using (bucket_id = 'venue-assets' and (select private.can_edit_venue_path(name)));
create policy "venue members delete assets" on storage.objects for delete to authenticated
  using (bucket_id = 'venue-assets' and (select private.can_edit_venue_path(name)));

-- Richer, still anonymous, analytics
alter table public.analytics_events drop constraint analytics_events_event_check;
alter table public.analytics_events
  add constraint analytics_events_event_check check (event in
    ('scan','view','redeem','game_start','game_finish','time','menu_cat','offer_open','wifi_copy','directions','calendar','lang','pdf_open')),
  add column item text check (char_length(item) <= 80),
  add column value int check (value between 0 and 86400),
  add column lang text check (lang in ('en','ar'));

-- Everything the stats tab needs in one call. RLS limits rows to the caller's venues.
create or replace function public.venue_report(p_venue uuid, p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with e as (
    select *, (created_at at time zone 'Asia/Dubai') as local_at
    from public.analytics_events
    where venue_id = p_venue and created_at >= p_from and created_at < p_to
  ),
  visit_time as (
    select session_id, sum(value) as secs from e where event = 'time' and session_id is not null group by session_id
  )
  select jsonb_build_object(
    'scans', (select count(*) from e where event = 'scan'),
    'visits', (select count(distinct session_id) from e),
    'section_opens', (select count(*) from e where event = 'view'),
    'redeems', (select count(*) from e where event = 'redeem'),
    'offer_opens', (select count(*) from e where event = 'offer_open'),
    'games_started', (select count(*) from e where event = 'game_start'),
    'games_finished', (select count(*) from e where event = 'game_finish'),
    'wifi_copies', (select count(*) from e where event = 'wifi_copy'),
    'directions', (select count(*) from e where event = 'directions'),
    'calendar_adds', (select count(*) from e where event = 'calendar'),
    'pdf_opens', (select count(*) from e where event = 'pdf_open'),
    'total_seconds', (select coalesce(sum(secs), 0) from visit_time),
    'avg_seconds', (select coalesce(round(avg(secs)), 0) from visit_time),
    'timed_visits', (select count(*) from visit_time),
    'arabic_visits', (select count(distinct session_id) from e where lang = 'ar'),
    'sections', (select coalesce(jsonb_agg(x order by x.opens desc), '[]') from (
        select module, count(*) as opens, count(distinct session_id) as visits from e where event = 'view' group by module) x),
    'games', (select coalesce(jsonb_agg(x order by x.started desc), '[]') from (
        select item as game, count(*) filter (where event = 'game_start') as started, count(*) filter (where event = 'game_finish') as finished
        from e where event in ('game_start','game_finish') group by item) x),
    'menu_categories', (select coalesce(jsonb_agg(x order by x.opens desc), '[]') from (
        select item as category, count(*) as opens from e where event = 'menu_cat' group by item) x),
    'offers', (select coalesce(jsonb_agg(x order by x.opens desc), '[]') from (
        select item as offer, count(*) filter (where event = 'offer_open') as opens, count(*) filter (where event = 'redeem') as redeems
        from e where event in ('offer_open','redeem') group by item) x),
    'tables', (select coalesce(jsonb_agg(x order by x.scans desc), '[]') from (
        select table_label as "table", count(*) as scans from e where event = 'scan' and table_label is not null group by table_label limit 20) x),
    'by_day', (select coalesce(jsonb_agg(x order by x.day), '[]') from (
        select to_char(local_at::date, 'YYYY-MM-DD') as day, count(*) filter (where event = 'scan') as scans,
               count(*) filter (where event = 'game_start') as games
        from e group by local_at::date) x),
    'by_hour', (select coalesce(jsonb_agg(x order by x.hour), '[]') from (
        select extract(hour from local_at)::int as hour, count(*) as scans from e where event = 'scan' group by 1) x)
  )
$$;
revoke execute on function public.venue_report(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.venue_report(uuid, timestamptz, timestamptz) to authenticated;

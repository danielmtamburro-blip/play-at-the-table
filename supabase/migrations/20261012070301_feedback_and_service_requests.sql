-- Guest feedback: emoji rating + optional comment. Anonymous.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  table_label text check (char_length(table_label) <= 10),
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 500),
  lang text check (lang in ('en','ar')),
  created_at timestamptz not null default now()
);
create index feedback_venue_time_idx on public.feedback(venue_id, created_at desc);
alter table public.feedback enable row level security;
create policy "guests leave feedback for published venues" on public.feedback
  for insert to anon, authenticated with check ((select private.venue_is_public(venue_id)));
create policy "members read feedback" on public.feedback
  for select to authenticated using ((select private.is_venue_member(venue_id)));
create policy "members delete feedback" on public.feedback
  for delete to authenticated using ((select private.is_venue_member(venue_id)));
grant insert on public.feedback to anon, authenticated;
grant select, delete on public.feedback to authenticated;

-- Call server / bill please. One open request per table and kind.
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  table_label text not null check (char_length(table_label) between 1 and 10),
  kind text not null check (kind in ('server','bill')),
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now(),
  done_at timestamptz
);
create index service_requests_venue_idx on public.service_requests(venue_id, status, created_at desc);
create unique index service_requests_one_open on public.service_requests(venue_id, table_label, kind) where status = 'open';
alter table public.service_requests enable row level security;

-- Guests may only create requests, only for live venues that switched the button on.
create or replace function private.venue_service_on(vid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.venues v where v.id = vid and v.published and coalesce((v.modules->>'service')::boolean, false))
$$;
grant execute on function private.venue_service_on(uuid) to anon, authenticated;

create policy "guests call staff" on public.service_requests
  for insert to anon, authenticated with check (status = 'open' and done_at is null and (select private.venue_service_on(venue_id)));
create policy "members see requests" on public.service_requests
  for select to authenticated using ((select private.is_venue_member(venue_id)));
create policy "members update requests" on public.service_requests
  for update to authenticated using ((select private.is_venue_member(venue_id))) with check ((select private.is_venue_member(venue_id)));
grant insert on public.service_requests to anon, authenticated;
grant select, update on public.service_requests to authenticated;

-- Live updates for the staff screen.
alter publication supabase_realtime add table public.service_requests;

-- Feedback summary for the stats tab.
create or replace function public.venue_feedback(p_venue uuid, p_from timestamptz, p_to timestamptz)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with f as (select * from public.feedback where venue_id = p_venue and created_at >= p_from and created_at < p_to)
  select jsonb_build_object(
    'count', (select count(*) from f),
    'average', (select round(avg(rating)::numeric, 2) from f),
    'by_rating', (select coalesce(jsonb_object_agg(rating, n), '{}') from (select rating, count(*) n from f group by rating) x),
    'recent', (select coalesce(jsonb_agg(x order by x.created_at desc), '[]') from (
        select id, rating, comment, table_label, created_at from f where comment <> '' order by created_at desc limit 50) x),
    'service', (select jsonb_build_object(
        'server', count(*) filter (where kind = 'server'),
        'bill', count(*) filter (where kind = 'bill'),
        'avg_response_secs', round(avg(extract(epoch from (done_at - created_at))) filter (where done_at is not null)))
      from public.service_requests where venue_id = p_venue and created_at >= p_from and created_at < p_to)
  )
$$;
revoke execute on function public.venue_feedback(uuid, timestamptz, timestamptz) from public, anon;
grant execute on function public.venue_feedback(uuid, timestamptz, timestamptz) to authenticated;

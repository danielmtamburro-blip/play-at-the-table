-- Game leaderboards per venue: today's (Dubai day) and all-time top 10. Nicknames only, no accounts.
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  game text not null check (game ~ '^[a-z]{2,20}$'),
  nickname text not null check (char_length(nickname) between 2 and 16),
  score integer not null,
  table_label text check (char_length(table_label) <= 10),
  day date not null default ((now() at time zone 'Asia/Dubai')::date),
  created_at timestamptz not null default now()
);
create index scores_board_idx on public.scores(venue_id, game, day, score);
alter table public.scores enable row level security;
-- No direct access for guests: they read and write through the functions below.
create policy "members read scores" on public.scores for select to authenticated using ((select private.is_venue_member(venue_id)));
create policy "members delete scores" on public.scores for delete to authenticated using ((select private.is_venue_member(venue_id)));
grant select, delete on public.scores to authenticated;

-- Which games keep a board, whether lower is better, and the believable score range.
create table private.score_rules (game text primary key, lower_better boolean not null, min_score int not null, max_score int not null);
insert into private.score_rules values
  ('bubbles', false, 1, 400), ('penalty', false, 1, 5), ('racer', false, 10, 100000), ('keepy', false, 1, 2000),
  ('reaction', true, 80, 2000), ('maths', false, 1, 200), ('memory', true, 8, 200), ('oddone', false, 1, 8),
  ('count', false, 1, 6), ('sudoku', true, 30, 36000), ('wordguess', true, 1, 6), ('hilo', false, 1, 52),
  ('pour', false, 1, 100);

-- Nickname check (replaced by later migrations with a smarter filter).
create or replace function private.nickname_ok(n text) returns boolean language sql immutable set search_path = '' as $$
  select n ~ '^[[:alnum:] _.''!-]{2,16}$'
$$;

create or replace function public.submit_score(p_venue uuid, p_game text, p_nickname text, p_score int, p_table text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r private.score_rules; d date := (now() at time zone 'Asia/Dubai')::date; n text := btrim(p_nickname);
  today_rank int; all_rank int;
begin
  if not private.venue_is_public(p_venue) then raise exception 'venue not available'; end if;
  select * into r from private.score_rules where game = p_game;
  if r is null then raise exception 'no leaderboard for this game'; end if;
  if p_score < r.min_score or p_score > r.max_score then raise exception 'score out of range'; end if;
  if not private.nickname_ok(n) then raise exception 'nickname not allowed'; end if;
  -- simple flood guard: max 30 entries per venue+game per minute
  if (select count(*) from public.scores where venue_id = p_venue and game = p_game and created_at > now() - interval '1 minute') >= 30 then
    raise exception 'too many scores, try again shortly'; end if;
  insert into public.scores (venue_id, game, nickname, score, table_label, day) values (p_venue, p_game, n, p_score, left(p_table, 10), d);
  select count(*) + 1 into today_rank from public.scores s where s.venue_id = p_venue and s.game = p_game and s.day = d
    and (case when r.lower_better then s.score < p_score else s.score > p_score end);
  select count(*) + 1 into all_rank from public.scores s where s.venue_id = p_venue and s.game = p_game
    and (case when r.lower_better then s.score < p_score else s.score > p_score end);
  return jsonb_build_object('today_rank', today_rank, 'all_rank', all_rank);
end $$;

-- Today's and all-time top 10 for one game (nickname, score, table only).
create or replace function public.leaderboard(p_venue uuid, p_game text)
returns jsonb language sql stable security definer set search_path = '' as $$
  with r as (select * from private.score_rules where game = p_game),
  base as (select s.* from public.scores s, r where s.venue_id = p_venue and s.game = p_game and private.venue_is_public(p_venue))
  select jsonb_build_object(
    'lower_better', (select lower_better from r),
    'today', coalesce((select jsonb_agg(x) from (select nickname, score, table_label from base
        where day = (now() at time zone 'Asia/Dubai')::date
        order by case when (select lower_better from r) then score end asc, case when not (select lower_better from r) then score end desc, created_at
        limit 10) x), '[]'),
    'all_time', coalesce((select jsonb_agg(x) from (select nickname, score, table_label, day from base
        order by case when (select lower_better from r) then score end asc, case when not (select lower_better from r) then score end desc, created_at
        limit 10) x), '[]')
  )
$$;

-- The 10th-best scores, so the phone knows whether a result makes a board before asking for a name.
create or replace function public.leaderboard_cutoff(p_venue uuid, p_game text)
returns jsonb language sql stable security definer set search_path = '' as $$
  with r as (select * from private.score_rules where game = p_game),
  t as (select score from public.scores where venue_id = p_venue and game = p_game and day = (now() at time zone 'Asia/Dubai')::date),
  a as (select score from public.scores where venue_id = p_venue and game = p_game)
  select jsonb_build_object(
    'lower_better', (select lower_better from r),
    'today_count', (select count(*) from t), 'all_count', (select count(*) from a),
    'today_10th', (select score from t order by case when (select lower_better from r) then score end asc, case when not (select lower_better from r) then score end desc offset 9 limit 1),
    'all_10th', (select score from a order by case when (select lower_better from r) then score end asc, case when not (select lower_better from r) then score end desc offset 9 limit 1))
  where private.venue_is_public(p_venue)
$$;

-- The busiest board today, for the Play tab teaser.
create or replace function public.leaderboard_hot(p_venue uuid)
returns text language sql stable security definer set search_path = '' as $$
  select game from public.scores where venue_id = p_venue and day = (now() at time zone 'Asia/Dubai')::date and private.venue_is_public(p_venue)
  group by game order by count(*) desc limit 1
$$;

grant execute on function private.nickname_ok(text) to anon, authenticated;
revoke execute on function public.submit_score(uuid, text, text, int, text) from public;
revoke execute on function public.leaderboard(uuid, text) from public;
revoke execute on function public.leaderboard_cutoff(uuid, text) from public;
revoke execute on function public.leaderboard_hot(uuid) from public;
grant execute on function public.submit_score(uuid, text, text, int, text) to anon, authenticated;
grant execute on function public.leaderboard(uuid, text) to anon, authenticated;
grant execute on function public.leaderboard_cutoff(uuid, text) to anon, authenticated;
grant execute on function public.leaderboard_hot(uuid) to anon, authenticated;

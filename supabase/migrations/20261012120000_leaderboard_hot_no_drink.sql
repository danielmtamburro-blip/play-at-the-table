-- The Play tab's featured board never picks a drinking game.
create or replace function public.leaderboard_hot(p_venue uuid)
returns text language sql stable security definer set search_path = '' as $$
  select game from public.scores where venue_id = p_venue and day = (now() at time zone 'Asia/Dubai')::date
    and game not in ('pour', 'hilo') and private.venue_is_public(p_venue)
  group by game order by count(*) desc limit 1
$$;

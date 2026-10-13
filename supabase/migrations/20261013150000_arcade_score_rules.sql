-- Leaderboards for the new canvas games.
insert into private.score_rules (game, lower_better, min_score, max_score) values
  ('runner', false, 1, 200000),
  ('bike', false, 1, 200000),
  ('freekick', false, 1, 30)
on conflict (game) do nothing;

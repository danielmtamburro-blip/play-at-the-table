-- Leaderboards for Fruit Slash, Sky Tower, Falcon Flight and Hoop Shot.
insert into private.score_rules (game, lower_better, min_score, max_score) values
  ('slice', false, 1, 100000),
  ('stack', false, 1, 5000),
  ('falcon', false, 1, 5000),
  ('hoops', false, 1, 500)
on conflict (game) do nothing;

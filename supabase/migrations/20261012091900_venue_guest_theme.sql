-- How the guest page looks for this venue: colours, background picture, tile style.
alter table public.venues add column theme jsonb not null default '{}'::jsonb;

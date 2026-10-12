-- Keep RLS helper functions out of the public API (Supabase security advisor 0028/0029).
-- Policies reference functions by OID, so they keep working after the move.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_venue_member(uuid) set schema private;
alter function public.venue_is_public(uuid) set schema private;

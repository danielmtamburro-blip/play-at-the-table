-- Clear swear words are blocked anywhere in a nickname (after reading letter swaps like 1→i, 3→e, @→a);
-- words that hide inside normal names (Essex, Arsenal, Grape, Peacock, Skillz) are only blocked as whole words.
create or replace function private.nickname_ok(n text) returns boolean language sql immutable set search_path = '' as $$
  with norm as (select translate(lower(n), '013457@$!', 'oieastasi') as t)
  select n ~ '^[[:alnum:] _.''!-]{2,16}$'
    and not exists (
      select 1 from norm, unnest(array['fuck','shit','bitch','cunt','pussy','slut','whore','nigg','porn','wank','twat','nazi','penis','vagina','bastard','motherf'])
        as w where regexp_replace(norm.t, '[^a-z]', '', 'g') like '%' || w || '%')
    and not exists (
      select 1 from norm, regexp_split_to_table(norm.t, '[^a-z]+') as word
      where word = any (array['sex','sexy','kill','arse','ass','cock','dick','rape','fag','tits','boobs','hoe','piss','crap']))
$$;

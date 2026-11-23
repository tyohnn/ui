-- Local only. `supabase start` and `supabase db reset` run this after the migrations.
--
-- The migrations create the site's role by name and grant it what it may touch. Connecting needs LOGIN, BYPASSRLS
-- and a password, which a migration must not carry, so the local stack gets them here. The password is the local
-- stack's, as public as `postgres:postgres`.
--
-- ⚠ The contract tests connect as this role too. Run as the owner, they would pass where the role lacks a GRANT and
--   the deployment would fail instead.

alter role site_app login password 'postgres';
alter role site_app bypassrls;

-- The role the site connects as. The hosted MCP (`apps/site`, route `/api/mcp`) is the only thing that talks to the
-- database, so there is one role, `site_app`. A second app that connects gets its own role; a role belongs to the
-- process that connects, not to a schema, so a leaked connection string reaches only what that app was granted.
--
-- This file only creates the name. LOGIN, BYPASSRLS and the password are not set here: a password in a migration is
-- committed and kept in `schema_migrations.statements`. Locally `supabase/seed.sql` sets them; on a remote project
-- they are set once by hand (supabase/README.md).
--
-- Roles are cluster-wide and survive `db reset`, so the guard keeps a second reset from failing.
--
-- The schema migrations that follow carry the role's GRANTs.

do $$
begin
    if not exists (select 1 from pg_roles where rolname = 'site_app') then
        create role site_app;
    end if;
end
$$;

comment on role site_app is
    'The site''s database role (the hosted MCP). LOGIN, BYPASSRLS and the password are granted outside migrations';

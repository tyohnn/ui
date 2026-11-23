-- systems: design systems people shape and publish through tyohnn's MCP.
--
-- Two tables, both written only by the hosted MCP (`apps/site`, route `/api/mcp`) through the role `site_app`:
--
-- - `systems.published` holds a system someone published: its name, its concept, the base it was shaped from and its
--   changes over that base. The CSS is not stored; export rebuilds it from the base, so a published system keeps working
--   when the base gains a component. Ported from the folder store (`packages/mcp/src/store.ts`), one row per JSON file.
-- - `systems.session` holds what one MCP connection is shaping between its requests. A serverless function keeps
--   nothing between requests, and a request can land on another instance, so the system being shaped lives here
--   under the session id the server handed out on `initialize`.
--
-- ⚠ The rules (which names may be published, whether a name may be published over) live in `packages/mcp`
--   (`publishVerdict`), not here. The checks below mirror them only as a backstop for a write that skipped the code.
-- ⚠ Nothing is exposed through the Data API: `systems` is not in `config.toml`'s `[api] schemas`, and the site connects
--   with `pg` directly.

create schema systems;

comment on schema systems is 'Design systems shaped and published through tyohnn''s MCP';

create table systems.published (
    id           text        not null,
    draft        jsonb       not null,
    state        jsonb       not null,
    published_at timestamptz not null,
    constraint published_pkey primary key (id),
    -- ⚠ the same pattern as NAME in packages/mcp/src/store.ts
    constraint published_id_check check (id ~ '^[a-z][a-z0-9-]{1,39}$'),
    -- a system is published under its own name
    constraint published_name_check check (draft ->> 'name' = id),
    -- a published system is a few kilobytes; these stop a runaway write, they are not a quota
    constraint published_draft_size_check check (octet_length(draft::text) <= 16384),
    constraint published_state_size_check check (octet_length(state::text) <= 65536)
);

comment on table systems.published is 'One row per published system, under its name. Names are unique and never deleted';
comment on column systems.published.draft is 'The Draft: { name, concept }';
comment on column systems.published.state is 'The SystemState: the base system and the colour and token changes over it';

-- search_systems lists the newest first
create index published_published_at_idx on systems.published (published_at desc);

create table systems.session (
    id         text        not null,
    state      jsonb       not null,
    draft      jsonb,
    expires_at timestamptz not null,
    constraint session_pkey primary key (id),
    constraint session_id_check check (char_length(id) between 1 and 128),
    constraint session_draft_size_check check (draft is null or octet_length(draft::text) <= 16384),
    constraint session_state_size_check check (octet_length(state::text) <= 65536)
);

comment on table systems.session is 'What one MCP connection is shaping, under the id it got on initialize. Gone after expires_at';
comment on column systems.session.expires_at is 'Pushed forward on every save; a row past it reads as absent and is swept by the next save';

-- the sweep deletes rows past expires_at
create index session_expires_at_idx on systems.session (expires_at);

alter table systems.published enable row level security;
alter table systems.session enable row level security;

create policy deny_all on systems.published as permissive for all to public using (false) with check (false);
create policy deny_all on systems.session as permissive for all to public using (false) with check (false);

grant usage on schema systems to service_role;
grant all on all tables in schema systems to service_role;

-- The site reads and publishes systems and may publish over one (only a local server lets a person ask for that, and
-- the hosted one refuses it in code). It cannot rename or delete a published system.
grant usage on schema systems to site_app;
grant select, insert on systems.published to site_app;
grant update (draft, state, published_at) on systems.published to site_app;

-- Sessions come and go: the site creates, saves, ends and sweeps them.
grant select, insert, delete on systems.session to site_app;
grant update (state, draft, expires_at) on systems.session to site_app;

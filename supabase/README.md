# The database

The hosted MCP (`apps/site`, route `/api/mcp`) keeps two things in Postgres: systems people publish, and the system
each MCP connection is shaping between its requests. Nothing else in the repository uses a database; the CLI, the
registry and the stdio server never connect.

The way it is set up follows tyohnn/scaffold's:

- **Migrations are written by hand** in `supabase/migrations/`, with their intent in comments. `db pull` and `db diff` do
  not write them, and there is no `supabase/schemas/`. A migration applied anywhere is never edited: a change is a new file.
- **A schema per domain.** `systems` holds `published` and `session`. A new domain gets a new schema, named for what it
  is about, not for the app that reads it.
- **One role per connecting app.** The site connects as `site_app`. It has `bypassrls`, every table has RLS on with a
  `deny_all` policy, so the GRANTs in the migration are the only boundary. The migration creates the role by name only;
  LOGIN, BYPASSRLS and the password are set outside migrations (`seed.sql` locally, by hand on a remote project).
- **The app connects with `pg`**, not through the Data API, and `systems` is not in `config.toml`'s exposed schemas.
- **Ports and adapters, in Effect.** The ports are `Context.Service`s in `packages/mcp` (`SystemStore` in `store.ts`,
  `SessionStore` in `sessions.ts`), one method per operation, each returning an Effect that fails with a tagged error
  (`SystemStoreError`, `SessionStoreError`). The rules are pure functions next to them (`publishVerdict`). Adapters are
  Layers: `systemStoreFolder`, `systemStoreClosed` and `sessionStoreMemory` there, `systemStorePostgres` and
  `sessionStorePostgres` in `packages/adapters-postgres`. The HTTP handler builds one Layer into a runtime that every
  request runs on. One contract (`packages/mcp/src/testing/contracts.ts`, `@effect/vitest`) runs against the folder
  store, memory sessions and Postgres alike.

## Local

```
npx supabase start -x gotrue,realtime,storage-api,imgproxy,kong,mailpit,postgrest,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
npm test -w @tyohnn/adapters-postgres
npx supabase stop
```

`start` applies the migrations and `seed.sql`. `npx supabase db reset` replays them from an empty database; never add
`--linked`, which resets the remote one. The stack uses the 5482x ports (DB on 54822). The adapter tests connect as
`site_app` and fail, rather than skip, when the stack is not running.

To run the site against it:

```
SITE_DATABASE_URL=postgresql://site_app:postgres@127.0.0.1:54822/postgres npm run serve -w @tyohnn/site
```

Without `SITE_DATABASE_URL` the route refuses to publish and keeps sessions in the function's memory.

## A remote project

Not set up yet. Each step writes to the remote database or the deployment, so each waits for a person's go-ahead.

1. Create the Supabase project and check that `[db] major_version` in `config.toml` matches it.
2. `npx supabase link --project-ref <ref>`, then `npx supabase db push --dry-run` and, when it lists only the files
   expected, `npx supabase db push`.
3. Give the role a login, once, in the SQL editor (never in a migration):

   ```sql
   alter role site_app login password '<generated>';
   alter role site_app bypassrls;
   alter role site_app set statement_timeout = '5s';
   ```
4. Set `SITE_DATABASE_URL` on the Vercel project to the transaction pooler (port 6543) as `site_app`, with
   `?uselibpqcompat=true&sslmode=require`. A remote URL without `sslmode` refuses to start
   (`packages/adapters-postgres/src/connection.ts`).

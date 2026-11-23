import "server-only";

import { NAME, type PublishedSystem, SystemStore, SystemStoreError } from "@tyohnn/mcp/store";
import { Effect, Layer } from "effect";

import type { SqlExecutor } from "../connection";

/**
 * The SystemStore port on `systems.published` (supabase/migrations/…_create_systems_schema.sql).
 *
 * - `add` is one statement: `on conflict do nothing` keeps the first of two concurrent publishes under one name, where
 *   reading first and then inserting would let the second overwrite it. No row back means the name was taken.
 * - `put` publishes over a system in one statement too. The id never changes; `site_app` may not update it.
 * - An id that is not a name never reaches the database, the same answer the folder store gives.
 * - A query that fails comes back as SystemStoreError; the MCP tools answer it as a refusal.
 */

interface PublishedRow
{
    id: string;
    draft: PublishedSystem["draft"];
    state: PublishedSystem["state"];
    published_at: Date;
}

const COLUMNS = "id, draft, state, published_at";

const LIST = `select ${COLUMNS} from systems.published order by published_at desc, id`;

const GET = `select ${COLUMNS} from systems.published where id = $1`;

const ADD = `
    insert into systems.published (id, draft, state, published_at)
    values ($1, $2::jsonb, $3::jsonb, $4::timestamptz)
    on conflict (id) do nothing
    returning id
`;

const PUT = `
    insert into systems.published (id, draft, state, published_at)
    values ($1, $2::jsonb, $3::jsonb, $4::timestamptz)
    on conflict (id) do update
       set draft = excluded.draft,
           state = excluded.state,
           published_at = excluded.published_at
`;

const systemOf = (row: PublishedRow): PublishedSystem => ({
    id: row.id,
    draft: row.draft,
    state: row.state,
    publishedAt: row.published_at.toISOString(),
});

const valuesOf = (system: PublishedSystem) => [system.id, JSON.stringify(system.draft), JSON.stringify(system.state), system.publishedAt];

const query = <A>(operation: string, run: () => Promise<A>) =>
    Effect.tryPromise({ try: run, catch: (cause) => new SystemStoreError({ message: `${operation}: ${String(cause)}` }) });

export const systemStorePostgres = (sql: SqlExecutor): Layer.Layer<SystemStore> =>
    Layer.succeed(SystemStore, SystemStore.of({
        list: () => query("listing published systems", () => sql.query<PublishedRow>(LIST)).pipe(
            Effect.map((result) => result.rows.map(systemOf)),
        ),
        get: (id) => (NAME.test(id)
            ? query(`reading ${id}`, () => sql.query<PublishedRow>(GET, [id])).pipe(
                Effect.map((result) => (result.rows[0] ? systemOf(result.rows[0]) : undefined)),
            )
            : Effect.succeed(undefined)),
        add: (system) => query(`publishing ${system.id}`, () => sql.query(ADD, valuesOf(system))).pipe(
            Effect.map((result) => (result.rowCount === 1 ? "added" as const : "taken" as const)),
        ),
        put: (system) => query(`publishing ${system.id}`, () => sql.query(PUT, valuesOf(system))).pipe(Effect.asVoid),
    }));

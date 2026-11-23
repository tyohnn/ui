import "server-only";

import { NAME, type PublishedSystem, type SystemStore } from "@tyohnn/mcp/store";

import type { SqlExecutor } from "../connection";

/**
 * The SystemStore port on `systems.published` (supabase/migrations/…_create_systems_schema.sql).
 *
 * - `add` is one statement: `on conflict do nothing` keeps the first of two concurrent publishes under one name, where
 *   reading first and then inserting would let the second overwrite it. No row back means the name was taken.
 * - `put` publishes over a system in one statement too. The id never changes; `site_app` may not update it.
 * - An id that is not a name never reaches the database, the same answer the folder store gives.
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

export const systemStorePostgres = (sql: SqlExecutor): SystemStore => ({
    async list()
    {
        return (await sql.query<PublishedRow>(LIST)).rows.map(systemOf);
    },
    async get(id)
    {
        if (!NAME.test(id)) return undefined;

        const row = (await sql.query<PublishedRow>(GET, [id])).rows[0];

        return row ? systemOf(row) : undefined;
    },
    async add(system)
    {
        return (await sql.query(ADD, valuesOf(system))).rowCount === 1 ? "added" : "taken";
    },
    async put(system)
    {
        await sql.query(PUT, valuesOf(system));
    },
});

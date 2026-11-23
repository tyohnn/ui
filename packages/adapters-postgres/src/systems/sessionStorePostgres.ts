import "server-only";

import { SESSION_TTL_MS, type Session, SessionStore, SessionStoreError } from "@tyohnn/mcp/sessions";
import { Effect, Layer } from "effect";

import type { SqlExecutor } from "../connection";

/**
 * The SessionStore port on `systems.session` (supabase/migrations/…_create_systems_schema.sql).
 *
 * - Time is the database's: `expires_at` is `now()` plus the time to live, and a row past it reads as absent, so two
 *   function instances with drifting clocks agree on whether a session is alive.
 * - Expired rows are swept by the next save, in the same statement. The sweep skips the id being saved: a statement
 *   that deletes a row and upserts it at once fails in Postgres.
 * - A query that fails comes back as SessionStoreError; the HTTP handler answers it with 503.
 */

interface SessionRow
{
    state: Session["state"];
    draft: Session["draft"] | null;
}

const GET = `select state, draft from systems.session where id = $1 and expires_at > now()`;

const SET = `
    with swept as (
        delete from systems.session where expires_at <= now() and id <> $1
    )
    insert into systems.session (id, state, draft, expires_at)
    values ($1, $2::jsonb, $3::jsonb, now() + make_interval(secs => $4::double precision))
    on conflict (id) do update
       set state = excluded.state,
           draft = excluded.draft,
           expires_at = excluded.expires_at
`;

const DELETE = `delete from systems.session where id = $1`;

const query = <A>(operation: string, run: () => Promise<A>) =>
    Effect.tryPromise({ try: run, catch: (cause) => new SessionStoreError({ message: `${operation}: ${String(cause)}` }) });

const sessionOf = (row: SessionRow): Session => (row.draft === null ? { state: row.state } : { state: row.state, draft: row.draft });

export const sessionStorePostgres = (sql: SqlExecutor, ttlMs = SESSION_TTL_MS): Layer.Layer<SessionStore> =>
    Layer.succeed(SessionStore, SessionStore.of({
        get: (id) => query("reading a session", () => sql.query<SessionRow>(GET, [id])).pipe(
            Effect.map((result) => (result.rows[0] ? sessionOf(result.rows[0]) : undefined)),
        ),
        set: (id, session) => query("saving a session", () => sql.query(SET, [id, JSON.stringify(session.state), session.draft ? JSON.stringify(session.draft) : null, ttlMs / 1000])).pipe(
            Effect.asVoid,
        ),
        delete: (id) => query("ending a session", () => sql.query(DELETE, [id])).pipe(Effect.asVoid),
    }));

// This import is the gate: a module that handles a connection string must fail the build if it leaks into a client bundle.
import "server-only";

import { Pool, type QueryResult, type QueryResultRow } from "pg";

/**
 * The site's Postgres connection: the one place that knows how to reach the database. The store adapters under
 * src/<domain>/ take a SqlExecutor and know nothing about pools or TLS.
 *
 * The site talks SQL directly instead of going through the Data API (PostgREST): `systems` stays off the HTTP
 * surface entirely, and the adapters write their statements next to the port they implement.
 *
 * ## Serverless
 *
 * The site runs as Vercel functions, which freeze between requests instead of disconnecting.
 *
 * - Use the pooler in transaction mode (port 6543). Session mode (5432) holds a Postgres connection until the client
 *   disconnects, and a frozen instance never does, so every frozen instance would hold one. A non-local 5432 logs a warning.
 * - Never give a query a `name`. pg's default is the unnamed statement, which survives transaction pooling; a named
 *   prepared statement fails with "prepared statement does not exist" once the backend connection changes. For the
 *   same reason there is no session-level `set`, `listen` or advisory lock on this path.
 * - Startup parameters such as `statement_timeout` or `application_name` do not reach the backend through a
 *   transaction-mode pooler, and the connection still succeeds, so they are not set here. A limit belongs on the role
 *   (`alter role site_app set statement_timeout = …`).
 * - One pool per connection string, kept on globalThis: warm instances reuse it, and Next's dev HMR, which re-evaluates
 *   modules, does not open a new one each time.
 */

/** Connections one instance opens. The real load is instances × max, and the pooler multiplexes behind it */
const POOL_MAX = 3;

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

export const isLocalHost = (hostname: string): boolean => LOCAL_HOSTS.has(hostname);

/**
 * Checks and normalises a connection string's TLS and port.
 *
 * - Supabase's pooler accepts plaintext connections, so a missing `sslmode`, or `disable`, would send credentials and
 *   rows in the clear: that refuses to start instead.
 * - pg 8.22+ reads `sslmode=require` as `verify-full`, and the pooler's chain does not verify against Node's trust
 *   store. `uselibpqcompat=true` gives libpq's meaning (encrypted, chain not verified), so it is added when missing.
 *   That stops eavesdropping, not a man in the middle; pinning the CA can come later.
 */
export const normalizeConnectionString = (raw: string): string =>
{
    let url: URL;

    try
    {
        url = new URL(raw);
    }
    catch
    {
        throw new Error("The connection string is not a URL (expected postgresql://…)");
    }

    if (isLocalHost(url.hostname)) return url.toString();

    const sslmode = url.searchParams.get("sslmode");

    if (sslmode === null || sslmode === "" || sslmode === "disable")
    {
        throw new Error("The connection string has no sslmode, or sslmode=disable. Supabase's pooler accepts plaintext, so set it (?uselibpqcompat=true&sslmode=require).");
    }

    if (sslmode === "require" && url.searchParams.get("uselibpqcompat") !== "true")
    {
        url.searchParams.set("uselibpqcompat", "true");
        console.warn("[db] added uselibpqcompat=true: pg reads sslmode=require as verify-full, which fails against Supabase's pooler");
    }

    if (url.port === "5432")
    {
        console.warn("[db] the connection string points at 5432 (session mode): frozen serverless instances each hold a connection there. Use the transaction-mode port, 6543.");
    }

    return url.toString();
};

interface PoolCache
{
    __tyohnnPostgresPools?: Map<string, Pool>;
}

const pools = (): Map<string, Pool> =>
{
    const store = globalThis as typeof globalThis & PoolCache;

    store.__tyohnnPostgresPools ??= new Map<string, Pool>();

    return store.__tyohnnPostgresPools;
};

export const postgresPool = (rawConnectionString: string): Pool =>
{
    const connectionString = normalizeConnectionString(rawConnectionString);
    const existing = pools().get(connectionString);

    if (existing) return existing;

    const created = new Pool({
        connectionString,
        max: POOL_MAX,
        // Long enough for a warm instance to reuse a connection (reconnecting is a TLS handshake), short enough to let go
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
        // An idle connection must not keep the event loop, and so the function, alive
        allowExitOnIdle: true,
        keepAlive: true,
    });

    // An error on an idle connection kills the process unless something listens for it
    created.on("error", (error) =>
    {
        console.error("[db] idle connection error", error);
    });

    pools().set(connectionString, created);

    return created;
};

/** What the adapters run SQL through. Every value goes in as a `$n` parameter, never into the statement text */
export interface SqlExecutor
{
    query<R extends QueryResultRow>(sql: string, params?: ReadonlyArray<unknown>): Promise<QueryResult<R>>;
}

export const poolExecutor = (pool: Pool): SqlExecutor => ({
    query: (sql, params = []) => pool.query(sql, [...params]),
});

/** For tests and shutdown. A serverless request never calls it: the pool is there to be reused */
export const closePostgresPools = async (): Promise<void> =>
{
    const open = [...pools().values()];

    pools().clear();

    await Promise.all(open.map((pool) => pool.end()));
};

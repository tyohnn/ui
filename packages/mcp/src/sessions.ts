import type { Session } from "./server";

export type { Session };

/**
 * Where the HTTP server keeps what each connection is shaping between its requests (http.ts). A session is saved
 * after every request and lasts a while after its last save; one not saved for that long reads as absent, and the
 * client starts a new one.
 *
 * Adapters: memorySessions below (one process; the hosted server without a database) and Postgres
 * (`@tyohnn/adapters-postgres`). One contract (`testing/contracts.ts`) runs against both.
 */
export interface SessionStore
{
    /** The session saved under `id`, or undefined when there is none or it has expired */
    get(id: string): Promise<Session | undefined>;
    /** Saves the session under `id`, replacing what was there, and starts its time to live again */
    set(id: string, session: Session): Promise<void>;
    /** Ends the session; nothing happens for an id there is no session for */
    delete(id: string): Promise<void>;
}

/** An hour after the last save */
export const SESSION_TTL_MS = 60 * 60 * 1000;

/** Sessions in the process's memory */
export const memorySessions = (ttlMs = SESSION_TTL_MS, now: () => number = Date.now): SessionStore =>
{
    const entries = new Map<string, { session: Session; expires: number }>();
    const sweep = () =>
    {
        for (const [id, entry] of entries) if (entry.expires <= now()) entries.delete(id);
    };

    return {
        async get(id)
        {
            sweep();

            return structuredClone(entries.get(id)?.session);
        },
        async set(id, session)
        {
            sweep();
            entries.set(id, { session: structuredClone(session), expires: now() + ttlMs });
        },
        async delete(id)
        {
            entries.delete(id);
        },
    };
};

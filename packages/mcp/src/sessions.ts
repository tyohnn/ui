import { Clock, Context, Effect, Layer, Ref, Schema } from "effect";

import type { Session } from "./server";

export type { Session };

/**
 * Where the HTTP server keeps what each connection is shaping between its requests (http.ts). A session is saved
 * after every request and lasts a while after its last save; one not saved for that long reads as absent, and the
 * client starts a new one.
 *
 * Adapters are Layers: sessionStoreMemory below (one process; the hosted server without a database) and Postgres
 * (`@tyohnn/adapters-postgres`). One contract (`testing/contracts.ts`) runs against both.
 */

/** The session store could not be read or written */
export class SessionStoreError extends Schema.TaggedError<SessionStoreError>()("SessionStoreError", { message: Schema.String })
{}

export class SessionStore extends Context.Service<SessionStore, {
    /** The session saved under `id`, or undefined when there is none or it has expired */
    readonly get: (id: string) => Effect.Effect<Session | undefined, SessionStoreError>;
    /** Saves the session under `id`, replacing what was there, and starts its time to live again */
    readonly set: (id: string, session: Session) => Effect.Effect<void, SessionStoreError>;
    /** Ends the session; nothing happens for an id there is no session for */
    readonly delete: (id: string) => Effect.Effect<void, SessionStoreError>;
}>()("@tyohnn/mcp/SessionStore")
{}

/** An hour after the last save */
export const SESSION_TTL_MS = 60 * 60 * 1000;

interface Entry
{
    session: Session;
    expires: number;
}

const unexpired = (entries: ReadonlyMap<string, Entry>, now: number) => new Map([...entries].filter(([, entry]) => entry.expires > now));

/**
 * Sessions in the process's memory, timed by the Effect clock. A runtime builds the Layer once, so every request it
 * runs shares one map; providing the Layer again starts an empty one.
 */
export const sessionStoreMemory = (ttlMs = SESSION_TTL_MS): Layer.Layer<SessionStore> =>
    Layer.effect(SessionStore, Effect.gen(function*()
    {
        const entries = yield* Ref.make<ReadonlyMap<string, Entry>>(new Map());

        return SessionStore.of({
            get: (id) => Effect.gen(function*()
            {
                const now = yield* Clock.currentTimeMillis;
                const alive = yield* Ref.updateAndGet(entries, (all) => unexpired(all, now));

                return structuredClone(alive.get(id)?.session);
            }),
            set: (id, session) => Effect.gen(function*()
            {
                const now = yield* Clock.currentTimeMillis;

                yield* Ref.update(entries, (all) => new Map([...unexpired(all, now), [id, { session: structuredClone(session), expires: now + ttlMs }]]));
            }),
            delete: (id) => Ref.update(entries, (all) => new Map([...all].filter(([key]) => key !== id))),
        });
    }));

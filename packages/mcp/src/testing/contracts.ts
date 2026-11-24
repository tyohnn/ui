import { describe, expect, it } from "@effect/vitest";
import { Effect, type Layer } from "effect";

import type { Session } from "../server";
import { SessionStore } from "../sessions";
import { type PublishedSystem, SystemStore } from "../store";
import type { SystemState } from "../system";

/**
 * The contracts the store ports promise. Every adapter runs the same code: the folder store and memory sessions here
 * (test/contracts.test.ts), Postgres in @tyohnn/adapters-postgres.
 *
 * `make` hands over a fresh Layer for each test. A Postgres store is one shared database, so the contracts never
 * assume an empty store: they only look at the ids they wrote. Published ids are the fixed CONTRACT_IDS, which the
 * Postgres side clears in `make`; session ids are new random UUIDs every time and expire on their own.
 *
 * Tests that wait out a time to live run on the live clock (`it.live`), since the Postgres store keeps the database's time.
 */

const state = (accent: string | null = null): SystemState => ({
    system: "clover",
    mode: "light",
    palette: "clover",
    accent,
    chart: null,
    colours: { light: { "chart-1": "#f43f5e" }, dark: {} },
    tokens: { "--control-radius": "4px" },
});

/** The published ids the contract writes; a shared store clears them before each test */
export const CONTRACT_IDS = ["contract-first", "contract-second", "contract-third"] as const;

const published = (id: (typeof CONTRACT_IDS)[number], concept: string, publishedAt: string): PublishedSystem => ({
    id,
    draft: { name: id, concept },
    state: state("violet"),
    publishedAt,
});

export type MakeSystemStore = () => Effect.Effect<Layer.Layer<SystemStore>>;
export type MakeSessionStore = (ttlMs: number) => Effect.Effect<Layer.Layer<SessionStore>>;

export const systemStoreContract = (name: string, make: MakeSystemStore): void =>
{
    const within = <A, E>(program: Effect.Effect<A, E, SystemStore>) => Effect.flatMap(make(), (layer) => Effect.provide(program, layer));

    describe(`the published-system store (${name})`, () =>
    {
        it.effect("keeps a system under its id with its concept, its base and its changes", () =>
            within(Effect.gen(function*()
            {
                const store = yield* SystemStore;
                const system = published("contract-first", "Glass over moss.", "2026-11-01T00:00:00.000Z");

                expect(yield* store.add(system)).toBe("added");
                expect(yield* store.get("contract-first")).toEqual(system);
            })));

        it.effect("refuses to add under an id already taken and leaves the first system as it was", () =>
            within(Effect.gen(function*()
            {
                const store = yield* SystemStore;
                const first = published("contract-first", "first", "2026-11-01T00:00:00.000Z");

                yield* store.add(first);

                expect(yield* store.add(published("contract-first", "second", "2026-11-02T00:00:00.000Z"))).toBe("taken");
                expect(yield* store.get("contract-first")).toEqual(first);
            })));

        it.effect("publishes over a system with put, and keeps a new one with put too", () =>
            within(Effect.gen(function*()
            {
                const store = yield* SystemStore;
                const second = published("contract-first", "second", "2026-11-02T00:00:00.000Z");
                const fresh = published("contract-second", "fresh", "2026-11-03T00:00:00.000Z");

                yield* store.add(published("contract-first", "first", "2026-11-01T00:00:00.000Z"));
                yield* store.put(second);
                yield* store.put(fresh);

                expect(yield* store.get("contract-first")).toEqual(second);
                expect(yield* store.get("contract-second")).toEqual(fresh);
            })));

        it.effect("lists the newest first", () =>
            within(Effect.gen(function*()
            {
                const store = yield* SystemStore;

                yield* store.add(published("contract-second", "b", "2026-11-02T00:00:00.000Z"));
                yield* store.add(published("contract-third", "c", "2026-11-03T00:00:00.000Z"));
                yield* store.add(published("contract-first", "a", "2026-11-01T00:00:00.000Z"));

                const ids = (yield* store.list()).map((entry) => entry.id).filter((id) => (CONTRACT_IDS as readonly string[]).includes(id));

                expect(ids).toEqual(["contract-third", "contract-second", "contract-first"]);
            })));

        it.effect("answers nothing for an id it does not hold, including one that is not a name", () =>
            within(Effect.gen(function*()
            {
                const store = yield* SystemStore;

                expect(yield* store.get("contract-first")).toBeUndefined();
                expect(yield* store.get("../../etc/passwd")).toBeUndefined();
                expect(yield* store.get("")).toBeUndefined();
            })));
    });
};

export const sessionStoreContract = (name: string, make: MakeSessionStore): void =>
{
    const hour = 60 * 60 * 1000;
    const within = <A, E>(ttlMs: number, program: Effect.Effect<A, E, SessionStore>) => Effect.flatMap(make(ttlMs), (layer) => Effect.provide(program, layer));

    describe(`the session store (${name})`, () =>
    {
        it.effect("gives a session back as it was saved, draft included", () =>
            within(hour, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;
                const id = crypto.randomUUID();
                const session: Session = { state: state("violet"), draft: { name: "forest-glass", concept: "Glass over moss." } };

                yield* sessions.set(id, session);

                expect(yield* sessions.get(id)).toEqual(session);
            })));

        it.effect("replaces what was saved under an id, so a session without a draft comes back without one", () =>
            within(hour, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;
                const id = crypto.randomUUID();

                yield* sessions.set(id, { state: state("violet"), draft: { name: "forest-glass", concept: "a" } });
                yield* sessions.set(id, { state: state("amber") });

                expect(yield* sessions.get(id)).toEqual({ state: state("amber") });
            })));

        it.effect("answers nothing for an id it never saw", () =>
            within(hour, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;

                expect(yield* sessions.get(crypto.randomUUID())).toBeUndefined();
                expect(yield* sessions.get("gone")).toBeUndefined();
            })));

        it.effect("keeps sessions apart", () =>
            within(hour, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;
                const one = crypto.randomUUID();
                const two = crypto.randomUUID();

                yield* sessions.set(one, { state: state("violet") });
                yield* sessions.set(two, { state: state("amber") });

                expect((yield* sessions.get(one))?.state.accent).toBe("violet");
                expect((yield* sessions.get(two))?.state.accent).toBe("amber");
            })));

        it.effect("keeps a copy: changing the session after saving it does not change what was saved", () =>
            within(hour, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;
                const id = crypto.randomUUID();
                const session: Session = { state: state("violet") };

                yield* sessions.set(id, session);
                session.state.accent = "amber";

                expect((yield* sessions.get(id))?.state.accent).toBe("violet");
            })));

        it.effect("forgets a session that is ended, and ending one it never saw does nothing", () =>
            within(hour, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;
                const id = crypto.randomUUID();

                yield* sessions.set(id, { state: state() });
                yield* sessions.delete(id);
                yield* sessions.delete(crypto.randomUUID());

                expect(yield* sessions.get(id)).toBeUndefined();
            })));

        it.live("reads a session not saved again within its time to live as absent", () =>
            within(50, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;
                const id = crypto.randomUUID();

                yield* sessions.set(id, { state: state() });
                yield* Effect.sleep("150 millis");

                expect(yield* sessions.get(id)).toBeUndefined();
            })));

        it.live("starts the time to live again on every save", () =>
            within(400, Effect.gen(function*()
            {
                const sessions = yield* SessionStore;
                const id = crypto.randomUUID();

                yield* sessions.set(id, { state: state("violet") });
                yield* Effect.sleep("250 millis");
                yield* sessions.set(id, { state: state("amber") });
                yield* Effect.sleep("250 millis");

                expect((yield* sessions.get(id))?.state.accent).toBe("amber");
            })));
    });
};

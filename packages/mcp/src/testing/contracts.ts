import { describe, expect, it } from "vitest";

import type { Session } from "../server";
import type { SessionStore } from "../sessions";
import type { PublishedSystem, SystemStore } from "../store";
import type { SystemState } from "../system";

/**
 * The contracts the store ports promise. Every adapter runs the same code: the folder store and memorySessions here
 * (test/contracts.test.ts), Postgres in @tyohnn/adapters-postgres.
 *
 * A Postgres store is one shared database, so the contracts never assume an empty store: they only look at the ids
 * they wrote. Published ids are the fixed CONTRACT_IDS, which the Postgres side clears in `make`; session ids are new
 * random UUIDs every time and expire on their own.
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

export const systemStoreContract = (name: string, make: () => Promise<SystemStore>): void =>
{
    describe(`the published-system store (${name})`, () =>
    {
        it("keeps a system under its id with its concept, its base and its changes", async () =>
        {
            const store = await make();
            const system = published("contract-first", "Glass over moss.", "2026-11-01T00:00:00.000Z");

            expect(await store.add(system)).toBe("added");
            expect(await store.get("contract-first")).toEqual(system);
        });

        it("refuses to add under an id already taken and leaves the first system as it was", async () =>
        {
            const store = await make();
            const first = published("contract-first", "first", "2026-11-01T00:00:00.000Z");

            await store.add(first);

            expect(await store.add(published("contract-first", "second", "2026-11-02T00:00:00.000Z"))).toBe("taken");
            expect(await store.get("contract-first")).toEqual(first);
        });

        it("publishes over a system with put, and keeps a new one with put too", async () =>
        {
            const store = await make();
            const second = published("contract-first", "second", "2026-11-02T00:00:00.000Z");
            const fresh = published("contract-second", "fresh", "2026-11-03T00:00:00.000Z");

            await store.add(published("contract-first", "first", "2026-11-01T00:00:00.000Z"));
            await store.put(second);
            await store.put(fresh);

            expect(await store.get("contract-first")).toEqual(second);
            expect(await store.get("contract-second")).toEqual(fresh);
        });

        it("lists the newest first", async () =>
        {
            const store = await make();

            await store.add(published("contract-second", "b", "2026-11-02T00:00:00.000Z"));
            await store.add(published("contract-third", "c", "2026-11-03T00:00:00.000Z"));
            await store.add(published("contract-first", "a", "2026-11-01T00:00:00.000Z"));

            const ids = (await store.list()).map((entry) => entry.id).filter((id) => (CONTRACT_IDS as readonly string[]).includes(id));

            expect(ids).toEqual(["contract-third", "contract-second", "contract-first"]);
        });

        it("answers nothing for an id it does not hold, including one that is not a name", async () =>
        {
            const store = await make();

            expect(await store.get("contract-first")).toBeUndefined();
            expect(await store.get("../../etc/passwd")).toBeUndefined();
            expect(await store.get("")).toBeUndefined();
        });
    });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sessionStoreContract = (name: string, make: (ttlMs: number) => Promise<SessionStore>): void =>
{
    const hour = 60 * 60 * 1000;

    describe(`the session store (${name})`, () =>
    {
        it("gives a session back as it was saved, draft included", async () =>
        {
            const sessions = await make(hour);
            const id = crypto.randomUUID();
            const session: Session = { state: state("violet"), draft: { name: "forest-glass", concept: "Glass over moss." } };

            await sessions.set(id, session);

            expect(await sessions.get(id)).toEqual(session);
        });

        it("replaces what was saved under an id, so a session without a draft comes back without one", async () =>
        {
            const sessions = await make(hour);
            const id = crypto.randomUUID();

            await sessions.set(id, { state: state("violet"), draft: { name: "forest-glass", concept: "a" } });
            await sessions.set(id, { state: state("amber") });

            expect(await sessions.get(id)).toEqual({ state: state("amber") });
        });

        it("answers nothing for an id it never saw", async () =>
        {
            const sessions = await make(hour);

            expect(await sessions.get(crypto.randomUUID())).toBeUndefined();
            expect(await sessions.get("gone")).toBeUndefined();
        });

        it("keeps sessions apart", async () =>
        {
            const sessions = await make(hour);
            const one = crypto.randomUUID();
            const two = crypto.randomUUID();

            await sessions.set(one, { state: state("violet") });
            await sessions.set(two, { state: state("amber") });

            expect((await sessions.get(one))?.state.accent).toBe("violet");
            expect((await sessions.get(two))?.state.accent).toBe("amber");
        });

        it("keeps a copy: changing the session after saving it does not change what was saved", async () =>
        {
            const sessions = await make(hour);
            const id = crypto.randomUUID();
            const session: Session = { state: state("violet") };

            await sessions.set(id, session);
            session.state.accent = "amber";

            expect((await sessions.get(id))?.state.accent).toBe("violet");
        });

        it("forgets a session that is ended, and ending one it never saw does nothing", async () =>
        {
            const sessions = await make(hour);
            const id = crypto.randomUUID();

            await sessions.set(id, { state: state() });
            await sessions.delete(id);
            await sessions.delete(crypto.randomUUID());

            expect(await sessions.get(id)).toBeUndefined();
        });

        it("reads a session not saved again within its time to live as absent", async () =>
        {
            const sessions = await make(50);
            const id = crypto.randomUUID();

            await sessions.set(id, { state: state() });
            await sleep(150);

            expect(await sessions.get(id)).toBeUndefined();
        });

        it("starts the time to live again on every save", async () =>
        {
            const sessions = await make(400);
            const id = crypto.randomUUID();

            await sessions.set(id, { state: state("violet") });
            await sleep(250);
            await sessions.set(id, { state: state("amber") });
            await sleep(250);

            expect((await sessions.get(id))?.state.accent).toBe("amber");
        });
    });
};

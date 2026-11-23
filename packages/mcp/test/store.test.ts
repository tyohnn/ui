import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "@effect/vitest";
import { Effect, type Layer } from "effect";
import { TestClock } from "effect/testing";
import { afterEach } from "vitest";

import { publishSystem, publishVerdict, SystemStore, systemStoreClosed, systemStoreFolder } from "../src/store";
import type { SystemState } from "../src/system";

const state: SystemState = { system: "clover", mode: "light", palette: "clover", accent: "violet", chart: null, colours: { light: {}, dark: {} }, tokens: { "--control-radius": "4px" } };
const reserved = new Set(["clover", "graphite"]);
const dirs: string[] = [];

const folder = () =>
{
    const dir = mkdtempSync(join(tmpdir(), "tyohnn-store-"));

    dirs.push(dir);

    return systemStoreFolder(dir);
};

const inFolder = <A, E>(program: Effect.Effect<A, E, SystemStore>, layer: Layer.Layer<SystemStore> = folder()) => Effect.provide(program, layer);

/** Why the effect failed, in the person's words */
const refusal = <A, R>(program: Effect.Effect<A, { message: string }, R>) => Effect.flip(program).pipe(Effect.map((error) => error.message));

afterEach(() =>
{
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("which names may be published", () =>
{
    it("lets a kebab-case name through that no base system has", () =>
    {
        expect(publishVerdict("forest-glass", reserved)).toBeNull();
    });

    it("refuses a base system's name and a name that is not kebab-case", () =>
    {
        expect(publishVerdict("graphite", reserved)).toContain("base system");
        expect(publishVerdict("../escape", reserved)).toContain("not a system name");
        expect(publishVerdict("Forest", reserved)).toContain("not a system name");
        expect(publishVerdict("f", reserved)).toContain("not a system name");
    });
});

describe("publishing a drafted system", () =>
{
    it.effect("keeps it under its name, stamped with the clock's time", () =>
        inFolder(Effect.gen(function*()
        {
            yield* TestClock.setTime(Date.parse("2026-11-01T00:00:00.000Z"));

            const published = yield* publishSystem({ draft: { name: "forest-glass", concept: "Glass over moss." }, state }, { reserved });

            expect(published).toMatchObject({ id: "forest-glass", publishedAt: "2026-11-01T00:00:00.000Z" });
            expect(yield* (yield* SystemStore).get("forest-glass")).toEqual(published);
        })));

    it.effect("refuses a name already published unless asked to replace it", () =>
        inFolder(Effect.gen(function*()
        {
            const store = yield* SystemStore;

            yield* publishSystem({ draft: { name: "forest-glass", concept: "first" }, state }, { reserved });

            expect(yield* refusal(publishSystem({ draft: { name: "forest-glass", concept: "second" }, state }, { reserved }))).toContain("already published");
            expect((yield* store.get("forest-glass"))?.draft.concept).toBe("first");

            yield* publishSystem({ draft: { name: "forest-glass", concept: "second" }, state }, { reserved, replace: true });

            expect((yield* store.get("forest-glass"))?.draft.concept).toBe("second");
        })));

    it.effect("refuses a base system's name before it reaches the store", () =>
        inFolder(Effect.gen(function*()
        {
            expect(yield* refusal(publishSystem({ draft: { name: "graphite", concept: "a" }, state }, { reserved, replace: true }))).toContain("base system");
            expect(yield* (yield* SystemStore).get("graphite")).toBeUndefined();
        })));

    it.effect("answers with the closed store's reason when there is nowhere to publish", () =>
        inFolder(Effect.gen(function*()
        {
            expect(yield* refusal(publishSystem({ draft: { name: "forest-glass", concept: "a" }, state }, { reserved }))).toBe("No database here.");
            expect(yield* refusal(publishSystem({ draft: { name: "forest-glass", concept: "a" }, state }, { reserved, replace: true }))).toBe("No database here.");
        }), systemStoreClosed("No database here.")));
});

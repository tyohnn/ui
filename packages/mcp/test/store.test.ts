import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { folderStore, type PublishedSystem } from "../src/store";
import type { SystemState } from "../src/system";

const state: SystemState = { system: "clover", mode: "light", palette: "clover", accent: "violet", chart: null, colours: { light: {}, dark: {} }, tokens: { "--control-radius": "4px" } };
const dirs: string[] = [];
const storeAt = (times: string[] = ["2026-11-01T00:00:00.000Z", "2026-11-02T00:00:00.000Z", "2026-11-03T00:00:00.000Z"]) =>
{
    const dir = mkdtempSync(join(tmpdir(), "tyohnn-store-"));
    let index = 0;

    dirs.push(dir);

    return folderStore(dir, new Set(["clover", "graphite"]), () => new Date(times[Math.min(index++, times.length - 1)]));
};

afterEach(() =>
{
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("the folder store of published systems", () =>
{
    it("keeps a system under its name with its concept, its base and its changes", async () =>
    {
        const store = storeAt();
        const published = await store.publish({ draft: { name: "forest-glass", concept: "Glass over moss." }, state }) as PublishedSystem;

        expect(published).toMatchObject({ id: "forest-glass", publishedAt: "2026-11-01T00:00:00.000Z" });
        expect(await store.get("forest-glass")).toEqual(published);
    });

    it("refuses a name a base system has, a name already published, and a name that is not kebab-case", async () =>
    {
        const store = storeAt();

        await store.publish({ draft: { name: "forest-glass", concept: "a" }, state });

        expect(await store.publish({ draft: { name: "graphite", concept: "a" }, state })).toMatchObject({ error: expect.stringContaining("base system") });
        expect(await store.publish({ draft: { name: "forest-glass", concept: "b" }, state })).toMatchObject({ error: expect.stringContaining("already published") });
        expect(await store.publish({ draft: { name: "../escape", concept: "a" }, state })).toMatchObject({ error: expect.stringContaining("not a system name") });
    });

    it("publishes over a name only when asked to replace it", async () =>
    {
        const store = storeAt();

        await store.publish({ draft: { name: "forest-glass", concept: "first" }, state });
        await store.publish({ draft: { name: "forest-glass", concept: "second" }, state }, { replace: true });

        expect((await store.get("forest-glass"))?.draft.concept).toBe("second");
    });

    it("lists the newest first and answers nothing for an id that is not a name", async () =>
    {
        const store = storeAt();

        expect(await store.list()).toEqual([]);
        await store.publish({ draft: { name: "first-one", concept: "a" }, state });
        await store.publish({ draft: { name: "second-one", concept: "b" }, state });

        expect((await store.list()).map((entry) => entry.id)).toEqual(["second-one", "first-one"]);
        expect(await store.get("../../etc/passwd")).toBeUndefined();
    });
});

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { closedStore, folderStore, publishSystem, publishVerdict, type PublishedSystem } from "../src/store";
import type { SystemState } from "../src/system";

const state: SystemState = { system: "clover", mode: "light", palette: "clover", accent: "violet", chart: null, colours: { light: {}, dark: {} }, tokens: { "--control-radius": "4px" } };
const reserved = new Set(["clover", "graphite"]);
const dirs: string[] = [];
const folder = () =>
{
    const dir = mkdtempSync(join(tmpdir(), "tyohnn-store-"));

    dirs.push(dir);

    return folderStore(dir);
};
const at = (iso: string) => () => new Date(iso);

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
    it("keeps it under its name, stamped with the time it was published", async () =>
    {
        const store = folder();
        const published = await publishSystem(store, { draft: { name: "forest-glass", concept: "Glass over moss." }, state }, { reserved, now: at("2026-11-01T00:00:00.000Z") }) as PublishedSystem;

        expect(published).toMatchObject({ id: "forest-glass", publishedAt: "2026-11-01T00:00:00.000Z" });
        expect(await store.get("forest-glass")).toEqual(published);
    });

    it("refuses a name already published unless asked to replace it", async () =>
    {
        const store = folder();

        await publishSystem(store, { draft: { name: "forest-glass", concept: "first" }, state }, { reserved });

        expect(await publishSystem(store, { draft: { name: "forest-glass", concept: "second" }, state }, { reserved })).toMatchObject({ error: expect.stringContaining("already published") });
        expect((await store.get("forest-glass"))?.draft.concept).toBe("first");

        await publishSystem(store, { draft: { name: "forest-glass", concept: "second" }, state }, { reserved, replace: true });

        expect((await store.get("forest-glass"))?.draft.concept).toBe("second");
    });

    it("refuses a base system's name before it reaches the store", async () =>
    {
        const store = folder();

        expect(await publishSystem(store, { draft: { name: "graphite", concept: "a" }, state }, { reserved, replace: true })).toMatchObject({ error: expect.stringContaining("base system") });
        expect(await store.get("graphite")).toBeUndefined();
    });

    it("answers with the closed store's reason when there is nowhere to publish", async () =>
    {
        expect(await publishSystem(closedStore("No database here."), { draft: { name: "forest-glass", concept: "a" }, state }, { reserved })).toEqual({ error: "No database here." });
    });
});

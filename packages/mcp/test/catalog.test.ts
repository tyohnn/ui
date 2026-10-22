import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { allPrimitives, readCatalog, searchPrimitives } from "../src/catalog";
import { DESCRIPTIONS } from "../src/descriptions";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const components = readdirSync(`${root}/registry/ui/components`).filter((file) => file.endsWith(".tsx")).map((file) => file.replace(/\.tsx$/, "")).sort();
const catalog = readCatalog(root);
const primitives = allPrimitives(catalog);

describe("the primitive catalog", () =>
{
    it("lists every registry/ui component exactly once", () =>
    {
        expect(primitives.map((primitive) => primitive.name).sort()).toEqual(components);
    });

    it("gives every primitive a purpose, and describes no component that is gone", () =>
    {
        expect(primitives.filter((primitive) => !primitive.description).map((primitive) => primitive.name)).toEqual([]);
        expect(Object.keys(DESCRIPTIONS).filter((name) => !components.includes(name))).toEqual([]);
    });

    it("keeps the site's group order and draws each primitive with a coverage section", () =>
    {
        expect(catalog.groups.map((group) => group.id)).toEqual(["basics", "forms", "display", "data", "overlays", "menus", "chat"]);
        expect(primitives.find((primitive) => primitive.name === "combobox")?.sections).toEqual(["combobox", "combobox-groups", "combobox-chips"]);
    });

    it("reads what a primitive exports and imports", () =>
    {
        const combobox = primitives.find((primitive) => primitive.name === "combobox");

        expect(combobox?.exports).toContain("ComboboxChips");
        expect(combobox?.packages).toContain("@base-ui/react");
        expect(primitives.find((primitive) => primitive.name === "command")?.packages).toContain("cmdk");
        expect(primitives.find((primitive) => primitive.name === "alert-dialog")?.uses).toContain("button");
    });

    it("finds a primitive by what it is for", () =>
    {
        expect(searchPrimitives(catalog, "destructive confirm").map((primitive) => primitive.name)).toContain("alert-dialog");
    });

    it("lists the design systems with tyohnn's own first", () =>
    {
        expect(catalog.systems.slice(0, 2).map((system) => system.name)).toEqual(["graphite", "loam"]);
        expect(catalog.systems.length).toBeGreaterThanOrEqual(15);
    });
});

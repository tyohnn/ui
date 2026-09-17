import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { familyStacks } from "../src/project/fonts.js";
import { listableSystems, Registry, resolveDefaultMode } from "../src/source/registry.js";
import { repoRoot, tempDir } from "./helpers.js";

describe("registry", () =>
{
    it("never lists foundation", () =>
    {
        expect(listableSystems(["vega", "foundation", "graphite"])).toEqual(["graphite", "vega"]);
    });

    it("lists the systems folders of a source, without foundation even when a folder is named so", () =>
    {
        const root = tempDir();

        cpSync(join(repoRoot, "registry/ui/manifest.json"), join(root, "registry/ui/manifest.json"));

        for (const name of ["mira", "foundation", "no-json"])
        {
            mkdirSync(join(root, "registry/systems", name), { recursive: true });
            if (name !== "no-json") writeFileSync(join(root, "registry/systems", name, "system.json"), JSON.stringify({ name, description: "x", fonts: {}, icons: { library: "lucide" } }));
        }

        const registry = new Registry(root);

        expect(registry.systems()).toEqual(["mira"]);
        expect(() => registry.system("foundation")).toThrow(/master copy/);
        expect(() => registry.system("no-json")).toThrow(/unknown system/);
    });

    it("lists this repository's systems and infers the default mode", () =>
    {
        const registry = new Registry(repoRoot);

        expect(registry.systems()).toContain("mira");
        expect(registry.systems()).not.toContain("foundation");
        expect(resolveDefaultMode({ defaultMode: "light", tags: ["dark"] })).toBe("light");
        expect(resolveDefaultMode({ tags: ["dark", "dense"] })).toBe("dark");
        expect(resolveDefaultMode({ tags: ["light"] })).toBe("light");
    });

    it("builds the same layer-1 font stacks every system declares", () =>
    {
        const registry = new Registry(repoRoot);

        for (const name of registry.systems())
        {
            const globals = registry.read(`registry/systems/${name}/styles/globals.css`);

            for (const [token, stack] of Object.entries(familyStacks(registry.system(name).fonts, registry)))
            {
                expect(globals, `${name} ${token}`).toContain(`${token}: ${stack};`);
            }
        }
    });
});

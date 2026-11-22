import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readCatalog } from "../src/catalog";
import { colourEdits, exportSystem, IMPORT_ORDER, importLines, writeSystem } from "../src/export";
import { readThemes, setColours, setTokens, startState, type SystemState } from "../src/system";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const library = readThemes(root);
const base = readCatalog(root).systems.find((system) => system.name === "clover")!;
const clover = startState(base, library);
const draft = { name: "forest-glass", concept: "Glass over moss." };

const ok = (outcome: { state: SystemState } | { error: string }) =>
{
    if ("error" in outcome) throw new Error(outcome.error);

    return outcome.state;
};

const shaped = ok(setTokens(ok(setColours(clover, { accent: "green", dark: { primary: "oklch(0.7 0.1 150)" } }, library)), { "--surface-shadow": "none" }, library));
const files = exportSystem({ root, state: shaped, library, base, draft, baseCharacter: "Clover is calm.", stylesDir: "./tyohnn/styles" });
const file = (path: string) => files.find((entry) => entry.path === path)?.content ?? "";

describe("a system as the files an app keeps", () =>
{
    it("copies the base's styles folder whole", () =>
    {
        expect(files.map((entry) => entry.path)).toEqual(expect.arrayContaining(["styles/style.css", "styles/tokens.css", "styles/theme.css", "styles/components/_roles.css", "tyohnn.json", "concept.md"]));
        expect(file("styles/components/_roles.css")).toBe(readFileSync(join(root, "registry/systems/clover/styles/components/_roles.css"), "utf8"));
    });

    it("writes the changes at the end of the file they belong to, one marked block per scope", () =>
    {
        expect(file("styles/tokens.css").trimEnd().endsWith("/* ---- forest-glass: tokens changed over clover ---- */\n:root {\n    --surface-shadow: none;\n}")).toBe(true);
        expect(file("styles/theme.css")).toContain("forest-glass: colours changed over clover (light) ---- */\n:root {");
        expect(file("styles/theme.css")).toContain("(dark) ---- */\n.dark {\n");
        expect(file("styles/theme.css")).toContain("--primary: oklch(0.7 0.1 150);");
    });

    it("writes only the colours that moved from the base's own", () =>
    {
        expect(colourEdits(clover, library, base)).toEqual({ light: [], dark: [] });
        expect(colourEdits(shaped, library, base).dark.length).toBeGreaterThan(0);
        expect(colourEdits(shaped, library, base).dark.every(([name]) => name.startsWith("--"))).toBe(true);
    });

    it("says where the system came from in tyohnn.json and what it is for in concept.md", () =>
    {
        const json = JSON.parse(file("tyohnn.json"));

        expect(json).toMatchObject({ schema: 2, system: "forest-glass", styles: "./tyohnn/styles", source: { kind: "mcp", base: "clover", accent: "green", tokens: { "--surface-shadow": "none" } } });
        expect(json.imports).toEqual([...IMPORT_ORDER.map((name) => `./tyohnn/styles/${name}`), "./tyohnn/styles/style.css layer(base)"]);
        expect(file("concept.md")).toContain("# forest-glass\n\nGlass over moss.");
        expect(file("concept.md")).toContain("Clover is calm.");
    });

    it("never names or runs the tyohnn CLI", () =>
    {
        for (const entry of files.filter((item) => !item.path.startsWith("styles/"))) expect(entry.content).not.toMatch(/npx tyohnn|tyohnn (init|use|add)/);
    });

    it("lists the import lines in the registry's order and writes the files under a folder", () =>
    {
        expect(importLines("./s")).toEqual(['@import "./s/globals.css";', '@import "./s/theme.css";', '@import "./s/tokens.css";', '@import "./s/typeset.css";', '@import "./s/typeset-preset.css";', '@import "./s/style.css" layer(base);']);

        const dir = mkdtempSync(join(tmpdir(), "tyohnn-export-"));

        try
        {
            expect(writeSystem(dir, files)).toHaveLength(files.length);
            expect(readFileSync(join(dir, "styles/tokens.css"), "utf8")).toBe(file("styles/tokens.css"));
        }
        finally
        {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});

import { describe, expect, it } from "vitest";

import { applyEntryCss, lastImportEnd, readCssImports, userCustomProperties } from "../src/codemods/css.js";

const blocks = (system: string) => ({
    system: ['@import "tailwindcss";', `@import "@acme/ui/systems/${system}/globals.css";`, `@import "@acme/ui/systems/${system}/style.css" layer(base);`].join("\n"),
    theme: ['@source "../../../../packages/ui/src";', ":root {", "    --font-sans: var(--font-sans-inter), sans-serif;", "}"].join("\n"),
});

describe("entry CSS blocks", () =>
{
    it("puts the system block first and replaces the standalone tailwindcss import", () =>
    {
        const out = applyEntryCss('@import "tailwindcss";\n\n.note { color: red; }\n', blocks("vega"));

        expect(out.match(/@import "tailwindcss"/g)).toHaveLength(1);
        expect(out.indexOf("tyohnn:begin system")).toBe(3);
        expect(out.indexOf("tyohnn:begin theme")).toBeGreaterThan(out.indexOf("tyohnn:end system"));
        expect(out.trimEnd().endsWith(".note { color: red; }")).toBe(true);
    });

    it("is idempotent", () =>
    {
        const once = applyEntryCss("@import 'tailwindcss';\n@import \"./fonts.css\";\n\nbody { margin: 0 }\n", blocks("vega"));

        expect(applyEntryCss(once, blocks("vega"))).toBe(once);
    });

    it("keeps the user's own imports before the theme block, so every @import precedes a rule", () =>
    {
        const out = applyEntryCss('@import "tailwindcss";\n@import "./fonts.css";\n\nbody { margin: 0 }\n', blocks("vega"));
        const imports = readCssImports(out);
        const themeAt = out.indexOf("tyohnn:begin theme");

        expect(imports.map((entry) => entry.specifier)).toEqual(["tailwindcss", "@acme/ui/systems/vega/globals.css", "@acme/ui/systems/vega/style.css", "./fonts.css"]);
        expect(imports.every((entry) => entry.index < themeAt)).toBe(true);
        expect(imports.find((entry) => entry.specifier.endsWith("style.css"))?.layer).toBe("base");
    });

    it("switches systems in place without touching the rest", () =>
    {
        const vega = applyEntryCss("/* mine */\n.a { color: blue }\n", blocks("vega"));
        const nova = applyEntryCss(vega, blocks("nova"));

        expect(nova).not.toContain("systems/vega/");
        expect(nova).toContain("systems/nova/globals.css");
        expect(nova.replace(/systems\/nova\//g, "systems/vega/")).toBe(vega);
    });

    it("creates a file from nothing", () =>
    {
        const out = applyEntryCss("", blocks("mira"));

        expect(out.startsWith("/* tyohnn:begin system */")).toBe(true);
        expect(out.endsWith("/* tyohnn:end theme */\n")).toBe(true);
    });

    it("ignores imports in comments and reports custom properties outside the blocks", () =>
    {
        const css = applyEntryCss('/* @import "x.css"; */\n:root { --background: white; }\n', blocks("vega"));

        expect(lastImportEnd("/* @import \"x.css\"; */")).toBe(-1);
        expect(userCustomProperties(css)).toEqual(["--background"]);
    });
});

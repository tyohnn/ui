import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { describeTheme, isOwnTheme, listThemes, loadTheme, normalizeTheme, resolveThemeInput, systemTheme, themeCss } from "../src/project/theme.js";
import { Registry } from "../src/source/registry.js";
import { repoRoot, tempDir } from "./helpers.js";

const registry = new Registry(repoRoot);
const onMira = { system: "mira" } as const;

describe("naming a theme", () =>
{
    it("takes a registry theme, a base or an accent", () =>
    {
        const root = tempDir();

        expect(resolveThemeInput("graphite", root, registry, onMira)).toEqual({ id: "graphite" });
        expect(resolveThemeInput("stone", root, registry, onMira)).toEqual({ id: "stone" });
        // an accent is not a palette: it composes over what the app wears now
        expect(resolveThemeInput("blue", root, registry, onMira)).toEqual({ base: "mira", accent: "blue" });
        expect(resolveThemeInput("blue", root, registry, { system: "mira", theme: { id: "stone" } })).toEqual({ base: "stone", accent: "blue" });
    });

    it("refuses a name the registry does not have, and says what it has", () =>
    {
        expect(() => resolveThemeInput("chartreuse", tempDir(), registry, onMira)).toThrowError(/unknown theme "chartreuse"/);
    });

    it("takes a theme file inside the project", () =>
    {
        const root = tempDir();
        const theme = { name: "brand", extends: { base: "zinc", accent: "violet" }, light: {}, dark: {} };

        writeFileSync(join(root, "brand.json"), JSON.stringify(theme));

        expect(resolveThemeInput("./brand.json", root, registry, onMira)).toEqual({ file: "brand.json" });
    });

    it("refuses a theme file outside the project", () =>
    {
        const outside = tempDir();

        writeFileSync(join(outside, "brand.json"), JSON.stringify({ name: "brand", extends: { base: "zinc" }, light: {}, dark: {} }));

        expect(() => resolveThemeInput(join(outside, "brand.json"), tempDir(), registry, onMira)).toThrowError(/outside the project/);
    });

    it("refuses a theme that does not fill the palette", () =>
    {
        const root = tempDir();

        writeFileSync(join(root, "half.json"), JSON.stringify({ name: "half", light: { background: "#fff" }, dark: {} }));

        expect(() => resolveThemeInput("./half.json", root, registry, onMira)).toThrowError(/incomplete/);
    });

    it("writes a share link into the project and points the record at the file", () =>
    {
        const root = tempDir();
        const encoded = `tyohnn-theme:${Buffer.from(JSON.stringify({ n: "sunset", e: { base: "stone", accent: "orange" }, l: {}, d: {} })).toString("base64url")}`;
        const choice = resolveThemeInput(encoded, root, registry, onMira);

        expect(choice).toEqual({ file: "tyohnn-theme.sunset.json" });
        expect(existsSync(join(root, "tyohnn-theme.sunset.json"))).toBe(true);
        expect(JSON.parse(readFileSync(join(root, "tyohnn-theme.sunset.json"), "utf8")).extends).toEqual({ base: "stone", accent: "orange" });
    });

    it("refuses a share link that is not readable", () =>
    {
        expect(() => resolveThemeInput("tyohnn-theme:not-base64!!", tempDir(), registry, onMira)).toThrowError(/not readable/);
    });
});

describe("what an app wears", () =>
{
    it("treats the system's own theme as no choice at all", () =>
    {
        expect(systemTheme(registry, "graphite")).toBe("graphite");
        expect(isOwnTheme({ id: "graphite" }, registry, "graphite")).toBe(true);
        expect(normalizeTheme({ id: "graphite" }, registry, "graphite")).toBeUndefined();
        expect(normalizeTheme({ id: "nocturne" }, registry, "graphite")).toEqual({ id: "nocturne" });
        expect(describeTheme(undefined, registry, "graphite")).toBe("graphite (the system's own)");
    });

    it("renders a base with an accent composed over it", () =>
    {
        const css = themeCss({ base: "stone", accent: "blue" }, tempDir(), registry);
        const stone = registry.json<{ light: Record<string, string> }>("registry/themes/bases/stone.json");
        const blue = registry.json<{ light: Record<string, string> }>("registry/themes/accents/blue.json");

        expect(css).toContain(`--background: ${stone.light.background};`);
        expect(css).toContain(`--primary: ${blue.light.primary};`);
        expect(describeTheme({ base: "stone", accent: "blue" }, registry, "mira")).toBe("stone + blue");
    });

    it("renders the colours of a registry theme, both modes", () =>
    {
        const css = themeCss({ id: "nocturne" }, tempDir(), registry);

        expect(css).toContain(":root {");
        expect(css).toContain(".dark {");
        expect([...css.matchAll(/^ {4}--[a-z0-9-]+:/gm)]).toHaveLength(72 * 2);
    });

    it("composes a project theme file over its base and accent", () =>
    {
        const root = tempDir();
        const theme = { name: "brand", extends: { base: "zinc", accent: "violet" }, light: { background: "#fafafa" }, dark: {} };

        writeFileSync(join(root, "brand.json"), JSON.stringify(theme));

        const css = themeCss({ file: "brand.json" }, root, registry);
        const violet = registry.json<{ light: Record<string, string> }>("registry/themes/accents/violet.json");

        expect(css).toContain("--background: #fafafa;");
        expect(css).toContain(`--primary: ${violet.light.primary};`);
        expect(loadTheme({ file: "brand.json" }, root, registry).name).toBe("brand");
    });

    it("says where a missing theme file was supposed to be", () =>
    {
        expect(() => loadTheme({ file: "gone.json" }, tempDir(), registry)).toThrowError(/no theme file at gone\.json/);
    });
});

describe("the registry's themes", () =>
{
    it("lists named themes, bases and accents", () =>
    {
        const themes = listThemes(registry);

        expect(themes.themes).toContain("graphite");
        expect(themes.bases).toEqual(expect.arrayContaining(["neutral", "stone", "zinc"]));
        expect(themes.accents).toEqual(expect.arrayContaining(["blue", "rose"]));
    });

    it("every system's own theme exists and is complete", () =>
    {
        for (const name of registry.systems())
        {
            const id = systemTheme(registry, name);

            expect(() => themeCss({ id }, tempDir(), registry), `${name} wears ${id}`).not.toThrow();
        }
    });
});

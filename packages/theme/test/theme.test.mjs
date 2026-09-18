import assert from "node:assert/strict";
import { test } from "node:test";

import { PALETTE, PALETTE_GROUPS, checkContrast, checkTheme, contrast, decodeTheme, encodeTheme, groupOf, parseColour, resolveTheme, resolveValue, themeToCss } from "../index.mjs";

const full = (value) => Object.fromEntries(PALETTE.map((name) => [name, value]));
const theme = (extra) => ({ name: "test", light: full("#111111"), dark: full("#eeeeee"), ...extra });

test("the palette is finite, unique and grouped", () =>
{
    assert.equal(PALETTE.length, 72);
    assert.equal(new Set(PALETTE).size, PALETTE.length);
    assert.equal(Object.values(PALETTE_GROUPS).flat().length, PALETTE.length);
    assert.equal(groupOf("sidebar-ring"), "sidebar");
    assert.equal(groupOf("tag-blue-bg"), "tag");
    assert.equal(groupOf("nonsense"), null);
});

test("a theme with no extends resolves to itself", () =>
{
    const resolved = resolveTheme(theme(), () => undefined);

    assert.equal(resolved.light.background, "#111111");
    assert.deepEqual(checkTheme(resolved), []);
});

test("extends applies base, then accent, then the theme's own values", () =>
{
    const base = { name: "base", light: full("#000000"), dark: full("#000000") };
    const accent = { name: "accent", light: { primary: "#ff0000" }, dark: { primary: "#ff0000" } };
    const resolved = resolveTheme({ name: "t", extends: { base: "base", accent: "accent" }, light: { background: "#ffffff" }, dark: {} }, (id) => ({ base, accent })[id]);

    assert.equal(resolved.light.primary, "#ff0000");
    assert.equal(resolved.light.background, "#ffffff");
    assert.equal(resolved.light.border, "#000000");
});

test("a chart layer moves only the chart ramp", () =>
{
    const base = { name: "base", light: full("#000000"), dark: full("#000000") };
    const accent = { name: "accent", light: { primary: "#ff0000", "chart-1": "#00ff00" }, dark: { primary: "#ff0000", "chart-1": "#00ff00" } };
    const resolved = resolveTheme({ name: "t", extends: { base: "base", chart: "accent" }, light: {}, dark: {} }, (id) => ({ base, accent })[id]);

    assert.equal(resolved.light["chart-1"], "#00ff00");
    assert.equal(resolved.light.primary, "#000000", "a chart set must not move primary");
});

test("a missing layer and a cycle are errors", () =>
{
    assert.throws(() => resolveTheme({ name: "t", extends: { base: "nope" }, light: {}, dark: {} }, () => undefined), /Unknown theme "nope"/);

    const loop = { name: "loop", extends: { base: "loop" }, light: {}, dark: {} };

    assert.throws(() => resolveTheme({ name: "t", extends: { base: "loop" }, light: {}, dark: {} }, () => loop), /extends itself/);
});

test("checkTheme names every blank and every colour that is not in the set", () =>
{
    const partial = resolveTheme({ name: "p", light: { background: "#fff", nonsense: "#fff" }, dark: {} }, () => undefined);
    const problems = checkTheme(partial);

    assert.ok(problems.some((line) => line.includes("missing --foreground in light")));
    assert.ok(problems.some((line) => line.includes("--nonsense is not a palette colour")));
});

test("themeToCss writes both scopes and refuses an incomplete theme", () =>
{
    const css = themeToCss(resolveTheme(theme(), () => undefined));

    assert.ok(css.includes(":root {"));
    assert.ok(css.includes(".dark {"));
    assert.equal([...css.matchAll(/--background:/g)].length, 2);
    assert.equal([...css.matchAll(/^ {4}--[a-z0-9-]+:/gm)].length, PALETTE.length * 2);
    assert.throws(() => themeToCss({ name: "p", light: {}, dark: {} }), /missing/);
});

test("a theme survives a share link", () =>
{
    const original = theme({ title: "Test", extends: { base: "neutral" } });
    const back = decodeTheme(encodeTheme(original));

    assert.deepEqual(back, { name: "test", title: "Test", extends: { base: "neutral" }, light: original.light, dark: original.dark });
    assert.ok(encodeTheme(original).startsWith("tyohnn-theme:"));
});

test("an alias follows the chain within its mode", () =>
{
    const values = { primary: "#123456", checked: "var(--primary)", selection: "var(--checked)" };

    assert.equal(resolveValue(values, values.selection), "#123456");
    assert.equal(resolveValue(values, "var(--input-fill)"), "var(--input-fill)", "a name outside the palette stays as written");
});

test("contrast reads oklch, hex and rgb", () =>
{
    assert.equal(Math.round(contrast("#000000", "#ffffff")), 21);
    assert.equal(Math.round(contrast("oklch(0 0 0)", "oklch(1 0 0)")), 21);
    assert.equal(Math.round(contrast("rgb(0, 0, 0)", "white")), 21);
    assert.equal(contrast("color-mix(in oklab, var(--primary) 50%, transparent)", "#fff"), null);

    const [r, g, b] = parseColour("oklch(0.577 0.245 27.325)");

    assert.ok(r > 0.7 && g < 0.3 && b < 0.3, "shadcn's destructive is red");
});

test("checkContrast follows aliases and reports the failing pair", () =>
{
    const colours = full("#777777");

    colours.background = "#ffffff";
    colours.foreground = "#fefefe";
    colours.primary = "#ffffff";
    colours["primary-foreground"] = "var(--foreground)";

    const failures = checkContrast(resolveTheme({ name: "t", light: colours, dark: full("#000000") }, () => undefined));

    assert.ok(failures.some((row) => row.mode === "light" && row.foreground === "foreground" && row.ratio < 1.1));
    assert.ok(failures.some((row) => row.foreground === "primary-foreground"), "an alias is resolved before the ratio");
});

import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readCatalog } from "../src/catalog";
import { coloursOf, colourChanges, describe as describeState, presetCode, previewVars, readThemes, setColours, setTokens, startState, type SystemState } from "../src/system";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const library = readThemes(root);
const systems = readCatalog(root).systems;
const clover = startState(systems.find((system) => system.name === "clover")!, library);

const ok = (outcome: { state: SystemState } | { error: string }) =>
{
    if ("error" in outcome) throw new Error(outcome.error);

    return outcome.state;
};

describe("the system being shaped", () =>
{
    it("starts on the system's own palette and mode, with nothing changed", () =>
    {
        expect(clover).toMatchObject({ system: "clover", mode: "light", palette: "clover", accent: null, chart: null, tokens: {} });
        expect(colourChanges(clover, "clover")).toBe(0);
        expect(previewVars(clover, library)).toEqual({});
    });

    it("lists the system palettes and the shadcn bases as palettes, and the accents apart", () =>
    {
        const kinds = Object.fromEntries(library.palettes.map((entry) => [entry.id, entry.kind]));

        expect(kinds).toMatchObject({ clover: "system", graphite: "system", stone: "base", zinc: "base" });
        expect(library.accents).toContain("violet");
        expect(library.palettes.map((entry) => entry.id)).not.toContain("violet");
    });

    it("lays an accent over the palette and a chart ramp over that, as the site's Create page does", () =>
    {
        const state = ok(setColours(clover, { palette: "stone", accent: "orange", chart: "blue" }, library));
        const colours = coloursOf(state, library);
        const orange = library.load("orange")!;
        const blue = library.load("blue")!;

        expect(colours.light.primary).toBe(orange.light.primary);
        expect(colours.light["chart-1"]).toBe(blue.light["chart-1"]);
        expect(colours.light.background).toBe(library.load("stone")!.light.background);
        expect(colourChanges(state, "clover")).toBe(3);
    });

    it("keeps hand-set colours per mode, over the picks, and clears one with null", () =>
    {
        const set = ok(setColours(clover, { accent: "violet", light: { "chart-1": "#f43f5e", "--primary": "oklch(0.6 0.2 25)" } }, library));

        expect(coloursOf(set, library).light.primary).toBe("oklch(0.6 0.2 25)");
        expect(coloursOf(set, library).dark.primary).toBe(library.load("violet")!.dark.primary);
        expect(set.colours.light).toEqual({ "chart-1": "#f43f5e", primary: "oklch(0.6 0.2 25)" });
        expect(ok(setColours(set, { light: { "chart-1": null } }, library)).colours.light).toEqual({ primary: "oklch(0.6 0.2 25)" });
    });

    it("packs the colour picks and hand edits into the site's preset code", () =>
    {
        const state = ok(setColours(clover, { accent: "violet", light: { "chart-1": "#f43f5e" } }, library));

        expect(presetCode(clover, library)).toMatch(/^[0-9a-z]+$/i);
        expect(presetCode(state, library)).not.toBe(presetCode(clover, library));
    });

    it("refuses a palette, accent or colour name that does not exist, and a value that could break out of CSS", () =>
    {
        expect(setColours(clover, { palette: "rainbow" }, library)).toMatchObject({ error: expect.stringContaining("No palette") });
        expect(setColours(clover, { accent: "stone" }, library)).toMatchObject({ error: expect.stringContaining("No accent") });
        expect(setColours(clover, { light: { "button-bg": "red" } }, library)).toMatchObject({ error: expect.stringContaining("72 colour names") });
        expect(setColours(clover, { light: { primary: "red; } body { display: none" } }, library)).toMatchObject({ error: expect.stringContaining("not a colour value") });
    });

    it("sets a token the system declares, in the unit and range its control allows", () =>
    {
        const state = ok(setTokens(clover, { "--table-row-height": "32px", "card-shadow": "none" }, library));

        expect(state.tokens).toEqual({ "--table-row-height": "32px", "--card-shadow": "none" });
        expect(previewVars(state, library)).toEqual(state.tokens);
        expect(setTokens(clover, { "--table-row-height": "200px" }, library)).toMatchObject({ error: expect.stringContaining("goes from 24px to 64px") });
        expect(setTokens(clover, { "--table-row-height": "2rem" }, library)).toMatchObject({ error: expect.stringContaining("takes a length in px") });
    });

    it("refuses a token the system does not declare, and sends colours to set_colours", () =>
    {
        expect(setTokens(clover, { "--table-row-hieght": "32px" }, library)).toMatchObject({ error: "clover has no token --table-row-hieght." });
        expect(setTokens(clover, { "--primary": "red" }, library)).toMatchObject({ error: expect.stringContaining("set_colours") });
    });

    it("clears a token with null", () =>
    {
        const state = ok(setTokens(clover, { "--control-radius": "4px" }, library));

        expect(ok(setTokens(state, { "--control-radius": null }, library)).tokens).toEqual({});
    });

    it("sends the preview every colour of the mode shown once any colour moved", () =>
    {
        const state = ok(setColours(clover, { accent: "violet" }, library));
        const vars = previewVars(state, library);

        expect(Object.keys(vars)).toHaveLength(72);
        expect(vars["--primary"]).toBe(library.load("violet")!.light.primary);
    });

    it("says what changed in words", () =>
    {
        const state = ok(setTokens(ok(setColours(clover, { accent: "violet" }, library)), { "--table-row-height": "32px" }, library));
        const text = describeState(state, library);

        expect(text).toContain("clover palette (the system's own), violet accent");
        expect(text).toContain("Tokens changed: --table-row-height 32px");
        expect(text).toMatch(/--preset [0-9a-z]+/i);
    });
});

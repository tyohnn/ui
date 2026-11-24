import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readCatalog } from "../src/catalog";
import { anchorColours, checkObject, objectFindingsText, readObjects } from "../src/object";
import { readThemes, startState } from "../src/system";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const objects = readObjects(root);
const frost = objects.objects.find((object) => object.name === "frost-alarm")!;

/** A small object that keeps every rule; each test breaks one */
const good = `
.dial {
    --dial-face: var(--primary);
    --dial-font: var(--font-heading);
    --dial-steel: #8a8d91;
    font-family: var(--dial-font);
    background: var(--dial-face);
}
.dial-knob { background: var(--dial-steel); transition: rotate var(--motion-base) var(--motion-ease); }
.dial-knob:focus-visible { outline: 2px solid var(--ring); }
`;

const kinds = (css: string, source?: string) => checkObject({ name: "dial", css, source }).map((finding) => `${finding.level} ${finding.kind}`);

describe("the object contract", () =>
{
    it("reads every object in registry/objects with the UI SDK entries it uses", () =>
    {
        expect(objects.contract).toContain("Anchors read the system");
        expect(frost.behaviour).toEqual(["@ui-sdk/react/switch"]);
        expect(frost.css).toContain("--frost-face: var(--primary)");
    });

    it("finds nothing in the reference object, its CSS and its source", () =>
    {
        expect(checkObject({ name: "frost", css: frost.css, source: frost.tsx })).toEqual([]);
        expect(objectFindingsText([])).toContain("No findings");
    });

    it("finds nothing in an object that keeps every rule", () =>
    {
        expect(kinds(good)).toEqual([]);
    });

    it("refuses a literal font, duration or easing", () =>
    {
        expect(kinds(good.replace("font-family: var(--dial-font)", 'font-family: "Michroma", sans-serif'))).toEqual(["error type"]);
        expect(kinds(good.replace("var(--motion-base) var(--motion-ease)", "130ms cubic-bezier(0.25, 0.8, 0.3, 1)"))).toEqual(["error timing"]);
        expect(kinds(good.replace("--dial-steel: #8a8d91;", "--dial-steel: #8a8d91; --dial-speed: 130ms;"))).toEqual(["error timing"]);
    });

    it("refuses an object with no visible focus, or focus in a literal colour", () =>
    {
        expect(kinds(good.replace(":focus-visible", ":focus"))).toEqual(["error focus"]);
        expect(kinds(good.replace("2px solid var(--ring)", "2px solid #0070f3"))).toEqual(["error focus", "warning material"]);
    });

    it("refuses an object that reads no system colour", () =>
    {
        expect(kinds(good.replace("var(--primary)", "#f7bd00"))).toEqual(["error anchor"]);
    });

    it("warns about a literal colour outside the root's names, but not inside a data-URI texture", () =>
    {
        expect(kinds(good.replace("background: var(--dial-steel)", "background: #8a8d91"))).toEqual(["warning material"]);
        expect(kinds(good.replace("background: var(--dial-steel)", "background: url(\"data:image/svg+xml,%3Csvg fill='%23000'%3E\") var(--dial-steel)"))).toEqual([]);
    });

    it("checks the source: UI SDK entries, shipped roles, motion without reduced motion, a canvas the anchors cannot reach", () =>
    {
        expect(kinds(good, 'import { Switch } from "@ui-sdk/react";')).toEqual(["error behaviour"]);
        expect(kinds(good, '<div role="switch" />')).toEqual(["error behaviour"]);
        expect(kinds(good, "setInterval(blink, 500);")).toEqual(["error motion"]);
        expect(kinds(good, "if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; setInterval(blink, 500);")).toEqual([]);
        expect(kinds(good, 'const gl = canvas.getContext("webgl2"); requestAnimationFrame(tick);')).toEqual(["error motion", "warning anchor", "warning behaviour"]);
    });

    it("gives the colour anchors' values in the system being shaped, per mode", () =>
    {
        const library = readThemes(root);
        const clover = startState(readCatalog(root).systems.find((system) => system.name === "clover")!, library);
        const colours = anchorColours(clover, library);

        expect(colours.light["--primary"]).toMatch(/\S/);
        expect(colours.dark["--ring"]).toMatch(/\S/);
        expect(Object.keys(colours.light).sort()).toEqual(["--destructive", "--primary", "--primary-foreground", "--ring"]);
    });
});

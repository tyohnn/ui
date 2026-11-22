import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readCatalog } from "../src/catalog";
import { checkSystem, findingsText } from "../src/check";
import { readThemes, setColours, setTokens, startState, type SystemState } from "../src/system";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const library = readThemes(root);
const clover = startState(readCatalog(root).systems.find((system) => system.name === "clover")!, library);
const draft = { name: "forest-glass", concept: "Apple's glass over a forest floor: moss greens, frosted surfaces that lift, soft corners, airy rows." };

const ok = (outcome: { state: SystemState } | { error: string }) =>
{
    if ("error" in outcome) throw new Error(outcome.error);

    return outcome.state;
};

describe("check_system's findings", () =>
{
    it("finds nothing in a base system with a written concept", () =>
    {
        const findings = checkSystem({ root, state: clover, library, draft });

        expect(findings.filter((finding) => finding.kind !== "contrast")).toEqual([]);
        expect(findingsText([])).toContain("No findings");
    });

    it("reports a palette pair below AA, as an error under 3:1", () =>
    {
        const state = ok(setColours(clover, { light: { foreground: "#f4f4f4" } }, library));
        const contrast = checkSystem({ root, state, library, draft }).filter((finding) => finding.kind === "contrast");

        expect(contrast.some((finding) => finding.level === "error" && finding.message.includes("foreground") && finding.message.includes("light"))).toBe(true);
    });

    it("points a component slot that only aliases a role token at the role token", () =>
    {
        const state = ok(setTokens(clover, { "--card-shadow": "none" }, library));
        const reach = checkSystem({ root, state, library, draft }).filter((finding) => finding.kind === "reach");

        expect(reach).toHaveLength(1);
        expect(reach[0].message).toContain("set --surface-shadow instead");
    });

    it("leaves a role token alone, and a slot whose role token is set too", () =>
    {
        const role = ok(setTokens(clover, { "--surface-shadow": "none", "--item-height-md": "30px" }, library));
        const both = ok(setTokens(clover, { "--surface-shadow": "none", "--card-shadow": "0 0 0 1px red" }, library));

        expect(checkSystem({ root, state: role, library, draft }).filter((finding) => finding.kind === "reach")).toEqual([]);
        expect(checkSystem({ root, state: both, library, draft }).filter((finding) => finding.kind === "reach")).toEqual([]);
    });

    it("blocks a system without a draft and warns on a one-line concept, errors first", () =>
    {
        const none = checkSystem({ root, state: clover, library });
        const short = checkSystem({ root, state: clover, library, draft: { name: "x-y", concept: "green" } });

        expect(none[0]).toMatchObject({ level: "error", kind: "concept" });
        expect(short.find((finding) => finding.kind === "concept")).toMatchObject({ level: "warning" });
    });
});

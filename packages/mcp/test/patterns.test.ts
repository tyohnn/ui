import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { patternIndex, readPatterns, searchPatterns, summaryOf, withDependencies } from "../src/patterns";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const files = readdirSync(`${root}/registry/blocks`).filter((file) => file.endsWith(".tsx")).map((file) => file.replace(/\.tsx$/, "")).sort((a, b) => a.localeCompare(b, "en"));
const patterns = readPatterns(root);

describe("the pattern catalog", () =>
{
    it("lists every registry/blocks composition exactly once", () =>
    {
        expect(patterns.map((pattern) => pattern.name)).toEqual(files);
    });

    it("gives every pattern a purpose from its doc comment", () =>
    {
        expect(patterns.filter((pattern) => !pattern.description).map((pattern) => pattern.name)).toEqual([]);
        expect(summaryOf(patterns.find((pattern) => pattern.name === "action-item-list")!)).toBe("A short list of outlined items, each with an icon, a title, a description and its own actions.");
    });

    it("reads the primitives, patterns and helpers a pattern imports", () =>
    {
        const list = patterns.find((pattern) => pattern.name === "action-item-list")!;

        expect(list.components).toEqual(["badge", "item"]);
        expect(list.patterns).toEqual(["pending"]);
        expect(list.exports).toContain("ActionItemList");
    });

    it("collects what a pattern builds on, itself first and each once", () =>
    {
        const needed = withDependencies(patterns, "action-item-list").map((pattern) => pattern.name);

        expect(needed[0]).toBe("action-item-list");
        expect(new Set(needed).size).toBe(needed.length);
        expect(needed).toContain("pending");
    });

    it("finds a pattern by what it is for", () =>
    {
        expect(searchPatterns(patterns, "meeting agenda").map((pattern) => pattern.name)).toContain("agenda");
    });

    it("keeps the skill's fallback index in step with the registry", () =>
    {
        expect(readFileSync(`${root}/plugin/skills/screen-rules/references/patterns-index.md`, "utf8")).toBe(patternIndex(patterns));
    });
});

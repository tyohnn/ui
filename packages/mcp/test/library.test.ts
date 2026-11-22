import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { cardText, readSystemCards, searchSystems, sectionOf } from "../src/library";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const cards = readSystemCards(root);

describe("the systems to explore", () =>
{
    it("reads every system folder, tyohnn's own before the shadcn ports", () =>
    {
        const firstPort = cards.findIndex((card) => !card.own);

        expect(cards.length).toBeGreaterThanOrEqual(15);
        expect(cards.slice(0, firstPort).every((card) => card.own)).toBe(true);
        expect(cards.slice(firstPort).every((card) => !card.own)).toBe(true);
        expect(cards.find((card) => card.name === "mira")?.own).toBe(false);
    });

    it("takes a system's concept from the Character section of its DESIGN.md", () =>
    {
        const graphite = cards.find((card) => card.name === "graphite");

        expect(graphite?.character.length).toBeGreaterThan(100);
        expect(graphite?.character).not.toContain("## ");
        expect(graphite?.defaultMode).toBe("dark");
    });

    it("cuts one section out of Markdown, up to the next second-level heading", () =>
    {
        expect(sectionOf("# T\n\n## Character\n\nA\nB\n\n## Do not\n\nC", "character")).toBe("A\nB");
        expect(sectionOf("## Do not\n\nC", "Do not")).toBe("C");
        expect(sectionOf("## Other\n\nx", "Character")).toBe("");
    });

    it("ranks systems by the words of a description, name and tags first", () =>
    {
        expect(searchSystems(cards, "graphite")[0].name).toBe("graphite");
        expect(searchSystems(cards, "dark").every((card) => `${card.name} ${card.tags} ${card.description} ${card.tagline} ${card.defaultMode} ${card.character}`.toLowerCase().includes("dark"))).toBe(true);
        expect(searchSystems(cards, "qqqzzzx")).toEqual([]);
    });

    it("filters by mode and tag, and with no words keeps the own-first order", () =>
    {
        expect(searchSystems(cards, undefined, { mode: "dark" }).every((card) => card.defaultMode === "dark")).toBe(true);
        expect(searchSystems(cards)).toEqual(cards);

        const tag = cards[0].tags[0];

        expect(searchSystems(cards, undefined, { tag }).every((card) => card.tags.includes(tag))).toBe(true);
    });

    it("marks a port in its card text", () =>
    {
        expect(cardText(cards.find((card) => card.name === "mira")!)).toContain("(port of a shadcn preset)");
        expect(cardText(cards.find((card) => card.name === "graphite")!)).not.toContain("port");
    });
});

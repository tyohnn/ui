import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The design systems as the plugin offers them to explore: every registry/systems/<name> folder, read from its
 * system.json (what it is) and its DESIGN.md (why it looks that way). DESIGN.md's Character section is the seed of a
 * system's concept: one paragraph per axis saying what the system chose and why, which is what an agent needs to
 * pick a starting point or explain a system to a person.
 */

export interface SystemCard
{
    name: string;
    description: string;
    tagline: string;
    tags: string[];
    defaultMode: "light" | "dark";
    fonts: Record<string, string>;
    icons: string;
    /** What the system was made from: a reference screenshot, a shadcn preset, a fork … */
    source: string;
    /** DESIGN.md's Character section: the concept, axis by axis */
    character: string;
    /** DESIGN.md's Do not section: what would break the feel */
    doNot: string;
    /** tyohnn's own systems come first; ports of shadcn create presets prove the port, not the taste */
    own: boolean;
}

/** The systems ported from shadcn create presets (CLAUDE.md: show tyohnn's own first) */
const PORTED = new Set(["mira", "vega", "nova", "maia", "lyra", "luma", "sera", "rhea"]);

interface SystemJson
{
    name: string;
    description?: string;
    tagline?: string;
    tags?: string[];
    defaultMode?: "light" | "dark";
    fonts?: Record<string, string>;
    icons?: { library?: string };
    source?: { kind?: string; note?: string };
    forkedFrom?: { source?: string };
}

/** One `## Heading` section of a Markdown file, without the heading, or "" */
export const sectionOf = (markdown: string, heading: string) =>
{
    const lines = markdown.split("\n");
    const start = lines.findIndex((line) => line.replace(/\s+$/, "").toLowerCase() === `## ${heading.toLowerCase()}`);

    if (start < 0) return "";

    const end = lines.findIndex((line, index) => index > start && /^## /.test(line));

    return lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
};

export const readSystemCards = (root: string): SystemCard[] =>
{
    const systems = join(root, "registry/systems");

    return readdirSync(systems, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(systems, entry.name, "system.json")))
        .map((entry) =>
        {
            const json = JSON.parse(readFileSync(join(systems, entry.name, "system.json"), "utf8")) as SystemJson;
            const docPath = join(systems, entry.name, "DESIGN.md");
            const doc = existsSync(docPath) ? readFileSync(docPath, "utf8") : "";

            return {
                name: json.name,
                description: json.description ?? "",
                tagline: json.tagline ?? "",
                tags: json.tags ?? [],
                defaultMode: json.defaultMode ?? "light",
                fonts: json.fonts ?? {},
                icons: json.icons?.library ?? "",
                source: [json.source?.kind, json.source?.note].filter(Boolean).join(": ") || (json.forkedFrom?.source ? `fork of ${json.forkedFrom.source}` : ""),
                character: sectionOf(doc, "Character"),
                doNot: sectionOf(doc, "Do not"),
                own: !PORTED.has(json.name),
            };
        })
        .sort((a, b) => Number(b.own) - Number(a.own) || a.name.localeCompare(b.name));
};

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9가-힣]+/).filter((word) => word.length > 1);

/**
 * Systems that match a description, best first. Every word of the query scores where it appears: the name and tags
 * count most, then the description and tagline, then the Character section. With no query, the order is tyohnn's own
 * systems first, then the ports.
 */
export const searchSystems = (cards: SystemCard[], query?: string, filters: { tag?: string; mode?: "light" | "dark" } = {}) =>
{
    const wanted = words(query ?? "");
    const filtered = cards.filter((card) => (!filters.tag || card.tags.includes(filters.tag)) && (!filters.mode || card.defaultMode === filters.mode));

    if (wanted.length === 0) return filtered;

    return filtered
        .map((card) =>
        {
            const strong = new Set(words(`${card.name} ${card.tags.join(" ")}`));
            const middle = new Set(words(`${card.description} ${card.tagline} ${card.defaultMode}`));
            const weak = new Set(words(card.character));
            const score = wanted.reduce((sum, word) => sum + (strong.has(word) ? 4 : 0) + (middle.has(word) ? 2 : 0) + (weak.has(word) ? 1 : 0), 0);

            return { card, score };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || Number(b.card.own) - Number(a.card.own))
        .map(({ card }) => card);
};

/** A card as a few lines an agent can show a person */
export const cardText = (card: SystemCard) =>
    [`## ${card.name}${card.own ? "" : " (port of a shadcn preset)"}`, card.description, `${card.defaultMode} · ${card.tags.filter((tag) => tag !== card.defaultMode).join(" · ")} · fonts ${card.fonts.sans ?? "?"} · icons ${card.icons}`]
        .filter(Boolean)
        .join("\n");

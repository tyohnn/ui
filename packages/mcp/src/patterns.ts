import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Patterns: tyohnn's compositions of its primitives (a page heading, a table in a card, an agenda), read from
 * registry/blocks at start. They are references: an agent copies one as it is, adapts it, or writes its own into
 * the repo's `<ui>/blocks/`, which the repo owns. Nothing here is installed into a project.
 */

export interface Pattern
{
    name: string;
    /** The doc comment above the pattern's main export */
    description: string;
    exports: string[];
    /** registry/ui components it composes */
    components: string[];
    /** Other patterns it builds on (copy them with it) */
    patterns: string[];
    /** Helper modules in registry/blocks/lib it imports (copy them with it) */
    helpers: string[];
    file: string;
}

export const PATTERN_FOLDER = "registry/blocks";

const importsOf = (source: string) => [...source.matchAll(/\bfrom\s+"([^"]+)"/g)].map((match) => match[1]);

const clean = (comment: string) =>
    comment
        .split("\n")
        .map((line) => line.replace(/^\s*\/?\*+\/?\s?/, "").replace(/\*\/\s*$/, "").trim())
        .filter(Boolean)
        .join(" ");

/** The doc comments that sit right above `export const|function X`, keyed by X */
const documented = (source: string) =>
{
    const found = new Map<string, string>();

    for (const match of source.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(?:const|function)\s+([A-Za-z0-9_]+)/g))
    {
        found.set(match[2], clean(match[1]));
    }

    return found;
};

const exportsOf = (source: string) =>
{
    const names = new Set<string>();

    for (const match of source.matchAll(/export\s+(?:const|function)\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);

    for (const block of source.matchAll(/export\s*\{([^}]*)\}/g))
    {
        for (const part of block[1].split(","))
        {
            const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim();

            if (name) names.add(name);
        }
    }

    return [...names];
};

const pascal = (name: string) => name.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");

export const readPatterns = (root: string): Pattern[] =>
{
    const folder = join(root, PATTERN_FOLDER);

    return readdirSync(folder)
        .filter((file) => file.endsWith(".tsx"))
        .sort((a, b) => a.replace(/\.tsx$/, "").localeCompare(b.replace(/\.tsx$/, ""), "en"))
        .map((file) =>
        {
            const name = file.replace(/\.tsx$/, "");
            const source = readFileSync(join(folder, file), "utf8");
            const imports = importsOf(source);
            const exports = exportsOf(source);
            const comments = documented(source);
            // the export named after the file, else the first documented one
            const description = comments.get(pascal(name)) ?? [...comments.values()][0] ?? "";

            return {
                name,
                description,
                exports,
                components: [...new Set(imports.filter((spec) => spec.startsWith("@tyohnn/components/")).map((spec) => spec.slice("@tyohnn/components/".length)))],
                patterns: [...new Set(imports.filter((spec) => spec.startsWith("@tyohnn/blocks/")).map((spec) => spec.slice("@tyohnn/blocks/".length)).filter((spec) => !spec.startsWith("lib/")))],
                helpers: [...new Set(imports.filter((spec) => spec.startsWith("@tyohnn/blocks/lib/")).map((spec) => `${PATTERN_FOLDER}/lib/${spec.slice("@tyohnn/blocks/lib/".length)}.ts`))],
                file: `${PATTERN_FOLDER}/${file}`,
            };
        });
};

/** The first sentence of a pattern's description, for an index line */
export const summaryOf = (pattern: Pick<Pattern, "description">) =>
{
    const text = pattern.description;
    let depth = 0;

    // the first `.` or `:` outside brackets and backticks that ends a word
    for (let index = 0; index < text.length; index++)
    {
        const char = text[index];

        if (char === "(" || char === "[") depth++;
        else if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
        else if (char === "`") depth = depth === 0 ? -1 : depth === -1 ? 0 : depth;
        else if (depth === 0 && (char === "." || char === ":") && (index === text.length - 1 || text[index + 1] === " ")) return `${text.slice(0, index)}.`;
    }

    return text;
};

/** Case-insensitive match on the name, the description, the exports and the components it composes */
export const searchPatterns = (patterns: Pattern[], query: string) =>
{
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return patterns.filter((pattern) =>
    {
        const haystack = [pattern.name, pattern.description, ...pattern.exports, ...pattern.components].join(" ").toLowerCase();

        return words.every((word) => haystack.includes(word));
    });
};

/** Every pattern a pattern needs, itself first, then what it builds on, each once */
export const withDependencies = (patterns: Pattern[], name: string) =>
{
    const byName = new Map(patterns.map((pattern) => [pattern.name, pattern]));
    const order: Pattern[] = [];
    const visit = (current: string) =>
    {
        const pattern = byName.get(current);

        if (!pattern || order.includes(pattern)) return;
        order.push(pattern);
        pattern.patterns.forEach(visit);
    };

    visit(name);

    return order;
};

/** The index the screen-rules skill falls back on when the MCP server is not connected */
export const patternIndex = (patterns: Pattern[]) =>
    [
        "# Pattern index",
        "",
        "Generated from tyohnn's `registry/blocks` by `node packages/mcp/scripts/pattern-index.mjs`; do not edit. With the",
        "tyohnn MCP server connected, call `list_patterns` and `get_pattern` instead: they return the source.",
        "",
        "| Pattern | What it is | Composes |",
        "|---|---|---|",
        ...patterns.map((pattern) => `| \`${pattern.name}\` | ${summaryOf(pattern).replace(/\|/g, "\\|")} | ${pattern.components.join(", ")} |`),
        "",
    ].join("\n");

// Registry layout and CSS token parsing shared by the system tools.
//
//   registry/ui                     the one set of component TSX (components · hooks · lib)
//   registry/foundation/styles      the maintainer master copy of the three layers (mira values)
//   registry/systems/<name>/styles  complete, frozen design systems forked from foundation or each other

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const registryRoot = join(repoRoot, "registry");
export const uiRoot = join(registryRoot, "ui");
export const foundationRoot = join(registryRoot, "foundation");
export const systemsRoot = join(registryRoot, "systems");

/** Every system folder name, sorted */
export const listSystems = () =>
    existsSync(systemsRoot)
        ? readdirSync(systemsRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && existsSync(join(systemsRoot, entry.name, "system.json")))
            .map((entry) => entry.name)
            .sort()
        : [];

/** Folder of a system; `foundation` is accepted as a name */
export const systemRoot = (name) =>
{
    const root = name === "foundation" ? foundationRoot : join(systemsRoot, name);

    if (!existsSync(join(root, "styles/style.css")))
    {
        throw new Error(`Unknown system "${name}" (no ${join(root, "styles/style.css")})`);
    }

    return root;
};

/** The fixed stylesheet order of every system */
export const styleFiles = (root) => ({
    colors: join(root, "styles/globals.css"),
    tokens: join(root, "styles/tokens.css"),
    typeset: [join(root, "styles/typeset.css"), join(root, "styles/typeset-preset.css")],
    barrel: join(root, "styles/style.css"),
});

/** Blanks comments but keeps offsets and line numbers */
export const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));

/** `@import "./x.css"` targets of a CSS file, in order, as absolute paths */
export const readImports = (file) =>
    [...stripComments(readFileSync(file, "utf8")).matchAll(/@import\s+["'](\.[^"']+)["']/g)]
        .map((match) => join(dirname(file), match[1]));

const TOKEN_SELECTOR = /^(?::root|\.dark)(?:\s*,\s*(?::root|\.dark))*$/;

/** Top-level :root / .dark custom-property declarations: [{ name, value, scope, line }] */
export const readTokens = (path) =>
{
    const clean = stripComments(readFileSync(path, "utf8"));
    const rows = [];
    let depth = 0;
    let selectorStart = 0;

    for (let index = 0; index < clean.length; index += 1)
    {
        const char = clean[index];

        if (char === "{")
        {
            if (depth === 0)
            {
                const selector = clean.slice(selectorStart, index).trim().split(/[;}]/).pop().trim();
                let cursor = index + 1;
                let inner = 1;

                while (cursor < clean.length && inner > 0)
                {
                    if (clean[cursor] === "{") inner += 1;
                    else if (clean[cursor] === "}") inner -= 1;
                    cursor += 1;
                }

                if (TOKEN_SELECTOR.test(selector))
                {
                    for (const found of clean.slice(index + 1, cursor - 1).matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g))
                    {
                        rows.push({
                            name: found[1],
                            value: found[2].trim(),
                            scope: selector,
                            line: clean.slice(0, index + 1 + found.index).split("\n").length,
                        });
                    }
                }

                index = cursor - 1;
                selectorStart = cursor;
                continue;
            }

            depth += 1;
        }
        else if (char === "}")
        {
            depth = Math.max(0, depth - 1);
            if (depth === 0) selectorStart = index + 1;
        }
    }

    return rows;
};

export const fontsRoot = join(registryRoot, "fonts");
export const schemaRoot = join(registryRoot, "schema");

/** system.json of a system, or foundation.json for `foundation` */
export const readSystemMeta = (name) =>
    JSON.parse(readFileSync(join(systemRoot(name), name === "foundation" ? "foundation.json" : "system.json"), "utf8"));

/** Font catalog: id → registry/fonts/<id>.json */
export const readFontCatalog = () =>
    new Map(existsSync(fontsRoot)
        ? readdirSync(fontsRoot).filter((file) => file.endsWith(".json")).map((file) =>
            [file.slice(0, -".json".length), JSON.parse(readFileSync(join(fontsRoot, file), "utf8"))])
        : []);

/** Platform fallbacks that close every layer-1 stack, by catalog category */
export const FALLBACKS = {
    sans: ["ui-sans-serif", "system-ui", "sans-serif"],
    display: ["ui-sans-serif", "system-ui", "sans-serif"],
    serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
    mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", '"Liberation Mono"', '"Courier New"', "monospace"],
};

/** Family names one catalog font contributes: its canonical family, then the name its package registers if different */
export const fontFamilies = (font) =>
    [...new Set([font.family, font.fontsource?.family ?? font.npm?.family].filter(Boolean))].map((family) => `"${family}"`);

/**
 * The layer-1 stacks a system's fonts produce:
 *   --font-sans     system font → Hangul fallback → platform fallbacks
 *   --font-heading  var(--font-sans) for `inherit`, otherwise a stack like sans
 *   --font-mono     like sans; `system` = platform monospace with the Hangul fallback before `monospace`
 */
export const fontStacks = (fonts, catalog = readFontCatalog()) =>
{
    const get = (id) =>
    {
        const font = catalog.get(id);

        if (!font) throw new Error(`Unknown font "${id}" (no registry/fonts/${id}.json)`);

        return font;
    };
    const hangulId = fonts.hangulFallback;
    const stack = (id) =>
    {
        const hangul = id === hangulId ? [] : fontFamilies(get(hangulId));

        return [...fontFamilies(get(id)), ...hangul, ...FALLBACKS[get(id).category]].join(", ");
    };
    const mono = FALLBACKS.mono;

    return {
        "--font-sans": stack(fonts.sans),
        "--font-heading": fonts.heading === "inherit" ? "var(--font-sans)" : stack(fonts.heading),
        "--font-mono": fonts.mono === "system"
            ? [...mono.slice(0, -1), ...fontFamilies(get(hangulId)), mono.at(-1)].join(", ")
            : stack(fonts.mono),
    };
};

/** Catalog ids a system's fonts need installed (heading `inherit` and mono `system` need none) */
export const fontIds = (fonts) =>
    [...new Set([fonts.sans, fonts.heading, fonts.mono, fonts.hangulFallback].filter((id) => id && id !== "inherit" && id !== "system"))];

/** Short commit hash of the repository HEAD, or null outside git */
export const currentCommit = () =>
{
    try
    {
        return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim();
    }
    catch
    {
        return null;
    }
};

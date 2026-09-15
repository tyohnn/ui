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

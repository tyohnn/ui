// Token scan — generalised from an earlier product's token scan.
//
// For every theme (base included) it composes the file list the way compose-theme does and checks:
//   1. undefined      a var() that no layer-1/2 file defines and nothing declares locally   → FAIL
//   2. axis contract  a theme colors.css / tokens.css defines a name base does not own,
//                     or a theme layer-3 file defines top-level :root/.dark tokens          → FAIL
//   3. mode leak      a theme sets a name in :root that base also sets in .dark, but not in
//                     .dark itself (the later :root would win over base .dark)             → FAIL
//   4. dead           a defined token nobody reads anywhere in the registry                 → warning
//   5. fractional px  a token value with a non-integer px length                            → warning
//
// Tokens live only in the top-level :root / .dark blocks of layer-1 (globals.css, colors.css) and
// layer-2 (tokens.css) files. Custom properties inside rules are local geometry, not tokens.
//
// Usage: node tooling/scan-tokens [theme…]

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

import { baseFiles, composeOrder, listThemes, readChain, readImports, repoRoot } from "@tyohnn/compose-theme/registry";

const EXTERNAL_PREFIXES = ["--tw-", "--radix-", "--scroll-fade-", "--drawer-", "--toast-"];
const EXTERNAL_NAMES = new Set([
    "--spacing", "--anchor-width", "--anchor-height", "--available-width", "--available-height",
    "--transform-origin", "--positioner-width", "--positioner-height", "--collapsible-panel-height",
    "--collapsible-panel-width", "--accordion-panel-height", "--accordion-panel-width", "--nested-drawers",
    "--font-mono",
]);
const isExternal = (name) => EXTERNAL_NAMES.has(name) || EXTERNAL_PREFIXES.some((prefix) => name.startsWith(prefix));

const SCANNED = new Set([".css", ".ts", ".tsx"]);
const collect = (root) =>
{
    let entries;

    try { entries = readdirSync(root, { withFileTypes: true }); }
    catch { return []; }

    return entries.flatMap((entry) =>
    {
        const path = join(root, entry.name);

        if (entry.isDirectory())
        {
            return ["node_modules", "dist", "reference"].includes(entry.name) ? [] : collect(path);
        }

        return SCANNED.has(extname(entry.name)) ? [path] : [];
    });
};

/** Blanks comments but keeps offsets and line numbers */
const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
const TOKEN_SELECTOR = /^(?::root|\.dark)(?:\s*,\s*(?::root|\.dark))*$/;

/** Top-level :root / .dark declarations of a file */
const readTokens = (path) =>
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
                    const body = clean.slice(index + 1, cursor - 1);

                    for (const found of body.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g))
                    {
                        rows.push({
                            name: found[1],
                            value: found[2].trim(),
                            scope: selector,
                            file: relative(repoRoot, path),
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

/** var() reads and local custom-property declarations of a file */
const readUsage = (path) =>
{
    const source = readFileSync(path, "utf8");
    const clean = extname(path) === ".css" ? stripComments(source) : source;
    const shown = relative(repoRoot, path);

    return {
        declared: [...clean.matchAll(/["']?(--[A-Za-z0-9_-]+)["']?\s*:/g)].map((match) => match[1]),
        reads: [...clean.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)\s*(,)?/g)].map((match) => ({
            name: match[1],
            hasFallback: Boolean(match[2]),
            file: shown,
            line: clean.slice(0, match.index).split("\n").length,
        })),
    };
};

/** Every file that can read a token, for the registry-wide dead check */
const registryReaders = () => [
    ...collect(join(repoRoot, "registry")),
    ...collect(join(repoRoot, "apps/preview/src")),
];

const allReads = new Set(registryReaders().flatMap((file) => readUsage(file).reads.map((read) => read.name)));
const baseColorNames = new Set(readTokens(baseFiles.colors).map((row) => row.name));
const baseTokenNames = new Set(readTokens(baseFiles.tokens).map((row) => row.name));
const baseDarkNames = new Set(readTokens(baseFiles.colors).filter((row) => row.scope.includes(".dark")).map((row) => row.name));

const scanTheme = (name) =>
{
    const order = composeOrder(name);
    const chain = readChain(name).slice(1);
    const tokenFiles = [...order.colors, ...order.tokens];
    const definitions = tokenFiles.flatMap(readTokens);
    const defined = new Map(definitions.map((row) => [row.name, row]));

    const additions = order.additions.flatMap((file) => [file, ...readImports(file)]);
    const readers = [
        ...tokenFiles,
        ...order.typeset,
        ...order.rules,
        ...additions,
        ...collect(join(repoRoot, "registry/base/components")),
        ...collect(join(repoRoot, "registry/base/hooks")),
        ...collect(join(repoRoot, "registry/base/lib")),
        ...collect(join(repoRoot, "apps/preview/src")),
    ];
    const declaredAnywhere = new Set();
    const usages = new Map();

    for (const file of readers)
    {
        const usage = readUsage(file);

        usage.declared.forEach((declared) => declaredAnywhere.add(declared));

        for (const read of usage.reads)
        {
            usages.set(read.name, [...(usages.get(read.name) ?? []), read]);
        }
    }

    const failures = [];
    const warnings = [];

    for (const [token, rows] of usages)
    {
        if (defined.has(token) || declaredAnywhere.has(token) || isExternal(token)) continue;

        if (rows.every((row) => row.hasFallback))
        {
            warnings.push(`undefined, falls back: ${token}  (${rows[0].file}:${rows[0].line})`);
        }
        else
        {
            failures.push(`undefined: ${token}  (${rows.map((row) => `${row.file}:${row.line}`).join(", ")})`);
        }
    }

    for (const theme of chain)
    {
        for (const row of theme.colors ? readTokens(theme.colors) : [])
        {
            if (!baseColorNames.has(row.name))
            {
                failures.push(`axis contract: ${row.name} is not a base layer-1 name  (${row.file}:${row.line})`);
            }
        }

        const rootSet = theme.colors ? readTokens(theme.colors).filter((row) => row.scope.includes(":root")) : [];
        const darkSet = new Set(theme.colors ? readTokens(theme.colors).filter((row) => row.scope.includes(".dark")).map((row) => row.name) : []);

        for (const row of rootSet)
        {
            if (baseDarkNames.has(row.name) && !darkSet.has(row.name))
            {
                failures.push(`mode leak: ${row.name} is set in :root but not .dark, so it overrides base .dark  (${row.file}:${row.line})`);
            }
        }

        for (const row of theme.tokens ? readTokens(theme.tokens) : [])
        {
            if (!baseTokenNames.has(row.name))
            {
                failures.push(`axis contract: ${row.name} is not a base layer-2 name  (${row.file}:${row.line})`);
            }
        }

        for (const file of [...theme.replaces.values(), ...theme.adds, ...(theme.style ? [theme.style] : [])])
        {
            for (const row of readTokens(file))
            {
                failures.push(`axis contract: layer-3 file defines token ${row.name}; tokens belong in colors.css / tokens.css  (${row.file}:${row.line})`);
            }
        }
    }

    const seenDead = new Set();

    for (const row of definitions)
    {
        if (!usages.has(row.name) && !seenDead.has(row.name))
        {
            seenDead.add(row.name);
            warnings.push(allReads.has(row.name)
                ? `unread here (slot read by another theme): ${row.name}`
                : `dead: ${row.name}  (${row.file}:${row.line})`);
        }

        if (/(^|[\s(,])-?\d*\.\d+px\b/.test(row.value))
        {
            warnings.push(`fractional px: ${row.name}: ${row.value}  (${row.file}:${row.line})`);
        }
    }

    return { name, defined: defined.size, reads: usages.size, files: readers.length, failures, warnings };
};

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const verbose = process.argv.includes("--verbose");
const names = requested.length > 0 ? requested : listThemes();
let failed = false;

for (const name of names)
{
    const result = scanTheme(name);
    const unread = result.warnings.filter((warning) => warning.startsWith("unread here"));
    const shownWarnings = verbose ? result.warnings : result.warnings.filter((warning) => !warning.startsWith("unread here"));

    console.log(`\n${name}: ${result.defined} tokens defined, ${result.reads} tokens read across ${result.files} files`);

    shownWarnings.forEach((warning) => console.log(`  ⚠ ${warning}`));

    if (!verbose && unread.length > 0)
    {
        console.log(`  · ${unread.length} contract slots are unread in this composition but read by another theme (--verbose lists them)`);
    }

    result.failures.forEach((failure) => console.log(`  ✗ ${failure}`));
    console.log(result.failures.length === 0 ? "  ✓ undefined 0 · axis contract violations 0" : `  ✗ ${result.failures.length} failures`);
    failed ||= result.failures.length > 0;
}

process.exit(failed ? 1 : 0);

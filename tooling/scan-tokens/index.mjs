// Token scan — generalised from an earlier product's token scan.
//
// Checks foundation and every registry/systems/* folder on its own files (systems are snapshots;
// nothing is composed):
//   1. undefined       a var() (or Tailwind shorthand such as text-(color:--x)) read by the system's
//                      styles, registry/ui or apps/preview that no top-level :root/.dark of the
//                      system's globals.css / tokens.css defines and nothing declares locally
//                      (a ChartConfig key's runtime --color-<key> counts as declared)             → FAIL
//   2. palette         a theme colour (packages/theme PALETTE) the system's layer 1 lacks, in either
//                      scope — every theme fills the whole set, so a gap is a broken theme.css   → FAIL
//                      Other foundation tokens are NOT required: a slot a system does not tune is
//                      simply not declared, and layer 2 · 3 read it with the default as a fallback
//                      (`var(--sidebar-item-border, var(--border))`). Rule 1 enforces that fallback.
//   3. components      a registry/ui component without styles/components/<name>.css in the system,
//                      or a stylesheet style.css does not import (skipped when foundation has none) → FAIL
//   4. system-only     a token only this system defines                                          → warning
//   5. dead · px       a token nothing reads · a fractional px value                             → warning
//
// Usage: node tooling/scan-tokens [foundation|<system>…] [--verbose]

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

import { foundationRoot, listSystems, readImports, readTokens, repoRoot, stripComments, styleFiles, systemRoot, uiRoot } from "@tyohnn/build-system/registry";
import { PALETTE } from "@tyohnn/theme";

const EXTERNAL_PREFIXES = ["--tw-", "--radix-", "--scroll-fade-", "--drawer-", "--toast-"];
const EXTERNAL_NAMES = new Set([
    "--spacing", "--anchor-width", "--anchor-height", "--available-width", "--available-height",
    "--transform-origin", "--positioner-width", "--positioner-height", "--collapsible-panel-height",
    "--collapsible-panel-width", "--accordion-panel-height", "--accordion-panel-width", "--nested-drawers",
    // Base UI Positioner sizes set at runtime (navigation-menu reads them as w-(--popup-width)).
    "--popup-width", "--popup-height",
]);

const SCANNED = new Set([".css", ".ts", ".tsx"]);
const collect = (root) =>
{
    if (!existsSync(root)) return [];

    return readdirSync(root, { withFileTypes: true }).flatMap((entry) =>
    {
        const path = join(root, entry.name);

        if (entry.isDirectory()) return ["node_modules", "dist", "reference"].includes(entry.name) ? [] : collect(path);

        return SCANNED.has(extname(entry.name)) ? [path] : [];
    });
};

const readUsage = (path) =>
{
    const source = readFileSync(path, "utf8");
    const clean = extname(path) === ".css" ? stripComments(source) : source;
    const shown = relative(repoRoot, path);
    const lineOf = (index) => clean.slice(0, index).split("\n").length;

    return {
        declared: [...clean.matchAll(/["']?(--[A-Za-z0-9_-]+)["']?\s*:/g)].map((match) => match[1]),
        reads: [
            ...[...clean.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)\s*(,)?/g)].map((match) => ({ match, hasFallback: Boolean(match[2]) })),
            ...[...clean.matchAll(/-\((?:[a-z-]+:)?(--[A-Za-z0-9_-]+)\)/g)].map((match) => ({ match, hasFallback: false })),
        ].map(({ match, hasFallback }) => ({ name: match[1], hasFallback, where: `${shown}:${lineOf(match.index)}` })),
    };
};

/** name → Set(scope) of a system's layer-1/2 tokens */
const tokenScopes = (root) =>
{
    const files = styleFiles(root);
    const map = new Map();

    for (const [layer, file] of [["1", files.colors], ["1", files.theme], ["2", files.tokens]])
    {
        for (const row of readTokens(file))
        {
            for (const scope of row.scope.split(/\s*,\s*/))
            {
                const key = `${row.name}`;
                const entry = map.get(key) ?? { scopes: new Set(), layer, value: row.value, line: row.line, file };

                entry.scopes.add(scope);
                map.set(key, entry);
            }
        }
    }

    return map;
};

/**
 * Chart series colours: ChartStyle (registry/ui/components/chart.tsx) writes `--color-<key>` into a <style> tag at
 * runtime for every key of a ChartContainer config that has a `color` or `theme`, so a chart's
 * `fill="var(--color-desktop)"` has no static definition. The keys are read from the config object literals of the
 * scanned sources (`{ … } satisfies ChartConfig` or `const x: ChartConfig = { … }`), so a new series needs no entry here.
 */
const chartColorNames = (paths) =>
{
    const names = new Set();
    const closing = { "{": "}", "(": ")", "[": "]" };

    // The balanced body of the literal whose `{` is at `start`, skipping strings and template literals.
    const literalAt = (source, start) =>
    {
        const stack = [];

        for (let index = start; index < source.length; index += 1)
        {
            const char = source[index];

            if (char === "\"" || char === "'" || char === "`")
            {
                for (index += 1; index < source.length && source[index] !== char; index += source[index] === "\\" ? 2 : 1);
            }
            else if (closing[char]) stack.push(closing[char]);
            else if (char === stack.at(-1))
            {
                stack.pop();
                if (stack.length === 0) return source.slice(start + 1, index);
            }
        }

        return "";
    };

    // Top-level `key: value` entries of an object body.
    const entries = (body) =>
    {
        const found = [];
        let depth = 0;
        let from = 0;

        for (let index = 0; index <= body.length; index += 1)
        {
            const char = body[index];

            if (char === "{" || char === "(" || char === "[") depth += 1;
            else if (char === "}" || char === ")" || char === "]") depth -= 1;
            else if (char === "\"" || char === "'" || char === "`")
            {
                for (index += 1; index < body.length && body[index] !== char; index += body[index] === "\\" ? 2 : 1);
            }
            else if ((char === "," && depth === 0) || index === body.length)
            {
                const match = body.slice(from, index).match(/^\s*["']?([A-Za-z0-9_-]+)["']?\s*:([\s\S]*)$/);

                if (match) found.push({ key: match[1], value: match[2] });
                from = index + 1;
            }
        }

        return found;
    };

    for (const path of paths.filter((file) => /\.tsx?$/.test(file)))
    {
        const source = readFileSync(path, "utf8");

        if (!source.includes("ChartConfig")) continue;

        const starts = [...source.matchAll(/:\s*ChartConfig\s*=\s*\{/g)].map((match) => match.index + match[0].length - 1);

        // `{ … } satisfies ChartConfig`: walk back from the closing brace to its opening one.
        for (const match of source.matchAll(/\}\s*satisfies\s+ChartConfig\b/g))
        {
            for (let index = match.index, depth = 0; index >= 0; index -= 1)
            {
                if (source[index] === "}") depth += 1;
                else if (source[index] === "{" && --depth === 0)
                {
                    starts.push(index);
                    break;
                }
            }
        }

        for (const start of starts)
        {
            entries(literalAt(source, start))
                .filter((entry) => /\b(color|theme)\s*:/.test(entry.value))
                .forEach((entry) => names.add(`--color-${entry.key}`));
        }
    }

    return names;
};

const foundationTokens = tokenScopes(foundationRoot);
const uiComponents = readdirSync(join(uiRoot, "components")).filter((file) => file.endsWith(".tsx")).map((file) => basename(file, ".tsx"));
const sharedReaders = [...collect(uiRoot), ...collect(join(repoRoot, "apps/preview/src"))];
const CHART_COLORS = chartColorNames(sharedReaders);
const isExternal = (name) => EXTERNAL_NAMES.has(name) || CHART_COLORS.has(name) || EXTERNAL_PREFIXES.some((prefix) => name.startsWith(prefix));

const scan = (name) =>
{
    const root = systemRoot(name);
    const files = styleFiles(root);
    const tokens = tokenScopes(root);
    const styleReaders = collect(join(root, "styles"));
    const failures = [];
    const warnings = [];
    const declaredAnywhere = new Set();
    const usages = new Map();

    for (const file of [...styleReaders, ...sharedReaders])
    {
        const usage = readUsage(file);

        usage.declared.forEach((declared) => declaredAnywhere.add(declared));
        usage.reads.forEach((read) => usages.set(read.name, [...(usages.get(read.name) ?? []), read]));
    }

    // 1. undefined
    for (const [token, rows] of usages)
    {
        if (tokens.has(token) || declaredAnywhere.has(token) || isExternal(token)) continue;

        if (rows.every((row) => row.hasFallback)) warnings.push(`undefined, falls back: ${token}  (${rows[0].where})`);
        else failures.push(`undefined: ${token}  (${rows.map((row) => row.where).join(", ")})`);
    }

    // 2. the theme palette, in both scopes
    for (const colour of PALETTE)
    {
        const token = `--${colour}`;
        const own = tokens.get(token);

        for (const scope of [":root", ".dark"])
        {
            if (!own || !own.scopes.has(scope)) failures.push(`missing theme colour: ${token} in ${scope} — run node tooling/theme/write-css.mjs ${name}`);
        }
    }

    // 3. component stylesheets
    const imported = new Set(readImports(files.barrel));

    for (const component of uiComponents)
    {
        const inFoundation = existsSync(join(foundationRoot, "styles/components", `${component}.css`));
        const css = join(root, "styles/components", `${component}.css`);

        if (!inFoundation) continue;
        if (!existsSync(css)) failures.push(`missing component stylesheet: styles/components/${component}.css`);
        else if (!imported.has(css)) failures.push(`styles/style.css does not import components/${component}.css`);
    }

    // 4. system-only tokens
    if (name !== "foundation")
    {
        for (const [token, entry] of tokens)
        {
            // A name only this system declares is worth a look — unless every reader already falls
            // back, which is how a system tunes one slot without the other ten declaring anything.
            const readers = usages.get(token) ?? [];

            if (!foundationTokens.has(token) && !(readers.length > 0 && readers.every((row) => row.hasFallback)))
            {
                warnings.push(`system-only token: ${token}  (${relative(repoRoot, entry.file)}:${entry.line})`);
            }
        }
    }

    // 5. dead · fractional px
    for (const [token, entry] of tokens)
    {
        if (!usages.has(token)) warnings.push(`dead: ${token}  (${relative(repoRoot, entry.file)}:${entry.line})`);
        if (/(^|[\s(,])-?\d*\.\d+px\b/.test(entry.value)) warnings.push(`fractional px: ${token}: ${entry.value}`);
    }

    return { tokens: tokens.size, reads: usages.size, failures, warnings };
};

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const names = requested.length > 0 ? requested : ["foundation", ...listSystems()];
let failed = false;

for (const name of names)
{
    const result = scan(name);

    console.log(`\n${name}: ${result.tokens} tokens defined, ${result.reads} tokens read`);
    result.warnings.forEach((warning) => console.log(`  ⚠ ${warning}`));
    result.failures.forEach((failure) => console.log(`  ✗ ${failure}`));
    console.log(result.failures.length === 0
        ? "  ✓ undefined 0 · theme palette complete · component stylesheets complete"
        : `  ✗ ${result.failures.length} failures`);
    failed ||= result.failures.length > 0;
}

process.exit(failed ? 1 : 0);

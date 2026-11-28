#!/usr/bin/env node

/**
 * Stops screen code from writing values the design system should decide.
 *
 *   node scripts/check-screens.mjs           # compare with the ledger, fail when it grew
 *   node scripts/check-screens.mjs --init    # first run only: write today's violations as the ledger
 *   node scripts/check-screens.mjs --write   # shrink the ledger after fixes
 *
 * The rules are `RULES` below. Each carries `why` (what breaks) and `instead` (what to use), so the rule file in
 * `.claude/rules/` does not repeat them.
 *
 * Violations that already exist sit in the ledger (`screens-baseline.json`) as a count per file and rule. A count
 * above the ledger fails; a count below it also fails until `--write` shrinks the ledger, so the ledger only shrinks.
 *
 * - There is no way to grow the ledger. `--write` lowers counts and drops empty entries, nothing else.
 * - Only values that are written in count. `rounded-full`, `shadow-none` and values read from a token
 *   (`rounded-[var(--…)]`) pass: blocking them would make people turn the check off.
 * - Comments are not scanned. A comment that explains a rule must not count as breaking it.
 *
 * This file belongs to tyohnn (its hash is in tyohnn.json); setup replaces it. What differs per repository lives in
 * `screen-rules.config.json` next to tyohnn.json.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const CONFIG_FILE = "screen-rules.config.json";

/** What a repository gets when its config leaves a field out */
export const DEFAULTS = {
    include: ["apps/*/src/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
    exclude: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/*.d.ts", "**/node_modules/**", "src/ui/components/**", "src/ui/systems/**", "packages/ui/src/components/**", "packages/ui/src/systems/**"],
    baseline: "screens-baseline.json",
    iconsModule: "the icons module",
    allow: {},
    headlessParts: [],
};

/** `**`, `*` and `{a,b}` globs, matched against a path relative to the repository root */
export const globToRegExp = (glob) =>
{
    let out = "";

    for (let i = 0; i < glob.length; i++)
    {
        const char = glob[i];

        if (char === "*" && glob[i + 1] === "*")
        {
            out += glob[i + 2] === "/" ? "(?:.*/)?" : ".*";
            i += glob[i + 2] === "/" ? 2 : 1;
        }
        else if (char === "*")
        {
            out += "[^/]*";
        }
        else if (char === "{")
        {
            const end = glob.indexOf("}", i);
            out += `(?:${glob.slice(i + 1, end).split(",").map((part) => part.replace(/[.+^$()|[\]\\]/g, "\\$&")).join("|")})`;
            i = end;
        }
        else
        {
            out += char.replace(/[.+^$()|[\]\\?]/g, "\\$&");
        }
    }

    return new RegExp(`^${out}$`);
};

/** One Tailwind class: after a variant prefix (`hover:`, `md:`) or `!`, up to the next separator */
const START = String.raw`(?<=^|[\s"'\`:!{(\[,])`;
const END = String.raw`(?=$|[\s"'\`)}\],])`;
const cls = (body) => new RegExp(`${START}-?(?:${body})${END}`, "g");

const PALETTE = "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black";
const COLOR_UTIL = "bg|text|border(?:-[trblxyse])?|ring|ring-offset|fill|stroke|from|to|via|outline|divide|decoration|accent|caret|placeholder";

const rulesFor = (config) => [
    {
        id: "rounded",
        pattern: cls(String.raw`rounded(?:-[a-z0-9]+)*(?:-\[[^\]\s]+\])?`),
        // A circle, no radius, or a token read are not written values
        keep: (match) => !/^-?rounded(?:-[trblse]{1,2})?-(?:full|none|\[var\(--[^\]]+\])$/.test(match),
        why: "radii come from each part's token (field, card and popover, dialog and sheet); a radius written on a screen stays behind when the system changes",
        instead: "keep the part's own radius, or read a token with `rounded-[var(--…)]`",
    },
    {
        id: "shadow",
        pattern: cls(String.raw`shadow(?:-[a-z0-9]+)*(?:-\[[^\]\s]+\])?`),
        keep: (match) => !/^-?shadow-(?:none|\[var\(--[^\]]+\])$/.test(match),
        why: "shadows belong to surfaces (card, popover, dialog), which read them from tokens",
        instead: "use Card, Popover or Dialog where a surface needs to lift",
    },
    {
        id: "color",
        pattern: new RegExp(`${START}-?(?:(?:${COLOR_UTIL})-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?|(?:${COLOR_UTIL})-\\[(?:color:)?(?:#|rgba?\\(|hsla?\\(|oklch\\()[^\\]\\s]*\\])${END}`, "g"),
        why: "a palette or literal colour does not follow dark mode or a system change",
        instead: "semantic names (`bg-muted`, `text-muted-foreground`, `text-destructive`, `border-border`) or a part's tone",
    },
    {
        id: "style-color",
        pattern: /\b(?:color|background(?:Color)?|border(?:[A-Z][a-z]+)*Color|fill|stroke)\s*:\s*["'`](?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()/g,
        why: "a colour in a style object does not follow dark mode or a system change",
        instead: "a semantic class, or `var(--…)` when the value has to go through style",
    },
    {
        id: "text-size",
        pattern: cls(String.raw`text-(?:xs|sm|base|lg|[2-9]?xl|\[\d[^\]\s]*\])`),
        why: "type sizes come from the part or the system's type scale; a size written on a screen does not follow it",
        instead: "the part's `size`, a heading part, or a type token from the system",
    },
    {
        id: "px",
        pattern: cls(String.raw`[a-z][a-z-]*-\[[^\]\s]*\d(?:\.\d+)?px[^\]\s]*\]`),
        // The fallback in `var(--x, 0px)` only applies when the token is missing
        keep: (match) => /\d(?:\.\d+)?px/.test(match.replace(/var\([^()]*\)/g, "")),
        why: "a pixel size written on a screen does not follow density or type size",
        instead: "spacing steps (`gap-3`, `w-80`), a part's `size`, or a product variable for product dimensions",
    },
    {
        id: "z-index",
        pattern: cls(String.raw`z-(?:\d+|\[[^\]\s]+\])`),
        why: "parts decide how popups stack; a number written on a screen hides a menu behind the sheet it opened from",
        instead: "Dialog, Sheet, Popover or Menu, with their stacking left alone",
    },
    {
        id: "space",
        pattern: cls(String.raw`space-[xy]-(?:\d+(?:\.\d+)?|px|reverse|\[[^\]\s]+\])`),
        why: "space-* breaks around hidden children and wrapped rows",
        instead: "`flex gap-*` or `grid gap-*`",
    },
    {
        id: "svg",
        pattern: /<svg[\s>]/g,
        why: "an SVG drawn on a screen sits outside the icon set",
        instead: `a semantic name from ${config.iconsModule}; a third-party logo goes in a brand-mark block listed under \`allow.svg\``,
    },
    ...(config.headlessParts.length === 0 ? [] : [{
        id: "lib-slot",
        pattern: new RegExp(String.raw`<(?:${config.headlessParts.join("|")})\b(?:[^<>]|=>)*?\sdata-slot=`, "g"),
        why: "UI SDK writes data-slot itself, so a name a screen gives there disappears without an error",
        instead: "give screen names on an attribute UI SDK does not use (`data-panel`)",
    }]),
    {
        id: "icon-lib",
        pattern: /from\s+["'](?:lucide-react|@hugeicons\/[^"']+|@phosphor-icons\/[^"']+|@tabler\/icons-react|@remixicon\/[^"']+|react-icons[^"']*)["']/g,
        why: "icons are chosen by meaning; importing a library directly mixes pictures for the same meaning and ties every screen to the library",
        instead: `import the semantic name from ${config.iconsModule}; ask for a new name when the meaning is missing`,
    },
];

/** Comments are blanked out, keeping line numbers */
const stripComments = (text) =>
    text
        .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
        .split("\n")
        .map((line) => (/^\s*\/\//.test(line) ? "" : line.replace(/\s\/\/\s.*$/, "")))
        .join("\n");

/**
 * The check for one repository's config. Everything the script and the hook need is pure and comes from here.
 *
 * @param {Partial<typeof DEFAULTS>} input the repository's `screen-rules.config.json`
 */
export const createChecker = (input = {}) =>
{
    const config = { ...DEFAULTS, ...input, allow: { ...DEFAULTS.allow, ...input.allow } };
    const include = config.include.map(globToRegExp);
    const exclude = config.exclude.map(globToRegExp);
    const allow = Object.fromEntries(Object.entries(config.allow).map(([id, globs]) => [id, globs.map(globToRegExp)]));
    const rules = rulesFor(config);
    const byId = new Map(rules.map((rule) => [rule.id, rule]));

    const inScope = (path) => include.some((glob) => glob.test(path)) && !exclude.some((glob) => glob.test(path));

    /** @returns {Record<string, { count: number, samples: Array<{ line: number, match: string }> }>} */
    const scan = (path, text) =>
    {
        const body = stripComments(text);
        const found = {};

        for (const rule of rules)
        {
            if ((allow[rule.id] ?? []).some((glob) => glob.test(path)))
            {
                continue;
            }

            const matches = [...body.matchAll(rule.pattern)].filter((match) => rule.keep?.(match[0]) ?? true);

            if (matches.length > 0)
            {
                found[rule.id] = {
                    count: matches.length,
                    samples: matches.slice(0, 3).map((match) => ({ line: body.slice(0, match.index).split("\n").length, match: match[0] })),
                };
            }
        }

        return found;
    };

    const describeRule = (id) =>
    {
        const rule = byId.get(id);

        return rule === undefined ? id : `${id}: ${rule.why}. Instead: ${rule.instead}`;
    };

    /** Sentences for a person; empty means it passes */
    const judge = (found, baseline) =>
    {
        const problems = [];

        for (const path of [...new Set([...found.keys(), ...Object.keys(baseline)])].sort())
        {
            const now = found.get(path) ?? {};
            const allowed = baseline[path] ?? {};

            for (const id of new Set([...Object.keys(now), ...Object.keys(allowed)]))
            {
                const count = now[id]?.count ?? 0;
                const limit = allowed[id] ?? 0;

                if (count > limit)
                {
                    const where = (now[id]?.samples ?? []).map((sample) => `line ${sample.line} \`${sample.match}\``).join(", ");
                    problems.push(`${path}: ${count} × ${id}, over the ledger's ${limit} (${where}).\n    ${describeRule(id)}`);
                }
                else if (count < limit)
                {
                    problems.push(`${path}: ${id} fell from ${limit} to ${count}. Run with --write to shrink the ledger`);
                }
            }
        }

        return problems;
    };

    /** The ledger after fixes: counts only go down, new entries are never written */
    const shrink = (found, baseline) =>
    {
        const next = {};

        for (const [path, allowed] of Object.entries(baseline).sort(([a], [b]) => a.localeCompare(b)))
        {
            const now = found.get(path) ?? {};
            const kept = Object.fromEntries(
                Object.entries(allowed)
                    .map(([id, limit]) => [id, Math.min(limit, now[id]?.count ?? 0)])
                    .filter(([, limit]) => limit > 0),
            );

            if (Object.keys(kept).length > 0)
            {
                next[path] = kept;
            }
        }

        return next;
    };

    /** The first ledger: every count as it stands today */
    const record = (found) =>
        Object.fromEntries([...found.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([path, rules]) =>
            [path, Object.fromEntries(Object.entries(rules).map(([id, { count }]) => [id, count]))]));

    return { config, rules, inScope, scan, describeRule, judge, shrink, record };
};

/** The folder that holds `screen-rules.config.json`, looking up from `from` */
export const findRoot = (from) =>
{
    let dir = resolve(from);

    while (!existsSync(join(dir, CONFIG_FILE)))
    {
        const parent = dirname(dir);

        if (parent === dir)
        {
            throw new Error(`${CONFIG_FILE} not found above ${from}`);
        }

        dir = parent;
    }

    return dir;
};

/** The checker, the root and the ledger path for the repository this file sits in */
export const load = (from = dirname(fileURLToPath(import.meta.url))) =>
{
    const root = findRoot(from);
    const checker = createChecker(JSON.parse(readFileSync(join(root, CONFIG_FILE), "utf8")));
    const ledger = join(root, checker.config.baseline);
    const readBaseline = () => (existsSync(ledger) ? JSON.parse(readFileSync(ledger, "utf8")) : {});

    return { ...checker, root, ledger, readBaseline };
};

const main = () =>
{
    const { root, ledger, inScope, scan, judge, shrink, record, readBaseline } = load();

    // Tracked files and new ones git does not ignore
    const files = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" })
        .split("\0")
        .filter((path) => path !== "" && inScope(path));

    const found = new Map();

    for (const path of files)
    {
        if (!existsSync(join(root, path)))
        {
            continue;
        }

        const result = scan(path, readFileSync(join(root, path), "utf8"));

        if (Object.keys(result).length > 0)
        {
            found.set(path, result);
        }
    }

    const write = (value) => writeFileSync(ledger, `${JSON.stringify(value, null, 4)}\n`);

    if (process.argv.includes("--init"))
    {
        if (existsSync(ledger))
        {
            console.error("check:screens: the ledger already exists. --init only writes the first one; use --write to shrink it.");
            process.exit(1);
        }

        write(record(found));
        console.log(`check:screens: wrote the first ledger (${found.size} files).`);

        return;
    }

    const baseline = readBaseline();

    if (process.argv.includes("--write"))
    {
        write(shrink(found, baseline));
        console.log("check:screens: shrank the ledger.");

        return;
    }

    const problems = judge(found, baseline);

    if (problems.length > 0)
    {
        console.error(`check:screens failed: ${problems.length}\n`);
        problems.forEach((problem) => console.error(`  ${problem}`));
        process.exit(1);
    }

    const total = Object.values(baseline).reduce((sum, rules) => sum + Object.values(rules).reduce((a, b) => a + b, 0), 0);
    console.log(`check:screens passed (${total} violations left in the ledger across ${Object.keys(baseline).length} files)`);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
{
    main();
}

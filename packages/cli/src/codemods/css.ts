// The app's entry CSS. Two managed blocks, the rest stays the user's:
//
//   system   at the top: tailwindcss → (Vite) font CSS → layer 1 → layer 2 → typeset → layer 3 in layer(base)
//   theme    after the file's last @import: @source lines and the font stacks
//
// `@import` must precede other rules, so the first block holds only imports and the second goes after any imports the
// user keeps below the first. A standalone `@import "tailwindcss";` outside the blocks is removed (the block has it).

import { findBlock, renderBlock, replaceBlock } from "../lib/markers.js";

const TAILWIND_IMPORT = /^[ \t]*@import\s+(["'])tailwindcss\1\s*;[ \t]*(?:\r?\n)?/gm;

/** Blanks comments and string contents while keeping offsets */
const blankComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));

const outsideBlocks = (css: string, transform: (part: string) => string): string =>
{
    const ranges = ["system", "theme"].map((name) => findBlock(css, "css", name)).filter((block): block is NonNullable<typeof block> => Boolean(block)).sort((a, b) => a.start - b.start);
    let result = "";
    let cursor = 0;

    for (const range of ranges)
    {
        result += transform(css.slice(cursor, range.start)) + range.text;
        cursor = range.end;
    }

    return result + transform(css.slice(cursor));
};

/** End offset of the last top-level `@import …;` statement, or -1 */
export const lastImportEnd = (css: string): number =>
{
    const clean = blankComments(css);
    let end = -1;

    for (const match of clean.matchAll(/@import\s[^;]*;/g)) end = match.index! + match[0].length;

    return end;
};

export interface EntryCssBlocks
{
    system: string;
    theme: string;
}

export const applyEntryCss = (content: string, blocks: EntryCssBlocks): string =>
{
    let css = outsideBlocks(content, (part) => part.replace(TAILWIND_IMPORT, ""));

    css = replaceBlock(css, "css", "system", blocks.system) ?? (() =>
    {
        const charset = css.match(/^@charset\s[^;]*;\s*\n?/)?.[0] ?? "";
        const rest = css.slice(charset.length).replace(/^\s*\n/, "");

        return `${charset}${renderBlock("css", "system", blocks.system)}\n${rest.trim() ? `\n${rest}` : ""}`;
    })();

    css = replaceBlock(css, "css", "theme", blocks.theme) ?? (() =>
    {
        const end = lastImportEnd(css);
        const systemEnd = findBlock(css, "css", "system")!.end;
        const at = Math.max(end, systemEnd);
        const before = css.slice(0, at);
        const after = css.slice(at).replace(/^[ \t]*\r?\n?/, "");

        return `${before}\n\n${renderBlock("css", "theme", blocks.theme)}\n${after.trim() ? `\n${after.replace(/^\s*\n/, "")}` : ""}`;
    })();

    return css.endsWith("\n") ? css : `${css}\n`;
};

export interface CssImport
{
    specifier: string;
    layer: string | null;
    index: number;
}

/** Top-level @import statements (comments ignored) */
export const readCssImports = (css: string): CssImport[] =>
    [...blankComments(css).matchAll(/@import\s+(?:url\()?["']([^"']+)["']\)?\s*([^;]*);/g)].map((match) => ({
        specifier: match[1],
        layer: match[2].match(/layer\(([^)]*)\)/)?.[1] ?? null,
        index: match.index!,
    }));

export const readCssSources = (css: string): { path: string; not: boolean }[] =>
    [...blankComments(css).matchAll(/@source\s+(not\s+)?["']([^"']+)["']/g)].map((match) => ({ path: match[2], not: Boolean(match[1]) }));

/** Custom properties declared outside the tyohnn blocks (to warn when they shadow the system's tokens) */
export const userCustomProperties = (css: string): string[] =>
{
    const names = new Set<string>();

    outsideBlocks(css, (part) =>
    {
        for (const match of blankComments(part).matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) names.add(match[1]);

        return part;
    });

    return [...names];
};

/** Comments and string contents blanked, offsets kept: braces and semicolons in them no longer count */
const blankForScan = (css: string) =>
    blankComments(css).replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, (quoted) => `${quoted[0]}${" ".repeat(quoted.length - 2)}${quoted[0]}`);

/** Whitespace-insensitive form, for comparing a rule with the system's copy of it */
const normalize = (css: string) => css.replace(/\s+/g, " ").replace(/\s*([{};:,()>])\s*/g, "$1").replace(/;}/g, "}").trim();

interface Statement
{
    start: number;
    end: number;
    /** What comes before the block or the semicolon, comments blanked and whitespace collapsed */
    prelude: string;
    body: { start: number; end: number } | null;
}

/** The statements at one nesting level of css[from, to): rules and at-rules with a block, and at-rules ending in `;` */
const statements = (css: string, from = 0, to = css.length): Statement[] =>
{
    const scan = blankForScan(css);
    const found: Statement[] = [];
    let i = from;

    while (i < to)
    {
        while (i < to && /\s/.test(scan[i])) i++;
        if (i >= to) break;

        const start = i;
        let parens = 0;
        let j = i;

        for (; j < to; j++)
        {
            const c = scan[j];

            if (c === "(") parens++;
            else if (c === ")") parens--;
            else if (parens === 0 && (c === "{" || c === ";" || c === "}")) break;
        }

        if (j >= to)
        {
            // The last declaration of a block may go without its semicolon.
            found.push({ start, end: to, prelude: scan.slice(start, to).replace(/\s+/g, " ").trim(), body: null });
            break;
        }

        if (scan[j] === "}")
        {
            i = j + 1;
            continue;
        }

        const prelude = scan.slice(start, j).replace(/\s+/g, " ").trim();

        if (scan[j] === ";")
        {
            found.push({ start, end: j + 1, prelude, body: null });
            i = j + 1;
            continue;
        }

        let depth = 0;
        let k = j;

        for (; k < to; k++)
        {
            if (scan[k] === "{") depth++;
            else if (scan[k] === "}" && --depth === 0) break;
        }

        found.push({ start, end: Math.min(k + 1, to), prelude, body: { start: j + 1, end: Math.min(k, to) } });
        i = k + 1;
    }

    return found;
};

/** Cuts ranges out of css, each with the rest of its line when nothing else is on it */
const cut = (css: string, ranges: { start: number; end: number; replace?: string }[]) =>
{
    let out = css;

    for (const range of [...ranges].sort((a, b) => b.start - a.start))
    {
        const end = range.replace === undefined ? range.end + (out.slice(range.end).match(/^[ \t]*\r?\n/)?.[0].length ?? 0) : range.end;

        out = out.slice(0, range.start) + (range.replace ?? "") + out.slice(end);
    }

    return out;
};

export interface SystemDefaults
{
    /** Every custom property the system declares in layers 1 and 2 */
    tokens: Set<string>;
    /** The system's globals.css: its @custom-variant lines and @layer base rules */
    globals: string;
}

/**
 * Takes out of the entry CSS (outside the tyohnn blocks) what shadcn's CLI wrote there and the system already sets:
 * declarations of the system's tokens in `:root`, `.dark` and `@theme` blocks (shadcn's default colours, radius and
 * Tailwind mappings, which would override the system's), and `@custom-variant` lines and `@layer base` rules identical
 * to the system's own. Anything else stays, including declarations of names the system does not have.
 * Returns what was taken out, per place, so the command can say so.
 */
export const removeSystemDefaults = (css: string, system: SystemDefaults): { css: string; removed: Record<string, number> } =>
{
    const systemScan = blankForScan(system.globals);
    const systemTop = statements(system.globals);
    const systemVariants = new Set(systemTop.filter((s) => s.prelude.startsWith("@custom-variant") && !s.body).map((s) => normalize(systemScan.slice(s.start, s.end))));
    const systemBase = new Set(systemTop.filter((s) => s.prelude === "@layer base" && s.body).flatMap((layer) =>
        statements(system.globals, layer.body!.start, layer.body!.end).map((rule) => normalize(systemScan.slice(rule.start, rule.end)))));
    const removed: Record<string, number> = {};
    const count = (place: string, n = 1) => { removed[place] = (removed[place] ?? 0) + n; };

    const out = outsideBlocks(css, (part) =>
    {
        const scan = blankForScan(part);
        const ranges: { start: number; end: number; replace?: string }[] = [];

        for (const statement of statements(part))
        {
            const { prelude, body } = statement;

            if (!body)
            {
                if (prelude.startsWith("@custom-variant") && systemVariants.has(normalize(scan.slice(statement.start, statement.end))))
                {
                    ranges.push(statement);
                    count("@custom-variant");
                }

                continue;
            }

            if (prelude === ":root" || prelude === ".dark" || /^@theme\b/.test(prelude))
            {
                const declarations = statements(part, body.start, body.end);
                const shadowing = declarations.filter((d) => !d.body && systemHasToken(d.prelude, system.tokens));

                if (shadowing.length === 0) continue;

                count(prelude.startsWith("@theme") ? "@theme" : prelude, shadowing.length);
                ranges.push(...(shadowing.length === declarations.length ? [statement] : shadowing.map((d) => ({ start: lineStart(part, d.start), end: d.end }))));

                continue;
            }

            if (prelude === "@layer base")
            {
                const rules = statements(part, body.start, body.end);
                const same = rules.filter((rule) => systemBase.has(normalize(scan.slice(rule.start, rule.end))));

                if (same.length === 0) continue;

                count("@layer base", same.length);
                ranges.push(...(same.length === rules.length ? [statement] : same.map((rule) => ({ start: lineStart(part, rule.start), end: rule.end }))));
            }
        }

        return ranges.length ? cut(part, ranges).replace(/\n{3,}/g, "\n\n") : part;
    });

    return { css: out, removed };
};

/** `--name: value` whose name the system declares */
const systemHasToken = (declaration: string, tokens: Set<string>) =>
{
    const name = declaration.match(/^(--[A-Za-z0-9_-]+)\s*:/)?.[1];

    return Boolean(name && tokens.has(name));
};

/** The start of the line `at` is on when only indentation precedes it, else `at` */
const lineStart = (css: string, at: number) =>
{
    const before = css.lastIndexOf("\n", at - 1) + 1;

    return /^[ \t]*$/.test(css.slice(before, at)) ? before : at;
};

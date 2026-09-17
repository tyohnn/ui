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

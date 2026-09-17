// tsconfig.json edits that keep comments and formatting (JSONC). Only compilerOptions.paths entries change.

import { dirname, join, resolve } from "node:path";

import { applyEdits, modify, parse, type ParseError } from "jsonc-parser";

import { detectIndent, exists, read, relSpecifier } from "../lib/fs.js";
import { CliError } from "../lib/log.js";

export interface TsconfigData
{
    extends?: string | string[];
    compilerOptions?: { paths?: Record<string, string[]>; baseUrl?: string };
    references?: { path: string }[];
    include?: string[];
    files?: string[];
}

export const parseTsconfig = (text: string, file = "tsconfig.json"): TsconfigData =>
{
    const errors: ParseError[] = [];
    const data = parse(text, errors, { allowTrailingComma: true }) as TsconfigData;

    if (errors.length) throw new CliError(`${file} could not be parsed (${errors.length} JSON error(s))`, "Fix the file, then run the command again.");

    return data ?? {};
};

/** `paths` as the compiler sees it, following relative `extends` (the nearest file that sets paths wins) */
export const effectivePaths = (file: string, seen = new Set<string>()): { paths: Record<string, string[]>; from: string } | null =>
{
    if (seen.has(file) || !exists(file)) return null;
    seen.add(file);

    const data = parseTsconfig(read(file), file);

    if (data.compilerOptions?.paths) return { paths: data.compilerOptions.paths, from: file };

    for (const base of [data.extends ?? []].flat().reverse())
    {
        if (!base.startsWith(".")) continue;

        const target = resolve(dirname(file), base.endsWith(".json") ? base : `${base}.json`);
        const found = effectivePaths(target, seen);

        if (found) return found;
    }

    return null;
};

/**
 * Sets (or with `undefined`, removes) `compilerOptions.paths` entries. When the file sets no paths of its own but
 * inherits some through `extends`, those are copied in first: a `paths` key replaces the inherited one entirely.
 * `inherited` paths are relative to the file that declared them and are rebased onto this file.
 */
export const setPaths = (text: string, entries: Record<string, string[] | undefined>, inherited?: { paths: Record<string, string[]>; fromDir: string; toDir: string }): string =>
{
    const data = parseTsconfig(text);
    const indent = detectIndent(text);
    const options = { formattingOptions: { insertSpaces: true, tabSize: indent, eol: "\n" } };
    let result = text;

    if (!data.compilerOptions?.paths && inherited && Object.keys(inherited.paths).length)
    {
        const rebase = (path: string) => relSpecifier(inherited.toDir, join(inherited.fromDir, path));

        const copied = Object.fromEntries(Object.entries(inherited.paths).map(([key, values]) => [key, values.map(rebase)]));

        result = applyEdits(result, modify(result, ["compilerOptions", "paths"], copied, options));
    }

    for (const [key, value] of Object.entries(entries))
    {
        const current = parseTsconfig(result).compilerOptions?.paths?.[key];

        if (JSON.stringify(current) === JSON.stringify(value)) continue;

        result = applyEdits(result, modify(result, ["compilerOptions", "paths", key], value, options));
    }

    return result;
};

/** The alias prefix that maps to a directory (e.g. "@" for "@/*": ["./src/*"]), or null */
export const aliasFor = (paths: Record<string, string[]> | undefined, tsconfigDir: string, dir: string): string | null =>
{
    for (const [key, values] of Object.entries(paths ?? {}))
    {
        if (!key.endsWith("/*")) continue;

        if (values.some((value) => value.endsWith("/*") && resolve(tsconfigDir, value.slice(0, -2)) === resolve(dir))) return key.slice(0, -2);
    }

    return null;
};

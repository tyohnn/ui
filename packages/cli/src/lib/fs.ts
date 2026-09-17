// File helpers. Paths in records and messages are POSIX and relative to the project root.

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

export const posix = (path: string): string => path.split(sep).join("/");

export const exists = (path: string): boolean => existsSync(path);

export const read = (file: string): string => readFileSync(file, "utf8");

export const readIfExists = (file: string): string | null => (existsSync(file) ? readFileSync(file, "utf8") : null);

export const readJson = <T = any>(file: string): T | null => (existsSync(file) ? (JSON.parse(read(file)) as T) : null);

/** Writes only when the content differs; returns whether the file changed */
export const writeFile = (file: string, content: string): boolean =>
{
    if (existsSync(file) && readFileSync(file, "utf8") === content) return false;

    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);

    return true;
};

export const jsonText = (data: unknown, indent = 4): string => `${JSON.stringify(data, null, indent)}\n`;

export const removeFile = (file: string): boolean =>
{
    if (!existsSync(file)) return false;

    rmSync(file, { force: true });

    return true;
};

/** Removes empty directories from `dir` upwards, stopping at `stop` */
export const pruneEmptyDirs = (dir: string, stop: string): void =>
{
    let current = dir;

    while (current.startsWith(stop) && current !== stop && existsSync(current) && readdirSync(current).length === 0)
    {
        rmSync(current, { recursive: true, force: true });
        current = dirname(current);
    }
};

export const hash = (content: string): string => `sha256-${createHash("sha256").update(content).digest("hex").slice(0, 16)}`;

/** Every file under root (absolute paths), sorted */
export const walk = (root: string): string[] =>
    existsSync(root)
        ? readdirSync(root, { withFileTypes: true })
            .flatMap((entry) => (entry.isDirectory() ? walk(join(root, entry.name)) : [join(root, entry.name)]))
            .sort()
        : [];

/** A relative specifier from a directory to a file, always starting with "." */
export const relSpecifier = (fromDir: string, file: string): string =>
{
    const path = posix(relative(fromDir, file));

    return path.startsWith(".") ? path : `./${path}`;
};

export const rel = (root: string, file: string): string => posix(relative(root, file)) || ".";

export const sortKeys = <T>(object: Record<string, T> | undefined): Record<string, T> =>
    Object.fromEntries(Object.entries(object ?? {}).sort(([a], [b]) => a.localeCompare(b)));

/** Detects the indentation a JSON or source file already uses (default four spaces) */
export const detectIndent = (content: string | null, fallback = 4): number =>
{
    const match = content?.match(/^( +)\S/m);

    return match ? match[1].length : fallback;
};

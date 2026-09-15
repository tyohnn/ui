// File, JSON, hashing and managed-block helpers. No dependencies.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

export const posix = (path) => path.split(sep).join("/");

export const read = (file) => readFileSync(file, "utf8");

export const readJson = (file, fallback) => (existsSync(file) ? JSON.parse(read(file)) : fallback);

export const writeFile = (file, content) =>
{
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
};

export const writeJson = (file, data) => writeFile(file, `${JSON.stringify(data, null, 4)}\n`);

export const hash = (content) => `sha256-${createHash("sha256").update(content).digest("hex").slice(0, 16)}`;

/** Every file under root (absolute paths), sorted */
export const walk = (root) =>
    existsSync(root)
        ? readdirSync(root, { withFileTypes: true })
            .flatMap((entry) => (entry.isDirectory() ? walk(join(root, entry.name)) : [join(root, entry.name)]))
            .sort()
        : [];

/** A relative specifier from a directory to a file, always starting with "." */
export const relPath = (fromDir, file) =>
{
    const path = posix(relative(fromDir, file));

    return path.startsWith(".") ? path : `./${path}`;
};

export const sortKeys = (object) => Object.fromEntries(Object.entries(object ?? {}).sort(([a], [b]) => a.localeCompare(b)));

export const git = (cwd, args) =>
{
    try
    {
        return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    }
    catch
    {
        return null;
    }
};

/**
 * Managed blocks: the parts of a user-owned file the CLI rewrites. Everything outside them is the user's.
 *   CSS  /* tyohnn:begin <name> *\/ … /* tyohnn:end <name> *\/
 *   TS   // tyohnn:begin <name> … // tyohnn:end <name>
 */
const MARKERS = {
    css: (name) => [`/* tyohnn:begin ${name} */`, `/* tyohnn:end ${name} */`],
    ts: (name) => [`// tyohnn:begin ${name}`, `// tyohnn:end ${name}`],
};

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const blockPattern = (style, name) =>
{
    const [begin, end] = MARKERS[style](name);

    return new RegExp(`${escape(begin)}[\\s\\S]*?${escape(end)}`);
};

export const renderBlock = (style, name, body) =>
{
    const [begin, end] = MARKERS[style](name);

    return `${begin}\n${body.trimEnd()}\n${end}`;
};

export const hasBlock = (content, style, name) => blockPattern(style, name).test(content);

export const readBlock = (content, style, name) => content.match(blockPattern(style, name))?.[0] ?? null;

/** Replaces the named block, or inserts it at the top (after a leading "use client"-style directive) */
export const upsertBlock = (content, style, name, body) =>
{
    const rendered = renderBlock(style, name, body);

    if (hasBlock(content, style, name)) return content.replace(blockPattern(style, name), () => rendered);

    return content.trim() === "" ? `${rendered}\n` : `${rendered}\n\n${content}`;
};

/** Collects written files per top-level area so the report stays short */
export const createLog = (target) =>
{
    const written = new Map();
    const notes = [];

    return {
        wrote: (file) =>
        {
            const path = posix(relative(target, file));
            const area = path.split("/").slice(0, path.startsWith("packages/") || path.startsWith("apps/") ? 4 : 1).join("/");

            written.set(area, (written.get(area) ?? 0) + 1);
        },
        note: (message) => notes.push(message),
        print: () =>
        {
            for (const [area, count] of [...written].sort(([a], [b]) => a.localeCompare(b)))
            {
                console.log(`  wrote ${String(count).padStart(3)}  ${area}`);
            }

            notes.forEach((message) => console.log(`  note   ${message}`));
        },
    };
};

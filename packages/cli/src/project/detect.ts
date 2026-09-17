// What kind of project the CLI is running in, and which package manager it uses.

import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { exists, read, readJson, rel } from "../lib/fs.js";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type Framework = "next" | "vite";
export type ProjectKind = "monorepo" | Framework;

export interface PackageJson
{
    name?: string;
    workspaces?: string[] | { packages?: string[] };
    packageManager?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
    [key: string]: unknown;
}

export interface Project
{
    root: string;
    kind: ProjectKind;
    packageManager: PackageManager;
    /** Workspace globs (monorepo) */
    workspaces: string[];
    turbo: boolean;
}

const LOCKFILES: [string, PackageManager][] = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["package-lock.json", "npm"],
];

export const detectPackageManager = (root: string): PackageManager =>
{
    const declared = readJson<PackageJson>(join(root, "package.json"))?.packageManager?.split("@")[0];

    if (declared === "npm" || declared === "pnpm" || declared === "yarn" || declared === "bun") return declared;

    return LOCKFILES.find(([file]) => existsSync(join(root, file)))?.[1] ?? "npm";
};

/** `packages:` entries of pnpm-workspace.yaml (the simple list form) */
const pnpmWorkspaces = (root: string): string[] =>
{
    const file = join(root, "pnpm-workspace.yaml");

    if (!exists(file)) return [];

    const lines = read(file).split("\n");
    const start = lines.findIndex((line) => /^packages\s*:/.test(line));

    if (start === -1) return [];

    const globs: string[] = [];

    for (const line of lines.slice(start + 1))
    {
        const match = line.match(/^\s+-\s*["']?([^"'#]+?)["']?\s*(#.*)?$/);

        if (match) globs.push(match[1].trim());
        else if (/^\S/.test(line)) break;
    }

    return globs;
};

export const workspaceGlobs = (root: string): string[] =>
{
    const pkg = readJson<PackageJson>(join(root, "package.json"));
    const declared = Array.isArray(pkg?.workspaces) ? pkg.workspaces : pkg?.workspaces?.packages ?? [];

    return [...declared, ...pnpmWorkspaces(root)];
};

export const frameworkOf = (pkg: PackageJson | null): Framework | null =>
{
    const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };

    if (deps.next) return "next";
    if (deps.vite) return "vite";

    return null;
};

export const detectProject = (root: string): Project | null =>
{
    const pkg = readJson<PackageJson>(join(root, "package.json"));

    if (!pkg) return null;

    const workspaces = workspaceGlobs(root);
    const packageManager = detectPackageManager(root);
    const turbo = exists(join(root, "turbo.json"));

    if (workspaces.length) return { root, kind: "monorepo", packageManager, workspaces, turbo };

    const framework = frameworkOf(pkg);

    return framework ? { root, kind: framework, packageManager, workspaces: [], turbo } : null;
};

/** Workspace package folders (relative), for globs of the form `dir/*` or `dir` */
export const workspaceDirs = (root: string, globs: string[]): string[] =>
    [...new Set(globs.flatMap((glob) =>
    {
        const clean = glob.replace(/^\.\//, "").replace(/\/$/, "");

        if (clean.startsWith("!")) return [];

        if (clean.endsWith("/*") || clean.endsWith("/**"))
        {
            const base = join(root, clean.replace(/\/\*\*?$/, ""));

            return existsSync(base)
                ? readdirSync(base, { withFileTypes: true })
                    .filter((entry) => entry.isDirectory() && existsSync(join(base, entry.name, "package.json")))
                    .map((entry) => rel(root, join(base, entry.name)))
                : [];
        }

        return existsSync(join(root, clean, "package.json")) ? [clean] : [];
    }))].sort();

export const isCoveredByWorkspaces = (globs: string[], path: string): boolean =>
    globs.some((glob) =>
    {
        const clean = glob.replace(/^\.\//, "").replace(/\/$/, "");

        return clean.endsWith("/*") ? dirname(path) === clean.slice(0, -2) : clean === path;
    });

/** Walks up from `start` to the nearest folder containing `file` */
export const findUp = (start: string, file: string): string | null =>
{
    let current = start;

    while (true)
    {
        if (existsSync(join(current, file))) return current;

        const parent = dirname(current);

        if (parent === current) return null;
        current = parent;
    }
};

/** An installed package's folder as seen from `from` (node_modules lookup without following symlinks) */
export const packageDir = (from: string, name: string): string | null =>
{
    let current = from;

    while (true)
    {
        const candidate = join(current, "node_modules", name);

        if (existsSync(join(candidate, "package.json"))) return candidate;

        const parent = dirname(current);

        if (parent === current) return null;
        current = parent;
    }
};

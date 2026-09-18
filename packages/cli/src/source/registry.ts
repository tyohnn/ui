// Reads the registry of one source (a checkout or an extracted tarball).

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { CliError } from "../lib/log.js";

export interface FontsChoice
{
    sans: string;
    heading: string;
    mono: string;
    hangulFallback: string;
}

export interface SystemMeta
{
    name: string;
    description: string;
    /** registry/themes/<id>.json — the colour set the system ships with */
    theme?: string;
    fonts: FontsChoice;
    icons: { library: string };
    defaultMode?: "light" | "dark";
    tags?: string[];
}

export interface FontEntry
{
    id: string;
    family: string;
    category: "sans" | "serif" | "mono" | "display";
    provider: "google" | "local";
    next: { import: string; variable: string };
    fontsource?: { package: string; variable: boolean; css: string; family: string; staticWeights?: number[] };
    npm?: { package: string; css: string; family: string };
    local?: { files: { path: string; weight: number; style: string }[] };
    weights: number[];
    subsets: string[];
    hangul: boolean;
}

export interface Manifest
{
    files: string[];
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
    iconLibraries: Record<string, { file: string; packages: Record<string, string> }>;
}

/** Maintainer-only systems the CLI never lists or installs */
export const HIDDEN_SYSTEMS = ["foundation"];

/** Names a user may pick: every registry/systems folder with a system.json, minus the hidden ones */
export const listableSystems = (names: string[]): string[] => names.filter((name) => !HIDDEN_SYSTEMS.includes(name)).sort();

/** defaultMode, else dark when tagged dark (registry/schema/system.schema.json), else light */
export const resolveDefaultMode = (meta: Pick<SystemMeta, "defaultMode" | "tags">): "light" | "dark" =>
    meta.defaultMode ?? (meta.tags?.includes("dark") ? "dark" : "light");

export class Registry
{
    readonly manifest: Manifest;
    private fontCache: Map<string, FontEntry> | null = null;

    constructor(readonly root: string)
    {
        this.manifest = this.json("registry/ui/manifest.json");
    }

    path(relative: string): string
    {
        return join(this.root, relative);
    }

    has(relative: string): boolean
    {
        return existsSync(this.path(relative));
    }

    read(relative: string): string
    {
        return readFileSync(this.path(relative), "utf8");
    }

    json<T = any>(relative: string): T
    {
        return JSON.parse(this.read(relative)) as T;
    }

    systems(): string[]
    {
        const dir = this.path("registry/systems");

        return listableSystems(existsSync(dir)
            ? readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, "system.json"))).map((entry) => entry.name)
            : []);
    }

    systemDir(name: string): string
    {
        return `registry/systems/${name}`;
    }

    system(name: string): SystemMeta & { mode: "light" | "dark" }
    {
        if (HIDDEN_SYSTEMS.includes(name))
        {
            throw new CliError(`"${name}" is the maintainers' master copy and is not installable`, "Use mira: it carries the same values.");
        }

        if (!/^[a-z0-9-]+$/.test(name) || !this.has(`${this.systemDir(name)}/system.json`))
        {
            throw new CliError(`unknown system "${name}"`, `Known systems: ${this.systems().join(", ")}. Run \`tyohnn list\`.`);
        }

        const meta = this.json<SystemMeta>(`${this.systemDir(name)}/system.json`);

        return { ...meta, name, mode: resolveDefaultMode(meta) };
    }

    fonts(): Map<string, FontEntry>
    {
        if (!this.fontCache)
        {
            const dir = this.path("registry/fonts");

            this.fontCache = new Map(readdirSync(dir)
                .filter((file) => file.endsWith(".json"))
                .sort()
                .map((file) => [file.slice(0, -5), JSON.parse(readFileSync(join(dir, file), "utf8")) as FontEntry]));
        }

        return this.fontCache;
    }

    font(id: string): FontEntry
    {
        const entry = this.fonts().get(id);

        if (!entry) throw new CliError(`unknown font "${id}"`, `Known fonts: ${[...this.fonts().keys()].join(", ")}.`);

        return entry;
    }

    iconLibrary(name: string): { file: string; packages: Record<string, string> }
    {
        const info = this.manifest.iconLibraries[name];

        if (!info) throw new CliError(`unknown icon library "${name}"`, `Known libraries: ${Object.keys(this.manifest.iconLibraries).join(", ")}.`);

        return info;
    }

    /** The range tyohnn itself declares for a package (preview, then registry/ui), or null */
    rangeOf(name: string): string | null
    {
        for (const file of ["apps/preview/package.json", "registry/ui/package.json"])
        {
            if (!this.has(file)) continue;

            const pkg = this.json<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(file);
            const range = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];

            if (range) return range;
        }

        return null;
    }

    /** Files of a system folder that are copied: styles/**, DESIGN.md, system.json (reference/ stays in the registry) */
    systemFiles(name: string): string[]
    {
        const base = this.path(this.systemDir(name));
        const walk = (dir: string, prefix: string): string[] =>
            readdirSync(dir, { withFileTypes: true })
                .flatMap((entry) => entry.isDirectory() ? walk(join(dir, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`]);

        return [
            ...walk(join(base, "styles"), "styles/"),
            ...["DESIGN.md", "system.json"].filter((file) => existsSync(join(base, file))),
        ].sort();
    }

    templateFiles(name: string): string[]
    {
        const base = `apps/preview/src/templates/${name}`;

        if (!this.has(base)) throw new CliError(`unknown example "${name}"`, "Known examples: component-sheet.");

        return readdirSync(this.path(base)).filter((file) => /\.(tsx?|css)$/.test(file)).sort().map((file) => `${base}/${file}`);
    }
}

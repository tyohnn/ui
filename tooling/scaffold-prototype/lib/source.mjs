// Reads the content the CLI copies. For now a local tyohnn checkout (`--source <path>`); later a GitHub
// tarball at `--ref`, unpacked into the same shape.

import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { git, read, readJson } from "./util.mjs";

export const openSource = (path) =>
{
    const root = resolve(path);
    const registry = join(root, "registry");

    if (!existsSync(join(registry, "ui/manifest.json"))) throw new Error(`--source ${root} is not a tyohnn checkout (no registry/ui/manifest.json)`);

    const manifest = readJson(join(registry, "ui/manifest.json"));

    const systemDir = (name) => (name === "foundation" ? join(registry, "foundation") : join(registry, "systems", name));

    /** system.json (foundation.json for the foundation stand-in), with defaultMode filled in */
    const systemMeta = (name) =>
    {
        const file = join(systemDir(name), name === "foundation" ? "foundation.json" : "system.json");

        if (!existsSync(file)) throw new Error(`Unknown system "${name}" (no ${file})`);

        const meta = readJson(file);
        const defaultMode = meta.defaultMode ?? (meta.tags?.includes("dark") ? "dark" : "light");

        return { ...meta, name, defaultMode, defaultModeInferred: !meta.defaultMode };
    };

    const fonts = new Map(readdirSync(join(registry, "fonts"))
        .filter((file) => file.endsWith(".json"))
        .map((file) => [file.slice(0, -".json".length), readJson(join(registry, "fonts", file))]));

    const font = (id) =>
    {
        const entry = fonts.get(id);

        if (!entry) throw new Error(`Unknown font "${id}" (no registry/fonts/${id}.json)`);

        return entry;
    };

    /** The version tyohnn itself installs for a package (its lockfile-resolved install), else the manifest range */
    const versionOf = (name, fallback) =>
    {
        const installed = readJson(join(root, "node_modules", name, "package.json"));

        return installed?.version ?? fallback;
    };

    /** A range a tyohnn package.json declares for a dependency */
    const rangeOf = (name) =>
    {
        for (const file of [join(root, "apps/preview/package.json"), join(registry, "ui/package.json")])
        {
            const pkg = readJson(file, {});
            const range = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];

            if (range) return range;
        }

        return null;
    };

    return {
        root,
        registry,
        manifest,
        systemDir,
        systemMeta,
        font,
        versionOf,
        rangeOf,
        uiFile: (path) => join(registry, "ui", path),
        templateDir: (name) => join(root, "apps/preview/src/templates", name),
        commit: git(root, ["rev-parse", "--short", "HEAD"]),
        dirty: Boolean(git(root, ["status", "--porcelain", "--", "registry", "apps/preview/src/templates"])),
        read,
    };
};

/** Placeholder aliases → the consumer's package: @tyohnn/{components,lib,hooks}/x → <scope>/ui/…/x, @tyohnn/icons → <scope>/ui/icons */
export const rewriteAliases = (content, scope) =>
    content
        .replace(/@tyohnn\/(components|lib|hooks)\//g, `${scope}/ui/$1/`)
        .replace(/@tyohnn\/icons\b/g, `${scope}/ui/icons`);

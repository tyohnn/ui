// Reads the registry layout: where base and themes live, the base layer-3 barrel,
// and the per-file layer-3 overlay of each theme.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const registryRoot = join(repoRoot, "registry");
export const baseRoot = join(registryRoot, "base");
export const themesRoot = join(registryRoot, "themes");

export const baseFiles = {
    colors: join(baseRoot, "styles/globals.css"),
    tokens: join(baseRoot, "styles/tokens.css"),
    typeset: [join(baseRoot, "styles/typeset.css"), join(baseRoot, "styles/typeset-preset.css")],
    barrel: join(baseRoot, "styles/style.css"),
};

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "");

/** `@import "./x.css";` targets of a CSS file, in order, as absolute paths */
export const readImports = (file) =>
    [...stripComments(readFileSync(file, "utf8")).matchAll(/@import\s+["']([^"']+)["']/g)]
        .map((match) => join(dirname(file), match[1]));

/** Theme names in the registry. `base` is always first */
export const listThemes = () => [
    "base",
    ...(existsSync(themesRoot)
        ? readdirSync(themesRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && existsSync(join(themesRoot, entry.name, "theme.json")))
            .map((entry) => entry.name)
            .sort()
        : []),
];

/** Reads the `tyohnn:replaces components/x.css` / `tyohnn:adds` marker from a theme layer-3 file */
const readMarker = (file) =>
{
    const head = /^\s*\/\*([\s\S]*?)\*\//.exec(readFileSync(file, "utf8"));
    const marker = head && /tyohnn:(replaces\s+(\S+)|adds)\b/.exec(head[1]);

    if (!marker)
    {
        throw new Error(`${relative(repoRoot, file)}: the first comment must say "tyohnn:replaces components/<file>.css" or "tyohnn:adds"`);
    }

    return marker[2] ? { kind: "replaces", target: join(baseRoot, "styles", marker[2]) } : { kind: "adds" };
};

/**
 * One theme's own files (not its ancestors). Missing optional files are null.
 * Layer 3: `replaces` maps a base barrel file to the theme file; `style` is the theme barrel that
 * imports the `adds` files.
 */
export const readTheme = (name) =>
{
    if (name === "base")
    {
        return { name, root: baseRoot, extends: null, colors: null, tokens: null, replaces: new Map(), adds: [], style: null };
    }

    const root = join(themesRoot, name);
    const metaFile = join(root, "theme.json");

    if (!existsSync(metaFile))
    {
        throw new Error(`Unknown theme "${name}" (no ${relative(repoRoot, metaFile)})`);
    }

    const meta = JSON.parse(readFileSync(metaFile, "utf8"));
    const optional = (file) => (existsSync(join(root, file)) ? join(root, file) : null);
    const stylesDir = join(root, "styles");
    const layer3 = existsSync(stylesDir)
        ? readdirSync(stylesDir).filter((file) => file.endsWith(".css")).sort().map((file) => join(stylesDir, file))
        : [];
    const replaces = new Map();
    const adds = [];
    const baseBarrel = new Set(readImports(baseFiles.barrel));

    for (const file of layer3)
    {
        const marker = readMarker(file);

        if (marker.kind === "adds")
        {
            adds.push(file);
            continue;
        }

        if (!baseBarrel.has(marker.target))
        {
            throw new Error(`${relative(repoRoot, file)} replaces ${relative(repoRoot, marker.target)}, which is not in the base barrel`);
        }

        replaces.set(marker.target, file);
    }

    const style = optional("style.css");
    const imported = new Set(style ? readImports(style) : []);

    for (const file of adds)
    {
        if (!imported.has(file))
        {
            throw new Error(`${relative(repoRoot, file)} is marked tyohnn:adds but ${name}/style.css does not import it`);
        }
    }

    for (const file of imported)
    {
        if (replaces.has([...replaces.entries()].find(([, own]) => own === file)?.[0]))
        {
            throw new Error(`${name}/style.css imports ${relative(repoRoot, file)}, a replacement; replacements are placed by compose-theme`);
        }
    }

    return {
        name,
        root,
        meta,
        extends: meta.extends ?? "base",
        colors: optional("colors.css"),
        tokens: optional("tokens.css"),
        replaces,
        adds,
        style,
    };
};

/** The chain from base to the theme: [base, …ancestors, theme] */
export const readChain = (name) =>
{
    const chain = [];
    const seen = new Set();
    let current = name;

    while (current)
    {
        if (seen.has(current))
        {
            throw new Error(`Theme inheritance loop at "${current}"`);
        }

        seen.add(current);
        const theme = readTheme(current);

        chain.unshift(theme);
        current = theme.extends;
    }

    return chain;
};

/**
 * The ordered file list of a composed theme.
 *   tailwindcss → base/globals → theme/colors → base/tokens → theme/tokens → typeset →
 *   base layer-3 barrel (theme replacements substituted) → theme layer-3 additions
 * With a longer chain, every overlay step repeats in chain order (nearest theme last).
 */
export const composeOrder = (name) =>
{
    const chain = readChain(name);
    const overlays = chain.slice(1);
    const replaced = new Map();

    for (const theme of overlays)
    {
        for (const [target, file] of theme.replaces)
        {
            replaced.set(target, file);
        }
    }

    return {
        chain: chain.map((theme) => theme.name),
        colors: [baseFiles.colors, ...overlays.map((theme) => theme.colors).filter(Boolean)],
        tokens: [baseFiles.tokens, ...overlays.map((theme) => theme.tokens).filter(Boolean)],
        typeset: baseFiles.typeset,
        rules: readImports(baseFiles.barrel).map((file) => replaced.get(file) ?? file),
        additions: overlays.map((theme) => theme.style).filter(Boolean),
        replaced,
    };
};

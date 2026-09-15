// Reads the registry layout: where foundation and themes live, the foundation layer-3 barrel,
// and the per-file layer-3 overlay of each theme.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const registryRoot = join(repoRoot, "registry");
export const foundationRoot = join(registryRoot, "foundation");
export const themesRoot = join(registryRoot, "themes");

export const foundationFiles = {
    colors: join(foundationRoot, "styles/globals.css"),
    tokens: join(foundationRoot, "styles/tokens.css"),
    typeset: [join(foundationRoot, "styles/typeset.css"), join(foundationRoot, "styles/typeset-preset.css")],
    barrel: join(foundationRoot, "styles/style.css"),
};

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, "");

/** `@import "./x.css";` targets of a CSS file, in order, as absolute paths */
export const readImports = (file) =>
    [...stripComments(readFileSync(file, "utf8")).matchAll(/@import\s+["']([^"']+)["']/g)]
        .map((match) => join(dirname(file), match[1]));

/** Theme names in the registry. `foundation` is always first */
export const listThemes = () => [
    "foundation",
    ...(existsSync(themesRoot)
        ? readdirSync(themesRoot, { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && existsSync(join(themesRoot, entry.name, "theme.json")))
            .map((entry) => entry.name)
            .sort()
        : []),
];

/**
 * Reads the layer-3 marker from the first comment of a theme file:
 *   replaces: foundation/styles/components/<file>.css@sha256:<hex>   (the hash of the foundation file it was forked from)
 *   tyohnn:adds
 */
const readMarker = (file) =>
{
    const head = /^\s*\/\*([\s\S]*?)\*\//.exec(readFileSync(file, "utf8"));
    const replaces = head && /replaces:\s*foundation\/styles\/(\S+?\.css)(?:@sha256:([0-9a-f]{64}))?(?=\s|$)/.exec(head[1]);

    if (replaces)
    {
        return { kind: "replaces", target: join(foundationRoot, "styles", replaces[1]), sha256: replaces[2] ?? null };
    }

    if (head && /\btyohnn:adds\b/.test(head[1]))
    {
        return { kind: "adds" };
    }

    throw new Error(`${relative(repoRoot, file)}: the first comment must say "replaces: foundation/styles/components/<file>.css@sha256:<hash>" or "tyohnn:adds"`);
};

/** sha256 of a file, hex */
export const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

/**
 * One theme's own files (not its ancestors). Missing optional files are null.
 * Layer 3: `replaces` maps a foundation barrel file to the theme file; `style` is the theme barrel that
 * imports the `adds` files.
 */
export const readTheme = (name) =>
{
    if (name === "foundation")
    {
        return { name, root: foundationRoot, extends: null, colors: null, tokens: null, replaces: new Map(), replaceHashes: new Map(), adds: [], style: null };
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
    const replaceHashes = new Map();
    const adds = [];
    const foundationBarrel = new Set(readImports(foundationFiles.barrel));

    for (const file of layer3)
    {
        const marker = readMarker(file);

        if (marker.kind === "adds")
        {
            adds.push(file);
            continue;
        }

        if (!foundationBarrel.has(marker.target))
        {
            throw new Error(`${relative(repoRoot, file)} replaces ${relative(repoRoot, marker.target)}, which is not in the foundation barrel`);
        }

        replaces.set(marker.target, file);
        replaceHashes.set(file, { target: marker.target, sha256: marker.sha256 });
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
        extends: meta.extends ?? "foundation",
        colors: optional("colors.css"),
        tokens: optional("tokens.css"),
        replaces,
        replaceHashes,
        adds,
        style,
    };
};

/** The chain from foundation to the theme: [foundation, …ancestors, theme] */
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
 *   tailwindcss → foundation/globals → theme/colors → foundation/tokens → theme/tokens → typeset →
 *   foundation layer-3 barrel (theme replacements substituted) → theme layer-3 additions
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
        colors: [foundationFiles.colors, ...overlays.map((theme) => theme.colors).filter(Boolean)],
        tokens: [foundationFiles.tokens, ...overlays.map((theme) => theme.tokens).filter(Boolean)],
        typeset: foundationFiles.typeset,
        rules: readImports(foundationFiles.barrel).map((file) => replaced.get(file) ?? file),
        additions: overlays.map((theme) => theme.style).filter(Boolean),
        replaced,
    };
};

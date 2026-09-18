// extract — turn a system's current layer-1 colours into a theme file.
//
//   node tooling/theme/extract.mjs [name…]        (default: every system, foundation included)
//
// The themes shipped with the registry are not invented: each one is what its system paints today,
// lifted out verbatim so the migration cannot change a pixel. A value may be a literal or an alias
// (`var(--primary)`, `var(--input-fill)`) — an alias is how a system says "this tone follows that one",
// and it resolves the same way once the file is imported after globals.css.
//
// A system that ports a shadcn preset is written as its baseColor plus the colours it actually moves
// (BASE_OF below, shadcn@4.21.0 config.ts), so the shared neutral ramp lives in one file. Everything
// else is written whole. Run tooling/theme/import-shadcn.mjs first — the bases have to exist.
//
// Writes registry/themes/<name>.json.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { foundationRoot, listSystems, readTokens, registryRoot, styleFiles, systemRoot } from "@tyohnn/build-system/registry";
import { PALETTE, resolveTheme, resolveValue } from "@tyohnn/theme";

/** shadcn's baseColor for each ported preset (config.ts `base-<preset>`). */
const BASE_OF = { mira: "neutral", vega: "neutral", nova: "neutral", luma: "neutral", rhea: "neutral", maia: "neutral", lyra: "neutral", sera: "taupe" };

const targets = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["foundation", ...listSystems()];
const themesRoot = join(registryRoot, "themes");

mkdirSync(themesRoot, { recursive: true });

const load = (id) =>
{
    for (const dir of ["bases", "accents", "."])
    {
        const path = join(themesRoot, dir, `${id}.json`);

        if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
    }

    return undefined;
};

for (const name of targets)
{
    const root = name === "foundation" ? foundationRoot : systemRoot(name);
    const rows = readTokens(styleFiles(root).colors);
    const scope = (selector) => Object.fromEntries(rows.filter((row) => row.scope === selector).map((row) => [row.name.slice(2), row.value]));
    const values = { light: scope(":root"), dark: scope(".dark") };
    const missing = PALETTE.flatMap((key) => ["light", "dark"].filter((mode) => !values[mode][key]).map((mode) => `${mode} --${key}`));

    if (missing.length > 0) throw new Error(`${name}: layer 1 is missing ${missing.join(", ")}`);

    const base = BASE_OF[name];
    const inherited = base ? resolveTheme({ name, extends: { base }, light: {}, dark: {} }, load) : { light: {}, dark: {} };
    // A value only counts as the system's own when it paints something else: the base may write
    // `var(--primary)` where the system wrote that colour out, and those are the same colour.
    const own = (mode) =>
    {
        // Resolve both sides against the palette alone: a name outside it (--input-fill) is a derived
        // colour the system still owns, and both sides mean the same thing by writing it.
        const mine = Object.fromEntries(PALETTE.map((key) => [key, values[mode][key]]));

        return Object.fromEntries(PALETTE
            .filter((key) => resolveValue(mine, mine[key]) !== resolveValue(inherited[mode], inherited[mode][key]))
            .map((key) => [key, values[mode][key]]));
    };

    const theme = {
        $schema: "../schema/theme.schema.json",
        name,
        title: name[0].toUpperCase() + name.slice(1),
        source: {
            kind: base ? "shadcn" : "system",
            note: base
                ? `shadcn@4.21.0 baseColor "${base}", plus what ${name} moves`
                : `Extracted from registry/${name === "foundation" ? "foundation" : `systems/${name}`}/styles/globals.css`,
        },
        ...(base ? { extends: { base } } : {}),
        light: own("light"),
        dark: own("dark"),
    };

    writeFileSync(join(themesRoot, `${name}.json`), `${JSON.stringify(theme, null, 4)}\n`);
    console.log(`registry/themes/${name}.json — ${Object.keys(theme.light).length} light · ${Object.keys(theme.dark).length} dark own values`);
}

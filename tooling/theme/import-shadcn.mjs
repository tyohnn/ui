// import-shadcn — generate the base and accent theme layers from a shadcn checkout.
//
//   node tooling/theme/import-shadcn.mjs [--source ~/projects/shadcn-ref/ui-4.21.0]
//
// shadcn create asks two colour questions: a baseColor (the neutral ramp: neutral · stone · zinc ·
// mauve · olive · mist · taupe) and a theme (an accent: blue · rose · …, which moves primary, secondary,
// the chart ramp and the sidebar accent). Both live in apps/v4/registry/themes.ts as plain objects, so
// this reads that file and writes them as our theme layers:
//
//   registry/themes/bases/<id>.json     a whole palette — shadcn's 31 colours plus the ones upstream has
//                                       no name for (status · tag · avatar · state), taken from foundation
//   registry/themes/accents/<id>.json   only the names the accent moves
//
// The colours upstream does not have are the same in every preset system today, so a base gets them from
// registry/themes/foundation.json (written by extract.mjs) and any theme may override them.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { registryRoot } from "@tyohnn/build-system/registry";
import { PALETTE, PALETTE_GROUPS } from "@tyohnn/theme";

const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};

const source = arg("source", join(homedir(), "projects/shadcn-ref/ui-4.21.0"));
const themesFile = join(source, "apps/v4/registry/themes.ts");

if (!existsSync(themesFile)) throw new Error(`No themes.ts at ${themesFile} — pass --source <shadcn checkout>`);

const BASES = ["neutral", "stone", "zinc", "mauve", "olive", "mist", "taupe"];
const SHADCN = new Set([...PALETTE_GROUPS.base, ...PALETTE_GROUPS.chart, ...PALETTE_GROUPS.sidebar]);
// Upstream has no name for these; every preset system paints them the same way today.
const OURS = [...PALETTE_GROUPS.status, ...PALETTE_GROUPS.tag, ...PALETTE_GROUPS.avatar, ...PALETTE_GROUPS.state];

/** themes.ts is plain object literals behind one import and one type annotation. */
const readThemes = () =>
{
    const body = readFileSync(themesFile, "utf8")
        .replace(/^import[^\n]*\n/gm, "")
        .replace(/export const THEMES[^=]*=/, "return")
        .replace(/\]\s*as const satisfies[^\n]*$/m, "]")
        .replace(/^export type[^\n]*$/gm, "");

    // eslint-disable-next-line no-new-func
    return new Function(body)();
};

const themes = readThemes();
const foundation = JSON.parse(readFileSync(join(registryRoot, "themes/foundation.json"), "utf8"));

const pick = (values, names) => Object.fromEntries(names.filter((name) => values[name] !== undefined).map((name) => [name, values[name]]));

const write = (kind, theme) =>
{
    const dir = join(registryRoot, "themes", kind);

    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${theme.name}.json`), `${JSON.stringify(theme, null, 4)}\n`);
    console.log(`registry/themes/${kind}/${theme.name}.json`);
};

for (const entry of themes)
{
    const isBase = BASES.includes(entry.name);
    const names = isBase ? [...SHADCN] : [...SHADCN].filter((name) => entry.cssVars.light[name] !== undefined);
    const light = pick(entry.cssVars.light, names);
    const dark = pick(entry.cssVars.dark, names);

    if (isBase)
    {
        Object.assign(light, pick(foundation.light, OURS));
        Object.assign(dark, pick(foundation.dark, OURS));

        // foundation's link is its primary written out; as a base default it has to follow the accent,
        // otherwise a warm base keeps a neutral link.
        light.link = "var(--primary)";
        dark.link = "var(--primary)";

        const missing = PALETTE.filter((name) => light[name] === undefined || dark[name] === undefined);

        if (missing.length > 0) throw new Error(`base ${entry.name} is missing ${missing.join(", ")}`);
    }

    write(isBase ? "bases" : "accents", {
        $schema: `../../schema/theme.schema.json`,
        name: entry.name,
        title: entry.title,
        source: { kind: "shadcn", note: `shadcn@4.21.0 apps/v4/registry/themes.ts — ${isBase ? "baseColor" : "theme"} "${entry.name}"` },
        light: Object.fromEntries(PALETTE.filter((name) => light[name] !== undefined).map((name) => [name, light[name]])),
        dark: Object.fromEntries(PALETTE.filter((name) => dark[name] !== undefined).map((name) => [name, dark[name]])),
    });
}

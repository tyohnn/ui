// Where the shipped themes live, for the tools that read them.
//
//   registry/themes/<id>.json           a named theme: a system's own, or one a person picked
//   registry/themes/bases/<id>.json     a neutral ramp (shadcn's baseColor), a whole palette
//   registry/themes/accents/<id>.json   an accent (shadcn's theme / chartColor), only what it moves

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { registryRoot } from "@tyohnn/build-system/registry";

export const themesRoot = join(registryRoot, "themes");

/** A theme by id, looked up as a named theme, then a base, then an accent. */
export const loadTheme = (id) =>
{
    for (const dir of [".", "bases", "accents"])
    {
        const path = join(themesRoot, dir, `${id}.json`);

        if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
    }

    return undefined;
};

/** Ids in one folder, sorted. */
export const listThemes = (kind = ".") =>
    readdirSync(join(themesRoot, kind))
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.slice(0, -".json".length))
        .sort();

/** The theme a system wears: `theme` in system.json, or the system's own name. */
export const themeIdOf = (meta) => meta.theme ?? meta.name;

// write-css — render each system's theme into its generated styles/theme.css.
//
//   node tooling/theme/write-css.mjs [name…]        (default: every system, foundation included)
//
// theme.css is layer 1's second file: the colour values, imported straight after globals.css so a
// system's own identity colours — declared later in the cascade — still win. It is generated from
// registry/themes/<id>.json (the id in system.json) and never edited by hand; validate-system checks
// that what is on disk is what the theme says.

import { writeFileSync } from "node:fs";

import { foundationRoot, listSystems, readSystemMeta, styleFiles, systemRoot } from "@tyohnn/build-system/registry";
import { resolveTheme, themeToCss } from "@tyohnn/theme";

import { loadTheme, themeIdOf } from "./themes.mjs";

const targets = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["foundation", ...listSystems()];

for (const name of targets)
{
    const root = name === "foundation" ? foundationRoot : systemRoot(name);
    const id = themeIdOf(readSystemMeta(name));
    const theme = loadTheme(id);

    if (!theme) throw new Error(`${name}: no theme "${id}" in registry/themes`);

    writeFileSync(styleFiles(root).theme, themeToCss(resolveTheme(theme, loadTheme)));
    console.log(`${name}: styles/theme.css from theme "${id}"`);
}

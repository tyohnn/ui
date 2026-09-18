// The shipped themes are data, and this is what keeps them honest: every theme resolves to a complete
// palette, and every theme that belongs to a system is exactly the colours that system's generated
// styles/theme.css declares — so a theme cannot drift from the file the build reads.

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { foundationRoot, listSystems, readTokens, registryRoot, styleFiles, systemRoot } from "@tyohnn/build-system/registry";
import { PALETTE, checkTheme, resolveTheme, resolveValue } from "@tyohnn/theme";

const themesRoot = join(registryRoot, "themes");

const read = (path) => JSON.parse(readFileSync(path, "utf8"));
const load = (id) =>
{
    for (const dir of ["bases", "accents", "."])
    {
        const path = join(themesRoot, dir, `${id}.json`);

        if (existsSync(path)) return read(path);
    }

    return undefined;
};

const named = readdirSync(themesRoot).filter((file) => file.endsWith(".json")).map((file) => file.slice(0, -".json".length));

test("every named theme resolves to the whole palette", () =>
{
    assert.ok(named.length > 0);

    for (const id of named)
    {
        const theme = load(id);

        assert.equal(theme.name, id, `${id}.json: name must equal the file name`);
        assert.deepEqual(checkTheme(resolveTheme(theme, load)), [], `${id} is not complete`);
    }
});

test("a base is a whole palette and an accent only moves what it names", () =>
{
    for (const file of readdirSync(join(themesRoot, "bases")))
    {
        const base = read(join(themesRoot, "bases", file));

        assert.deepEqual(checkTheme(resolveTheme(base, load)), [], `base ${base.name} is not complete`);
    }

    for (const file of readdirSync(join(themesRoot, "accents")))
    {
        const accent = read(join(themesRoot, "accents", file));
        const names = Object.keys(accent.light);

        assert.ok(names.length > 0 && names.length < PALETTE.length, `accent ${accent.name} should be partial`);
        assert.deepEqual(Object.keys(accent.dark), names, `accent ${accent.name} moves different names in each mode`);
    }
});

test("each system's theme is what its generated colour file declares", () =>
{
    for (const name of ["foundation", ...listSystems()])
    {
        const resolved = resolveTheme(load(name), load);
        const rows = readTokens(styleFiles(name === "foundation" ? foundationRoot : systemRoot(name)).theme);

        for (const [mode, selector] of [["light", ":root"], ["dark", ".dark"]])
        {
            const declared = Object.fromEntries(rows.filter((row) => row.scope === selector).map((row) => [row.name.slice(2), row.value]));
            const palette = Object.fromEntries(PALETTE.map((key) => [key, declared[key]]));

            for (const key of PALETTE)
            {
                assert.equal(
                    resolveValue(resolved[mode], resolved[mode][key]),
                    resolveValue(palette, palette[key]),
                    `${name} ${mode} --${key}`,
                );
            }
        }
    }
});

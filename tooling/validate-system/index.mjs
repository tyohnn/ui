// validate-system — the metadata half of a system's checks (scan-tokens is the CSS half).
//
//   1. schema     system.json against registry/schema/system.schema.json (foundation.json: its `fonts`
//                 against the same definition) · every registry/fonts/<id>.json against
//                 font.schema.json, with id = file name                                          → FAIL
//   2. fonts      every font id a system names exists in the catalog; hangulFallback is a font
//                 with `hangul: true`                                                             → FAIL
//   3. stacks     layer-1 --font-sans / --font-heading / --font-mono in :root equal the stacks built
//                 from the fonts and the catalog (system font → Hangul fallback → platform)       → FAIL
//   4. theme      system.json `theme` names a theme in registry/themes, it resolves to the whole
//                 palette, and styles/theme.css is exactly what it renders (a generated file)     → FAIL
//                 low-contrast pairs in the resolved theme                                        → warning
//   5. icons      (once) every name in registry/ui/icons/names.ts is exported by all six
//                 icons/libraries/<library>.tsx files and nothing else is; the libraries match the
//                 schema enum and manifest.json iconLibraries; registry/ui components, hooks and lib
//                 import no icon package directly (only @tyohnn/icons)                            → FAIL
//
// Usage: node tooling/validate-system [foundation|<system>…]

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import Ajv2020 from "ajv/dist/2020.js";

import { fontIds, fontStacks, listSystems, readFontCatalog, readSystemMeta, readTokens, repoRoot, schemaRoot, styleFiles, systemRoot, uiRoot } from "@tyohnn/build-system/registry";
import { checkContrast, checkTheme, resolveTheme, themeToCss } from "@tyohnn/theme";

import { loadTheme, themeIdOf } from "../theme/themes.mjs";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const systemSchema = readJson(join(schemaRoot, "system.schema.json"));
const fontSchema = readJson(join(schemaRoot, "font.schema.json"));

ajv.addSchema(systemSchema);
ajv.addSchema(fontSchema);

const validateSystem = ajv.getSchema(systemSchema.$id);
const validateFonts = ajv.getSchema(`${systemSchema.$id}#/$defs/fonts`);
const validateIcons = ajv.getSchema(`${systemSchema.$id}#/$defs/icons`);
const validateFont = ajv.getSchema(fontSchema.$id);
const errorsOf = (validate) => (validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message}`);

const catalog = readFontCatalog();
const catalogFailures = [];

for (const [id, font] of catalog)
{
    if (!validateFont(font)) errorsOf(validateFont).forEach((error) => catalogFailures.push(`registry/fonts/${id}.json: ${error}`));
    if (font.id !== id) catalogFailures.push(`registry/fonts/${id}.json: id "${font.id}" differs from the file name`);
}

/** Not failures: values upstream ships that read below AA, reported once at the end. */
const warnings = [];

const check = (name) =>
{
    const failures = [];
    const meta = readSystemMeta(name);

    // 1. schema
    if (name === "foundation")
    {
        if (!validateFonts(meta.fonts)) errorsOf(validateFonts).forEach((error) => failures.push(`foundation.json fonts${error}`));
        if (!validateIcons(meta.icons)) errorsOf(validateIcons).forEach((error) => failures.push(`foundation.json icons${error}`));
    }
    else
    {
        if (!validateSystem(meta)) errorsOf(validateSystem).forEach((error) => failures.push(`system.json${error}`));
        if (meta.name !== name) failures.push(`system.json name "${meta.name}" differs from the folder name`);
    }

    if (!meta.fonts) return failures;

    // 2. fonts
    for (const id of fontIds(meta.fonts))
    {
        if (!catalog.has(id)) failures.push(`font "${id}" is not in registry/fonts`);
    }

    if (catalog.has(meta.fonts.hangulFallback) && !catalog.get(meta.fonts.hangulFallback).hangul)
    {
        failures.push(`hangulFallback "${meta.fonts.hangulFallback}" has no Hangul (hangul: false)`);
    }

    if (failures.length > 0) return failures;

    // 3. layer-1 stacks
    const rows = readTokens(styleFiles(systemRoot(name)).colors).filter((row) => row.scope === ":root");

    for (const [token, expected] of Object.entries(fontStacks(meta.fonts, catalog)))
    {
        const found = rows.filter((row) => row.name === token);

        if (found.length !== 1) failures.push(`styles/globals.css :root must declare ${token} once (found ${found.length}); expected: ${expected}`);
        else if (found[0].value !== expected) failures.push(`styles/globals.css:${found[0].line} ${token}\n      is:       ${found[0].value}\n      expected: ${expected}`);
    }

    // 4. theme
    const themeId = themeIdOf(meta);
    const theme = loadTheme(themeId);

    if (!theme) failures.push(`theme "${themeId}" is not in registry/themes`);
    else
    {
        const resolved = resolveTheme(theme, loadTheme);
        const problems = checkTheme(resolved);

        if (problems.length > 0) failures.push(...problems.map((line) => `registry/themes/${themeId}.json: ${line}`));
        else
        {
            const path = styleFiles(systemRoot(name)).theme;
            const expected = themeToCss(resolved);

            if (!existsSync(path)) failures.push(`styles/theme.css is missing — run node tooling/theme/write-css.mjs ${name}`);
            else if (readFileSync(path, "utf8") !== expected) failures.push(`styles/theme.css is not what theme "${themeId}" renders — run node tooling/theme/write-css.mjs ${name}`);

            for (const row of checkContrast(resolved))
            {
                warnings.push(`${name}: --${row.foreground} on --${row.background} is ${row.ratio}:1 in ${row.mode} (AA wants 4.5)`);
            }
        }
    }

    return failures;
};

// 5. icons (shared by every system)
const ICON_PACKAGES = /from\s+["'](lucide-react|@tabler\/icons-react|@hugeicons\/[^"']+|@phosphor-icons\/[^"']+|@remixicon\/[^"']+|@radix-ui\/react-icons)["']/g;

const checkIcons = () =>
{
    const failures = [];
    const iconsRoot = join(uiRoot, "icons");
    const names = [...readFileSync(join(iconsRoot, "names.ts"), "utf8").matchAll(/^\s+"([A-Za-z0-9]+)",/gm)].map((match) => match[1]);
    const libraries = systemSchema.$defs.icons.properties.library.enum;
    const manifest = readJson(join(uiRoot, "manifest.json"));

    if (names.length === 0) failures.push("registry/ui/icons/names.ts lists no names");
    if (JSON.stringify(Object.keys(manifest.iconLibraries ?? {}).sort()) !== JSON.stringify([...libraries].sort()))
    {
        failures.push(`manifest.json iconLibraries (${Object.keys(manifest.iconLibraries ?? {}).join(", ")}) differ from the schema (${libraries.join(", ")})`);
    }

    for (const library of libraries)
    {
        const file = join(iconsRoot, "libraries", `${library}.tsx`);

        if (!existsSync(file))
        {
            failures.push(`missing icons/libraries/${library}.tsx`);
            continue;
        }

        const source = readFileSync(file, "utf8");
        const exported = new Set([
            ...[...source.matchAll(/^export const ([A-Za-z0-9]+)\s*=/gm)].map((match) => match[1]),
            ...[...source.matchAll(/^\s+[A-Za-z0-9]+ as ([A-Za-z0-9]+),$/gm)].map((match) => match[1]),
        ]);

        names.filter((name) => !exported.has(name)).forEach((name) => failures.push(`icons/libraries/${library}.tsx does not export ${name}`));
        [...exported].filter((name) => !names.includes(name)).forEach((name) => failures.push(`icons/libraries/${library}.tsx exports ${name}, which names.ts does not list`));
    }

    const walk = (root) => readdirSync(root, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(join(root, entry.name)) : /\.(ts|tsx)$/.test(entry.name) ? [join(root, entry.name)] : []);

    for (const file of ["components", "hooks", "lib"].flatMap((folder) => walk(join(uiRoot, folder))))
    {
        for (const match of readFileSync(file, "utf8").matchAll(ICON_PACKAGES))
        {
            failures.push(`${relative(repoRoot, file)} imports ${match[1]} directly; import from @tyohnn/icons`);
        }
    }

    return { names, libraries, failures };
};

const icons = checkIcons();

console.log(`\nicons: ${icons.names.length} names × ${icons.libraries.length} libraries (${icons.libraries.join(" · ")})`);
icons.failures.forEach((failure) => console.log(`  ✗ ${failure}`));
if (icons.failures.length === 0) console.log("  ✓ every library exports every name · no direct icon-package imports in registry/ui");

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const names = requested.length > 0 ? requested : ["foundation", ...listSystems()];
let failed = catalogFailures.length > 0 || icons.failures.length > 0;

console.log(`\nfont catalog: ${catalog.size} fonts`);
catalogFailures.forEach((failure) => console.log(`  ✗ ${failure}`));
if (catalogFailures.length === 0) console.log("  ✓ every entry matches font.schema.json");

for (const name of names)
{
    const failures = check(name);
    const meta = readSystemMeta(name);

    console.log(`\n${name}: fonts ${JSON.stringify(meta.fonts)} · icons ${meta.icons?.library}`);
    failures.forEach((failure) => console.log(`  ✗ ${failure}`));
    console.log(failures.length === 0 ? `  ✓ schema · font ids · layer-1 font stacks · theme "${themeIdOf(meta)}"` : `  ✗ ${failures.length} failures`);
    failed ||= failures.length > 0;
}

if (warnings.length > 0) console.log(`\ncontrast below AA (${warnings.length}):`);
warnings.forEach((warning) => console.log(`  ⚠ ${warning}`));

process.exit(failed ? 1 : 0);

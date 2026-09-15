// validate-system — the metadata half of a system's checks (scan-tokens is the CSS half).
//
//   1. schema     system.json against registry/schema/system.schema.json (foundation.json: its `fonts`
//                 against the same definition) · every registry/fonts/<id>.json against
//                 font.schema.json, with id = file name                                          → FAIL
//   2. fonts      every font id a system names exists in the catalog; hangulFallback is a font
//                 with `hangul: true`                                                             → FAIL
//   3. stacks     layer-1 --font-sans / --font-heading / --font-mono in :root equal the stacks built
//                 from the fonts and the catalog (system font → Hangul fallback → platform)       → FAIL
//
// Usage: node tooling/validate-system [foundation|<system>…]

import { readFileSync } from "node:fs";
import { join } from "node:path";

import Ajv2020 from "ajv/dist/2020.js";

import { fontIds, fontStacks, listSystems, readFontCatalog, readSystemMeta, readTokens, schemaRoot, styleFiles, systemRoot } from "@tyohnn/build-system/registry";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const systemSchema = readJson(join(schemaRoot, "system.schema.json"));
const fontSchema = readJson(join(schemaRoot, "font.schema.json"));

ajv.addSchema(systemSchema);
ajv.addSchema(fontSchema);

const validateSystem = ajv.getSchema(systemSchema.$id);
const validateFonts = ajv.getSchema(`${systemSchema.$id}#/$defs/fonts`);
const validateFont = ajv.getSchema(fontSchema.$id);
const errorsOf = (validate) => (validate.errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message}`);

const catalog = readFontCatalog();
const catalogFailures = [];

for (const [id, font] of catalog)
{
    if (!validateFont(font)) errorsOf(validateFont).forEach((error) => catalogFailures.push(`registry/fonts/${id}.json: ${error}`));
    if (font.id !== id) catalogFailures.push(`registry/fonts/${id}.json: id "${font.id}" differs from the file name`);
}

const check = (name) =>
{
    const failures = [];
    const meta = readSystemMeta(name);

    // 1. schema
    if (name === "foundation")
    {
        if (!validateFonts(meta.fonts)) errorsOf(validateFonts).forEach((error) => failures.push(`foundation.json fonts${error}`));
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

    return failures;
};

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const names = requested.length > 0 ? requested : ["foundation", ...listSystems()];
let failed = catalogFailures.length > 0;

console.log(`\nfont catalog: ${catalog.size} fonts`);
catalogFailures.forEach((failure) => console.log(`  ✗ ${failure}`));
if (catalogFailures.length === 0) console.log("  ✓ every entry matches font.schema.json");

for (const name of names)
{
    const failures = check(name);
    const meta = readSystemMeta(name);

    console.log(`\n${name}: fonts ${JSON.stringify(meta.fonts)}`);
    failures.forEach((failure) => console.log(`  ✗ ${failure}`));
    console.log(failures.length === 0 ? "  ✓ schema · font ids · layer-1 font stacks" : `  ✗ ${failures.length} failures`);
    failed ||= failures.length > 0;
}

process.exit(failed ? 1 : 0);

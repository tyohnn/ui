// build-previews — one static preview build per design system, served by the site from the same origin.
//
//   apps/site/public/preview/<system>/index.html?template=<template>&mode=light|dark
//
// For every registry/systems/<name> (foundation is not listed): tooling/build-system <name>, then
// apps/preview built for that system with `--base=/preview/<name>/ --own-css`, so the fonts, icon library and
// stylesheet are that system's and nothing else ships. The output is not committed (.gitignore).
//
// Font files are shared: every build emits the same content-hashed files (Pretendard's woff2 chunks for all
// nine systems, Inter's for four), so each one is moved to apps/site/public/preview/_fonts/<file> once and the
// system's CSS/JS point at /preview/_fonts/<file> instead of /preview/<system>/assets/<file>.
//
// Usage: node scripts/build-previews.mjs [name…]   (default: every system)

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSystem } from "@tyohnn/build-system";
import { listSystems } from "@tyohnn/build-system/registry";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const previewRoot = join(siteRoot, "../preview");
const outRoot = join(siteRoot, "public/preview");
const fontsRoot = join(outRoot, "_fonts");
const FONT_FILE = /\.(?:woff2?|ttf|otf)$/;
const TEXT_FILE = /\.(?:css|js|html)$/;

const known = listSystems();
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const unknown = requested.filter((name) => !known.includes(name));

if (unknown.length > 0)
{
    console.error(`unknown system: ${unknown.join(", ")} (known: ${known.join(", ")})`);
    process.exit(2);
}

const systems = requested.length > 0 ? requested : known;
const started = Date.now();

if (requested.length === 0) rmSync(outRoot, { recursive: true, force: true });

/** Moves one build's font files into _fonts/ (one copy per content-hashed name) and rewrites its references. */
const shareFonts = (name) =>
{
    const assets = join(outRoot, name, "assets");
    const fonts = existsSync(assets) ? readdirSync(assets).filter((file) => FONT_FILE.test(file)) : [];
    let moved = 0;

    mkdirSync(fontsRoot, { recursive: true });

    for (const file of fonts)
    {
        const from = join(assets, file);
        const to = join(fontsRoot, file);

        if (!existsSync(to))
        {
            renameSync(from, to);
            moved += 1;
            continue;
        }

        if (!readFileSync(from).equals(readFileSync(to))) throw new Error(`${name}: assets/${file} differs from the shared _fonts/${file}`);
        unlinkSync(from);
    }

    const names = new Set(fonts);
    // A font url as Vite writes it for `--base=/preview/<name>/`, or in any other form (caught below).
    const fontUrl = /[^"'()\s,]*?([\w.-]+\.(?:woff2?|ttf|otf))/g;
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(join(dir, entry.name)) : TEXT_FILE.test(entry.name) ? [join(dir, entry.name)] : []);

    for (const path of walk(join(outRoot, name)))
    {
        const text = readFileSync(path, "utf8");
        const next = text.replace(fontUrl, (match, file) =>
        {
            if (!names.has(file)) return match;
            if (match === `/preview/${name}/assets/${file}`) return `/preview/_fonts/${file}`;

            // Anything else (a relative url, say) would point at a file that is no longer there.
            throw new Error(`${name}: ${path} references ${match}, not /preview/${name}/assets/${file}`);
        });

        if (next !== text) writeFileSync(path, next);
    }

    return { fonts: fonts.length, moved };
};

const run = (name) =>
    new Promise((resolve, reject) =>
    {
        const args = [
            "scripts/vite-system.mjs", "build", `--system=${name}`, "--own-css",
            `--base=/preview/${name}/`, `--outDir=${join(outRoot, name)}`, "--emptyOutDir", "--logLevel=warn",
        ];
        const child = spawn(process.execPath, args, { cwd: previewRoot, stdio: ["ignore", "ignore", "pipe"] });
        let stderr = "";

        child.stderr.on("data", (chunk) => (stderr += chunk));
        child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${name}: preview build failed\n${stderr}`))));
    });

for (const name of systems) buildSystem(name);

// Vite builds share nothing but the read-only dependency tree; three at a time keeps memory reasonable.
const queue = [...systems];

await Promise.all(Array.from({ length: 3 }, async () =>
{
    for (let name = queue.shift(); name; name = queue.shift())
    {
        const begun = Date.now();

        await run(name);
        console.log(`preview/${name}  ${((Date.now() - begun) / 1000).toFixed(1)}s`);
    }
}));

for (const name of systems)
{
    const { fonts, moved } = shareFonts(name);

    console.log(`preview/${name}  ${fonts} font files → _fonts/ (${moved} new, ${fonts - moved} shared)`);
}

console.log(`${systems.length} previews in ${((Date.now() - started) / 1000).toFixed(1)}s → ${outRoot}`);

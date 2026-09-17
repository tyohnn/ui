// build-previews — one static preview build per design system, served by the site from the same origin.
//
//   apps/site/public/preview/<system>/index.html?template=<template>&mode=light|dark
//
// For every registry/systems/<name> (foundation is not listed): tooling/build-system <name>, then
// apps/preview built for that system with `--base=/preview/<name>/ --own-css`, so the fonts, icon library and
// stylesheet are that system's and nothing else ships. The output is not committed (.gitignore).
//
// Usage: node scripts/build-previews.mjs [name…]   (default: every system)

import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildSystem } from "@tyohnn/build-system";
import { listSystems } from "@tyohnn/build-system/registry";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const previewRoot = join(siteRoot, "../preview");
const outRoot = join(siteRoot, "public/preview");

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

console.log(`${systems.length} previews in ${((Date.now() - started) / 1000).toFixed(1)}s → ${outRoot}`);

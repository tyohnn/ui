#!/usr/bin/env node
// scaffold-prototype — the tyohnn CLI's first shape, run against a local tyohnn checkout.
//
//   node tooling/scaffold-prototype init --target <monorepo> --ui packages/ui --scope @acme --system graphite --app apps/crm
//        [--icons <library>] [--font <id>] [--font-heading <id|inherit>] [--font-mono <id|system>] [--mode dark|light]
//        [--port 3201] [--example component-sheet] [--source <tyohnn checkout>]
//   node tooling/scaffold-prototype add-system --target <monorepo> --system foundation --app apps/admin [same options]
//
// init creates the monorepo root (npm workspaces + Turborepo) and the app when they do not exist, copies
// packages/ui (one set of TSX, the chosen icon library, one system folder), wires the app and writes
// tyohnn.json. add-system adds a system (and icon library) to the existing packages/ui and wires another
// app to it. Content comes from --source (default: this checkout); GitHub download comes later.

import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { wireNextApp } from "./lib/app-next.mjs";
import { resolveFonts } from "./lib/fonts.mjs";
import { openSource } from "./lib/source.mjs";
import { addIconLibrary, addSystem, writeUiBase } from "./lib/ui.mjs";
import { createLog, posix, readJson, writeFile, writeJson } from "./lib/util.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const [command, ...rest] = process.argv.slice(2);

const options = {};

for (let index = 0; index < rest.length; index += 1)
{
    if (!rest[index].startsWith("--")) continue;

    const key = rest[index].slice(2);
    const next = rest[index + 1];

    if (next === undefined || next.startsWith("--")) options[key] = true;
    else
    {
        options[key] = next;
        index += 1;
    }
}

const usage = () =>
{
    console.error("usage: scaffold-prototype init|add-system --target <monorepo> [options] (see the header of index.mjs)");
    process.exit(2);
};

const need = (key) =>
{
    if (!options[key] || options[key] === true)
    {
        console.error(`--${key} is required`);
        usage();
    }

    return options[key];
};

const RECORD = "tyohnn.json";

const ensureMonorepo = (target, log) =>
{
    if (existsSync(join(target, "package.json"))) return;

    const name = target.split("/").filter(Boolean).at(-1);

    writeJson(join(target, "package.json"), {
        name,
        version: "0.0.0",
        private: true,
        packageManager: "npm@11.6.2",
        workspaces: ["apps/*", "packages/*"],
        scripts: { dev: "turbo dev", build: "turbo build", typecheck: "turbo typecheck" },
        devDependencies: { turbo: "^2.3.3", typescript: "^5" },
    });
    writeJson(join(target, "turbo.json"), {
        $schema: "https://turbo.build/schema.json",
        tasks: {
            dev: { persistent: true, cache: false },
            build: { dependsOn: ["^build"], outputs: [".next/**", "!.next/cache/**"] },
            typecheck: { dependsOn: ["^typecheck"] },
        },
    });
    writeJson(join(target, "tsconfig.base.json"), {
        compilerOptions: {
            target: "ES2022",
            lib: ["ES2022"],
            module: "esnext",
            moduleResolution: "bundler",
            esModuleInterop: true,
            resolveJsonModule: true,
            isolatedModules: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
        },
        exclude: ["node_modules", "dist", ".next"],
    });
    writeFile(join(target, ".gitignore"), ["node_modules", ".next", ".turbo", "next-env.d.ts", "*.tsbuildinfo", ""].join("\n"));
    ["package.json", "turbo.json", "tsconfig.base.json", ".gitignore"].forEach((file) => log.wrote(join(target, file)));
    log.note("created the monorepo root (npm workspaces apps/* packages/* · Turborepo)");
};

const checkWorkspaces = (target, paths, log) =>
{
    const globs = readJson(join(target, "package.json")).workspaces ?? [];
    const covered = (path) => globs.some((glob) => (glob.endsWith("/*") ? dirname(path) === glob.slice(0, -2) : glob === path));

    paths.filter((path) => !covered(path)).forEach((path) => log.note(`${path} is not matched by the root workspaces (${globs.join(", ")})`));
};

const wire = (ctx, meta) =>
{
    const appPath = need("app");
    const icons = options.icons ?? meta.icons.library;
    const others = Object.entries(ctx.record.apps).filter(([path, app]) => path !== appPath && app.icons !== icons);

    if (others.length > 0)
    {
        // The real CLI asks here: one icon library per monorepo is the recommendation.
        ctx.log.note(`icon libraries diverge: ${appPath} uses ${icons}, ${others.map(([path, app]) => `${path} uses ${app.icons}`).join(", ")}. Each app gets its own @scope/ui/icons alias; one library per monorepo is simpler.`);
    }

    addIconLibrary(ctx, icons);
    wireNextApp(ctx, {
        appPath,
        system: meta.name,
        icons,
        fonts: resolveFonts(meta.fonts, { sans: options.font, heading: options["font-heading"], mono: options["font-mono"] }),
        mode: options.mode ?? meta.defaultMode,
        port: Number(options.port ?? 3000),
        example: options.example === undefined ? "component-sheet" : options.example === "none" ? null : options.example,
    });
    checkWorkspaces(ctx.target, [ctx.uiPath, appPath], ctx.log);
};

const scaffold = (mode) =>
{
    const target = resolve(need("target"));
    const source = openSource(options.source ?? join(here, "../.."));
    const log = createLog(target);
    const recordFile = join(target, RECORD);
    const existing = readJson(recordFile);

    if (mode === "init" && existing) throw new Error(`${recordFile} exists: this monorepo is initialised, use add-system`);
    if (mode === "add-system" && !existing) throw new Error(`${recordFile} not found: run init first`);

    const record = existing ?? { tyohnn: "scaffold-prototype", version: 1, scope: need("scope"), ui: { path: need("ui"), systems: [], icons: {} }, apps: {}, files: {} };

    record.source = { kind: "local", path: posix(relative(target, source.root)) || ".", commit: source.commit, dirty: source.dirty };

    const ctx = { target, source, log, record, scope: record.scope, uiPath: record.ui.path };

    if (mode === "init")
    {
        ensureMonorepo(target, log);
        writeUiBase(ctx);
    }

    const meta = addSystem(ctx, need("system"));

    wire(ctx, meta);

    record.files = Object.fromEntries(Object.entries(record.files).sort(([a], [b]) => a.localeCompare(b)));
    writeJson(recordFile, record);
    log.wrote(recordFile);

    console.log(`${mode} ${meta.name} → ${options.app} (${relative(process.cwd(), target) || "."}) from ${source.commit ?? "?"}${source.dirty ? " (dirty)" : ""}`);
    log.print();
    console.log("next: npm install, then npx turbo typecheck build");
};

try
{
    if (command === "init" || command === "add-system") scaffold(command);
    else usage();
}
catch (error)
{
    console.error(`error: ${error.message}`);
    process.exit(1);
}

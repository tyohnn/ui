// The files of one app the CLI edits. Nothing here writes.

import { join } from "node:path";

import { cssImportsOf, viteEntryModule } from "../codemods/vite.js";
import { exists, read, readJson } from "../lib/fs.js";
import { CliError } from "../lib/log.js";
import { type Framework, frameworkOf, type PackageJson } from "./detect.js";

export interface AppFiles
{
    path: string;
    dir: string;
    framework: Framework;
    pkg: string;
    /** tsconfig files that get `paths` (the first is the one the app's code is compiled with) */
    tsconfigs: string[];
    /** Entry CSS (existing or to be created) */
    css: string;
    /** The file that imports the entry CSS: the root layout (Next) or the entry module (Vite) */
    cssImporter: string | null;
    next?: { appDir: string; layout: string | null; config: string | null; postcss: string | null };
    vite?: { indexHtml: string; config: string | null };
}

const firstExisting = (dir: string, names: string[]): string | null => names.map((name) => join(dir, name)).find(exists) ?? null;

export const inspectApp = (root: string, path: string): AppFiles =>
{
    const dir = join(root, path);
    const pkgFile = join(dir, "package.json");
    const pkg = readJson<PackageJson>(pkgFile);

    if (!pkg) throw new CliError(`${path} has no package.json`, "Pass --app <folder of a Next.js or Vite app>.");

    const framework = frameworkOf(pkg);

    if (!framework) throw new CliError(`${path} is not a Next.js or Vite app (no next or vite dependency)`, "tyohnn supports Next.js (App Router) and Vite apps.");

    if (framework === "next")
    {
        const appDir = firstExisting(dir, ["src/app", "app"]);

        if (!appDir)
        {
            const pages = firstExisting(dir, ["src/pages", "pages"]);

            throw new CliError(`${path} has no App Router folder (src/app or app)${pages ? "; the Pages Router is not supported" : ""}`, "Create app/layout.tsx (App Router), then run the command again.");
        }

        const layout = firstExisting(appDir, ["layout.tsx", "layout.jsx", "layout.js", "layout.ts"]);
        const imported = layout ? cssImportsOf(read(layout), layout)[0] : undefined;

        return {
            path,
            dir,
            framework,
            pkg: pkgFile,
            tsconfigs: [join(dir, "tsconfig.json")],
            css: imported ? join(appDir, imported) : join(appDir, "globals.css"),
            cssImporter: layout,
            next: {
                appDir,
                layout,
                config: firstExisting(dir, ["next.config.ts", "next.config.mjs", "next.config.js", "next.config.cjs", "next.config.mts"]),
                postcss: firstExisting(dir, ["postcss.config.mjs", "postcss.config.js", "postcss.config.cjs", "postcss.config.ts", ".postcssrc.json", ".postcssrc"]),
            },
        };
    }

    const indexHtml = join(dir, "index.html");

    if (!exists(indexHtml)) throw new CliError(`${path} has no index.html`, "tyohnn wires Vite apps through index.html and its module script.");

    const entry = viteEntryModule(read(indexHtml));
    const entryFile = entry ? join(dir, entry) : null;
    const imported = entryFile && exists(entryFile) ? cssImportsOf(read(entryFile), entryFile)[0] : undefined;
    const tsconfigs = ["tsconfig.app.json", "tsconfig.json"].map((name) => join(dir, name)).filter(exists);

    return {
        path,
        dir,
        framework,
        pkg: pkgFile,
        tsconfigs: tsconfigs.length ? tsconfigs : [join(dir, "tsconfig.json")],
        css: imported && entryFile ? join(entryFile, "..", imported) : join(dir, "src/index.css"),
        cssImporter: entryFile && exists(entryFile) ? entryFile : null,
        vite: { indexHtml, config: firstExisting(dir, ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"]) },
    };
};

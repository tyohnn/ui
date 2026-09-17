// tyohnn doctor — checks a project against tyohnn.json. Works offline; uses the cached source for package checks
// when it is there.
//
// Per app
//   FAIL  entry CSS missing · no system or two systems imported · the wired system differs from tyohnn.json
//   FAIL  import order tailwindcss → globals → tokens → typeset → typeset-preset → style.css layer(base)
//   FAIL  monorepo: no @source for the UI package · next.config does not transpile it
//   FAIL  Next: <html> does not read the layout block · font stacks read variables the layout does not declare ·
//         next/font/local files missing · `dark` on <html> differs from the recorded mode
//   FAIL  Vite: index.html `dark` differs from the recorded mode · the entry module does not import the entry CSS
//   FAIL  icons: the app resolves a different library than recorded, or the library file is missing
//   WARN  the entry CSS redeclares the system's tokens outside the tyohnn blocks
// Project
//   FAIL  a copied component imports an icon package directly · a CLI-owned file is missing · a package is not installed
//   WARN  icon libraries diverge across apps · CLI-owned files changed since they were written (user edits)
// --built (Next): the app's built CSS carries no token value that only another system of the UI package declares

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { readCssImports, readCssSources, userCustomProperties } from "../codemods/css.js";
import { HTML_CLASS_IDENTIFIER } from "../codemods/layout.js";
import { parseTsconfig } from "../codemods/tsconfig.js";
import { cssImportsOf, viteEntryModule } from "../codemods/vite.js";
import { hash, read, readIfExists, rel, walk } from "../lib/fs.js";
import { findBlock } from "../lib/markers.js";
import { CliError, color, log } from "../lib/log.js";
import { packageDir } from "../project/detect.js";
import { cssFontImports, fontPackages } from "../project/fonts.js";
import { placementOf } from "../project/placement.js";
import { readRecord, usedIcons } from "../project/record.js";
import { SYSTEM_CSS_FILES } from "../project/sync.js";
import { openCachedCommit } from "../source/index.js";
import { type GlobalOptions, recordRoot, workingDir } from "./context.js";

type Level = "ok" | "WARN" | "FAIL";

interface Row
{
    level: Level;
    where: string;
    message: string;
}

const ICON_PACKAGE_IMPORT = /from\s+["'](lucide-react|@tabler\/icons-react|@hugeicons\/[^"']+|@phosphor-icons\/react|@remixicon\/react|@radix-ui\/react-icons)["']/;

export const doctor = async (options: GlobalOptions): Promise<number> =>
{
    const root = recordRoot(options) ?? workingDir(options);
    const record = readRecord(root);

    if (!record) throw new CliError(`no tyohnn.json in ${root}`, "Run `tyohnn init` first, or run doctor from the project root.");

    const rows: Row[] = [];
    const add = (level: Level, where: string, message: string) => rows.push({ level, where, message });
    const placement = placementOf(root, record);
    const registry = record.source.commit ? openCachedCommit(record.source.commit) : null;
    const installed = existsSync(join(root, "node_modules"));

    for (const [appPath, app] of Object.entries(record.apps).sort(([a], [b]) => a.localeCompare(b)))
    {
        const where = appPath;
        const appDir = join(root, appPath);
        const cssFile = join(root, app.css);
        const css = readIfExists(cssFile);

        if (css === null)
        {
            add("FAIL", where, `entry CSS ${app.css} is missing`);
            continue;
        }

        // Systems and order
        const imports = readCssImports(css);
        const systemOf = (specifier: string) => specifier.match(/\/systems\/([^/]+)\//)?.[1] ?? specifier.match(/styles\/tyohnn\/([^/]+)\//)?.[1];
        const systems = [...new Set(imports.map((entry) => systemOf(entry.specifier)).filter(Boolean))];

        if (systems.length === 0) add("FAIL", where, `${app.css} imports no design system`);
        else if (systems.length > 1) add("FAIL", where, `${systems.length} systems imported (${systems.join(", ")}): every system defines the same cn-* rules globally; import exactly one`);
        else if (systems[0] !== app.system) add("FAIL", where, `${app.css} imports ${systems[0]}, tyohnn.json says ${app.system} (run \`tyohnn use ${app.system}${appPath === "." ? "" : ` --app ${appPath}`}\`)`);
        else add("ok", where, `one system: ${app.system}`);

        let ordered = true;
        let previous = -1;

        if (imports[0]?.specifier !== "tailwindcss")
        {
            add("FAIL", where, `the first @import of ${app.css} must be "tailwindcss" (found "${imports[0]?.specifier ?? "nothing"}")`);
            ordered = false;
        }

        for (const file of SYSTEM_CSS_FILES)
        {
            const index = imports.findIndex((entry) => systemOf(entry.specifier) === app.system && entry.specifier.endsWith(`/${file}`));
            const layer = file === "style.css" ? "base" : null;

            if (index === -1)
            {
                add("FAIL", where, `missing @import of ${app.system}/${file}`);
                ordered = false;
                continue;
            }

            if (index < previous)
            {
                add("FAIL", where, `@import of ${file} is out of order (tailwindcss → globals → tokens → typeset → typeset-preset → style.css)`);
                ordered = false;
            }

            if (imports[index].layer !== layer)
            {
                add("FAIL", where, `@import of ${file} ${layer ? "must be in layer(base), so className utilities win" : `must not be in a layer (found layer(${imports[index].layer}))`}`);
                ordered = false;
            }

            previous = Math.max(previous, index);
        }

        if (ordered && systems.length === 1) add("ok", where, "import order tailwindcss → globals → tokens → typeset → style.css layer(base)");

        if (placement.monorepo)
        {
            const sources = readCssSources(css).filter((source) => !source.not).map((source) => join(dirname(cssFile), source.path));

            if (!sources.some((path) => path === placement.base || path === `${placement.base}/`)) add("FAIL", where, `no @source for ${record.ui.path}/src: Tailwind will not generate the components' classes`);
        }

        const tokenNames = new Set(["globals.css", "tokens.css"].flatMap((file) => [...(readIfExists(join(placement.systemDir(app.system), file)) ?? "").matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((match) => match[1])));
        const shadowed = userCustomProperties(css).filter((name) => tokenNames.has(name));

        if (shadowed.length) add("WARN", where, `${app.css} redeclares ${shadowed.slice(0, 4).join(", ")}${shadowed.length > 4 ? " …" : ""} outside the tyohnn blocks (overrides ${app.system})`);

        // Framework wiring
        if (app.framework === "next")
        {
            const appDir2 = ["src/app", "app"].map((dir) => join(appDir, dir)).find(existsSync);
            const layoutFile = appDir2 ? ["layout.tsx", "layout.jsx", "layout.js"].map((file) => join(appDir2, file)).find(existsSync) : undefined;
            const layout = layoutFile ? read(layoutFile) : "";
            const block = findBlock(layout, "ts", "fonts")?.text ?? "";

            if (!layoutFile) add("FAIL", where, "no root layout");
            else if (!block) add("FAIL", where, `${rel(root, layoutFile)} has no tyohnn fonts block (run init again)`);
            else
            {
                if (!new RegExp(`<html[^>]*${HTML_CLASS_IDENTIFIER}`).test(layout)) add("FAIL", where, `<html> does not read ${HTML_CLASS_IDENTIFIER}: fonts and mode classes are not applied`);

                const htmlClass = block.match(new RegExp(`${HTML_CLASS_IDENTIFIER}\\s*=\\s*\\[([^\\]]*)\\]`))?.[1] ?? "";

                if ((app.mode === "dark") !== /"dark"/.test(htmlClass)) add("FAIL", where, `tyohnn.json mode is ${app.mode} but <html> ${app.mode === "dark" ? "lacks" : "has"} dark`);

                const declared = new Set([...block.matchAll(/variable:\s*"(--[^"]+)"/g)].map((match) => match[1]));
                const themeBlock = findBlock(css, "css", "theme")?.text ?? "";
                const used = [...new Set([...themeBlock.matchAll(/var\((--font-(?!(?:sans|heading|mono)\))[^),\s]+)\)/g)].map((match) => match[1]))];
                const missing = used.filter((name) => !declared.has(name));

                if (!used.length) add("FAIL", where, `${app.css} does not redeclare the font stacks on next/font variables`);
                else if (missing.length) add("FAIL", where, `font stacks read ${missing.join(", ")}, which the layout does not declare`);
                else add("ok", where, `fonts on next/font variables ${used.join(", ")}`);

                const files = [...block.matchAll(/path:\s*"([^"]+\.woff2)"/g)].map((match) => match[1]).filter((path) => !existsSync(join(dirname(layoutFile), path)));

                if (installed && files.length) add("FAIL", where, `next/font/local files not found: ${files.slice(0, 2).join(", ")} (install, then run \`tyohnn fonts --reset${appPath === "." ? "" : ` --app ${appPath}`}\`)`);
            }

            if (placement.monorepo)
            {
                const config = ["next.config.ts", "next.config.mjs", "next.config.js"].map((file) => join(appDir, file)).find(existsSync);
                const text = config ? read(config) : "";

                if (!text.includes(JSON.stringify(record.ui.importBase)) || !/transpilePackages/.test(text)) add("FAIL", where, `next.config does not transpile ${record.ui.importBase}`);
            }
        }
        else
        {
            const html = readIfExists(join(appDir, "index.html")) ?? "";
            const htmlClass = html.match(/<html\b[^>]*\sclass\s*=\s*["']([^"']*)["']/i)?.[1]?.split(/\s+/) ?? [];

            if ((app.mode === "dark") !== htmlClass.includes("dark")) add("FAIL", where, `tyohnn.json mode is ${app.mode} but index.html <html> ${app.mode === "dark" ? "lacks" : "has"} dark`);

            const entry = viteEntryModule(html);
            const entryFile = entry ? join(appDir, entry) : null;

            if (entryFile && existsSync(entryFile) && !cssImportsOf(read(entryFile), entryFile).some((specifier) => join(dirname(entryFile), specifier) === cssFile)) add("FAIL", where, `${rel(root, entryFile)} does not import ${app.css}`);

            if (registry)
            {
                const missing = cssFontImports(app.fonts, registry).filter((line) => !css.includes(line));

                if (missing.length) add("FAIL", where, `font CSS not imported: ${missing.join(" ")}`);
                else add("ok", where, `fonts ${[app.fonts.sans, app.fonts.heading, app.fonts.mono].join(" · ")} imported`);
            }
        }

        // Icons
        if (placement.monorepo)
        {
            const tsconfig = readIfExists(join(appDir, app.framework === "vite" && existsSync(join(appDir, "tsconfig.app.json")) ? "tsconfig.app.json" : "tsconfig.json"));
            const target = tsconfig ? parseTsconfig(tsconfig).compilerOptions?.paths?.[placement.iconSpecifier]?.[0] : undefined;
            const library = target?.match(/libraries\/([a-z]+)\.tsx$/)?.[1];

            if (!target) add("FAIL", where, `tsconfig paths has no ${placement.iconSpecifier}: the app would draw ${record.ui.path}'s default icons`);
            else if (library !== app.icons) add("FAIL", where, `tsconfig paths points ${placement.iconSpecifier} at ${target}, tyohnn.json says ${app.icons}`);
            else if (!existsSync(join(appDir, target))) add("FAIL", where, `${placement.iconSpecifier} → ${target} does not exist`);
            else add("ok", where, `icons → ${app.icons}`);

            if (app.framework === "vite")
            {
                const config = ["vite.config.ts", "vite.config.mts", "vite.config.js", "vite.config.mjs"].map((file) => join(appDir, file)).find(existsSync);

                if (!config || !read(config).includes(`libraries/${app.icons}.tsx`)) add("FAIL", where, `vite.config does not alias ${placement.iconSpecifier} to libraries/${app.icons}.tsx`);
            }
        }
        else
        {
            const index = readIfExists(join(placement.iconsDir, "index.ts")) ?? "";
            const library = index.match(/libraries\/([a-z]+)"/)?.[1];

            if (library !== app.icons) add("FAIL", where, `${rel(root, join(placement.iconsDir, "index.ts"))} exports ${library ?? "nothing"}, tyohnn.json says ${app.icons}`);
            else add("ok", where, `icons → ${app.icons}`);
        }

        if (registry && installed)
        {
            const needed = Object.keys({
                ...fontPackages(app.fonts, registry, app.framework),
                ...(placement.monorepo ? {} : registry.iconLibrary(app.icons).packages),
            });
            const notInstalled = needed.filter((name) => !packageDir(appDir, name, root));

            if (notInstalled.length) add("FAIL", where, `not installed: ${notInstalled.join(", ")} (run \`${record.packageManager} install\`)`);
        }

        if (options.built && app.framework === "next") builtCheck(root, record, appPath, add);
    }

    // Project-wide
    const libraries = usedIcons(record);

    if (placement.monorepo && libraries.length > 1)
    {
        add("WARN", "project", `icon libraries diverge: ${Object.entries(record.apps).map(([path, app]) => `${path} ${app.icons}`).join(" · ")} (works through per-app tsconfig paths; one library is simpler)`);
    }

    if (registry && installed && placement.monorepo)
    {
        const needed = Object.keys(Object.assign({}, ...libraries.map((library) => registry.iconLibrary(library).packages)));
        const notInstalled = needed.filter((name) => !packageDir(join(root, record.ui.path), name, root));

        if (notInstalled.length) add("FAIL", "project", `not installed for ${record.ui.path}: ${notInstalled.join(", ")}`);
    }

    const direct = walk(placement.base)
        .filter((file) => /\.(ts|tsx)$/.test(file) && !file.includes("/icons/libraries/") && !file.includes("/icons/check.ts"))
        .filter((file) => ICON_PACKAGE_IMPORT.test(read(file)));

    if (direct.length) add("FAIL", "project", `components import icon packages directly (use ${placement.iconSpecifier}): ${direct.slice(0, 3).map((file) => rel(root, file)).join(", ")}`);

    const missing: string[] = [];
    const changed: string[] = [];

    for (const [path, file] of Object.entries(record.files))
    {
        const content = readIfExists(join(root, path));

        if (content === null) missing.push(path);
        else if (hash(content) !== file.hash) changed.push(path);
    }

    if (missing.length) add("FAIL", "project", `${missing.length} CLI-owned file(s) missing: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? " …" : ""} (run init again to restore)`);
    if (changed.length) add("WARN", "project", `${changed.length} CLI-owned file(s) changed locally: ${changed.slice(0, 4).join(", ")}${changed.length > 4 ? " …" : ""} (kept by later commands unless --force; \`tyohnn diff\` compares with the source)`);
    if (!missing.length && !changed.length) add("ok", "project", `${Object.keys(record.files).length} CLI-owned files match tyohnn.json`);

    if (!registry) add("WARN", "project", "the recorded source is not in the cache: package checks skipped");

    const width = Math.max(7, ...rows.map((row) => row.where.length));

    for (const row of rows)
    {
        const level = row.level === "FAIL" ? color.red("FAIL") : row.level === "WARN" ? color.yellow("WARN") : color.green("ok  ");

        log.info(`${level}  ${row.where.padEnd(width)}  ${row.message}`);
    }

    const failures = rows.filter((row) => row.level === "FAIL").length;
    const warnings = rows.filter((row) => row.level === "WARN").length;

    log.info(failures ? color.red(`doctor: ${failures} failure(s), ${warnings} warning(s)`) : `doctor: no failures${warnings ? `, ${warnings} warning(s)` : ""}`);

    return failures ? 1 : 0;
};

// --built: token values of other systems in the app's built CSS

const channel = (value: number) => Math.round(Math.min(1, Math.max(0, value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)) * 255);
const num = (text: string, percentScale = 1) => (text.endsWith("%") ? (Number.parseFloat(text) / 100) * percentScale : Number.parseFloat(text));

const oklchToRgba = (_: string, body: string) =>
{
    const [colour, alphaText] = body.split("/").map((part) => part.trim());
    const [lText, cText, hText] = colour.split(/\s+/);
    const L = num(lText);
    const C = num(cText, 0.4);
    const h = ((Number.parseFloat(hText) || 0) * Math.PI) / 180;
    const a = C * Math.cos(h);
    const b = C * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const rgb = [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map(channel);

    return `rgba(${rgb.join(",")},${Math.round((alphaText === undefined ? 1 : num(alphaText)) * 100) / 100})`;
};

const hexToRgba = (_: string, hex: string) =>
{
    const full = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join("") : hex;
    const [r, g, b, a = 255] = full.match(/../g)!.map((pair) => Number.parseInt(pair, 16));

    return `rgba(${r},${g},${b},${Math.round((a / 255) * 100) / 100})`;
};

const normalise = (text: string) => text
    .toLowerCase()
    .replace(/oklch\(([^()]*)\)/g, oklchToRgba)
    .replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/g, hexToRgba)
    .replace(/\s+/g, "")
    .replace(/(^|[^0-9])0\./g, "$1.");

const tokenDeclarations = (file: string): Map<string, string> =>
{
    const clean = (readIfExists(file) ?? "").replace(/\/\*[\s\S]*?\*\//g, " ");
    const rows = new Map<string, string>();

    for (const block of clean.matchAll(/(^|[}\s])((?::root|\.dark)(?:\s*,\s*(?::root|\.dark))*)\s*\{([^{}]*)\}/g))
    {
        for (const found of block[3].matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g)) rows.set(normalise(`${found[1]}:${found[2].trim()}`), `${found[1]}: ${found[2].trim()}`);
    }

    return rows;
};

const builtCheck = (root: string, record: NonNullable<ReturnType<typeof readRecord>>, appPath: string, add: (level: Level, where: string, message: string) => void) =>
{
    const app = record.apps[appPath];
    const placement = placementOf(root, record);
    const cssFiles = walk(join(root, appPath, ".next/static")).filter((file) => file.endsWith(".css"));

    if (!cssFiles.length)
    {
        add("WARN", appPath, "--built: no .next/static CSS (run next build)");

        return;
    }

    const output = normalise(cssFiles.map(read).join("\n"));
    const declarations = (system: string) => new Map(["globals.css", "tokens.css"].flatMap((file) => [...tokenDeclarations(join(placement.systemDir(system), file))]));
    const own = declarations(app.system);
    const others = record.ui.systems.filter((name) => name !== app.system);
    const foreign = new Map(others.flatMap((name) => [...declarations(name)]));
    const leaked = [...foreign].filter(([key]) => !own.has(key) && output.includes(key));
    const ownDistinct = [...own.keys()].filter((key) => !foreign.has(key));

    if (leaked.length) add("FAIL", appPath, `built CSS contains ${leaked.length} value(s) only ${others.join("/")} declares, e.g. ${leaked.slice(0, 2).map(([, text]) => text).join(" · ")}`);
    else add("ok", appPath, `built CSS: no ${others.join("/") || "other-system"}-only token values · ${ownDistinct.filter((key) => output.includes(key)).length} of ${ownDistinct.length} ${app.system}-only values present`);
};

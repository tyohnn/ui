// doctor — checks a scaffolded monorepo against tyohnn.json. Needs no tyohnn source.
//
// Per app (recorded, or any workspace app whose globals.css imports <scope>/ui/systems/…):
//   FAIL  no system, or two systems wired into one app's globals.css (same cn-* rules defined twice)
//   FAIL  the wired system differs from tyohnn.json
//   FAIL  import order: tailwindcss → globals → tokens → typeset → typeset-preset → style.css layer(base)
//   FAIL  no @source for packages/ui
//   FAIL  font stacks read next/font variables layout.tsx does not declare · local font files missing after install
//   FAIL  icon alias: tsconfig paths and next.config disagree with each other or with tyohnn.json · library file missing
//   FAIL  transpilePackages lacks <scope>/ui · `dark` on <html> does not match the recorded mode
// Monorepo:
//   WARN  icon libraries diverge across apps (works through per-app aliases; one library is simpler)
//   FAIL  a shared component imports an icon package directly
//   WARN  CLI-owned files changed since they were copied (hashes in tyohnn.json)
// --built: isolation in each app's built CSS (.next/static/**/*.css): FAIL when a token value only another
//   system of packages/ui declares appears; reports how many of the app's own distinctive values were found.

import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { appPaths, expectedImports } from "./app-next.mjs";
import { uiPaths } from "./ui.mjs";
import { hash, posix, read, readJson, walk } from "./util.mjs";

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
const stripTsComments = (source) => source.replace(/^\s*\/\/.*$/gm, "");

/** Top-level :root / .dark custom properties of a CSS file: [{ scope, name, value }] */
const readTokens = (file) =>
{
    const clean = stripComments(read(file));
    const rows = [];

    for (const block of clean.matchAll(/(^|[}\s])((?::root|\.dark)(?:\s*,\s*(?::root|\.dark))*)\s*\{([^{}]*)\}/g))
    {
        for (const found of block[3].matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/g))
        {
            rows.push({ scope: block[2], name: found[1], value: found[2].trim() });
        }
    }

    return rows;
};

const channel = (value) => Math.round(Math.min(1, Math.max(0, value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055)) * 255);
const number = (text, percentScale = 1) => (text.endsWith("%") ? (Number.parseFloat(text) / 100) * percentScale : Number.parseFloat(text));

/** oklch(L C H [/ A]) → rgba(r,g,b,a), so a minifier's hex output and the source's oklch compare equal */
const oklchToRgba = (_, body) =>
{
    const [colour, alphaText] = body.split("/").map((part) => part.trim());
    const [lText, cText, hText] = colour.split(/\s+/);
    const L = number(lText);
    const C = number(cText, 0.4);
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
    const alpha = alphaText === undefined ? 1 : number(alphaText);

    return `rgba(${rgb.join(",")},${Math.round(alpha * 100) / 100})`;
};

const hexToRgba = (_, hex) =>
{
    const full = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join("") : hex;
    const [r, g, b, a = 255] = full.match(/../g).map((pair) => Number.parseInt(pair, 16));

    return `rgba(${r},${g},${b},${Math.round((a / 255) * 100) / 100})`;
};

/** Comparable form of a declaration in source or minified CSS: colours as rgba, no whitespace, no leading zeros */
const normalise = (text) => text
    .toLowerCase()
    .replace(/oklch\(([^()]*)\)/g, oklchToRgba)
    .replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/g, hexToRgba)
    .replace(/\s+/g, "")
    .replace(/(^|[^0-9])0\./g, "$1.");

const workspaceDirs = (target) =>
{
    const globs = readJson(join(target, "package.json"), {}).workspaces ?? [];

    return globs.flatMap((glob) =>
    {
        if (!glob.endsWith("/*")) return existsSync(join(target, glob, "package.json")) ? [glob] : [];

        const base = join(target, glob.slice(0, -2));

        return existsSync(base)
            ? readdirSync(base, { withFileTypes: true }).filter((entry) => entry.isDirectory() && existsSync(join(base, entry.name, "package.json"))).map((entry) => `${glob.slice(0, -2)}/${entry.name}`)
            : [];
    });
};

export const doctor = ({ target, built }) =>
{
    const record = readJson(join(target, "tyohnn.json"));

    if (!record)
    {
        console.error(`FAIL no tyohnn.json in ${target}`);

        return 1;
    }

    const { scope } = record;
    const ui = uiPaths(target, record.ui.path);
    const results = [];
    const fail = (where, message) => results.push({ level: "FAIL", where, message });
    const warn = (where, message) => results.push({ level: "WARN", where, message });
    const ok = (where, message) => results.push({ level: "ok", where, message });
    const escapedScope = scope.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

    const apps = new Set(Object.keys(record.apps));

    for (const dir of workspaceDirs(target))
    {
        const globals = appPaths(target, dir).globals;

        if (existsSync(globals) && new RegExp(`${escapedScope}/ui/systems/`).test(read(globals))) apps.add(dir);
    }

    const iconsByApp = {};

    for (const appPath of [...apps].sort())
    {
        const app = appPaths(target, appPath);
        const recorded = record.apps[appPath];

        if (!recorded) warn(appPath, "wired to a system but not recorded in tyohnn.json");

        if (!existsSync(app.globals))
        {
            fail(appPath, `${posix(relative(target, app.globals))} missing`);
            continue;
        }

        // CSS: one system, in order.
        const css = stripComments(read(app.globals));
        const imports = [...css.matchAll(/@import\s+["']([^"']+)["']\s*([^;]*);/g)].map((match) => ({ spec: match[1], layer: match[2].match(/layer\(([^)]*)\)/)?.[1] ?? null }));
        const systems = [...new Set(imports.map(({ spec }) => spec.match(/\/ui\/systems\/([^/]+)\//)?.[1] ?? spec.match(/src\/systems\/([^/]+)\//)?.[1]).filter(Boolean))];

        if (systems.length === 0)
        {
            fail(appPath, "no system imported in globals.css");
            continue;
        }

        if (systems.length > 1)
        {
            fail(appPath, `${systems.length} systems wired into one app (${systems.join(", ")}): both define the same cn-* rules globally; import exactly one`);
        }
        else ok(appPath, `one system: ${systems[0]}`);

        const system = recorded?.system ?? systems[0];

        if (recorded && !systems.includes(recorded.system)) fail(appPath, `tyohnn.json says ${recorded.system}, globals.css imports ${systems.join(", ")}`);

        const expected = expectedImports(scope, system);
        let previous = -1;
        let ordered = true;

        for (const [spec, layer] of expected)
        {
            const index = imports.findIndex((entry) => entry.spec === spec);

            if (index === -1)
            {
                fail(appPath, `missing @import "${spec}"`);
                ordered = false;
                continue;
            }

            if (index < previous)
            {
                fail(appPath, `@import "${spec}" is out of order (expected tailwindcss → globals → tokens → typeset → typeset-preset → style.css)`);
                ordered = false;
            }

            if (imports[index].layer !== layer)
            {
                fail(appPath, `@import "${spec}" ${layer ? `must be in layer(${layer})` : `must not be in a layer (found layer(${imports[index].layer}))`}`);
                ordered = false;
            }

            previous = Math.max(previous, index);
        }

        if (imports[0]?.spec !== "tailwindcss") fail(appPath, `the first @import must be "tailwindcss" (found "${imports[0]?.spec}")`);
        else if (ordered) ok(appPath, "import order tailwindcss → globals → tokens → typeset → style.css layer(base)");

        const sources = [...css.matchAll(/@source\s+["']([^"']+)["']/g)].map((match) => join(dirname(app.globals), match[1]));

        if (!sources.some((path) => posix(path) === posix(ui.src))) fail(appPath, `no @source for ${record.ui.path}/src: Tailwind will not generate the components' classes`);

        // Fonts.
        const layout = existsSync(app.layout) ? stripTsComments(read(app.layout)) : "";
        const declared = new Set([...layout.matchAll(/variable:\s*"(--[^"]+)"/g)].map((match) => match[1]));
        const stackBlock = css.match(/:root\s*\{[^}]*--font-sans:[^}]*\}/)?.[0] ?? "";
        const used = [...new Set([...stackBlock.matchAll(/var\((--font-(?!(?:sans|heading|mono)\))[^),\s]+)\)/g)].map((match) => match[1]))];
        const missingFonts = used.filter((name) => !declared.has(name));

        if (!stackBlock) warn(appPath, "globals.css does not redeclare the font stacks: next/font families will not match the system's family names");
        else if (missingFonts.length) fail(appPath, `font stacks read ${missingFonts.join(", ")} but layout.tsx declares no such next/font variable`);
        else ok(appPath, `font stacks on next/font variables ${used.join(", ")}`);

        if (existsSync(join(target, "node_modules")))
        {
            const missingFiles = [...layout.matchAll(/path:\s*"([^"]+\.woff2)"/g)].map((match) => match[1]).filter((path) => !existsSync(join(dirname(app.layout), path)));

            if (missingFiles.length) fail(appPath, `next/font/local files not found: ${missingFiles.join(", ")}`);
        }

        // Mode.
        const htmlClass = layout.match(/tyohnnHtmlClassName\s*=\s*\[([^\]]*)\]/)?.[1] ?? "";
        const dark = /"dark"/.test(htmlClass);

        if (recorded && (recorded.mode === "dark") !== dark) fail(appPath, `tyohnn.json mode ${recorded.mode} but <html> ${dark ? "has" : "lacks"} dark`);

        // Icons: tsconfig paths and both bundler aliases point at one library.
        const tsconfig = readJson(app.tsconfig, {});
        const tsTarget = tsconfig.compilerOptions?.paths?.[`${scope}/ui/icons`]?.[0];
        const tsLibrary = tsTarget?.match(/libraries\/([a-z]+)\.tsx$/)?.[1] ?? (tsTarget ? `(${tsTarget})` : null);
        const nextConfig = existsSync(app.nextConfig) ? stripTsComments(read(app.nextConfig)) : "";
        const nextLibraries = [...new Set([...nextConfig.matchAll(/libraries\/([a-z]+)\.tsx/g)].map((match) => match[1]))];
        const libraries = [...new Set([tsLibrary ?? "(packages/ui default)", ...(nextLibraries.length ? nextLibraries : ["(packages/ui default)"])])];

        if (libraries.length > 1) fail(appPath, `icon alias disagrees: tsconfig → ${tsLibrary ?? "none"}, next.config → ${nextLibraries.join(", ") || "none"}`);
        else if (recorded && libraries[0] !== recorded.icons) fail(appPath, `icon alias → ${libraries[0]}, tyohnn.json says ${recorded.icons}`);
        else ok(appPath, `icons → ${libraries[0]} (tsconfig paths · turbopack.resolveAlias · webpack alias)`);

        for (const library of libraries.filter((name) => /^[a-z]+$/.test(name)))
        {
            if (!existsSync(ui.library(library))) fail(appPath, `icon library file ${posix(relative(target, ui.library(library)))} missing`);
        }

        const alias = nextConfig.match(/iconAlias:\s*"([^"]+)"/)?.[1];

        if (alias && !existsSync(join(app.root, alias))) fail(appPath, `next.config iconAlias ${alias} does not exist relative to the app: Turbopack would silently fall back to the packages/ui default`);

        iconsByApp[appPath] = libraries[0];

        if (!new RegExp(`transpilePackages[^\\]]*${escapedScope}/ui`).test(nextConfig)) fail(appPath, `next.config does not transpile ${scope}/ui`);

        // Built CSS isolation.
        if (built)
        {
            const cssFiles = walk(join(app.root, ".next/static")).filter((file) => file.endsWith(".css"));

            if (cssFiles.length === 0)
            {
                warn(appPath, "--built: no .next/static CSS (run next build)");
                continue;
            }

            const output = normalise(cssFiles.map(read).join("\n"));
            const declarations = (name) => new Map(["globals.css", "tokens.css"].flatMap((file) =>
                readTokens(join(ui.systems, name, file)).map((row) => [normalise(`${row.name}:${row.value}`), row])));
            const own = declarations(system);
            const others = record.ui.systems.filter((name) => name !== system);
            const foreignAll = new Map(others.flatMap((name) => [...declarations(name)].map(([key, row]) => [key, { ...row, system: name }])));
            const ownDistinct = [...own.keys()].filter((key) => !foreignAll.has(key));
            const foreignDistinct = [...foreignAll].filter(([key]) => !own.has(key));
            const ownFound = ownDistinct.filter((key) => output.includes(key));
            const leaked = foreignDistinct.filter(([key]) => output.includes(key));

            if (leaked.length) fail(appPath, `built CSS contains ${leaked.length} value(s) only ${others.join("/")} declares, e.g. ${leaked.slice(0, 3).map(([, row]) => `${row.name}: ${row.value}`).join(" · ")}`);
            else ok(appPath, `built CSS: 0 of ${foreignDistinct.length} ${others.join("/")}-only token values · ${ownFound.length} of ${ownDistinct.length} ${system}-only values present`);
        }
    }

    // Monorepo-wide.
    const distinctIcons = [...new Set(Object.values(iconsByApp))];

    if (distinctIcons.length > 1) warn("monorepo", `icon libraries diverge: ${Object.entries(iconsByApp).map(([path, library]) => `${path} ${library}`).join(" · ")} (per-app aliases; one library per monorepo is simpler)`);

    const packagesImported = walk(ui.src)
        .filter((file) => /\/src\/(components|hooks|lib)\//.test(posix(file)) && /\.(ts|tsx)$/.test(file))
        .filter((file) => /from\s+["'](lucide-react|@tabler\/icons-react|@hugeicons\/|@phosphor-icons\/react|@remixicon\/react|@radix-ui\/react-icons)/.test(read(file)));

    if (packagesImported.length) fail("monorepo", `components import icon packages directly: ${packagesImported.map((file) => posix(relative(target, file))).join(", ")}`);

    const changed = Object.entries(record.files ?? {}).filter(([path, digest]) => !existsSync(join(target, path)) || hash(read(join(target, path))) !== digest);

    if (changed.length) warn("monorepo", `${changed.length} CLI-owned file(s) changed since copied: ${changed.slice(0, 5).map(([path]) => path).join(", ")}${changed.length > 5 ? " …" : ""}`);
    else ok("monorepo", `${Object.keys(record.files ?? {}).length} copied files match tyohnn.json`);

    for (const row of results) console.log(`${row.level.padEnd(4)}  ${row.where.padEnd(10)}  ${row.message}`);

    const failures = results.filter((row) => row.level === "FAIL").length;

    console.log(failures ? `doctor: ${failures} failure(s)` : "doctor: no failures");

    return failures ? 1 : 0;
};

// tyohnn init — set up a design system in a Next.js or Vite app, or packages/ui plus a first app in a monorepo.

import { dirname, join } from "node:path";

import { aliasFor, effectivePaths } from "../codemods/tsconfig.js";
import { exists, readJson, rel } from "../lib/fs.js";
import { CliError, log } from "../lib/log.js";
import { inspectApp } from "../project/app.js";
import { detectProject, frameworkOf, isCoveredByWorkspaces, type PackageJson, workspaceDirs, workspaceGlobs } from "../project/detect.js";
import { describeFonts, type FontOverrides, resolveFonts, validateFonts } from "../project/fonts.js";
import { readRecord, RECORD_VERSION, type TyohnnRecord } from "../project/record.js";
import { sync } from "../project/sync.js";
import { openSource } from "../source/index.js";
import type { Registry } from "../source/registry.js";
import { appPathFrom, describeSource, type GlobalOptions, interactive, newChanges, parseMode, printSummary, recordRoot, select, text, workingDir } from "./context.js";

export const initFontOverrides = (options: GlobalOptions): FontOverrides => ({ sans: options.font, heading: options["font-heading"], mono: options["font-mono"] });

const chooseSystem = async (options: GlobalOptions, registry: Registry): Promise<string> =>
{
    if (options.system) return options.system;

    if (!interactive(options)) throw new CliError("no system chosen", `Pass --system <name> (${registry.systems().join(", ")}).`);

    return select("Design system", registry.systems().map((name) =>
    {
        const meta = registry.system(name);

        return { value: name, label: name, hint: meta.description.split(/[.:]/)[0] };
    }));
};

/** The monorepo root whose workspaces include `dir`, if any */
const enclosingMonorepo = (dir: string): string | null =>
{
    let current = dirname(dir);

    while (current !== dirname(current))
    {
        if (exists(join(current, "package.json")))
        {
            const globs = workspaceGlobs(current);

            if (globs.length && isCoveredByWorkspaces(globs, rel(current, dir))) return current;
        }

        current = dirname(current);
    }

    return null;
};

/** "@acme" from a root package named "acme" or "@acme/monorepo" */
export const defaultScope = (rootName: string | undefined): string =>
{
    if (rootName?.startsWith("@")) return rootName.split("/")[0];

    const clean = (rootName ?? "repo").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-+|-+$/g, "");

    return `@${clean || "repo"}`;
};

export const init = async (options: GlobalOptions): Promise<void> =>
{
    const existingRoot = recordRoot(options);
    const root = existingRoot ?? workingDir(options);
    const existing = existingRoot ? readRecord(existingRoot) : null;

    if (existing) return reinit(options, root, existing);

    const project = detectProject(root);
    const parent = project?.kind !== "monorepo" ? enclosingMonorepo(root) : null;

    if (parent)
    {
        throw new CliError(`${root} is an app of the monorepo at ${parent}`, `Run init at the monorepo root with --app ${rel(parent, root)}, so the TSX lands in one shared UI package.`);
    }

    if (!project)
    {
        throw new CliError(`no Next.js app, Vite app or monorepo in ${root}`, "Run init in an app folder (package.json with next or vite) or at the root of a workspaces monorepo.");
    }

    const { registry, info } = await openSource({ source: options.source, ref: options.ref, offline: options.offline, cwd: workingDir(options) });

    log.step(`Source: ${describeSource(info)}`);

    const systemName = await chooseSystem(options, registry);
    const system = registry.system(systemName);
    const icons = options.icons ?? system.icons.library;
    const fonts = resolveFonts(system.fonts, initFontOverrides(options));
    const mode = parseMode(options.mode) ?? system.mode;

    registry.iconLibrary(icons);
    validateFonts(fonts, registry);

    let record: TyohnnRecord;

    if (project.kind === "monorepo")
    {
        const candidates = workspaceDirs(root, project.workspaces).filter((dir) => frameworkOf(readJson<PackageJson>(join(root, dir, "package.json"))));
        const appPath = options.app
            ? appPathFrom(options, root, options.app)
            : interactive(options) && candidates.length
                ? await select("App to set up", candidates.map((dir) => ({ value: dir, label: dir })))
                : null;

        if (!appPath) throw new CliError("which app?", `Pass --app <path>${candidates.length ? ` (${candidates.join(", ")})` : ""}.`);

        const uiPath = options.ui ?? "packages/ui";
        const rootPkg = readJson<PackageJson>(join(root, "package.json"));
        const scopeDefault = defaultScope(rootPkg?.name);
        const scope = options.scope ?? (interactive(options) ? await text("Package scope for the UI package", scopeDefault, (value) => (/^@[a-z0-9][a-z0-9._-]*$/.test(value) ? undefined : "a scope like @acme")) : scopeDefault);

        if (!/^@[a-z0-9][a-z0-9._-]*$/.test(scope)) throw new CliError(`--scope must look like @acme (got "${scope}")`);

        if (exists(join(root, uiPath)) && !options.force)
        {
            const uiName = readJson<PackageJson>(join(root, uiPath, "package.json"))?.name;

            throw new CliError(`${uiPath} already exists${uiName ? ` (${uiName})` : ""} and was not created by tyohnn`, "Pass --ui <another folder> (for example packages/design-system), or --force to write into it.");
        }

        inspectApp(root, appPath);

        if (!isCoveredByWorkspaces(project.workspaces, uiPath)) log.warn(`${uiPath} is not matched by the workspaces (${project.workspaces.join(", ")}): add it so the apps can depend on it`);

        record = {
            version: RECORD_VERSION,
            source: info,
            project: "monorepo",
            packageManager: project.packageManager,
            ui: { path: uiPath, importBase: `${scope}/ui`, systems: [], icons: [] },
            apps: { [appPath]: { framework: inspectApp(root, appPath).framework, system: systemName, icons, fonts, mode, css: "", ...(options.example ? { example: options.example } : {}) } },
            packages: {},
            files: {},
        };
    }
    else
    {
        const app = inspectApp(root, ".");
        const tsconfig = app.tsconfigs[0];
        const paths = effectivePaths(tsconfig);
        const pathsDir = paths ? dirname(paths.from) : root;
        const at = paths?.paths["@/*"]?.[0];
        const base = at?.endsWith("/*") ? rel(root, join(pathsDir, at.slice(0, -2))) : null;
        const srcAlias = aliasFor(paths?.paths, pathsDir, join(root, "src"));
        const [uiPath, importBase] = base ? [base, "@"] : srcAlias ? ["src", srcAlias] : ["src", "@"];

        record = {
            version: RECORD_VERSION,
            source: info,
            project: project.kind,
            packageManager: project.packageManager,
            ui: { path: uiPath, importBase, systems: [], icons: [] },
            apps: { ".": { framework: app.framework, system: systemName, icons, fonts, mode, css: "", ...(options.example ? { example: options.example } : {}) } },
            packages: {},
            files: {},
        };
    }

    if (options.example) registry.templateFiles(options.example);

    const changes = newChanges();
    const [appPath, app] = Object.entries(record.apps)[0];

    log.step(`${systemName} → ${appPath === "." ? "this app" : appPath} · icons ${icons} · ${describeFonts(fonts)} · ${mode} mode`);
    await sync({ root, registry, record, changes, options: { force: Boolean(options.force), install: options.install !== false } });
    printSummary(`Set up ${systemName} in ${project.kind === "monorepo" ? `${record.ui.path} and ${appPath}` : `this ${app.framework === "next" ? "Next.js" : "Vite"} app`}`, changes, root);
    log.info(`\nNext: run the app, then \`tyohnn doctor\`.${project.kind === "monorepo" ? " Add another app with `tyohnn add <system> --app <path>`." : ""}`);
};

/** init on a project that already has tyohnn.json: re-apply the same choices (idempotent), or explain what to use */
const reinit = async (options: GlobalOptions, root: string, record: TyohnnRecord): Promise<void> =>
{
    const appPath = record.project === "monorepo" ? (options.app ? appPathFrom(options, root, options.app) : null) : ".";

    if (record.project === "monorepo" && !appPath) throw new CliError("this monorepo is already set up", "Pass --app <path> to re-apply, `tyohnn add <system> --app <path>` for another app, or `tyohnn use <system> --app <path>`.");

    const app = record.apps[appPath!];

    if (!app) throw new CliError(`${appPath} is not set up yet`, `Use \`tyohnn add <system> --app ${appPath}\`.`);

    if (options.system && options.system !== app.system) throw new CliError(`${appPath === "." ? "this app" : appPath} already uses ${app.system}`, `Switch with \`tyohnn use ${options.system}${appPath === "." ? "" : ` --app ${appPath}`}\`.`);

    const { registry, info } = await openSource({ source: options.source, ref: options.ref, offline: options.offline, cwd: workingDir(options) });
    const system = registry.system(app.system);

    record.source = info;
    if (options.icons) app.icons = options.icons;
    if (options.font || options["font-heading"] || options["font-mono"]) app.fonts = resolveFonts(system.fonts, initFontOverrides(options));
    if (options.mode) app.mode = parseMode(options.mode)!;
    if (options.example) app.example = options.example;

    const changes = newChanges();

    await sync({ root, registry, record, changes, options: { force: Boolean(options.force), install: options.install !== false } });
    printSummary(`${app.system} is set up${appPath === "." ? "" : ` in ${appPath}`}`, changes, root);
};

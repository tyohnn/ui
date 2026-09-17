// tyohnn.json: what the CLI installed, so later commands (add · use · icons · fonts · doctor · diff) can act on it.

import { join } from "node:path";

import { jsonText, readJson, sortKeys, writeFile } from "../lib/fs.js";
import { CliError } from "../lib/log.js";
import type { SourceInfo } from "../source/index.js";
import type { FontsChoice } from "../source/registry.js";
import type { Framework, PackageManager, ProjectKind } from "./detect.js";

export const RECORD_FILE = "tyohnn.json";
export const RECORD_VERSION = 1;

export interface AppRecord
{
    framework: Framework;
    system: string;
    icons: string;
    fonts: FontsChoice;
    mode: "light" | "dark";
    /** Entry CSS, relative to the project root */
    css: string;
    example?: string;
}

export interface FileRecord
{
    /** Source path in the tyohnn repository */
    from: string;
    hash: string;
}

export interface TyohnnRecord
{
    version: number;
    source: SourceInfo;
    project: ProjectKind;
    packageManager: PackageManager;
    ui: {
        /** Monorepo: the UI package folder ("packages/ui"). Single app: the folder the alias maps to ("src") */
        path: string;
        /** Monorepo: the UI package name ("@acme/ui"). Single app: the import alias prefix ("@") */
        importBase: string;
        systems: string[];
        icons: string[];
    };
    apps: Record<string, AppRecord>;
    /** Packages the CLI added, per package.json (project-relative); only these are ever removed again */
    packages: Record<string, string[]>;
    files: Record<string, FileRecord>;
}

export const readRecord = (root: string): TyohnnRecord | null =>
{
    const record = readJson<TyohnnRecord>(join(root, RECORD_FILE));

    if (record && record.version !== RECORD_VERSION)
    {
        throw new CliError(`${RECORD_FILE} has version ${record.version}; this CLI reads version ${RECORD_VERSION}`, "Update the tyohnn CLI.");
    }

    return record;
};

export const requireRecord = (root: string): TyohnnRecord =>
{
    const record = readRecord(root);

    if (!record) throw new CliError(`no ${RECORD_FILE} in ${root}`, "Run `tyohnn init` first (or run this command from the project root).");

    return record;
};

/** Stable key order, so an unchanged project writes an identical file */
export const serializeRecord = (record: TyohnnRecord): string =>
    jsonText({
        version: record.version,
        source: sortKeys(record.source as unknown as Record<string, unknown>),
        project: record.project,
        packageManager: record.packageManager,
        ui: {
            path: record.ui.path,
            importBase: record.ui.importBase,
            systems: [...new Set(record.ui.systems)].sort(),
            icons: [...new Set(record.ui.icons)].sort(),
        },
        apps: sortKeys(Object.fromEntries(Object.entries(record.apps).map(([path, app]) => [path, {
            framework: app.framework,
            system: app.system,
            icons: app.icons,
            fonts: { sans: app.fonts.sans, heading: app.fonts.heading, mono: app.fonts.mono, hangulFallback: app.fonts.hangulFallback },
            mode: app.mode,
            css: app.css,
            ...(app.example ? { example: app.example } : {}),
        }]))),
        packages: sortKeys(Object.fromEntries(Object.entries(record.packages ?? {}).filter(([, names]) => names.length).map(([path, names]) => [path, [...new Set(names)].sort()]))),
        files: sortKeys(Object.fromEntries(Object.entries(record.files).map(([path, file]) => [path, { from: file.from, hash: file.hash }]))),
    });

export const writeRecord = (root: string, record: TyohnnRecord): boolean => writeFile(join(root, RECORD_FILE), serializeRecord(record));

/** Libraries and systems still used by some app */
export const usedIcons = (record: TyohnnRecord): string[] => [...new Set(Object.values(record.apps).map((app) => app.icons))].sort();
export const usedSystems = (record: TyohnnRecord): string[] => [...new Set(Object.values(record.apps).map((app) => app.system))].sort();

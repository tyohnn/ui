// Shared command plumbing: options, the project root, the source, prompts, and the summary.

import { dirname, join, relative, resolve } from "node:path";

import * as prompts from "@clack/prompts";

import { posix } from "../lib/fs.js";
import { Changes, CliError, color, log } from "../lib/log.js";
import { findUp } from "../project/detect.js";
import { RECORD_FILE, type TyohnnRecord } from "../project/record.js";
import { openCachedCommit, openSource, type SourceInfo } from "../source/index.js";
import type { Registry } from "../source/registry.js";

export interface GlobalOptions
{
    cwd?: string;
    source?: string;
    ref?: string;
    offline?: boolean;
    yes?: boolean;
    force?: boolean;
    install?: boolean;
    app?: string;
    icons?: string;
    font?: string;
    "font-heading"?: string;
    "font-mono"?: string;
    sans?: string;
    heading?: string;
    mono?: string;
    mode?: string;
    system?: string;
    ui?: string;
    scope?: string;
    example?: string;
    built?: boolean;
    files?: boolean;
    reset?: boolean;
}

export const workingDir = (options: GlobalOptions): string => resolve(options.cwd ?? process.cwd());

/** The folder holding tyohnn.json, searching upwards from the working directory */
export const recordRoot = (options: GlobalOptions): string | null => findUp(workingDir(options), RECORD_FILE);

export const interactive = (options: GlobalOptions): boolean => !options.yes && Boolean(process.stdin.isTTY && process.stdout.isTTY);

const cancelled = <T>(value: T | symbol): T =>
{
    if (prompts.isCancel(value)) throw new CliError("cancelled");

    return value as T;
};

export const select = async (message: string, choices: { value: string; label: string; hint?: string }[], initial?: string): Promise<string> =>
    cancelled<string>(await prompts.select<string>({ message, options: choices, initialValue: initial }));

export const text = async (message: string, initial: string, validate?: (value: string) => string | undefined): Promise<string> =>
    cancelled<string>(await prompts.text({ message, initialValue: initial, validate: (value) => validate?.(value ?? "") }));

export const parseMode = (mode: string | undefined): "light" | "dark" | undefined =>
{
    if (mode === undefined) return undefined;
    if (mode === "light" || mode === "dark") return mode;

    throw new CliError(`--mode must be light or dark (got "${mode}")`);
};

/** The source for a command on an existing project: --source/--ref when given, else the recorded commit from the cache */
export const openProjectSource = async (options: GlobalOptions, record: TyohnnRecord): Promise<{ registry: Registry; info: SourceInfo }> =>
{
    if (options.source || options.ref) return openSource({ source: options.source, ref: options.ref, offline: options.offline, cwd: workingDir(options) });

    const commit = record.source.commit;
    const cached = commit ? openCachedCommit(commit) : null;

    if (cached) return { registry: cached, info: record.source };

    if (record.source.kind === "github" && commit) return openSource({ ref: commit, offline: options.offline });

    throw new CliError(
        `the source this project was set up from (${record.source.kind}${commit ? ` ${commit.slice(0, 7)}` : ""}) is not in the cache`,
        "Pass --source <tyohnn checkout or tarball> or --ref <branch|tag|commit>.",
    );
};

/** The app a command acts on: --app, the only app, or the app folder the command runs in */
export const resolveAppPath = (options: GlobalOptions, root: string, record: TyohnnRecord): string =>
{
    const apps = Object.keys(record.apps);

    if (options.app)
    {
        const path = posix(relative(root, resolve(workingDir(options), options.app))) || ".";

        if (!record.apps[path]) throw new CliError(`${path} is not set up with tyohnn`, `Apps in ${RECORD_FILE}: ${apps.join(", ")}.${record.project === "monorepo" ? " Use `tyohnn add <system> --app <path>` for a new app." : ""}`);

        return path;
    }

    if (apps.length === 1) return apps[0];

    const cwd = posix(relative(root, workingDir(options)));
    const inside = apps.find((path) => cwd === path || cwd.startsWith(`${path}/`));

    if (inside) return inside;

    throw new CliError("which app?", `Pass --app <path> (${apps.join(", ")}).`);
};

/** An --app value relative to the project root */
export const appPathFrom = (options: GlobalOptions, root: string, value: string): string => posix(relative(root, resolve(workingDir(options), value))) || ".";

export const printSummary = (title: string, changes: Changes, root: string) =>
{
    log.success(title);
    changes.print();
    if (changes.count === 0 && changes.warnings.length === 0) return;
    log.info(color.dim(`  in ${relative(process.cwd(), root) || "."}`));
};

export const describeSource = (info: SourceInfo): string =>
    info.kind === "github" ? `${info.repo}@${info.ref}${info.commit ? ` (${info.commit.slice(0, 7)})` : ""}` : `local source${info.commit ? ` ${info.commit.slice(0, 7)}` : ""}${info.dirty ? " with uncommitted changes" : ""}`;

export const newChanges = () => new Changes();

export { dirname, join };

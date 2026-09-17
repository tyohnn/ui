// Where the registry comes from.
//
//   default            GitHub tarball https://codeload.github.com/<repo>/tar.gz/<ref> (repo tyohnn/ui, ref main),
//                      extracted into the user cache per commit. A branch or tag is resolved again on every run
//                      (falling back to the cached commit when offline); a full commit id is served from the cache.
//   --source <dir>     a tyohnn checkout, read in place
//   --source <file>    a .tar.gz made by `git archive` or downloaded from GitHub; the same extraction as the default

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { CliError, log } from "../lib/log.js";
import { refCacheFile, sourceCacheDir } from "./cache.js";
import { Registry } from "./registry.js";
import { commonRoot, readTar } from "./tar.js";

export const DEFAULT_REPO = "tyohnn/ui";
export const DEFAULT_REF = "main";

export interface SourceOptions
{
    source?: string;
    ref?: string;
    offline?: boolean;
    /** Resolve relative --source paths against this directory */
    cwd?: string;
}

export interface SourceInfo
{
    kind: "github" | "local";
    repo?: string;
    ref?: string;
    commit: string | null;
    dirty?: boolean;
}

/** The paths of the repository the CLI reads; everything else in the tarball is skipped */
export const isNeeded = (path: string): boolean =>
    (path.startsWith("registry/") && !/^registry\/(systems\/[^/]+|foundation)\/reference\//.test(path))
    || path === "apps/preview/package.json"
    || path.startsWith("apps/preview/src/templates/");

const META = ".tyohnn-source.json";

const git = (cwd: string, args: string[]): string | null =>
{
    try
    {
        return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    }
    catch
    {
        return null;
    }
};

/** Extracts the needed part of a tarball into the cache; returns the cache folder and the commit */
export const extractToCache = (archive: Buffer, origin: string): { dir: string; commit: string | null } =>
{
    const { files, commit } = readTar(archive);
    const root = commonRoot(files.map((file) => file.path));
    const kept = files
        .map((file) => ({ path: file.path.slice(root.length), data: file.data }))
        .filter((file) => isNeeded(file.path));

    if (!kept.some((file) => file.path === "registry/ui/manifest.json"))
    {
        throw new CliError(`${origin} is not a tyohnn source (no registry/ui/manifest.json inside)`, "Pass a tarball of the tyohnn repository, e.g. `git archive --format=tar.gz --prefix=tyohnn-main/ HEAD`.");
    }

    const key = commit ?? `archive-${createHash("sha256").update(archive).digest("hex").slice(0, 16)}`;
    const dir = sourceCacheDir(key);

    if (existsSync(join(dir, META))) return { dir, commit };

    const temp = `${dir}.tmp-${process.pid}`;

    rmSync(temp, { recursive: true, force: true });

    for (const file of kept)
    {
        const to = join(temp, file.path);

        mkdirSync(dirname(to), { recursive: true });
        writeFileSync(to, file.data);
    }

    writeFileSync(join(temp, META), `${JSON.stringify({ commit, origin, extractedAt: new Date().toISOString() }, null, 4)}\n`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dirname(dir), { recursive: true });
    renameSync(temp, dir);

    return { dir, commit };
};

const download = async (url: string): Promise<Buffer> =>
{
    const response = await fetch(url, { headers: { "user-agent": "tyohnn-cli" } });

    if (response.status === 404) throw Object.assign(new Error("not found"), { status: 404 });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return Buffer.from(await response.arrayBuffer());
};

const openGithub = async (repo: string, ref: string, offline: boolean): Promise<{ registry: Registry; info: SourceInfo }> =>
{
    const refFile = refCacheFile(repo, ref);
    const cached = existsSync(refFile) ? (JSON.parse(readFileSync(refFile, "utf8")) as { commit: string }) : null;
    const fromCache = (commit: string) =>
    {
        const dir = sourceCacheDir(commit);

        return existsSync(join(dir, META)) ? { registry: new Registry(dir), info: { kind: "github" as const, repo, ref, commit } } : null;
    };

    if (/^[0-9a-f]{40}$/.test(ref))
    {
        const hit = fromCache(ref);

        if (hit) return hit;
    }

    if (offline)
    {
        const hit = cached && fromCache(cached.commit);

        if (hit) return hit;

        throw new CliError(`--offline: ${repo}@${ref} is not in the cache`, "Run once without --offline, or pass --source <path>.");
    }

    const url = `https://codeload.github.com/${repo}/tar.gz/${ref}`;
    let archive: Buffer;

    try
    {
        archive = await download(url);
    }
    catch (error)
    {
        const status = (error as { status?: number }).status;

        if (status === 404) throw new CliError(`${repo}@${ref} was not found on GitHub`, "Check --ref (a branch, tag or commit of the tyohnn repository).");

        const hit = cached && fromCache(cached.commit);

        if (hit)
        {
            log.warn(`could not download ${url} (${(error as Error).message}); using the cached ${ref} at ${cached.commit.slice(0, 7)}`);

            return hit;
        }

        throw new CliError(`could not download ${url}: ${(error as Error).message}`, "Check your network, or pass --source <tyohnn checkout or tarball>.");
    }

    const { dir, commit } = extractToCache(archive, url);

    if (commit)
    {
        mkdirSync(dirname(refFile), { recursive: true });
        writeFileSync(refFile, `${JSON.stringify({ commit, fetchedAt: new Date().toISOString() }, null, 4)}\n`);
    }

    return { registry: new Registry(dir), info: { kind: "github", repo, ref, commit } };
};

export const openSource = async (options: SourceOptions = {}): Promise<{ registry: Registry; info: SourceInfo }> =>
{
    if (options.source)
    {
        const path = resolve(options.cwd ?? process.cwd(), options.source);

        if (!existsSync(path)) throw new CliError(`--source ${options.source} does not exist`);

        if (statSync(path).isDirectory())
        {
            if (!existsSync(join(path, "registry/ui/manifest.json")))
            {
                throw new CliError(`--source ${options.source} is not a tyohnn checkout (no registry/ui/manifest.json)`);
            }

            const commit = git(path, ["rev-parse", "HEAD"]);
            const dirty = commit ? Boolean(git(path, ["status", "--porcelain", "--", "registry", "apps/preview/src/templates"])) : undefined;

            return { registry: new Registry(path), info: { kind: "local", commit, ...(dirty ? { dirty } : {}) } };
        }

        const { dir, commit } = extractToCache(readFileSync(path), options.source);

        return { registry: new Registry(dir), info: { kind: "local", commit } };
    }

    return openGithub(process.env.TYOHNN_REPO ?? DEFAULT_REPO, options.ref ?? DEFAULT_REF, Boolean(options.offline));
};

/** The cached source of a recorded commit, if any (diff uses it without a network round trip) */
export const openCachedCommit = (commit: string): Registry | null =>
{
    const dir = sourceCacheDir(commit);

    return existsSync(join(dir, META)) ? new Registry(dir) : null;
};

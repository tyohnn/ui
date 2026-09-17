// Writes CLI-owned files (copied or generated whole) with their hashes in tyohnn.json.
//
// A file is only overwritten when it is new, unchanged since the CLI wrote it, or already identical. A file the user
// changed is kept (reported; `--force` overwrites), and a file that exists but was never written by the CLI stops the
// command before anything is written.

import { dirname } from "node:path";

import { hash, readIfExists, rel, removeFile, pruneEmptyDirs, writeFile } from "../lib/fs.js";
import { type Changes, CliError } from "../lib/log.js";
import type { TyohnnRecord } from "./record.js";

interface Planned
{
    to: string;
    from: string;
    content: string;
}

export class OwnedFiles
{
    private readonly planned = new Map<string, Planned>();

    constructor(
        private readonly root: string,
        private readonly record: TyohnnRecord,
        private readonly changes: Changes,
        private readonly force: boolean,
    ) {}

    plan(to: string, from: string, content: string)
    {
        this.planned.set(rel(this.root, to), { to, from, content });
    }

    get plannedPaths(): Set<string>
    {
        return new Set(this.planned.keys());
    }

    /** Unrecorded files in the way; call before writing anything */
    conflicts(): string[]
    {
        if (this.force) return [];

        return [...this.planned].filter(([path, file]) =>
        {
            const existing = readIfExists(file.to);

            return existing !== null && existing !== file.content && !this.record.files[path];
        }).map(([path]) => path);
    }

    assertNoConflicts()
    {
        const conflicts = this.conflicts();

        if (conflicts.length)
        {
            const list = conflicts.slice(0, 8).join(", ") + (conflicts.length > 8 ? ` and ${conflicts.length - 8} more` : "");

            throw new CliError(`${conflicts.length} file(s) already exist and were not created by tyohnn: ${list}`, "Move or delete them, or pass --force to overwrite them.");
        }
    }

    write()
    {
        for (const [path, file] of this.planned)
        {
            const existing = readIfExists(file.to);
            const recorded = this.record.files[path];

            if (existing !== null && existing !== file.content && recorded && hash(existing) !== recorded.hash && !this.force)
            {
                this.changes.warn(`kept ${path}: changed locally since tyohnn wrote it (--force overwrites)`);
                continue;
            }

            if (writeFile(file.to, file.content)) this.changes.wrote(path);
            this.record.files[path] = { from: file.from, hash: hash(file.content) };
        }
    }

    /** Removes recorded files this run did not plan (a system, icon library or component that is no longer used) */
    prune()
    {
        const planned = this.plannedPaths;

        for (const [path, file] of Object.entries(this.record.files))
        {
            if (planned.has(path)) continue;

            const absolute = `${this.root}/${path}`;
            const existing = readIfExists(absolute);

            if (existing !== null && hash(existing) !== file.hash && !this.force)
            {
                this.changes.warn(`kept ${path}: no longer used, but changed locally (delete it by hand)`);
                delete this.record.files[path];
                continue;
            }

            if (removeFile(absolute))
            {
                this.changes.removedFile(path);
                pruneEmptyDirs(dirname(absolute), this.root);
            }

            delete this.record.files[path];
        }
    }
}

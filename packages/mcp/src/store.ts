import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Draft } from "./export";
import type { SystemState } from "./system";

/**
 * Where published systems live. A published system is small: its name and concept, the base system it was shaped
 * from, and the colour and token changes over that base (SystemState). The CSS is rebuilt from the base on export,
 * so a published system keeps working when the base gains a component.
 *
 * The port is the store's operations, nothing more; which names may be published is `publishVerdict`, and
 * `publishSystem` puts the two together. Adapters: a folder of JSON files (the local server keeps them under the
 * checkout's .tyohnn/published), Postgres (`@tyohnn/adapters-postgres`, the hosted server with a database) and
 * closedStore (the hosted server without one). One contract (`testing/contracts.ts`) runs against each.
 */

export interface PublishedSystem
{
    /** The id a person shares: the system's name, unique in the store */
    id: string;
    draft: Draft;
    state: SystemState;
    publishedAt: string;
}

export interface SystemStore
{
    /** Every published system, the newest first */
    list(): Promise<PublishedSystem[]>;
    /** The system published under `id`, or undefined (also for an id that is not a name) */
    get(id: string): Promise<PublishedSystem | undefined>;
    /** Keeps a new system; "taken" when one is already published under its id, which is then left as it was */
    add(system: PublishedSystem): Promise<"added" | "taken">;
    /** Keeps a system under its id whether or not one is there, publishing over it */
    put(system: PublishedSystem): Promise<void>;
}

export const NAME = /^[a-z][a-z0-9-]{1,39}$/;

/** Why `name` cannot be published, or null when it can. `reserved` holds the base systems' names */
export const publishVerdict = (name: string, reserved: ReadonlySet<string>): string | null =>
{
    if (!NAME.test(name)) return `“${name}” is not a system name: lower-case letters, digits and hyphens, 2 to 40, starting with a letter.`;
    if (reserved.has(name)) return `“${name}” is a base system's name. Pick another.`;

    return null;
};

/** What closedStore throws on a write; publishSystem answers with its message */
export class StoreClosed extends Error
{}

export interface PublishOptions
{
    /** Publish over a system already published under this name */
    replace?: boolean;
    /** The base systems' names, which no published system may take */
    reserved: ReadonlySet<string>;
    now?: () => Date;
}

/** Publishes a drafted system under its name, or says why not */
export const publishSystem = async (
    store: SystemStore,
    system: Pick<PublishedSystem, "draft" | "state">,
    options: PublishOptions,
): Promise<PublishedSystem | { error: string }> =>
{
    const id = system.draft.name;
    const refused = publishVerdict(id, options.reserved);

    if (refused) return { error: refused };

    const entry: PublishedSystem = { id, draft: system.draft, state: system.state, publishedAt: (options.now ?? (() => new Date()))().toISOString() };

    try
    {
        if (options.replace) await store.put(entry);
        else if (await store.add(entry) === "taken") return { error: `“${id}” is already published. Pass replace: true to publish over it.` };
    }
    catch (error)
    {
        if (error instanceof StoreClosed) return { error: error.message };

        throw error;
    }

    return entry;
};

export const folderStore = (dir: string): SystemStore =>
{
    const path = (id: string) => join(dir, `${id}.json`);
    const read = (id: string) => (existsSync(path(id)) ? JSON.parse(readFileSync(path(id), "utf8")) as PublishedSystem : undefined);
    const write = (system: PublishedSystem) =>
    {
        mkdirSync(dir, { recursive: true });
        writeFileSync(path(system.id), `${JSON.stringify(system, null, 4)}\n`);
    };

    return {
        async list()
        {
            if (!existsSync(dir)) return [];

            return readdirSync(dir)
                .filter((name) => name.endsWith(".json"))
                .map((name) => read(name.slice(0, -5)))
                .filter((entry): entry is PublishedSystem => entry !== undefined)
                .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        },
        async get(id)
        {
            return NAME.test(id) ? read(id) : undefined;
        },
        async add(system)
        {
            // The id is the file name, so it must be a name even when a caller skipped publishVerdict
            if (!NAME.test(system.id) || read(system.id)) return "taken";

            write(system);

            return "added";
        },
        async put(system)
        {
            if (!NAME.test(system.id)) throw new Error(`“${system.id}” is not a system name`);

            write(system);
        },
    };
};

/**
 * A store with nothing in it that refuses to publish: the hosted server's when it has no database. A folder under the
 * function's file system would be lost between requests, so it does not pretend to keep anything.
 */
export const closedStore = (reason: string): SystemStore => ({
    async list()
    {
        return [];
    },
    async get()
    {
        return undefined;
    },
    async add()
    {
        throw new StoreClosed(reason);
    },
    async put()
    {
        throw new StoreClosed(reason);
    },
});

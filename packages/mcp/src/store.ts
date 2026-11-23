import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { Clock, Context, Effect, Layer, Schema } from "effect";

import type { Draft } from "./export";
import type { SystemState } from "./system";

/**
 * Where published systems live. A published system is small: its name and concept, the base system it was shaped
 * from, and the colour and token changes over that base (SystemState). The CSS is rebuilt from the base on export,
 * so a published system keeps working when the base gains a component.
 *
 * The port is the store's operations, nothing more; which names may be published is `publishVerdict`, and
 * `publishSystem` puts the two together. Adapters are Layers: a folder of JSON files (systemStoreFolder, the local
 * server's, under the checkout's .tyohnn/published), Postgres (`@tyohnn/adapters-postgres`, the hosted server with a
 * database) and systemStoreClosed (the hosted server without one). One contract (`testing/contracts.ts`) runs against
 * each.
 */

export interface PublishedSystem
{
    /** The id a person shares: the system's name, unique in the store */
    id: string;
    draft: Draft;
    state: SystemState;
    publishedAt: string;
}

/** The store could not be read or written */
export class SystemStoreError extends Schema.TaggedError<SystemStoreError>()("SystemStoreError", { message: Schema.String })
{}

/** The store keeps nothing: publishing is not open where this server runs */
export class StoreClosed extends Schema.TaggedError<StoreClosed>()("StoreClosed", { reason: Schema.String })
{}

export class SystemStore extends Context.Service<SystemStore, {
    /** Every published system, the newest first */
    readonly list: () => Effect.Effect<PublishedSystem[], SystemStoreError>;
    /** The system published under `id`, or undefined (also for an id that is not a name) */
    readonly get: (id: string) => Effect.Effect<PublishedSystem | undefined, SystemStoreError>;
    /** Keeps a new system; "taken" when one is already published under its id, which is then left as it was */
    readonly add: (system: PublishedSystem) => Effect.Effect<"added" | "taken", SystemStoreError | StoreClosed>;
    /** Keeps a system under its id whether or not one is there, publishing over it */
    readonly put: (system: PublishedSystem) => Effect.Effect<void, SystemStoreError | StoreClosed>;
}>()("@tyohnn/mcp/SystemStore")
{}

export const NAME = /^[a-z][a-z0-9-]{1,39}$/;

/** Why `name` cannot be published, or null when it can. `reserved` holds the base systems' names */
export const publishVerdict = (name: string, reserved: ReadonlySet<string>): string | null =>
{
    if (!NAME.test(name)) return `“${name}” is not a system name: lower-case letters, digits and hyphens, 2 to 40, starting with a letter.`;
    if (reserved.has(name)) return `“${name}” is a base system's name. Pick another.`;

    return null;
};

/** Why a system was not published, in words for the person */
export class PublishRefused extends Schema.TaggedError<PublishRefused>()("PublishRefused", { message: Schema.String })
{}

export interface PublishOptions
{
    /** Publish over a system already published under this name */
    replace?: boolean;
    /** The base systems' names, which no published system may take */
    reserved: ReadonlySet<string>;
}

/** Publishes a drafted system under its name, stamped with the clock's time, or says why not */
export const publishSystem = (system: Pick<PublishedSystem, "draft" | "state">, options: PublishOptions) =>
    Effect.gen(function*()
    {
        const id = system.draft.name;
        const refused = publishVerdict(id, options.reserved);

        if (refused) return yield* new PublishRefused({ message: refused });

        const store = yield* SystemStore;
        const entry: PublishedSystem = { id, draft: system.draft, state: system.state, publishedAt: new Date(yield* Clock.currentTimeMillis).toISOString() };

        if (options.replace) yield* store.put(entry);
        else if ((yield* store.add(entry)) === "taken") return yield* new PublishRefused({ message: `“${id}” is already published. Pass replace: true to publish over it.` });

        return entry;
    }).pipe(Effect.catchTag("StoreClosed", (closed) => Effect.fail(new PublishRefused({ message: closed.reason }))));

const failure = (operation: string) => (cause: unknown) => new SystemStoreError({ message: `${operation}: ${String(cause)}` });

/** Published systems as JSON files in `dir`, one per system, named by its id */
export const systemStoreFolder = (dir: string): Layer.Layer<SystemStore> =>
{
    const path = (id: string) => join(dir, `${id}.json`);
    const read = (id: string) => (existsSync(path(id)) ? JSON.parse(readFileSync(path(id), "utf8")) as PublishedSystem : undefined);
    const write = (system: PublishedSystem) =>
    {
        mkdirSync(dir, { recursive: true });
        writeFileSync(path(system.id), `${JSON.stringify(system, null, 4)}\n`);
    };

    return Layer.succeed(SystemStore, SystemStore.of({
        list: () => Effect.try({
            try: () => (existsSync(dir) ? readdirSync(dir) : [])
                .filter((name) => name.endsWith(".json"))
                .map((name) => read(name.slice(0, -5)))
                .filter((entry): entry is PublishedSystem => entry !== undefined)
                .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
            catch: failure("listing published systems"),
        }),
        get: (id) => (NAME.test(id) ? Effect.try({ try: () => read(id), catch: failure(`reading ${id}`) }) : Effect.succeed(undefined)),
        add: (system) => Effect.try({
            try: () =>
            {
                // The id is the file name, so it must be a name even when a caller skipped publishVerdict
                if (!NAME.test(system.id) || read(system.id)) return "taken" as const;

                write(system);

                return "added" as const;
            },
            catch: failure(`publishing ${system.id}`),
        }),
        put: (system) => (NAME.test(system.id)
            ? Effect.try({ try: () => write(system), catch: failure(`publishing ${system.id}`) })
            : Effect.fail(new SystemStoreError({ message: `“${system.id}” is not a system name` }))),
    }));
};

/**
 * A store with nothing in it that refuses to publish: the hosted server's when it has no database. A folder under the
 * function's file system would be lost between requests, so it does not pretend to keep anything.
 */
export const systemStoreClosed = (reason: string): Layer.Layer<SystemStore> =>
    Layer.succeed(SystemStore, SystemStore.of({
        list: () => Effect.succeed([]),
        get: () => Effect.succeed(undefined),
        add: () => Effect.fail(new StoreClosed({ reason })),
        put: () => Effect.fail(new StoreClosed({ reason })),
    }));

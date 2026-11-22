import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Draft } from "./export";
import type { SystemState } from "./system";

/**
 * Where published systems live. A published system is small: its name and concept, the base system it was shaped
 * from, and the colour and token changes over that base (SystemState). The CSS is rebuilt from the base on export,
 * so a published system keeps working when the base gains a component.
 *
 * The port has one adapter here, a folder of JSON files (the local server keeps them under the checkout's
 * .tyohnn/published). The hosted server swaps in a database adapter with the same three methods.
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
    list(): Promise<PublishedSystem[]>;
    get(id: string): Promise<PublishedSystem | undefined>;
    /** Refuses a name already taken by another base system or a published one, unless `replace` */
    publish(system: Omit<PublishedSystem, "id" | "publishedAt">, options?: { replace?: boolean }): Promise<PublishedSystem | { error: string }>;
}

export const NAME = /^[a-z][a-z0-9-]{1,39}$/;

export const folderStore = (dir: string, reserved: Set<string>, now: () => Date = () => new Date()): SystemStore =>
{
    const path = (id: string) => join(dir, `${id}.json`);
    const read = (id: string) => (existsSync(path(id)) ? JSON.parse(readFileSync(path(id), "utf8")) as PublishedSystem : undefined);

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
        async publish(system, options = {})
        {
            const id = system.draft.name;

            if (!NAME.test(id)) return { error: `“${id}” is not a system name: lower-case letters, digits and hyphens, 2 to 40, starting with a letter.` };
            if (reserved.has(id)) return { error: `“${id}” is a base system's name. Pick another.` };
            if (read(id) && !options.replace) return { error: `“${id}” is already published. Pass replace: true to publish over it.` };

            const entry: PublishedSystem = { id, draft: system.draft, state: system.state, publishedAt: now().toISOString() };

            mkdirSync(dir, { recursive: true });
            writeFileSync(path(id), `${JSON.stringify(entry, null, 4)}\n`);

            return entry;
        },
    };
};

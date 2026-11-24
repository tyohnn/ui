// The tyohnn plugin's MCP server, hosted: plugin/.mcp.json points here (https://tyohnn.vercel.app/api/mcp).
// It is the stdio server of packages/mcp over Streamable HTTP (packages/mcp/src/http.ts), reading the registry the
// site was built from. A hosted server writes no files: export_system returns them instead.
//
// With SITE_DATABASE_URL set, published systems and the system each connection is shaping live in Postgres
// (supabase/migrations, @tyohnn/adapters-postgres), so a request may land on any instance. Without it, publishing is
// refused (systemStoreClosed) and sessions live in the function's memory: Vercel usually reuses a warm instance, and when a
// request lands on another the client is told 404 and starts over.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { poolExecutor, postgresPool } from "@tyohnn/adapters-postgres/connection";
import { sessionStorePostgres } from "@tyohnn/adapters-postgres/systems/sessionStorePostgres";
import { systemStorePostgres } from "@tyohnn/adapters-postgres/systems/systemStorePostgres";
import { createHttpHandler } from "@tyohnn/mcp/http";
import { sessionStoreMemory } from "@tyohnn/mcp/sessions";
import { systemStoreClosed } from "@tyohnn/mcp/store";
import { Layer } from "effect";

export const dynamic = "force-dynamic";

/** The repository root: the first folder up from the working directory that holds the registry */
const findRoot = (from: string): string =>
{
    if (existsSync(join(from, "registry/presets.json"))) return from;
    if (dirname(from) === from) throw new Error(`No registry/presets.json above ${process.cwd()}`);

    return findRoot(dirname(from));
};

const root = findRoot(process.cwd());

/** Where published systems and sessions live: Postgres when the site has a database, otherwise nowhere lasting */
const stores = () =>
{
    const url = process.env.SITE_DATABASE_URL;

    if (url)
    {
        const sql = poolExecutor(postgresPool(url));

        return Layer.mergeAll(systemStorePostgres(sql), sessionStorePostgres(sql));
    }

    return Layer.mergeAll(
        systemStoreClosed("Publishing is not open on the hosted server yet. Export the system and keep its files in the app, or run the server from a checkout (plugin/README.md) to publish."),
        sessionStoreMemory(),
    );
};

const handler = createHttpHandler({
    root,
    previewBase: process.env.TYOHNN_PREVIEW_BASE ?? "https://tyohnn.vercel.app/preview",
    widgetHtml: readFileSync(join(root, "packages/mcp/dist/widget.html"), "utf8"),
    systemHtml: readFileSync(join(root, "packages/mcp/dist/system.html"), "utf8"),
    layer: stores(),
});

export const POST = (request: Request) => handler(request);
export const GET = (request: Request) => handler(request);
export const DELETE = (request: Request) => handler(request);

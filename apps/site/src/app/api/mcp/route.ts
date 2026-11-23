// The tyohnn plugin's MCP server, hosted: plugin/.mcp.json points here (https://tyohnn.vercel.app/api/mcp).
// It is the stdio server of packages/mcp over Streamable HTTP (packages/mcp/src/http.ts), reading the registry the
// site was built from. A hosted server writes nothing: export_system returns the files, and publishing waits for a
// database (closedStore).
//
// Sessions live in the function's memory. Vercel reuses a warm instance for the next request, so a session usually
// lasts; when a request lands on another instance the id is unknown, the client is told 404 and starts a new session,
// and the system it was shaping starts over. A shared store (the SessionStore port, packages/mcp/src/sessions.ts) removes that.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { createHttpHandler } from "@tyohnn/mcp/http";
import { memorySessions } from "@tyohnn/mcp/sessions";
import { closedStore } from "@tyohnn/mcp/store";

export const dynamic = "force-dynamic";

/** The repository root: the first folder up from the working directory that holds the registry */
const findRoot = (from: string): string =>
{
    if (existsSync(join(from, "registry/presets.json"))) return from;
    if (dirname(from) === from) throw new Error(`No registry/presets.json above ${process.cwd()}`);

    return findRoot(dirname(from));
};

const root = findRoot(process.cwd());

const handler = createHttpHandler({
    root,
    previewBase: process.env.TYOHNN_PREVIEW_BASE ?? "https://tyohnn.vercel.app/preview",
    widgetHtml: readFileSync(join(root, "packages/mcp/dist/widget.html"), "utf8"),
    systemHtml: readFileSync(join(root, "packages/mcp/dist/system.html"), "utf8"),
    store: closedStore("Publishing is not open on the hosted server yet. Export the system and keep its files in the app, or run the server from a checkout (plugin/README.md) to publish."),
    sessions: memorySessions(),
});

export const POST = (request: Request) => handler(request);
export const GET = (request: Request) => handler(request);
export const DELETE = (request: Request) => handler(request);

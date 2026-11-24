// tyohnn-mcp — the tyohnn plugin's MCP server over stdio.
//
//   claude mcp add tyohnn -- node packages/mcp/dist/index.js
//
// --root <path>          the tyohnn/ui checkout to read (default: the one this file was built in)
// --preview-base <url>   where the built previews are served (default: the site's)
// --store <path>         the folder published systems are kept in (default: <root>/.tyohnn/published)
//
// Over stdio the server runs on the person's machine, so export_system may write a system into a folder they name.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer, runWith } from "./server";
import { systemStoreFolder } from "./store";

const { values } = parseArgs({
    options: {
        "root": { type: "string" },
        "preview-base": { type: "string" },
        "store": { type: "string" },
    },
});

const root = values.root ?? fileURLToPath(new URL("../../..", import.meta.url));
const previewBase = values["preview-base"] ?? process.env.TYOHNN_PREVIEW_BASE ?? "https://tyohnn.vercel.app/preview";

const run = runWith(systemStoreFolder(values.store ?? join(root, ".tyohnn/published")));

// The views are built next to this file (dist/widget.html, dist/system.html)
const widgetHtml = readFileSync(new URL("./widget.html", import.meta.url), "utf8");
const systemHtml = readFileSync(new URL("./system.html", import.meta.url), "utf8");

const server = createServer({ root, previewBase, widgetHtml, systemHtml, run, canWrite: true });

await server.connect(new StdioServerTransport());

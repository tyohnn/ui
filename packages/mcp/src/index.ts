// tyohnn-mcp — the tyohnn plugin's MCP server over stdio.
//
//   claude mcp add tyohnn -- node packages/mcp/dist/index.js
//
// --root <path>          the tyohnn/ui checkout to read (default: the one this file was built in)
// --preview-base <url>   where the built previews are served (default: the site's)

import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer } from "./server";

const { values } = parseArgs({
    options: {
        "root": { type: "string" },
        "preview-base": { type: "string" },
    },
});

const root = values.root ?? fileURLToPath(new URL("../../..", import.meta.url));
const previewBase = values["preview-base"] ?? process.env.TYOHNN_PREVIEW_BASE ?? "https://tyohnn.vercel.app/preview";

const server = createServer({ root, previewBase });

await server.connect(new StdioServerTransport());

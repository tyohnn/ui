// serve — a static server for the exported site (out/), for local checks only.
//
//   node scripts/serve.mjs [--port 5210] [--dir out]
//
// Resolves /path, /path.html and /path/index.html like a static host.

import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index > 0 ? process.argv[index + 1] : fallback;
};
const port = Number(arg("port", "5210"));
const root = join(siteRoot, arg("dir", "out"));

const TYPES = {
    ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
    ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".txt": "text/plain", ".ico": "image/x-icon", ".png": "image/png",
};

const resolve = (pathname) =>
{
    const base = join(root, normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, ""));

    for (const candidate of [base, `${base}.html`, join(base, "index.html")])
    {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }

    return null;
};

createServer((request, response) =>
{
    const file = resolve(new URL(request.url ?? "/", "http://localhost").pathname);
    const target = file ?? resolve("/404");

    response.writeHead(file ? 200 : 404, { "content-type": TYPES[extname(target ?? "")] ?? "application/octet-stream" });
    if (target) createReadStream(target).pipe(response);
    else response.end("not found");
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));

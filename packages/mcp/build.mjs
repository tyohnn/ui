// Builds the server (dist/index.js) and the view (dist/widget.html, one file with its script inlined:
// an MCP Apps host loads the view as a single HTML resource).

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { build } from "esbuild";

mkdirSync("dist", { recursive: true });

const view = await build({
    entryPoints: ["src/widget/widget.ts"],
    bundle: true,
    format: "esm",
    target: "es2022",
    minify: true,
    write: false,
    logLevel: "warning",
});

const script = view.outputFiles[0].text.replaceAll("</script", "<\\/script");

writeFileSync("dist/widget.html", readFileSync("src/widget/index.html", "utf8").replace("/*WIDGET_SCRIPT*/", () => script));

await build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    // The server reads the registry at start; nothing from it is bundled except coverage/groups.ts
    packages: "external",
    banner: { js: "#!/usr/bin/env node" },
    logLevel: "warning",
});

chmodSync("dist/index.js", 0o755);

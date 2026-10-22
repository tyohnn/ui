// Builds the server (dist/index.js) and the views (dist/widget.html and dist/system.html, each one file with its
// script inlined: an MCP Apps host loads a view as a single HTML resource).

import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { build } from "esbuild";

mkdirSync("dist", { recursive: true });

/** One view: its script bundled and inlined into its page */
const bundleView = async (entry, page, out) =>
{
    const view = await build({
        entryPoints: [entry],
        bundle: true,
        format: "esm",
        target: "es2022",
        minify: true,
        write: false,
        logLevel: "warning",
    });

    const script = view.outputFiles[0].text.replaceAll("</script", "<\\/script");

    writeFileSync(out, readFileSync(page, "utf8").replace("/*WIDGET_SCRIPT*/", () => script));
};

await bundleView("src/widget/widget.ts", "src/widget/index.html", "dist/widget.html");
await bundleView("src/widget/system.ts", "src/widget/system.html", "dist/system.html");

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

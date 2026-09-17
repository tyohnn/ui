// Bundles src/index.ts and its dependencies into one ESM file: the published package has no runtime dependencies.

import { chmodSync, readFileSync } from "node:fs";

import { build } from "esbuild";

const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

await build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    // jsonc-parser's "main" is a UMD build with dynamic requires; its ESM build bundles cleanly.
    mainFields: ["module", "main"],
    minify: true,
    legalComments: "eof",
    define: { __TYOHNN_VERSION__: JSON.stringify(version) },
    // Bundled CommonJS dependencies call require(); give the ESM bundle one.
    banner: { js: '#!/usr/bin/env node\nimport { createRequire as __tyohnnCreateRequire } from "node:module";\nconst require = __tyohnnCreateRequire(import.meta.url);' },
    logLevel: "warning",
});

chmodSync("dist/index.js", 0o755);

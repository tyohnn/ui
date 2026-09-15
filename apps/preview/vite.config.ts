import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

/**
 * The page loads exactly one stylesheet: dist/themes/<theme>/compiled.css, built by
 * tooling/compose-theme. `dist/` is served as the public directory, so the file lives at
 * /themes/<theme>/compiled.css. The app bundles no Tailwind of its own.
 */
export default defineConfig({
    plugins: [react()],
    publicDir: `${repoRoot}dist`,
    resolve: {
        // Placeholder alias, not a package: @tyohnn/{components,lib,hooks}/* → registry/foundation/…
        // (@tyohnn/foundation and the tooling packages are untouched by this pattern).
        alias: [{ find: /^@tyohnn\/(components|lib|hooks)\//, replacement: `${repoRoot}registry/foundation/$1/` }],
    },
    server: {
        fs: { allow: [repoRoot] },
    },
});

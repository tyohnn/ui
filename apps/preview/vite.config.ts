import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

/**
 * The page loads exactly one stylesheet: dist/systems/<system>/compiled.css, built by
 * tooling/build-system. `dist/` is served as the public directory, so the file lives at
 * /systems/<system>/compiled.css. The app bundles no Tailwind of its own.
 */
export default defineConfig({
    plugins: [react()],
    publicDir: `${repoRoot}dist`,
    resolve: {
        // Placeholder alias, not a package: @tyohnn/{components,lib,hooks}/* → registry/ui/…
        // (@tyohnn/ui and the tooling packages are untouched by this pattern).
        alias: [{ find: /^@tyohnn\/(components|lib|hooks)\//, replacement: `${repoRoot}registry/ui/$1/` }],
    },
    server: {
        fs: { allow: [repoRoot] },
    },
});

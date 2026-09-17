import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

/**
 * Static export (out/) for static hosting. The site renders registry/ui components with the mira system
 * (src/app/globals.css); the galleries embed the per-system preview builds from public/preview/<system>/
 * (scripts/build-previews.mjs), so every iframe runs one system in its own document.
 */
const nextConfig: NextConfig = {
    output: "export",
    // registry/ui lives outside the app: compile it and resolve its imports from the repository root.
    transpilePackages: ["@tyohnn/ui"],
    turbopack: { root: repoRoot },
    images: { unoptimized: true },
    devIndicators: false,
};

export default nextConfig;

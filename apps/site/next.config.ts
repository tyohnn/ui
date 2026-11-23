import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

/**
 * The pages are prerendered at build time; one route runs on request: /api/mcp, the plugin's MCP server
 * (src/app/api/mcp/route.ts). The site draws its own chrome (src/app/site.css); every system screen is an iframe of
 * a per-system preview build from public/preview/<system>/ (scripts/build-previews.mjs), so each one runs one
 * system in its own document.
 *
 * vercel.json rewrites /preview/<system>/index.html to /preview/<system>/index: under the old static export Vercel
 * stored public .html files without the extension. A Next build keeps index.html (`vercel build` puts it in
 * .vercel/output/static as is) and the file system answers before the rewrite, so the rewrite only matters if that
 * changes again.
 */
const nextConfig: NextConfig = {
    // SITE_DIST_DIR=.next-check builds into another folder, so a check build never replaces the .next a running
    // `npm run serve` reads.
    ...(process.env.SITE_DIST_DIR ? { distDir: process.env.SITE_DIST_DIR } : {}),
    // The MCP route reads the registry at run time, so the function carries the files it reads
    outputFileTracingRoot: repoRoot,
    outputFileTracingIncludes: {
        "/api/mcp": [
            "../../registry/presets.json",
            "../../registry/themes/**/*.json",
            "../../registry/ui/components/**/*",
            "../../registry/systems/*/system.json",
            "../../registry/systems/*/DESIGN.md",
            "../../registry/systems/*/styles/**/*",
            "../../packages/mcp/dist/*.html",
            "../../tooling/build-system/package.json",
            "../../node_modules/tailwindcss/package.json",
            "../../node_modules/tailwindcss/theme.css",
        ],
    },
    // The template catalog lives in apps/preview: resolve imports from the repository root.
    turbopack: { root: repoRoot },
    images: { unoptimized: true },
    devIndicators: false,
};

export default nextConfig;

import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

/**
 * Static export (out/) for static hosting. The site draws its own chrome (src/app/site.css); every system
 * screen is an iframe of a per-system preview build from public/preview/<system>/ (scripts/build-previews.mjs),
 * so each one runs one system in its own document.
 */
const nextConfig: NextConfig = {
    output: "export",
    // SITE_DIST_DIR=out-check builds (and exports) into another folder, so a check build never replaces an
    // out/ that `npm run serve` is serving (`serve -- --dir out-check`). With output export, distDir is the export folder.
    ...(process.env.SITE_DIST_DIR ? { distDir: process.env.SITE_DIST_DIR } : {}),
    // The template catalog lives in apps/preview: resolve imports from the repository root.
    turbopack: { root: repoRoot },
    images: { unoptimized: true },
    devIndicators: false,
};

export default nextConfig;

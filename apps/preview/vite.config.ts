import { fileURLToPath } from "node:url";

import { fontIds, readFontCatalog, readSystemMeta } from "@tyohnn/build-system/registry";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

/**
 * One design system per dev server or build: `SYSTEM=<name> npm run dev -w @tyohnn/preview`, or
 * `npm run build -w @tyohnn/preview -- --system=<name>` → apps/preview/dist/<name>/
 * (both through scripts/vite-system.mjs). Default foundation.
 * The system decides which fonts the page installs (system.json fonts → registry/fonts catalog →
 * fontsource / npm CSS entries). `?system=` still picks the stylesheet at run time; the page warns
 * when it differs from the system this server was started for.
 */
// scripts/vite-system.mjs turns `--system=<name>` into SYSTEM (vite itself rejects unknown flags).
const system = (process.env.SYSTEM || "foundation").replace(/[^a-z0-9-]/gi, "");
const meta = readSystemMeta(system);

const FONTS_ID = "virtual:tyohnn-fonts";
const SYSTEM_ID = "virtual:tyohnn-system";

const systemPlugin = (): Plugin => ({
    name: "tyohnn-system",
    resolveId: (id) => (id === FONTS_ID || id === SYSTEM_ID ? `\0${id}` : null),
    load: (id) =>
    {
        if (id === `\0${SYSTEM_ID}`)
        {
            return `export const system = ${JSON.stringify(system)};\n`;
        }

        if (id === `\0${FONTS_ID}`)
        {
            const catalog = readFontCatalog();

            // Self-hosted only: fontsource packages for google-provider fonts, the npm package for local ones.
            return fontIds(meta.fonts)
                .map((fontId) =>
                {
                    const font = catalog.get(fontId);

                    const entry = font?.provider === "google" ? font.fontsource?.css : font?.npm?.css;

                    if (!entry) throw new Error(`system ${system}: font "${fontId}" is not in the catalog or has no CSS entry`);

                    return `import ${JSON.stringify(entry)};`;
                })
                .join("\n");
        }

        return null;
    },
    transformIndexHtml: (html) => html.replaceAll("__TYOHNN_SYSTEM__", system),
});

/**
 * The page loads exactly one system stylesheet: dist/systems/<system>/compiled.css, built by
 * tooling/build-system. The repository `dist/` is served as the public directory, so the file lives at
 * /systems/<system>/compiled.css. The app bundles no Tailwind of its own.
 */
export default defineConfig({
    plugins: [react(), systemPlugin()],
    publicDir: `${repoRoot}dist`,
    build: { outDir: `dist/${system}`, emptyOutDir: true },
    resolve: {
        // Placeholder alias, not a package: @tyohnn/{components,lib,hooks}/* → registry/ui/…
        // (@tyohnn/ui and the tooling packages are untouched by this pattern).
        alias: [{ find: /^@tyohnn\/(components|lib|hooks)\//, replacement: `${repoRoot}registry/ui/$1/` }],
    },
    server: {
        fs: { allow: [repoRoot] },
    },
});

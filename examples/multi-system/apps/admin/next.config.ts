import path from "node:path";

import type { NextConfig } from "next";

// tyohnn:begin next
// Managed by tyohnn: system foundation · icons hugeicons. Rewritten by init / add-system; edit outside this block.
// @acme/ui ships TypeScript source, so Next transpiles it. Its components import `@acme/ui/icons`, which
// packages/ui resolves to the monorepo default; this app points that exact specifier at its own library,
// in both bundlers (Turbopack for dev and build, webpack for `--webpack`), as tsconfig paths does for tsc.
const monorepoRoot = path.join(__dirname, "../..");
const tyohnn = {
    transpilePackages: ["@acme/ui"],
    iconSpecifier: "@acme/ui/icons",
    // Relative to this app's directory (Turbopack resolves alias targets from the project directory, not
    // turbopack.root). A Turbopack alias whose target does not resolve is ignored without an error and the
    // specifier falls back to packages/ui's default library, so tyohnn doctor checks this path exists.
    iconAlias: "../../packages/ui/src/icons/libraries/hugeicons.tsx",
};
// tyohnn:end next

const nextConfig: NextConfig = {
    transpilePackages: tyohnn.transpilePackages,
    outputFileTracingRoot: monorepoRoot,
    turbopack: {
        root: monorepoRoot,
        resolveAlias: { [tyohnn.iconSpecifier]: tyohnn.iconAlias },
    },
    webpack: (config) =>
    {
        // `$`: exact match, so nothing under the specifier is redirected.
        config.resolve.alias = { ...config.resolve.alias, [`${tyohnn.iconSpecifier}$`]: path.resolve(__dirname, tyohnn.iconAlias) };

        return config;
    },
};

export default nextConfig;

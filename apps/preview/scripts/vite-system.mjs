// Runs vite for one design system: `--system=<name>` (or SYSTEM=<name>) is taken out of the arguments
// and passed on as SYSTEM, which vite.config.ts reads. Everything else goes to vite unchanged.
//
//   node scripts/vite-system.mjs build --system=graphite   → dist/graphite/
//   node scripts/vite-system.mjs build --system=mira --own-css --base=/preview/mira/ --outDir=<dir>
//     → a build for a sub-path that ships only mira's stylesheet (apps/site/scripts/build-previews.mjs)

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const flag = args.find((arg) => arg.startsWith("--system="));
const system = flag?.slice("--system=".length) || process.env.SYSTEM || "foundation";
const ownCss = args.includes("--own-css");
const vite = join(dirname(require.resolve("vite/package.json")), "bin/vite.js");
const result = spawnSync(process.execPath, [vite, ...args.filter((arg) => arg !== flag && arg !== "--own-css")], {
    stdio: "inherit",
    env: { ...process.env, SYSTEM: system, ...(ownCss ? { PREVIEW_OWN_CSS: "1" } : {}) },
});

process.exit(result.status ?? 1);

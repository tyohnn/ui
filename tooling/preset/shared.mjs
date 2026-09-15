// Shared paths and preset metadata for the preset porting tools.
//
// Everything downloaded or generated (the shadcn source checkout, the reference Next apps) lives in a
// work directory outside the repository: --workdir <dir>, else TYOHNN_PRESET_WORKDIR, else
// <os tmpdir>/tyohnn-preset. A Next app inside the repository would be picked up by the TypeScript
// and Turborepo runs of the monorepo.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** The shadcn CLI version every preset is ported from. Bump it for all presets together. */
export const SHADCN_VERSION = "4.21.0";
export const SHADCN_TAG = `shadcn@${SHADCN_VERSION}`;
export const SHADCN_REPO = "https://github.com/shadcn-ui/ui.git";
export const PRESETS = ["nova", "vega", "maia", "lyra", "mira", "luma", "sera", "rhea"];
/** Port of the reference app's dev server. Another local app may hold 3000, and the preview 5173. */
export const REFERENCE_PORT = 3100;

const argv = process.argv.slice(2);

export const argValue = (name, fallback) =>
{
    const index = argv.indexOf(`--${name}`);

    return index === -1 ? fallback : argv[index + 1];
};

export const workdir = () =>
{
    const dir = argValue("workdir", process.env.TYOHNN_PRESET_WORKDIR || join(tmpdir(), "tyohnn-preset"));

    mkdirSync(dir, { recursive: true });

    return dir;
};

export const referenceAppDir = (preset) => join(workdir(), preset);

/** Sparse checkout of apps/v4/registry at the pinned tag (styles, themes, base colours, preset config). */
export const shadcnCheckout = ({ fetch = false } = {}) =>
{
    const dir = join(workdir(), `ui-${SHADCN_VERSION}`);

    if (!existsSync(join(dir, "apps/v4/registry/config.ts")))
    {
        if (!fetch) throw new Error(`No shadcn checkout at ${dir}. Run tooling/preset/make-reference.mjs first (same --workdir).`);

        execFileSync("git", ["clone", "-q", "--depth", "1", "--branch", SHADCN_TAG, "--filter=blob:none", "--sparse", SHADCN_REPO, dir], { stdio: "inherit" });
        execFileSync("git", ["-C", dir, "sparse-checkout", "set", "--no-cone", "/apps/v4/registry/*.ts", "/apps/v4/registry/styles/"], { stdio: "inherit" });
    }

    return dir;
};

export const shadcnCommit = () => execFileSync("git", ["-C", shadcnCheckout(), "rev-parse", "HEAD"], { encoding: "utf8" }).trim();

/**
 * The `base-<preset>` entry of apps/v4/registry/config.ts as a flat object of string fields
 * (style · baseColor · theme · chartColor · iconLibrary · font · fontHeading · menuAccent · menuColor · radius …).
 */
export const presetConfig = (preset) =>
{
    const source = readFileSync(join(shadcnCheckout(), "apps/v4/registry/config.ts"), "utf8");
    const start = source.indexOf(`name: "base-${preset}"`);

    if (start === -1) throw new Error(`No base-${preset} preset in shadcn ${SHADCN_VERSION} config.ts`);

    const block = source.slice(start, source.indexOf("}", start));

    return Object.fromEntries([...block.matchAll(/(\w+):\s*("([^"]*)"|true|false)/g)].map((match) => [match[1], match[3] ?? match[2] === "true"]));
};

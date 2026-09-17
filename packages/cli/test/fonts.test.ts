import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { expectedPackageDir, packageDir } from "../src/project/detect.js";
import { nextFontCode } from "../src/project/fonts.js";
import { Registry } from "../src/source/registry.js";
import { repoRoot, tempDir } from "./helpers.js";

const installPackage = (dir: string, name: string) =>
{
    mkdirSync(join(dir, "node_modules", name), { recursive: true });
    writeFileSync(join(dir, "node_modules", name, "package.json"), JSON.stringify({ name }));
};

const fonts = { sans: "pretendard", heading: "inherit", mono: "system", hangulFallback: "pretendard" };

describe("font package resolution", () =>
{
    // outer/node_modules/pretendard exists; the project outer/project is not installed
    const nested = () =>
    {
        const outer = tempDir();
        const root = join(outer, "project");
        const app = join(root, "apps/crm");

        installPackage(outer, "pretendard");
        mkdirSync(join(app, "src/app"), { recursive: true });

        return { outer, root, app, layoutDir: join(app, "src/app") };
    };

    it("does not look above the project root", () =>
    {
        const { root, app } = nested();

        expect(packageDir(app, "pretendard", root)).toBeNull();
        expect(packageDir(root, "pretendard", root)).toBeNull();
    });

    it("finds a package installed inside the project", () =>
    {
        const { root, app } = nested();

        installPackage(root, "pretendard");

        expect(packageDir(app, "pretendard", root)).toBe(join(root, "node_modules/pretendard"));
    });

    it("writes next/font/local paths to where the package manager will install, not to an ancestor's copy", () =>
    {
        const { root, app, layoutDir } = nested();
        const registry = new Registry(repoRoot);
        const code = (pm: "npm" | "pnpm") =>
            nextFontCode(fonts, registry, layoutDir, (name) => packageDir(app, name, root), (name) => expectedPackageDir(app, name, root, pm));

        const npm = code("npm");

        expect(npm.unresolved).toEqual(["pretendard"]);
        expect(npm.lines.join("\n")).toContain('"../../../../node_modules/pretendard/');
        expect(npm.lines.join("\n")).not.toContain("../../../../../node_modules");

        expect(code("pnpm").lines.join("\n")).toContain('"../../node_modules/pretendard/');
    });
});

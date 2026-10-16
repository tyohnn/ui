import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { expectedPackageDir, packageDir } from "../src/project/detect.js";
import { familyStacks, fontIds, fontPackages, nextFontCode, sameFonts, validateFonts } from "../src/project/fonts.js";
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

describe("Hangul heading font", () =>
{
    const registry = new Registry(repoRoot);
    const vellum = { sans: "inter", heading: "source-serif-4", mono: "system", hangulFallback: "pretendard", hangulHeading: "maru-buri" };

    it("puts the Hangul heading font between the heading font and the Hangul fallback, in the heading stack only", () =>
    {
        const stacks = familyStacks(vellum, registry);

        expect(stacks["--font-heading"]).toBe('"Source Serif 4", "Source Serif 4 Variable", "MaruBuri", "마루 부리", "Pretendard", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif');
        expect(stacks["--font-sans"]).not.toContain("MaruBuri");
        expect(stacks["--font-mono"]).not.toContain("MaruBuri");
    });

    it("installs the Hangul heading font with the others", () =>
    {
        expect(fontIds(vellum)).toContain("maru-buri");
        expect(fontPackages(vellum, registry, "vite")).toHaveProperty("@kfonts/maruburi");
    });

    it("counts a different Hangul heading font as a different choice", () =>
    {
        const { hangulHeading: _, ...without } = vellum;

        expect(sameFonts(vellum, without)).toBe(false);
        expect(sameFonts(vellum, { ...vellum })).toBe(true);
    });

    it("rejects a Hangul heading font that is not in the catalog", () =>
    {
        expect(() => validateFonts({ ...vellum, hangulHeading: "no-such-font" }, registry)).toThrow();
    });
});

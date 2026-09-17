import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { aliasFor, effectivePaths, parseTsconfig, setPaths } from "../src/codemods/tsconfig.js";
import { tempDir } from "./helpers.js";

const viteApp = `{
  "compilerOptions": {
    "target": "ES2022",
    /* Bundler mode */
    "moduleResolution": "bundler",
    "strict": true,
  },
  "include": ["src"]
}
`;

describe("tsconfig paths", () =>
{
    it("adds paths and keeps comments, trailing commas and indentation", () =>
    {
        const out = setPaths(viteApp, { "@/*": ["./src/*"] });

        expect(out).toContain("/* Bundler mode */");
        expect(out).toContain('"strict": true,');
        expect(parseTsconfig(out).compilerOptions?.paths).toEqual({ "@/*": ["./src/*"] });
        expect(out).toMatch(/\n {4}"paths": \{\n {6}"@\/\*": \[/);
    });

    it("is idempotent and changes only the entry it sets", () =>
    {
        const once = setPaths(viteApp, { "@/*": ["./src/*"] });

        expect(setPaths(once, { "@/*": ["./src/*"] })).toBe(once);

        const icons = setPaths(once, { "@acme/ui/icons": ["../../packages/ui/src/icons/libraries/lucide.tsx"] });
        const switched = setPaths(icons, { "@acme/ui/icons": ["../../packages/ui/src/icons/libraries/hugeicons.tsx"] });

        expect(parseTsconfig(switched).compilerOptions?.paths).toEqual({ "@/*": ["./src/*"], "@acme/ui/icons": ["../../packages/ui/src/icons/libraries/hugeicons.tsx"] });
        expect(switched.split("\n").length).toBe(icons.split("\n").length);
    });

    it("copies inherited paths before adding one (a paths key replaces the base's)", () =>
    {
        const dir = tempDir();

        writeFileSync(join(dir, "tsconfig.base.json"), JSON.stringify({ compilerOptions: { paths: { "~/*": ["./shared/*"] } } }));
        writeFileSync(join(dir, "app.json"), JSON.stringify({ extends: "./tsconfig.base.json" }));

        const inherited = effectivePaths(join(dir, "app.json"));

        expect(inherited?.from).toBe(join(dir, "tsconfig.base.json"));

        const out = setPaths('{ "extends": "./tsconfig.base.json" }', { "@acme/ui/icons": ["./x.tsx"] }, { paths: inherited!.paths, fromDir: dir, toDir: join(dir, "apps/web") });

        expect(parseTsconfig(out).compilerOptions?.paths).toEqual({ "~/*": ["../../shared/*"], "@acme/ui/icons": ["./x.tsx"] });
    });

    it("finds the alias that maps to a folder", () =>
    {
        expect(aliasFor({ "~/*": ["./src/*"], "@/*": ["./app/*"] }, "/p", "/p/src")).toBe("~");
        expect(aliasFor({ "@/*": ["./*"] }, "/p", "/p/src")).toBeNull();
    });
});

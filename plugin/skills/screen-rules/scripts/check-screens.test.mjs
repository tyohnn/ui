import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createChecker, globToRegExp } from "./check-screens.mjs";

const SCREEN = "apps/web/src/app/(app)/orders/page.tsx";

const checker = createChecker({
    include: ["apps/*/src/**/*.{ts,tsx}", "packages/ui/src/blocks/**/*.{ts,tsx}"],
    iconsModule: "@acme/ui/icons",
    allow: { svg: ["packages/ui/src/blocks/*-mark/**"], color: ["packages/ui/src/blocks/*-mark/**"] },
});

/** Scans one file and keeps rule id → count */
const counts = (text, path = SCREEN, using = checker) =>
    Object.fromEntries(Object.entries(using.scan(path, text)).map(([id, { count }]) => [id, count]));

describe("which files it reads", () =>
{
    it("reads app screens and the repository's blocks", () =>
    {
        assert.equal(checker.inScope(SCREEN), true);
        assert.equal(checker.inScope("packages/ui/src/blocks/item-list/ItemList.tsx"), true);
    });

    it("leaves tyohnn's components and test files alone", () =>
    {
        assert.equal(checker.inScope("packages/ui/src/components/button.tsx"), false);
        assert.equal(checker.inScope("apps/web/src/lib/read.test.ts"), false);
    });

    it("reads a single app's src by default", () =>
    {
        assert.equal(createChecker().inScope("src/app/page.tsx"), true);
        assert.equal(createChecker().inScope("src/ui/components/button.tsx"), false);
    });

    it("turns globs into anchored patterns", () =>
    {
        assert.equal(globToRegExp("apps/*/src/**/*.{ts,tsx}").test("apps/web/src/a/b.tsx"), true);
        assert.equal(globToRegExp("apps/*/src/**/*.{ts,tsx}").test("apps/web/src/b.tsx"), true);
        assert.equal(globToRegExp("apps/*/src/**/*.{ts,tsx}").test("apps/web/lib/b.tsx"), false);
    });
});

describe("counts only written values", () =>
{
    it("counts written radii", () =>
    {
        assert.deepEqual(counts(`<div className="rounded-lg md:rounded-[12px]" />`), { rounded: 2, px: 1 });
    });

    it("lets circles, no radius and token reads pass", () =>
    {
        assert.deepEqual(counts(`<div className="rounded-full rounded-none rounded-[var(--card-radius)]" />`), {});
    });

    it("counts palette and literal colours", () =>
    {
        assert.deepEqual(counts(`<p className="text-blue-500 bg-[#fff] hover:border-red-200/50" />`), { color: 3 });
    });

    it("counts a literal colour in a style object", () =>
    {
        assert.deepEqual(counts(`<p style={{ color: "#ff0000", backgroundColor: "rgb(0 0 0)" }} />`), { "style-color": 2 });
    });

    it("lets semantic colours pass", () =>
    {
        assert.deepEqual(counts(`<p className="text-muted-foreground bg-card border-border" />`), {});
    });

    it("counts written type sizes", () =>
    {
        assert.deepEqual(counts(`<p className="text-sm md:text-2xl" />`), { "text-size": 2 });
    });

    it("does not count px in a var() fallback", () =>
    {
        assert.deepEqual(counts(`<div className="w-[var(--panel-width,400px)]" />`), {});
    });

    it("counts z-index, space-* and hand-drawn SVG", () =>
    {
        assert.deepEqual(counts(`<div className="z-50 space-y-2"><svg viewBox="0 0 1 1" /></div>`), { "z-index": 1, space: 1, svg: 1 });
    });

    it("counts icon libraries imported directly", () =>
    {
        assert.deepEqual(counts(`import { X } from "lucide-react";\nimport { Y } from "@hugeicons/react";`), { "icon-lib": 2 });
    });

    it("does not count rules named in comments", () =>
    {
        assert.deepEqual(counts(`// no rounded-lg here\n/* bg-blue-500 */\nconst a = 1; // z-50 is banned`), {});
    });

    it("lets a brand-mark block draw its SVG and colours", () =>
    {
        assert.deepEqual(counts(`<svg fill="x" className="fill-[#4285F4]" />`, "packages/ui/src/blocks/google-mark/GoogleMark.tsx"), {});
    });

    it("counts data-slot on a UI SDK part only when the repository lists that part", () =>
    {
        const strict = createChecker({ headlessParts: ["MenuTrigger"] });
        const text = `<MenuTrigger data-slot="x" />`;

        assert.deepEqual(counts(text, SCREEN, strict), { "lib-slot": 1 });
        assert.deepEqual(counts(text), {});
    });
});

describe("the ledger", () =>
{
    const found = (entries) =>
        new Map(Object.entries(entries).map(([path, rules]) => [path, Object.fromEntries(Object.entries(rules).map(([id, count]) => [id, { count, samples: [] }]))]));

    it("fails when a count grows past the ledger", () =>
    {
        const problems = checker.judge(found({ [SCREEN]: { rounded: 3 } }), { [SCREEN]: { rounded: 2 } });

        assert.equal(problems.length, 1);
        assert.match(problems[0], /over the ledger's 2/);
    });

    it("fails on any violation in a file the ledger does not name", () =>
    {
        assert.equal(checker.judge(found({ [SCREEN]: { color: 1 } }), {}).length, 1);
    });

    it("fails when a count falls, asking for --write", () =>
    {
        const problems = checker.judge(found({}), { [SCREEN]: { rounded: 2 } });

        assert.equal(problems.length, 1);
        assert.match(problems[0], /--write/);
    });

    it("passes when it matches the ledger", () =>
    {
        assert.deepEqual(checker.judge(found({ [SCREEN]: { rounded: 2 } }), { [SCREEN]: { rounded: 2 } }), []);
    });

    it("shrinks only what fell and never writes new entries", () =>
    {
        const next = checker.shrink(found({ [SCREEN]: { rounded: 1, color: 4 }, "apps/web/src/new.tsx": { px: 1 } }), { [SCREEN]: { rounded: 2, px: 1 } });

        assert.deepEqual(next, { [SCREEN]: { rounded: 1 } });
    });

    it("writes every count as it stands for the first ledger", () =>
    {
        assert.deepEqual(checker.record(found({ "b.tsx": { px: 1 }, "a.tsx": { rounded: 2 } })), { "a.tsx": { rounded: 2 }, "b.tsx": { px: 1 } });
    });
});

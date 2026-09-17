import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { readRecord, RECORD_VERSION, requireRecord, serializeRecord, type TyohnnRecord, usedIcons, usedSystems, writeRecord } from "../src/project/record.js";
import { tempDir } from "./helpers.js";

const fonts = { sans: "inter", heading: "inherit", mono: "system", hangulFallback: "pretendard" };

const sample = (): TyohnnRecord => ({
    version: RECORD_VERSION,
    source: { kind: "github", repo: "tyohnn/ui", ref: "main", commit: "a".repeat(40) },
    project: "monorepo",
    packageManager: "npm",
    ui: { path: "packages/ui", importBase: "@acme/ui", systems: ["mira", "graphite", "mira"], icons: ["lucide", "hugeicons"] },
    apps: {
        "apps/web": { framework: "next", system: "mira", icons: "hugeicons", fonts, mode: "light", css: "apps/web/src/app/globals.css" },
        "apps/crm": { framework: "next", system: "graphite", icons: "lucide", fonts: { ...fonts, sans: "pretendard" }, mode: "dark", css: "apps/crm/src/app/globals.css", example: "component-sheet" },
    },
    packages: { "packages/ui/package.json": ["lucide-react", "@hugeicons/react", "lucide-react"], "apps/web/package.json": [] },
    files: {
        "packages/ui/src/lib/utils.ts": { from: "registry/ui/lib/utils.ts", hash: "sha256-2" },
        "packages/ui/src/components/button.tsx": { from: "registry/ui/components/button.tsx", hash: "sha256-1" },
    },
});

describe("tyohnn.json", () =>
{
    it("serializes in a stable order with duplicates removed", () =>
    {
        const text = serializeRecord(sample());
        const data = JSON.parse(text);

        expect(Object.keys(data)).toEqual(["version", "source", "project", "packageManager", "ui", "apps", "packages", "files"]);
        expect(data.ui.systems).toEqual(["graphite", "mira"]);
        expect(Object.keys(data.apps)).toEqual(["apps/crm", "apps/web"]);
        expect(Object.keys(data.files)).toEqual(["packages/ui/src/components/button.tsx", "packages/ui/src/lib/utils.ts"]);
        expect(data.packages).toEqual({ "packages/ui/package.json": ["@hugeicons/react", "lucide-react"] });

        const shuffled = sample();

        shuffled.apps = Object.fromEntries(Object.entries(shuffled.apps).reverse());
        expect(serializeRecord(shuffled)).toBe(text);
    });

    it("round-trips through the file and reports whether it changed", () =>
    {
        const dir = tempDir();

        expect(readRecord(dir)).toBeNull();
        expect(writeRecord(dir, sample())).toBe(true);
        expect(writeRecord(dir, readRecord(dir)!)).toBe(false);
        expect(readRecord(dir)?.apps["apps/crm"].example).toBe("component-sheet");
    });

    it("refuses another record version and explains a missing record", () =>
    {
        const dir = tempDir();

        expect(() => requireRecord(dir)).toThrow(/no tyohnn.json/);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "tyohnn.json"), JSON.stringify({ version: 99 }));
        expect(() => readRecord(dir)).toThrow(/version 99/);
    });

    it("lists the systems and icon libraries apps use", () =>
    {
        expect(usedSystems(sample())).toEqual(["graphite", "mira"]);
        expect(usedIcons(sample())).toEqual(["hugeicons", "lucide"]);
    });
});

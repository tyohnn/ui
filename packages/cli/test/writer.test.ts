import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { hash } from "../src/lib/fs.js";
import { Changes } from "../src/lib/log.js";
import { RECORD_VERSION, type TyohnnRecord } from "../src/project/record.js";
import { OwnedFiles } from "../src/project/writer.js";
import { tempDir } from "./helpers.js";

const emptyRecord = (): TyohnnRecord => ({
    version: RECORD_VERSION,
    source: { kind: "local", commit: null },
    project: "next",
    packageManager: "npm",
    ui: { path: "src", importBase: "@", systems: [], icons: [] },
    apps: {},
    packages: {},
    files: {},
});

describe("CLI-owned files", () =>
{
    it("stops before writing when an unrecorded file is in the way (unless --force)", () =>
    {
        const root = tempDir();

        writeFileSync(join(root, "utils.ts"), "// mine\n");

        const owned = new OwnedFiles(root, emptyRecord(), new Changes(), false);

        owned.plan(join(root, "utils.ts"), "registry/ui/lib/utils.ts", "export {}\n");
        owned.plan(join(root, "button.tsx"), "registry/ui/components/button.tsx", "export {}\n");
        expect(() => owned.assertNoConflicts()).toThrow(/utils.ts/);
        expect(existsSync(join(root, "button.tsx"))).toBe(false);
        expect(new OwnedFiles(root, emptyRecord(), new Changes(), true).conflicts()).toEqual([]);
    });

    it("keeps a file edited since it was written, and prunes unused unedited files", () =>
    {
        const root = tempDir();
        const record = emptyRecord();
        const changes = new Changes();
        const first = new OwnedFiles(root, record, changes, false);

        first.plan(join(root, "a.ts"), "registry/ui/lib/a.ts", "a1\n");
        first.plan(join(root, "b.ts"), "registry/ui/lib/b.ts", "b1\n");
        first.plan(join(root, "c.ts"), "registry/ui/lib/c.ts", "c1\n");
        first.write();

        writeFileSync(join(root, "a.ts"), "a1 edited\n");
        writeFileSync(join(root, "c.ts"), "c1 edited\n");

        const second = new OwnedFiles(root, record, changes, false);

        second.plan(join(root, "a.ts"), "registry/ui/lib/a.ts", "a2\n");
        second.assertNoConflicts();
        second.write();
        second.prune();

        expect(readFileSync(join(root, "a.ts"), "utf8")).toBe("a1 edited\n");
        expect(record.files["a.ts"].hash).toBe(hash("a1\n"));
        expect(existsSync(join(root, "b.ts"))).toBe(false);
        expect(existsSync(join(root, "c.ts"))).toBe(true);
        expect(Object.keys(record.files)).toEqual(["a.ts"]);
        expect(changes.warnings.join("\n")).toMatch(/kept a.ts[\s\S]*kept c.ts/);
    });
});

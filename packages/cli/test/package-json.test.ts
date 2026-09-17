import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { syncDependencies } from "../src/project/package-json.js";
import { tempDir } from "./helpers.js";

describe("package.json dependencies", () =>
{
    it("adds missing packages, keeps the user's ranges, and removes only managed packages it added", () =>
    {
        const file = join(tempDir(), "package.json");

        writeFileSync(file, `${JSON.stringify({ name: "app", dependencies: { "lucide-react": "^0.400.0", react: "19.0.0" } }, null, 2)}\n`);

        const managed = new Set(["lucide-react", "@tabler/icons-react", "pretendard"]);
        const first = syncDependencies(file, { dependencies: { react: "^19.2.1", "@tabler/icons-react": "^3", pretendard: "^1.3.9" } }, [], managed);

        expect(first.changed).toBe(true);
        expect(first.added).toEqual(["@tabler/icons-react", "pretendard"]);

        const pkg = JSON.parse(readFileSync(file, "utf8"));

        expect(pkg.dependencies).toEqual({ "@tabler/icons-react": "^3", "lucide-react": "^0.400.0", pretendard: "^1.3.9", react: "19.0.0" });

        const again = syncDependencies(file, { dependencies: { react: "^19.2.1", "@tabler/icons-react": "^3", pretendard: "^1.3.9" } }, first.added, managed);

        expect(again.changed).toBe(false);

        const switched = syncDependencies(file, { dependencies: { react: "^19.2.1", pretendard: "^1.3.9" } }, first.added, managed);

        expect(switched.added).toEqual(["pretendard"]);
        expect(Object.keys(JSON.parse(readFileSync(file, "utf8")).dependencies)).toEqual(["lucide-react", "pretendard", "react"]);
    });
});

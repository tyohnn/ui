import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { doctor } from "../src/commands/doctor.js";
import { jsonText } from "../src/lib/fs.js";
import { RECORD_FILE, RECORD_VERSION, type TyohnnRecord } from "../src/project/record.js";
import { tempDir } from "./helpers.js";

const LUCIDE = `import { ChevronRight } from "lucide-react";\n`;
const ICONS = `import { Icon } from "@/components/icons";\n`;

// A single Next app without src/ (shadcn init -t next), so the UI base is the project root itself
const project = (files: Record<string, string>): string =>
{
    const root = tempDir();
    const record: TyohnnRecord = {
        version: RECORD_VERSION,
        source: { kind: "local", commit: null },
        project: "next",
        packageManager: "npm",
        ui: { path: ".", importBase: "@", systems: ["graphite"], icons: ["lucide"] },
        apps: {},
        packages: {},
        files: {},
    };

    writeFileSync(join(root, RECORD_FILE), jsonText(record));

    for (const [path, content] of Object.entries(files))
    {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), content);
    }

    return root;
};

/** Runs doctor in root; returns the exit code and the direct-import row, if any */
const run = async (root: string) =>
{
    const lines: string[] = [];

    vi.spyOn(console, "log").mockImplementation((line: string) => void lines.push(line));

    const code = await doctor({ cwd: root });

    return { code, direct: lines.find((line) => line.includes("import icon packages directly")) };
};

afterEach(() =>
{
    vi.restoreAllMocks();
});

describe("doctor: direct icon imports", () =>
{
    it("skips dependencies and build output", async () =>
    {
        const root = project({
            "app/page.tsx": ICONS,
            "node_modules/@shadcn/registry/dist/icons/libraries.d.ts": LUCIDE,
            "node_modules/lucide-react/dist/lucide-react.d.ts": LUCIDE,
            ".next/types/app/page.ts": LUCIDE,
            "dist/index.d.ts": LUCIDE,
        });

        expect(await run(root)).toEqual({ code: 0, direct: undefined });
    });

    it("still flags the project's own files", async () =>
    {
        const root = project({
            "components/app-sidebar.tsx": LUCIDE,
            "node_modules/@shadcn/registry/dist/icons/libraries.d.ts": LUCIDE,
        });
        const { code, direct } = await run(root);

        expect(code).toBe(1);
        expect(direct).toMatch(/: components\/app-sidebar\.tsx$/);
    });

    it("skips what .gitignore excludes, and reads untracked files it does not", async () =>
    {
        const root = project({
            ".gitignore": "/generated\n",
            "generated/icon-map.tsx": LUCIDE,
            "components/nav.tsx": LUCIDE,
        });

        execFileSync("git", ["init", "-q"], { cwd: root });

        const { code, direct } = await run(root);

        expect(code).toBe(1);
        expect(direct).toMatch(/: components\/nav\.tsx$/);
    });
});

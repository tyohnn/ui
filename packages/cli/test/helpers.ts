import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach } from "vitest";

const dirs: string[] = [];

/** A temporary folder removed after the test */
export const tempDir = (): string =>
{
    const dir = mkdtempSync(join(tmpdir(), "tyohnn-test-"));

    dirs.push(dir);

    return dir;
};

afterEach(() =>
{
    dirs.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true }));
});

/** This repository (the registry the unit tests read) */
export const repoRoot = join(import.meta.dirname, "../../..");

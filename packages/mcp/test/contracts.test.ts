import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach } from "vitest";

import { memorySessions } from "../src/sessions";
import { folderStore } from "../src/store";
import { sessionStoreContract, systemStoreContract } from "../src/testing/contracts";

const dirs: string[] = [];

afterEach(() =>
{
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

systemStoreContract("folder", async () =>
{
    const dir = mkdtempSync(join(tmpdir(), "tyohnn-store-"));

    dirs.push(dir);

    return folderStore(dir);
});

sessionStoreContract("memory", async (ttlMs) => memorySessions(ttlMs));

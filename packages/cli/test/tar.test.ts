import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { extractToCache, isNeeded } from "../src/source/index.js";
import { commonRoot, readTar } from "../src/source/tar.js";
import { tempDir } from "./helpers.js";

/** A minimal ustar writer with pax headers, like `git archive` */
const header = (name: string, size: number, type: string) =>
{
    const block = Buffer.alloc(512);

    block.write(name.slice(0, 100), 0);
    block.write("0000644\0", 100);
    block.write("0000000\0", 108);
    block.write("0000000\0", 116);
    block.write(`${size.toString(8).padStart(11, "0")}\0`, 124);
    block.write("00000000000\0", 136);
    block.write("        ", 148);
    block.write(type, 156);
    block.write("ustar\0", 257);
    block.write("00", 263);

    const sum = [...block].reduce((total, byte) => total + byte, 0);

    block.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148);

    return block;
};

const pad = (data: Buffer) => Buffer.concat([data, Buffer.alloc((512 - (data.length % 512)) % 512)]);

const pax = (records: Record<string, string>) => Buffer.from(Object.entries(records).map(([key, value]) =>
{
    const body = ` ${key}=${value}\n`;
    let length = body.length + 1;

    while (`${length}${body}`.length !== length) length += 1;

    return `${length}${body}`;
}).join(""));

const tarball = (entries: { path: string; content: string }[], commit?: string) =>
{
    const parts: Buffer[] = [];

    if (commit)
    {
        const data = pax({ comment: commit });

        parts.push(header("pax_global_header", data.length, "g"), pad(data));
    }

    for (const entry of entries)
    {
        const data = Buffer.from(entry.content);

        if (entry.path.length > 100)
        {
            const record = pax({ path: entry.path });

            parts.push(header("PaxHeader", record.length, "x"), pad(record));
        }

        parts.push(header(entry.path, data.length, "0"), pad(data));
    }

    parts.push(Buffer.alloc(1024));

    return gzipSync(Buffer.concat(parts));
};

describe("tarball source", () =>
{
    let previous: string | undefined;

    beforeEach(() =>
    {
        previous = process.env.TYOHNN_CACHE_DIR;
        process.env.TYOHNN_CACHE_DIR = tempDir();
    });

    afterEach(() =>
    {
        if (previous === undefined) delete process.env.TYOHNN_CACHE_DIR;
        else process.env.TYOHNN_CACHE_DIR = previous;
    });

    const commit = "0123456789abcdef0123456789abcdef01234567";
    const longPath = `tyohnn-main/registry/systems/vega/styles/components/${"x".repeat(90)}.css`;
    const entries = [
        { path: "tyohnn-main/registry/ui/manifest.json", content: '{"files":[]}' },
        { path: longPath, content: ".x{}" },
        { path: "tyohnn-main/registry/systems/vega/reference/shot.png", content: "png" },
        { path: "tyohnn-main/apps/preview/src/templates/component-sheet/index.tsx", content: "export {}" },
        { path: "tyohnn-main/apps/preview/src/main.tsx", content: "skip" },
        { path: "tyohnn-main/README.md", content: "skip" },
    ];

    it("reads files, long pax paths and the commit from the global header", () =>
    {
        const { files, commit: found } = readTar(tarball(entries, commit));

        expect(found).toBe(commit);
        expect(files.map((file) => file.path)).toContain(longPath);
        expect(commonRoot(files.map((file) => file.path))).toBe("tyohnn-main/");
    });

    it("extracts only what the CLI reads into the cache, keyed by commit", () =>
    {
        const { dir, commit: found } = extractToCache(tarball(entries, commit), "test.tar.gz");

        expect(found).toBe(commit);
        expect(dir.endsWith(join("sources", commit))).toBe(true);
        expect(readFileSync(join(dir, "registry/ui/manifest.json"), "utf8")).toBe('{"files":[]}');
        expect(existsSync(join(dir, longPath.slice("tyohnn-main/".length)))).toBe(true);
        expect(existsSync(join(dir, "registry/systems/vega/reference/shot.png"))).toBe(false);
        expect(existsSync(join(dir, "README.md"))).toBe(false);
        expect(existsSync(join(dir, "apps/preview/src/main.tsx"))).toBe(false);
        expect(isNeeded("apps/preview/package.json")).toBe(true);
    });

    it("keys a tarball without a commit by its content and rejects non-tyohnn archives", () =>
    {
        const { dir, commit: found } = extractToCache(tarball(entries), "plain.tar.gz");

        expect(found).toBeNull();
        expect(dir).toMatch(/sources\/archive-[0-9a-f]{16}$/);
        expect(() => extractToCache(tarball([{ path: "x/README.md", content: "" }]), "other.tar.gz")).toThrow(/not a tyohnn source/);
    });
});

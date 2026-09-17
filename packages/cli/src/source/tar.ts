// A small tar.gz reader for GitHub codeload and `git archive` tarballs: regular files, directories, and pax
// headers (long paths, and the global `comment` header in which both record the commit id).

import { gunzipSync } from "node:zlib";

export interface TarFile
{
    path: string;
    data: Buffer;
}

export interface TarContents
{
    files: TarFile[];
    /** The commit a `git archive` / codeload tarball was made from (pax global header `comment`) */
    commit: string | null;
}

const BLOCK = 512;

const text = (buffer: Buffer, start: number, length: number) =>
{
    const slice = buffer.subarray(start, start + length);
    const nul = slice.indexOf(0);

    return (nul === -1 ? slice : slice.subarray(0, nul)).toString("utf8");
};

const octal = (buffer: Buffer, start: number, length: number) =>
{
    const raw = text(buffer, start, length).trim();

    return raw ? Number.parseInt(raw, 8) : 0;
};

/** pax records: "<length> <key>=<value>\n" */
const paxRecords = (data: Buffer): Record<string, string> =>
{
    const records: Record<string, string> = {};
    let offset = 0;

    while (offset < data.length)
    {
        const space = data.indexOf(0x20, offset);

        if (space === -1) break;

        const length = Number.parseInt(data.subarray(offset, space).toString("utf8"), 10);

        if (!Number.isFinite(length) || length <= 0) break;

        const record = data.subarray(space + 1, offset + length - 1).toString("utf8");
        const equals = record.indexOf("=");

        if (equals > 0) records[record.slice(0, equals)] = record.slice(equals + 1);
        offset += length;
    }

    return records;
};

/**
 * Reads a gzip-compressed (or plain) tar archive. `filter` receives each file's path (as stored, including the
 * top-level folder) and decides whether its content is kept.
 */
export const readTar = (archive: Buffer, filter: (path: string) => boolean = () => true): TarContents =>
{
    const buffer = archive[0] === 0x1f && archive[1] === 0x8b ? gunzipSync(archive) : archive;
    const files: TarFile[] = [];
    let commit: string | null = null;
    let offset = 0;
    let pending: Record<string, string> = {};
    let longName: string | null = null;

    while (offset + BLOCK <= buffer.length)
    {
        const header = buffer.subarray(offset, offset + BLOCK);

        if (header.every((byte) => byte === 0)) break;

        const name = text(header, 0, 100);
        const size = octal(header, 124, 12);
        const type = String.fromCharCode(header[156] || 0x30);
        const magic = text(header, 257, 6);
        const prefix = magic.startsWith("ustar") ? text(header, 345, 155) : "";
        const dataStart = offset + BLOCK;
        const data = buffer.subarray(dataStart, dataStart + size);

        offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;

        if (type === "g")
        {
            const records = paxRecords(data);

            if (records.comment && /^[0-9a-f]{40}$/.test(records.comment.trim())) commit = records.comment.trim();
            continue;
        }

        if (type === "x")
        {
            pending = paxRecords(data);
            continue;
        }

        if (type === "L")
        {
            longName = text(data, 0, data.length);
            continue;
        }

        const path = pending.path ?? longName ?? (prefix ? `${prefix}/${name}` : name);

        pending = {};
        longName = null;

        if ((type === "0" || type === "\0" || type === "7") && filter(path))
        {
            files.push({ path, data: Buffer.from(data) });
        }
    }

    return { files, commit };
};

/** The single top-level folder every entry shares ("tyohnn-main/"), or "" */
export const commonRoot = (paths: string[]): string =>
{
    const first = paths[0]?.split("/")[0];

    return first && paths.every((path) => path.startsWith(`${first}/`)) ? `${first}/` : "";
};

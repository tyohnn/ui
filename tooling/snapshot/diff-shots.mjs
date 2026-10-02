// diff-shots — are two sets of template screenshots the same picture?
//
// The proof that moving a template onto blocks (registry/blocks) changed nothing: shoot the template before and
// after with check-templates.mjs (`--shots <dir>`, one folder per <system>-<mode>, one PNG per template) and compare
// the two folders pixel by pixel. A pixel differs when any channel is off by more than --tolerance (default 0).
//
// Usage:
//   node tooling/snapshot/check-templates.mjs --templates block-orders --shots tooling/snapshot/out/before
//   … change the template …
//   node tooling/snapshot/check-templates.mjs --templates block-orders --shots tooling/snapshot/out/after
//   node tooling/snapshot/diff-shots.mjs tooling/snapshot/out/before tooling/snapshot/out/after [--templates id,id]
//        [--tolerance 0] [--out dir]
//
// --templates compares those templates only (the "before" folder usually holds every template, shot once).
//
// --out writes, for every pair that differs, a PNG with the differing pixels in red over the dimmed "after" shot.
// Exit 0 when every pair is identical (within the tolerance), 1 when one differs or is missing on either side.

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import sharp from "sharp";

const [before, after] = process.argv.slice(2).filter((value, index, all) => !value.startsWith("--") && !all[index - 1]?.startsWith("--"));
const arg = (name, fallback) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? fallback : process.argv[index + 1];
};
const tolerance = Number(arg("tolerance", "0"));
const outDir = arg("out");
const only = arg("templates")?.split(",").map((id) => `${id.trim()}.png`);

if (!before || !after)
{
    console.error("usage: diff-shots.mjs <before dir> <after dir> [--templates id,id] [--tolerance 0] [--out dir]");
    process.exit(2);
}

const walk = (dir) => readdirSync(dir).flatMap((name) =>
{
    const path = join(dir, name);

    return statSync(path).isDirectory() ? walk(path) : name.endsWith(".png") ? [path] : [];
});

const raw = (file) => sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const files = [...new Set([...walk(before).map((file) => relative(before, file)), ...walk(after).map((file) => relative(after, file))])]
    .filter((file) => !only || only.some((name) => file.endsWith(`/${name}`)))
    .sort();
let failed = 0;

for (const file of files)
{
    const [a, b] = [join(before, file), join(after, file)];

    if (!existsSync(a) || !existsSync(b))
    {
        failed += 1;
        console.log(`✗ ${file}  missing ${existsSync(a) ? "after" : "before"}`);
        continue;
    }

    const [left, right] = await Promise.all([raw(a), raw(b)]);

    if (left.info.width !== right.info.width || left.info.height !== right.info.height)
    {
        failed += 1;
        console.log(`✗ ${file}  size ${left.info.width}×${left.info.height} → ${right.info.width}×${right.info.height}`);
        continue;
    }

    const { width, height } = left.info;
    const mark = Buffer.alloc(width * height * 4);
    let differing = 0;
    let worst = 0;
    let [minX, minY, maxX, maxY] = [width, height, -1, -1];

    for (let pixel = 0; pixel < width * height; pixel += 1)
    {
        const at = pixel * 4;
        const delta = Math.max(
            Math.abs(left.data[at] - right.data[at]),
            Math.abs(left.data[at + 1] - right.data[at + 1]),
            Math.abs(left.data[at + 2] - right.data[at + 2]),
            Math.abs(left.data[at + 3] - right.data[at + 3]),
        );

        if (delta > tolerance)
        {
            const [x, y] = [pixel % width, Math.floor(pixel / width)];

            differing += 1;
            worst = Math.max(worst, delta);
            [minX, minY, maxX, maxY] = [Math.min(minX, x), Math.min(minY, y), Math.max(maxX, x), Math.max(maxY, y)];
            mark.set([255, 0, 0, 255], at);
        }
        else
        {
            mark.set([right.data[at], right.data[at + 1], right.data[at + 2], 70], at);
        }
    }

    if (!differing)
    {
        console.log(`✓ ${file}`);
        continue;
    }

    failed += 1;
    console.log(`✗ ${file}  ${differing} px (${((differing / (width * height)) * 100).toFixed(3)}%) · max channel delta ${worst} · box ${minX},${minY}–${maxX},${maxY}`);

    if (outDir)
    {
        const target = join(outDir, file);

        mkdirSync(dirname(target), { recursive: true });
        await sharp(mark, { raw: { width, height, channels: 4 } }).flatten({ background: "#ffffff" }).png().toFile(target);
    }
}

console.log(`\n${files.length} pairs · ${failed} differ${tolerance ? ` (tolerance ${tolerance})` : ""}`);
process.exit(failed ? 1 : 0);

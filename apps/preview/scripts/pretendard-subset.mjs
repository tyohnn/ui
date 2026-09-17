// pretendard-subset — the preview's Pretendard stylesheet, trimmed from the package's static dynamic subset.
//
//   node scripts/pretendard-subset.mjs   → .generated/pretendard-subset.css (vite.config.ts also runs it at dev/build start)
//
// Pretendard is the Hangul fallback of every system (and graphite's sans). The package's full static CSS
// (npm.css) registers nine weights as whole-font woff2 + woff, which Vite emits wholesale: ~17 MB per build.
// The dynamic subset (npm.dynamicSubsetCss in registry/fonts/pretendard.json) splits each weight into 92
// unicode-range chunks, so a page downloads only the chunks its text touches. This keeps the catalog's
// `weights` (400/500/600/700) and only the woff2 source of each chunk; the package itself is not modified.
//
// The chunks do not cover every glyph of the font: ~2,300 code points (Latin Extended, arrows, ⌘ and other
// symbols) are left out. So each weight also gets one face with the whole static woff2 whose unicode-range is
// exactly those code points (read from the font's cmap), which the browser fetches only when a page uses one
// of them. Coverage and glyphs stay those of the full static font.
//
// Static weights, not the variable font: graphite's baseline against its original app measures static Pretendard
// glyph widths, and the dynamic subset carries the same static outlines split by code point, under the same
// family name ("Pretendard") the layer-1 stacks name.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { inflateSync } from "node:zlib";

import { readFontCatalog } from "@tyohnn/build-system/registry";

const previewRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(previewRoot, "package.json"));

/** Where the trimmed stylesheet for catalog font `id` is written (apps/preview/.generated/, git-ignored). */
export const subsetCssPath = (id) => join(previewRoot, `.generated/${id}-subset.css`);

/** Code points a WOFF (1.0, zlib) font maps to a glyph: cmap subtables of format 4 and 12. */
const woffCodePoints = (path) =>
{
    const font = readFileSync(path);

    if (font.toString("latin1", 0, 4) !== "wOFF") throw new Error(`${path} is not a WOFF 1.0 file`);
    let cmap = null;

    for (let index = 0; index < font.readUInt16BE(12); index += 1)
    {
        const entry = 44 + index * 20;

        if (font.toString("latin1", entry, entry + 4) !== "cmap") continue;
        const [offset, compressed, length] = [4, 8, 12].map((at) => font.readUInt32BE(entry + at));
        const data = font.subarray(offset, offset + compressed);

        cmap = compressed === length ? data : inflateSync(data);
    }

    if (!cmap) throw new Error(`${path} has no cmap table`);
    const points = new Set();

    for (let table = 0; table < cmap.readUInt16BE(2); table += 1)
    {
        const at = cmap.readUInt32BE(4 + table * 8 + 4);
        const format = cmap.readUInt16BE(at);

        if (format === 12)
        {
            for (let group = 0; group < cmap.readUInt32BE(at + 12); group += 1)
            {
                const start = cmap.readUInt32BE(at + 16 + group * 12);
                const end = cmap.readUInt32BE(at + 20 + group * 12);

                for (let point = start; point <= end; point += 1) points.add(point);
            }
        }
        else if (format === 4)
        {
            const segments = cmap.readUInt16BE(at + 6) / 2;
            const ends = at + 14;
            const starts = ends + segments * 2 + 2;
            const deltas = starts + segments * 2;
            const offsets = deltas + segments * 2;

            for (let segment = 0; segment < segments; segment += 1)
            {
                const start = cmap.readUInt16BE(starts + segment * 2);
                const end = cmap.readUInt16BE(ends + segment * 2);
                const delta = cmap.readInt16BE(deltas + segment * 2);
                const rangeOffset = cmap.readUInt16BE(offsets + segment * 2);

                for (let point = start; point <= end && point !== 0xffff; point += 1)
                {
                    const glyph = rangeOffset === 0
                        ? (point + delta) & 0xffff
                        : cmap.readUInt16BE(offsets + segment * 2 + rangeOffset + (point - start) * 2);

                    if (glyph !== 0) points.add(point);
                }
            }
        }
    }

    return points;
};

const parseRange = (range) => range.split(",").flatMap((part) =>
{
    const [start, end = start] = part.trim().replace(/^U\+/i, "").split("-").map((hex) => parseInt(hex, 16));

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});

const toRange = (points) =>
{
    const sorted = [...points].sort((a, b) => a - b);
    const parts = [];

    for (let index = 0; index < sorted.length; index += 1)
    {
        const start = sorted[index];

        while (sorted[index + 1] === sorted[index] + 1) index += 1;
        parts.push(start === sorted[index] ? `U+${start.toString(16)}` : `U+${start.toString(16)}-${sorted[index].toString(16)}`);
    }

    return parts.join(", ");
};

const urlOf = (block, format) => block.match(new RegExp(`url\\(['"]?([^)'"]+)['"]?\\)\\s*format\\(['"]${format}['"]\\)`))?.[1];

/**
 * Writes the trimmed stylesheet for catalog font `id` (default pretendard) and returns its path plus counts.
 * Throws when the catalog entry has no dynamicSubsetCss or a catalog weight has no chunks or no static face.
 */
export const writePretendardSubset = ({ id = "pretendard", out = subsetCssPath(id) } = {}) =>
{
    const font = readFontCatalog().get(id);
    const entry = font?.npm?.dynamicSubsetCss;

    if (!entry) throw new Error(`registry/fonts/${id}.json has no npm.dynamicSubsetCss`);

    const source = require.resolve(entry);
    const staticSource = require.resolve(font.npm.css);
    const css = readFileSync(source, "utf8");
    const weights = new Set(font.weights.map(String));
    const header = css.match(/^\s*\/\*[\s\S]*?\*\//)?.[0].trim() ?? "";
    const toUrl = (base, path) => relative(dirname(out), join(dirname(base), path)).split(sep).join("/");
    const chunks = new Map([...weights].map((weight) => [weight, { faces: 0, points: new Set() }]));
    const faces = [];

    for (const [block] of css.matchAll(/@font-face\s*\{[^}]*\}/g))
    {
        const weight = block.match(/font-weight:\s*(\d+)/)?.[1];

        if (!weights.has(weight)) continue;

        const woff2 = urlOf(block, "woff2");
        const range = block.match(/unicode-range:\s*([^;]+);/)?.[1];

        if (!woff2 || !range) throw new Error(`${entry}: a weight ${weight} face has no woff2 source or unicode-range`);

        chunks.get(weight).faces += 1;
        parseRange(range).forEach((point) => chunks.get(weight).points.add(point));
        faces.push(block.replace(/src:[^;]*;/, `src: url(${toUrl(source, woff2)}) format('woff2');`));
    }

    const missing = [...chunks].filter(([, chunk]) => chunk.faces === 0).map(([weight]) => weight);

    if (missing.length > 0) throw new Error(`${entry}: no faces for weight ${missing.join(", ")}`);

    // One face per weight for the glyphs no chunk carries: the whole static woff2, limited to those code points.
    const rest = {};

    for (const [block] of readFileSync(staticSource, "utf8").matchAll(/@font-face\s*\{[^}]*\}/g))
    {
        const weight = block.match(/font-weight:\s*(\d+)/)?.[1];

        if (!weights.has(weight)) continue;

        const woff2 = urlOf(block, "woff2");
        const woff = urlOf(block, "woff");

        if (!woff2 || !woff) throw new Error(`${font.npm.css}: the weight ${weight} face needs a woff2 and a woff source`);

        const covered = chunks.get(weight).points;
        const uncovered = [...woffCodePoints(join(dirname(staticSource), woff))].filter((point) => !covered.has(point));

        rest[weight] = uncovered.length;
        if (uncovered.length === 0) continue;

        faces.push([
            "@font-face {",
            `\tfont-family: '${font.npm.family}';`,
            "\tfont-style: normal;",
            "\tfont-display: swap;",
            `\tfont-weight: ${weight};`,
            `\tsrc: url(${toUrl(staticSource, woff2)}) format('woff2');`,
            `\tunicode-range: ${toRange(uncovered)};`,
            "}",
        ].join("\n"));
    }

    const noStatic = [...weights].filter((weight) => !(weight in rest));

    if (noStatic.length > 0) throw new Error(`${font.npm.css}: no face for weight ${noStatic.join(", ")}`);

    const text = [
        header,
        `/* Generated by apps/preview/scripts/pretendard-subset.mjs from ${entry} (chunks) and ${font.npm.css} (glyphs no chunk carries): weights ${[...weights].join("/")}, woff2 only. */`,
        ...faces,
        "",
    ].join("\n");

    mkdirSync(dirname(out), { recursive: true });
    // Rewritten only when it changes, so a running dev server does not reload for nothing.
    let current = null;

    try
    {
        current = readFileSync(out, "utf8");
    }
    catch
    {
        // first run
    }

    if (current !== text) writeFileSync(out, text);

    return {
        out,
        source,
        chunks: Object.fromEntries([...chunks].map(([weight, chunk]) => [weight, chunk.faces])),
        uncovered: rest,
    };
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href)
{
    const result = writePretendardSubset();

    console.log(`${relative(previewRoot, result.out)}: chunks ${JSON.stringify(result.chunks)} · code points only in the static font ${JSON.stringify(result.uncovered)}`);
}

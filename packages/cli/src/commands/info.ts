// tyohnn list · tyohnn diff

import { join } from "node:path";

import { hash, readIfExists, rel } from "../lib/fs.js";
import { color, log } from "../lib/log.js";
import { isCode, placementOf } from "../project/placement.js";
import { requireRecord, usedIcons, usedSystems } from "../project/record.js";
import { openSource } from "../source/index.js";
import { describeSource, type GlobalOptions, openProjectSource, recordRoot, workingDir } from "./context.js";

const firstSentence = (text: string) => text.split(/(?<=[.;:])\s/)[0].replace(/[.;:]$/, "");

export const list = async (options: GlobalOptions): Promise<void> =>
{
    const { registry, info } = await openSource({ source: options.source, ref: options.ref, offline: options.offline, cwd: workingDir(options) });

    log.info(color.dim(`from ${describeSource(info)}\n`));
    log.info(color.bold("Systems"));

    const systems = registry.systems();
    const width = Math.max(...systems.map((name) => name.length));

    for (const name of systems)
    {
        const meta = registry.system(name);

        log.info(`  ${name.padEnd(width)}  ${firstSentence(meta.description)} ${color.dim(`(${meta.fonts.sans} · ${meta.icons.library} · ${meta.mode})`)}`);
    }

    log.info(color.bold("\nIcon libraries"));

    for (const [name, library] of Object.entries(registry.manifest.iconLibraries)) log.info(`  ${name.padEnd(10)}  ${Object.keys(library.packages).join(" + ")}`);

    log.info(color.bold("\nFonts"));

    const fonts = [...registry.fonts()];
    const fontWidth = Math.max(...fonts.map(([id]) => id.length));

    for (const [id, font] of fonts) log.info(`  ${id.padEnd(fontWidth)}  ${font.family} · ${font.category} · ${font.provider === "google" ? "Google Fonts, self-hosted" : `npm ${font.npm?.package}`}${font.hangul ? " · Hangul" : ""}`);

    log.info(color.dim("\ninit --system <name> [--icons <library>] [--font <id>] [--font-heading <id|inherit>] [--font-mono <id|system>]"));
};

type State = "unchanged" | "upstream" | "local" | "conflict" | "removed upstream" | "added upstream";

export const diff = async (options: GlobalOptions): Promise<number> =>
{
    const root = recordRoot(options) ?? workingDir(options);
    const record = requireRecord(root);
    const { registry, info } = await openProjectSource(options, record);
    const placement = placementOf(root, record);
    const rows: { path: string; state: State }[] = [];
    const recordedFrom = new Set(Object.values(record.files).map((file) => file.from));

    for (const [path, file] of Object.entries(record.files).sort(([a], [b]) => a.localeCompare(b)))
    {
        if (file.from.startsWith("generated:")) continue;

        if (!registry.has(file.from))
        {
            rows.push({ path, state: "removed upstream" });
            continue;
        }

        const source = registry.read(file.from);
        const expected = isCode(file.from) ? placement.rewrite(source) : source;
        const current = readIfExists(join(root, path));
        const localChanged = current === null || hash(current) !== file.hash;
        const upstreamChanged = hash(expected) !== file.hash;

        rows.push({ path, state: current === expected ? "unchanged" : localChanged && upstreamChanged ? "conflict" : localChanged ? "local" : "upstream" });
    }

    const wanted = [
        ...registry.manifest.files.filter((file) => /^(components|hooks|lib)\//.test(file) || file === "icons/names.ts").map((file) => `registry/ui/${file}`),
        ...usedIcons(record).map((library) => `registry/ui/${registry.iconLibrary(library).file}`),
        ...usedSystems(record).flatMap((system) => registry.systemFiles(system).map((file) => `${registry.systemDir(system)}/${file}`)),
    ];

    for (const from of wanted.filter((from) => !recordedFrom.has(from)))
    {
        const target = placement.target(from);

        if (target) rows.push({ path: rel(root, target), state: "added upstream" });
    }

    const counts = new Map<State, number>();

    rows.forEach((row) => counts.set(row.state, (counts.get(row.state) ?? 0) + 1));

    const from = record.source.commit ? `${record.source.commit.slice(0, 7)} (recorded)` : "the recorded source";

    log.info(`${color.bold("diff")} ${from} → ${describeSource(info)}`);
    log.info(`  ${[...counts].map(([state, count]) => `${count} ${state}`).join(" · ") || "no files recorded"}`);

    const labels: Record<Exclude<State, "unchanged">, string> = {
        upstream: "changed in the source (safe to take)",
        local: "changed in this project",
        conflict: "changed in both",
        "removed upstream": "no longer in the source",
        "added upstream": "new in the source",
    };

    for (const [state, label] of Object.entries(labels) as [Exclude<State, "unchanged">, string][])
    {
        const paths = rows.filter((row) => row.state === state).map((row) => row.path);

        if (!paths.length) continue;

        const shown = options.files ? paths : paths.slice(0, 10);

        log.info(`\n${color.bold(label)} (${paths.length})`);
        shown.forEach((path) => log.info(`  ${path}`));
        if (shown.length < paths.length) log.info(color.dim(`  … ${paths.length - shown.length} more (--files lists all)`));
    }

    if (!rows.some((row) => row.state !== "unchanged")) log.info("\nThe project's copies match the source.");

    return 0;
};

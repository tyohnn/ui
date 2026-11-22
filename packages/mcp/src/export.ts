import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { coloursOf, colourChanges, startState, type SystemState, type ThemeLibrary } from "./system";
import type { SystemSummary } from "./catalog";

/**
 * A design system as the files an app keeps: the base system's styles folder with the draft's changes written into
 * it, plus tyohnn.json (where it came from) and concept.md (what it is for). Nothing here runs or names the tyohnn
 * CLI: the plugin and the CLI are separate products, and an app set up through the plugin owns these files outright.
 *
 * The changes go at the end of the file they belong to, in one marked block per scope, so a person reading the file
 * sees the base and what this system changed over it:
 *   colours → theme.css (`:root` for light, `.dark` for dark), only the names whose value moved
 *   tokens  → tokens.css (`:root`)
 */

export interface Draft
{
    /** The system's own name (kebab-case), e.g. forest-glass */
    name: string;
    /** What the person asked for, in their words, and how each axis answers it */
    concept: string;
}

export interface ExportFile
{
    /** Path inside the system folder, e.g. styles/tokens.css */
    path: string;
    content: string;
}

/** The order an app imports the styles in (the same order the registry's own build uses) */
export const IMPORT_ORDER = ["globals.css", "theme.css", "tokens.css", "typeset.css", "typeset-preset.css"];

const block = (title: string, scope: string, values: [string, string][]) =>
    values.length === 0 ? "" : `\n/* ---- ${title} ---- */\n${scope} {\n${values.map(([name, value]) => `    ${name}: ${value};`).join("\n")}\n}\n`;

const filesUnder = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) =>
    {
        const path = join(dir, name);

        return statSync(path).isDirectory() ? filesUnder(path) : [path];
    });

/** The colours that differ from the base system's own, per mode, as custom properties */
export const colourEdits = (state: SystemState, library: ThemeLibrary, base: SystemSummary) =>
{
    if (colourChanges(state, state.system) === 0) return { light: [], dark: [] } as Record<"light" | "dark", [string, string][]>;

    const now = coloursOf(state, library) as Record<"light" | "dark", Record<string, string>>;
    const own = coloursOf(startState(base, library), library) as Record<"light" | "dark", Record<string, string>>;
    const moved = (mode: "light" | "dark") =>
        Object.entries(now[mode]).filter(([name, value]) => own[mode][name] !== value).map(([name, value]) => [`--${name}`, value] as [string, string]);

    return { light: moved("light"), dark: moved("dark") };
};

export const tyohnnJson = (draft: Draft, state: SystemState, stylesDir: string) => ({
    schema: 2,
    system: draft.name,
    styles: stylesDir,
    imports: [...IMPORT_ORDER.map((file) => `${stylesDir}/${file}`), `${stylesDir}/style.css layer(base)`],
    source: {
        kind: "mcp",
        base: state.system,
        palette: state.palette,
        accent: state.accent,
        chart: state.chart,
        colours: state.colours,
        tokens: state.tokens,
    },
});

export const conceptMd = (draft: Draft, state: SystemState, baseCharacter: string) => [
    `# ${draft.name}`,
    "",
    draft.concept.trim(),
    "",
    `## Base: ${state.system}`,
    "",
    "What the base system chose, axis by axis. The changes above override it where they say so.",
    "",
    baseCharacter.trim() || "(the base system has no Character section)",
    "",
].join("\n");

/**
 * Every file of the system. `stylesDir` is where the app keeps the styles folder (used in tyohnn.json's import
 * list); paths in the result are relative to the system folder.
 */
export const exportSystem = (options: {
    root: string;
    state: SystemState;
    library: ThemeLibrary;
    base: SystemSummary;
    draft: Draft;
    baseCharacter: string;
    stylesDir: string;
}): ExportFile[] =>
{
    const { root, state, library, base, draft } = options;
    const styles = join(root, "registry/systems", state.system, "styles");
    const colours = colourEdits(state, library, base);
    const tokens = Object.entries(state.tokens);
    const files: ExportFile[] = filesUnder(styles).map((path) => ({ path: `styles/${relative(styles, path)}`, content: readFileSync(path, "utf8") }));

    for (const file of files)
    {
        if (file.path === "styles/theme.css")
        {
            file.content = file.content.trimEnd() + "\n"
                + block(`${draft.name}: colours changed over ${state.system} (light)`, ":root", colours.light)
                + block(`${draft.name}: colours changed over ${state.system} (dark)`, ".dark", colours.dark);
        }

        if (file.path === "styles/tokens.css")
        {
            file.content = file.content.trimEnd() + "\n" + block(`${draft.name}: tokens changed over ${state.system}`, ":root", tokens);
        }
    }

    files.push({ path: "tyohnn.json", content: `${JSON.stringify(tyohnnJson(draft, state, options.stylesDir), null, 4)}\n` });
    files.push({ path: "concept.md", content: conceptMd(draft, state, options.baseCharacter) });

    return files.sort((a, b) => a.path.localeCompare(b.path));
};

/** Writes the files under `dir` and returns what it wrote, relative to `dir` */
export const writeSystem = (dir: string, files: ExportFile[]) =>
{
    for (const file of files)
    {
        const path = join(dir, file.path);

        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.content);
    }

    return files.map((file) => file.path);
};

/** The lines the app's CSS entry needs, in order, for a styles folder at `stylesDir` (relative to that entry) */
export const importLines = (stylesDir: string) =>
    [...IMPORT_ORDER.map((file) => `@import "${stylesDir}/${file}";`), `@import "${stylesDir}/style.css" layer(base);`];

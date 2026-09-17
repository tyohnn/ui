// Fonts (DESIGN.md §8–9). A system's layer-1 stacks name catalog families; how the files get loaded is the app's.
//
//   Next   next/font/google for `provider: google`, next/font/local over the installed npm package for `provider: local`.
//          next/font registers its own family names, so the entry CSS redeclares the three stacks on the next/font
//          variables (same order and fallbacks). The system's own files stay identical to the registry.
//   Vite   the fontsource / npm package and an `@import` of its CSS entry; the family-name stacks work as written.
//          The entry CSS redeclares the stacks only when --font overrides change them.

import { join, relative } from "node:path";

import { posix, relSpecifier } from "../lib/fs.js";
import type { FontEntry, FontsChoice, Registry } from "../source/registry.js";

export const FALLBACKS: Record<FontEntry["category"], string[]> = {
    sans: ["ui-sans-serif", "system-ui", "sans-serif"],
    display: ["ui-sans-serif", "system-ui", "sans-serif"],
    serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
    mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", '"Liberation Mono"', '"Courier New"', "monospace"],
};

export interface FontOverrides
{
    sans?: string;
    heading?: string;
    mono?: string;
}

export const resolveFonts = (systemFonts: FontsChoice, overrides: FontOverrides = {}): FontsChoice => ({
    ...systemFonts,
    ...Object.fromEntries(Object.entries(overrides).filter(([, value]) => typeof value === "string" && value)),
});

export const sameFonts = (a: FontsChoice, b: FontsChoice): boolean =>
    a.sans === b.sans && a.heading === b.heading && a.mono === b.mono && a.hangulFallback === b.hangulFallback;

/** Catalog ids that need loading (heading `inherit` and mono `system` load nothing) */
export const fontIds = (fonts: FontsChoice): string[] =>
    [...new Set([fonts.sans, fonts.heading, fonts.mono, fonts.hangulFallback].filter((id) => id && id !== "inherit" && id !== "system"))];

/** Checks override values before anything is written */
export const validateFonts = (fonts: FontsChoice, registry: Registry): void =>
{
    registry.font(fonts.sans);
    if (fonts.heading !== "inherit") registry.font(fonts.heading);
    if (fonts.mono !== "system") registry.font(fonts.mono);
    registry.font(fonts.hangulFallback);
};

type Families = (font: FontEntry) => string[];

const stacksWith = (fonts: FontsChoice, registry: Registry, families: Families): Record<string, string> =>
{
    const hangul = registry.font(fonts.hangulFallback);
    const stack = (id: string) =>
    {
        const font = registry.font(id);

        return [...families(font), ...(id === fonts.hangulFallback ? [] : families(hangul)), ...FALLBACKS[font.category]].join(", ");
    };
    const mono = FALLBACKS.mono;

    return {
        "--font-sans": stack(fonts.sans),
        "--font-heading": fonts.heading === "inherit" ? "var(--font-sans)" : stack(fonts.heading),
        "--font-mono": fonts.mono === "system" ? [...mono.slice(0, -1), ...families(hangul), mono.at(-1)!].join(", ") : stack(fonts.mono),
    };
};

/** Family names a catalog font contributes: its family, then the one its package registers when different */
export const fontFamilies: Families = (font) =>
    [...new Set([font.family, font.fontsource?.family ?? font.npm?.family].filter((family): family is string => Boolean(family)))].map((family) => `"${family}"`);

/** The registry's layer-1 stacks (what tooling/validate-system checks) */
export const familyStacks = (fonts: FontsChoice, registry: Registry) => stacksWith(fonts, registry, fontFamilies);

/** The same stacks on next/font variables */
export const nextFontStacks = (fonts: FontsChoice, registry: Registry) => stacksWith(fonts, registry, (font) => [`var(${font.next.variable})`]);

export const stacksCss = (stacks: Record<string, string>): string =>
    [":root {", ...Object.entries(stacks).map(([name, value]) => `    ${name}: ${value};`), "}"].join("\n");

/** npm packages an app needs for its fonts */
export const fontPackages = (fonts: FontsChoice, registry: Registry, framework: "next" | "vite"): Record<string, string> =>
    Object.fromEntries(fontIds(fonts).flatMap((id) =>
    {
        const font = registry.font(id);
        const name = font.provider === "local" ? font.npm?.package : framework === "vite" ? font.fontsource?.package : undefined;

        return name ? [[name, registry.rangeOf(name) ?? "latest"]] : [];
    }));

/** Vite: `@import` lines for the fonts' CSS entries */
export const cssFontImports = (fonts: FontsChoice, registry: Registry): string[] =>
    fontIds(fonts).map((id) =>
    {
        const font = registry.font(id);
        const entry = font.provider === "local" ? font.npm?.css : font.fontsource?.css;

        return `@import "${entry}";`;
    });

const identifier = (id: string) => `font${id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("")}`;

export interface NextFontCode
{
    /** Import lines and declarations for the layout's managed block */
    lines: string[];
    /** `fontInter.variable` expressions for <html> */
    variables: string[];
    /** CSS variables the declarations define */
    cssVariables: string[];
    /** Packages whose files could not be found (not installed yet) */
    unresolved: string[];
}

/**
 * next/font code for a root layout. `packageDir(name)` finds an installed package from the app (without following
 * symlinks, so pnpm's node_modules/<name> link is used rather than its store path).
 *
 * `adjustFontFallback: false`: next/font would otherwise append a metric-adjusted Arial between the font and the
 * Hangul fallback. Google variable fonts load their default axis only, like the fontsource entry the preview uses.
 */
export const nextFontCode = (fonts: FontsChoice, registry: Registry, layoutDir: string, appDir: string, packageDir: (name: string) => string | null): NextFontCode =>
{
    const google: string[] = [];
    const decls: string[] = [];
    const unresolved: string[] = [];
    let local = false;

    for (const id of fontIds(fonts))
    {
        const font = registry.font(id);
        const name = identifier(id);
        const common = `variable: ${JSON.stringify(font.next.variable)}, display: "swap", adjustFontFallback: false`;

        if (font.provider === "google")
        {
            google.push(font.next.import);

            const weight = font.fontsource?.variable === false ? `, weight: ${JSON.stringify(font.weights.map(String))}` : "";

            decls.push(`const ${name} = ${font.next.import}({ ${common}, subsets: ${JSON.stringify(font.subsets)}${weight} });`);
            continue;
        }

        local = true;

        const pkg = font.npm!.package;
        const dir = packageDir(pkg);

        if (!dir) unresolved.push(pkg);

        const base = dir ?? join(appDir, "node_modules", pkg);
        const files = font.local!.files.map((file) =>
        {
            const inside = file.path.startsWith(`${pkg}/`) ? file.path.slice(pkg.length + 1) : file.path;
            const path = relSpecifier(layoutDir, join(base, inside));

            return `        { path: ${JSON.stringify(posix(path))}, weight: "${file.weight}", style: "${file.style}" },`;
        });

        decls.push([`const ${name} = localFont({`, `    ${common},`, "    src: [", ...files, "    ],", "});"].join("\n"));
    }

    const lines = [
        ...(google.length ? [`import { ${[...new Set(google)].sort().join(", ")} } from "next/font/google";`] : []),
        ...(local ? ['import localFont from "next/font/local";'] : []),
        "",
        ...decls,
    ];

    return {
        lines,
        variables: fontIds(fonts).map((id) => `${identifier(id)}.variable`),
        cssVariables: fontIds(fonts).map((id) => registry.font(id).next.variable),
        unresolved,
    };
};

export const describeFonts = (fonts: FontsChoice): string =>
    `sans ${fonts.sans} · heading ${fonts.heading} · mono ${fonts.mono} · hangul ${fonts.hangulFallback}`;

export const relativeTo = (from: string, to: string) => posix(relative(from, to));

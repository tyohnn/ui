// Fonts for a Next app (DESIGN.md §8–9): next/font loads the files, the layer-1 stacks read its variables.
//
// next/font registers each font under a family name of its own: the declaring identifier for local fonts
// ("fontPretendard" in Next 16, a hashed name in older releases), so the family names in a system's layer-1
// stacks ("Pretendard") cannot be relied on. The app's globals.css therefore redeclares
// the three stacks after the system imports, with each catalog font's `next.variable` in place of its
// family names. The system's own files stay byte-identical to the registry snapshot.

import { join } from "node:path";

import { relPath } from "./util.mjs";

const FALLBACKS = {
    sans: ["ui-sans-serif", "system-ui", "sans-serif"],
    display: ["ui-sans-serif", "system-ui", "sans-serif"],
    serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"],
    mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", '"Liberation Mono"', '"Courier New"', "monospace"],
};

/** The system's fonts with `--font` · `--font-heading` · `--font-mono` overrides applied */
export const resolveFonts = (systemFonts, overrides = {}) => ({
    ...systemFonts,
    ...Object.fromEntries(Object.entries(overrides).filter(([, value]) => value)),
});

/** Catalog ids that need loading (heading `inherit` and mono `system` load nothing) */
export const fontIds = (fonts) =>
    [...new Set([fonts.sans, fonts.heading, fonts.mono, fonts.hangulFallback].filter((id) => id && id !== "inherit" && id !== "system"))];

/** The three layer-1 stacks on next/font variables, following the same rules as the registry stacks */
export const nextFontStacks = (fonts, source) =>
{
    const variable = (id) => `var(${source.font(id).next.variable})`;
    const hangul = fonts.hangulFallback;
    const stack = (id) => [variable(id), ...(id === hangul ? [] : [variable(hangul)]), ...FALLBACKS[source.font(id).category]].join(", ");
    const mono = FALLBACKS.mono;

    return {
        "--font-sans": stack(fonts.sans),
        "--font-heading": fonts.heading === "inherit" ? "var(--font-sans)" : stack(fonts.heading),
        "--font-mono": fonts.mono === "system" ? [...mono.slice(0, -1), variable(hangul), mono.at(-1)].join(", ") : stack(fonts.mono),
    };
};

const identifier = (id) => `font${id.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("")}`;

/**
 * layout.tsx code for next/font. `provider: google` → next/font/google (downloaded at build time and
 * self-hosted by Next); `provider: local` → next/font/local over the npm package's woff2 files.
 *
 * `adjustFontFallback: false`: next/font would otherwise append a metric-adjusted Arial/Times family to the
 * variable, which sits between the font and the Hangul fallback in the stack. The stack's own fallbacks are
 * the design's. (Next 16.3 webpack honours it; Turbopack still appends "Inter Fallback" for Google fonts —
 * a local Arial without Hangul, so Hangul still reaches the fallback font.)
 *
 * Google variable fonts load their default axis (wght) only, like the fontsource CSS entry the preview uses.
 */
export const nextFontCode = ({ fonts, source, layoutDir, target }) =>
{
    const ids = fontIds(fonts);
    const google = [];
    const decls = [];
    const packages = {};
    let local = false;

    for (const id of ids)
    {
        const font = source.font(id);
        const name = identifier(id);
        const common = `variable: ${JSON.stringify(font.next.variable)}, display: "swap", adjustFontFallback: false`;

        if (font.provider === "google")
        {
            google.push(font.next.import);

            const weight = font.fontsource?.variable === false ? `, weight: ${JSON.stringify(font.weights.map(String))}` : "";

            decls.push(`const ${name} = ${font.next.import}({ ${common}, subsets: ${JSON.stringify(font.subsets)}${weight} });`);
        }
        else
        {
            local = true;
            packages[font.npm.package] = source.rangeOf(font.npm.package) ?? "*";

            // Workspaces hoist the package to the monorepo root; doctor checks the files exist after install.
            const files = font.local.files.map((file) =>
                `        { path: ${JSON.stringify(relPath(layoutDir, join(target, "node_modules", file.path)))}, weight: "${file.weight}", style: "${file.style}" },`);

            decls.push(`const ${name} = localFont({\n    ${common},\n    src: [\n${files.join("\n")}\n    ],\n});`);
        }
    }

    const imports = [
        ...(google.length ? [`import { ${[...new Set(google)].sort().join(", ")} } from "next/font/google";`] : []),
        ...(local ? [`import localFont from "next/font/local";`] : []),
    ];

    return {
        imports,
        decls,
        variables: ids.map((id) => `${identifier(id)}.variable`),
        cssVariables: ids.map((id) => source.font(id).next.variable),
        packages,
    };
};

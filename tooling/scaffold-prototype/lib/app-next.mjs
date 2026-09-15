// Wires one Next (App Router) app to one system of packages/ui.
//
// Files the CLI creates when missing, and the managed blocks it rewrites every run:
//   package.json          <scope>/ui · next · react · font packages · tailwind (merged, never removed)
//   tsconfig.json         paths["<scope>/ui/icons"] → this app's icon library (merged)
//   next.config.ts        block `next`: transpilePackages · Turbopack root and resolveAlias · webpack alias
//   src/app/globals.css   block `system`: tailwindcss → layer 1 → layer 2 → typeset → layer 3 layer(base) → @source → font stacks
//   src/app/layout.tsx    block `fonts`: next/font declarations and the <html> class (default mode · font-sans · variables)
//   src/app/_examples/component-sheet/   the preview's component sheet with imports rewritten (--example)

import { existsSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

import { nextFontCode, nextFontStacks } from "./fonts.mjs";
import { rewriteAliases } from "./source.mjs";
import { uiPaths } from "./ui.mjs";
import { hash, hasBlock, posix, read, readJson, relPath, sortKeys, upsertBlock, walk, writeFile, writeJson } from "./util.mjs";

/** The Next version this prototype was verified with */
export const NEXT_VERSION = "16.3.4";

export const appPaths = (target, appPath) =>
{
    const root = join(target, appPath);

    return {
        root,
        pkg: join(root, "package.json"),
        tsconfig: join(root, "tsconfig.json"),
        nextConfig: join(root, "next.config.ts"),
        globals: join(root, "src/app/globals.css"),
        layout: join(root, "src/app/layout.tsx"),
        page: join(root, "src/app/page.tsx"),
        examples: join(root, "src/app/_examples"),
    };
};

const cssImports = ({ scope, system }) => [
    `@import "tailwindcss";`,
    `@import "${scope}/ui/systems/${system}/globals.css";`,
    `@import "${scope}/ui/systems/${system}/tokens.css";`,
    `@import "${scope}/ui/systems/${system}/typeset.css";`,
    `@import "${scope}/ui/systems/${system}/typeset-preset.css";`,
    `@import "${scope}/ui/systems/${system}/style.css" layer(base);`,
];

/** The import sequence doctor expects, as [specifier, layer] pairs */
export const expectedImports = (scope, system) =>
    cssImports({ scope, system }).map((line) => [line.match(/"([^"]+)"/)[1], line.includes("layer(base)") ? "base" : null]);

export const wireNextApp = (ctx, { appPath, system, icons, fonts, mode, port, example }) =>
{
    const { target, scope, source, log } = ctx;
    const app = appPaths(target, appPath);
    const ui = uiPaths(target, ctx.uiPath);
    const toRoot = posix(relative(app.root, target)) || ".";
    const created = !existsSync(app.pkg);

    // package.json
    const font = nextFontCode({ fonts, source, layoutDir: dirname(app.layout), target });
    const tailwind = source.versionOf("tailwindcss", "^4");
    const pkg = readJson(app.pkg, {
        name: `${scope}/${basename(appPath)}`,
        version: "0.0.0",
        private: true,
        scripts: {
            dev: `next dev -p ${port}`,
            build: "next build",
            start: `next start -p ${port}`,
            // typegen writes next-env.d.ts and route types, so tsc works before (or without) a build.
            typecheck: "next typegen && tsc --noEmit",
        },
    });

    pkg.dependencies = sortKeys({
        [`${scope}/ui`]: "*",
        next: NEXT_VERSION,
        react: source.rangeOf("react") ?? "^19",
        "react-dom": source.rangeOf("react-dom") ?? "^19",
        ...font.packages,
        ...pkg.dependencies,
    });
    pkg.devDependencies = sortKeys({
        "@tailwindcss/postcss": tailwind,
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        tailwindcss: tailwind,
        typescript: "^5",
        ...pkg.devDependencies,
    });
    writeJson(app.pkg, pkg);
    log.wrote(app.pkg);

    if (!existsSync(join(app.root, "postcss.config.mjs")))
    {
        writeFile(join(app.root, "postcss.config.mjs"), 'export default { plugins: { "@tailwindcss/postcss": {} } };\n');
        log.wrote(join(app.root, "postcss.config.mjs"));
    }

    // tsconfig.json — the icon alias for tsc. Module resolution is program-wide, so packages/ui sources the app
    // compiles resolve <scope>/ui/icons to this library too.
    const iconFile = ui.library(icons);
    const tsconfig = readJson(app.tsconfig, {
        extends: posix(relative(app.root, join(target, "tsconfig.base.json"))),
        compilerOptions: {
            lib: ["ES2022", "DOM", "DOM.Iterable"],
            jsx: "react-jsx",
            allowJs: true,
            incremental: true,
            plugins: [{ name: "next" }],
            paths: { "@/*": ["./src/*"] },
        },
        include: ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "next.config.ts"],
        exclude: ["node_modules"],
    });

    tsconfig.compilerOptions.paths = { ...tsconfig.compilerOptions.paths, [`${scope}/ui/icons`]: [relPath(app.root, iconFile)] };
    writeJson(app.tsconfig, tsconfig);
    log.wrote(app.tsconfig);

    // next.config.ts
    const nextBlock = [
        `// Managed by tyohnn: system ${system} · icons ${icons}. Rewritten by init / add-system; edit outside this block.`,
        `// ${scope}/ui ships TypeScript source, so Next transpiles it. Its components import \`${scope}/ui/icons\`, which`,
        `// packages/ui resolves to the monorepo default; this app points that exact specifier at its own library,`,
        "// in both bundlers (Turbopack for dev and build, webpack for `--webpack`), as tsconfig paths does for tsc.",
        `const monorepoRoot = path.join(__dirname, ${JSON.stringify(toRoot)});`,
        "const tyohnn = {",
        `    transpilePackages: [${JSON.stringify(`${scope}/ui`)}],`,
        `    iconSpecifier: ${JSON.stringify(`${scope}/ui/icons`)},`,
        "    // Relative to this app's directory (Turbopack resolves alias targets from the project directory, not",
        "    // turbopack.root). A Turbopack alias whose target does not resolve is ignored without an error and the",
        "    // specifier falls back to packages/ui's default library, so tyohnn doctor checks this path exists.",
        `    iconAlias: ${JSON.stringify(relPath(app.root, iconFile))},`,
        "};",
    ].join("\n");

    if (!existsSync(app.nextConfig))
    {
        writeFile(app.nextConfig, [
            'import path from "node:path";',
            "",
            'import type { NextConfig } from "next";',
            "",
            upsertBlock("", "ts", "next", nextBlock).trimEnd(),
            "",
            "const nextConfig: NextConfig = {",
            "    transpilePackages: tyohnn.transpilePackages,",
            "    outputFileTracingRoot: monorepoRoot,",
            "    turbopack: {",
            "        root: monorepoRoot,",
            "        resolveAlias: { [tyohnn.iconSpecifier]: tyohnn.iconAlias },",
            "    },",
            "    webpack: (config) =>",
            "    {",
            "        // `$`: exact match, so nothing under the specifier is redirected.",
            "        config.resolve.alias = { ...config.resolve.alias, [`${tyohnn.iconSpecifier}$`]: path.resolve(__dirname, tyohnn.iconAlias) };",
            "",
            "        return config;",
            "    },",
            "};",
            "",
            "export default nextConfig;",
            "",
        ].join("\n"));
        log.wrote(app.nextConfig);
    }
    else if (hasBlock(read(app.nextConfig), "ts", "next"))
    {
        writeFile(app.nextConfig, upsertBlock(read(app.nextConfig), "ts", "next", nextBlock));
        log.wrote(app.nextConfig);
    }
    else
    {
        log.note(`${posix(relative(target, app.nextConfig))} exists without a tyohnn block: add transpilePackages ["${scope}/ui"] and alias ${scope}/ui/icons → ${posix(relative(target, iconFile))} (turbopack.resolveAlias and webpack resolve.alias) by hand`);
    }

    // globals.css
    const stacks = nextFontStacks(fonts, source);
    const systemBlock = [
        `/* One design system per app: ${system}. The order is the cascade contract (tyohnn DESIGN.md §1):`,
        "   tailwindcss → layer 1 colours → layer 2 tokens → typeset → layer 3 rules in layer(base), so className",
        "   utilities still win. Never import a second system: every system defines the same cn-* rules globally. */",
        ...cssImports({ scope, system }),
        "",
        "/* Tailwind does not scan workspace packages by itself; the system folders are CSS, not class sources. */",
        `@source "${relPath(dirname(app.globals), ui.src)}";`,
        `@source not "${relPath(dirname(app.globals), ui.systems)}";`,
        "",
        "/* Layer-1 font stacks on the next/font variables from layout.tsx: next/font registers its own family names,",
        `   so the system's "${source.font(fonts.sans).family}" stack would not match. Same order and fallbacks as the system. */`,
        ":root {",
        ...Object.entries(stacks).map(([name, value]) => `    ${name}: ${value};`),
        "}",
    ].join("\n");

    writeFile(app.globals, upsertBlock(existsSync(app.globals) ? read(app.globals) : "", "css", "system", systemBlock));
    log.wrote(app.globals);

    // layout.tsx
    const htmlClass = [...(mode === "dark" ? ['"dark"'] : []), '"font-sans"', ...font.variables];
    const fontsBlock = [
        `// Fonts of ${system} (${Object.entries(fonts).map(([role, id]) => `${role} ${id}`).join(" · ")}), self-hosted by next/font.`,
        ...font.imports,
        "",
        ...font.decls,
        "",
        `// defaultMode ${mode}${mode === "dark" ? " (`dark` must sit on <html>: layer-2 compositions resolve on :root)" : ""} · font-sans · next/font variables.`,
        `const tyohnnHtmlClassName = [${htmlClass.join(", ")}].join(" ");`,
    ].join("\n");

    if (!existsSync(app.layout))
    {
        writeFile(app.layout, [
            'import type { Metadata } from "next";',
            'import type { ReactNode } from "react";',
            "",
            upsertBlock("", "ts", "fonts", fontsBlock).trimEnd(),
            "",
            'import "./globals.css";',
            "",
            `export const metadata: Metadata = { title: ${JSON.stringify(basename(appPath))} };`,
            "",
            "export default function RootLayout({ children }: Readonly<{ children: ReactNode }>)",
            "{",
            "    return (",
            '        <html lang="ko" className={tyohnnHtmlClassName}>',
            '            <body className="bg-background text-foreground antialiased">{children}</body>',
            "        </html>",
            "    );",
            "}",
            "",
        ].join("\n"));
        log.wrote(app.layout);
    }
    else if (hasBlock(read(app.layout), "ts", "fonts"))
    {
        writeFile(app.layout, upsertBlock(read(app.layout), "ts", "fonts", fontsBlock));
        log.wrote(app.layout);
    }
    else
    {
        log.note(`${posix(relative(target, app.layout))} exists without a tyohnn block: load ${font.cssVariables.join(", ")} with next/font and put ${mode === "dark" ? "dark font-sans" : "font-sans"} plus the variables on <html> by hand`);
    }

    // Example page: the preview's component sheet, imports rewritten.
    if (example)
    {
        const from = source.templateDir(example);

        for (const file of walk(from))
        {
            const to = join(app.examples, example, relative(from, file));
            const content = rewriteAliases(read(file), scope);

            writeFile(to, content);
            ctx.record.files[posix(relative(target, to))] = hash(content);
            log.wrote(to);
        }

        if (!existsSync(app.page))
        {
            const exportName = example.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");

            writeFile(app.page, [
                `import { ${exportName} } from "./_examples/${example}";`,
                "",
                `export default function Page()`,
                "{",
                `    return <${exportName} />;`,
                "}",
                "",
            ].join("\n"));
            log.wrote(app.page);
        }
    }

    if (created) log.note(`${appPath}: created a Next ${NEXT_VERSION} app (port ${port})`);

    ctx.record.apps[appPath] = { framework: "next", system, icons, fonts, mode, port, ...(example ? { example } : {}) };
};

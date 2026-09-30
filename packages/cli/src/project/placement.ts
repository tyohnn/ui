// Where registry files land, and how their placeholder imports are rewritten.
//
//   registry path                          monorepo (<ui> = packages/ui)          single app (<base> = src)
//   registry/ui/components/x.tsx           <ui>/src/components/x.tsx              <base>/components/ui/x.tsx
//   registry/ui/hooks/x.ts                 <ui>/src/hooks/x.ts                    <base>/hooks/x.ts
//   registry/ui/lib/x.ts                   <ui>/src/lib/x.ts                      <base>/lib/x.ts
//   registry/ui/icons/names.ts             <ui>/src/icons/names.ts                <base>/components/icons/names.ts
//   registry/ui/icons/libraries/l.tsx      <ui>/src/icons/libraries/l.tsx         <base>/components/icons/libraries/l.tsx
//   registry/ui/strings/names.ts           <ui>/src/strings/names.ts              <base>/lib/strings/names.ts
//   registry/ui/strings/locales/l.ts       <ui>/src/strings/locales/l.ts          <base>/lib/strings/locales/l.ts
//   registry/systems/s/styles/…            <ui>/src/systems/s/…                   <base>/styles/tyohnn/s/…
//   registry/systems/s/{DESIGN.md,system.json}  same folder as the styles
//
//   @tyohnn/components/x                   <scope>/ui/components/x                @/components/ui/x
//   @tyohnn/lib/x · @tyohnn/hooks/x        <scope>/ui/lib/x · …/hooks/x           @/lib/x · @/hooks/x
//   @tyohnn/icons                          <scope>/ui/icons                       @/components/icons
//   @tyohnn/strings                        <scope>/ui/strings                     @/lib/strings

import { join } from "node:path";

import type { TyohnnRecord } from "./record.js";

export interface Placement
{
    monorepo: boolean;
    root: string;
    /** Absolute folder the layout above is relative to */
    base: string;
    importBase: string;
    rewrite: (content: string) => string;
    /** Absolute target of a registry file, or null when the CLI does not copy it */
    target: (from: string) => string | null;
    systemDir: (system: string) => string;
    iconsDir: string;
    librariesDir: string;
    /** The import specifier of the icon module */
    iconSpecifier: string;
    stringsDir: string;
}

export const rewriteMonorepo = (content: string, pkg: string): string =>
    content
        .replace(/@tyohnn\/(components|lib|hooks)\//g, `${pkg}/$1/`)
        .replace(/@tyohnn\/icons\b/g, `${pkg}/icons`)
        .replace(/@tyohnn\/strings\b/g, `${pkg}/strings`);

export const rewriteApp = (content: string, alias: string): string =>
    content
        .replace(/@tyohnn\/components\//g, `${alias}/components/ui/`)
        .replace(/@tyohnn\/(lib|hooks)\//g, `${alias}/$1/`)
        .replace(/@tyohnn\/icons\b/g, `${alias}/components/icons`)
        .replace(/@tyohnn\/strings\b/g, `${alias}/lib/strings`);

export const placementOf = (root: string, record: Pick<TyohnnRecord, "project" | "ui">): Placement =>
{
    const monorepo = record.project === "monorepo";
    const base = monorepo ? join(root, record.ui.path, "src") : join(root, record.ui.path);
    const importBase = record.ui.importBase;
    const componentsDir = monorepo ? join(base, "components") : join(base, "components/ui");
    const iconsDir = monorepo ? join(base, "icons") : join(base, "components/icons");
    const systemsDir = monorepo ? join(base, "systems") : join(base, "styles/tyohnn");
    const stringsDir = monorepo ? join(base, "strings") : join(base, "lib/strings");

    const target = (from: string): string | null =>
    {
        let match = from.match(/^registry\/ui\/components\/(.+)$/);

        if (match) return join(componentsDir, match[1]);
        if ((match = from.match(/^registry\/ui\/(hooks|lib)\/(.+)$/))) return join(base, match[1], match[2]);
        if (from === "registry/ui/icons/names.ts") return join(iconsDir, "names.ts");
        if ((match = from.match(/^registry\/ui\/icons\/libraries\/(.+)$/))) return join(iconsDir, "libraries", match[1]);
        if (from === "registry/ui/strings/names.ts") return join(stringsDir, "names.ts");
        if ((match = from.match(/^registry\/ui\/strings\/locales\/(.+)$/))) return join(stringsDir, "locales", match[1]);
        if ((match = from.match(/^registry\/systems\/([^/]+)\/styles\/(.+)$/))) return join(systemsDir, match[1], match[2]);
        if ((match = from.match(/^registry\/systems\/([^/]+)\/(DESIGN\.md|system\.json)$/))) return join(systemsDir, match[1], match[2]);

        return null;
    };

    return {
        monorepo,
        root,
        base,
        importBase,
        rewrite: (content) => (monorepo ? rewriteMonorepo(content, importBase) : rewriteApp(content, importBase)),
        target,
        systemDir: (system) => join(systemsDir, system),
        iconsDir,
        librariesDir: join(iconsDir, "libraries"),
        iconSpecifier: monorepo ? `${importBase}/icons` : `${importBase}/components/icons`,
        stringsDir,
    };
};

/** Whether a copied file gets its imports rewritten */
export const isCode = (from: string): boolean => /\.(ts|tsx)$/.test(from);

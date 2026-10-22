import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { COVERAGE_GROUPS } from "../../../apps/preview/src/templates/coverage/groups";
import { DESCRIPTIONS } from "./descriptions";

/**
 * The primitives as the plugin shows them: registry/ui's components, grouped and ordered the way the site's
 * Components page is (apps/preview coverage/groups.ts), each with its one-line purpose, the coverage sections
 * that draw it, the names it exports and what it imports. Read from the registry folder at start, so the
 * catalog cannot drift from the files it describes.
 */

export interface Primitive
{
    name: string;
    group: string;
    description: string;
    /** Coverage sections that render it (`?template=coverage&section=<name>`); the first is its card */
    sections: string[];
    exports: string[];
    /** Other registry/ui components it imports */
    uses: string[];
    /** npm packages it imports */
    packages: string[];
    file: string;
}

export interface PrimitiveGroup
{
    id: string;
    label: string;
    primitives: Primitive[];
}

export interface SystemSummary
{
    name: string;
    tagline: string;
    defaultMode: "light" | "dark";
}

export interface Catalog
{
    groups: PrimitiveGroup[];
    systems: SystemSummary[];
}

/** Coverage sections that only show a variant of another section's component, named after the component */
const SECTION_OF: Record<string, string> = {
    "alert-dialog-sm": "alert-dialog",
    "sheet-left": "sheet",
    "sheet-top": "sheet",
    "sheet-bottom": "sheet",
    "drawer-right": "drawer",
    "combobox-groups": "combobox",
    "combobox-chips": "combobox",
    "command-dialog": "command",
};

const importsOf = (source: string) => [...source.matchAll(/\bfrom\s+"([^"]+)"/g)].map((match) => match[1]);

/** The names in the file's closing `export { … }` (registry/ui files all end with one) plus `export function` */
const exportsOf = (source: string) =>
{
    const names = new Set<string>();

    for (const block of source.matchAll(/export\s*\{([^}]*)\}/g))
    {
        for (const part of block[1].split(","))
        {
            const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim();

            if (name) names.add(name);
        }
    }

    for (const match of source.matchAll(/export\s+(?:function|const)\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);

    return [...names];
};

/** The npm package of an import specifier: `@base-ui/react/menu` → `@base-ui/react`, `cmdk` → `cmdk` */
const packageOf = (specifier: string) =>
{
    const parts = specifier.split("/");

    return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
};

const readSystems = (root: string): SystemSummary[] =>
{
    const presets = JSON.parse(readFileSync(join(root, "registry/presets.json"), "utf8")) as { systems: string[] };
    const folder = join(root, "registry/systems");
    const present = new Set(readdirSync(folder).filter((name) => existsSync(join(folder, name, "system.json"))));

    // tyohnn's own systems first, then the shadcn ports: the order the preset list keeps
    return presets.systems.filter((name) => present.has(name)).map((name) =>
    {
        const system = JSON.parse(readFileSync(join(folder, name, "system.json"), "utf8")) as { tagline?: string; defaultMode?: string };

        return { name, tagline: system.tagline ?? "", defaultMode: system.defaultMode === "light" ? "light" : "dark" };
    });
};

export const readCatalog = (root: string): Catalog =>
{
    const folder = join(root, "registry/ui/components");
    const files = new Set(readdirSync(folder).filter((file) => file.endsWith(".tsx")).map((file) => file.replace(/\.tsx$/, "")));
    const seen = new Set<string>();

    const groups = COVERAGE_GROUPS.map((group) =>
    {
        const primitives: Primitive[] = [];

        for (const section of group.sections)
        {
            const name = SECTION_OF[section] ?? section;
            const existing = primitives.find((primitive) => primitive.name === name);

            if (existing)
            {
                existing.sections.push(section);
                continue;
            }

            if (!files.has(name)) throw new Error(`coverage section "${section}" names no registry/ui component "${name}"`);

            const file = `registry/ui/components/${name}.tsx`;
            const source = readFileSync(join(root, file), "utf8");
            const imports = importsOf(source);

            seen.add(name);
            primitives.push({
                name,
                group: group.id,
                description: DESCRIPTIONS[name] ?? "",
                sections: [section],
                exports: exportsOf(source),
                uses: imports.filter((spec) => spec.startsWith("@tyohnn/components/")).map((spec) => spec.slice("@tyohnn/components/".length)),
                packages: [...new Set(imports.filter((spec) => !spec.startsWith(".") && !spec.startsWith("@tyohnn/") && spec !== "react").map(packageOf))],
                file,
            });
        }

        return { id: group.id, label: group.label, primitives };
    });

    const unlisted = [...files].filter((name) => !seen.has(name));

    if (unlisted.length > 0) throw new Error(`registry/ui components with no coverage section: ${unlisted.join(", ")}`);

    return { groups, systems: readSystems(root) };
};

export const allPrimitives = (catalog: Catalog) => catalog.groups.flatMap((group) => group.primitives);

/** Case-insensitive match on the name, the description and the exported names */
export const searchPrimitives = (catalog: Catalog, query: string) =>
{
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);

    return allPrimitives(catalog).filter((primitive) =>
    {
        const haystack = [primitive.name, primitive.description, ...primitive.exports].join(" ").toLowerCase();

        return words.every((word) => haystack.includes(word));
    });
};

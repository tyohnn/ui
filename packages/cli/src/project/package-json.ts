// package.json edits: add dependencies the CLI needs, remove the ones it added and no longer needs. Key order and
// indentation are kept; a dependency the user already declares is never changed.

import { detectIndent, jsonText, readIfExists, writeFile } from "../lib/fs.js";
import type { PackageJson } from "./detect.js";

export interface DependencyPlan
{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

const sortedIfSorted = (before: Record<string, string> | undefined, after: Record<string, string>) =>
{
    const keys = Object.keys(before ?? {});
    const wasSorted = keys.every((key, index) => index === 0 || keys[index - 1].localeCompare(key) <= 0);

    return wasSorted ? Object.fromEntries(Object.entries(after).sort(([a], [b]) => a.localeCompare(b))) : after;
};

/**
 * @param added packages the CLI added earlier (from tyohnn.json); updated in place
 * @param managed every package name the CLI may add for this file (icon and font packages): added ones that are not
 *                wanted now are removed
 * @returns whether the file changed
 */
export const syncDependencies = (file: string, plan: DependencyPlan, added: string[], managed: Set<string>, create?: PackageJson): { changed: boolean; added: string[] } =>
{
    const text = readIfExists(file);
    const pkg = (text ? JSON.parse(text) : create ?? {}) as PackageJson;
    const wanted = new Set([...Object.keys(plan.dependencies ?? {}), ...Object.keys(plan.devDependencies ?? {})]);
    const nowAdded = new Set(added.filter((name) => wanted.has(name)));

    for (const section of ["dependencies", "devDependencies"] as const)
    {
        const current = { ...(pkg[section] ?? {}) };
        let touched = false;

        for (const [name, range] of Object.entries(plan[section] ?? {}))
        {
            if (pkg.dependencies?.[name] || pkg.devDependencies?.[name])
            {
                continue;
            }

            current[name] = range;
            nowAdded.add(name);
            touched = true;
        }

        for (const name of added)
        {
            if (managed.has(name) && !wanted.has(name) && current[name])
            {
                delete current[name];
                touched = true;
            }
        }

        if (touched) pkg[section] = sortedIfSorted(pkg[section], current);
    }

    const indent = detectIndent(text, 2);
    const next = jsonText(pkg, indent);
    const changed = text !== null && jsonText(JSON.parse(text), indent) === next ? false : writeFile(file, next);

    return { changed, added: [...nowAdded].sort() };
};

/** Sets fields when missing or different (used for the UI package's exports and scripts) */
export const updatePackageJson = (file: string, update: (pkg: PackageJson) => void, create: PackageJson): boolean =>
{
    const text = readIfExists(file);
    const pkg = (text ? JSON.parse(text) : create) as PackageJson;

    update(pkg);

    const next = jsonText(pkg, detectIndent(text, 4));

    if (text !== null && jsonText(JSON.parse(text), detectIndent(text, 4)) === next) return false;

    return writeFile(file, next);
};

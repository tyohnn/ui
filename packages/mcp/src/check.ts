import { readFileSync } from "node:fs";
import { join } from "node:path";

import { checkContrast } from "../../theme/index.mjs";

import type { Draft } from "./export";
import { coloursOf, type SystemState, type ThemeLibrary } from "./system";

/**
 * What check_system reports about the system being shaped, worst first:
 *
 * - contrast: palette pairs below WCAG AA (4.5:1) in either mode;
 * - reach: a token set on a component slot that, in the base, only points at a shared token. Setting the slot moves
 *   that one component; setting the shared token moves every component that reads it, including components written
 *   later with data-role. The finding names the shared token;
 * - concept: a draft without a name or a concept cannot be published.
 */

export interface Finding
{
    level: "error" | "warning";
    kind: "contrast" | "reach" | "concept";
    message: string;
}

/**
 * Tokens shared across components: the role steps (control, field, surface, popup, item, indicator, label,
 * separator, meta, track) and the scales under them. Setting one of these is already the wide change.
 */
const SHARED = new Set(["control", "field", "surface", "popup", "item", "indicator", "label", "separator", "meta", "track", "ui", "shadow", "font", "focus", "overlay", "page", "radius", "motion"]);

const isShared = (token: string) => SHARED.has(token.replace(/^--/, "").split("-")[0]);

/** `--name: value;` of the base's tokens.css, first declaration (the file is :root only) */
const baseTokens = (root: string, system: string) =>
{
    const map = new Map<string, string>();
    const text = readFileSync(join(root, "registry/systems", system, "styles/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

    for (const match of text.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi))
    {
        if (!map.has(match[1])) map.set(match[1], match[2].trim());
    }

    return map;
};

export const checkSystem = (options: { root: string; state: SystemState; library: ThemeLibrary; draft?: Draft }): Finding[] =>
{
    const { root, state, library, draft } = options;
    const findings: Finding[] = [];

    for (const failure of checkContrast(coloursOf(state, library)) as { mode: string; foreground: string; background: string; ratio: number }[])
    {
        findings.push({
            level: failure.ratio < 3 ? "error" : "warning",
            kind: "contrast",
            message: `${failure.foreground} on ${failure.background} is ${failure.ratio}:1 in ${failure.mode} (AA wants 4.5:1).`,
        });
    }

    const base = baseTokens(root, state.system);

    for (const token of Object.keys(state.tokens))
    {
        const alias = /^var\(\s*(--[a-z0-9-]+)\s*\)$/i.exec(base.get(token) ?? "");

        if (alias && !isShared(token) && !(alias[1] in state.tokens))
        {
            findings.push({
                level: "warning",
                kind: "reach",
                message: `${token} points at ${alias[1]} in ${state.system}. Setting ${token} changes that one component; set ${alias[1]} instead to change everything that shares it, new components included. Keep ${token} only if this component should differ on purpose.`,
            });
        }
    }

    if (!draft) findings.push({ level: "error", kind: "concept", message: "No draft yet: call draft_system with a name and the concept before publishing or exporting." });
    else if (draft.concept.trim().length < 40) findings.push({ level: "warning", kind: "concept", message: "The concept is a line or less. Write what the person asked for and how each axis (colour, density, depth, texture, typography) answers it; the next agent reads it." });

    return findings.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));
};

export const findingsText = (findings: Finding[]) =>
    findings.length === 0 ? "No findings: contrast passes AA in both modes and every change reaches what it should." : findings.map((finding) => `${finding.level === "error" ? "✗" : "△"} ${finding.kind}: ${finding.message}`).join("\n");

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { coloursOf, type SystemState, type ThemeLibrary } from "./system";

/**
 * Objects (registry/objects): one-off interfaces with a material of their own that still wear the system through a
 * few anchors. `design_object` hands an agent the contract, the anchors' values in the system being shaped and the
 * example objects; `check_object` checks what the agent wrote against the contract.
 */

export interface ObjectEntry
{
    name: string;
    /** The UI SDK entries it imports for behaviour, e.g. `@ui-sdk/react/switch` */
    behaviour: string[];
    tsx: string;
    css: string;
}

export interface ObjectLibrary
{
    /** registry/objects/README.md's "The contract" section */
    contract: string;
    objects: ObjectEntry[];
}

export const readObjects = (root: string): ObjectLibrary =>
{
    const folder = join(root, "registry/objects");
    const readme = readFileSync(join(folder, "README.md"), "utf8");
    const contract = /## The contract\n([\s\S]*?)(?=\n## )/.exec(readme)?.[1].trim() ?? "";
    const objects = readdirSync(folder)
        .filter((file) => file.endsWith(".tsx"))
        .map((file) =>
        {
            const name = file.replace(/\.tsx$/, "");
            const tsx = readFileSync(join(folder, file), "utf8");
            const cssPath = join(folder, `${name}.css`);

            return {
                name,
                behaviour: [...tsx.matchAll(/from\s+"(@ui-sdk\/[^"]+)"/g)].map((match) => match[1]),
                tsx,
                css: existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "",
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    if (!contract) throw new Error("registry/objects/README.md has no \"## The contract\" section");

    return { contract, objects };
};

/** What an object binds to the system, and the token it reads */
export const ANCHORS = [
    { anchor: "face", token: "--primary", what: "the body: the colour a person names the object by" },
    { anchor: "ink", token: "--primary-foreground", what: "type and marks printed on the face" },
    { anchor: "signal", token: "--destructive", what: "the one alarm or state colour (or a --chart-* colour)" },
    { anchor: "focus", token: "--ring", what: "the focus outline" },
    { anchor: "type", token: "--font-heading", what: "every font-family (--font-sans and --font-mono also count)" },
    { anchor: "timing", token: "--motion-base", what: "every duration and easing (--motion-fast · --motion-slow · --motion-ease)" },
] as const;

/** The colour anchors' values in the system being shaped, per mode, hand-set colours included */
export const anchorColours = (state: SystemState, library: ThemeLibrary) =>
{
    const all = coloursOf(state, library);
    const pick = (mode: "light" | "dark") =>
    {
        const colours: Record<string, string> = { ...all[mode], ...state.colours[mode] };

        return Object.fromEntries(ANCHORS.filter((entry) => entry.anchor !== "type" && entry.anchor !== "timing").map((entry) => [entry.token, colours[entry.token.slice(2)] ?? ""]));
    };

    return { light: pick("light"), dark: pick("dark") };
};

export interface ObjectFinding
{
    level: "error" | "warning";
    kind: "type" | "timing" | "focus" | "anchor" | "material" | "motion" | "behaviour";
    message: string;
}

/** System colour tokens an object may anchor to (the focus ring alone does not make it wear the system) */
const SYSTEM_COLOUR = /var\(\s*--(?:primary|primary-foreground|secondary|secondary-foreground|accent|accent-foreground|destructive|foreground|background|muted|muted-foreground|card|card-foreground|border|chart-\d)\s*[,)]/;
const LITERAL_COLOUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(/i;
const LITERAL_TIME = /(?<![\w-])\d*\.?\d+m?s\b/;
const LITERAL_EASE = /cubic-bezier\(|steps\(|\b(?:ease|ease-in|ease-out|ease-in-out|linear)\b/;
/** Roles UI SDK ships a component for: writing one by hand next to it is almost always a bug */
const SHIPPED_ROLES = /role=["'](?:listbox|menu|dialog|tablist|separator|switch|slider|radiogroup|toolbar|tree|radio|checkbox|combobox)["']/;

/** `url(...)` and comments out, so data-URI textures and notes are never read as colours */
const clean = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/url\((?:"[^"]*"|'[^']*'|[^)]*)\)/g, "url()");

/** Innermost rule blocks: `selector { declarations }`, @media bodies included */
const rules = (css: string) =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
        selector: match[1].trim(),
        declarations: match[2]
            .split(";")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) =>
            {
                const at = part.indexOf(":");

                return { property: part.slice(0, at).trim().toLowerCase(), value: part.slice(at + 1).trim() };
            })
            .filter((declaration) => declaration.property.length > 0),
    }));

/**
 * Checks an object against the contract (registry/objects/README.md, rules 1–4). `css` is its stylesheet;
 * `source` (the component, optional) adds the behaviour and motion checks.
 */
export const checkObject = (options: { name: string; css: string; source?: string }): ObjectFinding[] =>
{
    const { name, css, source } = options;
    const findings: ObjectFinding[] = [];
    const add = (level: ObjectFinding["level"], kind: ObjectFinding["kind"], message: string) => findings.push({ level, kind, message });
    const blocks = rules(clean(css));
    const literalColours = new Set<string>();

    for (const { selector, declarations } of blocks)
    {
        for (const { property, value } of declarations)
        {
            const custom = property.startsWith("--");
            const timing = /^(?:transition|animation)(?:-duration|-delay|-timing-function)?$/.test(property);
            const own = value.replace(/var\([^)]*\)/g, "var()");

            if (property === "font-family" && !/^var\(/.test(value)) add("error", "type", `${selector} sets font-family: ${value}. Read the system's type instead: var(--font-heading) (or --font-sans / --font-mono), through a --${name}-font anchor on the root.`);
            if (timing && value !== "none" && (LITERAL_TIME.test(own) || LITERAL_EASE.test(own))) add("error", "timing", `${selector} has ${property}: ${value}. Durations and easing come from --motion-* (var(--motion-base) var(--motion-ease)), so the system's pace and its reduced-motion block reach the object.`);
            if (custom && (/^\s*-?\d*\.?\d+m?s\s*$/.test(value) || /cubic-bezier\(/.test(value))) add("error", "timing", `${property}: ${value} is a literal duration or easing. Bind it to the system: var(--motion-base), var(--motion-ease).`);
            if (!custom && LITERAL_COLOUR.test(value)) literalColours.add(`${selector} { ${property} }`);
        }
    }

    const focus = blocks.filter((block) => block.selector.includes(":focus-visible"));

    if (focus.length === 0) add("error", "focus", "No :focus-visible rule: the control has no visible focus. Draw an outline in the focus anchor, var(--ring).");

    for (const block of focus)
    {
        for (const { property, value } of block.declarations)
        {
            if (/^(?:outline|outline-color|box-shadow|border-color)$/.test(property) && LITERAL_COLOUR.test(value)) add("error", "focus", `${block.selector} draws focus in a literal colour (${value}). Use the focus anchor, var(--ring).`);
        }
    }

    if (!SYSTEM_COLOUR.test(css)) add("error", "anchor", "The object reads no system colour: it looks the same in every system. Bind its face, ink and signal on the root: var(--primary), var(--primary-foreground), var(--destructive).");

    for (const where of literalColours)
    {
        add("warning", "material", `${where} has a literal colour. Name it as material on the root (--${name}-<what>) and read the name, so a reader sees what is material and what is anchor; a highlight or shade of the face is color-mix() of the face anchor.`);
    }

    if (source !== undefined)
    {
        if (/from\s+"@ui-sdk\/(?:react|vue|svelte|solid|web)"/.test(source)) add("error", "behaviour", "Import UI SDK from a component's own entry (@ui-sdk/react/switch), not the package root.");
        if (/@ui-sdk\/core\/internal/.test(source)) add("error", "behaviour", "Never import @ui-sdk/core/internal/*.");
        if (SHIPPED_ROLES.test(source)) add("error", "behaviour", "A hand-written role that UI SDK ships a component for: use the component (Switch, Slider, Rating, RadioGroup, …) for its keyboard, focus and ARIA.");
        if (/from\s+"@tyohnn\/components\//.test(source)) add("warning", "behaviour", "The object wraps a registry/ui component: its cn-* rules will fight the material. Style the UI SDK primitive from scratch.");

        const animates = /requestAnimationFrame|setInterval|setTimeout\(/.test(source);
        const canvas = /getContext\(\s*["'](?:2d|webgl2?|webgpu)["']/.test(source);

        if ((animates || canvas) && !/prefers-reduced-motion/.test(source)) add("error", "motion", "The object animates in JavaScript but never checks prefers-reduced-motion. With it set, show the final frame at once and stop idle motion (blinks, flicker).");
        if (canvas && !/getComputedStyle/.test(source)) add("warning", "anchor", "The object draws on a canvas, where CSS tokens never reach. Read the anchors with getComputedStyle(root).getPropertyValue(\"--primary\") and pass them to the drawing (uniforms, fillStyle).");
        if (canvas && !/if\s*\(\s*!\s*(?:gl|ctx|context)\b/.test(source)) add("warning", "behaviour", "When getContext returns null (no WebGL2 or WebGPU), show a still picture: the controls over the canvas still work and should not sit on a blank box.");
    }

    return findings.sort((a, b) => (a.level === b.level ? 0 : a.level === "error" ? -1 : 1));
};

export const objectFindingsText = (findings: ObjectFinding[]) =>
    findings.length === 0
        ? "No findings: the type, timing, focus and colours are anchored to the system, and the rest is named material."
        : findings.map((finding) => `${finding.level === "error" ? "✗" : "△"} ${finding.kind}: ${finding.message}`).join("\n");

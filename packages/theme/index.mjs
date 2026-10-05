// The theme colour set — one vocabulary of colours, shared by the registry, the CLI and the site.
//
// A system owns feel: spacing, shape, motion, material, and the formulas that derive hover · soft · ring
// colours from the palette. A theme owns values: the 72 colours below, light and dark. Any theme goes on
// any system, and every theme fills the whole set — a blank is not allowed, because a system may read any
// of these names and has no literal of its own to fall back to.
//
//   resolveTheme   compose extends { base, accent, chart } into one complete theme
//   themeToCss     render it as the generated styles/theme.css (`:root` and `.dark`)
//   encodeTheme    pack a theme into a URL-safe string for a share link, decodeTheme unpacks it
//   encodePreset   pack system · palette · accent · chart into a five-character code, decodePreset unpacks it
//   contrast       WCAG contrast ratio between two theme colours (oklch · hex · rgb)

/** The finite colour set, by group. Every theme defines every one of these in both modes. */
export const PALETTE_GROUPS = {
    // The shadcn contract. These names are upstream's and never change.
    base: [
        "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
        "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground",
        "accent", "accent-foreground", "destructive", "border", "input", "ring",
    ],
    chart: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
    sidebar: [
        "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground",
        "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
    ],
    // Ours: alert · badge · toast read these, and a `-soft` is the plate the strong colour sits on.
    status: ["info", "info-soft", "success", "success-soft", "warning", "warning-soft"],
    // Tag tones read by <Badge data-tone>. Three parts each, so a tone can be a plate, an edge and a text.
    tag: ["blue", "purple", "green", "orange", "red", "yellow", "gray"].flatMap((tone) => [`tag-${tone}-bg`, `tag-${tone}-border`, `tag-${tone}-fg`]),
    // Avatar initials tones read by <AvatarFallback data-tone>, and the text colour they share.
    avatar: ["avatar-tone-foreground", ...["slate", "teal", "plum", "olive", "rust", "navy", "moss", "mauve"].map((tone) => `avatar-tone-${tone}`)],
    // Small states that are colours in their own right, not shades of the base set.
    state: ["checked", "checked-foreground", "selection", "selection-foreground", "link"],
};

/** Every palette name, in file order. */
// The order matters beyond this file: a preset code names an edited colour by its place here. Append only.
export const PALETTE = Object.values(PALETTE_GROUPS).flat();

const PALETTE_SET = new Set(PALETTE);

/** The group a palette name belongs to, or null. */
export const groupOf = (name) =>
    Object.entries(PALETTE_GROUPS).find(([, names]) => names.includes(name))?.[0] ?? null;

const MODES = ["light", "dark"];

/**
 * Compose a theme with its `extends` into one complete theme.
 *
 * `load(id)` returns a theme by id — a base, an accent or a chart set. Layers are applied in order
 * (base → accent → chart → the theme's own values), each overriding the names it defines, so an accent
 * that only names `primary` keeps the base's other 71 colours.
 */
export const resolveTheme = (theme, load, seen = new Set()) =>
{
    const resolved = { name: theme.name, title: theme.title ?? theme.name, source: theme.source, light: {}, dark: {} };

    const merge = (layer, only) =>
    {
        for (const mode of MODES)
        {
            for (const [name, value] of Object.entries(layer[mode] ?? {})) if (!only || only.has(name)) resolved[mode][name] = value;
        }

        if (layer.material) resolved.material = { ...resolved.material, ...layer.material };
    };

    const layer = (id, only) =>
    {
        if (!id) return;
        if (seen.has(id)) throw new Error(`Theme "${id}" extends itself`);

        const found = load(id);

        if (!found) throw new Error(`Unknown theme "${id}"`);

        merge(found.extends ? resolveTheme(found, load, new Set([...seen, id])) : found, only);
    };

    layer(theme.extends?.base);
    layer(theme.extends?.accent);
    // A chart set is only its five colours: shadcn's chartColor picks a ramp without moving primary.
    layer(theme.extends?.chart, new Set(PALETTE_GROUPS.chart));
    merge(theme);

    return resolved;
};

/** Palette names a resolved theme is missing, and names it defines that are not in the set. */
export const checkTheme = (resolved) =>
{
    const problems = [];

    for (const mode of MODES)
    {
        const values = resolved[mode] ?? {};

        for (const name of PALETTE) if (!values[name]) problems.push(`${resolved.name}: missing --${name} in ${mode}`);
        for (const name of Object.keys(values)) if (!PALETTE_SET.has(name)) problems.push(`${resolved.name}: --${name} is not a palette colour (${mode})`);
    }

    return problems;
};

const declarations = (values, indent = "    ") =>
{
    const lines = [];

    for (const [group, names] of Object.entries(PALETTE_GROUPS))
    {
        const present = names.filter((name) => values[name] !== undefined);

        if (present.length === 0) continue;
        if (lines.length > 0) lines.push("");

        lines.push(`${indent}/* ${group} */`);
        for (const name of present) lines.push(`${indent}--${name}: ${values[name]};`);
    }

    return lines.join("\n");
};

/**
 * The generated layer-1 colour file. It is imported after globals.css, so a system's own identity
 * colours — declared after it in the cascade — still win.
 *
 * `partial` writes only the colours a layer carries, without insisting on the whole palette: that is how an
 * accent is shipped as its own stylesheet, to be loaded after a base and redeclare the few names it moves.
 */
export const themeToCss = (resolved, { partial = false } = {}) =>
{
    const problems = partial ? [] : checkTheme(resolved);

    if (problems.length > 0) throw new Error(problems.join("\n"));

    return [
        `/* Generated from the theme "${resolved.name}" — do not edit. Change the theme, not this file. */`,
        "",
        ":root {",
        declarations(resolved.light),
        "}",
        "",
        ".dark {",
        declarations(resolved.dark),
        "}",
        "",
    ].join("\n");
};

// base64url by hand: the editor runs in a browser, where `Buffer` may be a polyfill without that encoding.
const toBase64 = (text) =>
{
    const bytes = new TextEncoder().encode(text);

    if (typeof btoa === "function") return btoa(String.fromCharCode(...bytes));

    return Buffer.from(bytes).toString("base64");
};

const fromBase64 = (text) =>
{
    const padded = text + "=".repeat((4 - (text.length % 4)) % 4);

    if (typeof atob === "function") return new TextDecoder().decode(Uint8Array.from(atob(padded), (character) => character.charCodeAt(0)));

    return Buffer.from(padded, "base64").toString("utf8");
};

/** A theme packed for a share link: `tyohnn-theme:<base64url>`. */
export const encodeTheme = (theme) =>
{
    const payload = { n: theme.name, t: theme.title, e: theme.extends, l: theme.light, d: theme.dark, m: theme.material };

    return `tyohnn-theme:${toBase64(JSON.stringify(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
};

/** The theme inside a `tyohnn-theme:` string. */
export const decodeTheme = (encoded) =>
{
    const body = (encoded.startsWith("tyohnn-theme:") ? encoded.slice("tyohnn-theme:".length) : encoded).replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(fromBase64(body));

    return {
        name: payload.n,
        ...(payload.t === undefined ? {} : { title: payload.t }),
        ...(payload.e === undefined ? {} : { extends: payload.e }),
        light: payload.l ?? {},
        dark: payload.d ?? {},
        ...(payload.m === undefined ? {} : { material: payload.m }),
    };
};

// ---- presets ------------------------------------------------------------------------------------
// A preset is a handful of picks, each one a place in a list the registry ships (registry/presets.json),
// so it fits in a few characters the way shadcn's `--preset b0` does, and needs nothing stored anywhere:
// whoever holds the lists can read the code. The lists are append-only for exactly that reason.
//
//   1 · system · palette · accent · chart        one base-62 character each; accent and chart count
//                                                from 1, and 0 is "none"
//   . edits                                      only when colours were changed by hand: each change
//                                                packed into bytes (below), the lot in base64url
//
// An edit is [name, flags, value…]: the name is its place in PALETTE (so PALETTE's order is part of the
// format too: append only), flags say light · dark · both and how the value is held — a hex colour as its
// 3 or 4 bytes, anything else (oklch, color-mix, an alias) as its text. A colour set the same in both modes
// is written once. One hex change costs 7 characters; an oklch one about 30.

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PRESET_VERSION = "1";

const LIGHT = 1;
const DARK = 2;
const HEX = 4;
const HEX_ALPHA = 8;

const toBase64Url = (bytes) =>
{
    const binary = String.fromCharCode(...bytes);
    const base64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");

    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (text) =>
{
    const base64 = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4);

    return typeof atob === "function" ? Uint8Array.from(atob(base64), (character) => character.charCodeAt(0)) : new Uint8Array(Buffer.from(base64, "base64"));
};

/** #rgb · #rgba · #rrggbb · #rrggbbaa as bytes, or null for anything that is not a hex colour */
const hexBytes = (value) =>
{
    const match = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value.trim());

    if (!match) return null;

    const digits = match[1].length <= 4 ? [...match[1]].map((digit) => digit + digit).join("") : match[1];

    return digits.match(/../g).map((pair) => parseInt(pair, 16));
};

/** Hand edits ({ light, dark }) as the part after the dot, or "" when there are none. */
const encodeEdits = (edits) =>
{
    const bytes = [];
    const light = edits?.light ?? {};
    const dark = edits?.dark ?? {};

    for (const [index, name] of PALETTE.entries())
    {
        const both = light[name] !== undefined && light[name] === dark[name];
        const writes = both ? [[LIGHT | DARK, light[name]]] : [[LIGHT, light[name]], [DARK, dark[name]]].filter(([, value]) => value !== undefined);

        for (const [modes, value] of writes)
        {
            const hex = hexBytes(value);

            if (hex) bytes.push(index, modes | (hex.length === 4 ? HEX_ALPHA : HEX), ...hex);
            else
            {
                const text = [...new TextEncoder().encode(value)].slice(0, 255);

                bytes.push(index, modes, text.length, ...text);
            }
        }
    }

    return bytes.length ? toBase64Url(bytes) : "";
};

/** The edits after the dot, or null when the bytes do not read as edits. */
const decodeEdits = (text) =>
{
    const edits = { light: {}, dark: {} };
    let bytes;

    try
    {
        bytes = fromBase64Url(text);
    }
    catch
    {
        return null;
    }

    for (let at = 0; at < bytes.length;)
    {
        const name = PALETTE[bytes[at]];
        const flags = bytes[at + 1];
        let value;

        if (name === undefined || flags === undefined || !(flags & (LIGHT | DARK))) return null;

        at += 2;

        if (flags & (HEX | HEX_ALPHA))
        {
            const size = flags & HEX_ALPHA ? 4 : 3;

            if (at + size > bytes.length) return null;
            value = `#${[...bytes.slice(at, at + size)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
            at += size;
        }
        else
        {
            const size = bytes[at];

            if (size === undefined || at + 1 + size > bytes.length) return null;
            value = new TextDecoder().decode(bytes.slice(at + 1, at + 1 + size));
            at += 1 + size;
        }

        if (flags & LIGHT) edits.light[name] = value;
        if (flags & DARK) edits.dark[name] = value;
    }

    return edits;
};

/**
 * The code for a preset, with its hand edits after a dot when it has any, or null when one of its picks is not
 * in the lists (a newer registry than the site's).
 */
export const encodePreset = (lists, preset) =>
{
    const at = (list, id) => list.indexOf(id);
    const system = at(lists.systems, preset.system);
    const palette = at(lists.palettes, preset.palette);
    // An optional pick counts from 1, so a missing one (-1) must stay below 0 rather than become "none".
    const optional = (id) => (id ? (at(lists.accents, id) < 0 ? -1 : at(lists.accents, id) + 1) : 0);
    const accent = optional(preset.accent);
    const chart = optional(preset.chart);

    if ([system, palette, accent, chart].some((index) => index < 0 || index >= DIGITS.length)) return null;

    const edits = encodeEdits(preset.edits);

    return PRESET_VERSION + [system, palette, accent, chart].map((index) => DIGITS[index]).join("") + (edits ? `.${edits}` : "");
};

/** The picks inside a preset code, or null when it is not one (wrong length, version or a place past a list's end). */
export const decodePreset = (lists, code) =>
{
    const text = String(code ?? "").trim().replace(/^--preset[= ]/, "").trim();

    const [picks, packed, extra] = text.split(".");

    if (extra !== undefined || picks.length !== 5 || picks[0] !== PRESET_VERSION) return null;

    const edits = packed ? decodeEdits(packed) : null;

    if (packed !== undefined && !edits) return null;

    const [system, palette, accent, chart] = [...picks.slice(1)].map((character) => DIGITS.indexOf(character));
    const pick = (list, index) => (index >= 0 && index < list.length ? list[index] : undefined);

    const preset = {
        system: pick(lists.systems, system),
        palette: pick(lists.palettes, palette),
        accent: accent === 0 ? null : pick(lists.accents, accent - 1),
        chart: chart === 0 ? null : pick(lists.accents, chart - 1),
    };

    if (Object.values(preset).includes(undefined)) return null;

    return edits ? { ...preset, edits } : preset;
};

/** The theme a preset wears: its palette, the accent and the chart colour over it, and its hand edits last. */
export const presetTheme = (preset) =>
{
    const layers = [preset.palette, preset.accent, preset.chart && `${preset.chart}-charts`].filter(Boolean);

    return {
        name: layers.join("-"),
        title: layers.join(" + "),
        extends: { base: preset.palette, ...(preset.accent ? { accent: preset.accent } : {}), ...(preset.chart ? { chart: preset.chart } : {}) },
        light: { ...preset.edits?.light },
        dark: { ...preset.edits?.dark },
    };
};

// ---- colour maths -------------------------------------------------------------------------------
// Enough of it to check contrast. Values are parsed to sRGB in 0…1; alpha is kept but ignored by the
// ratio, which is a question about two opaque colours.

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const oklchToRgb = (lightness, chroma, hue) =>
{
    const radians = (hue * Math.PI) / 180;
    const a = chroma * Math.cos(radians);
    const b = chroma * Math.sin(radians);

    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3;

    const linear = [
        +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    ];

    return linear.map((channel) => clamp01(channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055));
};

const NUMBER = "[-+]?[0-9]*\\.?[0-9]+";

/** A CSS colour as [r, g, b] in 0…1, or null when the form is not one a theme uses. */
export const parseColour = (value) =>
{
    const text = String(value).trim().toLowerCase();

    if (text === "white") return [1, 1, 1];
    if (text === "black") return [0, 0, 0];

    const hex = /^#([0-9a-f]{3,8})$/.exec(text);

    if (hex)
    {
        const digits = hex[1].length <= 4 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
        const channels = [0, 2, 4].map((start) => Number.parseInt(digits.slice(start, start + 2), 16) / 255);

        return channels.every((channel) => Number.isFinite(channel)) ? channels : null;
    }

    const oklch = new RegExp(`^oklch\\(\\s*(${NUMBER})(%?)\\s+(${NUMBER})\\s+(${NUMBER})`).exec(text);

    if (oklch)
    {
        const lightness = oklch[2] === "%" ? Number(oklch[1]) / 100 : Number(oklch[1]);

        return oklchToRgb(lightness, Number(oklch[3]), Number(oklch[4]));
    }

    const rgb = new RegExp(`^rgba?\\(\\s*(${NUMBER})[\\s,]+(${NUMBER})[\\s,]+(${NUMBER})`).exec(text);

    if (rgb) return [1, 2, 3].map((index) => clamp01(Number(rgb[index]) / 255));

    return null;
};

/** A colour as `#rrggbb`, for the browser inputs that only speak hex; null when it cannot be read. */
export const toHex = (value) =>
{
    const rgb = parseColour(value);

    if (!rgb) return null;

    return `#${rgb.map((channel) => Math.round(channel * 255).toString(16).padStart(2, "0")).join("")}`;
};

const luminance = ([r, g, b]) =>
{
    const channel = (value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

/** WCAG contrast ratio (1…21), or null when either colour cannot be read. */
export const contrast = (a, b) =>
{
    const first = parseColour(a);
    const second = parseColour(b);

    if (!first || !second) return null;

    const [light, dark] = [luminance(first), luminance(second)].sort((x, y) => y - x);

    return (light + 0.05) / (dark + 0.05);
};

/** The pairs a theme should keep readable, as [foreground, background] palette names. */
export const CONTRAST_PAIRS = [
    ["foreground", "background"],
    ["card-foreground", "card"],
    ["popover-foreground", "popover"],
    ["primary-foreground", "primary"],
    ["secondary-foreground", "secondary"],
    ["muted-foreground", "muted"],
    ["accent-foreground", "accent"],
    ["sidebar-foreground", "sidebar"],
    ["sidebar-primary-foreground", "sidebar-primary"],
    ["sidebar-accent-foreground", "sidebar-accent"],
    ["checked-foreground", "checked"],
    ["selection-foreground", "selection"],
    ["avatar-tone-foreground", "avatar-tone-slate"],
    ...["blue", "purple", "green", "orange", "red", "yellow", "gray"].map((tone) => [`tag-${tone}-fg`, `tag-${tone}-bg`]),
];

/**
 * The literal a palette value stands for: a theme may say `var(--primary)` to mean "this tone follows
 * that one". Follows the chain within one mode; anything that is not a plain alias comes back as is.
 */
export const resolveValue = (values, value, depth = 0) =>
{
    const alias = /^var\(\s*--([A-Za-z0-9_-]+)\s*\)$/.exec(String(value ?? "").trim());

    if (!alias || depth > 8) return value;

    return values[alias[1]] === undefined ? value : resolveValue(values, values[alias[1]], depth + 1);
};

/** Pairs below `minimum` (AA body text by default), as [{ mode, foreground, background, ratio }]. */
export const checkContrast = (resolved, minimum = 4.5) =>
{
    const failures = [];

    for (const mode of MODES)
    {
        for (const [foreground, background] of CONTRAST_PAIRS)
        {
            const values = resolved[mode];
            const ratio = contrast(resolveValue(values, values[foreground]), resolveValue(values, values[background]));

            if (ratio !== null && ratio < minimum) failures.push({ mode, foreground, background, ratio: Math.round(ratio * 100) / 100 });
        }
    }

    return failures;
};

// Managed blocks: the parts of a user-owned file the CLI rewrites. Everything outside them is the user's.
//
//   CSS   /* tyohnn:begin <name> */ … /* tyohnn:end <name> */
//   TS    // tyohnn:begin <name> … // tyohnn:end <name>
//
// Removing the markers and what sits between them undoes the change.

export type MarkerStyle = "css" | "ts";

const MARKERS: Record<MarkerStyle, (name: string) => [string, string]> = {
    css: (name) => [`/* tyohnn:begin ${name} */`, `/* tyohnn:end ${name} */`],
    ts: (name) => [`// tyohnn:begin ${name}`, `// tyohnn:end ${name}`],
};

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Matches a block including the indentation before its begin marker */
export const blockPattern = (style: MarkerStyle, name: string): RegExp =>
{
    const [begin, end] = MARKERS[style](name);

    return new RegExp(`[ \\t]*${escape(begin)}[\\s\\S]*?${escape(end)}`);
};

export const renderBlock = (style: MarkerStyle, name: string, body: string, indent = ""): string =>
{
    const [begin, end] = MARKERS[style](name);
    const lines = body.trimEnd().split("\n").map((line) => (line ? `${indent}${line}` : line));

    return [`${indent}${begin}`, ...lines, `${indent}${end}`].join("\n");
};

export const hasBlock = (content: string, style: MarkerStyle, name: string): boolean => blockPattern(style, name).test(content);

export const findBlock = (content: string, style: MarkerStyle, name: string): { start: number; end: number; text: string } | null =>
{
    const match = blockPattern(style, name).exec(content);

    return match ? { start: match.index, end: match.index + match[0].length, text: match[0] } : null;
};

/** Replaces the block in place when present; returns null when there is none */
export const replaceBlock = (content: string, style: MarkerStyle, name: string, body: string): string | null =>
{
    const found = findBlock(content, style, name);

    if (!found) return null;

    const indent = found.text.match(/^[ \t]*/)?.[0] ?? "";

    return content.slice(0, found.start) + renderBlock(style, name, body, indent) + content.slice(found.end);
};

/** Removes a block and the line break after it */
export const removeBlock = (content: string, style: MarkerStyle, name: string): string =>
{
    const found = findBlock(content, style, name);

    if (!found) return content;

    const after = content.slice(found.end).replace(/^\r?\n(\r?\n)?/, (_, blank) => (blank ? "\n" : ""));

    return content.slice(0, found.start) + after;
};

/** The body between the markers (without them), or null */
export const blockBody = (content: string, style: MarkerStyle, name: string): string | null =>
{
    const found = findBlock(content, style, name);

    if (!found) return null;

    return found.text.split("\n").slice(1, -1).map((line) => line.replace(/^[ \t]*/, "")).join("\n");
};

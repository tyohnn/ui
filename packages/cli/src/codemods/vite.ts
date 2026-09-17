// Vite apps: vite.config (Tailwind plugin and resolve aliases), index.html (<html> classes) and the entry module
// (the entry CSS import).

import { findBlock, renderBlock, replaceBlock } from "../lib/markers.js";
import { afterImports, findExportedObject, findProperty, indentUnit, insertFirstInObject, parseModule, Splicer, unwrap, type t } from "./ast.js";
import type { CodemodResult } from "./next-config.js";

export interface ViteAlias
{
    /** A string prefix ("@") or an exact specifier matched with a RegExp ("@acme/ui/icons") */
    find: string;
    exact: boolean;
    /** Target relative to the config file's directory */
    target: string;
}

const regexFor = (specifier: string) => `/^${specifier.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}$/`;

const replacementCode = (alias: ViteAlias) => `fileURLToPath(new URL(${JSON.stringify(alias.target)}, import.meta.url))`;

const importsOutsideBlock = (ast: t.File, code: string, name: string) =>
{
    const block = findBlock(code, "ts", name);

    return ast.program.body
        .filter((statement): statement is t.ImportDeclaration => statement.type === "ImportDeclaration")
        .filter((statement) => !block || statement.start! < block.start || statement.start! > block.end);
};

const resolveBlockBody = (aliases: ViteAlias[]) => [
    "resolve: {",
    "    alias: [",
    ...aliases.map((alias) => `        { find: ${alias.exact ? regexFor(alias.find) : JSON.stringify(alias.find)}, replacement: ${replacementCode(alias)} },`),
    "    ],",
    "},",
].join("\n");

export const applyViteConfig = (source: string, aliases: ViteAlias[], file = "vite.config.ts"): CodemodResult =>
{
    const unit = indentUnit(source);
    const reindent = (text: string) => text.replace(/^((?: {4})+)/gm, (spaces) => unit.repeat(spaces.length / 4));
    const rewritten = aliases.length ? replaceBlock(source, "ts", "resolve", reindent(resolveBlockBody(aliases))) : null;
    const code = rewritten ?? source;
    const blockAliases = rewritten !== null;
    const ast = parseModule(code, file);
    const imports = importsOutsideBlock(ast, code, "imports");
    const tailwindImport = imports.find((statement) => statement.source.value === "@tailwindcss/vite");
    const tailwindName = tailwindImport?.specifiers.find((specifier) => specifier.type === "ImportDefaultSpecifier")?.local.name ?? "tailwindcss";
    const hasFileUrl = imports.some((statement) => statement.specifiers.some((specifier) => specifier.local.name === "fileURLToPath"));
    const config = findExportedObject(ast);

    if (!config) return { code, manual: `add the @tailwindcss/vite plugin${aliases.length ? ` and resolve aliases ${aliases.map((alias) => alias.find).join(", ")}` : ""} to ${file}` };

    const splicer = new Splicer(code);
    const manual: string[] = [];
    const firstLines: string[] = [];

    // plugins
    const plugins = findProperty(config, "plugins");
    const pluginList = unwrap(plugins?.value);

    if (!plugins)
    {
        firstLines.push("// tyohnn:begin plugins", `plugins: [${tailwindName}()],`, "// tyohnn:end plugins");
    }
    else if (pluginList?.type === "ArrayExpression")
    {
        const present = pluginList.elements.some((element) => element?.type === "CallExpression" && element.callee.type === "Identifier" && element.callee.name === tailwindName);

        if (!present)
        {
            const last = pluginList.elements.at(-1);

            if (last) splicer.insert(last.end!, `, ${tailwindName}() /* tyohnn */`);
            else splicer.replace(pluginList.start!, pluginList.end!, `[${tailwindName}() /* tyohnn */]`);
        }
    }
    else manual.push(`add ${tailwindName}() to plugins`);

    // resolve.alias
    const resolveProperty = findProperty(config, "resolve");
    const resolveObject = unwrap(resolveProperty?.value);

    if (aliases.length && !blockAliases)
    {
        if (!resolveProperty)
        {
            firstLines.push("// tyohnn:begin resolve", reindent(resolveBlockBody(aliases)), "// tyohnn:end resolve");
        }
        else if (resolveObject?.type === "ObjectExpression")
        {
            const aliasProperty = findProperty(resolveObject, "alias");
            const aliasValue = unwrap(aliasProperty?.value);
            const existing = code.slice(aliasValue?.start ?? 0, aliasValue?.end ?? 0);
            const missing = aliases.filter((alias) => !existing.includes(JSON.stringify(alias.find)) && !existing.includes(regexFor(alias.find)) && !existing.includes(`'${alias.find}'`));

            if (missing.length === 0)
            {
                // already aliased
            }
            else if (!aliasProperty)
            {
                insertFirstInObject(splicer, resolveObject, [
                    "// tyohnn:begin alias",
                    "alias: [",
                    ...missing.map((alias) => `    { find: ${alias.exact ? regexFor(alias.find) : JSON.stringify(alias.find)}, replacement: ${replacementCode(alias)} },`),
                    "],",
                    "// tyohnn:end alias",
                ].join("\n"));
            }
            else if (aliasValue?.type === "ArrayExpression")
            {
                const text = missing.map((alias) => `{ find: ${alias.exact ? regexFor(alias.find) : JSON.stringify(alias.find)}, replacement: ${replacementCode(alias)} } /* tyohnn */`).join(", ");
                const last = aliasValue.elements.at(-1);

                if (last) splicer.insert(last.end!, `, ${text}`);
                else splicer.replace(aliasValue.start!, aliasValue.end!, `[${text}]`);
            }
            else if (aliasValue?.type === "ObjectExpression" && missing.every((alias) => !alias.exact))
            {
                insertFirstInObject(splicer, aliasValue, missing.map((alias) => `${JSON.stringify(alias.find)}: ${replacementCode(alias)}, // tyohnn`).join("\n"));
            }
            else manual.push(`add resolve.alias ${missing.map((alias) => `${alias.find} → ${alias.target}`).join(", ")}`);
        }
        else manual.push(`add resolve.alias ${aliases.map((alias) => `${alias.find} → ${alias.target}`).join(", ")}`);
    }

    if (firstLines.length) insertFirstInObject(splicer, config, firstLines.join("\n"));

    // imports
    const needImports = [
        ...(tailwindImport ? [] : [`import ${tailwindName} from "@tailwindcss/vite";`]),
        ...(aliases.length && !hasFileUrl ? ['import { fileURLToPath } from "node:url";'] : []),
    ];
    let result = splicer.toString();

    if (needImports.length)
    {
        const replaced = replaceBlock(result, "ts", "imports", needImports.join("\n"));

        if (replaced !== null) result = replaced;
        else
        {
            const at = afterImports(parseModule(result, file), result);

            result = `${result.slice(0, at)}${renderBlock("ts", "imports", needImports.join("\n"))}\n${result.slice(at)}`;
        }
    }

    return { code: result, ...(manual.length ? { manual: `${manual.join("; ")} in ${file}` } : {}) };
};

/** index.html: `dark` on <html> when the mode is dark (removed otherwise), and `font-sans` */
export const applyIndexHtml = (html: string, mode: "light" | "dark"): CodemodResult =>
{
    const match = html.match(/<html\b([^>]*)>/i);

    if (!match) return { code: html, manual: `add class="${mode === "dark" ? "dark " : ""}font-sans" to <html> in index.html` };

    const attributes = match[1];
    const classMatch = attributes.match(/\sclass\s*=\s*(["'])(.*?)\1/i);
    const classes = (classMatch?.[2] ?? "").split(/\s+/).filter(Boolean);
    const wanted = [...classes.filter((name) => name !== "dark"), ...(mode === "dark" ? ["dark"] : [])];

    if (!wanted.includes("font-sans")) wanted.push("font-sans");

    const ordered = [...(mode === "dark" ? ["dark"] : []), ...wanted.filter((name) => name !== "dark")];

    if (JSON.stringify([...classes].sort()) === JSON.stringify([...ordered].sort())) return { code: html };

    const nextAttributes = classMatch
        ? attributes.replace(classMatch[0], ` class="${ordered.join(" ")}"`)
        : `${attributes} class="${ordered.join(" ")}"`;

    return { code: html.replace(match[0], `<html${nextAttributes}>`) };
};

/** The module script index.html loads ("/src/main.tsx" → "src/main.tsx") */
export const viteEntryModule = (html: string): string | null =>
    html.match(/<script\b[^>]*type=["']module["'][^>]*src=["']\/?([^"']+)["']/i)?.[1]
    ?? html.match(/<script\b[^>]*src=["']\/?([^"']+)["'][^>]*type=["']module["']/i)?.[1]
    ?? null;

/** Relative CSS imports of a module, in order */
export const cssImportsOf = (code: string, file: string): string[] =>
    parseModule(code, file).program.body
        .filter((statement): statement is t.ImportDeclaration => statement.type === "ImportDeclaration")
        .map((statement) => statement.source.value)
        .filter((source) => source.startsWith(".") && source.endsWith(".css"));

/** Adds `import "<css>";` in a managed block after the imports when the module does not import it */
export const ensureCssImport = (code: string, specifier: string, file: string): string =>
{
    if (cssImportsOf(code, file).includes(specifier)) return code;

    const at = afterImports(parseModule(code, file), code);

    return `${code.slice(0, at)}${renderBlock("ts", "entry-css", `import ${JSON.stringify(specifier)};`)}\n${code.slice(at)}`;
};

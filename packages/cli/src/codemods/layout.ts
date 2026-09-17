// Next root layout: a managed `fonts` block after the imports (next/font declarations and the <html> class), and
// `className` on <html> reading it. The block is rewritten on every run; the <html> edit happens once.
//
//   <html lang="en">                     →  <html lang="en" className={tyohnnHtmlClassName}>
//   <html className="scroll-smooth">     →  <html className={`${tyohnnHtmlClassName} scroll-smooth`}>
//   <html className={cn(a, b)}>          →  <html className={[tyohnnHtmlClassName, cn(a, b)].join(" ")}>

import { findBlock, renderBlock, replaceBlock } from "../lib/markers.js";
import { afterImports, parseModule, Splicer, type t } from "./ast.js";
import type { CodemodResult } from "./next-config.js";

export const HTML_CLASS_IDENTIFIER = "tyohnnHtmlClassName";

export const layoutBlock = (lines: string[], htmlClasses: string[]): string =>
    [
        ...lines,
        "",
        `const ${HTML_CLASS_IDENTIFIER} = [${htmlClasses.join(", ")}].join(" ");`,
    ].join("\n").replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");

const findHtml = (node: unknown): t.JSXOpeningElement | null =>
{
    if (!node || typeof node !== "object") return null;

    const value = node as t.Node;

    if (value.type === "JSXOpeningElement" && value.name.type === "JSXIdentifier" && value.name.name === "html") return value;

    for (const key of Object.keys(value))
    {
        if (key === "loc" || key === "leadingComments" || key === "trailingComments") continue;

        const child = (value as unknown as Record<string, unknown>)[key];
        const found = Array.isArray(child) ? child.map(findHtml).find(Boolean) ?? null : findHtml(child);

        if (found) return found;
    }

    return null;
};

/** Imports of the file outside the tyohnn block */
const importSources = (ast: t.File, code: string): string[] =>
{
    const block = findBlock(code, "ts", "fonts");

    return ast.program.body
        .filter((statement): statement is t.ImportDeclaration => statement.type === "ImportDeclaration")
        .filter((statement) => !block || statement.start! < block.start || statement.start! > block.end)
        .map((statement) => statement.source.value);
};

/**
 * @param blockBody the block's content (see layoutBlock)
 * @param cssImport the entry CSS specifier ("./globals.css"); imported inside the block when the layout does not import it
 */
export const applyLayout = (code: string, blockBody: string, cssImport: string | null, file = "layout.tsx"): CodemodResult =>
{
    const firstAst = parseModule(code, file);
    const needsCss = cssImport !== null && !importSources(firstAst, code).includes(cssImport);
    const body = needsCss ? `import ${JSON.stringify(cssImport)};\n${blockBody}` : blockBody;

    let result = replaceBlock(code, "ts", "fonts", body);

    if (result === null)
    {
        const at = afterImports(firstAst, code);
        const before = code.slice(0, at);
        const after = code.slice(at).replace(/^\s*\n/, "");

        result = `${before}${before && !before.endsWith("\n\n") ? "\n" : ""}${renderBlock("ts", "fonts", body)}\n\n${after}`;
    }

    const ast = parseModule(result, file);
    const html = findHtml(ast.program);

    if (!html) return { code: result, manual: `put className={${HTML_CLASS_IDENTIFIER}} on <html> in ${file}` };

    const splicer = new Splicer(result);
    const attribute = html.attributes.find((attr): attr is t.JSXAttribute => attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier" && attr.name.name === "className");

    if (!attribute)
    {
        splicer.insert(html.name.end!, ` className={${HTML_CLASS_IDENTIFIER}}`);
    }
    else if (!result.slice(attribute.start!, attribute.end!).includes(HTML_CLASS_IDENTIFIER))
    {
        const value = attribute.value;

        if (value?.type === "StringLiteral")
        {
            splicer.replace(value.start!, value.end!, `{\`\${${HTML_CLASS_IDENTIFIER}} ${value.value.replace(/[`\\$]/g, "\\$&")}\`}`);
        }
        else if (value?.type === "JSXExpressionContainer" && value.expression.type !== "JSXEmptyExpression")
        {
            const expression = result.slice(value.expression.start!, value.expression.end!);

            splicer.replace(value.expression.start!, value.expression.end!, `[${HTML_CLASS_IDENTIFIER}, ${expression}].join(" ")`);
        }
        else
        {
            return { code: result, manual: `add ${HTML_CLASS_IDENTIFIER} to the className of <html> in ${file}` };
        }
    }

    return { code: splicer.toString() };
};

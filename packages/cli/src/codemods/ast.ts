// Source edits by offset over a Babel AST: the file is parsed to find positions, and only the inserted or replaced
// ranges change. Formatting and comments elsewhere stay byte-identical.

import { parse } from "@babel/parser";
import type * as t from "@babel/types";

import { CliError } from "../lib/log.js";

export type { t };

export const parseModule = (code: string, file: string): t.File =>
{
    try
    {
        return parse(code, {
            sourceType: "unambiguous",
            plugins: ["typescript", "jsx"],
            errorRecovery: false,
        }) as unknown as t.File;
    }
    catch (error)
    {
        throw new CliError(`${file} could not be parsed: ${(error as Error).message}`, "Fix the syntax error, then run the command again.");
    }
};

interface Edit
{
    start: number;
    end: number;
    text: string;
}

export class Splicer
{
    private readonly edits: Edit[] = [];

    constructor(readonly code: string) {}

    insert(at: number, text: string)
    {
        this.edits.push({ start: at, end: at, text });
    }

    replace(start: number, end: number, text: string)
    {
        this.edits.push({ start, end, text });
    }

    get changed(): boolean
    {
        return this.edits.length > 0;
    }

    toString(): string
    {
        return [...this.edits]
            .sort((a, b) => b.start - a.start || b.end - a.end)
            .reduce((code, edit) => code.slice(0, edit.start) + edit.text + code.slice(edit.end), this.code);
    }
}

/** Strips `as` / `satisfies` / parentheses / non-null wrappers */
export const unwrap = (node: t.Node | null | undefined): t.Node | null | undefined =>
{
    let current = node;

    while (current && (current.type === "TSAsExpression" || current.type === "TSSatisfiesExpression" || current.type === "ParenthesizedExpression" || current.type === "TSNonNullExpression" || current.type === "TSTypeAssertion"))
    {
        current = current.expression;
    }

    return current;
};

/** Top-level `const|let|var <name> = <init>` */
export const findVariable = (program: t.Program, name: string): t.Expression | null =>
{
    for (const statement of program.body)
    {
        const declaration = statement.type === "ExportNamedDeclaration" ? statement.declaration : statement;

        if (declaration?.type !== "VariableDeclaration") continue;

        for (const declarator of declaration.declarations)
        {
            if (declarator.id.type === "Identifier" && declarator.id.name === name && declarator.init) return declarator.init;
        }
    }

    return null;
};

/** The object literal an expression evaluates to: literal · identifier of one · first argument of a wrapper call · arrow returning one */
export const resolveObject = (program: t.Program, node: t.Node | null | undefined, depth = 0): t.ObjectExpression | null =>
{
    const value = unwrap(node);

    if (!value || depth > 5) return null;
    if (value.type === "ObjectExpression") return value;
    if (value.type === "Identifier") return resolveObject(program, findVariable(program, value.name), depth + 1);
    if (value.type === "CallExpression") return resolveObject(program, value.arguments[0] as t.Node, depth + 1);

    if (value.type === "ArrowFunctionExpression" || value.type === "FunctionExpression")
    {
        if (value.body.type !== "BlockStatement") return resolveObject(program, value.body, depth + 1);

        const returned = value.body.body.find((statement): statement is t.ReturnStatement => statement.type === "ReturnStatement");

        return resolveObject(program, returned?.argument, depth + 1);
    }

    return null;
};

/** The default-exported config (ESM `export default` or CommonJS `module.exports =`) */
export const findExportedObject = (ast: t.File): t.ObjectExpression | null =>
{
    const program = ast.program;

    for (const statement of program.body)
    {
        if (statement.type === "ExportDefaultDeclaration") return resolveObject(program, statement.declaration);

        if (statement.type === "ExpressionStatement" && statement.expression.type === "AssignmentExpression")
        {
            const { left, right } = statement.expression;

            if (left.type === "MemberExpression" && left.object.type === "Identifier" && left.object.name === "module" && left.property.type === "Identifier" && left.property.name === "exports")
            {
                return resolveObject(program, right);
            }
        }
    }

    return null;
};

export const propertyName = (property: t.Node): string | null =>
{
    if (property.type !== "ObjectProperty" && property.type !== "ObjectMethod") return null;
    if (property.computed) return null;
    if (property.key.type === "Identifier") return property.key.name;
    if (property.key.type === "StringLiteral") return property.key.value;

    return null;
};

export const findProperty = (object: t.ObjectExpression, name: string): t.ObjectProperty | null =>
    (object.properties.find((property) => propertyName(property) === name && property.type === "ObjectProperty") as t.ObjectProperty | undefined) ?? null;

/** Indentation of the line containing an offset */
export const lineIndent = (code: string, offset: number): string =>
{
    const lineStart = code.lastIndexOf("\n", offset - 1) + 1;

    return code.slice(lineStart).match(/^[ \t]*/)?.[0] ?? "";
};

/** The file's indentation unit (default four spaces) */
export const indentUnit = (code: string): string =>
{
    const indents = [...code.matchAll(/^( +)\S/gm)].map((match) => match[1].length).filter((length) => length > 0);

    return " ".repeat(indents.length ? Math.min(...indents) : 4);
};

/**
 * Inserts lines as the first entries of an object literal. `{}` becomes a multi-line object; otherwise the lines go
 * right after `{`, indented like the first property.
 */
export const insertFirstInObject = (splicer: Splicer, object: t.ObjectExpression, lines: string): void =>
{
    const code = splicer.code;
    const open = object.start! + 1;
    const unit = indentUnit(code);
    const baseIndent = lineIndent(code, object.start!);

    if (object.properties.length === 0)
    {
        const content = code.slice(open, object.end! - 1);

        if (!content.trim())
        {
            const inner = lines.split("\n").map((line) => (line ? `${baseIndent}${unit}${line}` : line)).join("\n");

            splicer.replace(object.start!, object.end!, `{\n${inner}\n${baseIndent}}`);

            return;
        }

        // Only comments inside: keep them after the inserted lines.
        const indent = content.includes("\n") ? content.match(/\n([ \t]*)\S/)?.[1] ?? `${baseIndent}${unit}` : `${baseIndent}${unit}`;
        const inner = lines.split("\n").map((line) => (line ? `${indent}${line}` : line)).join("\n");

        splicer.insert(open, content.includes("\n") ? `\n${inner}` : `\n${inner}\n${indent}`);

        return;
    }

    const first = object.properties[0];
    const multiline = code.slice(open, first.start!).includes("\n");
    const indent = multiline ? lineIndent(code, first.start!) : `${baseIndent}${unit}`;
    const inner = lines.split("\n").map((line) => (line ? `${indent}${line}` : line)).join("\n");

    splicer.insert(multiline ? code.lastIndexOf("\n", first.start! - 1) + 1 : open, multiline ? `${inner}\n` : `\n${inner}\n${indent}`);
};

/** Offset right after the line of the last top-level import (0 when there is none, after directives) */
export const afterImports = (ast: t.File, code: string): number =>
{
    const imports = ast.program.body.filter((statement) => statement.type === "ImportDeclaration");
    const last = imports.at(-1);

    if (last)
    {
        const newline = code.indexOf("\n", last.end!);

        return newline === -1 ? code.length : newline + 1;
    }

    const directive = ast.program.directives?.at(-1);

    if (directive)
    {
        const newline = code.indexOf("\n", directive.end!);

        return newline === -1 ? code.length : newline + 1;
    }

    return 0;
};

// next.config.{ts,mjs,js}: `transpilePackages` gains the workspace UI package (monorepos only; it ships TypeScript
// source). Icons need nothing here: tsconfig `paths` points the icon specifier at the app's library.

import { replaceBlock } from "../lib/markers.js";
import { findExportedObject, findProperty, insertFirstInObject, parseModule, Splicer, unwrap } from "./ast.js";

export interface CodemodResult
{
    code: string;
    /** Set when the file could not be changed safely: what to do by hand */
    manual?: string;
}

const block = (pkg: string) => ["// tyohnn:begin transpile", `transpilePackages: [${JSON.stringify(pkg)}],`, "// tyohnn:end transpile"].join("\n");

export const newNextConfig = (pkg: string): string => [
    'import type { NextConfig } from "next";',
    "",
    "const nextConfig: NextConfig = {",
    "    // tyohnn:begin transpile",
    `    transpilePackages: [${JSON.stringify(pkg)}],`,
    "    // tyohnn:end transpile",
    "};",
    "",
    "export default nextConfig;",
    "",
].join("\n");

export const ensureTranspilePackage = (code: string, pkg: string, file = "next.config.ts"): CodemodResult =>
{
    const replaced = replaceBlock(code, "ts", "transpile", `transpilePackages: [${JSON.stringify(pkg)}],`);

    if (replaced !== null) return { code: replaced };

    const ast = parseModule(code, file);
    const config = findExportedObject(ast);
    const manual = `add ${JSON.stringify(pkg)} to transpilePackages in ${file}`;

    if (!config) return { code, manual };

    const splicer = new Splicer(code);
    const property = findProperty(config, "transpilePackages");

    if (!property)
    {
        insertFirstInObject(splicer, config, block(pkg));

        return { code: splicer.toString() };
    }

    const value = unwrap(property.value);

    if (value?.type !== "ArrayExpression") return { code, manual };

    if (value.elements.some((element) => element?.type === "StringLiteral" && element.value === pkg)) return { code };

    const last = value.elements.at(-1);
    const entry = `${JSON.stringify(pkg)} /* tyohnn */`;

    if (last) splicer.insert(last.end!, `, ${entry}`);
    else splicer.replace(value.start!, value.end!, `[${entry}]`);

    return { code: splicer.toString() };
};

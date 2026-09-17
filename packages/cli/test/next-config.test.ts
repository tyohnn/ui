import { describe, expect, it } from "vitest";

import { ensureTranspilePackage, newNextConfig } from "../src/codemods/next-config.js";

const pkg = "@acme/ui";

describe("next.config transpilePackages", () =>
{
    it("adds a managed property to a typed config object (create-next-app)", () =>
    {
        const input = 'import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n  /* config options here */\n};\n\nexport default nextConfig;\n';
        const { code, manual } = ensureTranspilePackage(input, pkg);

        expect(manual).toBeUndefined();
        expect(code).toBe('import type { NextConfig } from "next";\n\nconst nextConfig: NextConfig = {\n  // tyohnn:begin transpile\n  transpilePackages: ["@acme/ui"],\n  // tyohnn:end transpile\n  /* config options here */\n};\n\nexport default nextConfig;\n');
        expect(ensureTranspilePackage(code, pkg).code).toBe(code);
    });

    it("handles an empty object, export default, module.exports and wrapper calls", () =>
    {
        const empty = ensureTranspilePackage("const nextConfig = {};\nexport default nextConfig;\n", pkg).code;

        expect(empty).toBe('const nextConfig = {\n    // tyohnn:begin transpile\n    transpilePackages: ["@acme/ui"],\n    // tyohnn:end transpile\n};\nexport default nextConfig;\n');

        const direct = ensureTranspilePackage("export default {\n    reactStrictMode: true,\n};\n", pkg, "next.config.mjs").code;

        expect(direct).toContain('    transpilePackages: ["@acme/ui"],\n    // tyohnn:end transpile\n    reactStrictMode: true,');

        const cjs = ensureTranspilePackage("/** @type {import('next').NextConfig} */\nmodule.exports = { output: 'standalone' };\n", pkg, "next.config.js").code;

        expect(cjs).toContain('transpilePackages: ["@acme/ui"]');
        expect(cjs).toContain("output: 'standalone' }");

        const wrapped = ensureTranspilePackage('import withMDX from "@next/mdx";\n\nexport default withMDX()({\n    pageExtensions: ["tsx"],\n});\n', pkg).code;

        expect(wrapped).toMatch(/withMDX\(\)\(\{\n {4}\/\/ tyohnn:begin transpile/);

        const satisfies = ensureTranspilePackage("export default {\n  images: {},\n} satisfies NextConfig;\n", pkg).code;

        expect(satisfies).toContain('  transpilePackages: ["@acme/ui"],');
    });

    it("appends to an existing array once", () =>
    {
        const input = 'const nextConfig = {\n    transpilePackages: ["@acme/charts"],\n};\nexport default nextConfig;\n';
        const once = ensureTranspilePackage(input, pkg).code;

        expect(once).toContain('transpilePackages: ["@acme/charts", "@acme/ui" /* tyohnn */],');
        expect(ensureTranspilePackage(once, pkg).code).toBe(once);
        expect(ensureTranspilePackage('export default { transpilePackages: [] };\n', pkg).code).toContain('transpilePackages: ["@acme/ui" /* tyohnn */]');
    });

    it("asks for a hand edit when the value is not a literal array or the config is computed", () =>
    {
        expect(ensureTranspilePackage("const shared = ['a'];\nexport default { transpilePackages: shared };\n", pkg).manual).toContain("transpilePackages");
        expect(ensureTranspilePackage("export default async function config() { return {}; }\n", pkg).manual).toBeDefined();
    });

    it("writes a new config that parses back to the same block", () =>
    {
        const created = newNextConfig(pkg);

        expect(ensureTranspilePackage(created, pkg).code).toBe(created);
    });
});

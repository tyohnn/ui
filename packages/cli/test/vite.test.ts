import { describe, expect, it } from "vitest";

import { applyIndexHtml, applyViteConfig, ensureCssImport, viteEntryModule } from "../src/codemods/vite.js";

const template = "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\n// https://vite.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n})\n";
const appAlias = [{ find: "@", exact: false, target: "./src" }];

describe("vite.config codemod", () =>
{
    it("adds the Tailwind plugin and the alias to the create-vite config", () =>
    {
        const { code, manual } = applyViteConfig(template, appAlias);

        expect(manual).toBeUndefined();
        expect(code).toContain('import react from \'@vitejs/plugin-react\'\n// tyohnn:begin imports\nimport tailwindcss from "@tailwindcss/vite";\nimport { fileURLToPath } from "node:url";\n// tyohnn:end imports\n');
        expect(code).toContain("plugins: [react(), tailwindcss() /* tyohnn */],");
        expect(code).toContain('{ find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },');
    });

    it("is idempotent, and rewrites its own alias block when the target changes", () =>
    {
        const once = applyViteConfig(template, appAlias).code;

        expect(applyViteConfig(once, appAlias).code).toBe(once);

        const icons = [{ find: "@acme/ui/icons", exact: true, target: "../../packages/ui/src/icons/libraries/lucide.tsx" }];
        const withIcons = applyViteConfig(template, icons).code;
        const switched = applyViteConfig(withIcons, [{ ...icons[0], target: icons[0].target.replace("lucide", "tabler") }]).code;

        expect(withIcons).toContain("find: /^@acme\\/ui\\/icons$/");
        expect(switched).toContain("libraries/tabler.tsx");
        expect(switched).not.toContain("libraries/lucide.tsx");
    });

    it("adds to an existing resolve.alias object and keeps a user's tailwind import", () =>
    {
        const input = 'import { defineConfig } from "vite";\nimport tw from "@tailwindcss/vite";\n\nexport default defineConfig({\n    plugins: [tw()],\n    resolve: {\n        alias: {\n            "~": "/src",\n        },\n    },\n});\n';
        const { code } = applyViteConfig(input, appAlias);

        expect(code).toContain('"@": fileURLToPath(new URL("./src", import.meta.url)), // tyohnn');
        expect(code).not.toContain("tailwindcss() /* tyohnn */");
        expect(code).not.toContain('import tailwindcss from "@tailwindcss/vite"');
        expect(applyViteConfig(code, appAlias).code).toBe(code);
    });

    it("handles a function config", () =>
    {
        const { code } = applyViteConfig("export default defineConfig(({ mode }) => ({\n  base: mode === 'x' ? '/' : '/app',\n}))\n", appAlias);

        expect(code).toContain("plugins: [tailwindcss()],");
        expect(code).toContain("resolve: {");
    });
});

describe("index.html and the entry module", () =>
{
    const html = '<!doctype html>\n<html lang="en">\n  <body>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n';

    it("sets the mode class and font-sans idempotently, and removes dark for light", () =>
    {
        const dark = applyIndexHtml(html, "dark").code;

        expect(dark).toContain('<html lang="en" class="dark font-sans">');
        expect(applyIndexHtml(dark, "dark").code).toBe(dark);
        expect(applyIndexHtml(dark, "light").code).toContain('<html lang="en" class="font-sans">');
    });

    it("finds the module script and adds a missing CSS import once", () =>
    {
        expect(viteEntryModule(html)).toBe("src/main.tsx");

        const main = "import { createRoot } from 'react-dom/client'\nimport App from './App.tsx'\n\ncreateRoot(document.body).render(<App />)\n";
        const once = ensureCssImport(main, "./index.css", "main.tsx");

        expect(once).toContain("import App from './App.tsx'\n// tyohnn:begin entry-css\nimport \"./index.css\";\n// tyohnn:end entry-css\n");
        expect(ensureCssImport(once, "./index.css", "main.tsx")).toBe(once);
    });
});

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { shadcnFolders } from "../src/commands/init.js";
import { applyEntryCss, removeSystemDefaults, type SystemDefaults, userCustomProperties } from "../src/codemods/css.js";
import { Changes } from "../src/lib/log.js";
import { RECORD_VERSION, type TyohnnRecord } from "../src/project/record.js";
import { OwnedFiles } from "../src/project/writer.js";
import { repoRoot, tempDir } from "./helpers.js";

/** What `shadcn init -p vega` (shadcn 4.21.0) writes to app/globals.css, shortened, plus one rule of the app's own */
const SHADCN_GLOBALS = `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --font-heading: var(--font-sans);
    --font-sans: var(--font-sans);
    --color-sidebar-ring: var(--sidebar-ring);
    --color-primary: var(--primary);
    --color-background: var(--background);
    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
}

:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --radius: 0.625rem;
    --sidebar-ring: oklch(0.708 0 0);
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    --primary: oklch(0.922 0 0);
    --border: oklch(1 0 0 / 10%);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
    }
  body {
    @apply bg-background text-foreground;
    }
  html {
    @apply font-sans;
    }
}

/* The app's own rules. */
.app-note {
  font-style: italic;
}
`;

const BLOCKS = {
    system: ['@import "tailwindcss";', '@import "../styles/tyohnn/graphite/globals.css";', '@import "../styles/tyohnn/graphite/style.css" layer(base);'].join("\n"),
    theme: '@source not "../styles/tyohnn";',
};

const systemDefaults = (system: string): SystemDefaults =>
{
    const file = (name: string) => readFileSync(join(repoRoot, "registry/systems", system, "styles", name), "utf8");

    return {
        tokens: new Set(["globals.css", "theme.css", "tokens.css"].flatMap((name) => [...file(name).matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((match) => match[1]))),
        globals: file("globals.css"),
    };
};

describe("adopting a shadcn app's entry CSS", () =>
{
    const graphite = systemDefaults("graphite");

    it("takes out shadcn's defaults the system sets, and keeps the imports and the app's own rules", () =>
    {
        const { css, removed } = removeSystemDefaults(applyEntryCss(SHADCN_GLOBALS, BLOCKS), graphite);

        expect(userCustomProperties(css).filter((name) => graphite.tokens.has(name))).toEqual([]);
        expect(css).not.toMatch(/^:root|^\.dark|^@theme|^@custom-variant|^@layer base/m);
        expect(css).toContain('@import "tw-animate-css";');
        expect(css).toContain('@import "shadcn/tailwind.css";');
        expect(css).toContain("/* The app's own rules. */\n.app-note {\n  font-style: italic;\n}\n");
        expect(css).not.toMatch(/\n{3,}/);
        expect(removed).toEqual({ "@custom-variant": 1, "@theme": 7, ":root": 5, ".dark": 4, "@layer base": 3 });
    });

    it("is idempotent", () =>
    {
        const once = removeSystemDefaults(applyEntryCss(SHADCN_GLOBALS, BLOCKS), graphite);

        expect(removeSystemDefaults(once.css, graphite)).toEqual({ css: once.css, removed: {} });
    });

    it("keeps declarations of names the system does not have, and rules the system's base layer does not hold", () =>
    {
        const css = [
            ":root {",
            "    --primary: oklch(0.6 0.2 30);",
            "    --brand-glow: 0 0 40px hotpink",
            "}",
            "",
            "@layer base {",
            "  body {",
            "    @apply bg-background text-foreground;",
            "  }",
            "  h1 { letter-spacing: -0.02em; }",
            "}",
            "",
        ].join("\n");
        const { css: out, removed } = removeSystemDefaults(css, graphite);

        expect(out).toBe([":root {", "    --brand-glow: 0 0 40px hotpink", "}", "", "@layer base {", "  h1 { letter-spacing: -0.02em; }", "}", ""].join("\n"));
        expect(removed).toEqual({ ":root": 1, "@layer base": 1 });
    });

    it("leaves the tyohnn blocks alone", () =>
    {
        const css = applyEntryCss("", { system: BLOCKS.system, theme: ":root {\n    --font-sans: var(--font-sans-inter), sans-serif;\n}" });

        expect(removeSystemDefaults(css, graphite).css).toBe(css);
    });
});

describe("shadcn's folders", () =>
{
    it("reads them from components.json under the import base init chose", () =>
    {
        const root = tempDir();

        writeFileSync(join(root, "components.json"), JSON.stringify({ aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" } }));

        expect(shadcnFolders(root, { path: ".", importBase: "@" })).toEqual(["components/ui", "hooks", "lib"]);
        expect(shadcnFolders(root, { path: "src", importBase: "@" })).toEqual(["src/components/ui", "src/hooks", "src/lib"]);
        expect(shadcnFolders(root, { path: "src", importBase: "~" })).toEqual([]);
        expect(shadcnFolders(tempDir(), { path: ".", importBase: "@" })).toBeNull();
    });

    it("lets init replace the files in them, and still stops on anything else in the way", () =>
    {
        const root = tempDir();
        const record: TyohnnRecord = {
            version: RECORD_VERSION,
            source: { kind: "local", commit: null },
            project: "next",
            packageManager: "npm",
            ui: { path: ".", importBase: "@", systems: [], icons: [] },
            apps: {},
            packages: {},
            files: {},
        };

        mkdirSync(join(root, "components/ui"), { recursive: true });
        writeFileSync(join(root, "components/ui/button.tsx"), "// shadcn's\n");
        writeFileSync(join(root, "notes.ts"), "// mine\n");

        const adopting = new OwnedFiles(root, record, new Changes(), false, ["components/ui"]);

        adopting.plan(join(root, "components/ui/button.tsx"), "registry/ui/components/button.tsx", "// tyohnn's\n");
        expect(adopting.conflicts()).toEqual([]);
        adopting.write();
        expect(readFileSync(join(root, "components/ui/button.tsx"), "utf8")).toBe("// tyohnn's\n");

        adopting.plan(join(root, "notes.ts"), "generated:notes", "// tyohnn's\n");
        expect(adopting.conflicts()).toEqual(["notes.ts"]);
    });
});

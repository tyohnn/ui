import { describe, expect, it } from "vitest";

import { placementOf, rewriteApp, rewriteMonorepo } from "../src/project/placement.js";

const source = [
    'import { Button } from "@tyohnn/components/button";',
    'import { cn } from "@tyohnn/lib/utils";',
    'import { useIsMobile } from "@tyohnn/hooks/use-mobile";',
    'import { ChevronDown } from "@tyohnn/icons";',
    'import type { IconProps } from "@tyohnn/icons/names";',
    'import { strings } from "@tyohnn/strings";',
    'import { Tabs } from "@base-ui/react/tabs";',
].join("\n");

describe("placeholder alias rewriting", () =>
{
    it("points every placeholder at the monorepo UI package", () =>
    {
        expect(rewriteMonorepo(source, "@acme/ui")).toBe([
            'import { Button } from "@acme/ui/components/button";',
            'import { cn } from "@acme/ui/lib/utils";',
            'import { useIsMobile } from "@acme/ui/hooks/use-mobile";',
            'import { ChevronDown } from "@acme/ui/icons";',
            'import type { IconProps } from "@acme/ui/icons/names";',
            'import { strings } from "@acme/ui/strings";',
            'import { Tabs } from "@base-ui/react/tabs";',
        ].join("\n"));
    });

    it("points every placeholder at the app alias, components under components/ui", () =>
    {
        expect(rewriteApp(source, "@")).toBe([
            'import { Button } from "@/components/ui/button";',
            'import { cn } from "@/lib/utils";',
            'import { useIsMobile } from "@/hooks/use-mobile";',
            'import { ChevronDown } from "@/components/icons";',
            'import type { IconProps } from "@/components/icons/names";',
            'import { strings } from "@/lib/strings";',
            'import { Tabs } from "@base-ui/react/tabs";',
        ].join("\n"));
    });

    it("points a block's imports of other blocks at the project's blocks folder", () =>
    {
        const block = 'import { DataTable } from "@tyohnn/blocks/data-table";\nimport { META } from "@tyohnn/blocks/lib/text";\nimport { cn } from "@tyohnn/lib/utils";';

        expect(rewriteMonorepo(block, "@acme/ui")).toBe('import { DataTable } from "@acme/ui/blocks/data-table";\nimport { META } from "@acme/ui/blocks/lib/text";\nimport { cn } from "@acme/ui/lib/utils";');
        expect(rewriteApp(block, "@")).toBe('import { DataTable } from "@/components/blocks/data-table";\nimport { META } from "@/components/blocks/lib/text";\nimport { cn } from "@/lib/utils";');
    });

    it("leaves names that only start like a placeholder alone", () =>
    {
        expect(rewriteApp('import x from "@tyohnn/iconset";', "~")).toBe('import x from "@tyohnn/iconset";');
        expect(rewriteMonorepo('import x from "@tyohnn/ui/components/button";', "@acme/ui")).toBe('import x from "@tyohnn/ui/components/button";');
    });

    it("places registry files per project kind", () =>
    {
        const mono = placementOf("/repo", { project: "monorepo", ui: { path: "packages/ui", importBase: "@acme/ui", systems: [], icons: [] } });
        const app = placementOf("/app", { project: "next", ui: { path: "src", importBase: "@", systems: [], icons: [] } });

        expect(mono.target("registry/ui/components/button.tsx")).toBe("/repo/packages/ui/src/components/button.tsx");
        expect(mono.target("registry/ui/icons/libraries/lucide.tsx")).toBe("/repo/packages/ui/src/icons/libraries/lucide.tsx");
        expect(mono.target("registry/systems/vega/styles/components/button.css")).toBe("/repo/packages/ui/src/systems/vega/components/button.css");
        expect(mono.iconSpecifier).toBe("@acme/ui/icons");
        expect(mono.target("registry/ui/strings/names.ts")).toBe("/repo/packages/ui/src/strings/names.ts");
        expect(mono.target("registry/ui/strings/locales/ko.ts")).toBe("/repo/packages/ui/src/strings/locales/ko.ts");
        expect(mono.target("registry/ui/strings/index.ts")).toBeNull();
        expect(mono.target("registry/blocks/data-table-card.tsx")).toBe("/repo/packages/ui/src/blocks/data-table-card.tsx");
        expect(mono.target("registry/blocks/lib/text.ts")).toBe("/repo/packages/ui/src/blocks/lib/text.ts");
        expect(app.target("registry/blocks/data-table-card.tsx")).toBe("/app/src/components/blocks/data-table-card.tsx");
        expect(app.target("registry/blocks/lib/text.ts")).toBe("/app/src/components/blocks/lib/text.ts");

        expect(app.target("registry/ui/components/button.tsx")).toBe("/app/src/components/ui/button.tsx");
        expect(app.target("registry/ui/hooks/use-mobile.ts")).toBe("/app/src/hooks/use-mobile.ts");
        expect(app.target("registry/ui/icons/names.ts")).toBe("/app/src/components/icons/names.ts");
        expect(app.target("registry/ui/strings/locales/en.ts")).toBe("/app/src/lib/strings/locales/en.ts");
        expect(app.target("registry/systems/sera/DESIGN.md")).toBe("/app/src/styles/tyohnn/sera/DESIGN.md");
        expect(app.target("registry/systems/sera/reference/README.md")).toBeNull();
        expect(app.iconSpecifier).toBe("@/components/icons");
    });
});

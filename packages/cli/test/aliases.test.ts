import { describe, expect, it } from "vitest";

import { placementOf, rewriteApp, rewriteMonorepo } from "../src/project/placement.js";

const source = [
    'import { Button } from "@tyohnn/components/button";',
    'import { cn } from "@tyohnn/lib/utils";',
    'import { useIsMobile } from "@tyohnn/hooks/use-mobile";',
    'import { ChevronDown } from "@tyohnn/icons";',
    'import type { IconProps } from "@tyohnn/icons/names";',
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
            'import { Tabs } from "@base-ui/react/tabs";',
        ].join("\n"));
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

        expect(app.target("registry/ui/components/button.tsx")).toBe("/app/src/components/ui/button.tsx");
        expect(app.target("registry/ui/hooks/use-mobile.ts")).toBe("/app/src/hooks/use-mobile.ts");
        expect(app.target("registry/ui/icons/names.ts")).toBe("/app/src/components/icons/names.ts");
        expect(app.target("registry/systems/sera/DESIGN.md")).toBe("/app/src/styles/tyohnn/sera/DESIGN.md");
        expect(app.target("registry/systems/sera/reference/README.md")).toBeNull();
        expect(app.iconSpecifier).toBe("@/components/icons");
    });
});

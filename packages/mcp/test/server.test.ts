import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it } from "vitest";

import { createServer, SYSTEM_URI, WIDGET_URI } from "../src/server";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const client = new Client({ name: "test", version: "0.0.0" });

beforeAll(async () =>
{
    const server = createServer({ root, previewBase: "https://tyohnn.vercel.app/preview", widgetHtml: "<!doctype html><title>view</title>", systemHtml: "<!doctype html><title>system</title>" });
    const [a, b] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(a), client.connect(b)]);
});

const textOf = (result: Awaited<ReturnType<typeof client.callTool>>) => (result.content as { type: string; text: string }[]).map((part) => part.text).join("\n");

describe("the MCP server", () =>
{
    it("offers three read-only tools for the primitives and four for shaping a system, only get_system read-only", async () =>
    {
        const { tools } = await client.listTools();
        const readOnly = tools.filter((tool) => tool.annotations?.readOnlyHint).map((tool) => tool.name).sort();

        expect(tools.map((tool) => tool.name).sort()).toEqual(["get_primitive", "get_system", "list_primitives", "set_colours", "set_tokens", "show_primitives", "show_system"]);
        expect(readOnly).toEqual(["get_primitive", "get_system", "list_primitives", "show_primitives"]);
    });

    it("lists primitives by group and by purpose", async () =>
    {
        const forms = textOf(await client.callTool({ name: "list_primitives", arguments: { group: "forms" } }));

        expect(forms).toContain("## Forms");
        expect(forms).toContain("- input-otp:");
        expect(forms).not.toContain("## Basics");
        expect(textOf(await client.callTool({ name: "list_primitives", arguments: { query: "long list" } }))).toContain("combobox");
    });

    it("returns a primitive's source and its preview link", async () =>
    {
        const text = textOf(await client.callTool({ name: "get_primitive", arguments: { name: "badge", system: "clover" } }));

        expect(text).toContain("https://tyohnn.vercel.app/preview/clover/index.html?template=coverage&mode=light&section=badge");
        expect(text).toContain(readFileSync(`${root}/registry/ui/components/badge.tsx`, "utf8").trim().split("\n")[0]);
    });

    it("ties show_primitives to the cards view, which may frame only the preview origin", async () =>
    {
        const { tools } = await client.listTools();
        const show = tools.find((tool) => tool.name === "show_primitives");

        expect(show?._meta).toMatchObject({ ui: { resourceUri: WIDGET_URI } });

        const { contents } = await client.readResource({ uri: WIDGET_URI });

        expect(contents[0]).toMatchObject({ mimeType: "text/html;profile=mcp-app", _meta: { ui: { csp: { frameDomains: ["https://tyohnn.vercel.app"] } } } });
    });

    it("hands the view the chosen system, mode and only the asked primitives", async () =>
    {
        const result = await client.callTool({ name: "show_primitives", arguments: { system: "vellum", names: ["button", "select"] } });
        const data = result.structuredContent as { system: string; mode: string; groups: { id: string; primitives: { name: string }[] }[] };

        expect(data.system).toBe("vellum");
        expect(data.mode).toBe("light");
        expect(data.groups.flatMap((group) => group.primitives.map((primitive) => primitive.name))).toEqual(["button", "select"]);
        expect(textOf(result)).toContain("section=select");
    });

    it("ties show_system, set_colours and set_tokens to the System view, which may frame the preview and load the site's fonts", async () =>
    {
        const { tools } = await client.listTools();

        for (const name of ["show_system", "set_colours", "set_tokens"]) expect(tools.find((tool) => tool.name === name)?._meta).toMatchObject({ ui: { resourceUri: SYSTEM_URI } });

        const { contents } = await client.readResource({ uri: SYSTEM_URI });

        expect(contents[0]).toMatchObject({
            mimeType: "text/html;profile=mcp-app",
            _meta: { ui: { csp: { frameDomains: ["https://tyohnn.vercel.app"], resourceDomains: ["https://fonts.googleapis.com", "https://fonts.gstatic.com"] } } },
        });
    });

    it("shapes one system across calls: the agent's edits stay until show_system starts over", async () =>
    {
        const shown = await client.callTool({ name: "show_system", arguments: { system: "graphite" } });

        expect(shown.structuredContent).toMatchObject({ system: "graphite", mode: "dark", palette: "graphite", changes: 0 });
        expect(shown._meta?.["tyohnn/view"]).toMatchObject({ previewBase: "https://tyohnn.vercel.app/preview", vars: {} });

        await client.callTool({ name: "set_colours", arguments: { accent: "violet" } });
        const tokens = await client.callTool({ name: "set_tokens", arguments: { tokens: { "--table-row-height": "30px" } } });

        expect(tokens.structuredContent).toMatchObject({ accent: "violet", tokens: { "--table-row-height": "30px" }, changes: 2 });
        expect((tokens._meta?.["tyohnn/view"] as { vars: Record<string, string> }).vars["--table-row-height"]).toBe("30px");

        const got = await client.callTool({ name: "get_system", arguments: {} });

        expect(textOf(got)).toContain("Tokens changed: --table-row-height 30px");
        expect(got._meta).toBeUndefined();

        const again = await client.callTool({ name: "show_system", arguments: { system: "graphite" } });

        expect(again.structuredContent).toMatchObject({ accent: null, tokens: {}, changes: 0 });
    });

    it("refuses an edit it cannot make, as an error the agent can read, and keeps the system as it was", async () =>
    {
        await client.callTool({ name: "show_system", arguments: { system: "clover" } });
        const refused = await client.callTool({ name: "set_tokens", arguments: { tokens: { "--table-row-height": "200px" } } });

        expect(refused.isError).toBe(true);
        expect(textOf(refused)).toContain("goes from 24px to 64px");
        expect((await client.callTool({ name: "get_system", arguments: {} })).structuredContent).toMatchObject({ tokens: {} });
    });
});

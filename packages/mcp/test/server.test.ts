import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { beforeAll, describe, expect, it } from "vitest";

import { createServer, WIDGET_URI } from "../src/server";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const client = new Client({ name: "test", version: "0.0.0" });

beforeAll(async () =>
{
    const server = createServer({ root, previewBase: "https://tyohnn.vercel.app/preview", widgetHtml: "<!doctype html><title>view</title>" });
    const [a, b] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(a), client.connect(b)]);
});

const textOf = (result: Awaited<ReturnType<typeof client.callTool>>) => (result.content as { type: string; text: string }[]).map((part) => part.text).join("\n");

describe("the MCP server", () =>
{
    it("offers the three primitive tools, read-only", async () =>
    {
        const { tools } = await client.listTools();

        expect(tools.map((tool) => tool.name).sort()).toEqual(["get_primitive", "list_primitives", "show_primitives"]);
        expect(tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(true);
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
});

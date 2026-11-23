import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { describe, expect, it } from "vitest";

import { createHttpHandler, memorySessions } from "../src/http";
import { closedStore } from "../src/store";

const root = fileURLToPath(new URL("../../..", import.meta.url));
const url = new URL("https://tyohnn.test/api/mcp");

/** A handler as the site's route serves it, and a fetch that calls it in place of the network */
const setup = () =>
{
    const sessions = memorySessions();
    const handler = createHttpHandler({
        root,
        previewBase: "https://tyohnn.vercel.app/preview",
        widgetHtml: "<!doctype html><title>view</title>",
        systemHtml: "<!doctype html><title>system</title>",
        store: closedStore("Publishing is not open on the hosted server yet."),
        sessions,
    });
    const fetch = (input: string | URL | Request, init?: RequestInit) => handler(new Request(input, init));

    return { handler, sessions, fetch };
};

const connect = async (fetch: ReturnType<typeof setup>["fetch"]) =>
{
    const client = new Client({ name: "test", version: "0.0.0" });
    const transport = new StreamableHTTPClientTransport(url, { fetch });

    await client.connect(transport);

    return { client, transport };
};

type ToolResult = Awaited<ReturnType<Client["callTool"]>>;

const textOf = (result: ToolResult) => (result.content as { type: string; text: string }[]).map((part) => part.text).join("\n");

describe("the MCP server over HTTP", () =>
{
    it("answers an MCP client: initialize hands out a session, and the tools are the stdio server's", async () =>
    {
        const { fetch } = setup();
        const { client, transport } = await connect(fetch);

        expect(transport.sessionId).toMatch(/^[0-9a-f-]{36}$/);
        expect((await client.listTools()).tools.map((tool) => tool.name)).toContain("get_primitive");
        expect(textOf(await client.callTool({ name: "get_primitive", arguments: { name: "button" } }))).toContain("@ui-sdk/react");
    });

    it("keeps the system being shaped across the requests of one session, and apart from another session", async () =>
    {
        const { fetch } = setup();
        const one = await connect(fetch);
        const two = await connect(fetch);

        await one.client.callTool({ name: "show_system", arguments: { system: "graphite" } });
        await one.client.callTool({ name: "set_colours", arguments: { accent: "violet" } });

        expect((await one.client.callTool({ name: "get_system", arguments: {} })).structuredContent).toMatchObject({ system: "graphite", accent: "violet" });
        expect((await two.client.callTool({ name: "get_system", arguments: {} })).structuredContent).toMatchObject({ system: "clover", accent: null });
    });

    it("answers a session id it does not know with 404, so the client starts over", async () =>
    {
        const { handler } = setup();
        const response = await handler(new Request(url, {
            method: "POST",
            headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "mcp-session-id": "gone" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
        }));

        expect(response.status).toBe(404);
    });

    it("forgets a session the client ends", async () =>
    {
        const { fetch, sessions } = setup();
        const { transport } = await connect(fetch);
        const id = transport.sessionId as string;

        expect(await sessions.get(id)).toBeDefined();
        await transport.terminateSession();
        expect(await sessions.get(id)).toBeUndefined();
    });

    it("never writes to a disk: export_system with dir is refused and the files come back instead", async () =>
    {
        const { fetch } = setup();
        const { client } = await connect(fetch);

        const written = await client.callTool({ name: "export_system", arguments: { name: "clover", dir: "/tmp/anywhere" } });

        expect(written.isError).toBe(true);
        expect(textOf(written)).toContain("cannot write to your disk");
        expect((await client.callTool({ name: "export_system", arguments: { name: "clover" } })).structuredContent).toHaveProperty("files");
    });

    it("refuses to publish while the hosted store is closed, saying why", async () =>
    {
        const { fetch } = setup();
        const { client } = await connect(fetch);

        await client.callTool({ name: "draft_system", arguments: { name: "forest-glass", concept: "A quiet forest app.", base: "clover" } });
        const published = await client.callTool({ name: "publish_system", arguments: {} });

        expect(published.isError).toBe(true);
        expect(textOf(published)).toContain("Publishing is not open on the hosted server yet.");
    });
});

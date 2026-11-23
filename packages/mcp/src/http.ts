import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Effect, type Layer, ManagedRuntime } from "effect";

import { createServer, type ServerOptions, type Session } from "./server";
import { SessionStore } from "./sessions";
import type { SystemStore } from "./store";

/**
 * tyohnn's MCP server over Streamable HTTP, for a route handler (the site's /api/mcp). It takes a web Request and
 * returns a web Response, so it runs wherever fetch-style handlers run.
 *
 * A serverless function keeps nothing between requests, so every request gets a fresh server and transport
 * (the SDK's stateless mode). What a connection is shaping still lasts across its calls: `initialize` hands out a
 * session id in `Mcp-Session-Id`, the client sends it back on every request, and the system being shaped is kept in
 * `sessions` under that id (a SessionStore, sessions.ts), loaded before the request and saved after it.
 *
 * An id the store does not know is answered with 404, the spec's way of telling a client to start a new session.
 *
 * Both stores come in as one Layer. The handler builds it once into a runtime that every request runs on, so a store
 * that holds state (sessions in memory, a database pool) is shared by all of them.
 */

export interface HttpOptions extends Omit<ServerOptions, "session" | "onSession" | "canWrite" | "canReplace" | "run">
{
    /** Where published systems and sessions are kept */
    layer: Layer.Layer<SystemStore | SessionStore>;
    /** A new session id (default: a random UUID) */
    newId?: () => string;
}

const SESSION_HEADER = "mcp-session-id";

const jsonError = (status: number, code: number, message: string) =>
    new Response(JSON.stringify({ jsonrpc: "2.0", error: { code, message }, id: null }), { status, headers: { "content-type": "application/json" } });

/** True when a JSON-RPC body (one message or a batch) holds an initialize request */
const isInitialize = (body: unknown) =>
    (Array.isArray(body) ? body : [body]).some((message) => typeof message === "object" && message !== null && (message as { method?: unknown }).method === "initialize");

/** The body as JSON, or nothing when it is not JSON */
const readJson = (request: Request) =>
    Effect.promise(() => request.json().then((value: unknown) => ({ value }), () => undefined));

export const createHttpHandler = (options: HttpOptions) =>
{
    const { layer, newId = () => crypto.randomUUID(), ...serverOptions } = options;
    const runtime = ManagedRuntime.make(layer);

    const answer = (request: Request) => Effect.gen(function*()
    {
        const sessions = yield* SessionStore;
        const id = request.headers.get(SESSION_HEADER);

        if (request.method === "DELETE")
        {
            if (id) yield* sessions.delete(id);

            return new Response(null, { status: id ? 200 : 400 });
        }

        // No server-to-client stream: every answer comes back on the POST that asked for it
        if (request.method !== "POST") return jsonError(405, -32000, "Method not allowed: this server answers POST only.");

        const parsed = yield* readJson(request);

        if (!parsed) return jsonError(400, -32700, "Parse error: the body is not JSON.");

        const body = parsed.value;
        const starting = isInitialize(body);
        const sessionId = starting ? newId() : id;

        if (!sessionId) return jsonError(400, -32000, "Bad request: send the Mcp-Session-Id that initialize returned.");

        const session = starting ? undefined : yield* sessions.get(sessionId);

        if (!starting && !session) return jsonError(404, -32001, "Session not found: initialize a new session.");

        let shaped: Session | undefined;

        return yield* Effect.acquireUseRelease(
            Effect.promise(async () =>
            {
                // canWrite stays off: a hosted server has no folder of the person's to write into. canReplace too: it
                // knows nobody, so it cannot tell whether the one publishing over a system is the one who published it
                const server = createServer({
                    ...serverOptions,
                    run: (effect) => runtime.runPromise(effect),
                    session,
                    onSession: (created) => { shaped = created; },
                    canWrite: false,
                    canReplace: false,
                });
                const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });

                await server.connect(transport);

                return { server, transport };
            }),
            ({ transport }) => Effect.gen(function*()
            {
                const response = yield* Effect.promise(() => transport.handleRequest(request, { parsedBody: body }));
                const headers = new Headers(response.headers);

                headers.set("Mcp-Session-Id", sessionId);

                if (shaped) yield* sessions.set(sessionId, shaped);

                return new Response(response.body, { status: response.status, headers });
            }),
            ({ server }) => Effect.promise(() => server.close()),
        );
    });

    return (request: Request): Promise<Response> =>
        runtime.runPromise(answer(request).pipe(
            Effect.catchTag("SessionStoreError", (failed) => Effect.succeed(jsonError(503, -32603, `Sessions are not available right now: ${failed.message}`))),
        ));
};

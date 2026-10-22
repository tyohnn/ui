import { readFileSync } from "node:fs";
import { join } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { allPrimitives, type Catalog, type Primitive, readCatalog, searchPrimitives } from "./catalog";

/**
 * The tools a coding agent calls. Three for the primitives:
 *
 * - `list_primitives` — the catalog, grouped, with each one's purpose; filter by group or words
 * - `get_primitive` — one primitive's source, exports, what it imports, and its preview link
 * - `show_primitives` — the same catalog as cards, each drawing the primitive in a design system
 *   (an MCP Apps view; a host without views gets the links as text)
 *
 * The cards are the site's coverage sections (apps/preview `?template=coverage&section=<name>`), framed from
 * `previewBase`, so the plugin draws exactly what the site and the snapshot checks draw.
 */

export const WIDGET_URI = "ui://tyohnn/primitives.html";

const MCP_APP_MIME = "text/html;profile=mcp-app";

export interface ServerOptions
{
    /** The repository root: registry/ and apps/preview are read from here */
    root: string;
    /** Where the built previews are served: `<base>/<system>/index.html?template=coverage…` */
    previewBase: string;
    /** The view's HTML; read from dist/widget.html by default */
    widgetHtml?: string;
}

export const previewUrl = (base: string, system: string, mode: string, section: string) =>
    `${base.replace(/\/$/, "")}/${system}/index.html?template=coverage&mode=${mode}&section=${section}`;

const line = (primitive: Primitive) => `- ${primitive.name}: ${primitive.description}`;

const listText = (catalog: Catalog, primitives: Primitive[]) =>
    catalog.groups
        .map((group) => ({ group, items: primitives.filter((primitive) => primitive.group === group.id) }))
        .filter(({ items }) => items.length > 0)
        .map(({ group, items }) => [`## ${group.label}`, ...items.map(line)].join("\n"))
        .join("\n\n");

export const createServer = (options: ServerOptions) =>
{
    const catalog = readCatalog(options.root);
    const primitives = allPrimitives(catalog);
    const names = primitives.map((primitive) => primitive.name) as [string, ...string[]];
    const groupIds = catalog.groups.map((group) => group.id) as [string, ...string[]];
    const systemNames = catalog.systems.map((system) => system.name) as [string, ...string[]];
    const html = options.widgetHtml ?? readFileSync(new URL("./widget.html", import.meta.url), "utf8");
    const frameOrigin = new URL(options.previewBase).origin;

    const server = new McpServer({ name: "tyohnn", version: "0.0.0" });

    server.registerTool(
        "list_primitives",
        {
            title: "List tyohnn primitives",
            description: "Lists tyohnn's primitive components (shadcn on Base UI, styled only by the design system's tokens) grouped as Basics, Forms, Display, Data, Overlays, Menus and Chat, each with what it is for. Filter by group or by words (e.g. \"pick from a long list\").",
            inputSchema: {
                group: z.enum(groupIds).optional().describe("Only this group"),
                query: z.string().optional().describe("Words to match in the name, purpose and exported names"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ group, query }) =>
        {
            let found = query ? searchPrimitives(catalog, query) : primitives;

            if (group) found = found.filter((primitive) => primitive.group === group);

            const text = found.length > 0 ? listText(catalog, found) : `No primitive matches${query ? ` “${query}”` : ""}.`;

            return {
                content: [{ type: "text", text }],
                structuredContent: { primitives: found.map(({ name, group: id, description, sections }) => ({ name, group: id, description, sections })) },
            };
        },
    );

    server.registerTool(
        "get_primitive",
        {
            title: "Get a tyohnn primitive",
            description: "Returns one primitive's source (TSX), the names it exports, the other primitives and npm packages it imports, and a preview link. The TSX holds no visual values: colours, sizes, radii and shadows come from the design system's CSS.",
            inputSchema: {
                name: z.enum(names).describe("The primitive, e.g. combobox"),
                system: z.enum(systemNames).optional().describe("Design system for the preview link (default graphite)"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ name, system }) =>
        {
            const primitive = primitives.find((entry) => entry.name === name) as Primitive;
            const chosen = catalog.systems.find((entry) => entry.name === (system ?? "graphite")) ?? catalog.systems[0];
            const source = readFileSync(join(options.root, primitive.file), "utf8");
            const preview = previewUrl(options.previewBase, chosen.name, chosen.defaultMode, primitive.sections[0]);

            const text = [
                `# ${primitive.name}`,
                primitive.description,
                "",
                `Exports: ${primitive.exports.join(", ")}`,
                `Uses primitives: ${primitive.uses.length > 0 ? primitive.uses.join(", ") : "none"}`,
                `npm packages: ${primitive.packages.join(", ") || "none"}`,
                `Preview (${chosen.name}, ${chosen.defaultMode}): ${preview}`,
                "",
                "In a project set up with `npx tyohnn init`, every primitive is already copied; import it from the components folder the CLI created. Pass no colours or sizes through className: the system's tokens decide them.",
                "",
                "```tsx",
                source.trimEnd(),
                "```",
            ].join("\n");

            return {
                content: [{ type: "text", text }],
                structuredContent: { ...primitive, preview },
            };
        },
    );

    server.registerTool(
        "show_primitives",
        {
            title: "Show tyohnn primitives",
            description: "Shows the primitives as cards, each drawn live in a design system with its variants, sizes and states. The person can switch the system and light/dark in the view. Use it when the person wants to see or compare components.",
            inputSchema: {
                system: z.enum(systemNames).optional().describe("Design system to draw them in (default graphite)"),
                mode: z.enum(["light", "dark"]).optional().describe("Colour mode (default: the system's)"),
                group: z.enum(groupIds).optional().describe("Only this group"),
                names: z.array(z.enum(names)).optional().describe("Only these primitives"),
            },
            annotations: { readOnlyHint: true },
            _meta: { ui: { resourceUri: WIDGET_URI }, "ui/resourceUri": WIDGET_URI },
        },
        async ({ system, mode, group, names: only }) =>
        {
            const chosen = catalog.systems.find((entry) => entry.name === (system ?? "graphite")) ?? catalog.systems[0];
            const chosenMode = mode ?? chosen.defaultMode;
            let shown = primitives;

            if (group) shown = shown.filter((primitive) => primitive.group === group);
            if (only && only.length > 0) shown = shown.filter((primitive) => only.includes(primitive.name));

            const text = [
                `${shown.length} primitives in ${chosen.name} (${chosenMode}).`,
                ...shown.map((primitive) => `- ${primitive.name}: ${previewUrl(options.previewBase, chosen.name, chosenMode, primitive.sections[0])}`),
            ].join("\n");

            return {
                content: [{ type: "text", text }],
                structuredContent: {
                    system: chosen.name,
                    mode: chosenMode,
                    previewBase: options.previewBase,
                    systems: catalog.systems,
                    groups: catalog.groups
                        .map((entry) => ({
                            id: entry.id,
                            label: entry.label,
                            primitives: entry.primitives
                                .filter((primitive) => shown.includes(primitive))
                                .map(({ name, description, sections }) => ({ name, description, sections })),
                        }))
                        .filter((entry) => entry.primitives.length > 0),
                },
            };
        },
    );

    server.registerResource(
        "primitives-view",
        WIDGET_URI,
        {
            title: "tyohnn primitives",
            description: "Cards that draw each primitive in a chosen design system",
            mimeType: MCP_APP_MIME,
        },
        async () => ({
            contents: [{
                uri: WIDGET_URI,
                mimeType: MCP_APP_MIME,
                text: html,
                _meta: { ui: { csp: { frameDomains: [frameOrigin] }, prefersBorder: false } },
            }],
        }),
    );

    return server;
};

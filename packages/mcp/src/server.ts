import { readFileSync } from "node:fs";
import { join } from "node:path";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { allPrimitives, type Catalog, type Primitive, readCatalog, searchPrimitives } from "./catalog";
import { checkSystem, findingsText } from "./check";
import { type Draft, exportSystem, importLines, writeSystem } from "./export";
import { cardText, readSystemCards, searchSystems } from "./library";
import { folderStore, NAME, publishSystem, type SystemStore } from "./store";
import { AXES, colourChanges, coloursOf, COLOUR_GROUPS, describe, previewVars, readTailwind, readThemes, SCREENS, setColours, setTokens, startState, swatches, type Outcome, type SystemState } from "./system";

/**
 * The tools a coding agent calls. Three for the primitives:
 *
 * - `list_primitives` — the catalog, grouped, with each one's purpose; filter by group or words
 * - `get_primitive` — one primitive's source, exports, what it imports, and its preview link
 * - `show_primitives` — the same catalog as cards, each drawing the primitive in a design system
 *   (an MCP Apps view; a host without views gets the links as text)
 *
 * And four for shaping a design system, all drawn by one view (the System view) that the person edits too:
 *
 * - `show_system` — opens the view on a system (or on the one being shaped)
 * - `set_colours` — palette · accent · chart picks, and single colours by hand, per mode
 * - `set_tokens` — any other token the system declares: density, depth, texture, typography, layout
 * - `get_system` — what has changed so far, the person's edits in the view included
 *
 * And the life of a system around that: explore what exists, draft one from a concept, check it, keep it, use it.
 *
 * - `search_systems` · `read_system` — the base systems (and published ones) with the concept behind each
 * - `draft_system` — names the system being shaped and records its concept, starting from a base or a published one
 * - `check_system` — contrast, and changes that reach less than they should
 * - `publish_system` — keeps the draft in the store under its name, for others to find and start from
 * - `export_system` — the files an app keeps (styles folder, tyohnn.json, concept.md), written to a folder when the
 *   server runs on the person's machine
 *
 * None of these runs, names or depends on the tyohnn CLI. The plugin and the CLI are separate products.
 *
 * The cards are the site's coverage sections (apps/preview `?template=coverage&section=<name>`), framed from
 * `previewBase`, so the plugin draws exactly what the site and the snapshot checks draw.
 */

export const WIDGET_URI = "ui://tyohnn/primitives.html";
export const SYSTEM_URI = "ui://tyohnn/system.html";

/** Fonts the views load (the site's own: Bricolage Grotesque, Geist, Geist Mono) */
const FONT_DOMAINS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

const MCP_APP_MIME = "text/html;profile=mcp-app";

export interface ServerOptions
{
    /** The repository root: registry/ and apps/preview are read from here */
    root: string;
    /** Where the built previews are served: `<base>/<system>/index.html?template=coverage…` */
    previewBase: string;
    /** The views' HTML: dist/widget.html and dist/system.html, read by the entry point (index.ts, or the site's route) */
    widgetHtml: string;
    systemHtml: string;
    /** Where published systems are kept (default: a folder under `<root>/.tyohnn/published`) */
    store?: SystemStore;
    /** export_system may write to a folder: true only when the server runs on the person's machine (stdio) */
    canWrite?: boolean;
    /**
     * publish_system may publish over a system already published (default true). The hosted server knows nobody, so
     * there it is false: anyone could otherwise overwrite anyone's system.
     */
    canReplace?: boolean;
    /** The system being shaped, carried in from an earlier request of the same session (the HTTP server) */
    session?: Session;
    /** Called once with the session this server shapes, so the HTTP server can save it after the request */
    onSession?: (session: Session) => void;
}

/** What one connection is shaping: the system's state, and its name and concept once draft_system gave them */
export interface Session
{
    state: SystemState;
    draft?: Draft;
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
    const html = options.widgetHtml;
    const systemHtml = options.systemHtml;
    const frameOrigin = new URL(options.previewBase).origin;
    const library = readThemes(options.root);
    const tailwind = readTailwind(options.root);
    const summaryOf = (name: string) => catalog.systems.find((entry) => entry.name === name) ?? catalog.systems[0];

    const cards = readSystemCards(options.root);
    const store = options.store ?? folderStore(join(options.root, ".tyohnn/published"));
    const reserved = new Set<string>(systemNames);
    const characterOf = (name: string) => cards.find((card) => card.name === name)?.character ?? "";

    // One system is shaped at a time, per connection: the agent and the view both edit it. The HTTP server keeps
    // this object between requests of one session (http.ts); over stdio it lives as long as the process.
    const session: Session = options.session ?? { state: startState(summaryOf("clover"), library) };

    options.onSession?.(session);

    /** A result the System view draws: the state for the agent, the view's look-up tables in _meta only */
    const systemResult = (note?: string) =>
    {
        const colours = coloursOf(session.state, library);
        const text = [note, describe(session.state, library)].filter(Boolean).join("\n\n");

        return {
            content: [{ type: "text" as const, text }],
            structuredContent: { ...session.state, changes: colourChanges(session.state, session.state.system) + Object.keys(session.state.tokens).length },
            _meta: {
                "tyohnn/view": {
                    previewBase: options.previewBase,
                    systems: catalog.systems,
                    screens: SCREENS,
                    axes: AXES,
                    colourGroups: COLOUR_GROUPS,
                    colours,
                    vars: previewVars(session.state, library),
                    swatches: swatches(library, session.state.mode),
                    tailwind,
                },
            },
        };
    };

    const refuse = (error: string) => ({ content: [{ type: "text" as const, text: error }], isError: true });
    const commit = (outcome: Outcome, note: string) =>
    {
        if ("error" in outcome) return refuse(outcome.error);
        session.state = outcome.state;

        return systemResult(note);
    };
    const systemView = { ui: { resourceUri: SYSTEM_URI }, "ui/resourceUri": SYSTEM_URI };

    const server = new McpServer({ name: "tyohnn", version: "0.0.0" });

    server.registerTool(
        "list_primitives",
        {
            title: "List tyohnn primitives",
            description: "Lists tyohnn's primitive components (shadcn on UI SDK, styled only by the design system's tokens) grouped as Basics, Forms, Display, Data, Overlays, Menus and Chat, each with what it is for. Filter by group or by words (e.g. \"pick from a long list\").",
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
                "Copy it into the app's components folder as it is, with the primitives it uses. Pass no colours or sizes through className: the system's tokens decide them. For a component tyohnn has no primitive for, build it on UI SDK and give its parts `data-role` (control, field, surface, popup, item, indicator, label, meta, separator, track) so every system dresses it.",
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

    server.registerTool(
        "show_system",
        {
            title: "Show a tyohnn design system",
            description: "Opens the System view: a design system drawn on a real screen (CRM, analytics, orders …) beside every token that shapes it — colour, density, depth, texture, typography, layout. The person can change values there and you can change them with set_colours and set_tokens; both edit the same system. Give `system` to start over on another one; leave it out to show the one being shaped.",
            inputSchema: {
                system: z.enum(systemNames).optional().describe("Start over on this design system (its own palette, nothing changed)"),
                mode: z.enum(["light", "dark"]).optional().describe("Colour mode to show (default: the system's)"),
            },
            _meta: systemView,
        },
        async ({ system, mode }) =>
        {
            if (system) session.state = startState(summaryOf(system), library);
            if (mode) session.state = { ...session.state, mode };

            return systemResult(system ? `Showing ${system}.` : undefined);
        },
    );

    server.registerTool(
        "set_colours",
        {
            title: "Set the system's colours",
            description: "Changes the colours of the system being shaped, the way tyohnn's Create page does: a palette (a system's own palette or a shadcn base like stone or zinc), an accent laid over it (moves primary, secondary, sidebar-primary and the charts), a chart ramp of its own, then any of the 72 colour names set by hand per mode. Pass null to clear an accent, a chart ramp or a hand-set colour.",
            inputSchema: {
                palette: z.string().optional().describe("A palette id, e.g. clover, graphite, stone, zinc"),
                accent: z.string().nullable().optional().describe("An accent id (amber, blue, cyan, emerald, … violet, yellow), or null for none"),
                chart: z.string().nullable().optional().describe("An accent id whose five chart colours to use, or null for the palette's"),
                light: z.record(z.string(), z.string().nullable()).optional().describe("Colour names to set in light mode, e.g. { \"chart-1\": \"#f43f5e\" }; null clears one"),
                dark: z.record(z.string(), z.string().nullable()).optional().describe("The same for dark mode"),
            },
            _meta: systemView,
        },
        async (input) => commit(setColours(session.state, input, library), "Colours changed."),
    );

    server.registerTool(
        "set_tokens",
        {
            title: "Set the system's tokens",
            description: "Changes any token the system declares other than colours: density (--control-height-md, --table-row-height …), depth (--surface-shadow, --shadow-control …), texture (--control-radius, --surface-radius …), typography (--font-sans …) and layout (--page-gutter-md, --sidebar-width …). A token with a slider in the view keeps to its unit and range. Pass null to put a token back to the system's value.",
            inputSchema: {
                tokens: z.record(z.string(), z.string().nullable()).describe("Token → value, e.g. { \"--table-row-height\": \"32px\", \"--surface-shadow\": \"none\" }"),
            },
            _meta: systemView,
        },
        async ({ tokens }) => commit(setTokens(session.state, tokens, library), "Tokens changed."),
    );

    server.registerTool(
        "get_system",
        {
            title: "Get the system being shaped",
            description: "Returns the system being shaped and everything changed in it so far, including what the person changed in the System view.",
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        async () =>
        {
            const { content, structuredContent } = systemResult();

            return { content, structuredContent };
        },
    );

    server.registerTool(
        "search_systems",
        {
            title: "Search tyohnn design systems",
            description: "Finds design systems to start from or learn from: tyohnn's systems first, then systems people published. Each comes with what it is (mode, tags, fonts, icons) and, with read_system, the concept behind every axis. Describe what you are after in words (e.g. \"dense dark dashboard\", \"soft warm paper\").",
            inputSchema: {
                query: z.string().optional().describe("Words describing the feel or use"),
                tag: z.string().optional().describe("Only systems with this tag, e.g. dark, dense, dashboard"),
                mode: z.enum(["light", "dark"]).optional().describe("Only systems whose default mode is this"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ query, tag, mode }) =>
        {
            const found = searchSystems(cards, query, { tag, mode });
            const published = (await store.list()).filter((entry) => !query || `${entry.id} ${entry.draft.concept}`.toLowerCase().includes(query.toLowerCase()));
            const text = [
                found.length > 0 ? found.map(cardText).join("\n\n") : `No base system matches${query ? ` “${query}”` : ""}.`,
                published.length > 0 ? `## Published\n${published.map((entry) => `- ${entry.id} (from ${entry.state.system}): ${entry.draft.concept.split("\n")[0]}`).join("\n")}` : "",
            ].filter(Boolean).join("\n\n");

            return {
                content: [{ type: "text", text }],
                structuredContent: {
                    systems: found.map(({ character: _character, doNot: _doNot, ...card }) => card),
                    published: published.map((entry) => ({ id: entry.id, base: entry.state.system, concept: entry.draft.concept, publishedAt: entry.publishedAt })),
                },
            };
        },
    );

    server.registerTool(
        "read_system",
        {
            title: "Read a tyohnn design system",
            description: "Returns one system's concept: what it chose on each axis (colour, density, depth, texture, typography) and why, what would break it, its fonts and icons. For a published system, its concept and every change over its base. Read it before starting from a system or explaining one.",
            inputSchema: {
                name: z.string().describe("A base system (e.g. graphite) or a published system's id"),
            },
            annotations: { readOnlyHint: true },
        },
        async ({ name }) =>
        {
            const card = cards.find((entry) => entry.name === name);

            if (card)
            {
                const text = [cardText(card), card.source ? `Made from: ${card.source}` : "", "### Character", card.character || "(none written)", card.doNot ? `### Do not\n${card.doNot}` : ""].filter(Boolean).join("\n\n");

                return { content: [{ type: "text", text }], structuredContent: { ...card } };
            }

            const published = await store.get(name);

            if (!published) return refuse(`No system “${name}”. search_systems lists them.`);

            const changes = describe(published.state, library);

            return {
                content: [{ type: "text", text: [`## ${published.id} (published ${published.publishedAt.slice(0, 10)}, from ${published.state.system})`, published.draft.concept, "### Changes over the base", changes].join("\n\n") }],
                structuredContent: { ...published },
            };
        },
    );

    server.registerTool(
        "draft_system",
        {
            title: "Draft a design system",
            description: "Starts a new design system from a concept: names it, records the concept, and opens it in the System view on a base system (or on a published one, to fork it). Write the concept as what the person asked for in their words, then one line per axis saying how it answers: colour, density, depth, texture, typography. Then shape it with set_colours and set_tokens, check it with check_system, and keep it with publish_system or export_system.",
            inputSchema: {
                name: z.string().regex(NAME).describe("The new system's name: lower-case, digits and hyphens, e.g. forest-glass"),
                concept: z.string().min(1).describe("What the person asked for and how each axis answers it"),
                base: z.string().describe("The system to start from: a base system (search_systems) or a published id"),
                mode: z.enum(["light", "dark"]).optional().describe("Colour mode to show first"),
                keep: z.boolean().optional().describe("Keep the changes made so far and only rename or rewrite the concept (base is then ignored)"),
            },
            _meta: systemView,
        },
        async ({ name, concept, base, mode, keep }) =>
        {
            if (catalog.systems.some((entry) => entry.name === name)) return refuse(`“${name}” is a base system's name. Pick another.`);

            if (keep)
            {
                // the system being shaped stays as it is
            }
            else if (systemNames.includes(base))
            {
                session.state = startState(summaryOf(base), library);
            }
            else
            {
                const published = await store.get(base);

                if (!published) return refuse(`No system “${base}” to start from. search_systems lists them.`);
                session.state = structuredClone(published.state);
            }

            if (mode) session.state = { ...session.state, mode };
            session.draft = { name, concept };

            return systemResult(keep ? `Drafting ${name}, keeping the changes so far.` : `Drafting ${name} on ${base}.`);
        },
    );

    server.registerTool(
        "check_system",
        {
            title: "Check the system being shaped",
            description: "Checks the system being shaped: palette pairs below WCAG AA in either mode, tokens set on one component's slot where the shared token would carry the change to every component (new ones included), and a missing name or concept. Run it before publish_system or export_system and fix what it finds.",
            inputSchema: {},
            annotations: { readOnlyHint: true },
        },
        async () =>
        {
            const findings = checkSystem({ root: options.root, state: session.state, library, draft: session.draft });

            return { content: [{ type: "text", text: findingsText(findings) }], structuredContent: { findings } };
        },
    );

    server.registerTool(
        "publish_system",
        {
            title: "Publish the system being shaped",
            description: "Keeps the drafted system in tyohnn's store under its name, with its concept and its changes over the base, so it shows up in search_systems and anyone can start from it with draft_system. Ask the person first: publishing shares the system.",
            inputSchema: {
                replace: z.boolean().optional().describe("Publish over a system already published under this name"),
            },
        },
        async ({ replace }) =>
        {
            if (!session.draft) return refuse("Nothing drafted yet: call draft_system with a name and the concept first.");

            const blocking = checkSystem({ root: options.root, state: session.state, library, draft: session.draft }).filter((finding) => finding.level === "error");

            if (blocking.length > 0) return refuse(`Fix these first:\n${findingsText(blocking)}`);

            if (replace && options.canReplace === false) return refuse("This server cannot publish over a published system: it does not know who published it. Publish under a new name.");

            const published = await publishSystem(store, { draft: session.draft, state: session.state }, { replace, reserved });

            if ("error" in published) return refuse(published.error);

            return { content: [{ type: "text", text: `Published ${published.id} (from ${session.state.system}).` }], structuredContent: { ...published } };
        },
    );

    server.registerTool(
        "export_system",
        {
            title: "Export a design system's files",
            description: "Returns the files an app keeps for a system: its styles folder (the base's CSS with this system's colour and token changes written in), tyohnn.json (where it came from) and concept.md (what it is for), plus the import lines for the app's CSS entry. With `dir`, writes them there (only when this server runs on the person's machine). Without a name, exports the system being shaped.",
            inputSchema: {
                name: z.string().optional().describe("A base system or a published id; default the system being shaped"),
                dir: z.string().optional().describe("Absolute folder to write the system into, e.g. /app/src/styles/tyohnn"),
                stylesDir: z.string().optional().describe("How the app's CSS entry reaches the styles folder (default ./tyohnn/styles)"),
            },
        },
        async ({ name, dir, stylesDir }) =>
        {
            let target = session.state;
            let targetDraft = session.draft ?? { name: session.state.system, concept: characterOf(session.state.system) };

            if (name && systemNames.includes(name))
            {
                target = startState(summaryOf(name), library);
                targetDraft = { name, concept: characterOf(name) };
            }
            else if (name)
            {
                const published = await store.get(name);

                if (!published) return refuse(`No system “${name}”. search_systems lists them.`);
                target = published.state;
                targetDraft = published.draft;
            }

            const styles = stylesDir ?? "./tyohnn/styles";
            const files = exportSystem({ root: options.root, state: target, library, base: summaryOf(target.system), draft: targetDraft, baseCharacter: characterOf(target.system), stylesDir: styles });
            const imports = importLines(styles);

            if (dir)
            {
                if (!options.canWrite) return refuse("This server cannot write to your disk. Call export_system without dir and write the files yourself.");
                if (!/^(\/|[A-Za-z]:[\\/])/.test(dir)) return refuse("dir must be an absolute path.");

                const written = writeSystem(dir, files);

                return {
                    content: [{ type: "text", text: [`Wrote ${written.length} files for ${targetDraft.name} into ${dir}.`, "Add these lines to the app's CSS entry, after `@import \"tailwindcss\";`:", ...imports].join("\n") }],
                    structuredContent: { system: targetDraft.name, dir, written, imports },
                };
            }

            const small = files.filter((file) => !file.path.startsWith("styles/components/"));

            return {
                content: [{ type: "text", text: [`${files.length} files for ${targetDraft.name}. The component rules (styles/components/*) are in structuredContent; the rest:`, ...small.map((file) => `--- ${file.path}\n${file.content}`), "Import lines for the app's CSS entry:", ...imports].join("\n\n") }],
                structuredContent: { system: targetDraft.name, files, imports },
            };
        },
    );

    server.registerResource(
        "system-view",
        SYSTEM_URI,
        {
            title: "tyohnn system",
            description: "A design system on a real screen, with every token that shapes it",
            mimeType: MCP_APP_MIME,
        },
        async () => ({
            contents: [{
                uri: SYSTEM_URI,
                mimeType: MCP_APP_MIME,
                text: systemHtml,
                _meta: { ui: { csp: { frameDomains: [frameOrigin], resourceDomains: FONT_DOMAINS }, prefersBorder: false } },
            }],
        }),
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

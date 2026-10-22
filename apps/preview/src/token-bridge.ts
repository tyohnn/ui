/**
 * Lets a frame on another origin (the plugin's System view, packages/mcp) try token values on this page. It cannot
 * reach into the document, so it posts what it wants:
 *
 * - `{ type: "tyohnn:set-tokens", tokens: { "--primary": "…", "--table-row-height": null } }` sets (or with null
 *   clears) custom properties on the root, over the system's own values;
 * - `{ type: "tyohnn:read-tokens", id, names: ["--card-shadow", …] }` answers `{ type: "tyohnn:tokens", id, values }`
 *   with what each name computes to now, so the view's controls start from the system's values.
 *
 * Only custom property names are touched, and a value is any string CSS would take: the page is a public preview
 * and holds nothing a value could reach.
 */

const CUSTOM_PROPERTY = /^--[a-z0-9-]+$/i;

interface SetTokens
{
    type: "tyohnn:set-tokens";
    tokens: Record<string, string | null>;
}

interface ReadTokens
{
    type: "tyohnn:read-tokens";
    id: string;
    names: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const listenForTokens = () =>
{
    const root = document.documentElement;

    window.addEventListener("message", (event) =>
    {
        const message: unknown = event.data;

        if (!isRecord(message)) return;

        if (message.type === "tyohnn:set-tokens" && isRecord(message.tokens))
        {
            for (const [name, value] of Object.entries((message as unknown as SetTokens).tokens))
            {
                if (!CUSTOM_PROPERTY.test(name)) continue;
                if (value === null) root.style.removeProperty(name);
                else if (typeof value === "string") root.style.setProperty(name, value);
            }
        }

        if (message.type === "tyohnn:read-tokens" && Array.isArray(message.names) && typeof message.id === "string")
        {
            const { id, names } = message as unknown as ReadTokens;
            const style = getComputedStyle(root);
            const values = Object.fromEntries(names.filter((name) => CUSTOM_PROPERTY.test(name)).map((name) => [name, style.getPropertyValue(name).trim()]));

            (event.source as Window | null)?.postMessage({ type: "tyohnn:tokens", id, values }, { targetOrigin: "*" });
        }
    });
};

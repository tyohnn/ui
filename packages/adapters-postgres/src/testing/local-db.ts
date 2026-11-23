/**
 * The gate in front of the tests that touch a database.
 *
 * - No connection string fails the tests instead of skipping them: a suite that turns green by skipping is no suite.
 * - A host that is not local is refused. The tests write rows, and must never write them into a real project.
 */
const LOCAL = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

const hostOf = (value: string): string =>
{
    try
    {
        return new URL(value).hostname;
    }
    catch
    {
        return "";
    }
};

export type LocalDb = { readonly ok: true; readonly url: string } | { readonly ok: false; readonly reason: string };

export const localDb = (envName: string): LocalDb =>
{
    const url = process.env[envName];

    if (!url) return { ok: false, reason: `${envName} is not set. These tests run against the local Supabase stack and never skip: run \`npx supabase start\` and try again.` };
    if (!LOCAL.has(hostOf(url))) return { ok: false, reason: `${envName} points at ${hostOf(url) || "something that is not a URL"}, not the local stack. These tests write rows, so they run locally only.` };

    return { ok: true, url };
};

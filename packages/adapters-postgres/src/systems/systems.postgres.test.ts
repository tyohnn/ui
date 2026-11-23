import { afterAll, describe, expect, it } from "vitest";
import { Pool } from "pg";

import { CONTRACT_IDS, sessionStoreContract, systemStoreContract } from "@tyohnn/mcp/testing/contracts";

import { closePostgresPools, poolExecutor, postgresPool } from "../connection";
import { localDb } from "../testing/local-db";

import { sessionStorePostgres } from "./sessionStorePostgres";
import { systemStorePostgres } from "./systemStorePostgres";

/**
 * The store contracts on Postgres, connected as the site's role `site_app`, plus what the tables themselves refuse.
 *
 * The owner role is background only: it clears the contract's published rows, which `site_app` may not delete, and
 * tries writes the code would never send to show the constraints hold on their own.
 */
const db = localDb("SITE_DATABASE_URL");

afterAll(async () =>
{
    await closePostgresPools();
});

if (!db.ok)
{
    describe("the systems schema (postgres)", () =>
    {
        throw new Error(db.reason);
    });
}
else
{
    const sql = poolExecutor(postgresPool(db.url));
    const owner = new Pool({ connectionString: process.env.OWNER_DATABASE_URL, max: 1 });
    const refusal = (pool: Pool, statement: string, params: unknown[] = []) =>
        pool.query(statement, params).then(() => "allowed", (cause: unknown) => String(cause));

    afterAll(async () =>
    {
        await owner.query("delete from systems.published where id = any($1::text[])", [[...CONTRACT_IDS, "owner-wrote"]]);
        await owner.end();
    });

    systemStoreContract("postgres · site_app", async () =>
    {
        await owner.query("delete from systems.published where id = any($1::text[])", [[...CONTRACT_IDS]]);

        return systemStorePostgres(sql);
    });

    sessionStoreContract("postgres · site_app", async (ttlMs) => sessionStorePostgres(sql, ttlMs));

    describe("what the systems tables refuse (postgres)", () =>
    {
        const state = JSON.stringify({ system: "clover", mode: "light", palette: "clover", accent: null, chart: null, colours: { light: {}, dark: {} }, tokens: {} });
        const insert = "insert into systems.published (id, draft, state, published_at) values ($1, $2::jsonb, $3::jsonb, now())";

        it("keeps out a name the code would refuse, even from the owner", async () =>
        {
            expect(await refusal(owner, insert, ["../escape", JSON.stringify({ name: "../escape", concept: "a" }), state])).toContain("published_id_check");
        });

        it("keeps a system under its own name only", async () =>
        {
            expect(await refusal(owner, insert, ["owner-wrote", JSON.stringify({ name: "something-else", concept: "a" }), state])).toContain("published_name_check");
        });

        it("refuses a published system far larger than any real one", async () =>
        {
            const concept = "x".repeat(20_000);

            expect(await refusal(owner, insert, ["owner-wrote", JSON.stringify({ name: "owner-wrote", concept }), state])).toContain("published_draft_size_check");
        });

        it("does not let site_app delete a published system or change its id", async () =>
        {
            const site = new Pool({ connectionString: db.url, max: 1 });
            const refusals = await Promise.all([
                refusal(site, "delete from systems.published where false"),
                refusal(site, "update systems.published set id = id where false"),
            ]);

            await site.end();

            for (const answer of refusals) expect(answer).toContain("permission denied");
        });

        it("gives site_app nothing outside the systems schema", async () =>
        {
            const site = new Pool({ connectionString: db.url, max: 1 });
            const read = await refusal(site, "select count(*) from auth.users");

            await site.end();

            expect(read).toContain("permission denied");
        });

        it("sweeps expired sessions on the next save", async () =>
        {
            const short = sessionStorePostgres(sql, 50);
            const expired = crypto.randomUUID();

            await short.set(expired, { state: JSON.parse(state) });
            await new Promise((resolve) => setTimeout(resolve, 150));
            await short.set(crypto.randomUUID(), { state: JSON.parse(state) });

            expect((await owner.query("select 1 from systems.session where id = $1", [expired])).rowCount).toBe(0);
        });
    });
}

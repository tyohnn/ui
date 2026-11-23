import { describe, expect, it, vi } from "vitest";

import { normalizeConnectionString } from "./connection";

describe("the connection string the site connects with", () =>
{
    it("leaves the local stack's alone: it has no TLS", () =>
    {
        expect(normalizeConnectionString("postgresql://site_app:postgres@127.0.0.1:54822/postgres")).toBe("postgresql://site_app:postgres@127.0.0.1:54822/postgres");
    });

    it("refuses a remote one without sslmode, or with sslmode=disable: the pooler would accept plaintext", () =>
    {
        expect(() => normalizeConnectionString("postgresql://u:p@pooler.example.com:6543/postgres")).toThrow(/sslmode/);
        expect(() => normalizeConnectionString("postgresql://u:p@pooler.example.com:6543/postgres?sslmode=disable")).toThrow(/sslmode/);
    });

    it("gives sslmode=require libpq's meaning, which the pooler's certificate chain passes", () =>
    {
        vi.spyOn(console, "warn").mockImplementation(() => undefined);

        expect(new URL(normalizeConnectionString("postgresql://u:p@pooler.example.com:6543/postgres?sslmode=require")).searchParams.get("uselibpqcompat")).toBe("true");
    });

    it("refuses something that is not a URL", () =>
    {
        expect(() => normalizeConnectionString("not a url")).toThrow(/not a URL/);
    });
});

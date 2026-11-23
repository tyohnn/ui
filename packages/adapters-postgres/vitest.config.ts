import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * The local stack's connection strings (supabase/config.toml: DB on 54822; passwords from supabase/seed.sql, the
 * local stack's own and as public as postgres:postgres).
 *
 * These defaults do not soften the tests: with no stack running the connection is refused and the tests fail, and
 * local-db.ts still refuses anything but a local host. There is no path that skips.
 */
const localUrl = (role: string) => `postgresql://${role}:postgres@127.0.0.1:54822/postgres`;

export default defineConfig({
    resolve: {
        alias: {
            "server-only": fileURLToPath(new URL("./test/server-only.ts", import.meta.url)),
        },
    },
    test: {
        include: ["src/**/*.test.ts"],
        env: {
            // What the tests measure runs as the site's role, so a missing GRANT fails here and not in production
            SITE_DATABASE_URL: process.env.SITE_DATABASE_URL ?? localUrl("site_app"),
            // The owner only clears rows the site's role may not delete
            OWNER_DATABASE_URL: process.env.OWNER_DATABASE_URL ?? localUrl("postgres"),
        },
        testTimeout: 30_000,
        hookTimeout: 60_000,
    },
});

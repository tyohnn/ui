#!/usr/bin/env node

/**
 * Tells Claude Code, right after it edits a screen file, which values it wrote that the design system should decide
 * (a PostToolUse hook in `.claude/settings.json`).
 *
 * The rules and the ledger belong to `check-screens.mjs` beside this file, and that check runs with the tests. By
 * then the same value may sit in several screens; this says it at the edit.
 *
 * - It reports and never blocks: blocking is the check's job. Odd input, a missing config or a broken ledger end
 *   quietly, so hook errors do not bury the reports.
 * - A file that stays inside its ledger says nothing. Only rules over the ledger are reported.
 */

import { readFileSync } from "node:fs";
import { relative } from "node:path";

import { load } from "./check-screens.mjs";

const input = await new Promise((done) =>
{
    let text = "";
    process.stdin.on("data", (chunk) => (text += chunk));
    process.stdin.on("end", () => done(text));
});

const report = () =>
{
    const filePath = JSON.parse(input || "{}")?.tool_input?.file_path;

    if (typeof filePath !== "string")
    {
        return null;
    }

    const { root, inScope, scan, describeRule, readBaseline } = load();
    const path = relative(root, filePath).split("\\").join("/");

    if (path.startsWith("..") || !inScope(path))
    {
        return null;
    }

    const found = scan(path, readFileSync(filePath, "utf8"));
    const allowed = readBaseline()[path] ?? {};
    const over = Object.entries(found).filter(([id, { count }]) => count > (allowed[id] ?? 0));

    if (over.length === 0)
    {
        return null;
    }

    const lines = over.map(([id, { count, samples }]) =>
    {
        const where = samples.map((sample) => `line ${sample.line} \`${sample.match}\``).join(", ");

        return `- ${count} (ledger ${allowed[id] ?? 0}): ${where}\n  ${describeRule(id)}`;
    });

    return `${path} writes values the design system should decide; check:screens will fail as it stands.\n${lines.join("\n")}`;
};

const message = (() =>
{
    try
    {
        return report();
    }
    catch
    {
        return null;
    }
})();

if (message !== null)
{
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: message } }));
}

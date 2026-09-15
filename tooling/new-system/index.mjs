// new-system — fork a design system.
//
// Usage: node tooling/new-system <name> --from foundation|<system>
//
// Copies the source's styles/ into registry/systems/<name>/styles, writes a DESIGN.md from the
// foundation template and a system.json whose forkedFrom records the source and the current commit.
// The copy is a frozen snapshot: tune values in place afterwards; nothing links back to the source.

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { currentCommit, foundationRoot, readSystemMeta, repoRoot, systemRoot, systemsRoot } from "@tyohnn/build-system/registry";

const args = process.argv.slice(2);
const name = args.find((arg) => !arg.startsWith("--") && arg !== args[args.indexOf("--from") + 1]);
const from = args.includes("--from") ? args[args.indexOf("--from") + 1] : null;

if (!name || !from)
{
    console.error("usage: node tooling/new-system <name> --from foundation|<system>");
    process.exit(2);
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(name) || name === "foundation")
{
    console.error(`Invalid system name "${name}" (lowercase letters, digits and dashes; not "foundation")`);
    process.exit(2);
}

const target = join(systemsRoot, name);

if (existsSync(target))
{
    console.error(`${relative(repoRoot, target)} already exists; systems are never overwritten`);
    process.exit(1);
}

const source = systemRoot(from);

mkdirSync(target, { recursive: true });
cpSync(join(source, "styles"), join(target, "styles"), { recursive: true });
mkdirSync(join(target, "reference"), { recursive: true });

const template = readFileSync(join(foundationRoot, "DESIGN.template.md"), "utf8");

writeFileSync(join(target, "DESIGN.md"), template.replaceAll("{{name}}", name).replaceAll("{{from}}", from));
// Fonts come with the copied layer-1 stacks and icons with the source's look, so both start as the source's.
writeFileSync(join(target, "system.json"), `${JSON.stringify({
    $schema: "../../schema/system.schema.json",
    name,
    description: "",
    forkedFrom: { source: from, commit: currentCommit() },
    fonts: readSystemMeta(from).fonts,
    icons: readSystemMeta(from).icons,
    ...(readSystemMeta(from).defaultMode ? { defaultMode: readSystemMeta(from).defaultMode } : {}),
    tags: [],
    source: { kind: "", note: "" },
}, null, 4)}\n`);

console.log(`Created ${relative(repoRoot, target)} from ${from}. Next: tune styles/globals.css and styles/tokens.css in place, fill system.json and DESIGN.md.`);

// port-block — the mechanical half of porting a shadcn sidebar block into a tyohnn block template.
//
// Usage: node tooling/preset/port-block.mjs <sidebar-NN> [--out <dir>] [--workdir <dir>]
//
// Reads apps/v4/registry/bases/base/blocks/<block>/ from the pinned shadcn checkout (shared.mjs, same
// --workdir / TYOHNN_PRESET_WORKDIR as make-reference) and writes each file with only these changes:
//
//   - `@/registry/bases/base/ui/<name>` → `@tyohnn/components/<name>` (lib → @tyohnn/lib, hooks → @tyohnn/hooks);
//   - `@/registry/bases/base/blocks/<block>/components/<name>` → `./<name>` (page.tsx: `./components/<name>`);
//   - every `<IconPlaceholder lucide= tabler= hugeicons= phosphor= remixicon= …/>` → the `@tyohnn/icons` name whose
//     five library glyphs are exactly those (registry/ui/icons/libraries/*.tsx), other attributes kept in order.
//     A name that collides with another identifier in the file is imported as `<Name>Icon`.
//
// Markup, classes and data stay as upstream wrote them. The default output is <workdir>/blocks-ported/<block>/,
// outside the repository: copy what you need into apps/preview/src/templates/blocks/<id>/ (tooling/preset/blocks.md).
// It prints what still needs a hand: an IconPlaceholder with no semantic name (report it, do not add icons in a
// template change), `new Date()` / `Math.random` (templates use fixed dates), and avatar image paths (use "").
// Exit 1 when an icon has no name.

import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { repoRoot } from "@tyohnn/build-system/registry";

import { argValue, shadcnCheckout, workdir } from "./shared.mjs";

const args = process.argv.slice(2);
const block = args.find((arg, index) => /^sidebar-\d\d$/.test(arg) && !args[index - 1]?.startsWith("--"));

if (!block)
{
    console.error("usage: node tooling/preset/port-block.mjs <sidebar-NN> [--out dir] [--workdir dir]");
    process.exit(2);
}

const source = join(shadcnCheckout({ fetch: true }), "apps/v4/registry/bases/base/blocks", block);
const out = argValue("out", join(workdir(), "blocks-ported", block));
const LIBRARIES = ["lucide", "tabler", "hugeicons", "phosphor", "remixicon"];

/** "lucide|tabler|hugeicons|phosphor|remixicon" glyphs → semantic names */
const semantic = (() =>
{
    const byLibrary = Object.fromEntries(LIBRARIES.map((library) =>
    {
        const text = readFileSync(join(repoRoot, "registry/ui/icons/libraries", `${library}.tsx`), "utf8");
        const pairs = library === "lucide"
            ? [...text.matchAll(/^\s+(\w+) as (\w+),$/gm)].map((match) => [match[2], match[1]])
            : [...text.matchAll(/^export const (\w+) = icon\((\w+)\);$/gm)].map((match) => [match[1], match[2]]);

        return [library, new Map(pairs)];
    }));
    const index = new Map();

    for (const name of byLibrary.lucide.keys())
    {
        const key = LIBRARIES.map((library) => byLibrary[library].get(name)).join("|");

        index.set(key, [...(index.get(key) ?? []), name]);
    }

    return index;
})();

const files = (dir) => readdirSync(dir).flatMap((entry) => (statSync(join(dir, entry)).isDirectory() ? files(join(dir, entry)) : [join(dir, entry)]));
const report = { icons: new Set(), unnamed: [], dates: [], avatars: [] };

for (const file of files(source))
{
    const path = relative(source, file);
    const inComponents = path.startsWith("components/");
    let code = readFileSync(file, "utf8");
    const used = new Map();

    code = code
        .replace(/@\/registry\/bases\/base\/ui\//g, "@tyohnn/components/")
        .replace(/@\/registry\/bases\/base\/lib\//g, "@tyohnn/lib/")
        .replace(/@\/registry\/bases\/base\/hooks\//g, "@tyohnn/hooks/")
        .replace(new RegExp(`@/registry/bases/base/blocks/${block}/components/`, "g"), inComponents ? "./" : "./components/");

    code = code.replace(/<IconPlaceholder\b([\s\S]*?)\/>/g, (whole, attributes) =>
    {
        const glyph = (library) => (attributes.match(new RegExp(`\\b${library}="([^"]+)"`)) ?? [])[1];
        const key = LIBRARIES.map(glyph).join("|");
        const names = semantic.get(key);

        if (!names)
        {
            report.unnamed.push(`${path}: ${key}`);

            return whole;
        }

        // Several names with the same five glyphs: prefer the one that is not a calendar-only or select-only name.
        const name = names.find((candidate) => !/^(Calendar(Chevron)|SelectIndicator)/.test(candidate)) ?? names[0];
        const rest = attributes
            .replace(new RegExp(`\\s*\\b(?:${LIBRARIES.join("|")})="[^"]*"`, "g"), "")
            .replace(/\s+/g, " ")
            .trim();

        used.set(name, name);
        report.icons.add(name);

        return `<${name}${rest ? ` ${rest}` : ""} />`;
    });

    if (used.size > 0)
    {
        const declared = (name) => new RegExp(`(?:import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from|import ${name}\\b|function ${name}\\b|const ${name}\\b)`).test(code);

        for (const name of used.keys())
        {
            if (!declared(name)) continue;
            used.set(name, `${name}Icon`);
            code = code.replace(new RegExp(`<${name}( |/)`, "g"), `<${name}Icon$1`);
        }

        const specifiers = [...used].sort(([a], [b]) => (a < b ? -1 : 1)).map(([name, local]) => (name === local ? name : `${name} as ${local}`));

        code = code.replace(/import \{ IconPlaceholder \} from "@\/app\/\(create\)\/components\/icon-placeholder"\n/, `import { ${specifiers.join(", ")} } from "@tyohnn/icons"\n`);
    }

    if (/new Date\(|Math\.random/.test(code)) report.dates.push(path);
    if (/\/avatars\//.test(code)) report.avatars.push(path);

    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), code);
}

console.log(`${block} → ${out}`);
console.log(`icons: ${[...report.icons].sort().join(", ") || "none"}`);
if (report.dates.length) console.log(`time or randomness (use a fixed date): ${report.dates.join(", ")}`);
if (report.avatars.length) console.log(`avatar image paths (set avatar: "" so the fallback renders without a 404): ${report.avatars.join(", ")}`);

if (report.unnamed.length)
{
    console.log("IconPlaceholder with no @tyohnn/icons name (report it; do not add icons in a template change):");
    report.unnamed.forEach((line) => console.log(`  ${line}`));
    process.exit(1);
}

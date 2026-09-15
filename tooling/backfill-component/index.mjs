// backfill-component — give every system a component that was added to foundation.
//
// Usage: node tooling/backfill-component <component>   (e.g. rating → styles/components/rating.css)
//
// For each registry/systems/*:
//   1. copies foundation/styles/components/<component>.css when the system has no such file
//      (an existing file is never overwritten);
//   2. adds `@import "./components/<component>.css";` to styles/style.css when missing, in
//      alphabetical position among the component imports;
//   3. appends foundation defaults for every layer-1 / layer-2 token the system lacks, as a marked
//      block at the end of styles/globals.css (:root, then .dark) and styles/tokens.css (:root).

import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

import { foundationRoot, listSystems, readImports, readTokens, repoRoot, styleFiles, systemsRoot } from "@tyohnn/build-system/registry";

const component = process.argv[2];

if (!component || !/^[a-z0-9_-]+$/.test(component))
{
    console.error("usage: node tooling/backfill-component <component>");
    process.exit(2);
}

const sourceCss = join(foundationRoot, "styles/components", `${component}.css`);

if (!existsSync(sourceCss))
{
    console.error(`${relative(repoRoot, sourceCss)} does not exist; write the foundation stylesheet first`);
    process.exit(1);
}

const foundationFiles = styleFiles(foundationRoot);

/** Missing tokens of one file, grouped by scope, as a CSS block to append */
const missingBlock = (foundationFile, systemFile, scopes) =>
{
    const have = new Map();

    for (const row of readTokens(systemFile))
    {
        for (const scope of scopes.filter((candidate) => row.scope.includes(candidate)))
        {
            have.set(`${scope} ${row.name}`, true);
        }
    }

    const blocks = [];
    let count = 0;

    for (const scope of scopes)
    {
        const rows = [];
        const seen = new Set();

        for (const row of readTokens(foundationFile).filter((candidate) => candidate.scope.includes(scope)))
        {
            if (have.has(`${scope} ${row.name}`) || seen.has(row.name)) continue;
            seen.add(row.name);
            rows.push(`    ${row.name}: ${row.value};`);
        }

        if (rows.length > 0)
        {
            count += rows.length;
            blocks.push(`${scope} {\n${rows.join("\n")}\n}`);
        }
    }

    return blocks.length === 0
        ? { count: 0, text: "" }
        : { count, text: `\n/* ---- Backfilled from foundation for ${component} (tooling/backfill-component). Tune in place. ---- */\n${blocks.join("\n\n")}\n` };
};

const addImport = (barrel) =>
{
    const target = join(barrel, "..", "components", `${component}.css`);

    if (readImports(barrel).includes(target)) return false;

    const source = readFileSync(barrel, "utf8");
    const line = `@import "./components/${component}.css";`;
    const imports = [...source.matchAll(/^@import\s+"\.\/components\/([^"]+)\.css";\s*$/gm)];
    const after = imports.filter((match) => !match[1].startsWith("_") && match[1] < component).pop()
        ?? imports.filter((match) => match[1].startsWith("_")).pop();
    const at = after ? after.index + after[0].length : source.length;

    writeFileSync(barrel, `${source.slice(0, at)}\n${line}${source.slice(at)}`);

    return true;
};

const systems = listSystems();

if (systems.length === 0)
{
    console.log("No systems to backfill.");
}

for (const name of systems)
{
    const root = join(systemsRoot, name);
    const files = styleFiles(root);
    const targetCss = join(root, "styles/components", basename(sourceCss));
    const notes = [];

    if (existsSync(targetCss))
    {
        notes.push("stylesheet kept (already present)");
    }
    else
    {
        copyFileSync(sourceCss, targetCss);
        notes.push("stylesheet copied");
    }

    notes.push(addImport(files.barrel) ? "import added" : "import present");

    for (const [foundationFile, systemFile, scopes] of [
        [foundationFiles.colors, files.colors, [":root", ".dark"]],
        [foundationFiles.tokens, files.tokens, [":root"]],
    ])
    {
        const block = missingBlock(foundationFile, systemFile, scopes);

        if (block.count > 0)
        {
            writeFileSync(systemFile, readFileSync(systemFile, "utf8") + block.text);
        }

        notes.push(`${basename(systemFile)} +${block.count}`);
    }

    console.log(`${name}: ${notes.join(" · ")}`);
}

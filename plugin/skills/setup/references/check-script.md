# The token check

A short script that fails when a component hard-codes a colour, corner, shadow or type size the system should decide. It reads `tyohnn.json` for
the styles folder and skips it. Save it as `scripts/check-design.mjs` and add `"check:design": "node scripts/check-design.mjs"`.

```js
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const config = JSON.parse(readFileSync(join(root, "tyohnn.json"), "utf8"));
const skip = new Set(["node_modules", ".next", "dist", "build", ".git"]);
const styles = join(root, config.styles);

// What a component must not decide for itself
const RULES = [
    [/#[0-9a-f]{3,8}\b/i, "a literal colour"],
    [/\b(?:rgb|hsl|oklch|oklab)a?\(/i, "a literal colour"],
    [/\b(?:bg|text|border|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/, "a Tailwind palette colour"],
    [/\brounded-(?:sm|md|lg|xl|2xl|3xl|\[\d)/, "a literal radius"],
    [/\bshadow-(?:sm|md|lg|xl|2xl|\[)/, "a literal shadow"],
    [/\b(?:text-(?:xs|sm|base|lg|xl)|text-\[\d)/, "a literal type size"],
];

const files = (dir) => readdirSync(dir).flatMap((name) =>
{
    const path = join(dir, name);

    if (skip.has(name) || path.startsWith(styles)) return [];

    return statSync(path).isDirectory() ? files(path) : /\.(tsx|jsx|vue|svelte)$/.test(name) ? [path] : [];
});

let found = 0;

for (const file of files(root))
{
    readFileSync(file, "utf8").split("\n").forEach((line, index) =>
    {
        if (line.includes("design-check-ignore")) return;

        for (const [pattern, what] of RULES)
        {
            if (!pattern.test(line)) continue;
            found += 1;
            console.log(`${relative(root, file)}:${index + 1}  ${what}: ${line.trim().slice(0, 100)}`);
        }
    });
}

if (found > 0)
{
    console.log(`\n${found} place(s) decide what the system should. Use a data-role, a theme colour name or var(--token).`);
    process.exit(1);
}

console.log("Every component leaves colour, corners, depth and sizes to the system.");
```

A line that has to keep a literal (a brand logo's colour) ends with `// design-check-ignore`. Keep such lines rare
and say why on the line.

The primitives copied from tyohnn already pass: they read `cn-*` rules, not literals. If they fail, the person
edited one; point it out rather than adding ignores.

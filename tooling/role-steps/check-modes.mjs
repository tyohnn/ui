// 축 계약 7 이동이 값을 움직이지 않았는지 밝은 · 어두운 모드 둘 다에서 잰다.
// Usage: node tooling/role-steps/check-modes.mjs [git-ref]   (기본 HEAD)
// foundation 과 시스템마다 globals.css(:root · .dark) + tokens.css(:root)를 ref 와 작업 트리에서 풀어,
// ref 에 있던 이름의 풀린 값이 하나라도 다르면 1로 끝난다.

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { listSystems, readTokens, repoRoot, styleFiles, systemRoot } from "@tyohnn/build-system/registry";

const ref = process.argv[2] ?? "HEAD";
const scratch = mkdtempSync(join(tmpdir(), "role-modes-"));

const resolve = (map, value, seen = new Set()) =>
    value
        .replace(/var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,\s*([^()]*(?:\([^()]*(?:\([^()]*\)[^()]*)*\)[^()]*)*))?\)/g, (whole, name, fallback) =>
        {
            if (seen.has(name)) return `<cycle ${name}>`;
            if (map.has(name)) return resolve(map, map.get(name), new Set([...seen, name]));
            return fallback === undefined ? whole : resolve(map, fallback, seen);
        })
        .replace(/\s+/g, " ")
        .trim();

const modes = (colors, tokens) =>
{
    const light = new Map();
    for (const row of [...readTokens(colors), ...readTokens(tokens)].filter((r) => r.scope === ":root")) light.set(row.name, row.value);
    const dark = new Map(light);
    for (const row of readTokens(colors).filter((r) => r.scope === ".dark")) dark.set(row.name, row.value);
    const out = {};
    for (const [mode, map] of Object.entries({ light, dark })) out[mode] = new Map([...map.keys()].map((n) => [n, resolve(map, map.get(n))]));
    return out;
};

let moved = 0;

for (const name of ["foundation", ...listSystems()])
{
    const files = styleFiles(systemRoot(name));
    const old = {};
    for (const key of ["colors", "tokens"])
    {
        const path = join(scratch, `${name}-${key}.css`);
        writeFileSync(path, execFileSync("git", ["show", `${ref}:${relative(repoRoot, files[key])}`], { cwd: repoRoot }));
        old[key] = path;
    }
    const before = modes(old.colors, old.tokens);
    const after = modes(files.colors, files.tokens);
    for (const mode of ["light", "dark"])
    {
        for (const [token, value] of before[mode])
        {
            if (after[mode].get(token) === value) continue;
            moved += 1;
            console.log(`✗ ${name} ${mode} ${token}: ${value} → ${after[mode].get(token)}`);
        }
    }
}

console.log(moved ? `✗ ${moved} values moved` : "✓ 0 values moved (light · dark, foundation + systems)");
process.exit(moved ? 1 : 0);

// check-paint — every layer-1 and layer-2 colour, as the pixel a browser paints.
//
//   node tooling/theme/check-paint.mjs --dump before.json [name…]
//   node tooling/theme/check-paint.mjs --diff before.json after.json
//
// The colour work moves values between files and turns literals into formulas. A text diff cannot say
// whether that changed anything; this can. It loads each system's compiled.css, reads every custom
// property off the root in both modes, paints it to a 1×1 canvas (the same normalisation
// tooling/snapshot/collect.mjs compares with) and records the pixel. Two dumps differ only where a
// colour actually moved.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { listSystems, repoRoot } from "@tyohnn/build-system/registry";

const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");

const arg = (name) =>
{
    const index = process.argv.indexOf(`--${name}`);

    return index === -1 ? undefined : process.argv[index + 1];
};

const diffA = arg("diff");

if (diffA)
{
    const a = JSON.parse(readFileSync(diffA, "utf8"));
    const b = JSON.parse(readFileSync(process.argv[process.argv.indexOf("--diff") + 2], "utf8"));
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    let differences = 0;

    for (const key of keys)
    {
        if (a[key] === b[key]) continue;

        differences += 1;
        console.log(`${key}\n    was: ${a[key] ?? "(absent)"}\n    now: ${b[key] ?? "(absent)"}`);
    }

    console.log(differences === 0 ? `no colour moved (${keys.length} values in ${new Set(keys.map((key) => key.split(" ")[0])).size} systems)` : `${differences} of ${keys.length} values moved`);
    process.exit(differences === 0 ? 0 : 1);
}

const out = arg("dump");

if (!out) throw new Error("usage: check-paint.mjs --dump <file> [name…] | --diff <a> <b>");

const names = process.argv.slice(2).filter((value, index, all) => !value.startsWith("--") && all[index - 1] !== "--dump");
const targets = names.length > 0 ? names : ["foundation", ...listSystems()];

const browser = await chromium.launch();
const page = await browser.newPage();
const dump = {};

for (const name of targets)
{
    const css = join(repoRoot, "dist/systems", name, "compiled.css");

    if (!existsSync(css)) throw new Error(`No ${css} — run npm run build-systems first`);

    await page.setContent(`<canvas width=1 height=1></canvas><div id=probe></div>`);
    await page.addStyleTag({ content: readFileSync(css, "utf8") });

    for (const mode of ["light", "dark"])
    {
        await page.evaluate((value) => { document.documentElement.classList.toggle("dark", value === "dark"); }, mode);

        const values = await page.evaluate(() =>
        {
            const probe = document.getElementById("probe");
            const context = document.querySelector("canvas").getContext("2d", { willReadFrequently: true });
            const style = getComputedStyle(document.documentElement);
            const result = {};

            for (const property of style)
            {
                if (!property.startsWith("--")) continue;

                const value = style.getPropertyValue(property).trim();

                probe.style.color = "";
                probe.style.color = value;

                if (!probe.style.color) { result[property] = `= ${value}`; continue; }

                context.clearRect(0, 0, 1, 1);
                context.fillStyle = getComputedStyle(probe).color;
                context.fillRect(0, 0, 1, 1);
                result[property] = [...context.getImageData(0, 0, 1, 1).data].join(",");
            }

            return result;
        });

        for (const [property, value] of Object.entries(values)) dump[`${name} ${mode} ${property}`] = value;
    }

    console.log(`${name}: ${Object.keys(dump).filter((key) => key.startsWith(`${name} `)).length / 2} properties per mode`);
}

await browser.close();
writeFileSync(out, `${JSON.stringify(dump, null, 0)}\n`);
console.log(`wrote ${out} (${Object.keys(dump).length} values)`);

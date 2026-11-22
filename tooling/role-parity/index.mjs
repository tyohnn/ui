// role-parity — 역할 규칙(_roles.css)이 각 시스템의 느낌을 제대로 입는지 잰다.
//
// Usage: node tooling/role-parity [system ...]   (build-system --all 뒤에 돌린다. 시스템을 주지 않으면 16종 전부)
//
// 역할마다 그 역할의 느낌을 정의하는 바탕 컴포넌트가 있다(control = 단추, field = 입력, indicator = 배지,
// surface = 카드). 둘을 dist/systems/<이름>/compiled.css 로 나란히 렌더해 밝은 · 어두운 모드에서 계산된 값을
// 견주고, 다른 속성을 적는다. 다른 줄은 그 시스템이 3층 규칙에서만 바꾼 자리다. 역할 토큰으로 옮기거나
// KNOWN 에 까닭을 적는다. KNOWN 에 없는 차이가 하나라도 있으면 1로 끝난다.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "@playwright/test";

import { listSystems, repoRoot } from "@tyohnn/build-system/registry";

/** 견줄 속성. 배치(너비 · 카드의 바깥 여백)는 호출부의 몫이라 보지 않는다 */
const PROPS = [
    "height", "padding-left", "padding-right", "border-top-left-radius", "background-color", "background-image",
    "color", "box-shadow", "font-size", "line-height", "font-weight", "border-top-width", "border-top-color", "gap", "letter-spacing",
    "text-transform", "backdrop-filter",
];

/** [이름, 바탕 컴포넌트, 역할 요소] */
const PAIRS = [
    ["control primary md", `<button class="cn-button cn-button-variant-default cn-button-size-default">Save</button>`, `<button data-role="control">Save</button>`],
    ["control outline sm", `<button class="cn-button cn-button-variant-outline cn-button-size-sm">Save</button>`, `<button data-role="control" data-variant="outline" data-size="sm">Save</button>`],
    ["control secondary lg", `<button class="cn-button cn-button-variant-secondary cn-button-size-lg">Save</button>`, `<button data-role="control" data-variant="secondary" data-size="lg">Save</button>`],
    ["control ghost", `<button class="cn-button cn-button-variant-ghost cn-button-size-default">Save</button>`, `<button data-role="control" data-variant="ghost">Save</button>`],
    ["field", `<input class="cn-input" value="x">`, `<input data-role="field" value="x">`],
    ["indicator", `<span class="cn-badge cn-badge-variant-default">New</span>`, `<span data-role="indicator">New</span>`],
    ["surface", `<div class="cn-card">x</div>`, `<div data-role="surface">x</div>`],
];

/** 알고 둔 차이: "시스템 · 짝 · 속성" → 까닭 */
const KNOWN = {
    "cirrus · control outline sm · border-top-left-radius": "cirrus 의 작은 단추는 3층에서 알약(--control-radius)을 지킨다. --control-radius-sm 은 입력 계열의 값이다",
    "luma · control outline sm · border-top-left-radius": "luma 의 작은 단추는 3층에서 --control-radius 를 지킨다. --control-radius-sm 은 입력 계열의 값이다",
    "vega · control secondary lg · box-shadow": "vega 의 secondary 단추는 3층에서 그림자를 끈다(outline 만 shadow-xs)",
    "sera · indicator · background-color": "sera 의 배지는 3층에서 채움 없는 글자 표지다",
    "sera · indicator · color": "sera 의 배지는 3층에서 채움 없는 글자 표지다",
    "sera · indicator · height": "sera 의 배지는 3층에서 높이를 풀었다",
};

/** 같은 그림인 값 차이(투명한 그림자 한 겹, 빈 그림자 목록) */
const same = (a, b) =>
{
    const norm = (value) => value.replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px,? ?/g, "").replace(/^none$/, "").trim().replace(/,$/, "");
    return a === b || norm(a) === norm(b);
};

const systems = process.argv.slice(2).length ? process.argv.slice(2) : ["foundation", ...listSystems()];
// PLAYWRIGHT_CHROMIUM_PATH: 설치된 브라우저가 이 판의 Playwright 가 찾는 판과 다를 때 실행 파일을 가리킨다
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {});
const page = await browser.newPage();
const unknown = [];

for (const system of systems)
{
    const compiled = join(repoRoot, "dist/systems", system, "compiled.css");
    if (!existsSync(compiled)) throw new Error(`${compiled} 이 없다. node tooling/build-system --all 을 먼저 돌린다`);
    const css = readFileSync(compiled, "utf8");

    for (const mode of ["light", "dark"])
    {
        const body = PAIRS.map(([, base, role], index) => `<div id="a${index}">${base}</div><div id="b${index}">${role}</div>`).join("");
        await page.setContent(`<html class="${mode === "dark" ? "dark" : ""}"><head><style>${css}</style></head><body>${body}</body></html>`);

        const rows = await page.evaluate(({ count, props }) =>
            Array.from({ length: count }, (_, index) =>
            {
                const a = getComputedStyle(document.querySelector(`#a${index} > *`));
                const b = getComputedStyle(document.querySelector(`#b${index} > *`));
                return props.map((prop) => [prop, a.getPropertyValue(prop), b.getPropertyValue(prop)]);
            }), { count: PAIRS.length, props: PROPS });

        rows.forEach((props, index) =>
        {
            for (const [prop, base, role] of props)
            {
                if (same(base, role)) continue;
                // 카드는 안쪽 여백을 자식(머리 · 본문)이 갖는다. 역할 surface 는 스스로 갖는다
                if (PAIRS[index][0] === "surface" && /^padding-(left|right)$/.test(prop)) continue;
                const key = `${system} · ${PAIRS[index][0]} · ${prop}`;
                const line = `${key} (${mode}): ${base} | ${role}`;
                if (KNOWN[key]) console.log(`  · ${line}\n      ${KNOWN[key]}`);
                else unknown.push(line);
            }
        });
    }
}

await browser.close();

for (const line of unknown) console.log(`  ✗ ${line}`);
console.log(unknown.length ? `✗ 알지 못한 차이 ${unknown.length}` : `✓ ${systems.length}종 · 역할 ${PAIRS.length}짝 · 알지 못한 차이 0`);
process.exit(unknown.length ? 1 : 0);

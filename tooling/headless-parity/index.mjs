// headless-parity — 컴포넌트의 동작 라이브러리를 바꿔도 그림과 동작이 그대로인지 잰다.
//
// registry/ui 의 컴포넌트를 Base UI 에서 UI SDK 로 옮길 때 쓴다. 바꾸기 전과 뒤의 preview 를 시스템마다 빌드해 두고,
// coverage 템플릿의 구역마다 아래 셋을 견준다.
//
//   - 그림: 구역을 연 화면의 스크린샷(1440×900 · DPR 1 · 움직임 끔)을 픽셀 단위로
//   - 계산된 값: tooling/snapshot/collect.mjs 가 data-slot 과 순서로 키를 붙인 요소마다
//   - 접근성과 동작: 요소마다의 role · aria-* · tabindex, 그리고 --behave 에 든 구역에서 Tab 순서와
//     포커스마다 키를 누른 뒤의 상태
//
// Usage:
//   node tooling/headless-parity build <label> [--systems a,b]         preview 를 out/build/<label>/<system>/ 에 빌드한다
//   node tooling/headless-parity record <label> [--as name] [--systems a,b] [--sections a,b] [--behave a,b] [--jobs 3]
//                                                                       out/record/<name 또는 label>/<system>-<mode>/ 에 잰 것을 남긴다
//   node tooling/headless-parity compare <before> <after> [--systems a,b] [--sections a,b] [--tolerance 0]
//                                                                       <before> 에 있는 시스템 · 모드 폴더만 견준다
//
// 빌드를 따로 두는 까닭: 바꾸는 중의 registry/ui 가 개발 서버에 바로 반영되면 「전」이 오염된다.
// compare 는 다른 것이 하나라도 있으면 1로 끝난다. data-* 속성의 차이는 경고로만 적는다(그림의 차이는 픽셀과 계산된 값이 잡는다).

import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

import { listSystems, repoRoot } from "@tyohnn/build-system/registry";

import { coveragePage } from "../snapshot/collect.mjs";

const here = join(repoRoot, "tooling/headless-parity");
const [command, ...rest] = process.argv.slice(2);
const positional = rest.filter((value, index) => !value.startsWith("--") && !rest[index - 1]?.startsWith("--"));
const arg = (name, fallback) =>
{
    const index = rest.indexOf(`--${name}`);

    return index === -1 ? fallback : rest[index + 1];
};
const list = (name) => arg(name)?.split(",").filter(Boolean);
const systems = list("systems") ?? ["foundation", ...listSystems()];
const MODES = ["light", "dark"];

/** 키를 누른 뒤 상태를 적는 속성 */
const STATE_ATTRS = /^(aria-(checked|pressed|selected|expanded|valuenow|valuetext|hidden|disabled|current|orientation|activedescendant)|role|tabindex|hidden|disabled|inert|open|data-(state|checked|unchecked|pressed|selected|open|closed|active|orientation|disabled|highlighted|indeterminate))$/;

/** 기본으로 동작을 재는 구역(1단계: 단순 컨트롤) */
const DEFAULT_BEHAVE = ["button", "toggle", "toggle-group", "checkbox", "radio-group", "switch", "slider", "progress", "separator", "accordion", "collapsible", "tabs"];
/** 동작을 재는 시스템. 동작은 시스템의 색과 값을 따르지 않으니 둘이면 된다(기본 · 가장 촘촘한 것) */
const BEHAVE_SYSTEMS = ["foundation", "graphite"];
/**
 * 알고 둔 차이: 정규식이 맞는 차이 줄은 실패로 세지 않고 까닭과 함께 따로 적는다.
 * 줄의 모양은 「<system>-<mode> · <section>: <key> <attr>=<before> → <after>」다.
 */
/** 처음부터 열린(defaultOpen) 팝업 안 요소의 포커스 표시. Base UI 는 열린 채 붙어도 첫 입력칸으로 포커스를 옮겼다 */
const POPUP_SECTIONS = "popover|hover-card|tooltip|dropdown-menu|context-menu|menubar|select|combobox|navigation-menu";
const FOCUS_ON_MOUNT = new RegExp(` · (${POPUP_SECTIONS}): [a-z-]+#\\d+(>[a-z-]+#\\d+)* (border-(top|right|bottom|left)-color|box-shadow|outline-(width|color|style|offset)) `);
const FOCUS_ON_MOUNT_REASON = "처음부터 열린 팝업은 포커스를 옮기지 않는다(UI SDK). 눌러 열면 첫 입력칸으로 간다. Base UI 는 열린 채 붙어도 옮겨 포커스 표시가 보였다";

const KNOWN = [
    [FOCUS_ON_MOUNT, FOCUS_ON_MOUNT_REASON],
    [new RegExp(` · (${POPUP_SECTIONS}): element root\\d+>span#\\d+ gone$`), "Base UI 가 팝업 앞뒤에 두던 포커스 가드 span(보이지 않는 role=presentation)이 없다"],
    [/ · (dialog|alert-dialog|sheet(-[a-z]+)?|drawer(-[a-z]+)?): ([a-z-]+-trigger#\d+|root\d+>[a-z0-9-]+#\d+) inert=\(none\) → $/, "모달이 열린 동안 UI SDK 는 바깥을 inert 로 막는다(읽기와 포커스를 함께 막는다). Base UI 는 바깥에 aria-hidden 을 달고 포커스를 가두었다"],
    [/ · (dialog|alert-dialog|sheet(-[a-z]+)?|drawer(-[a-z]+)?): root\d+ (aria-hidden=true → \(none\)|aria-modal=\(none\) → true)$/, "배경(role=presentation)에 aria-hidden 을 따로 달지 않고, 모달 내용에 aria-modal=true 를 단다(UI SDK)"],
    [/ · drawer(-[a-z]+)?: element drawer-viewport#\d+ new$/, "서랍을 화면 가장자리에 붙이는 viewport 를 UI SDK 가 그리고 인라인 스타일로 자리를 잡는다. Base UI 의 viewport 는 body 로 포털돼 섹션 밖에 있어 재지 않았다"],
    [/ · tooltip: (root\d+ (width|data-closed|data-instant|data-ending-style|tabindex|role)[ =]|element (root\d+>div#\d+ gone|(tooltip-arrow|tooltip-content|kbd)#\d+ new)$)/, "Base UI 는 한 Provider 안에서 툴팁을 하나만 열어 두어, 처음부터 열린 둘 가운데 앞의 것을 닫히는 중으로 두었다. UI SDK 는 둘 다 연다(마우스로는 어차피 하나만 열린다). 위치를 잡는 Positioner div 가 없어 부분의 이름이 한 칸씩 밀린다"],
    [/ · (checkbox|switch|radio-group|slider|field|label): element (root|[a-z-]+#\d+)(>[a-z-]+#\d+)*>input#\d+ gone$/, "폼에 들어가는 숨은 input 이 루트 옆이 아니라 컨트롤 안쪽에 있다(UI SDK)"],
    [/ · (checkbox|switch|radio-group|slider|field|label): element (checkbox|switch|radio|slider|slider-thumb)-input#\d+ new$/, "폼에 들어가는 숨은 input 이 컨트롤 안쪽에 있고 UI SDK 가 이름(data-slot)을 붙였다"],
    [/ · slider: element slider#\d+>div#\d+ gone$|· slider: element slider-control#\d+ new$/, "슬라이더의 control 에 UI SDK 가 이름(data-slot=slider-control)을 붙였다"],
    [/ · accordion: element accordion-item#\d+>h3#\d+ gone$|· accordion: element accordion-header#\d+ new$/, "아코디언의 h3 머리에 UI SDK 가 이름(data-slot=accordion-header)을 붙였다"],
    [/ · progress: element progress#\d+>span#\d+ gone$/, "Base UI 가 progressbar 안에 두던 빈 role=presentation span 이 없다"],
    [/ · (popover|dropdown-menu): root\d+>span#\d+ aria-owns=_r_[0-9a-z]+_ → _r_[0-9a-z]+_$/, "React 의 useId 가 매기는 번호가 앞선 컴포넌트의 수에 따라 한 칸 밀렸다. 가리키는 팝업은 같다"],
    [/ · behaviour toggle-group: toggle-group-item "[^"]*" · (End|ArrowLeft|ArrowRight|PageUp|Home) focus toggle-group-item "[^"]*" → toggle-group-item "Disabled"$/, "꺼진 토글 항목도 화살표로 닿는다(aria-disabled). 누를 수는 없다"],
    [/ · behaviour toggle-group: toggle-group-item "Top" · (ArrowRight|ArrowLeft|PageUp) focus /, "세로 토글 그룹은 위아래 화살표로 움직이고 좌우 화살표는 움직이지 않는다(shadcn 래퍼가 Base UI 에 방향을 넘기지 않던 것을 고쳤다)"],
    [/ · behaviour switch: switch\(switch\) "[^"]*" · (Enter|ArrowRight|ArrowDown|End|Home|ArrowLeft|PageUp) /, "스위치가 네이티브 button 이라 Enter 로도 켜고 끈다(Base UI 의 span 은 Space 만 받았다). 뒤의 키는 그 바뀐 상태를 이어받는다"],
    [/ · behaviour checkbox: checkbox\(checkbox\) "indeterminate" · [A-Za-z]+ input ""#\d+: aria-hidden=true checked=true .* → aria-hidden=true checked=false /, "중간 상태의 체크박스는 Space 뒤에도 중간 상태이고, 폼에 값을 내지 않는다. Base UI 는 보이는 것은 같고 숨은 input 만 checked 로 바꿨다"],
    [/ · behaviour radio-group: (tab order .* "x" → |step only before radio-group-item\(radio\) "x" )/, "꺼진 라디오 그룹은 Tab 으로 닿지 않는다(Base UI 는 꺼진 그룹의 고른 항목에 Tab 이 닿았다)"],
    [/ · behaviour slider: .* slider-input ""(#\d+)?: \(none\) → /, "UI SDK 의 슬라이더는 폼에 값을 내는 숨은 input 을 따로 둔다(Base UI 는 손잡이의 input 이 냈다)"],
    [/ · behaviour progress: start (progress\(progressbar\)|progress-label\(presentation\)|progress-value|span\(presentation\)) /, "Base UI 가 progressbar 안에 두던 빈 span 이 없고, 라벨과 값에 role=presentation · aria-hidden 을 따로 붙이지 않는다(progressbar 의 자식은 원래 표현으로만 읽힌다)"],
    [/ · behaviour tabs: tabs-trigger\(tab\) "(Account|Password)"(#\d+)? · (ArrowRight|ArrowLeft|PageUp) focus /, "세로 탭은 위아래 화살표로 움직이고 좌우 화살표는 움직이지 않는다(shadcn 래퍼가 Base UI 에 방향을 넘기지 않던 것을 고쳤다). 뒤의 키는 그 자리를 이어받는다"],
    [/ · behaviour (toggle-group|tabs): step only (before|after) /, "Tab 으로 닿는 자리가 달라 그 자리에서 시작하는 단계가 다르다(아래 Tab 순서의 까닭과 같다)"],
    [/ · behaviour (toggle-group|tabs): tab order /,"Tab 으로 들어올 자리가 첫 항목이 아니라 눌린 항목 · 고른 탭이다(UI SDK)"],
    [/ · pagination: pagination-link#\d+ (role=button|tabindex=0) → \(none\)$/, "pagination 의 링크는 href 가 있는 a 다. Base UI 는 nativeButton={false} 로 role=button 을 붙였고 UI SDK 는 링크를 링크로 둔다(shadcn 원본과 같다)"],
];

/**
 * 알고 둔 속성 차이: 구역(sections 가 없으면 모든 구역)과 부분(키의 머리)이 맞으면 그 속성의 차이는 실패로 세지 않고 까닭과 함께 따로 적는다.
 * 계산된 스타일 비교, 정적 속성 비교, 키를 누른 뒤의 상태 비교에 함께 쓴다. 태그가 바뀐 것은 attrs 에 "<tag>" 로 적는다.
 */
const ACCEPTED = [
    {
        part: /^(checkbox|switch|radio-group-item)\b/,
        attrs: ["<tag>", "type", "tabindex", "disabled"],
        reason: "UI SDK 는 체크박스 · 스위치 · 라디오를 span 이 아니라 네이티브 button 으로 그리고, 꺼진 것은 tabindex=-1 대신 disabled 로 막는다. 꺼진 그룹의 라디오는 Tab 으로 닿지 않는다",
    },
    {
        part: /^(checkbox|switch|radio-group-item|checkbox-indicator|radio-group-indicator)\b/,
        attrs: ["text-transform"],
        reason: "네이티브 button 은 브라우저 기본값으로 text-transform 을 none 으로 되돌린다. 대문자로 쓰는 라벨 안에 있어도 이 컨트롤에는 글자가 없어 보이는 것은 같다",
    },
    {
        sections: ["combobox"],
        part: /^input-group-button\b/,
        attrs: ["tabindex"],
        reason: "콤보박스의 열기 단추는 Base UI 가 tabindex=-1 로 두어 Tab 은 입력칸에만 닿게 한다. 예전에는 Base UI 의 Button 이 tabindex=0 으로 덮어썼고 UI SDK 의 Button 은 덮어쓰지 않는다",
    },
    {
        sections: ["toggle-group"],
        part: /^toggle-group-item\b/,
        attrs: ["tabindex", "disabled"],
        reason: "UI SDK 의 토글 그룹은 Tab 으로 들어올 자리를 눌린 항목에 둔다(Base UI 는 첫 항목). 꺼진 항목은 네이티브 disabled 가 아니라 aria-disabled 로 두어 화살표로 닿되 누를 수 없다",
    },
    {
        sections: ["tabs"],
        part: /^tabs-(list|trigger)\b/,
        attrs: ["aria-orientation", "tabindex"],
        reason: "세로 탭의 목록이 aria-orientation=vertical 을 갖고 위아래 화살표로 움직인다(shadcn 래퍼가 Base UI 에 방향을 넘기지 않던 것을 고쳤다). Tab 으로 들어올 자리는 포커스가 아니라 고른 탭을 따른다",
    },
    {
        sections: ["slider"],
        part: /^input\b/,
        attrs: ["aria-valuenow", "role", "aria-valuetext"],
        reason: "손잡이의 input 은 네이티브 range 라 값이 곧 aria-valuenow 이고 UI SDK 는 role=slider 를 직접 단다. 범위 슬라이더의 두 손잡이에 Base UI 가 붙이던 「start range」 · 「end range」 읽기 글은 없다(값만 읽는다)",
    },
    {
        sections: ["progress"],
        part: /^progress-(label|value)\b/,
        attrs: ["role", "aria-hidden"],
        reason: "progressbar 의 자식은 보조 기술에 표현으로만 읽히므로 UI SDK 는 라벨에 role=presentation, 값에 aria-hidden 을 따로 붙이지 않는다",
    },
];

/**
 * UI SDK 가 이름을 붙인 숨은 input 을 Base UI 때의 이름 없는 input 과 같은 것으로 읽는다.
 * 숨은 input 이 어디 있는지는 정적 비교의 KNOWN 이 따로 적는다. 슬라이더의 input 은 role=slider 를 직접 단다.
 */
const aliasKey = (key) => key.replace(/^(?:checkbox|switch|radio|slider-thumb)-input(?:\(slider\))?(?= |$|#)/, "input");
const aliasStep = (entry) => ({
    ...entry,
    step: aliasKey(entry.step),
    focus: entry.focus && aliasKey(entry.focus),
    order: entry.order?.map(aliasKey),
    state: entry.state && Object.fromEntries(Object.entries(entry.state).map(([key, value]) => [aliasKey(key), value])),
});

const accepted = (section, key, attr) => ACCEPTED.find((entry) => (!entry.sections || entry.sections.includes(section)) && entry.part.test(key) && entry.attrs.includes(attr));

/**
 * 그리기의 잡음: 같은 빌드를 두 번 찍어도 블러 · 그라디언트 · 글꼴 가장자리에서 채널 차이가 7 까지 난다.
 * 바뀐 화소가 있어도 가장 큰 채널 차이가 이 값을 넘지 않으면 알고 둔 차이다. 자리나 색이 바뀌면 이보다 커진다.
 */
const NOISE = 8;

/** 반 화소 자리 차이처럼 바뀐 화소 수가 작고 까닭을 아는 구역. 화소 수가 count 를 넘으면 차이로 센다 */
const SMALL_SHIFT = {
    tooltip: { count: 300, reason: "툴팁 화살표의 자리를 Base UI 는 반 화소(42.5px)까지, UI SDK 는 온 화소(42px)로 적는다. 화살표 가장자리 몇 줄만 다르다" },
};

/**
 * 레지스트리의 CSS 와 컴포넌트가 선택자로 읽는 data-* 이름. 이 속성이 사라지면 스타일이 걸리지 않으니 경고가 아니라 차이다.
 * 새로 생긴 data-* 와 읽는 곳이 없는 data-* 는 경고로만 적는다.
 */
const STYLED_DATA = (() =>
{
    const names = new Set();
    const walk = (dir) =>
    {
        for (const entry of readdirSync(dir, { withFileTypes: true }))
        {
            const path = join(dir, entry.name);

            if (entry.isDirectory()) walk(path);
            else if (/\.(css|tsx)$/.test(entry.name))
            {
                for (const [, name] of readFileSync(path, "utf8").matchAll(/data-\[?([a-z][a-z-]*)/g)) names.add(`data-${name}`);
            }
        }
    };

    walk(join(repoRoot, "registry"));
    names.delete("data-slot");

    return names;
})();

/** 스스로 포커스를 받는 요소. 여기에 붙은 tabindex="0" 은 아무 일도 하지 않는다 */
const FOCUSABLE_TAGS = new Set(["button", "input", "select", "textarea", "summary"]);
const KEYS = ["Space", "Enter", "ArrowRight", "ArrowDown", "End", "Home", "ArrowLeft", "PageUp"];

const build = (label) =>
{
    for (const system of systems)
    {
        const outDir = join(here, "out/build", label, system);
        const result = spawnSync(process.execPath, [
            join(repoRoot, "apps/preview/scripts/vite-system.mjs"), "build", `--system=${system}`, "--own-css", `--base=/${label}/${system}/`, `--outDir=${outDir}`, "--emptyOutDir",
        ], { cwd: join(repoRoot, "apps/preview"), stdio: ["ignore", "ignore", "inherit"] });

        if (result.status !== 0) throw new Error(`preview build failed for ${system}`);
        console.log(`built ${label}/${system}`);
    }
};

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

/** out/build 를 그대로 내주는 서버. /<label>/<system>/ 이 index.html 이다 */
const serve = () => new Promise((resolve) =>
{
    const root = join(here, "out/build");
    const server = createServer((request, response) =>
    {
        let path = join(root, decodeURIComponent(new URL(request.url, "http://x").pathname));

        if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
        if (!path.startsWith(root) || !existsSync(path))
        {
            response.writeHead(404).end();

            return;
        }

        response.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" });
        createReadStream(path).pipe(response);
    });

    server.listen(0, "127.0.0.1", () => resolve({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }));
});

/** 접근성과 동작에 닿는 HTML 속성(aria-* · data-* 와 함께 적는다) */
const NATIVE_ATTRS = new Set(["role", "tabindex", "hidden", "disabled", "type", "readonly", "required", "inert", "open"]);

/** 페이지 안: 구역과 그 팝업 아래 요소마다의 접근성 속성. 키는 collectInPage 가 붙인 data-compare-key */
const attrsInPage = (native) =>
{
    const out = {};

    for (const element of document.querySelectorAll("[data-compare-key]"))
    {
        const attrs = {};

        for (const { name, value } of element.attributes)
        {
            if (name === "data-compare-key" || name === "class" || name === "style" || name === "id" || name === "for" || name.startsWith("aria-labelledby") || name.startsWith("aria-controls") || name.startsWith("aria-describedby")) continue;
            if (native.includes(name) || name.startsWith("aria-") || name.startsWith("data-")) attrs[name] = value;
        }

        out[element.getAttribute("data-compare-key")] = { tag: element.tagName.toLowerCase(), attrs };
    }

    return out;
};

/** 페이지 안: 구역 안 상태 속성의 지금 값과 포커스가 있는 요소의 키 */
const stateInPage = ({ section, pattern }) =>
{
    const re = new RegExp(pattern);
    const root = document.querySelector(`[data-coverage-section="${section}"]`);
    // 키는 DOM 의 깊이가 아니라 뜻으로 짓는다(슬롯 · role · 이름 · 몇 번째). 감싸는 요소가 하나 늘어도 같은 키가 된다.
    const keys = new Map();
    const seen = new Map();

    for (const element of root.querySelectorAll("*"))
    {
        const role = element.getAttribute("role");
        const name = (element.getAttribute("aria-label") ?? element.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
        const base = `${element.getAttribute("data-slot") ?? element.tagName.toLowerCase()}${role ? `(${role})` : ""} "${name}"`;
        const n = seen.get(base) ?? 0;

        seen.set(base, n + 1);
        keys.set(element, n ? `${base}#${n}` : base);
    }

    const keyOf = (element) =>
    {
        if (!element || !root.contains(element)) return element === document.body ? "(body)" : "(outside)";

        return keys.get(element);
    };
    const state = {};

    for (const element of root.querySelectorAll("*"))
    {
        const picked = [...element.attributes].filter(({ name }) => re.test(name)).map(({ name, value }) => `${name}=${value}`);

        if (element instanceof HTMLInputElement && element.type !== "hidden") picked.push(`value=${element.value}`, `checked=${element.checked}`);
        if (picked.length) state[keyOf(element)] = picked.sort().join(" ");
    }

    return { focus: keyOf(document.activeElement), state };
};

/** 페이지 안: Math.random 을 씨앗이 고정된 수열로 바꾼다(사이드바 스켈레톤의 너비 같은 것이 두 판에서 같게) */
const seededRandom = () =>
{
    let seed = 0x2f6b4c1d;

    Math.random = () =>
    {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const record = async (label) =>
{
    const server = await serve();
    const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {});
    const only = list("sections");
    const behave = list("behave") ?? DEFAULT_BEHAVE;

    const recordSystem = async (system) =>
    {
        if (!existsSync(join(here, "out/build", label, system, "index.html"))) throw new Error(`out/build/${label}/${system} 이 없다. build ${label} 을 먼저 돌린다`);

        for (const mode of MODES)
        {
            const dir = join(here, "out/record", arg("as", label), `${system}-${mode}`);
            const url = (section) => `${server.origin}/${label}/${system}/?system=${system}&mode=${mode}&motion=off&template=coverage${section ? `&section=${encodeURIComponent(section)}` : ""}`;
            const page = await coveragePage(browser, { url, mode, side: label });

            await page.page.addInitScript(seededRandom);
            const sections = (await page.sections()).filter((section) => !only || only.includes(section.name));
            const measured = {};

            mkdirSync(dir, { recursive: true });

            for (const section of sections)
            {
                const { rows } = await page.measure(section);
                const attrs = await page.page.evaluate(attrsInPage, [...NATIVE_ATTRS]);

                measured[section.name] = { rows, attrs };
                // 글자 선택은 컴포넌트의 모양이 아니다. UI SDK 는 열 때 채워진 입력칸의 글을 골라 두므로(네이티브 대화상자처럼)
                // 찍기 전에 선택을 거두어 포커스 표시만 남긴다. 커서는 찍히지 않는다.
                await page.page.evaluate(() =>
                {
                    const el = document.activeElement;

                    if (el instanceof HTMLInputElement && el.selectionEnd !== null && el.selectionStart !== el.selectionEnd) el.setSelectionRange(0, 0);
                    document.getSelection()?.removeAllRanges();
                }).catch(() => {});
                await page.shot(join(dir, `${section.name}.png`));
            }

            await page.close();

            // 동작은 BEHAVE_SYSTEMS 의 밝은 모드에서만 잰다. 색은 동작을 바꾸지 않는다.
            const behaviour = {};

            if (mode === "light" && BEHAVE_SYSTEMS.includes(system))
            {
                const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
                await context.addInitScript(seededRandom);
                const tab = await context.newPage();

                for (const section of sections.filter((entry) => behave.includes(entry.name)))
                {
                    const open = async () =>
                    {
                        await tab.goto(url(section.name), { waitUntil: "networkidle" });
                        await tab.waitForSelector('[data-specimen="coverage"]');
                        await tab.waitForTimeout(150);
                        // 포커스를 구역 바로 앞에 둔다
                        await tab.evaluate((name) =>
                        {
                            const root = document.querySelector(`[data-coverage-section="${name}"]`);
                            const anchor = document.createElement("span");

                            anchor.tabIndex = 0;
                            anchor.setAttribute("data-parity-anchor", "");
                            root.before(anchor);
                            anchor.focus();
                        }, section.name);
                    };
                    const snap = () => tab.evaluate(stateInPage, { section: section.name, pattern: STATE_ATTRS.source });
                    const steps = [];

                    await open();
                    steps.push({ step: "start", ...(await snap()) });

                    const order = [];

                    for (let index = 0; index < 40; index += 1)
                    {
                        await tab.keyboard.press("Tab");
                        const { focus } = await snap();

                        if (focus === "(outside)" || focus === "(body)") break;
                        order.push(focus);
                    }

                    steps.push({ step: "tab-order", order });

                    // 포커스가 멈추는 자리마다 처음부터 열고 키를 하나씩 누른다. 같은 자리가 두 번 나오면 한 번만 잰다
                    const stops = [...new Set(order)].slice(0, 16);

                    for (const stop of stops)
                    {
                        await open();

                        const hops = order.indexOf(stop) + 1;

                        for (let index = 0; index < hops; index += 1) await tab.keyboard.press("Tab");

                        for (const key of KEYS)
                        {
                            await tab.keyboard.press(key);
                            await tab.waitForTimeout(60);
                            steps.push({ step: `${stop} · ${key}`, ...(await snap()) });
                        }
                    }

                    behaviour[section.name] = steps;
                }

                await context.close();
            }

            writeFileSync(join(dir, "measure.json"), JSON.stringify({ measured, behaviour }));
            console.log(`recorded ${label} ${system}-${mode}: ${sections.length} sections${Object.keys(behaviour).length ? `, behaviour ${Object.keys(behaviour).length}` : ""}`);
        }
    };

    // --jobs 개의 시스템을 함께 잰다. 한 시스템 안의 구역은 차례로 연다
    const queue = [...systems];
    const jobs = Number(arg("jobs", "3"));

    await Promise.all(Array.from({ length: jobs }, async () =>
    {
        while (queue.length) await recordSystem(queue.shift());
    }));

    await browser.close();
    server.close();
};

const pixels = async (a, b, tolerance) =>
{
    const [left, right] = await Promise.all([a, b].map((path) => sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })));

    if (left.info.width !== right.info.width || left.info.height !== right.info.height) return { size: `${left.info.width}×${left.info.height} → ${right.info.width}×${right.info.height}`, count: Infinity };
    let count = 0;
    let max = 0;

    for (let index = 0; index < left.data.length; index += 4)
    {
        let differs = false;

        for (let channel = 0; channel < 4; channel += 1)
        {
            const delta = Math.abs(left.data[index + channel] - right.data[index + channel]);

            max = Math.max(max, delta);
            if (delta > tolerance) differs = true;
        }

        if (differs) count += 1;
    }

    return { count, max };
};

const compare = async (before, after) =>
{
    const tolerance = Number(arg("tolerance", "0"));
    const root = join(here, "out/record");
    const failures = [];
    const warnings = [];
    const known = [];

    const systems = list("systems");

    for (const folder of readdirSync(join(root, before)).sort())
    {
        if (systems && !systems.some((system) => folder.startsWith(`${system}-`))) continue;

        const leftPath = join(root, before, folder, "measure.json");

        if (!existsSync(leftPath))
        {
            failures.push(`${folder}: "${before}" record is incomplete`);
            continue;
        }

        const left = JSON.parse(readFileSync(leftPath, "utf8"));
        const rightPath = join(root, after, folder, "measure.json");

        if (!existsSync(rightPath))
        {
            failures.push(`${folder}: no "${after}" record`);
            continue;
        }

        const right = JSON.parse(readFileSync(rightPath, "utf8"));

        const only = list("sections");

        // 고른 구역이 앞 기록에 없으면 대조하지 않은 것이라 조용히 넘기지 않는다.
        for (const section of only ?? [])
        {
            if (!left.measured[section]) failures.push(`${folder} · ${section}: missing before`);
        }

        for (const [section, { rows, attrs }] of Object.entries(left.measured))
        {
            if (only && !only.includes(section)) continue;
            const other = right.measured[section];
            const where = `${folder} · ${section}`;

            if (!other)
            {
                failures.push(`${where}: missing after`);
                continue;
            }

            const shot = await pixels(join(root, before, folder, `${section}.png`), join(root, after, folder, `${section}.png`), tolerance);
            const sectionStart = failures.length;
            let shotLine;

            if (shot.count)
            {
                const line = `${where}: ${shot.size ?? `${shot.count}px differ (max Δ${shot.max})`}`;
                if (!shot.size && shot.max <= NOISE) known.push(`${line} — 같은 빌드를 다시 찍어도 나는 그리기의 잡음이다(채널 차이 ${NOISE} 이하)`);
                else if (!shot.size && SMALL_SHIFT[section] && shot.count <= SMALL_SHIFT[section].count) known.push(`${line} — ${SMALL_SHIFT[section].reason}`);
                else shotLine = line;
            }

            const byKey = new Map(other.rows.map((row) => [row.key, row]));

            for (const row of rows)
            {
                const match = byKey.get(row.key);

                if (!match)
                {
                    failures.push(`${where}: element ${row.key} gone`);
                    continue;
                }

                for (const [prop, value] of Object.entries(row.values))
                {
                    if (match.values[prop] === value) continue;
                    const line = `${where}: ${row.key} ${prop} ${value} → ${match.values[prop]}`;
                    const rule = accepted(section, row.key, prop);

                    if (rule) known.push(`${line} — ${rule.reason}`);
                    else failures.push(line);
                }

                byKey.delete(row.key);
            }

            for (const key of byKey.keys()) failures.push(`${where}: element ${key} new`);

            for (const [key, { tag, attrs: values }] of Object.entries(attrs))
            {
                const match = other.attrs[key];

                if (!match) continue;

                if (match.tag !== tag)
                {
                    const line = `${where}: ${key} <${tag}> → <${match.tag}>`;
                    const rule = accepted(section, key, "<tag>");

                    if (rule) known.push(`${line} — ${rule.reason}`);
                    else failures.push(line);
                }

                for (const name of new Set([...Object.keys(values), ...Object.keys(match.attrs)]))
                {
                    if (values[name] === match.attrs[name]) continue;
                    if (name === "aria-disabled" && (values[name] ?? "false") === "false" && (match.attrs[name] ?? "false") === "false") continue;
                    if (name === "tabindex" && FOCUSABLE_TAGS.has(tag) && (values[name] ?? "0") === "0" && (match.attrs[name] ?? "0") === "0") continue;
                    const line = `${where}: ${key} ${name}=${values[name] ?? "(none)"} → ${match.attrs[name] ?? "(none)"}`;
                    const rule = accepted(section, key, name);

                    if (rule) known.push(`${line} — ${rule.reason}`);
                    else if (!name.startsWith("data-")) failures.push(line);
                    else (STYLED_DATA.has(name) && values[name] !== undefined && match.attrs[name] === undefined ? failures : warnings).push(line);
                }
            }

            if (shotLine)
            {
                // 화면 차이가 처음부터 열린 팝업의 포커스 표시뿐이면(다른 차이가 모두 알고 둔 것이고 포커스 줄이 있으면) 그 까닭으로 읽는다.
                const rest = failures.slice(sectionStart);
                const focusOnly = rest.some((line) => FOCUS_ON_MOUNT.test(line)) && rest.every((line) => KNOWN.some(([pattern]) => pattern.test(line)));

                if (focusOnly) known.push(`${shotLine} — ${FOCUS_ON_MOUNT_REASON}`);
                else failures.push(shotLine);
            }
        }

        for (const [section, steps] of Object.entries(left.behaviour))
        {
            if (only && !only.includes(section)) continue;
            const other = (right.behaviour[section] ?? []).map(aliasStep);
            const where = `${folder} · behaviour ${section}`;

            // 단계는 Tab 으로 닿는 자리에서 나오므로, 그 자리가 바뀌면 순서가 아니라 이름으로 짝을 짓는다.
            // 한쪽에만 있는 단계는 Tab 순서의 차이가 이미 말하므로 따로 적는다.
            const byStep = new Map(other.map((entry) => [entry.step, entry]));

            for (const entry of other)
            {
                if (!steps.some((step) => step.step === entry.step)) failures.push(`${where}: step only after ${entry.step}`);
            }

            steps.forEach((step) =>
            {
                const match = byStep.get(step.step);

                if (!match)
                {
                    failures.push(`${where}: step only before ${step.step}`);

                    return;
                }

                if (step.order && step.order.join(" | ") !== match.order.join(" | ")) failures.push(`${where}: tab order ${step.order.join(" | ")} → ${match.order.join(" | ")}`);
                if (step.focus !== match.focus) failures.push(`${where}: ${step.step} focus ${step.focus} → ${match.focus}`);

                for (const key of new Set([...Object.keys(step.state ?? {}), ...Object.keys(match.state ?? {})]))
                {
                    // tabindex=0 은 Tab 순서와 포커스 비교가 이미 잰다. 상태 줄에서는 data-* 와 함께 뺀다
                    // 값에 빈칸이 들 수 있으므로(aria-valuetext=20 start range) 「이름=」 앞에서만 나눈다
                    const parts = (value) => (value ?? "").split(/ (?=[a-z-]+=)/);
                    const strip = (value) => parts(value).filter((part) => !part.startsWith("data-") && part !== "tabindex=0" && part !== "aria-disabled=false").join(" ");
                    const lenient = (value) => parts(strip(value)).filter((part) => !accepted(section, key, part.split("=")[0])).join(" ");
                    const a = step.state?.[key];
                    const b = match.state?.[key];
                    const line = `${where}: ${step.step} ${key}: ${a ?? "(none)"} → ${b ?? "(none)"}`;

                    const data = (value) => parts(value).filter((part) => part.startsWith("data-")).join(" ");

                    if (strip(a) !== strip(b))
                    {
                        if (a !== undefined && b !== undefined && lenient(a) === lenient(b)) known.push(`${line} — ${accepted(section, key, parts(strip(a)).concat(parts(strip(b))).map((part) => part.split("=")[0]).find((attr) => accepted(section, key, attr)))?.reason}`);
                        else failures.push(line);
                    }
                    else if (data(a) !== data(b)) warnings.push(line);
                }
            });
        }
    }

    for (let index = failures.length - 1; index >= 0; index -= 1)
    {
        const reason = KNOWN.find(([pattern]) => pattern.test(failures[index]))?.[1];

        if (reason)
        {
            known.unshift(`${failures[index]} — ${reason}`);
            failures.splice(index, 1);
        }
    }

    const report = [
        `# headless-parity ${before} → ${after}`, "", `${failures.length} differences, ${known.length} known, ${warnings.length} data-* warnings`, "",
        "## differences", ...failures.map((line) => `- ${line}`), "", "## known", ...known.map((line) => `- ${line}`), "", "## data-* warnings", ...warnings.map((line) => `- ${line}`),
    ].join("\n");

    writeFileSync(join(here, "out", `compare-${before}-${after}.md`), report);
    console.log(`${failures.length} differences, ${known.length} known, ${warnings.length} data-* warnings → out/compare-${before}-${after}.md`);
    failures.slice(0, 30).forEach((line) => console.log(`  ${line}`));
    process.exit(failures.length ? 1 : 0);
};

if (command === "build" && positional[0]) build(positional[0]);
else if (command === "record" && positional[0]) await record(positional[0]);
else if (command === "compare" && positional[1]) await compare(positional[0], positional[1]);
else
{
    console.error("usage: headless-parity build <label> | record <label> | compare <before> <after>");
    process.exit(2);
}

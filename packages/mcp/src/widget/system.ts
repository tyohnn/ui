import { App } from "@modelcontextprotocol/ext-apps/app-with-deps";

/**
 * The System view: a design system drawn on a real screen beside every token that shapes it. It holds no state of
 * its own: every result of show_system · set_colours · set_tokens redraws it, and every edit made here calls those
 * same tools, so the agent and the person shape one system. Sliders move the preview at once (postMessage to the
 * preview's token bridge) and reach the server when let go.
 */

interface Control
{
    token: string;
    label: string;
    range?: { min: number; max: number; step: number; unit: "px" | "rem" | "em"; fallback?: number };
    options?: { label: string; value: string; hint?: string }[];
}

interface Axis
{
    id: string;
    title: string;
    hint: string;
    controls: Control[];
}

type Mode = "light" | "dark";
type Colours = Record<string, string>;

interface SystemData
{
    system: string;
    mode: Mode;
    palette: string;
    accent: string | null;
    chart: string | null;
    colours: Record<Mode, Colours>;
    tokens: Record<string, string>;
    preset: string | null;
    changes: number;
}

interface ViewMeta
{
    previewBase: string;
    systems: { name: string; tagline: string; defaultMode: Mode }[];
    screens: { id: string; label: string; width: number; height: number }[];
    axes: Axis[];
    colourGroups: Record<string, string[]>;
    colours: Record<Mode, Colours>;
    vars: Record<string, string>;
    swatches: {
        palettes: { id: string; kind: "system" | "base"; dots: string[] }[];
        accents: { id: string; chip: string; ramp: string[] }[];
    };
    tailwind: { name: string; shades: [string, string][] }[];
}

interface ToolResult
{
    content?: { type: string; text?: string }[];
    structuredContent?: unknown;
    _meta?: Record<string, unknown>;
    isError?: boolean;
}

type Call = (name: string, args: Record<string, unknown>) => Promise<ToolResult>;

const view: {
    data: SystemData | null;
    meta: ViewMeta | null;
    screen: string;
    query: string;
    open: Set<string>;
    every: boolean;
    colourGroup: string;
    defaults: Record<string, string>;
    /** The vars the preview holds now, so the next result sends only what moved (and nulls for what was cleared) */
    applied: Record<string, string>;
    loaded: string;
} = { data: null, meta: null, screen: "crm-dashboard", query: "", open: new Set(["colour", "density"]), every: false, colourGroup: "base", defaults: {}, applied: {}, loaded: "" };

/** How edits reach the server: the host's bridge, or the local harness's stand-in */
let call: Call | null = null;
/** Tells the model what the person changed here, so the next turn starts from it */
let tellModel: (text: string) => void = () => undefined;
/** Hands the system to the agent as the person's message */
let sendToAgent: ((text: string) => void) | null = null;
/** Switches the host between inline and fullscreen, when it offers fullscreen */
let toggleFullscreen: (() => void) | null = null;

const wireExpand = () =>
{
    const expand = document.querySelector<HTMLButtonElement>("[data-expand]");

    if (!expand || !toggleFullscreen) return;
    expand.hidden = false;
    expand.textContent = document.documentElement.dataset.display === "fullscreen" ? "Back to chat" : "Expand";
    expand.onclick = toggleFullscreen;
};

const esc = (value: string) => value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

const $ = <T extends HTMLElement>(selector: string, root: ParentNode = document) => root.querySelector(selector) as T;

const el = (tag: string, className = "", html = "") =>
{
    const node = document.createElement(tag);

    if (className) node.className = className;
    if (html) node.innerHTML = html;

    return node;
};

const textOf = (result: ToolResult) => (result.content ?? []).map((part) => part.text ?? "").join("\n");

const toast = (title: string, body: string, error = false) =>
{
    const node = el("div", "toast", `<b>${esc(title)}</b>${esc(body)}`);

    if (error) node.dataset.error = "";
    document.body.append(node);
    setTimeout(() => node.remove(), error ? 6000 : 4000);
};

const edit = async (name: string, args: Record<string, unknown>, said: string) =>
{
    if (!call)
    {
        toast("Not connected", "Open this view from a chat to change the system.", true);
        return;
    }

    try
    {
        const result = await call(name, args);

        show(result);
        if (!result.isError) tellModel(`The person changed the system in the tyohnn view (${said}). It is now:\n${textOf(result)}`);
    }
    catch (error)
    {
        toast("Could not change it", error instanceof Error ? error.message : String(error), true);
    }
};

// ── colours ────────────────────────────────────────────────────────────────────────────────────────────────────

const resolve = (values: Colours, value: string | undefined, depth = 0): string =>
    (value ?? "").replace(/var\(--([a-z0-9-]+)\)/g, (whole, name: string) => values[name] && depth < 8 ? resolve(values, values[name], depth + 1) : whole);

const dots = (colours: string[]) => `<span class="dots">${colours.map((colour) => `<i style="background:${esc(colour)}"></i>`).join("")}</span>`;
const ramp = (colours: string[]) => `<span class="ramp">${colours.map((colour) => `<i style="background:${esc(colour)}"></i>`).join("")}</span>`;
const chip = (colour: string) => `<span class="chip" style="background:${esc(colour)}"></span>`;

const paletteDots = (id: string) => dots(view.meta?.swatches.palettes.find((entry) => entry.id === id)?.dots ?? []);

// ── combobox (the site's): a trigger showing the value, a popup with a filter and the options ──────────────────

interface Option
{
    label: string;
    value: string;
    hint?: string;
    group?: string;
    art?: string;
    font?: string;
}

const combobox = ({ options, value, label, placeholder, face, onChange }: {
    options: Option[];
    value: string;
    label: string;
    placeholder: string;
    face?: (option: Option) => string;
    onChange: (value: string) => void;
}) =>
{
    const root = el("div", "cb", `<button type="button" class="cb-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(label)}"><span></span></button>`);
    const trigger = root.firstElementChild as HTMLButtonElement;
    const current = options.find((option) => option.value === value) ?? options[0];
    const inner = trigger.firstElementChild as HTMLElement;

    inner.innerHTML = face ? face(current) : `${current.art ?? ""}<span>${esc(current.label)}</span>`;
    if (current.font) inner.style.fontFamily = current.font;

    let pop: HTMLElement | null = null;
    let active = 0;

    const outside = (event: Event) =>
    {
        if (!root.contains(event.target as Node)) close();
    };
    const close = () =>
    {
        pop?.remove();
        pop = null;
        trigger.setAttribute("aria-expanded", "false");
        document.removeEventListener("pointerdown", outside);
    };
    const pick = (option: Option) =>
    {
        close();
        if (option.value !== value) onChange(option.value);
    };

    const open = () =>
    {
        pop = el("div", "cb-pop", `<input type="text" placeholder="${esc(placeholder)}" aria-label="Filter"><div class="cb-list" role="listbox"></div>`);

        const input = $<HTMLInputElement>("input", pop);
        const list = $<HTMLElement>(".cb-list", pop);
        let shown = options;

        const draw = () =>
        {
            const words = input.value.toLowerCase();
            let group: string | undefined;

            shown = options.filter((option) => option.label.toLowerCase().includes(words));
            active = Math.max(0, Math.min(active, shown.length - 1));
            list.replaceChildren(...shown.flatMap((option, index) =>
            {
                const row = el("div", "cb-opt", `<span class="check">${option.value === value ? "✓" : ""}</span>${option.art ?? ""}<span${option.font ? ` style="font-family:${esc(option.font)}"` : ""}>${esc(option.label)}</span>${option.hint ? `<small>${esc(option.hint)}</small>` : ""}`);
                const head = option.group && option.group !== group ? el("div", "cb-head", esc((group = option.group))) : null;

                row.setAttribute("role", "option");
                row.setAttribute("aria-selected", String(option.value === value));
                if (index === active) row.dataset.active = "";
                row.onclick = () => pick(option);

                return head ? [head, row] : [row];
            }));
            if (shown.length === 0) list.innerHTML = `<div class="cb-empty">No match</div>`;
        };

        input.oninput = () =>
        {
            active = 0;
            draw();
        };
        input.onkeydown = (event) =>
        {
            if (event.key === "ArrowDown") active = Math.min(active + 1, shown.length - 1);
            else if (event.key === "ArrowUp") active = Math.max(active - 1, 0);
            else if (event.key === "Enter" && shown[active]) return pick(shown[active]);
            else if (event.key === "Escape") return close();
            else return;
            event.preventDefault();
            draw();
        };
        active = Math.max(0, options.findIndex((option) => option.value === value));
        draw();
        root.append(pop);
        trigger.setAttribute("aria-expanded", "true");
        input.focus();
        document.addEventListener("pointerdown", outside);
    };

    trigger.onclick = () => (pop ? close() : open());

    return root;
};

// ── the preview: the frame, and the vars it holds ──────────────────────────────────────────────────────────────

const frame = document.createElement("iframe");

frame.title = "Preview";

const post = (message: Record<string, unknown>) =>
{
    if (!view.meta) return;
    frame.contentWindow?.postMessage(message, new URL(view.meta.previewBase).origin);
};

/** Sends the preview what moved since it last heard: new values, and null for each var cleared */
const syncVars = () =>
{
    const vars = view.meta?.vars ?? {};
    const tokens: Record<string, string | null> = {};

    for (const name of Object.keys(view.applied)) if (!(name in vars)) tokens[name] = null;
    for (const [name, value] of Object.entries(vars)) if (view.applied[name] !== value) tokens[name] = value;

    if (Object.keys(tokens).length > 0) post({ type: "tyohnn:set-tokens", tokens });
    view.applied = { ...vars };
};

const screenOf = () => view.meta?.screens.find((screen) => screen.id === view.screen) ?? view.meta?.screens[0];

const fit = () =>
{
    const canvas = document.querySelector<HTMLElement>(".canvas");
    const screen = screenOf();

    if (!canvas || !screen) return;

    const scale = canvas.clientWidth / screen.width;

    frame.style.width = `${screen.width}px`;
    frame.style.height = `${Math.max(screen.height, canvas.clientHeight / scale)}px`;
    frame.style.transform = `scale(${scale})`;

    const hint = document.querySelector(".stagebar .hint");

    if (hint) hint.textContent = `${screen.width}px · ${Math.round(scale * 100)}%`;
};

/** A new system, mode or screen loads the frame again; otherwise only the vars that moved are sent */
const syncFrame = () =>
{
    const { data, meta } = view;

    if (!data || !meta) return;

    const key = `${data.system}/${data.mode}/${view.screen}`;

    if (key === view.loaded) return syncVars();

    view.loaded = key;
    view.applied = {};
    view.defaults = {};
    frame.src = `${meta.previewBase.replace(/\/$/, "")}/${data.system}/index.html?template=${view.screen}&mode=${data.mode}`;
    fit();
};

frame.addEventListener("load", () =>
{
    syncVars();
    post({ type: "tyohnn:read-tokens", id: view.loaded, names: (view.meta?.axes ?? []).flatMap((axis) => axis.controls.map((control) => control.token)) });
});

window.addEventListener("message", (event) =>
{
    const message = event.data as { type?: string; id?: string; values?: Record<string, string> } | null;

    if (event.source !== frame.contentWindow || message?.type !== "tyohnn:tokens" || message.id !== view.loaded) return;

    view.defaults = message.values ?? {};
    renderSidebar();
});

// ── the sidebar ────────────────────────────────────────────────────────────────────────────────────────────────

const numberOf = (control: Control) =>
{
    const range = control.range as NonNullable<Control["range"]>;
    const raw = view.data?.tokens[control.token] ?? view.defaults[control.token] ?? "";
    const number = parseFloat(raw);

    if (Number.isNaN(number)) return range.fallback ?? range.min;
    // A token written in rem read by a px slider (and the other way) converts at 16px
    if (range.unit === "px" && /rem$/.test(raw)) return number * 16;
    if (range.unit === "rem" && /px$/.test(raw)) return number / 16;

    return number;
};

const nameTag = (label: string, token: string) => `<span class="name" data-token="${esc(token)}">${esc(label)}</span>`;

const controlRow = (control: Control) =>
{
    const data = view.data as SystemData;
    const row = el("div", "row");
    const changed = control.token in data.tokens;

    if (changed) row.dataset.changed = "";

    if (control.options)
    {
        row.innerHTML = nameTag(control.label, control.token);
        row.append(combobox({
            label: control.label,
            value: data.tokens[control.token] ?? "",
            placeholder: `Search ${control.label.toLowerCase()}…`,
            options: [
                { label: "System", value: "", hint: `${data.system}'s` },
                ...control.options.map((option) => ({ ...option, font: control.token.startsWith("--font") ? option.value : undefined })),
            ],
            onChange: (value) => edit("set_tokens", { tokens: { [control.token]: value || null } }, `${control.token} ${value || "back to the system's"}`),
        }));

        return row;
    }

    const range = control.range as NonNullable<Control["range"]>;
    const number = numberOf(control);

    row.innerHTML = `${nameTag(control.label, control.token)}<span class="value">${+number.toFixed(3)}${range.unit}</span><input type="range" min="${range.min}" max="${range.max}" step="${range.step}" value="${number}" aria-label="${esc(control.label)}">`;

    const slider = $<HTMLInputElement>("input", row);

    slider.oninput = () =>
    {
        $<HTMLElement>(".value", row).textContent = `${slider.value}${range.unit}`;
        post({ type: "tyohnn:set-tokens", tokens: { [control.token]: `${slider.value}${range.unit}` } });
    };
    slider.onchange = () => edit("set_tokens", { tokens: { [control.token]: `${slider.value}${range.unit}` } }, `${control.token} ${slider.value}${range.unit}`);

    return row;
};

const section = (id: string, title: string, hint: string, moved: number) =>
{
    const details = el("details", "", `<summary><b>${esc(title)}</b><span>${esc(hint)}</span><span class="count"${moved ? "" : " data-zero"}>${moved}</span></summary>`) as HTMLDetailsElement;

    details.open = view.open.has(id) || view.query !== "";
    details.addEventListener("toggle", () => (details.open ? view.open.add(id) : view.open.delete(id)));

    return details;
};

const colourSection = () =>
{
    const data = view.data as SystemData;
    const meta = view.meta as ViewMeta;
    const mode = data.mode;
    const query = view.query;
    const all = Object.values(meta.colourGroups).flat();
    const edits = data.colours[mode];
    const editCount = Object.keys(data.colours.light).length + Object.keys(data.colours.dark).length;
    const moved = (data.palette !== data.system ? 1 : 0) + (data.accent ? 1 : 0) + (data.chart ? 1 : 0) + editCount;
    const details = section("colour", "Colour", "palette · accent · chart", moved);

    const pick = (label: string, token: string, changed: boolean, box: HTMLElement) =>
    {
        const row = el("div", "pick", nameTag(label, token));

        if (changed) row.dataset.changed = "";
        row.append(box);
        details.append(row);
    };

    const palettes = meta.swatches.palettes;

    pick("Palette", "72 colours, light and dark", data.palette !== data.system, combobox({
        label: "Palette",
        value: data.palette,
        placeholder: `Search ${palettes.length} palettes…`,
        options: palettes.map((entry) => ({
            label: entry.id,
            value: entry.id,
            group: entry.kind === "system" ? "Systems' palettes" : "shadcn bases",
            hint: entry.id === data.system ? "this system's" : "",
            art: dots(entry.dots),
        })),
        onChange: (value) => edit("set_colours", { palette: value }, `palette ${value}`),
    }));

    const accents = meta.swatches.accents;

    pick("Accent", "--primary · --secondary · --sidebar-primary · --chart-*", data.accent !== null, combobox({
        label: "Accent",
        value: data.accent ?? "",
        placeholder: `Search ${accents.length} accents…`,
        options: [{ label: "None", value: "", hint: "the palette's own" }, ...accents.map((accent) => ({ label: accent.id, value: accent.id, art: chip(accent.chip) }))],
        onChange: (value) => edit("set_colours", { accent: value || null }, value ? `accent ${value}` : "no accent"),
    }));

    const charts = meta.colourGroups.chart ?? [];
    const now = meta.colours[mode];

    pick("Chart", "--chart-1 … --chart-5", data.chart !== null, combobox({
        label: "Chart",
        value: data.chart ?? "",
        placeholder: "Search chart ramps…",
        options: [
            { label: "Palette's", value: "", art: ramp(charts.map((name) => resolve(now, now[name]))) },
            ...accents.map((accent) => ({ label: accent.id, value: accent.id, art: ramp(accent.ramp) })),
        ],
        onChange: (value) => edit("set_colours", { chart: value || null }, value ? `chart ramp ${value}` : "the palette's chart ramp"),
    }));

    // Every colour: folded, since the agent is the one who mostly reaches in here
    const names = query ? all.filter((name) => name.includes(query)) : meta.colourGroups[view.colourGroup] ?? [];
    const every = el("details", "every", `<summary><b>Every colour</b><span>${all.length} · ${mode}</span><span class="count"${editCount ? "" : " data-zero"}>${editCount}</span></summary>`) as HTMLDetailsElement;

    every.open = view.every || (query !== "" && names.length > 0);
    every.addEventListener("toggle", () => (view.every = every.open));

    if (!query)
    {
        const tabs = el("div", "gtabs");

        for (const group of Object.keys(meta.colourGroups))
        {
            const tab = el("button", "", esc(group)) as HTMLButtonElement;

            tab.type = "button";
            tab.setAttribute("aria-pressed", String(group === view.colourGroup));
            if (meta.colourGroups[group].some((name) => name in edits)) tab.dataset.moved = "";
            tab.onclick = () =>
            {
                view.colourGroup = group;
                renderSidebar();
            };
            tabs.append(tab);
        }
        every.append(tabs);
    }

    every.append(el("div", "note", `Editing ${mode}. Switch Light / Dark above for the other.`));

    for (const name of names)
    {
        const row = el("button", "crow", `<i style="background:${esc(resolve(now, now[name]))}"></i><b data-token="--${esc(name)}">${esc(name)}</b><span>${esc(now[name] ?? "unset")}</span>`) as HTMLButtonElement;

        row.type = "button";
        if (name in edits) row.dataset.changed = "";
        if (picker?.name === name) row.classList.add("on");
        row.onclick = () => openPicker(name, row);
        every.append(row);
    }

    details.append(every);

    return details;
};

const renderSidebar = () =>
{
    const { data, meta } = view;
    const groups = document.querySelector<HTMLElement>(".groups");

    if (!data || !meta || !groups) return;

    const scroll = groups.scrollTop;
    const query = view.query;
    const all = Object.values(meta.colourGroups).flat().join(" ");

    groups.replaceChildren();
    if (!query || `colour palette accent chart ${all}`.includes(query)) groups.append(colourSection());

    for (const axis of meta.axes)
    {
        const controls = axis.controls.filter((control) => !query || `${control.label} ${control.token}`.toLowerCase().includes(query));

        if (controls.length === 0) continue;

        const details = section(axis.id, axis.title, axis.hint, controls.filter((control) => control.token in data.tokens).length);

        details.append(...controls.map(controlRow));
        groups.append(details);
    }

    // Tokens set that have no control here (the agent can set any the system declares) still show, under Other
    const known = new Set(meta.axes.flatMap((axis) => axis.controls.map((control) => control.token)));
    const other = Object.entries(data.tokens).filter(([token]) => !known.has(token) && (!query || token.includes(query)));

    if (other.length > 0)
    {
        const details = section("other", "Other", "set by your agent", other.length);

        for (const [token, value] of other)
        {
            const row = el("div", "row", `${nameTag(token, token)}<span class="value">${esc(value)}</span>`);
            const undo = el("button", "ghost", "Undo") as HTMLButtonElement;

            row.dataset.changed = "";
            undo.type = "button";
            undo.onclick = () => edit("set_tokens", { tokens: { [token]: null } }, `${token} back to the system's`);
            row.append(undo);
            details.append(row);
        }
        groups.append(details);
    }

    groups.scrollTop = scroll;

    const total = document.querySelector<HTMLElement>(".primary .count");

    if (total)
    {
        total.textContent = String(data.changes);
        total.toggleAttribute("data-zero", data.changes === 0);
    }

    const summary = document.querySelector(".foot span");

    if (summary) summary.textContent = data.changes ? `${data.changes} change${data.changes > 1 ? "s" : ""} from ${data.system}` : "Nothing changed yet";
};

// ── the colour picker beside the panel: Tailwind's palette, or a value by hand ─────────────────────────────────

let picker: { name: string; node: HTMLElement } | null = null;

const closePicker = () =>
{
    picker?.node.remove();
    picker = null;
    document.querySelectorAll(".crow.on").forEach((row) => row.classList.remove("on"));
};

const openPicker = (name: string, row: HTMLElement) =>
{
    closePicker();

    const node = el("div", "cpick");
    const tailwind = view.meta?.tailwind ?? [];
    let tab: "tailwind" | "custom" = tailwind.length > 0 ? "tailwind" : "custom";

    picker = { name, node };
    row.classList.add("on");

    const set = (value: string | null) =>
    {
        const mode = (view.data as SystemData).mode;

        edit("set_colours", { [mode]: { [name]: value } }, value ? `${name} ${value} in ${mode}` : `${name} back to the palette's in ${mode}`).then(draw);
    };

    const draw = () =>
    {
        if (picker?.node !== node || !view.data || !view.meta) return;

        const mode = view.data.mode;
        const value = view.meta.colours[mode][name] ?? "";
        const key = value.replace(/\s+/g, " ").trim();
        const named = tailwind.flatMap((family) => family.shades.filter(([, shade]) => shade === key).map(([shade]) => `${family.name}-${shade}`))[0];
        const grid = tailwind.map((family) => `<div class="cfam"><span>${esc(family.name)}</span>${family.shades.map(([shade, colour]) => `<button type="button" title="${esc(`${family.name}-${shade}`)}" data-v="${esc(colour)}"${colour === key ? ' class="on"' : ""} style="background:${esc(colour)}"></button>`).join("")}</div>`).join("");
        const extra = [["white", "#ffffff"], ["black", "#000000"], ["transparent", "transparent"]].map(([label, colour]) => `<button type="button" data-v="${colour}"${colour === key ? ' class="on"' : ""}><i style="background:${colour}"></i>${label}</button>`).join("");

        node.innerHTML = `<header><b>--${esc(name)}</b><span class="ptabs">${tailwind.length > 0 ? `<button type="button" data-t="tailwind" aria-selected="${tab === "tailwind"}">Tailwind</button>` : ""}<button type="button" data-t="custom" aria-selected="${tab === "custom"}">Custom</button></span><button type="button" data-close aria-label="Close">×</button></header>
            ${tab === "tailwind"
                ? `<div class="cgrid">${grid}<div class="cfam extra"><span></span>${extra}</div></div>`
                : `<div class="custom"><input value="${esc(value)}" spellcheck="false" aria-label="Value"><small>Hex, oklch(…), color-mix(…) or var(--…). Enter to apply.</small></div>`}
            <footer><span>${esc(mode)} · ${esc(named ?? value)}</span>${name in view.data.colours[mode] ? `<button type="button" class="ghost" data-undo>Undo edit</button>` : ""}</footer>`;

        node.querySelectorAll<HTMLElement>("[data-t]").forEach((button) => (button.onclick = () =>
        {
            tab = button.dataset.t as typeof tab;
            draw();
        }));
        node.querySelectorAll<HTMLElement>("[data-v]").forEach((button) => (button.onclick = () => set(button.dataset.v ?? null)));
        $<HTMLElement>("[data-close]", node).onclick = closePicker;
        node.querySelector<HTMLElement>("[data-undo]")?.addEventListener("click", () => set(null));

        const input = node.querySelector<HTMLInputElement>(".custom input");

        if (input) input.onkeydown = (event) =>
        {
            if (event.key === "Enter" && input.value.trim()) set(input.value.trim());
        };
    };

    draw();
    document.body.append(node);

    const aside = (document.querySelector("aside") as HTMLElement).getBoundingClientRect();
    const box = row.getBoundingClientRect();

    node.style.left = `${Math.min(aside.right + 10, innerWidth - node.offsetWidth - 12)}px`;
    node.style.top = `${Math.max(12, Math.min(box.top - 8, innerHeight - node.offsetHeight - 12))}px`;
};

document.addEventListener("pointerdown", (event) =>
{
    const target = event.target as HTMLElement;

    if (picker && !picker.node.contains(target) && !target.closest(".crow")) closePicker();
});
document.addEventListener("keydown", (event) =>
{
    if (event.key === "Escape") closePicker();
});

// ── the token behind a control ─────────────────────────────────────────────────────────────────────────────────

const tip = el("div", "tip");

tip.hidden = true;
document.body.append(tip);
document.addEventListener("pointerover", (event) =>
{
    const target = (event.target as HTMLElement).closest?.<HTMLElement>("[data-token]");
    const token = target?.dataset.token;

    if (!target || !token || !view.data)
    {
        tip.hidden = true;
        return;
    }

    const now = view.data.tokens[token];
    const was = view.defaults[token];

    tip.innerHTML = token in view.defaults || now
        ? `<b>${esc(token)}</b>${now ? `<span>${esc(now)}</span> · ` : ""}${esc(view.data.system)} <span>${esc(was || "unset")}</span>`
        : `<b>${esc(token)}</b>`;
    tip.hidden = false;

    const box = target.getBoundingClientRect();

    tip.style.left = `${Math.min(box.left, innerWidth - tip.offsetWidth - 8)}px`;
    tip.style.top = `${Math.max(4, box.top - tip.offsetHeight - 6)}px`;
});

// ── the frame of the view: built once, the parts redrawn per result ───────────────────────────────────────────

const app = document.getElementById("app") as HTMLElement;

const build = () =>
{
    app.innerHTML = `
        <header class="top">
            <div class="logo"><span class="mark">${"<i></i>".repeat(9)}</span><span>tyohnn</span></div>
            <nav class="tabs" role="tablist">
                <button type="button" role="tab" aria-selected="true">System</button>
                <button type="button" role="tab" aria-selected="false" disabled title="Coming next">Components</button>
                <button type="button" role="tab" aria-selected="false" disabled title="Coming next">Templates</button>
            </nav>
            <div class="spacer"></div>
            <button type="button" class="ghost" data-expand hidden>Expand</button>
            <button type="button" class="ghost" data-reset>Start over</button>
            <button type="button" class="primary" data-use>Use this system<span class="count" data-zero>0</span></button>
        </header>
        <div class="main">
            <aside>
                <div class="syscard"><div data-systems></div><div class="sysrow"><span data-systag></span><div class="seg" data-mode><button type="button" data-m="light">Light</button><button type="button" data-m="dark">Dark</button></div></div></div>
                <div class="search"><input type="search" placeholder="Search tokens" aria-label="Search tokens"></div>
                <div class="groups"></div>
                <div class="foot"><span>Nothing changed yet</span></div>
            </aside>
            <section class="stage">
                <div class="stagebar"><span class="label">Preview on</span><div data-screen></div><span class="hint"></span></div>
                <div class="canvas"></div>
            </section>
        </div>`;

    $<HTMLElement>(".canvas", app).append(frame);
    wireExpand();
    new ResizeObserver(fit).observe($<HTMLElement>(".canvas", app));

    const search = $<HTMLInputElement>(".search input", app);

    search.oninput = () =>
    {
        view.query = search.value.trim().toLowerCase();
        renderSidebar();
    };

    app.querySelectorAll<HTMLButtonElement>("[data-m]").forEach((button) => (button.onclick = () =>
    {
        if (button.dataset.m !== view.data?.mode) edit("show_system", { mode: button.dataset.m }, `${button.dataset.m} mode`);
    }));

    $<HTMLElement>("[data-reset]", app).onclick = () =>
    {
        if (view.data) edit("show_system", { system: view.data.system }, `started over on ${view.data.system}`);
    };

    $<HTMLElement>("[data-use]", app).onclick = () =>
    {
        const data = view.data;

        if (!data) return;

        const words = `${data.system}, ${data.palette} palette${data.accent ? `, ${data.accent} accent` : ""}${data.chart ? `, ${data.chart} charts` : ""}${data.changes ? `, ${data.changes} change${data.changes > 1 ? "s" : ""}` : ""}`;

        if (sendToAgent)
        {
            sendToAgent(`Use this design system for my project: ${words}.`);
            toast("Sent to your agent", `${words}. It will set the system up for you.`);
        }
        else toast("Not connected", "Open this view from a chat to hand the system to your agent.", true);
    };
};

const renderTop = () =>
{
    const { data, meta } = view;

    if (!data || !meta) return;

    const holder = $<HTMLElement>("[data-systems]", app);
    const ours = new Set(["graphite", "loam", "cirrus", "halo", "nocturne", "vellum", "clover"]);
    const systems = [...meta.systems].sort((a, b) => Number(!ours.has(a.name)) - Number(!ours.has(b.name)));

    holder.replaceChildren(combobox({
        label: "Design system",
        value: data.system,
        placeholder: `Search ${systems.length} systems…`,
        options: systems.map((system) => ({
            label: system.name,
            value: system.name,
            hint: system.tagline,
            group: ours.has(system.name) ? "tyohnn" : "Ported from shadcn create",
            art: paletteDots(system.name),
        })),
        face: (option) => `${paletteDots(option.value)}<span><b>${esc(option.label)}</b><small>${esc(option.hint ?? "")}</small></span>`,
        onChange: (value) => edit("show_system", { system: value }, `switched to ${value}`),
    }));

    $<HTMLElement>("[data-systag]", app).textContent = data.palette === data.system ? "Own palette" : `${data.palette} palette`;
    app.querySelectorAll<HTMLElement>("[data-m]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.m === data.mode)));

    $<HTMLElement>("[data-screen]", app).replaceChildren(combobox({
        label: "Screen",
        value: view.screen,
        placeholder: "Search screens…",
        options: meta.screens.map((screen) => ({ label: screen.label, value: screen.id, group: "Templates" })),
        onChange: (value) =>
        {
            view.screen = value;
            renderTop();
            syncFrame();
        },
    }));
};

const show = (result: ToolResult) =>
{
    if (result.isError)
    {
        toast("That did not work", textOf(result), true);
        return;
    }

    const data = result.structuredContent as SystemData | undefined;
    const meta = result._meta?.["tyohnn/view"] as ViewMeta | undefined;

    // get_system answers with the state only; the view keeps its look-up tables from the last full result
    if (!data || !("palette" in data) || !(meta || view.meta)) return;

    if (!view.data) build();
    view.data = data;
    if (meta) view.meta = meta;

    renderTop();
    renderSidebar();
    syncFrame();
};

/** A page outside a host (the local harness) hands results in, and lends the view a way to call the tools */
Object.assign(window, {
    tyohnnShow: show,
    tyohnnConnect: (stand: Call) =>
    {
        call = stand;
    },
});

if (window.parent !== window)
{
    const host = new App({ name: "tyohnn system", version: "0.0.0" }, { availableDisplayModes: ["inline", "fullscreen"] }, { autoResize: true });

    host.ontoolresult = (result) => show(result as ToolResult);

    call = (name, args) => host.callServerTool({ name, arguments: args }) as Promise<ToolResult>;
    tellModel = (text) =>
    {
        host.updateModelContext({ content: [{ type: "text", text }] }).catch(() => undefined);
    };
    sendToAgent = (text) =>
    {
        host.sendMessage({ role: "user", content: [{ type: "text", text }] }).catch(() => undefined);
    };

    const displayed = (mode: string | undefined) =>
    {
        document.documentElement.dataset.display = mode ?? "inline";
        wireExpand();
    };

    host.onhostcontextchanged = (context) => displayed(context.displayMode);

    host.connect().then(() =>
    {
        const context = host.getHostContext();

        if (context?.availableDisplayModes?.includes("fullscreen"))
        {
            toggleFullscreen = () =>
            {
                const mode = document.documentElement.dataset.display === "fullscreen" ? "inline" : "fullscreen";

                host.requestDisplayMode({ mode }).then((answer) => displayed(answer.mode)).catch(() => undefined);
            };
        }
        displayed(context?.displayMode);
    }).catch(() => undefined);
}

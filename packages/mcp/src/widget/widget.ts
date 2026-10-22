import { App } from "@modelcontextprotocol/ext-apps/app-with-deps";

/**
 * The primitives view: one card per primitive, each framing the coverage section that draws it in the chosen
 * design system. The system and the mode switch inside the view (the frames reload), so trying another look
 * needs no new tool call. Laid out like the site's Components page: group heading, then a column of cards.
 */

interface ViewPrimitive
{
    name: string;
    description: string;
    sections: string[];
}

interface ViewData
{
    system: string;
    mode: "light" | "dark";
    previewBase: string;
    systems: { name: string; tagline: string; defaultMode: "light" | "dark" }[];
    groups: { id: string; label: string; primitives: ViewPrimitive[] }[];
}

/** The coverage page lays every section out at this width (apps/preview coverage/index.tsx) */
const COVERAGE_WIDTH = 1100;

/** Until a frame reports its height (apps/preview posts `tyohnn:coverage-size`), draw this much of it */
const FALLBACK_HEIGHT = 420;

const state: { data: ViewData | null; query: string } = { data: null, query: "" };

const root = document.getElementById("root") as HTMLElement;

const element = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { className?: string } = {}, children: (Node | string)[] = []) =>
{
    const node = document.createElement(tag);

    Object.assign(node, props);
    node.append(...children);

    return node;
};

const frameUrl = (data: ViewData, section: string) =>
    `${data.previewBase.replace(/\/$/, "")}/${data.system}/index.html?template=coverage&mode=${data.mode}&section=${section}`;

/** Frames keyed by their window, so a size message finds its card */
const frames = new Map<Window, { frame: HTMLIFrameElement; box: HTMLElement }>();

const fit = (box: HTMLElement, frame: HTMLIFrameElement) =>
{
    const scale = Math.min(1, box.clientWidth / COVERAGE_WIDTH);
    const height = Number(frame.dataset.height || FALLBACK_HEIGHT);

    // Narrower than the coverage page: draw it at 1100px and shrink it; wider: let the frame fill the card
    frame.style.width = `${Math.max(COVERAGE_WIDTH, box.clientWidth)}px`;
    frame.style.transform = `scale(${scale})`;
    box.style.height = `${Math.ceil(height * scale)}px`;
};

const card = (data: ViewData, groupId: string, primitive: ViewPrimitive) =>
{
    const frame = element("iframe", { title: `${data.system}: ${primitive.name}`, loading: "lazy", src: frameUrl(data, primitive.sections[0]) });
    const box = element("div", { className: "frame" }, [frame]);

    frame.style.width = `${COVERAGE_WIDTH}px`;
    frame.style.height = `${FALLBACK_HEIGHT}px`;
    frame.addEventListener("load", () =>
    {
        if (frame.contentWindow) frames.set(frame.contentWindow, { frame, box });
    });

    const variants = primitive.sections.length > 1
        ? element("small", { className: "variants" }, [`+${primitive.sections.length - 1}`])
        : "";

    return element("article", { className: "card" }, [
        element("header", {}, [
            element("b", {}, [primitive.name]),
            variants,
            element("span", { className: "tag" }, [groupId]),
        ]),
        element("p", {}, [primitive.description]),
        box,
    ]);
};

const render = () =>
{
    const data = state.data;

    root.replaceChildren();
    frames.clear();

    if (!data)
    {
        root.append(element("p", { className: "waiting" }, ["Loading primitives…"]));
        return;
    }

    const words = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = (primitive: ViewPrimitive) => words.every((word) => `${primitive.name} ${primitive.description}`.toLowerCase().includes(word));
    const groups = data.groups.map((group) => ({ ...group, primitives: group.primitives.filter(matches) })).filter((group) => group.primitives.length > 0);
    const count = data.groups.reduce((sum, group) => sum + group.primitives.length, 0);

    const system = element("select", { "aria-label": "Design system" } as Partial<HTMLSelectElement>, data.systems.map((entry) =>
        element("option", { value: entry.name, selected: entry.name === data.system }, [entry.name])));

    system.addEventListener("change", () =>
    {
        const next = data.systems.find((entry) => entry.name === system.value);

        state.data = { ...data, system: system.value, mode: next?.defaultMode ?? data.mode };
        render();
    });

    const mode = element("div", { className: "segmented", role: "group" } as Partial<HTMLDivElement>, (["light", "dark"] as const).map((value) =>
    {
        const button = element("button", { type: "button", textContent: value === "light" ? "Light" : "Dark" });

        button.setAttribute("aria-pressed", String(data.mode === value));
        button.addEventListener("click", () =>
        {
            state.data = { ...data, mode: value };
            render();
        });

        return button;
    }));

    const filter = element("input", { type: "search", placeholder: "Filter primitives", value: state.query });

    filter.addEventListener("input", () =>
    {
        state.query = filter.value;
        render();
        (root.querySelector("input[type=search]") as HTMLInputElement | null)?.focus();
    });

    const tagline = data.systems.find((entry) => entry.name === data.system)?.tagline ?? "";

    root.append(
        element("div", { className: "bar" }, [
            element("div", { className: "title" }, [element("small", {}, [`${count} primitives`]), element("h1", {}, ["Primitives"])]),
            element("div", { className: "controls" }, [filter, mode, element("label", { className: "system" }, [element("small", {}, ["System"]), system])]),
        ]),
        element("p", { className: "tagline" }, [tagline]),
    );

    if (groups.length === 0) root.append(element("p", { className: "waiting" }, [`No primitive matches “${state.query}”.`]));

    for (const group of groups)
    {
        root.append(element("section", { className: "group" }, [
            element("h2", {}, [group.label, element("small", {}, [String(group.primitives.length)])]),
            element("div", { className: "cards" }, group.primitives.map((primitive) => card(data, group.id, primitive))),
        ]));
    }

    requestAnimationFrame(() => root.querySelectorAll<HTMLElement>(".frame").forEach((box) => fit(box, box.firstElementChild as HTMLIFrameElement)));
};

window.addEventListener("message", (event) =>
{
    const message = event.data as { type?: string; height?: number } | null;

    if (message?.type !== "tyohnn:coverage-size" || typeof message.height !== "number") return;

    const entry = frames.get(event.source as Window);

    if (!entry) return;

    entry.frame.dataset.height = String(Math.ceil(message.height));
    entry.frame.style.height = `${Math.ceil(message.height)}px`;
    fit(entry.box, entry.frame);
});

new ResizeObserver(() => root.querySelectorAll<HTMLElement>(".frame").forEach((box) => fit(box, box.firstElementChild as HTMLIFrameElement))).observe(root);

const show = (data: unknown) =>
{
    if (!data || typeof data !== "object" || !("groups" in data)) return;

    state.data = data as ViewData;
    render();
};

/** A page outside a host (the local harness) hands the data in directly */
(window as unknown as { tyohnnShow: typeof show }).tyohnnShow = show;

const applyTheme = (theme: string | undefined) =>
{
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
};

render();

if (window.parent !== window)
{
    const app = new App({ name: "tyohnn primitives", version: "0.0.0" }, {}, { autoResize: true });

    app.ontoolresult = (result) => show(result.structuredContent);
    app.onhostcontextchanged = (context) => applyTheme(context.theme);

    app.connect().then(() => applyTheme(app.getHostContext()?.theme)).catch(() => undefined);
}

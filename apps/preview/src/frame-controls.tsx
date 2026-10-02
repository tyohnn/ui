import { type CSSProperties, useEffect, useState } from "react";

import { FRAME_TOKEN_GROUPS } from "@tyohnn/blocks/lib/frame";

import { TEMPLATE_CATALOG } from "./templates/catalog";

/**
 * `?frames` — a panel over the template for trying the frame tokens (registry/blocks/lib/frame.ts): move a slider
 * and every frame on the screen that stands at that step moves with it. Nothing is written anywhere but this
 * document's `:root`; "Copy CSS" gives the declarations to put in a system's or a product's stylesheet.
 *
 * The tokens and their defaults come from the frames' own class strings (FRAME_TOKEN_GROUPS), so the panel cannot
 * drift from the blocks. `?frames=<json>` starts from those values (the site's Layout panel opens a screen that way);
 * any other value just shows the panel. Its look is inline and fixed, like the mismatch banner: it belongs to the preview, not to a system, and
 * it never takes part in the template's layout.
 */

const STORE = "tyohnn-frame-tokens";

const SLOTS: { selector: string; label: string; color: string; dashed?: boolean }[] = [
    { selector: '[data-slot="page"]', label: "Page", color: "#e11d48" },
    { selector: '[data-slot="page-pane"]', label: "PagePane", color: "#2563eb" },
    { selector: '[data-slot="page-content"]', label: "PageContent", color: "#16a34a", dashed: true },
    { selector: '[data-slot="page-split"]', label: "PageSplit", color: "#9333ea", dashed: true },
    { selector: '[data-slot="page-aside"], [class*="--page-aside-"]', label: "aside", color: "#ea580c" },
];

const OUTLINES = SLOTS.map((slot) => `${slot.selector}{outline:2px ${slot.dashed ? "dashed" : "solid"} ${slot.color};outline-offset:-2px}`).join("\n");

const parse = (text: string | null): Record<string, number> | null =>
{
    try
    {
        const value: unknown = JSON.parse(text ?? "");

        if (typeof value !== "object" || value === null || Array.isArray(value)) return null;

        return Object.fromEntries(Object.entries(value).filter(([name, rem]) => name.startsWith("--page-") && typeof rem === "number")) as Record<string, number>;
    }
    catch
    {
        return null;
    }
};

// The values the address carries win over the ones kept from the last template.
const read = (): Record<string, number> => parse(new URLSearchParams(location.search).get("frames")) ?? parse(sessionStorage.getItem(STORE)) ?? {};

const panel: CSSProperties = {
    position: "fixed",
    insetInlineEnd: 12,
    bottom: 12,
    zIndex: 2147483646,
    width: 288,
    maxHeight: "calc(100vh - 24px)",
    overflowY: "auto",
    padding: 12,
    borderRadius: 10,
    background: "#111",
    color: "#f5f5f5",
    font: "400 12px/16px system-ui, sans-serif",
    boxShadow: "0 8px 30px rgb(0 0 0 / 0.35)",
};
const button: CSSProperties = { padding: "4px 8px", borderRadius: 6, border: "1px solid #444", background: "#222", color: "inherit", font: "inherit", cursor: "pointer" };
const muted: CSSProperties = { color: "#a3a3a3" };

export const FrameControls = () =>
{
    const groups = FRAME_TOKEN_GROUPS;
    const [values, setValues] = useState<Record<string, number>>(read);
    const [open, setOpen] = useState(true);
    const [outlines, setOutlines] = useState(true);
    const [used, setUsed] = useState<Set<string>>(new Set());
    const params = new URLSearchParams(location.search);
    const template = params.get("template") ?? "";

    // Apply the overrides to :root and remember them, so they follow from one template to the next.
    useEffect(() =>
    {
        for (const group of groups)
        {
            for (const token of group.tokens)
            {
                if (values[token.name] === undefined) document.documentElement.style.removeProperty(token.name);
                else document.documentElement.style.setProperty(token.name, `${values[token.name]}rem`);
            }
        }

        sessionStorage.setItem(STORE, JSON.stringify(values));
    }, [values]);

    // Which tokens the frames on this screen read: the ones worth moving.
    useEffect(() =>
    {
        const timer = setTimeout(() =>
        {
            const names = new Set<string>();

            for (const element of document.querySelectorAll('[class*="--page-"]'))
            {
                for (const match of element.getAttribute("class")!.matchAll(/--page-[a-z-]+/g)) names.add(match[0]);
            }

            setUsed(names);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const changed = Object.keys(values).length;
    const css = `:root {\n${Object.entries(values).map(([name, rem]) => `    ${name}: ${rem}rem;`).join("\n")}\n}`;
    const go = (id: string) =>
    {
        params.set("template", id);
        location.search = params.toString();
    };

    if (!open)
    {
        return <button type="button" data-preview-panel="frames" style={{ ...button, position: "fixed", insetInlineEnd: 12, bottom: 12, zIndex: 2147483646, background: "#111", color: "#f5f5f5" }} onClick={() => setOpen(true)}>Frames{changed > 0 ? ` · ${changed} changed` : ""}</button>;
    }

    return (
        <div data-preview-panel="frames" style={panel}>
            {outlines && <style>{OUTLINES}</style>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ fontWeight: 600, fontSize: 13 }}>Frames</strong>
                <span style={{ display: "flex", gap: 6 }}>
                    <button type="button" style={button} disabled={changed === 0} onClick={() => setValues({})}>Reset</button>
                    <button type="button" style={button} disabled={changed === 0} onClick={() => void navigator.clipboard?.writeText(css)}>Copy CSS</button>
                    <button type="button" style={button} aria-label="Hide the panel" onClick={() => setOpen(false)}>–</button>
                </span>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
                <span style={muted}>Template</span>
                <select value={template} onChange={(event) => go(event.target.value)} style={{ ...button, width: "100%" }}>
                    {TEMPLATE_CATALOG.filter((entry) => entry.kind === "screen").map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
                </select>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                <input type="checkbox" checked={outlines} onChange={(event) => setOutlines(event.target.checked)} />
                Outline the frames
            </label>
            {outlines && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", marginTop: 4 }}>
                    {SLOTS.map((slot) => (
                        <span key={slot.label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 10, height: 10, border: `2px ${slot.dashed ? "dashed" : "solid"} ${slot.color}` }} />
                            {slot.label}
                        </span>
                    ))}
                </div>
            )}

            {groups.map((group) => (
                <fieldset key={group.id} style={{ border: 0, padding: 0, margin: "12px 0 0" }}>
                    <legend style={{ padding: 0, fontWeight: 600 }}>
                        {group.title} <code style={{ ...muted, font: "400 11px/16px ui-monospace, monospace" }}>{group.prefix}*</code>
                        <span style={{ ...muted, display: "block", fontWeight: 400 }}>{group.hint}</span>
                    </legend>
                    {group.tokens.map((token) =>
                    {
                        const value = values[token.name] ?? token.rem;
                        const onScreen = used.has(token.name);

                        return (
                            <label key={token.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0 8px", marginTop: 6, opacity: onScreen ? 1 : 0.45 }} title={`${token.name}: ${onScreen ? "this screen uses it" : "nothing on this screen uses it, so moving it changes nothing here"}`}>
                                <span>{token.label} <code style={{ ...muted, font: "11px/16px ui-monospace, monospace" }}>{token.key}</code></span>
                                <span style={{ fontVariantNumeric: "tabular-nums", color: values[token.name] === undefined ? "#a3a3a3" : "#facc15" }}>{value}rem · {Math.round(value * 16)}px</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={group.max}
                                    step={group.step}
                                    value={value}
                                    style={{ gridColumn: "1 / -1", width: "100%" }}
                                    onChange={(event) =>
                                    {
                                        const next = Number(event.target.value);

                                        setValues((current) =>
                                        {
                                            const { [token.name]: _dropped, ...rest } = current;

                                            return next === token.rem ? rest : { ...rest, [token.name]: next };
                                        });
                                    }}
                                />
                            </label>
                        );
                    })}
                </fieldset>
            ))}
        </div>
    );
};

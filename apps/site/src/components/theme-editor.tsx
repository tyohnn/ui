"use client";

import { useState } from "react";

import { PALETTE_GROUPS, contrast, resolveValue } from "@tyohnn/theme";

import { useTheme, type Mode } from "./theme-provider";

const GROUP_LABELS: Record<string, string> = {
    base: "Base",
    chart: "Charts",
    sidebar: "Sidebar",
    status: "Status",
    tag: "Tag tones",
    avatar: "Avatar tones",
    state: "Checked · selection · link",
};

const download = (name: string, text: string) =>
{
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: name });

    link.click();
    URL.revokeObjectURL(url);
};

const Copy = ({ label, text }: { label: string; text: string }) =>
{
    const [done, setDone] = useState(false);

    return (
        <button
            type="button"
            className="th-action"
            onClick={() =>
            {
                void navigator.clipboard.writeText(text).then(() =>
                {
                    setDone(true);
                    setTimeout(() => setDone(false), 1200);
                });
            }}
        >
            {done ? "Copied" : label}
        </button>
    );
};

/** One colour: the value as it resolves (an alias shows what it stands for) and a way to change it. */
const Swatch = ({ name, mode }: { name: string; mode: Mode }) =>
{
    const theme = useTheme()!;
    const values = (theme.colours ?? { light: {}, dark: {} })[mode];
    const written = values[name] ?? "";
    const value = resolveValue(values, written);
    const edited = theme.state.edits[mode][name] !== undefined;

    return (
        <label className={edited ? "th-swatch edited" : "th-swatch"}>
            <span className="th-chip" style={{ background: value }} aria-hidden />
            <span className="th-name">{name}</span>
            <input
                type="text"
                value={theme.state.edits[mode][name] ?? written}
                spellCheck={false}
                onChange={(event) => theme.setColour(mode, name, event.target.value)}
                aria-label={`--${name} (${mode})`}
            />
        </label>
    );
};

/**
 * The colour panel. Everything in it edits the same 72 names a theme file holds, so what the reader sees
 * in the frames is what `tyohnn theme` would install.
 */
export const ThemeEditor = ({ systemName }: { systemName: string }) =>
{
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("light");
    const [group, setGroup] = useState<string>("base");

    if (!theme) return null;

    const bases = theme.themes.filter((entry) => entry.kind === "base");
    const named = theme.themes.filter((entry) => entry.kind === "theme");
    const accents = theme.themes.filter((entry) => entry.kind === "accent");
    const values = (theme.colours ?? { light: {}, dark: {} })[mode];

    return (
        <div className="th-root">
            <button type="button" className="th-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span className="th-dots" aria-hidden>
                    {["background", "primary", "muted", "foreground"].map((name) => (
                        <i key={name} style={{ background: resolveValue(values, values[name] ?? "") }} />
                    ))}
                </span>
                Colours
                {!theme.isOwn && <span className="th-badge">edited</span>}
            </button>

            {open && (
                <div className="th-panel">
                    <header>
                        <div>
                            <b>Colours</b>
                            <small>{systemName}&rsquo;s feel, any palette. Changes land in the frames as you make them.</small>
                        </div>
                        <button type="button" className="th-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
                    </header>

                    <section>
                        <h4>Start from</h4>
                        <div className="th-row">
                            {[...named, ...bases].map((entry) => (
                                <button
                                    key={entry.id}
                                    type="button"
                                    className={theme.state.base === entry.id ? "th-pick on" : "th-pick"}
                                    onClick={() => theme.setBase(entry.id)}
                                    title={entry.kind === "base" ? `${entry.title} — a neutral ramp` : entry.title}
                                >
                                    <span className="th-dots" aria-hidden>
                                        {entry.swatch[mode].map((colour, index) => <i key={index} style={{ background: colour }} />)}
                                    </span>
                                    {entry.id}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4>Accent <small>moves primary, secondary, the charts and the sidebar accent</small></h4>
                        <div className="th-row">
                            <button type="button" className={theme.state.accent === null ? "th-pick on" : "th-pick"} onClick={() => theme.setAccent(null)}>none</button>
                            {accents.map((entry) => (
                                <button
                                    key={entry.id}
                                    type="button"
                                    className={theme.state.accent === entry.id ? "th-pick on" : "th-pick"}
                                    onClick={() => theme.setAccent(entry.id)}
                                >
                                    <span className="th-chip" style={{ background: entry[mode].primary }} aria-hidden />
                                    {entry.id}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4>
                            Every colour
                            <span className="th-modes">
                                {(["light", "dark"] as Mode[]).map((option) => (
                                    <button key={option} type="button" className={mode === option ? "on" : ""} onClick={() => setMode(option)}>{option}</button>
                                ))}
                            </span>
                        </h4>
                        <div className="th-tabs">
                            {Object.keys(PALETTE_GROUPS).map((id) => (
                                <button key={id} type="button" className={group === id ? "on" : ""} onClick={() => setGroup(id)}>
                                    {GROUP_LABELS[id] ?? id}
                                </button>
                            ))}
                        </div>
                        <div className="th-grid">
                            {PALETTE_GROUPS[group as keyof typeof PALETTE_GROUPS].map((name) => <Swatch key={name} name={name} mode={mode} />)}
                        </div>
                    </section>

                    {theme.warnings.length > 0 && (
                        <section className="th-warn">
                            <h4>Contrast below AA</h4>
                            <ul>
                                {theme.warnings.slice(0, 6).map((row) => (
                                    <li key={`${row.mode}-${row.foreground}`}>
                                        <code>--{row.foreground}</code> on <code>--{row.background}</code> is {row.ratio}:1 in {row.mode}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <footer>
                        <Copy label="Copy CSS" text={theme.css ?? ""} />
                        <button type="button" className="th-action" onClick={() => download(`${theme.theme.name}.json`, `${JSON.stringify(theme.theme, null, 4)}\n`)}>Download theme.json</button>
                        <Copy label="Copy install command" text={`npx tyohnn init --system ${systemName} --theme ${theme.link}`} />
                        <Copy label="Copy share link" text={typeof window === "undefined" ? "" : window.location.href} />
                        <button type="button" className="th-action ghost" onClick={theme.reset} disabled={theme.isOwn}>Reset</button>
                    </footer>
                </div>
            )}
        </div>
    );
};

/** The ratio the editor shows next to a pair, for tests and future inline hints. */
export const ratio = (values: Record<string, string>, foreground: string, background: string) =>
    contrast(resolveValue(values, values[foreground]), resolveValue(values, values[background]));

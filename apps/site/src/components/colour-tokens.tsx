"use client";

import { useMemo, useState } from "react";

import { PALETTE_GROUPS, resolveValue, toOklch } from "@tyohnn/theme";

import type { TailwindFamily } from "@/lib/themes";

import { useLocale } from "./locale-provider";
import { useTheme, type Mode } from "./theme-provider";

const ALIAS = /^var\(--([a-z0-9-]+)\)$/;

/**
 * A colour's identity for matching: shadcn writes `oklch(0.488 0.243 264.376)` where Tailwind writes
 * `oklch(48.8% 0.243 264.376)`, and both are blue-700. Hex goes through the conversion, so it only matches
 * when it is the same colour to three places.
 */
const keyOf = (value: string) =>
{
    const channels = toOklch(value);

    return channels ? channels.map((channel) => channel.toFixed(3)).join(" ") : value.trim();
};

/** How a value reads in a row: a Tailwind name when it is one, the token an alias points at, else the value */
const labelOf = (written: string, names: Map<string, string>) =>
{
    const alias = ALIAS.exec(written.trim());

    if (alias) return `→ ${alias[1]}`;

    return names.get(keyOf(written)) ?? written;
};

/** oklch() the way Tailwind writes it: lightness in %, chroma to three places, hue to one, alpha only when below 1 */
const formatOklch = ([lightness, chroma, hue, alpha]: number[]) =>
    `oklch(${(lightness * 100).toFixed(1).replace(/\.0$/, "")}% ${chroma.toFixed(3)} ${hue.toFixed(1).replace(/\.0$/, "")}${alpha < 1 ? ` / ${Math.round(alpha * 100)}%` : ""})`;

/** One OKLCH channel: a range over a track painted with what moving it would do */
const Channel = ({ label, value, min, max, step, track, show, onChange }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    track: string;
    show: string;
    onChange: (value: number) => void;
}) => (
    <label className="ck-channel">
        <span>{label}</span>
        <input type="range" min={min} max={max} step={step} value={value} style={{ background: track }} onChange={(event) => onChange(Number(event.target.value))} />
        <output>{show}</output>
    </label>
);

/**
 * The picker under a row: Tailwind's palette as a grid (the exact `bg-red-500` values), or OKLCH by hand with a
 * slider per channel. The value field takes anything a theme may hold, `color-mix(…)` and `var(--…)` included.
 */
const ColourPicker = ({ written, resolved, families, onPick }: {
    written: string;
    resolved: string;
    families: TailwindFamily[];
    onPick: (value: string) => void;
}) =>
{
    const { t } = useLocale();
    const [tab, setTab] = useState<"tailwind" | "custom">(families.length > 0 ? "tailwind" : "custom");
    const current = keyOf(written);
    const [channels, setChannels] = useState<number[]>(() => toOklch(resolved) ?? [0.5, 0, 0, 1]);
    const [lightness, chroma, hue, alpha] = channels;

    const move = (index: number, next: number) =>
    {
        const updated = channels.map((value, at) => (at === index ? next : value));

        setChannels(updated);
        onPick(formatOklch(updated));
    };

    const stops = (make: (value: number) => string, values: number[]) => `linear-gradient(to right in oklch, ${values.map(make).join(", ")})`;

    return (
        <div className="ck-picker">
            <div className="ck-tabs" role="tablist">
                {families.length > 0 && <button type="button" role="tab" aria-selected={tab === "tailwind"} onClick={() => setTab("tailwind")}>{t.theme.tailwind}</button>}
                <button type="button" role="tab" aria-selected={tab === "custom"} onClick={() => setTab("custom")}>{t.theme.custom}</button>
            </div>

            {tab === "tailwind" ? (
                <div className="ck-grid">
                    {families.map((family) => (
                        <div key={family.name} className="ck-family">
                            <span>{family.name}</span>
                            {family.shades.map((entry) => (
                                <button
                                    key={entry.shade}
                                    type="button"
                                    className={keyOf(entry.value) === current ? "on" : undefined}
                                    style={{ background: entry.value }}
                                    title={`${family.name}-${entry.shade}`}
                                    aria-label={`${family.name}-${entry.shade}`}
                                    onClick={() =>
                                    {
                                        onPick(entry.value);
                                        setChannels(toOklch(entry.value) ?? channels);
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                    <div className="ck-family">
                        <span />
                        {["#ffffff", "#000000", "transparent"].map((value) => (
                            <button key={value} type="button" className={value === written.trim() ? "on wide" : "wide"} onClick={() => onPick(value)}>
                                <i style={{ background: value }} />{value === "transparent" ? "transparent" : value === "#ffffff" ? "white" : "black"}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="ck-custom">
                    <span className="ck-preview" style={{ background: formatOklch(channels) }} />
                    <Channel
                        label="L"
                        value={lightness}
                        min={0}
                        max={1}
                        step={0.005}
                        show={`${(lightness * 100).toFixed(1)}%`}
                        track={stops((value) => `oklch(${value} ${chroma} ${hue})`, [0, 0.5, 1])}
                        onChange={(value) => move(0, value)}
                    />
                    <Channel
                        label="C"
                        value={chroma}
                        min={0}
                        max={0.37}
                        step={0.001}
                        show={chroma.toFixed(3)}
                        track={stops((value) => `oklch(${lightness} ${value} ${hue})`, [0, 0.185, 0.37])}
                        onChange={(value) => move(1, value)}
                    />
                    <Channel
                        label="H"
                        value={hue}
                        min={0}
                        max={360}
                        step={0.5}
                        show={`${hue.toFixed(0)}°`}
                        track={`linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((value) => `oklch(${Math.max(lightness, 0.55)} ${Math.max(chroma, 0.12)} ${value})`).join(", ")})`}
                        onChange={(value) => move(2, value)}
                    />
                    <Channel
                        label="A"
                        value={alpha}
                        min={0}
                        max={1}
                        step={0.01}
                        show={`${Math.round(alpha * 100)}%`}
                        track={`linear-gradient(to right, transparent, oklch(${lightness} ${chroma} ${hue}))`}
                        onChange={(value) => move(3, value)}
                    />
                </div>
            )}

            <label className="ck-value">
                <span>{t.theme.value}</span>
                <input
                    type="text"
                    value={written}
                    spellCheck={false}
                    onChange={(event) =>
                    {
                        onPick(event.target.value);
                        setChannels(toOklch(event.target.value) ?? channels);
                    }}
                />
            </label>
        </div>
    );
};

/** One token: chip, name and what it holds; a click opens the picker under it */
const Token = ({ name, mode, open, onToggle, families, names }: {
    name: string;
    mode: Mode;
    open: boolean;
    onToggle: () => void;
    families: TailwindFamily[];
    names: Map<string, string>;
}) =>
{
    const { t } = useLocale();
    const theme = useTheme()!;
    const values = theme.display[mode];
    const written = values[name] ?? "";
    const resolved = resolveValue(values, written);
    const edited = theme.state.edits[mode][name] !== undefined;

    return (
        <div className={["ck-token", edited ? "edited" : "", open ? "open" : ""].filter(Boolean).join(" ")}>
            <div className="ck-row">
                <button type="button" className="ck-head" aria-expanded={open} onClick={onToggle}>
                    <span className="ck-chip" style={{ background: resolved }} aria-hidden />
                    <span className="ck-name">{name}</span>
                    <span className="ck-label">{labelOf(written, names)}</span>
                </button>
                {edited && (
                    <button type="button" className="th-undo" onClick={() => theme.clearColour(mode, name)} title={t.theme.undo(name)}>
                        <span className="sr-only">{t.theme.undo(name)}</span>↺
                    </button>
                )}
            </div>
            {open && <ColourPicker key={mode} written={written} resolved={resolved} families={families} onPick={(value) => theme.setColour(mode, name, value)} />}
        </div>
    );
};

/** Every colour of the palette, by group and mode, each one opening Tailwind's palette or an OKLCH picker */
export const TokenEditor = ({ families }: { families: TailwindFamily[] }) =>
{
    const { t } = useLocale();
    const theme = useTheme()!;
    const [mode, setMode] = useState<Mode>("light");
    const [group, setGroup] = useState<string>("base");
    const [open, setOpen] = useState<string | null>(null);
    const names = useMemo(() => new Map(families.flatMap((family) => family.shades.map((entry) => [keyOf(entry.value), `${family.name}-${entry.shade}`] as const))), [families]);
    const edits = Object.keys(theme.state.edits.light).length + Object.keys(theme.state.edits.dark).length;

    return (
        <section className="ck">
            <h4>
                {t.theme.every}
                <span className="th-modes">
                    {(["light", "dark"] as Mode[]).map((option) => (
                        <button key={option} type="button" className={mode === option ? "on" : ""} onClick={() => setMode(option)}>{t.mode[option]}</button>
                    ))}
                </span>
            </h4>
            {edits > 0 && <button type="button" className="th-clear" onClick={theme.clearEdits}>{t.theme.clear(edits)}</button>}
            <div className="th-tabs">
                {Object.keys(PALETTE_GROUPS).map((id) => (
                    <button key={id} type="button" className={group === id ? "on" : ""} onClick={() => { setGroup(id); setOpen(null); }}>
                        {t.theme.groups[id] ?? id}
                    </button>
                ))}
            </div>
            <div className="ck-list">
                {PALETTE_GROUPS[group as keyof typeof PALETTE_GROUPS].map((name) => (
                    <Token
                        key={name}
                        name={name}
                        mode={mode}
                        open={open === name}
                        onToggle={() => setOpen(open === name ? null : name)}
                        families={families}
                        names={names}
                    />
                ))}
            </div>
        </section>
    );
};

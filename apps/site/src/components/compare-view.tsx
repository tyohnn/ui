"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from "react";

import { DEFAULT_SCREEN, isScreen, type Mode, previewUrl, screenOf, type SystemInfo, type SystemSummary } from "@/lib/site";

import { ModeSeg, ScreenPicker, SystemPicker } from "./pickers";
import { ScaledFrame } from "./scaled-frame";

/** The facts the table under the split compares */
export type CompareFacts = Pick<SystemInfo, "name" | "description"> & { sans: string; heading: string; icons: string; defaultMode: Mode };

/**
 * Two systems on one screen, one over the other: drag the divider (or use ← → on it) to move the boundary.
 * The pickers, screen and mode live in the URL (?a=&b=&screen=&mode=), so a comparison can be shared.
 */
export const CompareView = ({ systems, facts }: { systems: SystemSummary[]; facts: CompareFacts[] }) =>
{
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const names = systems.map((system) => system.name);
    const pick = (value: string | null, fallback: string) => (value && names.includes(value) ? value : fallback);

    const a = pick(params.get("a"), names.includes("graphite") ? "graphite" : names[0]);
    const b = pick(params.get("b"), names.includes("sera") ? "sera" : names[1] ?? names[0]);
    const screen = isScreen(params.get("screen")) ? params.get("screen")! : "block-analytics";
    const mode: Mode = params.get("mode") === "dark" ? "dark" : "light";
    const entry = screenOf(isScreen(screen) ? screen : DEFAULT_SCREEN);

    const [split, setSplit] = useState(54);
    const inner = useRef<HTMLDivElement>(null);

    const update = (next: Partial<{ a: string; b: string; screen: string; mode: Mode }>) =>
    {
        const query = new URLSearchParams({ a, b, screen, mode, ...next });

        router.replace(`${pathname}?${query}`, { scroll: false });
    };

    const moveTo = useCallback((clientX: number) =>
    {
        const rect = inner.current?.getBoundingClientRect();

        if (!rect) return;

        setSplit(Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100)));
    }, []);

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) =>
    {
        event.currentTarget.setPointerCapture(event.pointerId);
        moveTo(event.clientX);
    };

    const factOf = (name: string) => facts.find((fact) => fact.name === name)!;
    const rows: [string, (fact: CompareFacts) => string][] = [
        ["Sans", (fact) => fact.sans],
        ["Heading", (fact) => fact.heading],
        ["Icons", (fact) => fact.icons],
        ["Default mode", (fact) => (fact.defaultMode === "dark" ? "Dark" : "Light")],
        ["Character", (fact) => fact.description.split(":")[0].trim()],
    ];
    const fontOf = (name: string) => systems.find((system) => system.name === name)?.nameFont;

    return (
        <>
            <div className="controls">
                <SystemPicker systems={systems} value={a} onChange={(value) => update({ a: value })} side="A" />
                <span className="vs">vs</span>
                <SystemPicker systems={systems} value={b} onChange={(value) => update({ b: value })} side="B" />
                <button type="button" className="swap" onClick={() => update({ a: b, b: a })}>⇄ Swap</button>
                <div className="right">
                    <ScreenPicker value={screen} onChange={(value) => update({ screen: value })} />
                    <ModeSeg mode={mode} onChange={(value) => update({ mode: value })} />
                </div>
            </div>

            <div className="split">
                <div
                    ref={inner}
                    className="split-inner"
                    style={{ aspectRatio: `${entry.viewport.width} / ${entry.viewport.height}` }}
                    onPointerDown={onPointerDown}
                    onPointerMove={(event) => event.buttons === 1 && moveTo(event.clientX)}
                >
                    <div className="side">
                        <ScaledFrame src={previewUrl(a, entry.id, mode)} title={`${a}: ${entry.label}`} width={entry.viewport.width} height={entry.viewport.height} eager style={{ height: "100%" }} />
                    </div>
                    <div className="side" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
                        <ScaledFrame src={previewUrl(b, entry.id, mode)} title={`${b}: ${entry.label}`} width={entry.viewport.width} height={entry.viewport.height} eager style={{ height: "100%" }} />
                    </div>
                    <span className="side-tag a" style={{ fontFamily: fontOf(a) }}>{a}</span>
                    <span className="side-tag b" style={{ fontFamily: fontOf(b) }}>{b}</span>
                    <div
                        className="handle"
                        style={{ left: `${split}%` }}
                        role="slider"
                        tabIndex={0}
                        aria-label={`Divider between ${a} and ${b}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(split)}
                        onKeyDown={(event) =>
                        {
                            if (event.key === "ArrowLeft") setSplit((value) => Math.max(2, value - 2));
                            if (event.key === "ArrowRight") setSplit((value) => Math.min(98, value + 2));
                        }}
                    >
                        <span className="knob" aria-hidden>‹ ›</span>
                    </div>
                </div>
            </div>

            <div className="diff">
                <div className="k" style={{ borderBottom: 0 }} />
                <div className="h" style={{ fontFamily: fontOf(a) }}>{a}</div>
                <div className="h" style={{ fontFamily: fontOf(b) }}>{b}</div>
                {rows.map(([label, value]) =>
                {
                    const left = value(factOf(a));
                    const right = value(factOf(b));
                    const tone = left === right ? "same" : "d";

                    return [
                        <div key={`${label}-k`} className="k">{label}</div>,
                        <div key={`${label}-a`} className={tone}>{left}</div>,
                        <div key={`${label}-b`} className={tone}>{right}</div>,
                    ];
                })}
            </div>
        </>
    );
};

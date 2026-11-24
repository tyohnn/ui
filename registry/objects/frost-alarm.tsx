"use client";

import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { useEffect, useState } from "react";

import "./frost-alarm.css";

/**
 * Frost alarm: an outdoor thermometer whose LCD draws tonight's temperature curve, and a hardware switch that arms
 * an alarm at 34 °F. Adapted from UI SDK's ui-feed design "Frost alarm" (https://ui-sdk.dev).
 *
 * An object (registry/objects/README.md): the switch is UI SDK's `Switch` styled from scratch, the material (black
 * bezel, LCD glass, ribbed metal thumb) is literal on the root, and the face, ink, signal, type, focus and timing
 * read the started system. Arming it plays a short boot sequence on the LCD; with reduced motion it shows the last
 * frame at once and the "now" column stops blinking.
 */

const COLS = 48;
const ROWS = 16;
const NOW = 14;
const ALARM = 34.0;

const tempAt = (hours: number) => -4.26 + 10.36 * Math.exp(-hours / 8.3);
const CURVE = Array.from({ length: COLS }, (_, c) => (tempAt((c + 0.5) / 4) * 9) / 5 + 32);
const OUTDOOR = Math.round(CURVE[NOW] * 10) / 10;
const LOW = Math.round(Math.min(...CURVE) * 10) / 10;
const rowOf = (t: number) => Math.max(0, Math.min(ROWS - 1, Math.floor(t - 28)));
const ALARM_ROW = rowOf(ALARM);
const CROSSING = CURVE.findIndex((t) => t < ALARM);

const SEGMENTS: Record<string, string> = {
    "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcfgd",
    "-": "g", O: "abcdef", F: "aefg", " ": "",
};

/** The seven bars of a segment digit W × H, bar thickness T, gap G, as polygon point lists */
const bars = (W: number, H: number, T: number, G: number): Record<string, string> =>
{
    const h = T / 2;
    const across = (y: number) =>
    {
        const x1 = h + G;
        const x2 = W - h - G;

        return `${x1},${y} ${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h}`;
    };
    const down = (x: number, y1: number, y2: number) => `${x},${y1} ${x + h},${y1 + h} ${x + h},${y2 - h} ${x},${y2} ${x - h},${y2 - h} ${x - h},${y1 + h}`;

    return {
        a: across(h),
        g: across(H / 2),
        d: across(H - h),
        f: down(h, h + G, H / 2 - G),
        b: down(W - h, h + G, H / 2 - G),
        e: down(h, H / 2 + G, H - h - G),
        c: down(W - h, H / 2 + G, H - h - G),
    };
};

const BIG = { W: 84, H: 140, T: 17, G: 1.6 };
const SMALL = { W: 22, H: 36, T: 5, G: 0.7 };
const BIG_BARS = bars(BIG.W, BIG.H, BIG.T, BIG.G);
const SMALL_BARS = bars(SMALL.W, SMALL.H, SMALL.T, SMALL.G);
const SLANT = -6;
const MINUS = (() =>
{
    const h = BIG.T / 2;
    const x1 = 4;
    const x2 = 52;
    const y = 14 + BIG.H / 2;

    return `${x1},${y} ${x1 + h},${y - h} ${x2 - h},${y - h} ${x2},${y} ${x2 - h},${y + h} ${x1 + h},${y + h}`;
})();

const Digit = ({ ch, x, y, size }: { ch: string; x: number; y: number; size: typeof BIG }) =>
{
    const lit = SEGMENTS[ch] ?? "";
    const shapes = size === BIG ? BIG_BARS : SMALL_BARS;

    return (
        <g transform={`translate(${x} ${y}) skewX(${SLANT})`} style={{ transformOrigin: `0 ${size.H}px` }}>
            {Object.entries(shapes).map(([key, points]) => (
                <polygon key={key} points={points} className={lit.includes(key) ? "on" : "off"} />
            ))}
        </g>
    );
};

const Point = ({ x, y, r, on = true }: { x: number; y: number; r: number; on?: boolean }) => (
    <rect x={x - r} y={y - r * 2} width={r * 2} height={r * 2} className={on ? "on" : "off"} />
);

const DOTS: Record<string, string[]> = {
    L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
};

/** A word in the 5 × 7 dot font, as one path */
const dotText = (text: string, x: number, y: number, pitch: number) =>
{
    const s = pitch * 0.86;
    let d = "";

    [...text].forEach((ch, i) =>
        DOTS[ch].forEach((row, r) =>
            [...row].forEach((dot, c) =>
            {
                if (dot === "#") d += `M${x + (i * 6 + c) * pitch} ${y + r * pitch}h${s}v${s}h${-s}z`;
            })));

    return d;
};

const GX = 204;
const GY = 176;
const PITCH = 5;
const CELL = 4.2;
const cell = (c: number, r: number) => `M${GX + c * PITCH} ${GY + (ROWS - 1 - r) * PITCH}h${CELL}v${CELL}h${-CELL}z`;

/** The dot-matrix graph: the curve so far filled, the rest as a line, the alarm level dashed in and its marker */
const graphPath = (lineCols: number, marker: boolean, beat: boolean) =>
{
    let d = "";

    for (let c = 0; c < COLS; c++)
    {
        const top = rowOf(CURVE[c]);
        const solid = c < NOW || (c === NOW && beat);

        for (let r = 0; r < ROWS; r++)
        {
            let on = solid ? r <= top : r === top;

            if (r === ALARM_ROW && c < lineCols && c % 2 === 0) on = solid ? !on : true;
            if (on) d += cell(c, r);
        }
    }

    if (marker)
    {
        const r = ALARM_ROW + 2;

        d += cell(CROSSING, r) + cell(CROSSING - 1, r + 1) + cell(CROSSING, r + 1) + cell(CROSSING + 1, r + 1);

        for (let k = -2; k <= 2; k++) d += cell(CROSSING + k, r + 2);
    }

    return d;
};

const fixed = (n: number) => Math.abs(n).toFixed(1);
const LAST = 13;

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export type FrostAlarmLabels = {
    /** Printed on the bezel over the LCD */
    outdoor: string;
    /** The switch's legend, one line each */
    legend: [string, string];
    off: string;
    on: string;
    /** Under the graph, every three hours from the left edge */
    hours: string[];
    /** What a screen reader hears for the LCD */
    reading: (outdoor: number, low: number, alarm: number | null) => string;
};

const LABELS: FrostAlarmLabels = {
    outdoor: "Outdoor",
    legend: ["Frost", "alarm"],
    off: "Off",
    on: "On",
    hours: ["6PM", "9PM", "12AM", "3AM", "6AM"],
    reading: (outdoor, low, alarm) =>
        `Outdoor ${outdoor} degrees Fahrenheit and falling. Forecast low ${low} degrees. Frost alarm ${alarm === null ? "off" : `on, at ${alarm.toFixed(1)} degrees`}.`,
};

export const FrostAlarm = ({ defaultArmed = false, labels }: { defaultArmed?: boolean; labels?: Partial<FrostAlarmLabels> }) =>
{
    const words = { ...LABELS, ...labels };
    const [armed, setArmed] = useState(defaultArmed);
    const [frame, setFrame] = useState(LAST);
    const [beat, setBeat] = useState(true);

    useEffect(() =>
    {
        if (frame >= LAST) return;

        const id = window.setTimeout(() => setFrame((f) => f + 1), 70);

        return () => window.clearTimeout(id);
    }, [frame]);

    useEffect(() =>
    {
        if (reducedMotion()) return;

        const id = window.setInterval(() => setBeat((b) => !b), 500);

        return () => window.clearInterval(id);
    }, []);

    const readout = frame < 1 ? "   " : armed ? fixed(ALARM).replace(".", "").padStart(3, " ") : "OFF";
    const bell = armed && frame >= 1 && frame !== 2 && frame !== 4;
    const lineCols = armed ? Math.max(0, Math.min(COLS, (frame - 4) * 6)) : 0;
    const marker = armed && frame >= LAST - 1;
    const big = fixed(OUTDOOR).padStart(4, " ");
    const low = fixed(LOW).padStart(4, " ");

    return (
        <div className="frost" data-object="frost-alarm">
            <div className="frost-bezel">
                <span className="frost-print frost-print-top">{words.outdoor}</span>
                <div className="frost-lcd" role="img" aria-label={words.reading(OUTDOOR, LOW, armed ? ALARM : null)}>
                    <svg viewBox="0 0 460 270" aria-hidden="true">
                        <g transform={`skewX(${SLANT})`} style={{ transformOrigin: "0 154px" }}>
                            <polygon points={MINUS} className={OUTDOOR < 0 ? "on" : "off"} />
                        </g>
                        <Digit ch={big[0]} x={64} y={14} size={BIG} />
                        <Digit ch={big[1]} x={166} y={14} size={BIG} />
                        <Point x={266} y={154} r={8.5} />
                        <Digit ch={big[3]} x={286} y={14} size={BIG} />

                        <g className="on">
                            <circle cx="403" cy="23.5" r="7" className="frost-ring" />
                            <path d="M422 54V21.5H444.5M422 36H440" className="frost-ring frost-c" />
                        </g>
                        <path d="M420 94 444 120H396Z" className="off" />
                        <path d="M396 128H444L420 154Z" className="on" />

                        <path d={dotText("LOW", 16, 187, 2.3)} className="on" />
                        <Digit ch={LOW < 0 ? "-" : low[0]} x={64} y={176} size={SMALL} />
                        <Digit ch={low[1]} x={98} y={176} size={SMALL} />
                        <Point x={126.5} y={212} r={2.5} />
                        <Digit ch={low[3]} x={132} y={176} size={SMALL} />

                        <g className={bell ? "on" : "off"}>
                            <path d="M30 220.5a2.6 2.6 0 0 1 2.6 2.6v.9a9 9 0 0 1 6.4 8.6v7.9l3.5 4.6v2.4h-25v-2.4l3.5-4.6v-7.9a9 9 0 0 1 6.4-8.6v-.9a2.6 2.6 0 0 1 2.6-2.6Z" />
                            <path d="M25.8 250h8.4a4.2 4.2 0 0 1-8.4 0Z" />
                        </g>
                        <Digit ch={readout[0]} x={64} y={220} size={SMALL} />
                        <Digit ch={readout[1]} x={98} y={220} size={SMALL} />
                        <Point x={126.5} y={256} r={2.5} on={armed && frame >= 1} />
                        <Digit ch={readout[2]} x={132} y={220} size={SMALL} />

                        <defs>
                            <pattern id="frost-grid" x={GX} y={GY} width={PITCH} height={PITCH} patternUnits="userSpaceOnUse">
                                <rect width={CELL} height={CELL} />
                            </pattern>
                        </defs>
                        <rect x={GX} y={GY} width={COLS * PITCH} height={ROWS * PITCH} fill="url(#frost-grid)" className="frost-ghost" />
                        <path d={graphPath(lineCols, marker, beat)} className="on" />
                    </svg>
                </div>
                <span className="frost-hours" aria-hidden="true">
                    {words.hours.map((hour, i) => (
                        <i key={hour} style={{ left: i * 60 }}>
                            {hour}
                        </i>
                    ))}
                </span>
            </div>

            <label className="frost-control">
                <span className="frost-legend">
                    {words.legend[0]}{" "}
                    <br />
                    {words.legend[1]}
                </span>
                <Switch
                    className="frost-switch"
                    checked={armed}
                    onCheckedChange={(next) =>
                    {
                        setArmed(next);
                        setFrame(reducedMotion() ? LAST : 0);
                    }}
                >
                    <svg className="frost-bell" viewBox="0 0 28 37" aria-hidden="true">
                        <path d="M14 1a2.8 2.8 0 0 1 2.8 2.8v1a9.6 9.6 0 0 1 6.8 9.2v8.4l3.7 4.9v2.6H.7v-2.6l3.7-4.9V14a9.6 9.6 0 0 1 6.8-9.2v-1A2.8 2.8 0 0 1 14 1Z" />
                        <path d="M9.5 31.6h9a4.5 4.5 0 0 1-9 0Z" />
                    </svg>
                    <SwitchThumb className="frost-thumb" />
                </Switch>
            </label>
            <span className="frost-ends" aria-hidden="true">
                <i>{words.off}</i>
                <i>{words.on}</i>
            </span>
        </div>
    );
};

"use client";

import Link from "next/link";
import { type CSSProperties, type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";

import { type Mode, previewUrl, screenOf, type SystemSummary } from "@/lib/site";

import { CopyCommand } from "./copy-command";
import { useLocale } from "./locale-provider";
import { ScaledFrame } from "./scaled-frame";

const ROTATE_MS = 7000;
const SCREEN = "crm-dashboard";

export interface HeroPair
{
    a: string;
    b: string;
    mode: Mode;
}

/** Paint one stylesheet into every same-origin preview frame under `root`, now and whenever a frame (re)loads. */
const usePaint = (root: React.RefObject<HTMLElement | null>, css: string) =>
{
    useEffect(() =>
    {
        const element = root.current;

        if (!element) return;

        const watched = new WeakSet<HTMLIFrameElement>();
        const paint = (frame: HTMLIFrameElement) =>
        {
            const doc = frame.contentDocument;

            if (!doc?.head) return;

            const style = doc.getElementById("tyohnn-editor-theme") ?? Object.assign(doc.createElement("style"), { id: "tyohnn-editor-theme" });

            style.textContent = css;
            if (!style.isConnected) doc.head.append(style);
        };
        const apply = () => element.querySelectorAll("iframe").forEach((frame) =>
        {
            paint(frame);

            if (watched.has(frame)) return;

            watched.add(frame);
            frame.addEventListener("load", () => paint(frame));
        });

        apply();

        const observer = new MutationObserver(apply);

        observer.observe(element, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [root, css]);
};

/**
 * The home hero: one screen split between two systems, both wearing the same neutral palette, so the only
 * thing the divider moves across is the feel. Pairs turn every few seconds and the divider sweeps on its own;
 * a drag (or ← →) takes over and stops both. Only the current pair and the next are mounted, so a switch
 * crossfades into frames that have already loaded.
 */
export const Hero = ({ systems, pairs, paletteCss }: { systems: SystemSummary[]; pairs: HeroPair[]; paletteCss: string }) =>
{
    const { t, href } = useLocale();
    const [index, setIndex] = useState(0);
    const [split, setSplit] = useState(50);
    const [held, setHeld] = useState(false);
    const [paused, setPaused] = useState(false);
    const [visible, setVisible] = useState(true);
    const [cycle, setCycle] = useState(0);
    const section = useRef<HTMLDivElement>(null);
    const stage = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    const running = !paused && !held && visible;
    const current = pairs[index];
    const next = pairs[(index + 1) % pairs.length];
    const viewport = screenOf(SCREEN).viewport;
    const fontOf = (name: string) => systems.find((system) => system.name === name)?.nameFont;

    usePaint(stage, paletteCss);

    useEffect(() =>
    {
        const element = section.current;

        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    // Turn to the next pair
    useEffect(() =>
    {
        if (!running) return;

        const timer = setTimeout(() => setIndex((value) => (value + 1) % pairs.length), ROTATE_MS);

        return () => clearTimeout(timer);
    }, [running, index, cycle, pairs.length]);

    // Sweep the divider while nobody holds it (not at all for reduced motion)
    useEffect(() =>
    {
        if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;
        const start = performance.now();
        const tick = (now: number) =>
        {
            setSplit(50 + 24 * Math.sin(((now - start) / ROTATE_MS) * Math.PI * 2));
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [running, index, cycle]);

    const moveTo = useCallback((clientX: number) =>
    {
        const rect = inner.current?.getBoundingClientRect();

        if (!rect) return;

        setSplit(Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100)));
    }, []);

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) =>
    {
        event.currentTarget.setPointerCapture(event.pointerId);
        setHeld(true);
        moveTo(event.clientX);
    };

    const jump = (to: number) =>
    {
        setIndex(to);
        setHeld(false);
        setCycle((value) => value + 1);
    };

    const compareHref = `${href("/compare")}?${new URLSearchParams({ a: current.a, b: current.b, screen: SCREEN, mode: current.mode })}`;

    return (
        <div ref={section}>
            <div className="hero">
                <h1>{t.hero.titleFirst}<br /><span>{t.hero.titleSecond}</span></h1>
                <div className="hero-side">
                    <p>{t.hero.body}</p>
                    <div className="hero-actions">
                        <a className="btn-solid" href="#systems">{t.hero.browse}</a>
                        <CopyCommand command={`npx tyohnn@latest init --system ${current.b}`} />
                    </div>
                </div>
            </div>

            <div className="hero-split" ref={stage}>
                <div className="stage-frame">
                    <div className="stage-bar">
                        <span className="dots" aria-hidden><i /><i /><i /></span>
                        <span className="path">{SCREEN} · {t.hero.samePalette} · {t.mode[current.mode].toLowerCase()}</span>
                        <button type="button" className="pause" onClick={() => { setPaused((value) => !value); setHeld(false); setCycle((value) => value + 1); }}>
                            {paused || held ? t.hero.play : t.hero.pause}
                        </button>
                    </div>
                    <div
                        ref={inner}
                        className="split-inner"
                        style={{ aspectRatio: `${viewport.width} / ${viewport.height}` }}
                        onPointerDown={onPointerDown}
                        onPointerMove={(event) => event.buttons === 1 && moveTo(event.clientX)}
                    >
                        {[current, next].map((pair) => (
                            <div key={`${pair.a}-${pair.b}`} className="layer-frame" style={{ opacity: pair === current ? 1 : 0 }} aria-hidden={pair !== current}>
                                <div className="side">
                                    <ScaledFrame src={previewUrl(pair.a, SCREEN, pair.mode)} title={t.hero.frameTitle(pair.a)} width={viewport.width} height={viewport.height} eager style={{ height: "100%" }} />
                                </div>
                                <div className="side" style={pair === current ? { clipPath: `inset(0 0 0 ${split}%)` } : undefined}>
                                    <ScaledFrame src={previewUrl(pair.b, SCREEN, pair.mode)} title={t.hero.frameTitle(pair.b)} width={viewport.width} height={viewport.height} eager style={{ height: "100%" }} />
                                </div>
                            </div>
                        ))}
                        <span className="side-tag a" style={{ fontFamily: fontOf(current.a) }}>{current.a}</span>
                        <span className="side-tag b" style={{ fontFamily: fontOf(current.b) }}>{current.b}</span>
                        <div
                            className="handle"
                            style={{ left: `${split}%` }}
                            role="slider"
                            tabIndex={0}
                            aria-label={t.compare.divider(current.a, current.b)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(split)}
                            onKeyDown={(event) =>
                            {
                                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

                                setHeld(true);
                                setSplit((value) => event.key === "ArrowLeft" ? Math.max(2, value - 2) : Math.min(98, value + 2));
                            }}
                        >
                            <span className="knob" aria-hidden>‹ ›</span>
                        </div>
                    </div>
                </div>

                <div className="pair-bar">
                    <div className="pair-list">
                        {pairs.map((pair, position) => (
                            <button
                                key={`${pair.a}-${pair.b}`}
                                type="button"
                                className={position === index ? "pair on" : "pair"}
                                aria-pressed={position === index}
                                onClick={() => jump(position)}
                            >
                                <span style={{ fontFamily: fontOf(pair.a) }}>{pair.a}</span>
                                <i aria-hidden>↔</i>
                                <span style={{ fontFamily: fontOf(pair.b) }}>{pair.b}</span>
                                <small>{t.modeTag[pair.mode]}</small>
                                {position === index && (
                                    <span className="progress" style={{ "--rotate-ms": `${ROTATE_MS}ms` } as CSSProperties}>
                                        <i key={`${index}-${cycle}`} className={running ? undefined : "paused"} />
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <Link className="pair-more" href={compareHref}>{t.hero.compareAny}</Link>
                </div>
            </div>
        </div>
    );
};

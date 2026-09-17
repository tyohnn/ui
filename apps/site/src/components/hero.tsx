"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import { previewUrl, screenOf, type SystemSummary } from "@/lib/site";

import { CopyCommand } from "./copy-command";
import { ScaledFrame } from "./scaled-frame";

const ROTATE_MS = 5000;
const SCREEN = "crm-dashboard";

/**
 * The home hero: one large live CRM that turns through every system, newest first. The rail lists them all
 * (it scrolls once the list outgrows the stage); a click jumps, Pause stops. Only the current system and the
 * next one are mounted, so a switch crossfades into an already-loaded frame.
 */
export const Hero = ({ systems }: { systems: SystemSummary[] }) =>
{
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [visible, setVisible] = useState(true);
    const [cycle, setCycle] = useState(0);
    const section = useRef<HTMLDivElement>(null);
    const list = useRef<HTMLDivElement>(null);
    const running = !paused && visible;
    const current = systems[index];
    const next = systems[(index + 1) % systems.length];
    const viewport = screenOf(SCREEN).viewport;

    useEffect(() =>
    {
        const element = section.current;

        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() =>
    {
        if (!running) return;

        const timer = setTimeout(() => setIndex((value) => (value + 1) % systems.length), ROTATE_MS);

        return () => clearTimeout(timer);
    }, [running, index, cycle, systems.length]);

    // Keep the current system in view inside the rail without scrolling the page.
    useEffect(() =>
    {
        const container = list.current;
        const item = container?.querySelector<HTMLElement>(`[data-index="${index}"]`);

        if (!container || !item) return;

        const top = item.offsetTop - container.offsetTop;

        if (top < container.scrollTop || top + item.offsetHeight > container.scrollTop + container.clientHeight * 0.8)
        {
            container.scrollTo({ top: Math.max(0, top - container.clientHeight / 3), behavior: "smooth" });
        }
    }, [index]);

    const jump = (to: number) =>
    {
        setIndex(to);
        setCycle((value) => value + 1);
    };

    return (
        <div ref={section}>
            <div className="hero">
                <h1>Same screen.<br /><span>Every system.</span></h1>
                <div className="hero-side">
                    <p>
                        One set of shadcn components on Base UI, restyled by three CSS layers. <b>Spacing, corners, depth and type</b> change
                        with the system — not only colour. New systems land as complete snapshots, so the shelf keeps growing.
                    </p>
                    <div className="hero-actions">
                        <a className="btn-solid" href="#systems">Browse systems</a>
                        <CopyCommand command={`npx tyohnn init --system ${current.name}`} />
                    </div>
                </div>
            </div>

            <div className="stage">
                <div className="stage-frame">
                    <div className="stage-bar">
                        <span className="dots" aria-hidden><i /><i /><i /></span>
                        <span className="path">{SCREEN} · {current.name} · {current.defaultMode}</span>
                        <button type="button" className="pause" onClick={() => { setPaused((value) => !value); setCycle((value) => value + 1); }}>
                            {paused ? "▶ Play" : "❚❚ Pause"}
                        </button>
                    </div>
                    <div className="stage-shot">
                        {[current, next].map((system) => (
                            <div key={system.name} className="layer-frame" style={{ opacity: system === current ? 1 : 0 }} aria-hidden={system !== current}>
                                <ScaledFrame
                                    src={previewUrl(system.name, SCREEN, system.defaultMode)}
                                    title={`${system.name} CRM dashboard`}
                                    width={viewport.width}
                                    height={viewport.height}
                                    eager
                                    style={{ position: "absolute", inset: 0 }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rail">
                    <div className="rail-head">
                        <span className="eyebrow">Now showing</span>
                        <span className="eyebrow">{systems.length} systems</span>
                    </div>
                    <div className="rail-list" ref={list}>
                        {systems.map((system, position) => (
                            <button
                                key={system.name}
                                type="button"
                                data-index={position}
                                className={position === index ? "rail-item on" : "rail-item"}
                                aria-pressed={position === index}
                                onClick={() => jump(position)}
                            >
                                <span className="name"><span style={{ fontFamily: system.nameFont }}>{system.name}</span><small>{system.defaultMode}</small></span>
                                <span className="spec">{system.tagline}</span>
                                {position === index && (
                                    <span className="progress" style={{ "--rotate-ms": `${ROTATE_MS}ms` } as CSSProperties}>
                                        <i key={`${index}-${cycle}`} className={running ? undefined : "paused"} />
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <a className="rail-foot" href="#systems">All systems →</a>
                </div>
            </div>
        </div>
    );
};

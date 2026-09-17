"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES, DEFAULT_SCREEN, previewUrl, screenOf, type SystemSummary } from "@/lib/site";

import { ScaledFrame } from "./scaled-frame";

type Sort = "newest" | "az";

const FLIP_MS = 260;
const STAGGER_MS = 35;

/**
 * Every system on one screen. A chip switches the screen for all cards together: the cards turn away one after
 * another, their frames swap, and they turn back. Newest first puts the newest system in a wide card.
 */
export const Gallery = ({ systems }: { systems: SystemSummary[] }) =>
{
    const [screen, setScreen] = useState<string>(DEFAULT_SCREEN);
    const [sort, setSort] = useState<Sort>("newest");
    const [flipping, setFlipping] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const entry = screenOf(screen);

    const ordered = useMemo(() => (sort === "newest" ? systems : [...systems].sort((a, b) => a.name.localeCompare(b.name))), [systems, sort]);
    const newest = systems[0]?.name;

    useEffect(() => () => clearTimeout(timer.current), []);

    const choose = (id: string) =>
    {
        if (id === screen) return;

        setFlipping(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() =>
        {
            setScreen(id);
            setFlipping(false);
        }, FLIP_MS + STAGGER_MS * systems.length);
    };

    return (
        <>
            <div className="section-head" id="systems">
                <h2>Pick a screen.<br />Every system follows.</h2>
                <div className="gallery-side">
                    <p>
                        {spell(CATEGORIES.reduce((count, category) => count + category.screens.length, 0))} product screens — a CRM and
                        {" "}{spell(CATEGORIES.reduce((count, category) => count + category.screens.filter((item) => item.block).length, 0)).toLowerCase()} built
                        on shadcn&apos;s sidebar blocks. One click switches every card together.
                    </p>
                    <div className="sortbar">
                        <span className="eyebrow">{systems.length} systems</span>
                        <span className="seg" role="group" aria-label="Order">
                            <button type="button" aria-pressed={sort === "newest"} onClick={() => setSort("newest")}>Newest</button>
                            <button type="button" aria-pressed={sort === "az"} onClick={() => setSort("az")}>A–Z</button>
                        </span>
                    </div>
                </div>
            </div>

            <div className="chipbar">
                {CATEGORIES.map((category) => (
                    <div key={category.id} className="chiprow" role="group" aria-label={category.label}>
                        <span className="group">{category.label}</span>
                        {category.screens.map((item) => (
                            <button key={item.id} type="button" className="chip" aria-pressed={item.id === screen} onClick={() => choose(item.id)}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                ))}
                <div className="chip-foot">Components, icons and every state are on <Link href="/components">Components →</Link></div>
            </div>

            <div className="grid">
                {ordered.map((system, position) =>
                {
                    const featured = sort === "newest" && position === 0;

                    return (
                        <Link
                            key={system.name}
                            href={`/systems/${system.name}`}
                            className={["card", featured ? "featured" : "", flipping ? "flip" : ""].filter(Boolean).join(" ")}
                            style={{ transitionDelay: `${position * STAGGER_MS}ms` }}
                        >
                            <div className="card-shot">
                                <ScaledFrame
                                    src={previewUrl(system.name, screen, system.defaultMode)}
                                    title={`${system.name}: ${entry.label}`}
                                    width={entry.viewport.width}
                                    height={entry.viewport.height}
                                />
                            </div>
                            <div className="card-body">
                                <div className="card-title">
                                    <h3 style={{ fontFamily: system.nameFont }}>{system.name}</h3>
                                    <span className="tag">{system.defaultMode}</span>
                                    {system.name === newest && <span className="tag new">New</span>}
                                    <span className="open">Open →</span>
                                </div>
                                <div className="card-spec">{system.tagline}</div>
                            </div>
                        </Link>
                    );
                })}
                <Link href="/compare" className="all-tile">
                    <b>Compare two →</b>
                    <span>Any two of {systems.length} systems, side by side</span>
                </Link>
            </div>
        </>
    );
};

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];

/** 17 → "Seventeen" (numbers past twenty stay digits) */
const spell = (value: number) => WORDS[value] ?? String(value);

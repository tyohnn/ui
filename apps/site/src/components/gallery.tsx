"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES, DEFAULT_SCREEN, previewUrl, screenOf, type SystemSummary } from "@/lib/site";

import { useLocale } from "./locale-provider";
import { ScaledFrame } from "./scaled-frame";

type Sort = "newest" | "az";

const FLIP_MS = 260;
const STAGGER_MS = 35;

/**
 * Every system on one screen. A chip switches the screen for all cards together: the cards turn away one after
 * another, their frames swap, and they turn back. The chips stay pinned to the top while the cards scroll
 * under them, so the screen can be switched from anywhere in the grid.
 */
export const Gallery = ({ systems }: { systems: SystemSummary[] }) =>
{
    const { t, labels, href } = useLocale();
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
                <h2>{t.gallery.titleFirst}<br />{t.gallery.titleSecond}</h2>
                <div className="gallery-side">
                    <p>
                        {t.gallery.body(
                            CATEGORIES.reduce((count, category) => count + category.screens.length, 0),
                            CATEGORIES.reduce((count, category) => count + category.screens.filter((item) => item.block).length, 0),
                        )}
                    </p>
                    <div className="sortbar">
                        <span className="eyebrow">{t.gallery.count(systems.length)}</span>
                        <span className="seg" role="group" aria-label={t.gallery.orderLabel}>
                            <button type="button" aria-pressed={sort === "newest"} onClick={() => setSort("newest")}>{t.gallery.newest}</button>
                            <button type="button" aria-pressed={sort === "az"} onClick={() => setSort("az")}>{t.gallery.alphabetical}</button>
                        </span>
                    </div>
                </div>
            </div>

            {/* The bar is sticky inside this wrapper, so it lets go once the grid has scrolled past */}
            <div className="gallery-body">
                <div className="chipbar">
                    {CATEGORIES.map((category) => (
                        <div key={category.id} className="chiprow" role="group" aria-label={labels.category(category.id, category.label)}>
                            <span className="group">{labels.category(category.id, category.label)}</span>
                            {category.screens.map((item) => (
                                <button key={item.id} type="button" className="chip" aria-pressed={item.id === screen} onClick={() => choose(item.id)}>
                                    {labels.screen(item.id, item.label)}
                                </button>
                            ))}
                        </div>
                    ))}
                    <div className="chip-foot">{t.gallery.chipFoot((label) => <Link href={href("/components")}>{label}</Link>)}</div>
                </div>

                <div className="grid">
                    {ordered.map((system, position) => (
                        <Link
                            key={system.name}
                            href={href(`/systems/${system.name}`)}
                            className={flipping ? "card flip" : "card"}
                            style={{ transitionDelay: `${position * STAGGER_MS}ms` }}
                        >
                            <div className="card-shot">
                                <ScaledFrame
                                    src={previewUrl(system.name, screen, "dark")}
                                    title={`${system.name}: ${labels.screen(entry.id, entry.label)}`}
                                    width={entry.viewport.width}
                                    height={entry.viewport.height}
                                />
                            </div>
                            <div className="card-body">
                                <div className="card-title">
                                    <h3 style={{ fontFamily: system.nameFont }}>{system.name}</h3>
                                    <span className="tag">{t.modeTag[system.defaultMode]}</span>
                                    {system.name === newest && <span className="tag new">{t.gallery.isNew}</span>}
                                    <span className="open">{t.gallery.open}</span>
                                </div>
                                <div className="card-spec">{system.tagline}</div>
                            </div>
                        </Link>
                    ))}
                    <Link href={href("/compare")} className="all-tile">
                        <b>{t.gallery.compareTitle}</b>
                        <span>{t.gallery.compareBody(systems.length)}</span>
                    </Link>
                </div>
            </div>
        </>
    );
};

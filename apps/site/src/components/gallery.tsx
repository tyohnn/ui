"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES, DEFAULT_SCREEN, previewUrl, screenOf, type SystemSummary } from "@/lib/site";

import { useLocale } from "./locale-provider";
import { ScaledFrame } from "./scaled-frame";

type Sort = "newest" | "az";

const FLAGSHIP = "graphite";
const FLIP_MS = 260;
const STAGGER_MS = 35;

/**
 * Every system on one screen. A chip switches the screen for all cards together: the cards turn away one after
 * another, their frames swap, and they turn back. The chips stay pinned to the top while the cards scroll
 * under them, so the screen can be switched from anywhere in the grid; once pinned they fold into one thin row.
 */
export const Gallery = ({ systems }: { systems: SystemSummary[] }) =>
{
    const { t, labels, href } = useLocale();
    const [screen, setScreen] = useState<string>(DEFAULT_SCREEN);
    const [sort, setSort] = useState<Sort>("newest");
    const [flipping, setFlipping] = useState(false);
    const [stuck, setStuck] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const sentinel = useRef<HTMLDivElement>(null);
    const bar = useRef<HTMLDivElement>(null);
    const open = useRef({ height: 0, margin: 0 });
    const entry = screenOf(screen);

    // Newest first, but graphite (the flagship) always leads; A–Z is plain alphabetical.
    const ordered = useMemo(
        () => sort === "newest"
            ? [...systems].sort((a, b) => Number(b.name === FLAGSHIP) - Number(a.name === FLAGSHIP))
            : [...systems].sort((a, b) => a.name.localeCompare(b.name)),
        [systems, sort],
    );
    const newest = systems[0]?.name;

    useEffect(() => () => clearTimeout(timer.current), []);

    // The sentinel sits where the bar's top rests: once it passes under the sticky offset, the bar is pinned.
    useEffect(() =>
    {
        const node = sentinel.current;
        if (!node) return;

        const top = parseFloat(getComputedStyle(bar.current!).top) || 0;
        const observer = new IntersectionObserver(
            ([item]) => setStuck(!item.isIntersecting && item.boundingClientRect.top < top),
            { rootMargin: `-${top}px 0px 0px 0px` },
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    // The thin bar is shorter than the open one: the difference goes into its bottom margin, so the cards
    // below stay where they were instead of jumping up as it folds.
    useLayoutEffect(() =>
    {
        const node = bar.current;
        if (!node) return;

        if (!stuck)
        {
            node.style.marginBottom = "";
            open.current = { height: node.offsetHeight, margin: parseFloat(getComputedStyle(node).marginBottom) || 0 };
            return;
        }

        node.style.marginBottom = `${open.current.margin + open.current.height - node.offsetHeight}px`;
    }, [stuck]);

    // In the thin row the chosen chip may sit past the edge: bring it into view.
    useEffect(() =>
    {
        const node = bar.current;
        const chip = node?.querySelector<HTMLElement>(".chip[aria-pressed=\"true\"]");
        if (!node || !chip || node.scrollWidth <= node.clientWidth) return;

        const left = chip.offsetLeft - node.offsetLeft;
        if (left < node.scrollLeft || left + chip.offsetWidth > node.scrollLeft + node.clientWidth)
            node.scrollTo({ left: left - (node.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
    }, [stuck, screen]);

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
                <div ref={sentinel} className="chipbar-sentinel" aria-hidden />
                <div ref={bar} className={stuck ? "chipbar stuck" : "chipbar"}>
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

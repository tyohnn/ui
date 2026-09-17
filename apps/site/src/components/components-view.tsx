"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { COVERAGE, COVERAGE_POPUPS, type Mode, previewUrl, type SystemSummary } from "@/lib/site";

import { ModeSeg, SystemCombobox } from "./pickers";
import { ScaledFrame } from "./scaled-frame";

/** The coverage page's own width (apps/preview coverage/index.tsx lays sections out at 1100px). */
const COVERAGE_WIDTH = 1100;
const COVERAGE_HEIGHT = 900;

/**
 * Every coverage section of one system, grouped, each in its own live frame (popups rendered open). The
 * system and mode pickers restyle every frame; the index filters and follows the scroll position.
 */
export const ComponentsView = ({ systems, components }: { systems: SystemSummary[]; components: number }) =>
{
    const [name, setName] = useState(systems[0].name);
    const system = systems.find((entry) => entry.name === name) ?? systems[0];
    const [mode, setMode] = useState<Mode>(system.defaultMode);
    const [query, setQuery] = useState("");
    const [current, setCurrent] = useState<string>(COVERAGE[0].sections[0]);
    const search = useRef<HTMLInputElement>(null);

    const sections = COVERAGE.reduce((count, group) => count + group.sections.length, 0);

    const groups = useMemo(() =>
    {
        const needle = query.trim().toLowerCase();

        return COVERAGE
            .map((group) => ({ ...group, sections: needle ? group.sections.filter((section) => section.includes(needle)) : group.sections }))
            .filter((group) => group.sections.length > 0);
    }, [query]);

    // Coverage frames render their popups open, and an open dialog or menu focuses itself. Focus moving into a
    // frame scrolls the page to it, so when a frame takes focus without a click or key press on this page just
    // before, the scroll that follows is undone and the frame let go.
    useEffect(() =>
    {
        let intent = 0;
        let stolen = 0;
        let settled = window.scrollY;
        const mark = () => { intent = Date.now(); };
        const onBlur = () =>
        {
            // The window blurs when focus moves into a frame; activeElement is that frame by the next task.
            setTimeout(() =>
            {
                const focused = document.activeElement;

                if (focused?.tagName !== "IFRAME" || Date.now() - intent < 800) return;

                stolen = Date.now();
                window.scrollTo({ top: settled, behavior: "instant" });
                (focused as HTMLIFrameElement).blur();
            });
        };
        const onScroll = () =>
        {
            if (Date.now() - stolen < 300)
            {
                window.scrollTo({ top: settled, behavior: "instant" });

                return;
            }

            settled = window.scrollY;
        };

        window.addEventListener("pointerdown", mark, { capture: true });
        window.addEventListener("keydown", mark, { capture: true });
        window.addEventListener("blur", onBlur);
        window.addEventListener("scroll", onScroll, { passive: true });

        return () =>
        {
            window.removeEventListener("pointerdown", mark, { capture: true });
            window.removeEventListener("keydown", mark, { capture: true });
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    // `/` focuses the filter, as the kbd hint says.
    useEffect(() =>
    {
        const onKey = (event: KeyboardEvent) =>
        {
            const target = event.target as HTMLElement;

            if (event.key === "/" && target.tagName !== "INPUT" && target.tagName !== "TEXTAREA")
            {
                event.preventDefault();
                search.current?.focus();
            }
        };

        window.addEventListener("keydown", onKey);

        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() =>
    {
        const onScroll = () =>
        {
            // The card whose top most recently crossed a line just below the top of the viewport.
            const line = 160;
            let active: string | undefined;
            let best = -Infinity;

            document.querySelectorAll<HTMLElement>("[data-section-card]").forEach((card) =>
            {
                const top = card.getBoundingClientRect().top;

                if (top <= line && top > best)
                {
                    best = top;
                    active = card.dataset.sectionCard;
                }
            });

            setCurrent(active ?? groups[0]?.sections[0] ?? "");
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, [groups]);

    // Frames above the target finish measuring after the jump and shrink, which would carry the target away:
    // land on it, then re-align a few times while they settle (unless the reader scrolls meanwhile).
    const jumpTo = (event: React.MouseEvent, section: string) =>
    {
        event.preventDefault();

        const target = document.getElementById(`section-${section}`);

        if (!target) return;

        history.replaceState(null, "", `#section-${section}`);

        const align = () => window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - 24, behavior: "instant" });
        let moved = false;
        const stop = () => { moved = true; };

        window.addEventListener("wheel", stop, { once: true, passive: true });
        window.addEventListener("touchmove", stop, { once: true, passive: true });
        align();
        [300, 900, 1800, 3000].forEach((delay) => setTimeout(() => { if (!moved) align(); }, delay));
        setTimeout(() =>
        {
            window.removeEventListener("wheel", stop);
            window.removeEventListener("touchmove", stop);
        }, 3100);
        setCurrent(section);
    };

    const pickSystem = (next: string) =>
    {
        setName(next);
        setMode(systems.find((entry) => entry.name === next)?.defaultMode ?? "light");
    };

    return (
        <>
            <div className="comp-head">
                <div>
                    <div className="eyebrow">{components} components · {sections} sections</div>
                    <h1>Components</h1>
                    <p>
                        Every registry component in one system: variants, sizes and states — disabled, invalid, checked, selected, open.
                        Switch the system and the whole sheet restyles.
                    </p>
                </div>
                <div className="head-tools">
                    <ModeSeg mode={mode} onChange={setMode} />
                    <SystemCombobox systems={systems} value={name} onChange={pickSystem} />
                </div>
            </div>

            <div className="all">
                <nav className="index" aria-label="Components">
                    <label className="search">
                        <span className="sr-only">Filter components</span>
                        <input ref={search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter components" />
                        <kbd>/</kbd>
                    </label>
                    {groups.map((group) => (
                        <div key={group.id} className="igroup">
                            <h4>{group.label}<span>{group.sections.length}</span></h4>
                            {group.sections.map((section) => (
                                <a key={section} href={`#section-${section}`} aria-current={current === section ? "true" : undefined} onClick={(event) => jumpTo(event, section)}>{section}</a>
                            ))}
                        </div>
                    ))}
                </nav>

                <div>
                    {groups.length === 0 && <p className="empty-note">No component matches “{query}”.</p>}
                    {groups.map((group) => (
                        <section key={group.id} className="gsec">
                            <div className="gsec-head"><h3>{group.label}</h3><span>{group.sections.length} sections</span></div>
                            <div className="masonry">
                                {group.sections.map((section) => (
                                    <div key={section} id={`section-${section}`} className="ccard" data-section-card={section}>
                                        <div className="ccard-top">
                                            <b>{section}</b>
                                            {COVERAGE_POPUPS.has(section)
                                                ? <span className="tag pop">open popup</span>
                                                : <span className="tag">{group.id}</span>}
                                        </div>
                                        <ScaledFrame
                                            src={previewUrl(system.name, "coverage", mode, section)}
                                            title={`${system.name}: ${section}`}
                                            width={COVERAGE_WIDTH}
                                            height={COVERAGE_HEIGHT}
                                            fitContent
                                            interactive
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </>
    );
};

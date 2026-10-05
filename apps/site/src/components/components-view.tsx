"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { COVERAGE, COVERAGE_POPUPS, previewUrl, type SystemSummary } from "@/lib/site";

import { useLocale } from "./locale-provider";
import { useMode } from "./mode-provider";
import { ModeSeg, SystemCombobox } from "./pickers";
import { ThemeEditor } from "./theme-editor";
import { ThemeProvider } from "./theme-provider";
import type { ThemeInfo } from "@/lib/themes";
import { ScaledFrame } from "./scaled-frame";

/** The coverage page's own width (apps/preview coverage/index.tsx lays sections out at 1100px). */
const COVERAGE_WIDTH = 1100;
const COVERAGE_HEIGHT = 900;

/**
 * Every coverage section of one system, grouped, each in its own live frame (popups rendered open). The
 * system and mode pickers restyle every frame; the index filters and follows the scroll position.
 */
export const ComponentsView = ({ systems, components, themes, owns }: { systems: SystemSummary[]; components: number; themes: ThemeInfo[]; owns: Record<string, string> }) =>
{
    const { t, labels } = useLocale();
    const [name, setName] = useState(systems[0].name);
    const system = systems.find((entry) => entry.name === name) ?? systems[0];
    const { mode, setMode } = useMode();
    const [query, setQuery] = useState("");
    const [current, setCurrent] = useState<string>(COVERAGE[0].sections[0]);
    const search = useRef<HTMLInputElement>(null);

    const sections = COVERAGE.reduce((count, group) => count + group.sections.length, 0);

    const groups = useMemo(() =>
    {
        const needle = query.trim().toLowerCase();

        return COVERAGE
            .map((group) => ({ ...group, sections: needle ? group.sections.filter((section) => section.includes(needle) || labels.section(section).toLowerCase().includes(needle)) : group.sections }))
            .filter((group) => group.sections.length > 0);
    }, [query, labels]);

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
    };

    return (
        <ThemeProvider themes={themes} own={owns[name] ?? name}>
            <div className="comp-head">
                <div>
                    <div className="eyebrow">{t.components.eyebrow(components, sections)}</div>
                    <h1>{t.components.title}</h1>
                    <p>{t.components.body}</p>
                </div>
                <div className="head-tools">
                    <ThemeEditor systemName={name} />
                    <ModeSeg mode={mode} onChange={setMode} />
                    <SystemCombobox systems={systems} value={name} onChange={pickSystem} />
                </div>
            </div>

            <div className="all">
                <nav className="index" aria-label={t.components.navLabel}>
                    <label className="search">
                        <span className="sr-only">{t.components.filter}</span>
                        <input ref={search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.components.filter} />
                        <kbd>/</kbd>
                    </label>
                    {groups.map((group) => (
                        <div key={group.id} className="igroup">
                            <h4>{labels.coverageGroup(group.id, group.label)}<span>{group.sections.length}</span></h4>
                            {group.sections.map((section) => (
                                <a key={section} href={`#section-${section}`} aria-current={current === section ? "true" : undefined} onClick={(event) => jumpTo(event, section)}>{labels.section(section)}</a>
                            ))}
                        </div>
                    ))}
                </nav>

                <div>
                    {groups.length === 0 && <p className="empty-note">{t.components.empty(query)}</p>}
                    {groups.map((group) => (
                        <section key={group.id} className="gsec">
                            <div className="gsec-head"><h3>{labels.coverageGroup(group.id, group.label)}</h3><span>{t.components.sections(group.sections.length)}</span></div>
                            <div className="masonry">
                                {group.sections.map((section) => (
                                    <div key={section} id={`section-${section}`} className="ccard" data-section-card={section}>
                                        <div className="ccard-top">
                                            <b>{labels.section(section)}</b>
                                            {labels.section(section) !== section && <small className="sid">{section}</small>}
                                            {COVERAGE_POPUPS.has(section)
                                                ? <span className="tag pop">{t.components.openPopup}</span>
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
        </ThemeProvider>
    );
};

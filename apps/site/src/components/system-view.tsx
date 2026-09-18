"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

import { CATEGORIES, type Mode, previewUrl, REPOSITORY, screenSource, type SystemSummary } from "@/lib/site";

import { CopyCommand } from "./copy-command";
import { ModeSeg } from "./pickers";
import { ScaledFrame } from "./scaled-frame";
import { ThemeEditor } from "./theme-editor";

/**
 * A system page below the breadcrumb: the intro (server-rendered, passed in), the install panel, the sticky
 * category bar and every screen stacked by category. The bar's buttons scroll to their category and follow the
 * scroll position; both mode switches drive every frame.
 */
export const SystemView = ({
    system,
    previous,
    next,
    intro,
}: {
    system: SystemSummary;
    previous: string;
    next: string;
    intro: ReactNode;
}) =>
{
    const [mode, setMode] = useState<Mode>(system.defaultMode);
    const [current, setCurrent] = useState<string>(CATEGORIES[0].id);
    const screens = CATEGORIES.reduce((count, category) => count + category.screens.length, 0);

    useEffect(() =>
    {
        const blocks = CATEGORIES.map((category) => document.getElementById(category.id)).filter((node): node is HTMLElement => Boolean(node));

        const onScroll = () =>
        {
            // The last category whose top has passed a line a third of the way down the viewport.
            const line = window.innerHeight / 3;
            let active = blocks[0]?.id;

            for (const block of blocks)
            {
                if (block.getBoundingClientRect().top <= line) active = block.id;
            }

            if (active) setCurrent(active);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <div className="sys-head">
                {intro}
                <div className="panel">
                    <div className="eyebrow">Install</div>
                    <CopyCommand command={`npx tyohnn init --system ${system.name}`} />
                    <div className="panel-row"><span>Preview mode</span><ModeSeg mode={mode} onChange={setMode} /></div>
                    <div className="panel-row">
                        <span>Palette</span>
                        <span className="swatches" aria-label={`${system.defaultMode} palette`}>
                            {system.palette.map((colour, index) => <i key={index} style={{ background: colour }} title={colour} />)}
                        </span>
                    </div>
                    <div className="neighbors">
                        <Link href={`/systems/${previous}`}>← {previous}</Link>
                        <a href={`${REPOSITORY}/blob/main/registry/systems/${system.name}/DESIGN.md`}>DESIGN.md</a>
                        <Link href={`/systems/${next}`}>{next} →</Link>
                    </div>
                </div>
            </div>

            <nav className="catbar" aria-label="Screen categories">
                {CATEGORIES.map((category) => (
                    <a
                        key={category.id}
                        href={`#${category.id}`}
                        className="cat"
                        aria-current={current === category.id ? "true" : undefined}
                    >
                        {category.label}<small>{category.screens.length}</small>
                    </a>
                ))}
                <span className="end"><ThemeEditor systemName={system.name} />{screens} screens<ModeSeg mode={mode} onChange={setMode} /></span>
            </nav>

            {CATEGORIES.map((category) => (
                <section key={category.id} id={category.id} className="cat-block">
                    <div className="cat-head"><h2>{category.label}</h2><span className="count">{category.screens.length} screens</span></div>
                    {category.screens.map((screen) => (
                        <div key={screen.id} className="shot-row">
                            <div className="meta">
                                <h3>{screen.label}</h3>
                                <div className="src">{screenSource(screen)} · {screen.viewport.width}×{screen.viewport.height}</div>
                                <div className="links">
                                    <a href={previewUrl(system.name, screen.id, mode)} target="_blank" rel="noreferrer">Full screen ↗</a>
                                    <Link href={`/compare?a=${system.name}&b=${next}&screen=${screen.id}&mode=${mode}`}>Compare</Link>
                                </div>
                            </div>
                            <div className="frame">
                                <ScaledFrame
                                    src={previewUrl(system.name, screen.id, mode)}
                                    title={`${system.name}: ${screen.label}`}
                                    width={screen.viewport.width}
                                    height={screen.viewport.height}
                                    interactive
                                    style={{ aspectRatio: `${screen.viewport.width} / ${screen.viewport.height}` }}
                                />
                            </div>
                        </div>
                    ))}
                </section>
            ))}
        </>
    );
};

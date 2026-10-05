"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

import { CATEGORIES, type Mode, previewUrl, type SystemSummary } from "@/lib/site";

import { CopyCommand } from "./copy-command";
import { FramePanel, useFrameTokens } from "./frame-editor";
import { useLocale } from "./locale-provider";
import { ModeSeg } from "./pickers";
import { ScaledFrame } from "./scaled-frame";
import { ThemePanel } from "./theme-editor";
import { useTheme } from "./theme-provider";

/**
 * A system page below the breadcrumb: the intro (server-rendered, passed in), the install panel, the sticky
 * category bar and every screen stacked by category. The bar's buttons scroll to their category and follow the
 * scroll position; both mode switches drive every frame. Beside the screens stands a side panel that is always there,
 * with Colours and Layout as its tabs, so what a slider moves can be watched while it moves. Each screen is a row: its
 * title and links on one line, the preview under it.
 */
export const SystemView = ({
    system,
    next,
    intro,
}: {
    system: SystemSummary;
    /** The neighbour after this one: the Compare link's other side. 이웃 이동 링크는 빵부스러기 줄이 갖는다. */
    next: string;
    intro: ReactNode;
}) =>
{
    const { t, labels, href } = useLocale();
    const [mode, setMode] = useState<Mode>("dark");
    const [current, setCurrent] = useState<string>(CATEGORIES[0].id);
    const [tab, setTab] = useState<"layout" | "colours">("colours");
    const theme = useTheme();
    const frames = useFrameTokens();
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
                    <div className="eyebrow">{t.systemView.install}</div>
                    <CopyCommand command={`npx tyohnn@latest init --system ${system.name}`} />
                    <div className="panel-row"><span>{t.systemView.previewMode}</span><ModeSeg mode={mode} onChange={setMode} /></div>
                    <div className="panel-row">
                        <span>{t.systemView.palette}</span>
                        <span className="swatches" aria-label={t.systemView.paletteLabel(t.modeTag[system.defaultMode])}>
                            {system.palette.map((colour, index) => <i key={index} style={{ background: colour }} title={colour} />)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="sys-body">
                <aside className="th-panel side-panel" aria-label={t.systemView.sidePanel}>
                    <div className="side-tabs" role="tablist">
                        <button type="button" role="tab" aria-selected={tab === "colours"} onClick={() => setTab("colours")}>
                            {t.theme.title}{theme && !theme.isOwn && <span className="th-badge">{t.theme.edited}</span>}
                        </button>
                        <button type="button" role="tab" aria-selected={tab === "layout"} onClick={() => setTab("layout")}>
                            {t.frames.title}{frames.changed > 0 && <span className="th-badge">{t.frames.edited}</span>}
                        </button>
                    </div>
                    {tab === "colours" ? <ThemePanel systemName={system.name} /> : <FramePanel frames={frames} />}
                </aside>

                <div className="sys-main">
                    <nav className="catbar" aria-label={t.systemView.categoriesLabel}>
                        {CATEGORIES.map((category) => (
                            <a
                                key={category.id}
                                href={`#${category.id}`}
                                className="cat"
                                aria-current={current === category.id ? "true" : undefined}
                            >
                                {labels.category(category.id, category.label)}<small>{category.screens.length}</small>
                            </a>
                        ))}
                        <span className="end">
                            <span className="count">{t.systemView.screens(screens)}</span>
                            <ModeSeg mode={mode} onChange={setMode} />
                        </span>
                    </nav>

                    {CATEGORIES.map((category) => (
                        <section key={category.id} id={category.id} className="cat-block">
                            <div className="cat-head"><h2>{labels.category(category.id, category.label)}</h2><span className="count">{t.systemView.screens(category.screens.length)}</span></div>
                            {category.screens.map((screen) => (
                                <div key={screen.id} className="shot-row">
                                    <div className="meta">
                                        <h3>{labels.screen(screen.id, screen.label)}</h3>
                                        <div className="links">
                                            <a href={previewUrl(system.name, screen.id, mode)} target="_blank" rel="noreferrer">{t.systemView.fullScreen}</a>
                                            <Link href={href(`/compare?a=${system.name}&b=${next}&screen=${screen.id}&mode=${mode}`)}>{t.systemView.compare}</Link>
                                        </div>
                                    </div>
                                    <div className="frame">
                                        <ScaledFrame
                                            src={previewUrl(system.name, screen.id, mode)}
                                            title={`${system.name}: ${labels.screen(screen.id, screen.label)}`}
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
                </div>
            </div>
        </>
    );
};

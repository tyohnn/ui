"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

/**
 * A live preview iframe laid out at a desktop viewport (`width` × `height` CSS px) and scaled to the width of
 * its box. The box's height comes from CSS (an aspect ratio or a stretched cell); `fitContent` instead sizes
 * the box to what the page inside draws (coverage sections), measured through the same-origin document.
 * `interactive={false}` makes it a picture: no pointer events, not focusable, hidden from assistive tech.
 */
export const ScaledFrame = ({
    src,
    title,
    width = 1440,
    height = 900,
    interactive = false,
    fitContent = false,
    eager = false,
    className,
    style,
}: {
    src: string;
    title: string;
    width?: number;
    height?: number;
    interactive?: boolean;
    fitContent?: boolean;
    eager?: boolean;
    className?: string;
    style?: CSSProperties;
}) =>
{
    const box = useRef<HTMLDivElement>(null);
    const frame = useRef<HTMLIFrameElement>(null);
    const [scale, setScale] = useState(0);
    const [contentHeight, setContentHeight] = useState<number | null>(null);

    useEffect(() =>
    {
        const element = box.current;

        if (!element) return;

        const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / width));

        observer.observe(element);

        return () => observer.disconnect();
    }, [width]);

    // Coverage sections: the section plus any popup it opens, measured a few times while fonts and popups settle.
    useEffect(() =>
    {
        if (!fitContent) return;

        const iframe = frame.current;

        if (!iframe) return;

        let timers: ReturnType<typeof setTimeout>[] = [];

        const measure = () =>
        {
            const doc = iframe.contentDocument;
            const section = doc?.querySelector<HTMLElement>("[data-coverage-section]");

            if (!doc || !section) return;

            let top = section.getBoundingClientRect().top;
            let bottom = section.getBoundingClientRect().bottom;

            for (const portal of (section.dataset.coveragePortals ?? "").split("|").filter(Boolean))
            {
                // `<selector>^<n>` names the n-th ancestor of the match (tooling/snapshot/collect.mjs).
                const [, selector, up] = portal.match(/^(.*?)(?:\^(\d+))?$/) ?? [];

                doc.querySelectorAll(selector).forEach((match) =>
                {
                    let node: Element = match;

                    for (let step = 0; step < Number(up ?? 0) && node.parentElement; step++) node = node.parentElement;

                    const rect = node.getBoundingClientRect();

                    if (rect.height > 0 && rect.height < height * 3)
                    {
                        top = Math.min(top, rect.top);
                        bottom = Math.max(bottom, rect.bottom);
                    }
                });
            }

            setContentHeight(Math.ceil(Math.min(bottom + 16, height * 3)));
        };

        const onLoad = () =>
        {
            timers.forEach(clearTimeout);
            timers = [150, 600, 1500].map((delay) => setTimeout(measure, delay));
        };

        iframe.addEventListener("load", onLoad);

        return () =>
        {
            iframe.removeEventListener("load", onLoad);
            timers.forEach(clearTimeout);
        };
    }, [fitContent, height, src, scale > 0]);

    const frameHeight = fitContent && contentHeight ? Math.max(contentHeight, height) : height;
    const boxStyle: CSSProperties = fitContent
        ? { height: scale > 0 ? (contentHeight ?? height) * scale : undefined, aspectRatio: scale > 0 ? undefined : `${width} / ${height}`, ...style }
        : { ...style };

    return (
        <div ref={box} className={["scaled", interactive ? "" : "inert", className].filter(Boolean).join(" ")} style={boxStyle}>
            {scale > 0 && (
                <iframe
                    ref={frame}
                    src={src}
                    title={title}
                    loading={eager ? "eager" : "lazy"}
                    tabIndex={interactive ? undefined : -1}
                    aria-hidden={interactive ? undefined : true}
                    style={{ width, height: frameHeight, transform: `scale(${scale})` }}
                />
            )}
        </div>
    );
};

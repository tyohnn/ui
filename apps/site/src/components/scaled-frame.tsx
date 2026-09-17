"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

/** Room kept around a cropped coverage section, in CSS px of the page inside */
const CROP_PAD = 16;

/**
 * A live preview iframe laid out at a desktop viewport (`width` × `height` CSS px) and scaled to the width of
 * its box. The box's height comes from CSS (an aspect ratio or a stretched cell); `fitContent` instead crops to
 * what the page inside draws (coverage sections), measured through the same-origin document, and scales that
 * crop to the box's width (at most 1:1).
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
    const [boxWidth, setBoxWidth] = useState(0);
    const [crop, setCrop] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

    useEffect(() =>
    {
        const element = box.current;

        if (!element) return;

        const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    // Coverage sections: crop to what the section draws (its states and any popup it opens, without its own
    // heading, which the card already shows), measured a few times while fonts and popups settle.
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

            const body = section.querySelector<HTMLElement>(":scope > h2 + *") ?? section;
            const start = body.getBoundingClientRect();
            let left = start.left;
            let top = start.top;
            let right = start.left;
            let bottom = start.bottom;
            const include = (rect: DOMRect) =>
            {
                if (rect.width === 0 || rect.height === 0 || rect.height > height * 3) return;

                left = Math.min(left, rect.left);
                top = Math.min(top, rect.top);
                right = Math.max(right, rect.right);
                bottom = Math.max(bottom, rect.bottom);
            };

            // Leaves only: rows and grids stretch to the page width, the controls inside them do not.
            body.querySelectorAll("*").forEach((node) =>
            {
                if (node.childElementCount > 0 && node.tagName !== "svg" && node.tagName !== "BUTTON") return;

                // Clamp to the section box: content scrolled or clipped inside it (a scroll area's list) is not drawn.
                // (Hidden form inputs sit at the page origin; clamping drops them too.)
                const rect = node.getBoundingClientRect();
                const l = Math.max(rect.left, start.left);
                const t = Math.max(rect.top, start.top);
                const r = Math.min(rect.right, start.right);
                const btm = Math.min(rect.bottom, start.bottom);

                if (r > l && btm > t) include(new DOMRect(l, t, r - l, btm - t));
            });

            for (const portal of (section.dataset.coveragePortals ?? "").split("|").filter(Boolean))
            {
                // `<selector>^<n>` names the n-th ancestor of the match (tooling/snapshot/collect.mjs).
                const [, selector, up] = portal.match(/^(.*?)(?:\^(\d+))?$/) ?? [];

                doc.querySelectorAll(selector).forEach((match) =>
                {
                    let node: Element = match;

                    for (let step = 0; step < Number(up ?? 0) && node.parentElement; step++) node = node.parentElement;

                    const rect = node.getBoundingClientRect();

                    // A backdrop covering the page says nothing about where the popup is.
                    if (rect.width >= width * 0.9 && rect.height >= height * 0.9) return;

                    // Popups open over or below the states, never above the section's first row.
                    const clampedTop = Math.max(rect.top, start.top);

                    if (rect.bottom > clampedTop) include(new DOMRect(rect.left, clampedTop, rect.width, rect.bottom - clampedTop));
                });
            }

            left = Math.max(0, left - CROP_PAD);
            top = Math.max(0, top - CROP_PAD);

            setCrop({ left, top, width: Math.min(width, right + CROP_PAD) - left, height: Math.min(height * 3, bottom + CROP_PAD) - top });
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
    }, [fitContent, height, width, src, boxWidth > 0]);

    // A cropped section fills the card's width but never grows past its real size.
    const cropped = fitContent && crop ? crop : null;
    const scale = cropped ? Math.min(1, boxWidth / cropped.width) : boxWidth / width;
    const frameHeight = cropped ? Math.max(height, cropped.top + cropped.height) : height;
    const transform = cropped ? `scale(${scale}) translate(${-cropped.left}px, ${-cropped.top}px)` : `scale(${scale})`;
    const boxStyle: CSSProperties = fitContent
        ? { height: boxWidth > 0 ? (cropped ? cropped.height * scale : height * scale) : undefined, aspectRatio: boxWidth > 0 ? undefined : `${width} / ${height}`, ...style }
        : { ...style };

    return (
        <div ref={box} className={["scaled", interactive ? "" : "inert", className].filter(Boolean).join(" ")} style={boxStyle}>
            {boxWidth > 0 && (
                <iframe
                    ref={frame}
                    src={src}
                    title={title}
                    loading={eager ? "eager" : "lazy"}
                    tabIndex={interactive ? undefined : -1}
                    aria-hidden={interactive ? undefined : true}
                    style={{ width, height: frameHeight, transform }}
                />
            )}
        </div>
    );
};

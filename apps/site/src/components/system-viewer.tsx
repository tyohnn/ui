"use client";

import { useState } from "react";

import { buttonVariants } from "@tyohnn/components/button";

import { DEFAULT_TEMPLATE, previewUrl, templateOf, type Mode, type TemplateId } from "@/lib/site";

import { Segmented, TemplateSelect } from "./pickers";
import { ScaledFrame } from "./scaled-frame";

const MODES = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
] as const;

/** One system, one template at a time, in a large interactive iframe. */
export const SystemViewer = ({ system, defaultMode }: { system: string; defaultMode: Mode }) =>
{
    const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
    const [mode, setMode] = useState<Mode>(defaultMode);
    const src = previewUrl(system, template, mode);
    const entry = templateOf(template);

    return (
        <section aria-label="Live preview" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <TemplateSelect value={template} onChange={setTemplate} />
                <div className="flex items-center gap-2">
                    <Segmented label="Mode" value={mode} options={MODES} onChange={setMode} />
                    <a href={src} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Open in new tab
                    </a>
                </div>
            </div>
            {entry.group === "blocks" ? (
                // A block is a page that fills its viewport: render it at that viewport, scaled to the column.
                <ScaledFrame
                    key={src}
                    src={src}
                    title={`${system} · ${template} · ${mode}`}
                    width={entry.viewport.width}
                    height={entry.viewport.height}
                    interactive
                    className="rounded-lg border"
                />
            ) : (
                // A showcase template is a long page: a tall scrolling frame, at least as wide as its viewport (narrow screens scroll sideways).
                <div className="overflow-x-auto rounded-lg border bg-muted">
                    <iframe
                        key={src}
                        src={src}
                        title={`${system} · ${template} · ${mode}`}
                        data-viewer=""
                        className="block h-[78vh] min-h-[520px] w-full border-0"
                        style={{ minWidth: Math.min(entry.viewport.width, 960) }}
                    />
                </div>
            )}
        </section>
    );
};

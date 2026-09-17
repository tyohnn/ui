"use client";

import { useState } from "react";

import { buttonVariants } from "@tyohnn/components/button";
import { Tabs, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

import { previewUrl, TEMPLATES, type Mode, type TemplateId } from "@/lib/site";

import { Segmented } from "./pickers";

const MODES = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
] as const;

/** One system, one template at a time, in a large interactive iframe. */
export const SystemViewer = ({ system, defaultMode }: { system: string; defaultMode: Mode }) =>
{
    const [template, setTemplate] = useState<TemplateId>("crm-dashboard");
    const [mode, setMode] = useState<Mode>(defaultMode);
    const src = previewUrl(system, template, mode);

    return (
        <section aria-label="Live preview" className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Tabs value={template} onValueChange={(value) => setTemplate(value as TemplateId)} className="max-w-full overflow-x-auto">
                    <TabsList>
                        {TEMPLATES.map((item) => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                    <Segmented label="Mode" value={mode} options={MODES} onChange={setMode} />
                    <a href={src} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Open in new tab
                    </a>
                </div>
            </div>
            {/* Narrow screens scroll the frame sideways; the template keeps a desktop-ish width. */}
            <div className="overflow-x-auto rounded-lg border bg-muted">
                <iframe
                    key={src}
                    src={src}
                    title={`${system} · ${template} · ${mode}`}
                    data-viewer=""
                    className="block h-[78vh] min-h-[520px] w-full min-w-[960px] border-0"
                />
            </div>
        </section>
    );
};

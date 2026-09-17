"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@tyohnn/components/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@tyohnn/components/card";

import { DEFAULT_TEMPLATE, previewUrl, templateOf, type Mode, type SystemInfo, type TemplateId } from "@/lib/site";

import { Segmented, TemplateSelect } from "./pickers";
import { ScaledFrame } from "./scaled-frame";

type ModeChoice = "default" | Mode;

const MODES = [
    { value: "default", label: "Default" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
] as const;

/** Every system rendering the same template at the same size; each card links to its system page. */
export const SystemGallery = ({ systems }: { systems: SystemInfo[] }) =>
{
    const [template, setTemplate] = useState<TemplateId>(DEFAULT_TEMPLATE);
    const { viewport } = templateOf(template);
    const [mode, setMode] = useState<ModeChoice>("default");

    return (
        <section aria-labelledby="systems-heading" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 id="systems-heading" className="text-base font-semibold">Systems</h2>
                    <p className="text-sm text-muted-foreground">{systems.length} systems, one template, live.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <TemplateSelect value={template} onChange={setTemplate} />
                    <Segmented label="Mode" value={mode} options={MODES} onChange={setMode} />
                </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-gallery="">
                {systems.map((system) =>
                {
                    const shown = mode === "default" ? system.defaultMode : mode;

                    return (
                        <li key={system.name} data-system={system.name} className="min-w-0">
                            <Link href={`/systems/${system.name}`} className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <Card className="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
                                    <ScaledFrame src={previewUrl(system.name, template, shown)} title={`${system.name} · ${template} · ${shown}`} width={viewport.width} height={viewport.height} className="border-b" />
                                    <CardHeader>
                                        <CardTitle>{system.name}</CardTitle>
                                        <CardDescription>{system.mood}</CardDescription>
                                        <CardAction>
                                            <Badge variant="outline">{system.defaultMode}</Badge>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs">
                                            <dt className="text-muted-foreground">Sans</dt>
                                            <dd className="truncate">{system.fonts.sans.family}</dd>
                                            {system.fonts.heading && (
                                                <>
                                                    <dt className="text-muted-foreground">Heading</dt>
                                                    <dd className="truncate">{system.fonts.heading.family}</dd>
                                                </>
                                            )}
                                            <dt className="text-muted-foreground">Icons</dt>
                                            <dd className="truncate">{system.icons.label}</dd>
                                        </dl>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

"use client";

import { type ReactNode, useState } from "react";

import type { Mode } from "@/lib/site";

import { useLocale } from "./locale-provider";
import { ModeSeg } from "./pickers";

/** The taste section and its one light/dark switch: every tile turns together, so a row never mixes modes. */
export const TasteFrame = ({ note, children }: { note: string; children: ReactNode }) =>
{
    const { t } = useLocale();
    const [mode, setMode] = useState<Mode>("dark");

    return (
        <section className="taste" data-mode={mode}>
            <div className="taste-bar">
                <p className="taste-note eyebrow">{note}</p>
                <ModeSeg mode={mode} onChange={setMode} label={t.pickers.modeLabel} />
            </div>
            {children}
        </section>
    );
};

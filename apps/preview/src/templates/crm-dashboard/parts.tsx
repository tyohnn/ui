import { Calendar } from "@tyohnn/icons";

import { activityLevels } from "./data";

/**
 * Domain pieces no registry/ui component draws: the win-probability meter, the activity sparkline,
 * pipeline dots, the status dot and the last-interaction cell. Their look lives in CRM_STYLE and reads
 * only layer-1 names every system defines (--success · --warning · --destructive · --info · --border ·
 * --muted-foreground), so each system colours them its own way.
 */

/** Band of a filled tick: its position among the filled ticks, red → orange → yellow → green. */
const BANDS = ["low", "mid-low", "mid-high", "high"] as const;

export const WinMeter = ({ value }: { value: number }) =>
{
    const filled = Math.round(value / 5);

    return (
        <div className="crm-meter flex items-center gap-2.5" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
            <span className="crm-meter-track flex items-stretch">
                {Array.from({ length: 20 }, (_, index) => (
                    <i key={index} className="crm-meter-tick" data-band={index < filled ? BANDS[Math.min(3, Math.floor((index * 4) / filled))] : undefined} />
                ))}
            </span>
            <span className="crm-number">{value}%</span>
        </div>
    );
};

export const Sparkline = ({ seed }: { seed: number }) => (
    <span className="crm-sparkline flex items-end" aria-hidden="true">
        {activityLevels(seed).map((level, index) => <i key={index} className="crm-sparkline-bar" data-level={level} />)}
    </span>
);

export const PipelineDot = ({ tone }: { tone: "warning" | "destructive" | "info" }) => <span className="crm-dot" data-tone={tone} aria-hidden="true" />;

export const StatusDot = () => <span className="crm-status-dot" aria-hidden="true" />;

export const LastInteraction = ({ date, label }: { date: string; label: string }) => (
    <span className="crm-interaction flex items-center gap-1.5">
        <Calendar />
        <span>{date}</span>
        <span className="crm-interaction-divider" aria-hidden="true" />
        <span>{label}</span>
    </span>
);

/**
 * The template's own stylesheet: the window frame, the text bands the reference screen uses outside
 * components, and the domain pieces above. Values are system tokens; the literal sizes are the domain
 * pieces' geometry (tick and bar sizes), not a look any system tunes.
 */
export const CRM_STYLE = `
[data-template="crm-dashboard"] {
    font-family: var(--font-sans);
    color: var(--foreground);
    background-color: var(--background);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.crm-sidebar { border-inline-end: 1px solid var(--sidebar-border); }
.crm-brand-mark {
    display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0;
    border: 1px solid var(--sidebar-border); border-radius: var(--radius-md);
    background-color: var(--sidebar-accent); color: var(--sidebar-accent-foreground);
}
.crm-brand-mark svg { width: 18px; height: 18px; }
.crm-heading { display: flex; flex-direction: column; min-width: 0; white-space: nowrap; }
.crm-heading-title { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); font-weight: var(--ui-font-weight); color: var(--foreground); }
.crm-heading-subtitle { font-size: var(--ui-text-xs); line-height: var(--ui-line-height-xs); color: var(--muted-foreground); }
.crm-page-header { border-bottom: 1px solid var(--border); }
.crm-page-title { font-family: var(--font-heading); font-size: var(--heading-font-size-sm); line-height: var(--heading-line-height-sm); letter-spacing: var(--heading-letter-spacing); font-weight: 600; margin: 0; }
.crm-filter-label { color: var(--muted-foreground); }
.crm-number { font-variant-numeric: tabular-nums; }
.crm-currency { color: var(--muted-foreground); }
.crm-company { font-weight: var(--ui-font-weight); }
.crm-status-dot { width: 6px; height: 6px; border-radius: 9999px; background-color: var(--success); }
.crm-dot { width: 8px; height: 8px; border-radius: 9999px; flex-shrink: 0; margin-inline: 4px; }
.crm-dot[data-tone="warning"] { background-color: var(--warning); }
.crm-dot[data-tone="destructive"] { background-color: var(--destructive); }
.crm-dot[data-tone="info"] { background-color: var(--info); }
.crm-meter-track { gap: 1.5px; height: 11px; }
.crm-meter-tick { display: block; width: 2px; border-radius: 1px; background-color: var(--border); }
.crm-meter-tick[data-band="low"] { background-color: var(--destructive); }
.crm-meter-tick[data-band="mid-low"] { background-color: color-mix(in oklab, var(--destructive), var(--warning)); }
.crm-meter-tick[data-band="mid-high"] { background-color: var(--warning); }
.crm-meter-tick[data-band="high"] { background-color: var(--success); }
.crm-sparkline { gap: 2px; height: 12px; }
.crm-sparkline-bar { display: block; width: 2px; border-radius: 1px; background-color: var(--success); }
.crm-sparkline-bar[data-level="0"] { height: 2px; background-color: color-mix(in oklab, var(--success) 35%, transparent); }
.crm-sparkline-bar[data-level="1"] { height: 4px; }
.crm-sparkline-bar[data-level="2"] { height: 6px; }
.crm-sparkline-bar[data-level="3"] { height: 9px; }
.crm-sparkline-bar[data-level="4"] { height: 12px; }
.crm-interaction svg { width: 13px; height: 13px; flex-shrink: 0; }
.crm-interaction-divider { flex-shrink: 0; width: 1px; height: 12px; background-color: var(--muted-foreground); }
.crm-summary { border-bottom: 1px solid var(--border); font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
.crm-summary-cell { border-inline-start: 1px solid var(--border); }
.crm-summary-cell:first-child { border-inline-start: 0; }
.crm-summary-cell svg { width: 12px; height: 12px; }
.crm-summary-count { color: var(--foreground); }
`;

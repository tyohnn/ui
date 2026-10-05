import { getMessages, type Locale } from "@/lib/i18n";
import { TasteFrame } from "@/components/taste-frame";
import type { Mode } from "@/lib/site";
import { declareTokens, getSystem, getSystemPalette, getSystemTokens } from "@/lib/registry";

type Pillar = "density" | "depth" | "texture" | "type";

/**
 * Which systems stand side by side for each axis. Density uses ports of shadcn create presets — the axis they
 * already vary on; depth, texture and type show each of tyohnn's own systems once.
 */
const PILLARS: { id: Pillar; systems: [string, string, string] }[] = [
    { id: "density", systems: ["mira", "nova", "sera"] },
    { id: "depth", systems: ["nocturne", "graphite", "halo"] },
    { id: "texture", systems: ["loam", "clover", "cirrus"] },
    { id: "type", systems: ["vellum", "lyra", "maia"] },
];

const ROWS: [string, string][] = [["Acme Corp", "$24,000"], ["Globex", "$8,400"], ["Initech", "$12,900"]];

/** The same small card, drawn by whatever tokens the tile around it declares */
const Specimen = () => (
    <div className="spec-card" aria-hidden>
        <div className="spec-head">
            <span className="spec-title">Pipeline</span>
            <span className="spec-tag">12 open</span>
        </div>
        <div className="spec-input">Search deals</div>
        <div className="spec-rows">
            <span className="spec-label">Open deals</span>
            {ROWS.map(([name, amount]) => <div key={name}><span>{name}</span><span>{amount}</span></div>)}
        </div>
        <div className="spec-actions">
            <span className="spec-btn outline">Export</span>
            <span className="spec-btn primary">New deal</span>
        </div>
    </div>
);

/**
 * Density, depth, texture and type, one row each. Every tile is a real system — its own
 * palette, layer-1 formulas and materials, and every layer-2 token — drawn into the same small card, in whichever
 * mode the section switch shows (dark first; both modes go out as CSS).
 */
export function Taste({ locale }: { locale: Locale })
{
    const t = getMessages(locale).taste;
    const names = [...new Set(PILLARS.flatMap((pillar) => pillar.systems))];
    const modes: Mode[] = ["dark", "light"];
    const css = names.flatMap((name) => modes.map((mode) =>
        `.taste[data-mode="${mode}"] .spec-tile[data-system="${name}"] { ${getSystemPalette(name, mode)} ${declareTokens(getSystemTokens(name, mode))} }`)).join("\n");
    const glassy = (name: string) => modes.some((mode) => (getSystemTokens(name, mode).get("--glass-card-filter") ?? "none") !== "none");

    return (
        <TasteFrame note={t.note}>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            {PILLARS.map((pillar, index) => (
                <div key={pillar.id} className="taste-row" id={pillar.id}>
                    <div className="taste-head">
                        <span className="taste-num">0{index + 1}</span>
                        <h2>{t[pillar.id].title}</h2>
                        <p>{t[pillar.id].body}</p>
                    </div>
                    <div className="taste-specs">
                        {pillar.systems.map((name) => (
                            <figure key={name} className="spec">
                                <div
                                    className="spec-tile"
                                    data-system={name}
                                    data-glass={glassy(name) || undefined}
                                >
                                    <Specimen />
                                </div>
                                <figcaption>
                                    <span style={{ fontFamily: getSystem(name)?.nameFont }}>{name}</span>
                                    <small>{t[pillar.id].captions[name]}</small>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            ))}
        </TasteFrame>
    );
}

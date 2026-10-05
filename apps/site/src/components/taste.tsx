import { getMessages, type Locale } from "@/lib/i18n";
import { declareTokens, getSystem, getSystemPalette, getSystemTokens } from "@/lib/registry";

type Pillar = "density" | "depth" | "texture" | "type";

/**
 * Which systems stand side by side for each axis. Density uses ports of shadcn create presets — the axis they
 * already vary on; depth, texture and type lean on tyohnn's own systems.
 */
const PILLARS: { id: Pillar; systems: [string, string, string] }[] = [
    { id: "density", systems: ["mira", "nova", "sera"] },
    { id: "depth", systems: ["nocturne", "graphite", "luma"] },
    { id: "texture", systems: ["loam", "halo", "clover"] },
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
 * palette, layer-1 formulas and materials, and every layer-2 token — drawn into the same small card, dark like
 * the rest of the site.
 */
export function Taste({ locale }: { locale: Locale })
{
    const t = getMessages(locale).taste;
    const names = [...new Set(PILLARS.flatMap((pillar) => pillar.systems))];
    const css = names.map((name) => `.spec-tile[data-system="${name}"] { ${getSystemPalette(name, "dark")} ${declareTokens(getSystemTokens(name, "dark"))} }`).join("\n");
    const glassy = (name: string) => (getSystemTokens(name, "dark").get("--glass-card-filter") ?? "none") !== "none";

    return (
        <section className="taste">
            <p className="taste-note eyebrow">{t.note}</p>
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
        </section>
    );
}

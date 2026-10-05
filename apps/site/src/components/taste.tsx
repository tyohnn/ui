import { getMessages, type Locale } from "@/lib/i18n";
import type { Mode } from "@/lib/site";
import { declareTokens, getSpecimenPalette, getSystem, getSystemTokens } from "@/lib/registry";

type Pillar = "density" | "depth" | "texture" | "type";

/**
 * Which systems stand side by side for each axis, and the one mode a row is drawn in (never mixed, so the tiles
 * compare). Density uses the ports of shadcn create presets — the axis they already vary on; depth, texture and
 * type show each of tyohnn's own systems once.
 */
const PILLARS: { id: Pillar; mode: Mode; systems: [string, string, string]; tokens: string[] }[] = [
    { id: "density", mode: "light", systems: ["mira", "nova", "maia"], tokens: ["--control-height-md", "--surface-padding-md", "--control-font-size-md"] },
    { id: "depth", mode: "dark", systems: ["loam", "graphite", "halo"], tokens: ["--card-shadow", "--shadow-card", "--shadow-control"] },
    { id: "texture", mode: "light", systems: ["cirrus", "clover", "luma"], tokens: ["--surface-primary", "--control-radius", "--input-fill"] },
    { id: "type", mode: "light", systems: ["vellum", "nocturne", "lyra"], tokens: ["--font-heading", "--title-letter-spacing", "--sidebar-group-label-*"] },
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
 * Density, depth, texture and type, one row each. Every tile shares foundation's neutral palette and takes the
 * rest — layer-1 formulas and materials, every layer-2 token — from a real system in the row's one mode, so
 * what differs between tiles is only what the tokens say.
 */
export function Taste({ locale }: { locale: Locale })
{
    const t = getMessages(locale).taste;
    const tiles = PILLARS.flatMap((pillar) => pillar.systems.map((name) =>
    {
        const tokens = getSystemTokens(name, pillar.mode);
        const glass = (tokens.get("--glass-card-filter") ?? "none") !== "none";

        return { name, mode: pillar.mode, glass, css: `.spec-tile[data-system="${name}"][data-mode="${pillar.mode}"] { ${getSpecimenPalette(pillar.mode)} ${declareTokens(tokens)} }` };
    }));
    const glassy = (name: string, mode: Mode) => tiles.some((entry) => entry.name === name && entry.mode === mode && entry.glass);

    return (
        <section className="taste">
            <style dangerouslySetInnerHTML={{ __html: tiles.map((entry) => entry.css).join("\n") }} />
            <p className="taste-note eyebrow">{t.note}</p>
            {PILLARS.map((pillar, index) => (
                <div key={pillar.id} className="taste-row" id={pillar.id}>
                    <div className="taste-head">
                        <span className="taste-num">0{index + 1}</span>
                        <h2>{t[pillar.id].title}</h2>
                        <p>{t[pillar.id].body}</p>
                        <ul className="taste-tokens">{pillar.tokens.map((token) => <li key={token}><code>{token}</code></li>)}</ul>
                    </div>
                    <div className="taste-specs">
                        {pillar.systems.map((name) => (
                            <figure key={name} className="spec">
                                <div
                                    className={pillar.mode === "dark" ? "spec-tile dark" : "spec-tile"}
                                    data-system={name}
                                    data-mode={pillar.mode}
                                    data-glass={glassy(name, pillar.mode) || undefined}
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

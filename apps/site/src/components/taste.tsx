import { getMessages, type Locale } from "@/lib/i18n";
import { getSpecimenPalette, getSystem, getSystemTokens } from "@/lib/registry";

type Pillar = "density" | "depth" | "texture";

/** Which systems stand side by side for each axis: the three that differ most on it */
const PILLARS: { id: Pillar; systems: [string, string, string]; tokens: string[] }[] = [
    { id: "density", systems: ["mira", "vega", "sera"], tokens: ["--control-height-md", "--surface-padding-md", "--table-row-height"] },
    { id: "depth", systems: ["lyra", "luma", "halo"], tokens: ["--card-shadow", "--shadow-control", "--shadow-control-primary"] },
    { id: "texture", systems: ["sera", "cirrus", "maia"], tokens: ["--control-radius", "--surface-primary", "--font-heading"] },
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
            {ROWS.map(([name, amount]) => <div key={name}><span>{name}</span><span>{amount}</span></div>)}
        </div>
        <div className="spec-actions">
            <span className="spec-btn outline">Export</span>
            <span className="spec-btn primary">New deal</span>
        </div>
    </div>
);

/**
 * Density, depth and texture, one row each. Every tile shares foundation's palette and takes the rest — layer-1
 * formulas and materials, every layer-2 token — from a real system, so what differs between tiles is only what
 * the tokens say.
 */
export function Taste({ locale }: { locale: Locale })
{
    const t = getMessages(locale).taste;
    const names = [...new Set(PILLARS.flatMap((pillar) => pillar.systems))];
    const palette = getSpecimenPalette();
    const css = names.map((name) => `.spec-tile[data-system="${name}"] { ${palette} ${getSystemTokens(name)} }`).join("\n");

    return (
        <section className="taste">
            <style dangerouslySetInnerHTML={{ __html: css }} />
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
                                <div className="spec-tile" data-system={name}><Specimen /></div>
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

import { CopyCommand } from "@/components/copy-command";
import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";

const LAYERS = [
    { num: "1", title: "Colour", body: "The palette for light and dark, as semantic tokens.", file: "styles/globals.css" },
    { num: "2", title: "Tokens", body: "Density, shape and shadow slots: control heights, radii, surface depth.", file: "styles/tokens.css" },
    { num: "3", title: "Component rules", body: <>One file per component, styling the <span className="mono">cn-*</span> hooks. The TSX never changes.</>, file: "styles/components/*.css" },
];

export default function Home()
{
    const systems = getSystems().map(summarize);

    return (
        <>
            <Hero systems={systems} />
            <Gallery systems={systems} />

            <div className="layers">
                {LAYERS.map((layer) => (
                    <div key={layer.num} className="layer">
                        <div className="num" aria-hidden>{layer.num}</div>
                        <h3>{layer.title}</h3>
                        <p>{layer.body}</p>
                        <code>{layer.file}</code>
                    </div>
                ))}
            </div>

            <div className="install">
                <div>
                    <h2>Copy a whole system.</h2>
                    <p>Components, three layers, fonts, icons and DESIGN.md — into Next.js, Vite or a Turborepo monorepo.</p>
                </div>
                <CopyCommand command={`npx tyohnn init --system ${systems[0].name}`} />
            </div>
        </>
    );
}

import { CopyCommand } from "@/components/copy-command";
import { Gallery } from "@/components/gallery";
import { type HeroPair, Hero } from "@/components/hero";
import { Taste } from "@/components/taste";
import { getMessages, type Locale, localizeSystems } from "@/lib/i18n";
import { getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readThemes } from "@/lib/themes";
import { themeToCss } from "@tyohnn/theme";

/** The pairs the hero splits, each in one mode: shadcn's own baseline against ours first, then ours against ours */
const PAIRS: HeroPair[] = [
    { a: "mira", b: "graphite", mode: "dark" },
    { a: "cirrus", b: "vellum", mode: "light" },
    { a: "loam", b: "halo", mode: "dark" },
    { a: "clover", b: "nocturne", mode: "light" },
];

export function HomeView({ locale }: { locale: Locale })
{
    const t = getMessages(locale);
    const systems = localizeSystems(locale, getSystems()).map(summarize);
    const neutral = readThemes().find((theme) => theme.id === "neutral")!;
    const paletteCss = themeToCss({ name: "neutral", title: "neutral", light: neutral.light, dark: neutral.dark });

    return (
        <>
            <Hero systems={systems} pairs={PAIRS} paletteCss={paletteCss} />
            <Taste locale={locale} />
            <Gallery systems={systems} />

            <div className="layers">
                {t.home.layers.map((layer) => (
                    <div key={layer.num} className="layer">
                        <div className="num" aria-hidden>{layer.num}</div>
                        <h3>{layer.title}</h3>
                        <p>{layer.body}</p>
                        <code>{layer.file}</code>
                    </div>
                ))}
            </div>

            <div className="layers above">
                {t.home.above.map((layer) => (
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
                    <h2>{t.home.installTitle}</h2>
                    <p>{t.home.installBody}</p>
                </div>
                <CopyCommand command={`npx tyohnn@latest init --system ${systems[0].name}`} />
            </div>
        </>
    );
}

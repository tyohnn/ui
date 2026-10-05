import { CopyCommand } from "@/components/copy-command";
import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { Taste } from "@/components/taste";
import { getMessages, type Locale, localizeSystems } from "@/lib/i18n";
import { getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";

export function HomeView({ locale }: { locale: Locale })
{
    const t = getMessages(locale);
    const systems = localizeSystems(locale, getSystems()).map(summarize);

    return (
        <>
            <Hero systems={systems} />
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

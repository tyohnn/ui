import Link from "next/link";
import { notFound } from "next/navigation";

import { SystemView } from "@/components/system-view";
import { ThemeProvider } from "@/components/theme-provider";
import { getMessages, type Locale, localeHref, localizeSystems } from "@/lib/i18n";
import { getSystem, getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readPresetLists, readThemes, systemThemes } from "@/lib/themes";

export const systemParams = () => getSystems().map((system) => ({ name: system.name }));

export const systemMetadata = (locale: Locale, name: string) =>
{
    const system = localizeSystems(locale, getSystems()).find((entry) => entry.name === name);

    return system ? { title: system.name, description: system.description } : {};
};

export function SystemPageView({ locale, name }: { locale: Locale; name: string })
{
    const t = getMessages(locale);
    const raw = getSystem(name);

    if (!raw) notFound();

    const system = localizeSystems(locale, [raw])[0];

    // Neighbours in name order, wrapping around.
    const names = getSystems().map((entry) => entry.name).sort();
    const index = names.indexOf(system.name);
    const previous = names[(index - 1 + names.length) % names.length];
    const next = names[(index + 1) % names.length];

    const specs: [string, string][] = [
        [t.system.specs.sans, system.fonts.sans.family],
        [t.system.specs.heading, system.fonts.heading?.family ?? system.fonts.sans.family],
        [t.system.specs.icons, system.icons.id],
        [t.system.specs.hangul, system.fonts.hangulFallback.family],
        [t.system.specs.default, t.mode[system.defaultMode]],
    ];

    const themes = readThemes();
    const own = systemThemes()[system.name] ?? system.name;

    return (
        <ThemeProvider themes={themes} own={own} system={system.name} presets={readPresetLists()}>
            <nav className="crumbs" aria-label={t.system.crumbsLabel}>
                <Link href={localeHref(locale, "/#systems")}>{t.system.crumbsRoot}</Link>
                <span aria-hidden>/</span>
                <span>{system.name}</span>
                {/* 이웃 시스템은 맨 위, 빵부스러기 줄의 오른쪽 끝이다. 설치 패널 바닥에 있을 때는
                    화면을 다 내려야 보였는데, 시스템 사이를 옮겨 다니는 것은 화면을 보기 **전에**
                    하는 일이다. */}
                <span className="crumb-nav">
                    <Link href={localeHref(locale, `/systems/${previous}`)}>← {previous}</Link>
                    <Link href={localeHref(locale, `/systems/${next}`)}>{next} →</Link>
                </span>
            </nav>
            <SystemView
                system={summarize(system)}
                next={next}
                intro={(
                    <div>
                        <h1 className="sys-name" style={{ fontFamily: system.nameFont }}>{system.name}</h1>
                        <p className="sys-desc">{system.description}</p>
                        <dl className="specs">
                            {specs.map(([label, value]) => [<dt key={`${label}-k`}>{label}</dt>, <dd key={`${label}-v`}>{value}</dd>])}
                        </dl>
                    </div>
                )}
            />
        </ThemeProvider>
    );
}

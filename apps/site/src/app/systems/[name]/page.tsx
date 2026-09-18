import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SystemView } from "@/components/system-view";
import { ThemeProvider } from "@/components/theme-provider";
import { getSystem, getSystems } from "@/lib/registry";
import { summarize } from "@/lib/site";
import { readThemes, systemThemes } from "@/lib/themes";

export const dynamicParams = false;

export const generateStaticParams = () => getSystems().map((system) => ({ name: system.name }));

type Props = { params: Promise<{ name: string }> };

export const generateMetadata = async ({ params }: Props): Promise<Metadata> =>
{
    const system = getSystem((await params).name);

    return system ? { title: system.name, description: system.description } : {};
};

export default async function SystemPage({ params }: Props)
{
    const { name } = await params;
    const system = getSystem(name);

    if (!system) notFound();

    // Neighbours in name order, wrapping around.
    const names = getSystems().map((entry) => entry.name).sort();
    const index = names.indexOf(system.name);
    const previous = names[(index - 1 + names.length) % names.length];
    const next = names[(index + 1) % names.length];

    const specs: [string, string][] = [
        ["Sans", system.fonts.sans.family],
        ["Heading", system.fonts.heading?.family ?? system.fonts.sans.family],
        ["Icons", system.icons.id],
        ["Hangul", system.fonts.hangulFallback.family],
        ["Default", system.defaultMode === "dark" ? "Dark" : "Light"],
    ];

    const themes = readThemes();
    const own = systemThemes()[system.name] ?? system.name;

    return (
        <ThemeProvider themes={themes} own={own}>
            <nav className="crumbs" aria-label="Breadcrumb">
                <Link href="/#systems">Systems</Link>
                <span aria-hidden>/</span>
                <span>{system.name}</span>
                {/* 이웃 시스템은 맨 위, 빵부스러기 줄의 오른쪽 끝이다. 설치 패널 바닥에 있을 때는
                    화면을 다 내려야 보였는데, 시스템 사이를 옮겨 다니는 것은 화면을 보기 **전에**
                    하는 일이다. */}
                <span className="crumb-nav">
                    <Link href={`/systems/${previous}`}>← {previous}</Link>
                    <Link href={`/systems/${next}`}>{next} →</Link>
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

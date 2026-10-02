import Link from "next/link";
import type { ReactNode } from "react";

import { CommandCard } from "@/components/copy-command";
import { DocsToc } from "@/components/docs-toc";
import { getMessages, labelsOf, type Locale, localeHref } from "@/lib/i18n";
import { getFonts, getIconLibraries, getSystems } from "@/lib/registry";

import { FRAME_TOKEN_GROUPS, PAGE_SPLIT_MIN_REM } from "../../../../registry/blocks/lib/frame";

/** A file tree: each line is a path, two or more spaces, then a comment drawn in the subtle colour. */
const Tree = ({ lines }: { lines: string[] }) => (
    <div className="codeblock">
        {lines.map((line, index) =>
        {
            const match = line.match(/^(\S+(?: · \S+)*)(\s{2,})(.*)$/);

            return (
                <span key={index}>
                    {match ? <>{match[1]}{match[2]}<span className="c">{match[3]}</span></> : line}
                    {index < lines.length - 1 ? "\n" : null}
                </span>
            );
        })}
    </div>
);

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
    <section id={id} className="dsec">
        <h2>{title}</h2>
        {children}
    </section>
);

/** A table whose columns are named by `head`; `cols` is the css modifier for three and four columns */
const Table = ({ head, cols, children }: { head: string[]; cols?: string; children: ReactNode }) => (
    <div className="dtable" role="table">
        <div className={cols ? `row ${cols}` : "row"} role="row">{head.map((label) => <div key={label} role="columnheader">{label}</div>)}</div>
        {children}
    </div>
);

export function DocsView({ locale }: { locale: Locale })
{
    const { docs: d } = getMessages(locale);
    const labels = labelsOf(locale);
    const href = (path: string) => localeHref(locale, path);
    const systems = getSystems();
    const fonts = getFonts();
    const icons = getIconLibraries();
    const systemsLink = <Link href={href("/#systems")}>{d.startPickLink}</Link>;
    const systemPageLink = <Link href={href("/#systems")}>{d.framesTryLink}</Link>;

    return (
        <div className="docs">
            <DocsToc sections={d.sections} />

            <article className="doc">
                <div className="eyebrow">{d.eyebrow}</div>
                <h1>{d.title}</h1>
                <p className="lead">{d.lead}</p>

                <Section id="start" title={d.startTitle}>
                    <CommandCard label={d.startApp} command="npx tyohnn@latest init --system vega" />
                    <CommandCard label={d.startMonorepo} command="npx tyohnn@latest init --system graphite --app apps/crm --scope @acme" />
                    <p className="prose">{d.startPick(systemsLink)}</p>
                    <div className="chips-sys">
                        {systems.map((system) => (
                            <Link key={system.name} href={href(`/systems/${system.name}`)} style={{ fontFamily: system.nameFont }}>{system.name}</Link>
                        ))}
                    </div>
                </Section>

                <Section id="commands" title={d.commandsTitle}>
                    <p className="prose">{d.commandsIntro}</p>
                    <Table head={d.commandsHead}>
                        {d.commands.map(([command, body]) => (
                            <div key={command} className="row" role="row"><div role="cell">{command}</div><div role="cell">{body}</div></div>
                        ))}
                    </Table>
                </Section>

                <Section id="options" title={d.optionsTitle}>
                    <dl className="opts">
                        {d.options.map(([flag, body]) => [<dt key={`${flag}-k`}>{flag}</dt>, <dd key={`${flag}-v`}>{body}</dd>])}
                    </dl>
                </Section>

                <Section id="files" title={d.filesTitle}>
                    <p className="prose">{d.filesIntro}</p>
                    <Tree lines={d.filesMonorepoTree} />
                    <p className="prose">{d.filesSingleIntro}</p>
                    <Tree lines={d.filesSingleTree} />
                    <p className="prose">{d.filesOrder}</p>
                </Section>

                <Section id="fonts" title={d.fontsTitle}>
                    <p className="prose">{d.fontsIntro}</p>
                    <CommandCard label={d.fontsInit} command="npx tyohnn@latest init --system vega --font geist --font-heading playfair-display" />
                    <CommandCard label={d.fontsReset} command="npx tyohnn@latest fonts --reset" />
                    <Table head={d.fontsHead} cols="cols-4">
                        {fonts.map((font) => (
                            <div key={font.id} className="row cols-4" role="row">
                                <div role="cell">{font.id}</div>
                                <div role="cell" style={{ fontFamily: `"${font.cssFamily}"` }}>{font.family}</div>
                                <div role="cell">{font.category}</div>
                                <div role="cell">{font.license}</div>
                            </div>
                        ))}
                    </Table>
                </Section>

                <Section id="icons" title={d.iconsTitle}>
                    <p className="prose">{d.iconsIntro(icons.length)}</p>
                    <CommandCard label={d.iconsInit} command="npx tyohnn@latest init --system mira --icons lucide" />
                    <CommandCard label={d.iconsLater} command="npx tyohnn@latest icons phosphor --app apps/admin" />
                    <ul className="libs">
                        {icons.map((library) => <li key={library.id}><b>{library.id}</b>{library.packages.join(" + ")}</li>)}
                    </ul>
                </Section>

                <Section id="blocks" title={d.blocksTitle}>
                    <p className="prose">{d.blocksIntro}</p>
                    <CommandCard label={d.blocksNew} command="npx tyohnn@latest init --system vega --blocks" />
                    <CommandCard label={d.blocksExisting} command="npx tyohnn@latest blocks" />
                    <p className="prose">{d.blocksOwned}</p>
                </Section>

                <Section id="frames" title={d.framesTitle}>
                    <p className="prose">{d.framesIntro}</p>
                    <Tree lines={d.framesTree} />
                    <p className="prose">{d.framesStep}</p>
                    <Table head={d.framesTokensHead} cols="cols-3">
                        {FRAME_TOKEN_GROUPS.map((group) =>
                        {
                            const text = labels.frameGroup(group.id, group);

                            return (
                                <div key={group.id} className="row cols-3" role="row">
                                    <div role="cell">{group.tokens.map((token) => <code key={token.name} style={{ display: "block", width: "fit-content", marginBottom: 4 }}>{token.name}</code>)}</div>
                                    <div role="cell">{group.tokens.map((token) => `${token.rem}rem`).join(" · ")}</div>
                                    <div role="cell"><b>{text.title}.</b> {text.hint}</div>
                                </div>
                            );
                        })}
                    </Table>
                    <p className="prose">{d.framesNarrow(PAGE_SPLIT_MIN_REM)}</p>
                    <Table head={d.framesNarrowHead} cols="cols-3">
                        {d.narrow.map(([name, what, when]) => (
                            <div key={name} className="row cols-3" role="row"><div role="cell"><code>{name}</code></div><div role="cell">{what}</div><div role="cell">{when}</div></div>
                        ))}
                    </Table>
                    <p className="prose">{d.framesTry(systemPageLink)}</p>
                </Section>

                <Section id="monorepo" title={d.monorepoTitle}>
                    <p className="prose">{d.monorepoIntro}</p>
                    <Tree lines={d.monorepoTree} />
                    <p className="prose">{d.monorepoDoctor}</p>
                </Section>

                <Section id="source" title={d.sourceTitle}>
                    <p className="prose">{d.sourceIntro}</p>
                    <CommandCard label={d.sourcePin} command="npx tyohnn@latest init --system sera --ref <commit>" />
                    <CommandCard label={d.sourceDiff} command="npx tyohnn@latest diff --ref main" />
                </Section>

                <Section id="ownership" title={d.ownershipTitle}>
                    <Table head={d.ownershipHead} cols="cols-3">
                        {d.ownership.map(([kind, files, body]) => (
                            <div key={kind} className="row cols-3" role="row"><div role="cell">{kind}</div><div role="cell">{files}</div><div role="cell">{body}</div></div>
                        ))}
                    </Table>
                </Section>
            </article>
        </div>
    );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { CommandCard } from "@/components/copy-command";
import { DocsToc } from "@/components/docs-toc";
import { getFonts, getIconLibraries, getSystems } from "@/lib/registry";

export const metadata: Metadata = {
    title: "Docs",
    description: "The tyohnn CLI: init, add, use, icons, fonts, doctor and diff; where files go; fonts and icons; several systems in one monorepo.",
};

const SECTIONS = [
    { id: "start", label: "Getting started" },
    { id: "commands", label: "Commands" },
    { id: "options", label: "Options" },
    { id: "files", label: "Where files go" },
    { id: "fonts", label: "Fonts" },
    { id: "icons", label: "Icons" },
    { id: "monorepo", label: "Several systems" },
    { id: "source", label: "Versions and source" },
    { id: "ownership", label: "File ownership" },
];

const COMMANDS: [string, ReactNode][] = [
    ["init", <>Detects the project, asks for a system (or <code>--system</code>), copies the TSX and the system, adds dependencies, installs and wires the app. In a monorepo it creates <code>packages/ui</code> and wires <code>--app &lt;path&gt;</code>.</>],
    ["add <system> --app <path>", <>Monorepo: adds a system to the existing UI package and wires another app to it.</>],
    ["use <system> [--app <path>]", <>Switches an app to another system: entry CSS, fonts and mode. The TSX stays.</>],
    ["icons <library> [--app <path>]", <>Switches an app&apos;s icon library (mapping file and packages).</>],
    ["fonts [--sans] [--heading] [--mono] [--reset]", <>Switches an app&apos;s fonts; <code>--reset</code> returns to the system&apos;s own.</>],
    ["list", <>Systems, icon libraries and fonts, one line each.</>],
    ["doctor [--built]", <>Checks the setup against <code>tyohnn.json</code>; exit code 1 on a failure.</>],
    ["diff [--files]", <>Compares the project&apos;s copies with the source: changed upstream, locally, or both.</>],
];

const OPTIONS: [string, string][] = [
    ["--yes", "No prompts; take the defaults."],
    ["--force", "Overwrite files that exist or were edited."],
    ["--no-install", "Skip installing packages."],
    ["--mode light|dark", "Override the system's default mode."],
    ["--icons <library>", "init: another icon library."],
    ["--font · --font-heading · --font-mono", "init: other fonts from the catalog."],
    ["--app · --ui · --scope", "Monorepo: the app to wire, the UI package folder and its scope."],
    ["--ref · --source · --offline", "Which registry version to read, a local checkout, or the cache only."],
];

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

export default function DocsPage()
{
    const systems = getSystems();
    const fonts = getFonts();
    const icons = getIconLibraries();

    return (
        <div className="docs">
            <DocsToc sections={SECTIONS} />

            <article className="doc">
                <div className="eyebrow">Docs</div>
                <h1>Install a system.</h1>
                <p className="lead">
                    The <code>tyohnn</code> CLI copies one set of component TSX and one or more complete design-system folders into your project,
                    then wires them in. There is no runtime package: after <code>init</code> the code is yours. Node 20 or later; Next.js (App Router),
                    Vite, and npm · pnpm · yarn · bun workspace monorepos.
                </p>

                <Section id="start" title="Getting started">
                    <CommandCard label="A Next.js or Vite app" command="npx tyohnn init --system vega" />
                    <CommandCard label="A monorepo: packages/ui plus one app" command="npx tyohnn init --system graphite --app apps/crm --scope @acme" />
                    <p className="prose">Pick a system on the <Link href="/#systems">systems page</Link>. Available:</p>
                    <div className="chips-sys">
                        {systems.map((system) => (
                            <Link key={system.name} href={`/systems/${system.name}`} style={{ fontFamily: system.nameFont }}>{system.name}</Link>
                        ))}
                    </div>
                </Section>

                <Section id="commands" title="Commands">
                    <p className="prose">Every command edits <code>tyohnn.json</code> and then makes the project match it, so running it twice changes nothing the second time.</p>
                    <div className="dtable" role="table">
                        <div className="row" role="row"><div role="columnheader">Command</div><div role="columnheader">What it does</div></div>
                        {COMMANDS.map(([command, body]) => (
                            <div key={command} className="row" role="row"><div role="cell">{command}</div><div role="cell">{body}</div></div>
                        ))}
                    </div>
                </Section>

                <Section id="options" title="Options">
                    <dl className="opts">
                        {OPTIONS.map(([flag, body]) => [<dt key={`${flag}-k`}>{flag}</dt>, <dd key={`${flag}-v`}>{body}</dd>])}
                    </dl>
                </Section>

                <Section id="files" title="Where files go">
                    <p className="prose">A monorepo keeps one UI package: the TSX once, and a folder per system. <b>Each app imports exactly one system.</b></p>
                    <Tree
                        lines={[
                            "packages/ui/src/components · hooks · lib       the TSX, imported as @acme/ui/components/…",
                            "packages/ui/src/icons/libraries/<library>.tsx  the icon libraries some app uses",
                            "packages/ui/src/systems/<system>/              colours · tokens · typeset · rules · DESIGN.md",
                            "apps/<app>/src/app/globals.css                 imports exactly one system",
                            "apps/<app>/tsconfig.json                       paths \"@acme/ui/icons\" → that app's library",
                            "tyohnn.json                                    at the monorepo root",
                        ]}
                    />
                    <p className="prose">A single Next.js or Vite app gets the same pieces under <code>src/</code>, imported through the <code>@/</code> alias (added when missing):</p>
                    <Tree
                        lines={[
                            "src/components/ui/*.tsx       imported as @/components/ui/…",
                            "src/hooks · src/lib           hooks and utilities",
                            "src/components/icons/         index.ts · names.ts · libraries/<library>.tsx",
                            "src/styles/tyohnn/<system>/   the system folder",
                        ]}
                    />
                    <p className="prose">
                        The entry CSS imports the system in a fixed order — tailwindcss, layer 1 colours, layer 2 tokens, typeset, then layer 3 rules in{" "}
                        <code>layer(base)</code> — so utilities you pass through <code>className</code> still win.
                    </p>
                </Section>

                <Section id="fonts" title="Fonts">
                    <p className="prose">
                        Fonts are always self-hosted; nothing loads Google&apos;s font CDN. Next.js apps get <code>next/font/google</code> (or{" "}
                        <code>next/font/local</code> for Pretendard) in the root layout; Vite apps get the fontsource or npm package and an{" "}
                        <code>@import</code>. Each system names a sans, heading and mono font plus a Hangul fallback; override them per app:
                    </p>
                    <CommandCard label="Other fonts at init" command="npx tyohnn init --system vega --font geist --font-heading playfair-display" />
                    <CommandCard label="Back to the system's own" command="npx tyohnn fonts --reset" />
                    <div className="dtable" role="table">
                        <div className="row cols-4" role="row"><div role="columnheader">Id</div><div role="columnheader">Family</div><div role="columnheader">Category</div><div role="columnheader">Licence</div></div>
                        {fonts.map((font) => (
                            <div key={font.id} className="row cols-4" role="row">
                                <div role="cell">{font.id}</div>
                                <div role="cell" style={{ fontFamily: `"${font.cssFamily}"` }}>{font.family}</div>
                                <div role="cell">{font.category}</div>
                                <div role="cell">{font.license}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section id="icons" title="Icons">
                    <p className="prose">
                        Components import icons by meaning (<code>ChevronDown</code>, <code>SelectIndicator</code>) from one module, never from an icon
                        package. The module maps every name onto one of {icons.length} libraries. Each system has a default; switch it at{" "}
                        <code>init</code> or later:
                    </p>
                    <CommandCard label="Another library at init" command="npx tyohnn init --system mira --icons lucide" />
                    <CommandCard label="Switch one app later" command="npx tyohnn icons phosphor --app apps/admin" />
                    <ul className="libs">
                        {icons.map((library) => <li key={library.id}><b>{library.id}</b>{library.packages.join(" + ")}</li>)}
                    </ul>
                </Section>

                <Section id="monorepo" title="Several systems in one monorepo">
                    <p className="prose">
                        Apps in one monorepo can use different systems — and different icon libraries — from one UI package. Never import two systems
                        into one app: every system defines the same <code>cn-*</code> rules and token names globally, and the later import silently wins.
                    </p>
                    <Tree
                        lines={[
                            "npx tyohnn init --system graphite --app apps/crm --scope @acme",
                            "npx tyohnn add mira --app apps/admin --icons hugeicons",
                            "npx tyohnn use nova --app apps/admin          # switch that app's system; the TSX stays",
                            "npx tyohnn doctor --built                     # also checks built CSS for the other system's tokens",
                        ]}
                    />
                    <p className="prose">
                        <code>doctor</code> fails on two systems in one app, import order or a missing <code>layer(base)</code>, a missing{" "}
                        <code>@source</code>, font variables the layout does not declare, an icon path that disagrees with <code>tyohnn.json</code>, or a
                        mode class that differs from it; it warns when icon libraries diverge or CLI-owned files were edited.
                    </p>
                </Section>

                <Section id="source" title="Versions and source">
                    <p className="prose">
                        The npm package holds only the CLI. Components and systems are read from the tyohnn repository at run time (the <code>main</code>{" "}
                        branch by default), cached per commit, and the commit is recorded in <code>tyohnn.json</code>. Later commands read that commit,
                        so they never silently move a project to a newer version.
                    </p>
                    <CommandCard label="Pin a version" command="npx tyohnn init --system sera --ref <commit>" />
                    <CommandCard label="What changed since" command="npx tyohnn diff --ref main" />
                </Section>

                <Section id="ownership" title="File ownership">
                    <div className="dtable" role="table">
                        <div className="row cols-3" role="row"><div role="columnheader">Kind</div><div role="columnheader">Files</div><div role="columnheader">What the CLI does</div></div>
                        {[
                            ["CLI-owned", "TSX, icon mappings, system folders", "Written whole with a recorded hash; overwritten only while unchanged. Edited files are kept and reported."],
                            ["Managed blocks", "entry CSS, layout, next/vite config", <>Only the text between <code>tyohnn:begin</code> and <code>tyohnn:end</code> comments is rewritten.</>],
                            ["Merged", "tsconfig paths, package.json, index.html classes", "Only the entries tyohnn needs change; comments and formatting stay."],
                            ["Yours", "everything else", "Never touched."],
                        ].map(([kind, files, body]) => (
                            <div key={String(kind)} className="row cols-3" role="row"><div role="cell">{kind}</div><div role="cell">{files}</div><div role="cell">{body}</div></div>
                        ))}
                    </div>
                </Section>
            </article>
        </div>
    );
}

import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";

import { CopyCommand } from "@/components/copy-command";
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
    ["init", <>Detects the project, asks for a system (or <Code>--system</Code>), copies the TSX and the system, adds dependencies, installs and wires the app. In a monorepo it creates <Code>packages/ui</Code> and wires <Code>--app &lt;path&gt;</Code>.</>],
    ["add <system> --app <path>", <>Monorepo: adds a system to the existing UI package and wires another app to it.</>],
    ["use <system> [--app <path>]", <>Switches an app to another system: entry CSS, fonts and mode. The TSX stays.</>],
    ["icons <library> [--app <path>]", <>Switches an app&apos;s icon library (mapping file and packages).</>],
    ["fonts [--sans] [--heading] [--mono] [--reset]", <>Switches an app&apos;s fonts; <Code>--reset</Code> returns to the system&apos;s own.</>],
    ["list", <>Systems, icon libraries and fonts, one line each.</>],
    ["doctor [--built]", <>Checks the setup against <Code>tyohnn.json</Code>; exit code 1 on a failure.</>],
    ["diff [--files]", <>Compares the project&apos;s copies with the source: changed upstream, locally, or both.</>],
];

const OPTIONS: [string, string][] = [
    ["--yes", "No prompts; take the defaults."],
    ["--force", "Overwrite files that exist or were edited."],
    ["--no-install", "Skip installing packages."],
    ["--mode light|dark", "Override the system's default mode."],
    ["--icons <library>", "init: another icon library."],
    ["--font · --font-heading · --font-mono", "init: other fonts from the catalog (inherit / system allowed for heading / mono)."],
    ["--app <path> · --ui <folder> · --scope <@scope>", "Monorepo: the app to wire, the UI package folder (packages/ui) and its scope."],
    ["--ref <branch|tag|commit> · --source <path> · --offline", "Which registry version to read, a local checkout, or the cache only."],
];

function Code({ children }: { children: ReactNode })
{
    return <code className="site-code rounded bg-muted px-1 py-0.5">{children}</code>;
}

function Block({ children }: { children: string })
{
    return <pre className="site-code overflow-x-auto rounded-md border bg-muted/40 p-3 leading-relaxed">{children}</pre>;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode })
{
    return (
        <section id={id} className="flex scroll-mt-16 flex-col gap-3">
            <h2 className="text-base font-semibold">{title}</h2>
            {children}
        </section>
    );
}

const Prose = ({ children }: { children: ReactNode }) => <p className="max-w-3xl text-sm text-muted-foreground">{children}</p>;

export default function DocsPage()
{
    const systems = getSystems();
    const fonts = getFonts();
    const icons = getIconLibraries();

    return (
        <div className="grid gap-10 pt-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
            <nav aria-label="On this page" className="hidden lg:block">
                <ul className="sticky top-20 flex flex-col gap-1 text-sm">
                    {SECTIONS.map((section) => (
                        <li key={section.id}>
                            <a href={`#${section.id}`} className="text-muted-foreground hover:text-foreground">{section.label}</a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="flex min-w-0 flex-col gap-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">Docs</h1>
                    <Prose>
                        The <Code>tyohnn</Code> CLI copies one set of component TSX and one or more complete design-system folders
                        into your project, then wires them in. There is no runtime package: after <Code>init</Code> the code is yours.
                        Node 20 or later; Next.js (App Router), Vite, and npm · pnpm · yarn · bun workspace monorepos.
                    </Prose>
                </div>

                <Section id="start" title="Getting started">
                    <div className="grid max-w-3xl gap-3">
                        <CopyCommand label="A Next.js or Vite app" command="npx tyohnn init --system vega" />
                        <CopyCommand label="A monorepo: packages/ui plus one app" command="npx tyohnn init --system graphite --app apps/crm --scope @acme" />
                    </div>
                    <Prose>
                        Pick a system on the <Link href="/" className="underline underline-offset-4">systems page</Link>. Available:{" "}
                        {systems.map((system, index) => (
                            <span key={system.name}>
                                {index > 0 && ", "}
                                <Link href={`/systems/${system.name}`} className="underline underline-offset-4">{system.name}</Link>
                            </span>
                        ))}.
                    </Prose>
                </Section>

                <Section id="commands" title="Commands">
                    <Prose>Every command edits <Code>tyohnn.json</Code> and then makes the project match it, so running it twice changes nothing the second time.</Prose>
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-72">Command</TableHead>
                                    <TableHead>What it does</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {COMMANDS.map(([command, body]) => (
                                    <TableRow key={command}>
                                        <TableCell className="site-code align-top whitespace-normal sm:whitespace-nowrap">{command}</TableCell>
                                        <TableCell className="min-w-72 whitespace-normal">{body}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Section>

                <Section id="options" title="Options">
                    <dl className="grid max-w-3xl gap-x-6 gap-y-2 text-sm sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
                        {OPTIONS.map(([flag, body]) => (
                            <div key={flag} className="contents">
                                <dt className="site-code break-words">{flag}</dt>
                                <dd className="mb-2 text-muted-foreground sm:mb-0">{body}</dd>
                            </div>
                        ))}
                    </dl>
                </Section>

                <Section id="files" title="Where files go">
                    <Prose>A monorepo keeps one UI package: the TSX once, and a folder per system. Each app imports exactly one system.</Prose>
                    <Block>{`packages/ui/src/components · hooks · lib       the TSX, imported as @acme/ui/components/…
packages/ui/src/icons/libraries/<library>.tsx  the icon libraries some app uses
packages/ui/src/systems/<system>/              colours · tokens · typeset · rules · DESIGN.md · system.json
apps/<app>/src/app/globals.css                 imports exactly one system
apps/<app>/tsconfig.json                       paths "@acme/ui/icons" → that app's library
apps/<app>/next.config.ts                      transpilePackages ["@acme/ui"]
tyohnn.json                                    at the monorepo root`}</Block>
                    <Prose>A single Next.js or Vite app gets the same pieces under <Code>src/</Code>, imported through the <Code>@/</Code> alias (added when missing):</Prose>
                    <Block>{`src/components/ui/*.tsx       imported as @/components/ui/…
src/hooks · src/lib
src/components/icons/         index.ts · names.ts · libraries/<library>.tsx
src/styles/tyohnn/<system>/   the system folder`}</Block>
                    <Prose>
                        The entry CSS imports the system in a fixed order — tailwindcss, layer 1 colours, layer 2 tokens, typeset, then
                        layer 3 rules in <Code>layer(base)</Code> — so utilities you pass through <Code>className</Code> still win.
                    </Prose>
                </Section>

                <Section id="fonts" title="Fonts">
                    <Prose>
                        Fonts are always self-hosted; nothing loads Google&apos;s font CDN. Next.js apps get <Code>next/font/google</Code> (or{" "}
                        <Code>next/font/local</Code> for Pretendard) in the root layout; Vite apps get the fontsource or npm package and an{" "}
                        <Code>@import</Code>. Each system names a sans, heading and mono font plus a Hangul fallback; override them per app:
                    </Prose>
                    <div className="grid max-w-3xl gap-3">
                        <CopyCommand command="npx tyohnn init --system vega --font geist --font-heading playfair-display" />
                        <CopyCommand command="npx tyohnn fonts --reset" />
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Id</TableHead>
                                    <TableHead>Family</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Licence</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fonts.map((font) => (
                                    <TableRow key={font.id}>
                                        <TableCell className="site-code">{font.id}</TableCell>
                                        <TableCell>{font.family}</TableCell>
                                        <TableCell>{font.category}</TableCell>
                                        <TableCell>{font.license}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Section>

                <Section id="icons" title="Icons">
                    <Prose>
                        Components import icons by meaning (<Code>ChevronDown</Code>, <Code>SelectIndicator</Code>) from one module, never
                        from an icon package. The module maps every name onto one of {icons.length} libraries. Each system has a default;
                        switch it at <Code>init</Code> or later:
                    </Prose>
                    <div className="grid max-w-3xl gap-3">
                        <CopyCommand command="npx tyohnn init --system mira --icons lucide" />
                        <CopyCommand command="npx tyohnn icons phosphor --app apps/admin" />
                    </div>
                    <ul className="flex max-w-3xl flex-wrap gap-x-6 gap-y-1 text-sm">
                        {icons.map((library) => (
                            <li key={library.id}>
                                <span className="site-code">{library.id}</span>{" "}
                                <span className="text-muted-foreground">{library.packages.join(" + ")}</span>
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section id="monorepo" title="Several systems in one monorepo">
                    <Prose>
                        Apps in one monorepo can use different systems — and different icon libraries — from one UI package. Never import
                        two systems into one app: every system defines the same <Code>cn-*</Code> rules and token names globally, and the
                        later import silently wins.
                    </Prose>
                    <Block>{`npx tyohnn init --system graphite --app apps/crm --scope @acme
npx tyohnn add mira --app apps/admin --icons hugeicons
npx tyohnn use nova --app apps/admin          # switch that app's system; the TSX stays
npx tyohnn doctor --built                     # also checks built CSS for the other system's tokens`}</Block>
                    <Prose>
                        <Code>doctor</Code> fails on two systems in one app, import order or a missing <Code>layer(base)</Code>, a missing{" "}
                        <Code>@source</Code>, font variables the layout does not declare, an icon path that disagrees with{" "}
                        <Code>tyohnn.json</Code>, or a mode class that differs from it; it warns when icon libraries diverge or CLI-owned
                        files were edited.
                    </Prose>
                </Section>

                <Section id="source" title="Versions and source">
                    <Prose>
                        The npm package holds only the CLI. Components and systems are read from the tyohnn repository at run time (the{" "}
                        <Code>main</Code> branch by default), cached per commit, and the commit is recorded in <Code>tyohnn.json</Code>.
                        Later commands read that commit, so they never silently move a project to a newer version.
                    </Prose>
                    <div className="grid max-w-3xl gap-3">
                        <CopyCommand label="Pin a version" command="npx tyohnn init --system sera --ref <commit>" />
                        <CopyCommand label="What changed since" command="npx tyohnn diff --ref main" />
                    </div>
                </Section>

                <Section id="ownership" title="File ownership">
                    <div className="overflow-x-auto rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kind</TableHead>
                                    <TableHead>Files</TableHead>
                                    <TableHead>What the CLI does</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="align-top">CLI-owned</TableCell>
                                    <TableCell className="align-top whitespace-normal">TSX, icon mappings, system folders</TableCell>
                                    <TableCell className="min-w-64 whitespace-normal">Written whole with a recorded hash; overwritten only while unchanged. Edited files are kept and reported.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="align-top">Managed blocks</TableCell>
                                    <TableCell className="align-top whitespace-normal">entry CSS, layout, next/vite config</TableCell>
                                    <TableCell className="min-w-64 whitespace-normal">Only the text between <Code>tyohnn:begin</Code> and <Code>tyohnn:end</Code> comments is rewritten.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="align-top">Merged</TableCell>
                                    <TableCell className="align-top whitespace-normal">tsconfig paths, package.json, index.html classes</TableCell>
                                    <TableCell className="min-w-64 whitespace-normal">Only the entries tyohnn needs change; comments and formatting stay.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="align-top">Yours</TableCell>
                                    <TableCell className="align-top whitespace-normal">everything else</TableCell>
                                    <TableCell className="min-w-64 whitespace-normal">Never touched.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </Section>
            </div>
        </div>
    );
}

// The site's own words in English: the one file whose shape every other locale has to match (ko.tsx is typed
// as `Messages`). What the registry already says in English (system descriptions, screen names, frame token
// groups) stays where it is; a locale only lists what it replaces (`labels`, `systems`).

import type { ReactNode } from "react";

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty"];

/** 17 → "Seventeen" (numbers past twenty stay digits) */
const spell = (value: number) => WORDS[value] ?? String(value);

/** What a locale says in place of a registry string */
export interface SystemText
{
    description: string;
    tagline: string;
    /** The short line the compare table shows under "Character" */
    character: string;
}

export const en = {
    htmlLang: "en",

    site: {
        title: "tyohnn — enough with color tweaks, build your own taste",
        titleTemplate: "%s · tyohnn",
        description: "Color themes made every shadcn app look the same. tyohnn pulls density, depth and texture out of the components and into tokens you own. Browse every design system live and install one with npx tyohnn@latest init.",
    },

    mode: { light: "Light", dark: "Dark" },
    /** The small tags beside a system's name */
    modeTag: { light: "light", dark: "dark" },

    chrome: {
        navLabel: "Site",
        nav: { systems: "Systems", components: "Components", compare: "Compare", docs: "Docs", github: "GitHub" },
        footerNote: "shadcn · Base UI · MIT",
        language: { label: "Language", other: "한국어", otherLang: "ko" },
    },

    copy: {
        copy: "Copy",
        copied: "Copied",
        aria: (command: string) => `Copy: ${command}`,
    },

    hero: {
        titleFirst: "Enough with color tweaks,",
        titleSecond: "Build your own taste",
        body: <>Colour is where everyone stops.<br />Go further — <b>density, depth and texture</b>, as tokens you own.</>,
        browse: "Browse systems",
        play: "▶ Play",
        pause: "❚❚ Pause",
        frameTitle: (name: string) => `${name} CRM dashboard`,
        compareAny: "Compare any two →",
    },

    gallery: {
        titleFirst: "Pick a screen.",
        titleSecond: "Every system follows.",
        body: (total: number, blocks: number) => `${spell(total)} product screens — a CRM and ${spell(blocks).toLowerCase()} built on shadcn's sidebar blocks. One click switches every card together.`,
        count: (count: number) => `${count} systems`,
        orderLabel: "Order",
        newest: "Newest",
        alphabetical: "A–Z",
        chipFoot: (link: (label: string) => ReactNode): ReactNode => <>Components, icons and every state are on {link("Components →")}</>,
        isNew: "New",
        open: "Open →",
        compareTitle: "Compare two →",
        compareBody: (count: number) => `Any two of ${count} systems, side by side`,
    },

    taste: {
        note: "Every card is a real system — its own colours, its own tokens.",
        density: {
            title: "Density",
            body: "How much air a screen has — control heights, padding, row rhythm.",
            captions: { mira: "28px controls · 12px text", nova: "32px controls · 16px padding", sera: "40px controls · 24px padding" } as Record<string, string>,
        },
        depth: {
            title: "Depth",
            body: "How far surfaces lift off the page — flat, set down lightly, or lifted.",
            captions: { nocturne: "Flat on the page", rhea: "Set down on a light shadow", luma: "No borders · lifted by shadow" } as Record<string, string>,
        },
        texture: {
            title: "Texture",
            body: "What a surface is made of — a sheen, moulded clay, smoked glass.",
            captions: { loam: "White veils · sheen", graphite: "Clay controls", halo: "Smoked glass" } as Record<string, string>,
        },
        type: {
            title: "Typography",
            body: "The voice — which face, how tight, how labels speak.",
            captions: { vellum: "Source Serif titles", lyra: "JetBrains Mono throughout", maia: "Figtree · round" } as Record<string, string>,
        },
    },

    home: {
        layers: [
            { num: "1", title: "Colour", body: "The palette for light and dark, as semantic tokens.", file: "styles/globals.css" },
            { num: "2", title: "Tokens", body: "Density, depth and texture: control heights, radii, shadows, surfaces.", file: "styles/tokens.css" },
            { num: "3", title: "Component rules", body: <>One file per component, styling the <span className="mono">cn-*</span> hooks. The TSX never changes.</>, file: "styles/components/*.css" },
        ] as { num: string; title: string; body: ReactNode; file: string }[],
        // What stands on the three layers: the pieces of a screen, and where they stand on a page.
        above: [
            { num: "4", title: "Blocks", body: "Screen pieces composed from the components — a page heading, a table in a card, a kanban board. They read the system's tokens and nothing else, so a block changes with the system.", file: "blocks/*.tsx" },
            { num: "5", title: "Frames", body: "Where the blocks stand: the gutter, the gap, what scrolls, and what an aside does when the page is narrow. A screen picks a step; a token says how much it is.", file: "blocks/page.tsx" },
        ] as { num: string; title: string; body: ReactNode; file: string }[],
        installTitle: "Copy a whole system.",
        installBody: "Components, three layers, fonts, icons and DESIGN.md — into Next.js, Vite or a Turborepo monorepo.",
    },

    system: {
        crumbsLabel: "Breadcrumb",
        crumbsRoot: "Systems",
        specs: { sans: "Sans", heading: "Heading", icons: "Icons", hangul: "Hangul", default: "Default" },
    },

    systemView: {
        install: "Install",
        previewMode: "Preview mode",
        palette: "Palette",
        paletteLabel: (mode: string) => `${mode} palette`,
        categoriesLabel: "Screen categories",
        screens: (count: number) => `${count} screens`,
        fullScreen: "Full screen ↗",
        sidePanel: "Layout and colours",
        compare: "Compare",
    },

    theme: {
        trigger: "Colours",
        edited: "edited",
        title: "Colours",
        close: "Close",
        intro: (name: string) => `${name}’s feel, any palette. Changes land in the frames as you make them.`,
        themes: "Themes",
        themesHint: "a whole palette, one per system",
        bases: "Bases",
        basesHint: "shadcn’s neutral ramps",
        palette: "Palette",
        accent: "Accent",
        chart: "Chart colour",
        chartDefault: "default",
        search: "Search colours…",
        none: "none",
        every: "Every colour",
        clear: (count: number) => `${count} changed by hand — clear`,
        groups: {
            base: "Base",
            chart: "Charts",
            sidebar: "Sidebar",
            status: "Status",
            tag: "Tag tones",
            avatar: "Avatar tones",
            state: "Checked · selection · link",
        } as Record<string, string>,
        pick: (name: string, mode: string) => `Pick --${name} (${mode})`,
        fieldLabel: (name: string, mode: string) => `--${name} (${mode})`,
        undo: (name: string) => `Undo --${name}`,
        undoTitle: (original: string | null) => `Back to ${original ?? "the theme's value"}`,
        copyCss: "Copy CSS",
        download: "Download theme.json",
        copyInstall: "Copy install command",
        copyShare: "Copy share link",
        resetAll: "Reset all",
        resetTitle: "Back to the system's own colours",
    },

    frames: {
        edited: "edited",
        title: "Layout",
        intro: "Adjust spacing and widths. Every screen on this page updates as you drag.",
        copyCss: "Copy CSS",
        resetAll: "Reset all",
        resetTitle: "Back to the defaults",
    },

    components: {
        eyebrow: (components: number, sections: number) => `${components} components · ${sections} sections`,
        title: "Components",
        body: "Every registry component in one system: variants, sizes and states — disabled, invalid, checked, selected, open. Switch the system and the whole sheet restyles.",
        navLabel: "Components",
        filter: "Filter components",
        empty: (query: string) => `No component matches “${query}”.`,
        sections: (count: number) => `${count} sections`,
        openPopup: "open popup",
    },

    compare: {
        eyebrow: "Side by side",
        title: "Compare",
        body: <>Two systems, one screen, <b>the same palette on both sides</b> — so what you see is spacing, corners, depth and type. Change the colours and both follow.</>,
        metaDescription: "Two tyohnn design systems on the same screen, split by a divider you drag.",
        pair: (a: string, b: string) => `${a} and ${b}`,
        swap: "⇄ Swap",
        divider: (a: string, b: string) => `Divider between ${a} and ${b}`,
        rows: { sans: "Sans", heading: "Heading", icons: "Icons", mode: "Default mode", character: "Character" },
    },

    pickers: {
        system: "System",
        systemSearch: "Search systems…",
        systemSide: (side: string) => `System ${side}`,
        screen: "Screen",
        screenSearch: "Search screens…",
        modeLabel: "Preview mode",
    },

    combobox: { noMatch: "No match" },

    meta: {
        components: { title: "Components", description: "Every tyohnn component with its variants, sizes and states, rendered live in the design system you pick." },
        compare: { title: "Compare" },
        docs: {
            title: "Docs",
            description: "The tyohnn CLI: init, add, use, icons, fonts, blocks, doctor and diff; where files go; fonts and icons; blocks and frames; several systems in one monorepo.",
        },
    },

    docs: {
        tocLabel: "On this page",
        sections: [
            { id: "start", label: "Getting started" },
            { id: "commands", label: "Commands" },
            { id: "options", label: "Options" },
            { id: "files", label: "Where files go" },
            { id: "fonts", label: "Fonts" },
            { id: "icons", label: "Icons" },
            { id: "blocks", label: "Blocks" },
            { id: "frames", label: "Frames" },
            { id: "monorepo", label: "Several systems" },
            { id: "source", label: "Versions and source" },
            { id: "ownership", label: "File ownership" },
        ],
        eyebrow: "Docs",
        title: "Install a system.",
        lead: (
            <>
                The <code>tyohnn</code> CLI copies one set of component TSX and one or more complete design-system folders into your project,
                then wires them in. There is no runtime package: after <code>init</code> the code is yours. Node 20 or later; Next.js (App Router),
                Vite, and npm · pnpm · yarn · bun workspace monorepos.
            </>
        ),

        startTitle: "Getting started",
        startApp: "A Next.js or Vite app",
        startMonorepo: "A monorepo: packages/ui plus one app",
        startPick: (link: ReactNode): ReactNode => <>Pick a system on the {link}. Available:</>,
        startPickLink: "systems page",

        commandsTitle: "Commands",
        commandsIntro: <>Every command edits <code>tyohnn.json</code> and then makes the project match it, so running it twice changes nothing the second time.</>,
        commandsHead: ["Command", "What it does"],
        commands: [
            ["init", <>Detects the project, asks for a system (or <code>--system</code>), copies the TSX and the system, adds dependencies, installs and wires the app. In a monorepo it creates <code>packages/ui</code> and wires <code>--app &lt;path&gt;</code>.</>],
            ["add <system> --app <path>", <>Monorepo: adds a system to the existing UI package and wires another app to it.</>],
            ["use <system> [--app <path>]", <>Switches an app to another system: entry CSS, fonts and mode. The TSX stays.</>],
            ["icons <library> [--app <path>]", <>Switches an app&apos;s icon library (mapping file and packages).</>],
            ["fonts [--sans] [--heading] [--mono] [--reset]", <>Switches an app&apos;s fonts; <code>--reset</code> returns to the system&apos;s own.</>],
            ["blocks [remove]", <>Installs (or updates) the blocks and frames next to the components; <code>remove</code> takes them out.</>],
            ["list", <>Systems, icon libraries and fonts, one line each.</>],
            ["doctor [--built]", <>Checks the setup against <code>tyohnn.json</code>; exit code 1 on a failure.</>],
            ["diff [--files]", <>Compares the project&apos;s copies with the source: changed upstream, locally, or both.</>],
        ] as [string, ReactNode][],

        optionsTitle: "Options",
        options: [
            ["--yes", "No prompts; take the defaults."],
            ["--force", "Overwrite files that exist or were edited."],
            ["--no-install", "Skip installing packages."],
            ["--mode light|dark", "Override the system's default mode."],
            ["--icons <library>", "init: another icon library."],
            ["--font · --font-heading · --font-mono", "init: other fonts from the catalog."],
            ["--app · --ui · --scope", "Monorepo: the app to wire, the UI package folder and its scope."],
            ["--ref · --source · --offline", "Which registry version to read, a local checkout, or the cache only."],
        ] as [string, string][],

        filesTitle: "Where files go",
        filesIntro: <>A monorepo keeps one UI package: the TSX once, and a folder per system. <b>Each app imports exactly one system.</b></>,
        filesMonorepoTree: [
            "packages/ui/src/components · hooks · lib       the TSX, imported as @acme/ui/components/…",
            "packages/ui/src/icons/libraries/<library>.tsx  the icon libraries some app uses",
            "packages/ui/src/systems/<system>/              colours · tokens · typeset · rules · DESIGN.md",
            "apps/<app>/src/app/globals.css                 imports exactly one system",
            "apps/<app>/tsconfig.json                       paths \"@acme/ui/icons\" → that app's library",
            "tyohnn.json                                    at the monorepo root",
        ],
        filesSingleIntro: <>A single Next.js or Vite app gets the same pieces under <code>src/</code>, imported through the <code>@/</code> alias (added when missing):</>,
        filesSingleTree: [
            "src/components/ui/*.tsx       imported as @/components/ui/…",
            "src/hooks · src/lib           hooks and utilities",
            "src/components/icons/         index.ts · names.ts · libraries/<library>.tsx",
            "src/styles/tyohnn/<system>/   the system folder",
        ],
        filesOrder: (
            <>
                The entry CSS imports the system in a fixed order — tailwindcss, layer 1 colours, layer 2 tokens, typeset, then layer 3 rules in{" "}
                <code>layer(base)</code> — so utilities you pass through <code>className</code> still win.
            </>
        ),

        fontsTitle: "Fonts",
        fontsIntro: (
            <>
                Fonts are always self-hosted; nothing loads Google&apos;s font CDN. Next.js apps get <code>next/font/google</code> (or{" "}
                <code>next/font/local</code> for Pretendard) in the root layout; Vite apps get the fontsource or npm package and an{" "}
                <code>@import</code>. Each system names a sans, heading and mono font plus a Hangul fallback; override them per app:
            </>
        ),
        fontsInit: "Other fonts at init",
        fontsReset: "Back to the system's own",
        fontsHead: ["Id", "Family", "Category", "Licence"],

        iconsTitle: "Icons",
        iconsIntro: (count: number): ReactNode => (
            <>
                Components import icons by meaning (<code>ChevronDown</code>, <code>SelectIndicator</code>) from one module, never from an icon
                package. The module maps every name onto one of {count} libraries. Each system has a default; switch it at{" "}
                <code>init</code> or later:
            </>
        ),
        iconsInit: "Another library at init",
        iconsLater: "Switch one app later",

        blocksTitle: "Blocks",
        blocksIntro: (
            <>
                A block is a piece of a screen composed from the components: a page heading, a row of metric cards, a table in a card with
                tabs and bulk actions, a kanban board. It reads the system&apos;s tokens and decides no colour, size or radius of its own, so it
                changes with the system and with nothing else. Its data and words come from the screen that uses it.
            </>
        ),
        blocksNew: "With a new project",
        blocksExisting: "Into a project that has the components",
        blocksOwned: (
            <>
                They land next to the components (<code>blocks/</code>) as CLI-owned files: <code>doctor</code> checks them, <code>diff</code>{" "}
                shows what changed upstream, <code>tyohnn blocks</code> updates them and <code>tyohnn blocks remove</code> takes them out.
                Every screen in the gallery is built from them.
            </>
        ),

        framesTitle: "Frames",
        framesIntro: (
            <>
                A frame is a block with no content of its own. It holds other blocks and decides only where they stand: how far from the
                edge, how far from each other, what scrolls, and what sits beside what. <code>Page</code> is the content under the bar;{" "}
                <code>PageContent</code> is a column inside something that scrolls; <code>PageSplit</code> puts a main pane and an aside side by side.
            </>
        ),
        framesTree: [
            '<Page scroll="regions">                    pinned: something inside scrolls',
            "    <PageHeading … />",
            "    <PageSplit narrow=\"stack\">",
            "        <DataTableCard … />                   the main pane takes the room",
            '        <PageAside width="md">…</PageAside>   20rem beside it',
            "    </PageSplit>",
            "</Page>",
        ],
        framesStep: (
            <>
                <b>The screen picks a step; a token says how much it is.</b> <code>gutter=&quot;sm&quot;</code> is the screen&apos;s choice;{" "}
                <code>--page-gutter-sm</code> is 1rem unless a system or your own CSS says otherwise. Declare one on <code>:root</code>{" "}
                after the system&apos;s styles and every page at that step moves.
            </>
        ),
        framesTokensHead: ["Token", "Default", "What stands at it"],
        framesNarrow: (minRem: number): ReactNode => (
            <>
                <b>Narrow pages.</b> A split stands side by side while its page is at least {minRem}rem wide — the page&apos;s own
                width, not the window&apos;s, so closing the sidebar gives the room back. Below that the aside does one of three things,
                chosen by the screen with <code>narrow</code> on <code>PageSplit</code>. There is no fourth: an aside that keeps its
                width squeezes the main pane to nothing.
            </>
        ),
        framesNarrowHead: ["narrow", "The aside", "For"],
        /** What the narrower pane of a split does below the page width where two panes no longer fit */
        narrow: [
            ["stack", "It goes under the main pane and the page scrolls as one.", "Content read along with the main pane: a team page's seat and invitation cards."],
            ["sheet", "It leaves the page and opens over it from a PageAsideTrigger; the main pane keeps its height.", "A tool that works on the main pane: a playground's run settings, a review's checks."],
            ["hide", "It is not drawn.", "An aid the page works without: a table of contents."],
        ] as [string, string, string][],
        framesTry: (systemLink: ReactNode): ReactNode => (
            <>
                To try the values, use the <b>Layout</b> tab beside the screens on any {systemLink}: a slider moves every
                screen on the page at once.
            </>
        ),
        framesTryLink: "system's page",

        monorepoTitle: "Several systems in one monorepo",
        monorepoIntro: (
            <>
                Apps in one monorepo can use different systems — and different icon libraries — from one UI package. Never import two systems
                into one app: every system defines the same <code>cn-*</code> rules and token names globally, and the later import silently wins.
            </>
        ),
        monorepoTree: [
            "npx tyohnn@latest init --system graphite --app apps/crm --scope @acme",
            "npx tyohnn@latest add mira --app apps/admin --icons hugeicons",
            "npx tyohnn@latest use nova --app apps/admin          # switch that app's system; the TSX stays",
            "npx tyohnn@latest doctor --built                     # also checks built CSS for the other system's tokens",
        ],
        monorepoDoctor: (
            <>
                <code>doctor</code> fails on two systems in one app, import order or a missing <code>layer(base)</code>, a missing{" "}
                <code>@source</code>, font variables the layout does not declare, an icon path that disagrees with <code>tyohnn.json</code>, or a
                mode class that differs from it; it warns when icon libraries diverge or CLI-owned files were edited.
            </>
        ),

        sourceTitle: "Versions and source",
        sourceIntro: (
            <>
                The npm package holds only the CLI. Components and systems are read from the tyohnn repository at run time (the <code>main</code>{" "}
                branch by default), cached per commit, and the commit is recorded in <code>tyohnn.json</code>. Later commands read that commit,
                so they never silently move a project to a newer version.
            </>
        ),
        sourcePin: "Pin a version",
        sourceDiff: "What changed since",

        ownershipTitle: "File ownership",
        ownershipHead: ["Kind", "Files", "What the CLI does"],
        ownership: [
            ["CLI-owned", "TSX, icon mappings, system folders", "Written whole with a recorded hash; overwritten only while unchanged. Edited files are kept and reported."],
            ["Managed blocks", "entry CSS, layout, next/vite config", <>Only the text between <code>tyohnn:begin</code> and <code>tyohnn:end</code> comments is rewritten.</>],
            ["Merged", "tsconfig paths, package.json, index.html classes", "Only the entries tyohnn needs change; comments and formatting stay."],
            ["Yours", "everything else", "Never touched."],
        ] as [string, string, ReactNode][],
    },

    /** Replacements for registry strings; English is what the registry already says, so these are empty */
    labels: {
        categories: {} as Record<string, string>,
        screens: {} as Record<string, string>,
        coverageGroups: {} as Record<string, string>,
        /** Coverage sections are component ids; a locale may show a name beside the id */
        sections: {} as Record<string, string>,
        frameGroups: {} as Record<string, { title: string; hint: string }>,
        /** English has none: the registry's own step names ("Small", "Medium"…) are the words */
        frameSteps: {} as Record<string, string>,
    },
    systems: {} as Record<string, SystemText>,
};

export type Messages = typeof en;

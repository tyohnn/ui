// tyohnn — scaffold design systems into Next.js and Vite apps and monorepos.

import { parseArgs } from "node:util";

import { doctor } from "./commands/doctor.js";
import { diff, list } from "./commands/info.js";
import { init } from "./commands/init.js";
import { add, fonts, icons, use } from "./commands/modify.js";
import type { GlobalOptions } from "./commands/context.js";
import { CliError, log } from "./lib/log.js";

declare const __TYOHNN_VERSION__: string;

const VERSION = typeof __TYOHNN_VERSION__ === "string" ? __TYOHNN_VERSION__ : "dev";

const HELP = `tyohnn ${VERSION} — shadcn components on Base UI with a three-layer CSS design system

Usage
  tyohnn init [--system <name>] [--app <path>]     set up a system (monorepo: packages/ui + an app)
  tyohnn add <system> --app <path>                 another system for another app of the monorepo
  tyohnn use <system> [--app <path>]               switch an app's system (TSX stays)
  tyohnn icons <library> [--app <path>]            switch an app's icon library
  tyohnn fonts [--sans --heading --mono] [--app]   switch an app's fonts (--reset: the system's)
  tyohnn list                                      systems, icon libraries and fonts
  tyohnn doctor [--built]                          check the setup
  tyohnn diff [--files]                            compare the project's copies with the source

Options
  --system <name>           design system (init)
  --icons <library>         lucide · tabler · hugeicons · phosphor · remixicon · radix
  --font <id>               sans font (init, add, use); --font-heading <id|inherit> · --font-mono <id|system>
  --mode <light|dark>       default colour mode (the system's by default)
  --app <path>              app folder (monorepo)
  --ui <path>               UI package folder (monorepo init, default packages/ui)
  --scope <@scope>          UI package scope (monorepo init): <scope>/ui
  --example <name>          also copy an example page (component-sheet)
  --ref <ref>               tyohnn branch, tag or commit to read (default main)
  --source <path>           a local tyohnn checkout or tarball instead of GitHub
  --offline                 use the cache only
  --no-install              do not run the package manager
  --force                   overwrite files that exist or were changed locally
  -y, --yes                 no prompts; take defaults
  --cwd <path>              run as if from this folder
  -v, --version · -h, --help
`;

const main = async (): Promise<number> =>
{
    const { values, positionals } = parseArgs({
        allowPositionals: true,
        strict: true,
        options: {
            system: { type: "string" },
            icons: { type: "string" },
            font: { type: "string" },
            "font-heading": { type: "string" },
            "font-mono": { type: "string" },
            sans: { type: "string" },
            heading: { type: "string" },
            mono: { type: "string" },
            reset: { type: "boolean" },
            mode: { type: "string" },
            app: { type: "string" },
            ui: { type: "string" },
            scope: { type: "string" },
            example: { type: "string" },
            ref: { type: "string" },
            source: { type: "string" },
            offline: { type: "boolean" },
            "no-install": { type: "boolean" },
            force: { type: "boolean" },
            yes: { type: "boolean", short: "y" },
            cwd: { type: "string" },
            built: { type: "boolean" },
            files: { type: "boolean" },
            version: { type: "boolean", short: "v" },
            help: { type: "boolean", short: "h" },
        },
    });

    if (values.version)
    {
        log.info(VERSION);

        return 0;
    }

    const [command, argument] = positionals;

    if (values.help || !command)
    {
        log.info(HELP);

        return command || values.help ? 0 : 1;
    }

    const options: GlobalOptions = { ...values, install: !values["no-install"] };

    switch (command)
    {
        case "init": await init(options); return 0;
        case "add": await add(argument, options); return 0;
        case "use": await use(argument, options); return 0;
        case "icons": await icons(argument, options); return 0;
        case "fonts": await fonts(options); return 0;
        case "list": await list(options); return 0;
        case "doctor": return doctor(options);
        case "diff": return diff(options);
        default: throw new CliError(`unknown command "${command}"`, "Run `tyohnn --help`.");
    }
};

main().then((code) => process.exit(code), (error: unknown) =>
{
    if (error instanceof CliError)
    {
        log.error(error.message);
        if (error.hint) log.info(`  ${error.hint}`);
    }
    else if (error instanceof Error && (error as NodeJS.ErrnoException).code?.startsWith("ERR_PARSE_ARGS"))
    {
        log.error(error.message);
        log.info("  Run `tyohnn --help`.");
    }
    else
    {
        log.error(error instanceof Error ? error.stack ?? error.message : String(error));
    }

    process.exit(1);
});

# tyohnn

Scaffold [tyohnn](https://github.com/tyohnn/ui) design systems into your project: shadcn components on Base
UI primitives, styled by a three-layer CSS architecture (colours · tokens · `cn-*` rules). The CLI copies one
set of component TSX and one or more complete design-system folders, then wires them into your app. There is no
runtime package: after `init` the code is yours.

```sh
npx tyohnn init --system vega
```

Requires Node 20 or later. Supports Next.js (App Router) apps, Vite apps, and npm · pnpm · yarn · bun workspace
monorepos (with or without Turborepo).

## Commands

| Command | What it does |
|---|---|
| `init` | Detects the project, asks for a system (or `--system`), copies the TSX and the system, adds dependencies, installs, and wires the app. In a monorepo it creates `packages/ui` and wires `--app <path>`. |
| `add <system> --app <path>` | Monorepo: adds a system to the existing UI package and wires another app to it. Asks when its icon library differs from the other apps' (`--icons` answers up front). |
| `use <system> [--app <path>]` | Switches an app to another system: entry CSS, fonts and mode. The TSX stays; the old system folder is removed when no app uses it. |
| `icons <library> [--app <path>]` | Switches an app's icon library (mapping file and packages). |
| `fonts [--sans <id>] [--heading <id\|inherit>] [--mono <id\|system>] [--reset] [--app <path>]` | Switches an app's fonts; `--reset` returns to the system's. |
| `list` | Systems, icon libraries and fonts, one line each. |
| `doctor [--built]` | Checks the setup against `tyohnn.json` (see below). Exit code 1 on a failure. |
| `diff [--files]` | Compares the project's copies with the source: changed upstream, changed locally, both, added, removed. |

Common options: `--yes` (no prompts, take defaults) · `--force` (overwrite files that exist or were edited) ·
`--no-install` · `--mode light|dark` · `--cwd <path>`. `init` also takes `--icons <library>`, `--font <id>`,
`--font-heading <id|inherit>`, `--font-mono <id|system>`, and in a monorepo `--app <path>`, `--ui <folder>`
(default `packages/ui`) and `--scope <@scope>` (the package becomes `<scope>/ui`). `--example component-sheet`
copies the preview's component sheet into the app (a page at `/tyohnn/component-sheet` in Next.js).

Every command is idempotent: it edits `tyohnn.json` and then makes the project match it, so running the same command
twice changes nothing the second time.

## Where files go

**Monorepo** (`init --system graphite --app apps/crm --scope @acme`, then `add mira --app apps/admin`):

```
packages/ui/src/components · hooks · lib       the TSX, imports as @acme/ui/components/…
packages/ui/src/icons/libraries/<library>.tsx  the icon libraries some app uses
packages/ui/src/icons/index.ts                 the package's default library (what its own typecheck sees)
packages/ui/src/systems/<system>/              globals.css · tokens.css · typeset*.css · style.css · components/ · DESIGN.md · system.json
apps/<app>/src/app/globals.css                 imports exactly one system
apps/<app>/tsconfig.json                       paths "@acme/ui/icons" → that app's library
apps/<app>/next.config.ts                      transpilePackages ["@acme/ui"]
tyohnn.json                                    at the monorepo root
```

**Single app** (Next.js or Vite):

```
src/components/ui/*.tsx                imports as @/components/ui/…
src/hooks · src/lib
src/components/icons/                  index.ts · names.ts · libraries/<library>.tsx
src/styles/tyohnn/<system>/            the system folder
```

The `@` alias is read from `tsconfig.json` (`"@/*": ["./src/*"]`); when there is none it is added (and, for Vite, to
`resolve.alias`).

## Where the content comes from

The npm package holds only the CLI. The components and systems come from the tyohnn repository at run time:

- **Default**: `https://codeload.github.com/tyohnn/ui/tar.gz/main`. `--ref <branch|tag|commit>` pins another
  version. The tarball is extracted (only `registry/` and the preview templates) into the user cache under its commit
  id, which `tyohnn.json` records.
- **Cache**: `~/Library/Caches/tyohnn` (macOS), `$XDG_CACHE_HOME/tyohnn` or `~/.cache/tyohnn` (Linux),
  `%LOCALAPPDATA%\tyohnn\Cache` (Windows); `TYOHNN_CACHE_DIR` overrides it. A branch or tag is resolved again on every
  run; when GitHub cannot be reached the last commit it resolved to is used (with a warning). A full commit id is
  served from the cache. `--offline` never downloads.
- **Local**: `--source <path>` reads a tyohnn checkout in place, or a `.tar.gz` (for example
  `git archive --format=tar.gz --prefix=tyohnn-main/ HEAD`) through the same extraction as a download.
- Commands after `init` (`add`, `use`, `icons`, `fonts`, `diff`) read the recorded commit from the cache, so they do not
  silently move the project to a newer version. Pass `--ref` or `--source` to read another one.

## File ownership

| Kind | Files | What the CLI does |
|---|---|---|
| **CLI-owned** | the TSX, icon mapping files, system folders, examples | Written whole, hash recorded in `tyohnn.json`. A later command overwrites a file only if it is unchanged since it was written; a file you edited is kept and reported (`--force` overwrites). A file that exists but was never written by tyohnn stops `init` before anything is written. Files no longer needed (a system or icon library no app uses) are removed unless edited. |
| **Managed blocks** | entry CSS, `layout.tsx`, `next.config.*`, `vite.config.*`, the Vite entry module | Codemods (a Babel parse for positions; everything outside the edit stays byte-identical) insert blocks between `tyohnn:begin <name>` / `tyohnn:end <name>` comments and rewrite only those blocks later. Deleting a block undoes it. A value added to an existing array carries a `/* tyohnn */` comment. |
| **Merged** | `tsconfig.json` (`compilerOptions.paths`), `package.json` (dependencies), `index.html` (`<html>` classes) | Only the entries tyohnn needs change; comments and formatting stay (JSONC edits). A dependency you already declare is never changed; the icon and font packages tyohnn added are removed when no longer needed. |
| **Yours** | everything else | Never touched. |

When a codemod cannot edit a file safely (a computed config, no `<html>` element) the command prints the change to
make by hand.

The entry CSS gets two blocks: `system` at the top (`tailwindcss` → font CSS for Vite → layer 1 → layer 2 → typeset
→ layer 3 in `layer(base)`) and `theme` after the last `@import` (`@source` lines and font stacks). A standalone
`@import "tailwindcss"` is folded into the first block. Custom properties you declare after the blocks override the
system's tokens; `init` and `doctor` warn when they shadow a system token (the create-next-app and create-vite
starter CSS does this with `--background`, `--foreground` and font variables).

## Fonts

Fonts are always self-hosted; nothing loads `fonts.googleapis.com`.

- **Next.js**: `next/font/google` for Google fonts, `next/font/local` for Pretendard (paths into the installed
  `pretendard` package, found from the app so hoisting and pnpm links both work). `adjustFontFallback: false`, so no
  metric-adjusted Arial sits between the font and the Hangul fallback. next/font registers its own family names, so
  the entry CSS redeclares the three layer-1 stacks on the next/font variables; the system's own files stay identical
  to the registry. `<html>` gets `font-sans`, the variables and (for dark systems) `dark` through `tyohnnHtmlClassName`.
- **Vite**: the `@fontsource-variable/*` or `pretendard` package and an `@import` of its CSS; the system's stacks work
  as written. With `--font` overrides the stacks are redeclared with the catalog family names.

## Icons

Components import semantic names from one module (`@acme/ui/icons` or `@/components/icons`), never an icon package.
A single app has one library. In a monorepo each app's `tsconfig.json` `paths` points the specifier at its own
library file; Next.js honours tsconfig paths for transpiled workspace packages in both bundlers, so no bundler alias
is written (a Turbopack alias whose target does not resolve is ignored silently). Vite apps in a monorepo get an
exact-match `resolve.alias` as well. One library per monorepo is simpler; `add` asks before adding a second.

## Several systems in one monorepo

Each app imports exactly one system; never import two in one app (every system defines the same `cn-*` rules and
token names globally, and the later import silently wins). `doctor --built` checks a Next.js app's built CSS for
token values only another system declares.

## doctor

Per app: the entry CSS imports one system, the recorded one, in order, with `style.css` in `layer(base)`; the
monorepo `@source`; Next.js `transpilePackages`, the layout block, `<html>` reading it, `dark` matching the recorded
mode, font variables the stacks read, `next/font/local` files present; Vite `index.html` mode and the entry CSS import;
icons resolving to the recorded library; font and icon packages installed. Project: components importing icon packages
directly, CLI-owned files missing (fail) or edited (warning), icon libraries diverging across apps (warning).

## Known limitations

- Next.js Pages Router, Remix, Astro and other frameworks are not wired (the files can still be copied by hand).
- Starter CSS from create-next-app / create-vite that redeclares `--background` or `body { font-family }` overrides the
  system; the CLI warns but does not delete your rules.
- The GitHub download is not verified against a checksum; pin `--ref <commit>` for reproducible setups.
- `pnpm` and `yarn` projects are detected and installed with their own manager, but the fixtures run npm only.
- `--vendor-fonts` (copying woff2 files into `public/`) is not implemented.

## Design note: `upgrade` (not implemented)

`tyohnn.json` records the source commit and, per CLI-owned file, its source path and the hash of what was written.
`diff` already classifies every file against another source (`--ref`): unchanged · changed upstream · changed locally
· changed in both · added · removed. `upgrade --ref <new>` would:

1. open the new source and plan the same files `sync` plans today;
2. write "changed upstream" and "added" files, remove "removed" ones that are unchanged locally;
3. for "changed in both", write `<file>.tyohnn-new` next to the local file (or a three-way merge when the old source is
   in the cache: base = recorded commit, ours = project, theirs = new) and list them;
4. re-run the codemods (managed blocks are regenerated from the new registry: import order, font stacks);
5. record the new commit only when no conflict is left, so a half-done upgrade can be re-run.

Systems are frozen snapshots, so a system folder changes upstream only when its maintainers republish it; an upgrade
of the TSX alone (`--only ui`) is the common case.

## Development

```sh
npm run build -w tyohnn        # dist/index.js (one bundled file, no runtime dependencies)
npm test -w tyohnn             # unit tests (vitest)
npm run e2e -w tyohnn          # fixture apps: install · build · compare with the preview (slow; see e2e/run.mjs)
node packages/cli/dist/index.js init --source . --cwd <app>
```

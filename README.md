# tyohnn

tyohnn = shadcn + Base UI + a three-layer CSS architecture.

A design-system registry. Each design system is a complete, frozen folder of CSS (colours, tokens,
`cn-*` rules) over one shared set of shadcn components on Base UI primitives. The CLI copies a system
folder plus the shared TSX into a project as they are.

```
registry/ui                  the one set of component TSX (components · hooks · lib)
registry/systems/<name>      complete design systems (system.json · styles · DESIGN.md · reference)
registry/foundation          maintainer master copy of the three layers (mira values) that systems fork
tooling/build-system         system → dist/systems/<name>/compiled.css for the preview
tooling/new-system           fork foundation or a system into registry/systems/<name>
tooling/backfill-component   copy a new foundation component stylesheet and token defaults into every system
tooling/scan-tokens          undefined tokens · foundation token set · component stylesheets
tooling/snapshot             computed-style comparison between two renders
apps/preview                 Vite app: ?system=<name>&mode=dark|light renders a template
```

```sh
npm install
npx turbo typecheck
node tooling/build-system --all
node tooling/scan-tokens
npm run dev -w @tyohnn/preview   # http://localhost:5173/?system=graphite&mode=dark
```

Read [DESIGN.md](DESIGN.md) before adding a component or a design system.

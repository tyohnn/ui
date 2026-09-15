# tyohnn

tyohnn = shadcn + Base UI + a three-layer CSS architecture.

A design-system registry: shadcn components on Base UI primitives whose look lives entirely in three
CSS layers (colours, tokens, `cn-*` rules), plus themes that override those layers. "base" is the name
of that foundation layer (`registry/base`), not the "Base" of Base UI.

```
registry/base            components · hooks · lib · styles (the default of every layer)
registry/themes/<name>   overlays on base (colors.css · tokens.css · replaced/added layer-3 files)
tooling/compose-theme    base + theme → dist/themes/<name>/{index,compiled}.css
tooling/scan-tokens      undefined tokens · axis contract · dead tokens · fractional px
tooling/snapshot         computed-style comparison between two renders
apps/preview             Vite app: ?theme=<name>&mode=dark|light renders a template
```

```sh
npm install
npx turbo typecheck
node tooling/compose-theme --all
node tooling/scan-tokens
npm run dev -w @tyohnn/preview   # http://localhost:5173/?theme=sales-crm&mode=dark
```

Read [DESIGN.md](DESIGN.md) before adding a component or a theme.

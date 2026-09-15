# tyohnn

A design-system registry: Base UI based shadcn components whose look lives entirely in three CSS
layers (colours, tokens, `cn-*` rules), plus themes that override those layers.

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

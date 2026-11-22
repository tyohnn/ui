# Behaviour from a headless library

The behaviour comes from a headless library: unstyled elements with the right ARIA, keyboard handling and state.
tyohnn reads two of them, and the roles do not care which one is underneath.

- **Base UI** (`@base-ui/react/<part>`): parts are namespaces
  (`Slider.Root`, `Slider.Thumb`). State shows as `data-pressed`, `data-checked`, `data-highlighted` and `aria-*`.
- **UI SDK** (`@ui-sdk/react/<part>`, with `@ui-sdk/core`): what tyohnn's primitives are built on. Primitives built from small behaviours
  (`definePrimitive`), the same API in React, Vue, Svelte, Solid and plain web. Parts are named exports
  (`Slider`, `SliderThumb`). State shows as `aria-*` and `data-*`.

Use the one the app already depends on. With neither, use UI SDK, since the tyohnn primitives bring it. Do not mix
the two inside one component. Either way, you add `data-role` for the look; the role rules read `aria-pressed`,
`aria-selected`, `aria-expanded`, `aria-disabled` and `data-disabled`, which both libraries set.

| The part must | Base UI | UI SDK | Notes |
|---|---|---|---|
| be pressed | `Button` or a plain `<button>` | `Button` or a plain `<button>` | |
| stay on or off | `Toggle` | `Toggle` | sets `aria-pressed`; a `control` with `data-variant="ghost"` or `"outline"` shows it |
| be one of a set that stays on | `ToggleGroup` + `Toggle` | `ToggleGroup` + `Toggle` | put `data-role="track"` on the group |
| move focus with arrow keys across a row of buttons | `Toolbar.Root`, `.Button`, `.Group`, `.Separator` | `Toolbar`, `ToolbarButton`, `ToolbarGroup`, `ToolbarSeparator` | a transport bar, a formatting bar |
| pick a value on a range by dragging | `Slider.Root`, `.Control`, `.Track`, `.Indicator`, `.Thumb` | `Slider`, `SliderControl`, `SliderTrack`, `SliderIndicator`, `SliderThumb` | position, volume |
| show a level | `Meter.Root`, `.Track`, `.Indicator` | `Meter`, `MeterTrack`, `MeterIndicator` | VU meter, storage used |
| show progress of a task | `progress` | `progress` | |
| switch between panels | `tabs` (`Tabs.List` is a `track`, `Tabs.Tab` a `control`) | `tabs` (same roles) | |
| open a list of actions | `menu` | `menu` | the popup is a `popup`, each action an `item` |
| open a floating panel | `popover`, `tooltip`, `preview-card` | `popover`, `hover-card` | the popup part is a `popup` |
| block the page | `dialog`, `alert-dialog`, `drawer` | `dialog`, `alert-dialog`, `drawer` | |
| pick one of options | `radio-group`, `select`, `combobox`, `autocomplete` | `radio`, `select`, `combobox`, `autocomplete`, `listbox` | triggers are `field`s |
| take a number with steppers | `number-field` | `number-input` | input is a `field`, steppers `control`s |
| be checked | `checkbox`, `switch` | `checkbox`, `switch` | prefer the tyohnn primitives: their geometry is component-specific |
| collapse | `collapsible`, `accordion` | `collapsible`, `accordion` | |
| scroll with styled bars | `scroll-area` | `scroll-area` | |
| render as another element | `render` prop, `use-render`, `merge-props` | `render` prop | to give a part's behaviour to your own element |

Where the two differ in a way that changes the markup:

- **A toggle in a toolbar.** Base UI renders the toolbar button as the toggle
  (`<Toolbar.Button render={<Toggle pressed … />}>`). In UI SDK a `Toggle` placed inside a `Toolbar` joins it by
  itself, so you write `<Toggle pressed … data-role="control">` as a direct child.
- **The slider thumb's focus.** In UI SDK the thumb holds a native range input that takes focus, so the focus ring
  goes on the thumb with `has-[:focus-visible]:` rather than `focus-visible:`. The thumb's `aria-label` goes to that
  input. Give `SliderControl` `relative touch-none select-none`.

When the tyohnn primitive exists (Slider, Tabs, Switch, Menu …), it already joins the UI SDK part to its look;
use it, and craft only the parts it does not have.

# Behaviour from Base UI

Import each part from `@base-ui/react/<part>`. Base UI renders unstyled elements with the right roles, keyboard
handling and state attributes (`data-pressed`, `data-checked`, `data-highlighted`, `aria-*`); you add `data-role`
for the look.

| The part must | Base UI | Notes |
|---|---|---|
| be pressed | `button` (`Button`) or a plain `<button>` | |
| stay on or off | `toggle` (`Toggle`) | sets `aria-pressed`; a `control` with `data-variant="ghost"` or `"outline"` shows it |
| be one of a set that stays on | `toggle-group` (`ToggleGroup` + `Toggle`) | put `data-role="track"` on the group |
| move focus with arrow keys across a row of buttons | `toolbar` (`Toolbar.Root`, `Toolbar.Button`, `Toolbar.Group`, `Toolbar.Separator`) | a transport bar, a formatting bar |
| pick a value on a range by dragging | `slider` (`Slider.Root`, `.Control`, `.Track`, `.Indicator`, `.Thumb`) | position, volume |
| show a level | `meter` (`Meter.Root`, `.Track`, `.Indicator`) | VU meter, storage used |
| show progress of a task | `progress` | |
| switch between panels | `tabs` (`Tabs.List` is a `track`, `Tabs.Tab` a `control`) | |
| open a list of actions | `menu` | `Menu.Popup` is a `popup`, `Menu.Item` an `item` |
| open a floating panel | `popover`, `tooltip`, `preview-card` | the popup part is a `popup` |
| block the page | `dialog`, `alert-dialog`, `drawer` | |
| pick one of options | `radio-group`, `select`, `combobox`, `autocomplete` | triggers are `field`s |
| take a number with steppers | `number-field` | input is a `field`, steppers `control`s |
| be checked | `checkbox`, `switch` | prefer the tyohnn primitives: their geometry is component-specific |
| collapse | `collapsible`, `accordion` | |
| scroll with styled bars | `scroll-area` | |
| render as another element | `use-render`, `merge-props` | to give a primitive's behaviour to your own element |

When the tyohnn primitive exists (Slider, Tabs, Switch, Menu …), it already joins the Base UI part to its look;
use it, and craft only the parts it does not have.

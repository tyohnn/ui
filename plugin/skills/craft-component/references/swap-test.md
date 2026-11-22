# The swap test

A component that wears the system keeps working when the system changes. Prove it before you hand it over.

1. Render the component on a page of the app (or a scratch page) in the app's system, light and dark.
2. Call `export_system` for two systems far from the app's on density and texture (if the app is roomy and soft,
   take a dense square one like graphite and an editorial one like vellum or sera). Write each into a scratch folder
   (not the app's `tyohnn/` folder).
3. Point the CSS entry's imports at the scratch folder, render, and look. Put the imports back afterwards.

What to look for:

| In the other system | Means |
|---|---|
| a corner, shadow or colour that matches the old system | a literal or a Tailwind preset utility (`rounded-xl`, `shadow-md`, `bg-zinc-900`) in the component |
| a part that keeps its size while everything around it shrinks | a fixed size; derive it from a density token |
| text that does not change font | a font family written in the component |
| unreadable text in one mode | a colour that is not a theme name, or a theme name used on the wrong plane (`text-foreground` on `bg-primary`) |

Report what you looked at in a line per system. Screenshots side by side are the best evidence when the person
asked for a new component.

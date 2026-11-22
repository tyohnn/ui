# Worked example: a mixtape recorder

A component no design system ships. Every part is either a Base UI part (behaviour) or a `data-role` (look), and
the parts no role covers read role tokens by meaning. The same file renders in forest-glass (a glass system made
from a concept), graphite and vellum with no change: reels shrink with graphite's density, the deck turns to glass
in forest-glass and stays paper-opaque in vellum.

| Part | Behaviour | Look |
|---|---|---|
| deck body | `section` | `data-role="surface"` (raised: glass where the system uses glass) |
| title, side | | `label`, `meta` |
| tape counter | | `indicator` square outline, mono numbers |
| cassette window | | `surface` `data-level="inset"` |
| reels | spin while playing (CSS, stopped under reduced motion) | no role: disc from `--surface-border-width`, `border-border`, `bg-card`, `--shadow-recessed`; size from `--control-height-md` |
| level | `Meter` | rail `bg-muted` + `--indicator-radius-pill`, fill `bg-primary` |
| position | `Slider` | rail as above, thumb from `--control-icon-size-lg`, `--surface-primary`, `--shadow-control`, focus ring tokens |
| transport | `Toolbar` (arrow keys between buttons), play and record are `Toggle`s (`aria-pressed`) | `track` holding ghost icon `control`s |

```tsx
import { useEffect, useState } from "react";
import { Meter } from "@base-ui/react/meter";
import { Slider } from "@base-ui/react/slider";
import { Toggle } from "@base-ui/react/toggle";
import { Toolbar } from "@base-ui/react/toolbar";
import { Circle, FastForward, Pause, Play, Rewind } from "lucide-react";

/**
 * A mixtape recorder. Behaviour comes from Base UI (Toolbar, Toggle, Slider, Meter); the look comes from roles and
 * role tokens, so it wears whichever tyohnn system the app imports.
 */

const LENGTH = 45 * 60; // one side of a C90, in seconds

const clock = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

const Reel = ({ spinning, wound }: { spinning: boolean; wound: number }) => (
    <div
        className="relative grid place-items-center rounded-full border-[length:var(--surface-border-width)] border-border bg-card shadow-[var(--shadow-recessed)] size-[calc(var(--control-height-md)*1.8)] data-[spinning]:animate-[spin_2.4s_linear_infinite] motion-reduce:animate-none"
        data-spinning={spinning || undefined}
    >
        {/* the tape wound on this reel, as a ring that grows with it */}
        <div className="absolute rounded-full bg-muted" style={{ inset: `${(1 - wound) * 30 + 8}%` }} />
        <div className="relative grid place-items-center rounded-full bg-background size-[calc(var(--control-height-md)*0.6)]">
            {[0, 60, 120].map((angle) => (
                <span key={angle} className="absolute rounded-full bg-border w-[calc(var(--control-height-md)*0.08)] h-full" style={{ rotate: `${angle}deg` }} />
            ))}
        </div>
    </div>
);

export const Mixtape = ({ title = "Summer '96", side = "A" }: { title?: string; side?: string }) =>
{
    const [playing, setPlaying] = useState(false);
    const [recording, setRecording] = useState(false);
    const [position, setPosition] = useState(754);
    const [level, setLevel] = useState(0.6);

    useEffect(() =>
    {
        if (!playing) return;

        const id = setInterval(() =>
        {
            setPosition((value) => Math.min(LENGTH, value + 1));
            setLevel(0.35 + Math.random() * 0.55);
        }, 1000);

        return () => clearInterval(id);
    }, [playing]);

    const wound = position / LENGTH;

    return (
        <section data-role="surface" className="w-full max-w-[calc(var(--control-height-md)*13)]" aria-label={`Mixtape recorder, ${title}`}>
            <header className="flex items-start justify-between gap-[var(--surface-gap)]">
                <div className="flex min-w-0 flex-col">
                    <span data-role="label" className="truncate">{title}</span>
                    <span data-role="meta">Side {side} · C90</span>
                </div>
                <span data-role="indicator" data-shape="square" data-variant="outline" className="font-[family-name:var(--font-mono)]" aria-label="Tape position">
                    {clock(position)}
                </span>
            </header>

            {/* the cassette window */}
            <div data-role="surface" data-level="inset" className="flex-row items-center justify-around">
                <Reel spinning={playing} wound={1 - wound} />
                <div className="flex flex-col items-center gap-[var(--control-gap-md)]">
                    {recording && <span data-role="indicator" data-shape="pill" data-variant="outline" className="text-destructive">REC</span>}
                    <Meter.Root value={level * 100} aria-label="Level" className="w-[calc(var(--control-height-md)*3)]">
                        <Meter.Track className="block overflow-hidden rounded-[var(--indicator-radius-pill)] bg-muted h-[calc(var(--control-height-md)/6)]">
                            <Meter.Indicator className="block h-full bg-primary transition-[width] duration-[var(--motion-base)]" />
                        </Meter.Track>
                    </Meter.Root>
                </div>
                <Reel spinning={playing} wound={wound} />
            </div>

            <Slider.Root value={position} max={LENGTH} onValueChange={(value) => setPosition(value as number)} aria-label="Position">
                <Slider.Control className="flex items-center h-[var(--control-height-xs)]">
                    <Slider.Track className="relative w-full rounded-[var(--indicator-radius-pill)] bg-muted h-[calc(var(--control-height-md)/8)]">
                        <Slider.Indicator className="rounded-[var(--indicator-radius-pill)] bg-primary" />
                        <Slider.Thumb className="rounded-full bg-[image:var(--surface-primary)] bg-primary shadow-[var(--shadow-control)] outline-none size-[var(--control-icon-size-lg)] focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring" />
                    </Slider.Track>
                </Slider.Control>
            </Slider.Root>

            <Toolbar.Root data-role="track" aria-label="Transport" className="self-center">
                <Toolbar.Button data-role="control" data-variant="ghost" data-icon aria-label="Rewind" onClick={() => setPosition((value) => Math.max(0, value - 30))}>
                    <Rewind />
                </Toolbar.Button>
                <Toolbar.Button
                    render={<Toggle pressed={playing} onPressedChange={setPlaying} />}
                    data-role="control"
                    data-variant="ghost"
                    data-icon
                    aria-label={playing ? "Pause" : "Play"}
                >
                    {playing ? <Pause /> : <Play />}
                </Toolbar.Button>
                <Toolbar.Button data-role="control" data-variant="ghost" data-icon aria-label="Fast forward" onClick={() => setPosition((value) => Math.min(LENGTH, value + 30))}>
                    <FastForward />
                </Toolbar.Button>
                <Toolbar.Button
                    render={<Toggle pressed={recording} onPressedChange={setRecording} />}
                    data-role="control"
                    data-variant="ghost"
                    data-icon
                    aria-label="Record"
                    className="text-destructive"
                >
                    <Circle className="fill-current" />
                </Toolbar.Button>
            </Toolbar.Root>
        </section>
    );
};
```

What it does not do: no colour literal (the record dot is `text-destructive`), no `rounded-xl` or `shadow-md`, no
fixed heights. `rounded-full` is a shape (a disc), not a system value, so it stays.

# Worked example: the mixtape recorder on UI SDK

The recorder from `example-mixtape.md`, with its behaviour from UI SDK (`@ui-sdk/react`) instead of Base UI. The
roles, the tokens and every class that decides the look are the same. Rendered side by side in graphite, the two
versions match pixel for pixel, and they behave the same: one tab stop in the transport bar with arrow keys between
all four buttons, `aria-pressed` on play and record, arrow and page keys on the position, `aria-valuenow` on the
level.

What changed, and only this:

| Part | Base UI | UI SDK |
|---|---|---|
| imports | `@base-ui/react/{toolbar,toggle,slider,meter}` | `@ui-sdk/react/{toolbar,toggle,slider,meter}` |
| play and record | `<Toolbar.Button render={<Toggle … />}>` | `<Toggle …>` inside `<Toolbar>`: it joins the toolbar by itself |
| position thumb | focus ring with `focus-visible:` | the thumb holds the focusable range input, so `has-[:focus-visible]:`; `aria-label` on the thumb |
| part names | `Slider.Root`, `Meter.Track` … | `Slider`, `MeterTrack` … |

```tsx
import { useEffect, useState } from "react";
import { Meter, MeterIndicator, MeterTrack } from "@ui-sdk/react/meter";
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "@ui-sdk/react/slider";
import { Toggle } from "@ui-sdk/react/toggle";
import { Toolbar, ToolbarButton } from "@ui-sdk/react/toolbar";
import { Circle, FastForward, Pause, Play, Rewind } from "lucide-react";

/**
 * The same mixtape recorder, with behaviour from UI SDK (Toolbar, Toggle, Slider, Meter) instead of Base UI. The look
 * is the same roles and role tokens, so it wears whichever tyohnn system the app imports.
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

export const MixtapeSdk = ({ title = "Summer '96", side = "A" }: { title?: string; side?: string }) =>
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
                    <Meter value={level * 100} aria-label="Level" className="w-[calc(var(--control-height-md)*3)]">
                        <MeterTrack className="block overflow-hidden rounded-[var(--indicator-radius-pill)] bg-muted h-[calc(var(--control-height-md)/6)]">
                            <MeterIndicator className="block h-full bg-primary transition-[width] duration-[var(--motion-base)]" />
                        </MeterTrack>
                    </Meter>
                </div>
                <Reel spinning={playing} wound={wound} />
            </div>

            <Slider value={position} max={LENGTH} onValueChange={(value) => setPosition(value as number)}>
                <SliderControl className="relative flex items-center h-[var(--control-height-xs)] touch-none select-none">
                    <SliderTrack className="relative w-full rounded-[var(--indicator-radius-pill)] bg-muted h-[calc(var(--control-height-md)/8)]">
                        <SliderIndicator className="h-full rounded-[var(--indicator-radius-pill)] bg-primary" />
                        <SliderThumb
                            aria-label="Position"
                            className="rounded-full bg-[image:var(--surface-primary)] bg-primary shadow-[var(--shadow-control)] size-[var(--control-icon-size-lg)] has-[:focus-visible]:ring-[length:var(--focus-ring-width)] has-[:focus-visible]:ring-ring"
                        />
                    </SliderTrack>
                </SliderControl>
            </Slider>

            {/* Toggles inside a Toolbar join it: one tab stop, arrow keys between all four */}
            <Toolbar data-role="track" aria-label="Transport" className="self-center">
                <ToolbarButton data-role="control" data-variant="ghost" data-icon aria-label="Rewind" onClick={() => setPosition((value) => Math.max(0, value - 30))}>
                    <Rewind />
                </ToolbarButton>
                <Toggle pressed={playing} onPressedChange={setPlaying} data-role="control" data-variant="ghost" data-icon aria-label={playing ? "Pause" : "Play"}>
                    {playing ? <Pause /> : <Play />}
                </Toggle>
                <ToolbarButton data-role="control" data-variant="ghost" data-icon aria-label="Fast forward" onClick={() => setPosition((value) => Math.min(LENGTH, value + 30))}>
                    <FastForward />
                </ToolbarButton>
                <Toggle pressed={recording} onPressedChange={setRecording} data-role="control" data-variant="ghost" data-icon aria-label="Record" className="text-destructive">
                    <Circle className="fill-current" />
                </Toggle>
            </Toolbar>
        </section>
    );
};
```

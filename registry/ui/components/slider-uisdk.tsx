// Experiment (claude/project-thread-plkaj1): the shadcn Slider on @ui-sdk/react instead of
// @base-ui/react, with the same cn-* hooks so the foundation CSS is untouched. Not in manifest.json.
import * as React from "react"
import {
  Slider as SliderPrimitive,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider"
import { cn } from "cn"

type SliderProps = Omit<
  React.ComponentProps<typeof SliderPrimitive>,
  "className"
> & {
  className?: string
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  // Thumbs are children of the control, not of the track as the UI SDK docs
  // show: the track keeps upstream's overflow-hidden (it rounds the range at
  // the ends), which would clip a 12px thumb on a 4px track. UI SDK measures
  // presses against the track and positions thumbs in percent of their
  // containing block, which is the control (`relative`), the same box as the
  // track along the axis.
  return (
    <SliderPrimitive
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderControl className="cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col">
        <SliderTrack className="cn-slider-track relative grow overflow-hidden select-none">
          {/* data-slot passed as a prop is ignored (the part keeps its own,
              "slider-indicator"); only the render element can replace it. */}
          <SliderIndicator
            render={<div data-slot="slider-range" />}
            className="cn-slider-range select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderTrack>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderThumb
            key={index}
            index={index}
            className="cn-slider-thumb block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderControl>
    </SliderPrimitive>
  )
}

export { Slider }

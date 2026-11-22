import type * as React from "react"
import {
  Slider as SliderPrimitive,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider"
import { cn } from "cn"

import { slot } from "@tyohnn/lib/slot"

/**
 * UI SDK 는 손잡이의 가운데를 값의 자리에 둔다. 0 과 100 에서 손잡이가 막대 밖으로 반쯤 나가므로
 * Base UI 의 thumbAlignment="edge" 처럼 손잡이가 막대 안에서 움직이게 자리를 고쳐 쓴다.
 * 값의 비율 p 만큼 자리를 옮긴 뒤 손잡이 제 크기의 p 만큼 되돌리면 양 끝에서 손잡이의 가장자리가
 * 막대의 끝에 맞는다. 오른쪽에서 왼쪽으로 쓰는 문서에서는 rtl 변형이 --slider-dir 를 -1 로 바꾼다.
 */
function edgeThumb(
  state: { percent: number; orientation: "horizontal" | "vertical" },
  props: Record<string, unknown>
) {
  const own = (props.style ?? {}) as React.CSSProperties
  const percent = state.percent || 0
  const position =
    state.orientation === "vertical"
      ? { bottom: `${percent}%`, left: "50%", translate: `-50% ${percent}%` }
      : {
          insetInlineStart: `${percent}%`,
          top: "50%",
          translate: `calc(${-percent}% * var(--slider-dir, 1)) -50%`,
        }

  return {
    style: {
      ...own,
      insetInline: undefined,
      marginInline: undefined,
      justifySelf: undefined,
      ...position,
    },
  }
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  render,
  ...props
}: React.ComponentProps<typeof SliderPrimitive>) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  return (
    <SliderPrimitive
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      render={slot("slider", render)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      {...props}
    >
      <SliderControl className="cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col">
        <SliderTrack
          render={slot("slider-track")}
          className="cn-slider-track relative grow overflow-hidden select-none"
        >
          <SliderIndicator
            render={slot("slider-range")}
            className="cn-slider-range select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderTrack>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderThumb
            render={slot("slider-thumb", undefined, "div", edgeThumb)}
            key={index}
            index={index}
            className="cn-slider-thumb block shrink-0 select-none rtl:[--slider-dir:-1] disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderControl>
    </SliderPrimitive>
  )
}

export { Slider }

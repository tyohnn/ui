"use client"

import * as React from "react"
import {
  Slider as SliderPrimitive,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider"
import { cn } from "cn"

import { slot } from "@acme/ui/lib/slot"

/**
 * UI SDK 는 손잡이의 가운데를 값의 자리에 둔다. 0 과 100 에서 손잡이가 막대 밖으로 반쯤 나가므로
 * Base UI 의 thumbAlignment="edge" 와 같이 손잡이가 막대 안에서 움직이게 자리를 고쳐 쓴다.
 *
 * 손잡이 가운데는 시작 끝에서 `p% + (0.5 - p) × 손잡이 크기` 에 놓인다. 손잡이 크기는 Slider 가 재어
 * 뿌리에 `--slider-thumb-size` 로 적는다. 범위 막대도 같은 식으로 손잡이 가운데에서 끝난다.
 * 오른쪽에서 왼쪽으로 쓰는 문서에서는 rtl 변형이 --slider-dir 를 -1 로 바꾼다.
 */
const THUMB_SIZE = "var(--slider-thumb-size, 0px)"

const centerAt = (percent: number) =>
  `calc(${percent}% + ${0.5 - percent / 100} * ${THUMB_SIZE})`

type Axis = { orientation: "horizontal" | "vertical" }

const ownStyle = (props: Record<string, unknown>) =>
  (props.style ?? {}) as React.CSSProperties & Record<string, string | undefined>

function edgeThumb(
  state: Axis & { percent: number },
  props: Record<string, unknown>
) {
  const center = centerAt(state.percent || 0)
  const position =
    state.orientation === "vertical"
      ? { bottom: center, left: "50%", translate: "-50% 50%" }
      : {
          insetInlineStart: center,
          top: "50%",
          translate: "calc(-50% * var(--slider-dir, 1)) -50%",
        }

  return {
    style: {
      ...ownStyle(props),
      insetInline: undefined,
      marginInline: undefined,
      justifySelf: undefined,
      ...position,
    },
  }
}

function edgeIndicator(range: boolean) {
  return (state: Axis, props: Record<string, unknown>) => {
    const style = ownStyle(props)
    const start = parseFloat(style["--slider-indicator-start"] ?? "0") || 0
    const size = parseFloat(style["--slider-indicator-size"] ?? "0") || 0
    const vertical = state.orientation === "vertical"
    // 값 하나면 처음부터 손잡이 가운데까지, 범위면 두 손잡이의 가운데 사이다
    const from = range ? centerAt(start) : "0px"
    const length = range
      ? `calc(${size}% - ${size / 100} * ${THUMB_SIZE})`
      : centerAt(size)

    return {
      style: {
        ...style,
        [vertical ? "bottom" : "insetInlineStart"]: from,
        [vertical ? "height" : "width"]: length,
      },
    }
  }
}

/** 첫 손잡이의 크기를 재어 뿌리에 적는다. 손잡이가 바뀌면 다시 잰다 */
function useThumbSize(orientation: string | undefined) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const root = ref.current
    const thumb = root?.querySelector<HTMLElement>('[data-slot="slider-thumb"]')

    if (!root || !thumb) {
      return
    }

    const write = () => {
      const rect = thumb.getBoundingClientRect()
      const size = orientation === "vertical" ? rect.height : rect.width

      root.style.setProperty("--slider-thumb-size", `${size}px`)
    }

    write()

    if (typeof ResizeObserver !== "function") {
      return
    }

    const observer = new ResizeObserver(write)

    observer.observe(thumb)

    return () => observer.disconnect()
  }, [orientation])

  return ref
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  orientation,
  render,
  ...props
}: React.ComponentProps<typeof SliderPrimitive>) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]
  const ref = useThumbSize(orientation)

  return (
    <SliderPrimitive
      ref={ref}
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      render={slot("slider", render)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      orientation={orientation}
      {...props}
    >
      <SliderControl className="cn-slider relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col">
        <SliderTrack
          render={slot("slider-track")}
          className="cn-slider-track relative grow overflow-hidden select-none"
        >
          <SliderIndicator
            render={slot("slider-range", undefined, "div", edgeIndicator(_values.length > 1))}
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

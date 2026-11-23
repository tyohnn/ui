"use client"

import * as React from "react"
import { cn } from "cn"
import {
  Carousel as CarouselPrimitive,
  CarouselContent as CarouselContentPrimitive,
  CarouselItem as CarouselItemPrimitive,
  CarouselNext as CarouselNextPrimitive,
  CarouselPrevious as CarouselPreviousPrimitive,
  CarouselViewport as CarouselViewportPrimitive,
  createCarouselController,
  type CarouselController,
} from "@ui-sdk/react/carousel"
import { renderElement } from "@ui-sdk/react/primitive"

import { Button } from "@acme/ui/components/button"
import { ChevronLeft, ChevronRight } from "@acme/ui/icons"
import { slot } from "@acme/ui/lib/slot"
import { strings } from "@acme/ui/strings"

/** 페이지를 넘기는 손잡이. UI SDK 의 controller 다(getPage · next · previous · canNext 등) */
type CarouselApi = CarouselController

/**
 * embla 판의 opts 가운데 UI SDK 가 같은 뜻으로 받는 것만 받는다.
 * slidesToScroll 은 한 페이지의 슬라이드 수(slidesPerPage), startIndex 는 0 부터 센 첫 슬라이드, watchDrag 는 끌어서 넘기기다
 */
type CarouselOptions = {
  align?: "start" | "center" | "end"
  loop?: boolean
  dragFree?: boolean
  skipSnaps?: boolean
  slidesToScroll?: number | "auto"
  startIndex?: number
  watchDrag?: boolean
}

type CarouselProps = {
  opts?: CarouselOptions
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  api: CarouselApi
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  controller: given,
  onPageChange,
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof CarouselPrimitive> & CarouselProps) {
  const [own] = React.useState(createCarouselController)
  const api = given ?? own
  // 페이지가 바뀌거나 슬라이드를 잰 뒤에 canScrollPrev · canScrollNext 를 다시 읽게 한다
  const [, refresh] = React.useReducer((n: number) => n + 1, 0)

  React.useEffect(() => {
    setApi?.(api)
  }, [api, setApi])

  React.useEffect(() => {
    const frame = requestAnimationFrame(refresh)
    return () => cancelAnimationFrame(frame)
  }, [])

  const scrollPrev = React.useCallback(() => {
    api.previous()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api.next()
  }, [api])

  /**
   * embla 판은 영역 어디에 포커스가 있든 ←·→ 로 넘겼다. 슬라이드 안의 키는 UI SDK 의 뷰포트가 받고
   * (세로면 ↑·↓, Home · End), 그 밖(앞 · 뒤 단추 등)의 ←·→ 만 여기서 넘긴다
   */
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement
      if (target.closest('[data-slot="carousel-content"]')) return
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  return (
    <CarouselContext.Provider
      value={{
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev: api.canPrevious(),
        canScrollNext: api.canNext(),
      }}
    >
      <CarouselPrimitive
        render={slot("carousel", render)}
        controller={api}
        orientation={orientation}
        // embla 의 기본 정렬은 가운데였다. UI SDK 의 기본은 시작이다
        align={opts?.align ?? "center"}
        loop={opts?.loop}
        dragFree={opts?.dragFree}
        skipSnaps={opts?.skipSnaps}
        slidesPerPage={opts?.slidesToScroll}
        defaultPage={opts?.startIndex === undefined ? undefined : opts.startIndex + 1}
        drag={opts?.watchDrag}
        onPageChange={(page, details) => {
          refresh()
          onPageChange?.(page, details)
        }}
        onKeyDownCapture={handleKeyDown}
        aria-roledescription={strings.carousel.role}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </CarouselPrimitive>
    </CarouselContext.Provider>
  )
}

/** 이름(data-slot)을 달지 않고 그린다. embla 판의 안쪽 줄은 이름이 없었다 */
const nameless: React.ComponentProps<typeof CarouselContentPrimitive>["render"] = (attrs, state) =>
  renderElement("div", { ...attrs, "data-slot": undefined }, undefined, state)

/**
 * embla 판은 바깥 상자가 잘라 내고, -ml-4 를 단 안쪽 줄을 transform 으로 옮겼다. UI SDK 는 스크롤하는 상자(뷰포트)의
 * 스크롤 위치로 넘기므로 안쪽 줄을 뷰포트로 삼는다. 음수 여백이 뷰포트 자신에 붙어 있어야 슬라이드 상자의 왼쪽 끝으로
 * 맞춘 페이지가 안쪽 여백(pl-4)만큼 밀리지 않는다. UI SDK 의 줄 부분은 display: contents 로 지워 슬라이드가 지금처럼
 * 이 줄의 flex 항목이 되게 한다(호출부가 className 으로 준 gap · items-* 가 그대로 듣는다)
 */
function CarouselContent({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CarouselViewportPrimitive>, "children"> & { children?: React.ReactNode }) {
  const { orientation } = useCarousel()

  return (
    <div className="overflow-hidden" data-slot="carousel-content">
      <CarouselViewportPrimitive
        render={nameless}
        className={cn(
          "flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      >
        <CarouselContentPrimitive render={nameless} className="contents!">
          {children}
        </CarouselContentPrimitive>
      </CarouselViewportPrimitive>
    </div>
  )
}

function CarouselItem({
  className,
  render,
  ...props
}: React.ComponentProps<typeof CarouselItemPrimitive>) {
  const { orientation } = useCarousel()

  return (
    <CarouselItemPrimitive
      render={slot("carousel-item", render)}
      aria-roledescription={strings.carousel.slideRole}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * UI SDK 는 넘길 페이지가 없을 때 단추를 끄지 않고 aria-disabled 로 둔다(포커스는 남는다).
 * 보이는 모양은 embla 판의 꺼진 단추와 같게 data-disabled 로 흐리게 한다
 */
const stepDisabled = "data-disabled:pointer-events-none data-disabled:opacity-50"

type StepProps = React.ComponentProps<typeof CarouselPreviousPrimitive> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: StepProps) {
  const { orientation } = useCarousel()

  return (
    <CarouselPreviousPrimitive
      render={slot("carousel-previous", <Button variant={variant} size={size} />, "button")}
      className={cn(
        "cn-carousel-previous absolute touch-manipulation",
        stepDisabled,
        orientation === "horizontal"
          ? "inset-y-0 -left-12 my-auto"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      {...props}
    >
      <ChevronLeft className="cn-rtl-flip" />
      <span className="sr-only">{strings.carousel.previous}</span>
    </CarouselPreviousPrimitive>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: StepProps) {
  const { orientation } = useCarousel()

  return (
    <CarouselNextPrimitive
      render={slot("carousel-next", <Button variant={variant} size={size} />, "button")}
      className={cn(
        "cn-carousel-next absolute touch-manipulation",
        stepDisabled,
        orientation === "horizontal"
          ? "inset-y-0 -right-12 my-auto"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      {...props}
    >
      <ChevronRight className="cn-rtl-flip" />
      <span className="sr-only">{strings.carousel.next}</span>
    </CarouselNextPrimitive>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}

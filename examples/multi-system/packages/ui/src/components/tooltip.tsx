"use client"

import * as React from "react"
import {
  Tooltip as TooltipPrimitive,
  TooltipArrow,
  TooltipContent as TooltipContentPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@ui-sdk/react/tooltip"
import { cn } from "cn"

import { sideOf, type ContractSide } from "@acme/ui/lib/popup"
import { flag, slot } from "@acme/ui/lib/slot"

type Delays = { delay?: number; closeDelay?: number }

/**
 * UI SDK 에는 툴팁을 묶는 Provider 가 없다. shadcn 의 계약대로 안쪽 툴팁의 기본 지연만 정한다.
 * 툴팁마다 delay · closeDelay 를 넘기면 그 값이 이긴다.
 */
const TooltipDelays = React.createContext<Delays>({})

function TooltipProvider({
  delay = 0,
  closeDelay,
  children,
}: Delays & { children?: React.ReactNode }) {
  const value = React.useMemo(() => ({ delay, closeDelay }), [delay, closeDelay])

  return <TooltipDelays.Provider value={value}>{children}</TooltipDelays.Provider>
}

function Tooltip({
  delay,
  closeDelay,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive>) {
  const defaults = React.useContext(TooltipDelays)

  return (
    <TooltipPrimitive
      delay={delay ?? defaults.delay}
      closeDelay={closeDelay ?? defaults.closeDelay}
      {...props}
    />
  )
}

function TooltipTrigger({
  render,
  ...props
}: React.ComponentProps<typeof TooltipTriggerPrimitive>) {
  return (
    <TooltipTriggerPrimitive
      render={slot("tooltip-trigger", render, "button", (state) => ({
        // Base UI 의 계약 이름이다. UI SDK 는 같은 상태를 data-open 으로 쓴다.
        "data-popup-open": flag(state.open),
      }))}
      {...props}
    />
  )
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  render,
  ...props
}: Omit<React.ComponentProps<typeof TooltipContentPrimitive>, "side" | "children"> & {
  side?: ContractSide
  children?: React.ReactNode
}) {
  return (
    <TooltipContentPrimitive
      align={align}
      alignOffset={alignOffset}
      side={sideOf(side)}
      sideOffset={sideOffset}
      render={slot("tooltip-content", render)}
      className={cn(
        "cn-tooltip-content cn-tooltip-content-logical isolate z-50 w-fit max-w-xs origin-(--transform-origin) bg-foreground text-background",
        className
      )}
      {...props}
    >
      {children}
      <TooltipArrow className="cn-tooltip-arrow cn-tooltip-arrow-logical z-50 bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
    </TooltipContentPrimitive>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
